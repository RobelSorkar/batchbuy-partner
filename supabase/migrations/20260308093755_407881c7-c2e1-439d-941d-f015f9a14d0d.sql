
-- Fix batches SELECT: current policy is RESTRICTIVE requiring auth, but marketplace should allow public browsing
-- Drop the restrictive policy and replace with a permissive one
DROP POLICY IF EXISTS "Authenticated users can view batches" ON public.batches;
CREATE POLICY "Anyone can view batches" ON public.batches FOR SELECT USING (true);

-- Also make inventory viewable for dropshippers building product listings
DROP POLICY IF EXISTS "Authenticated users can view inventory" ON public.inventory;
CREATE POLICY "Authenticated users can view inventory" ON public.inventory FOR SELECT TO authenticated USING (true);

-- Also make distribution_channels viewable
DROP POLICY IF EXISTS "Authenticated users can view distribution channels" ON public.distribution_channels;
CREATE POLICY "Authenticated users can view distribution channels" ON public.distribution_channels FOR SELECT TO authenticated USING (true);

-- Create profit distribution function
CREATE OR REPLACE FUNCTION public.distribute_profit_on_delivery()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_item record;
  v_participation record;
  v_batch batches%ROWTYPE;
  v_total_profit numeric;
  v_partner_share numeric;
  v_partner_units integer;
  v_total_batch_units integer;
BEGIN
  -- Only trigger when order moves to 'delivered'
  IF NEW.status != 'delivered' OR OLD.status = 'delivered' THEN
    RETURN NEW;
  END IF;

  -- Skip if no batch_id
  IF NEW.batch_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT * INTO v_batch FROM batches WHERE id = NEW.batch_id;
  IF v_batch IS NULL THEN
    RETURN NEW;
  END IF;

  -- Calculate total profit from this order (revenue - cost)
  FOR v_item IN SELECT product_name, quantity, total_price FROM order_items WHERE order_id = NEW.id
  LOOP
    v_total_profit := v_item.total_price - (v_batch.production_cost_per_unit * v_item.quantity);
    
    IF v_total_profit <= 0 THEN
      CONTINUE;
    END IF;

    -- Platform takes 15% commission, partners split remaining 85%
    v_total_profit := v_total_profit * 0.85;

    -- Get total funded units for this batch
    SELECT COALESCE(SUM(units_owned), 0) INTO v_total_batch_units
    FROM batch_participations WHERE batch_id = NEW.batch_id;

    IF v_total_batch_units = 0 THEN
      CONTINUE;
    END IF;

    -- Distribute proportionally to each partner
    FOR v_participation IN SELECT user_id, units_owned FROM batch_participations WHERE batch_id = NEW.batch_id
    LOOP
      v_partner_share := (v_total_profit * v_participation.units_owned) / v_total_batch_units;
      
      IF v_partner_share > 0 THEN
        -- Credit wallet
        UPDATE wallets SET balance = balance + v_partner_share WHERE user_id = v_participation.user_id;
        
        -- Record transaction
        INSERT INTO transactions (user_id, type, amount, description, reference_id, status)
        VALUES (
          v_participation.user_id,
          'profit',
          v_partner_share,
          'Profit from order ' || NEW.order_number || ' (' || v_batch.batch_name || ')',
          NEW.id::text,
          'completed'
        );
      END IF;
    END LOOP;
  END LOOP;

  RETURN NEW;
END;
$$;

-- Attach profit distribution trigger (runs AFTER inventory sync)
DROP TRIGGER IF EXISTS trg_distribute_profit ON public.orders;
CREATE TRIGGER trg_distribute_profit
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.distribute_profit_on_delivery();

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.wallets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
