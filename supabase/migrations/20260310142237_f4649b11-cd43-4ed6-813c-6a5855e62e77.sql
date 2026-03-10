
-- Fix 1: Update sync_inventory_on_order to also update distribution_channels.sold_units
CREATE OR REPLACE FUNCTION public.sync_inventory_on_order()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_item record;
  v_inv_id uuid;
BEGIN
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' AND NEW.batch_id IS NOT NULL THEN
    -- Get inventory id for this batch
    SELECT id INTO v_inv_id FROM inventory WHERE batch_id = NEW.batch_id;

    FOR v_item IN SELECT product_name, quantity FROM order_items WHERE order_id = NEW.id
    LOOP
      -- Update inventory sold_units and total_stock
      UPDATE inventory 
      SET sold_units = sold_units + v_item.quantity,
          total_stock = total_stock - v_item.quantity
      WHERE batch_id = NEW.batch_id AND product_name = v_item.product_name;

      -- Update distribution_channels.sold_units for matching channel
      IF v_inv_id IS NOT NULL THEN
        UPDATE distribution_channels
        SET sold_units = sold_units + v_item.quantity,
            updated_at = now()
        WHERE inventory_id = v_inv_id
          AND channel = NEW.channel;
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$function$;

-- Fix 2: Align distribute_profit_on_delivery with calculator
-- Deduct logistics + marketing (10% of revenue) before profit calculation
CREATE OR REPLACE FUNCTION public.distribute_profit_on_delivery()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_item record;
  v_participation record;
  v_batch batches%ROWTYPE;
  v_total_profit numeric;
  v_partner_share numeric;
  v_partner_units_share integer;
  v_total_batch_units integer;
  v_item_qty_remaining integer;
  v_logistics_cost numeric;
  v_marketing_cost numeric;
BEGIN
  IF NEW.status != 'delivered' OR OLD.status = 'delivered' THEN
    RETURN NEW;
  END IF;

  IF NEW.batch_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT * INTO v_batch FROM batches WHERE id = NEW.batch_id;
  IF v_batch IS NULL THEN
    RETURN NEW;
  END IF;

  FOR v_item IN SELECT product_name, quantity, total_price FROM order_items WHERE order_id = NEW.id
  LOOP
    -- Deduct production cost
    v_total_profit := v_item.total_price - (v_batch.production_cost_per_unit * v_item.quantity);
    IF v_total_profit <= 0 THEN CONTINUE; END IF;

    -- Deduct logistics cost (per unit from batch)
    v_logistics_cost := v_batch.logistics_cost_per_unit * v_item.quantity;
    v_total_profit := v_total_profit - v_logistics_cost;
    IF v_total_profit <= 0 THEN CONTINUE; END IF;

    -- Deduct marketing cost (10% of revenue)
    v_marketing_cost := ROUND(v_item.total_price * 0.10);
    v_total_profit := v_total_profit - v_marketing_cost;
    IF v_total_profit <= 0 THEN CONTINUE; END IF;

    -- Platform takes 15% commission, partners get 85%
    v_total_profit := ROUND(v_total_profit * 0.85, 2);

    SELECT COALESCE(SUM(units_owned), 0) INTO v_total_batch_units
    FROM batch_participations WHERE batch_id = NEW.batch_id;
    IF v_total_batch_units = 0 THEN CONTINUE; END IF;

    v_item_qty_remaining := v_item.quantity;

    -- Distribute proportionally + track units sold per partner
    FOR v_participation IN 
      SELECT id, user_id, units_owned, units_sold 
      FROM batch_participations 
      WHERE batch_id = NEW.batch_id 
      ORDER BY joined_at
    LOOP
      v_partner_share := ROUND((v_total_profit * v_participation.units_owned) / v_total_batch_units, 2);
      v_partner_units_share := LEAST(
        CEIL((v_item.quantity::numeric * v_participation.units_owned) / v_total_batch_units),
        v_item_qty_remaining,
        v_participation.units_owned - v_participation.units_sold
      );

      IF v_partner_share > 0 THEN
        UPDATE wallets SET balance = balance + v_partner_share WHERE user_id = v_participation.user_id;
        INSERT INTO transactions (user_id, type, amount, description, reference_id, status)
        VALUES (v_participation.user_id, 'profit', v_partner_share,
          'Profit from order ' || NEW.order_number || ' (' || v_batch.batch_name || ')',
          NEW.id::text, 'completed');
      END IF;

      IF v_partner_units_share > 0 THEN
        UPDATE batch_participations SET units_sold = units_sold + v_partner_units_share WHERE id = v_participation.id;
        v_item_qty_remaining := v_item_qty_remaining - v_partner_units_share;
      END IF;
    END LOOP;
  END LOOP;

  -- Credit dropshipper commission if seller exists
  IF NEW.seller_id IS NOT NULL AND COALESCE(NEW.commission, 0) > 0 THEN
    UPDATE wallets SET balance = balance + NEW.commission WHERE user_id = NEW.seller_id;
    INSERT INTO transactions (user_id, type, amount, description, reference_id, status)
    VALUES (NEW.seller_id, 'commission', NEW.commission,
      'Commission from order ' || NEW.order_number,
      NEW.id::text, 'completed');
  END IF;

  RETURN NEW;
END;
$function$;
