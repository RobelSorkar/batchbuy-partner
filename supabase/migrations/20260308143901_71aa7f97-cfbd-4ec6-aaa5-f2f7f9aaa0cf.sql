-- =============================================================
-- Create atomic order creation RPC with stock validation
-- Prevents overselling by checking inventory atomically
-- =============================================================
CREATE OR REPLACE FUNCTION public.create_order_with_stock_check(
  p_customer_name text,
  p_customer_phone text,
  p_customer_address text,
  p_channel text,
  p_total_amount numeric,
  p_commission numeric,
  p_batch_id uuid DEFAULT NULL,
  p_items jsonb DEFAULT '[]'::jsonb
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_order_number text;
  v_order_id uuid;
  v_item jsonb;
  v_inv inventory%ROWTYPE;
  v_channel_row distribution_channels%ROWTYPE;
  v_total_qty integer := 0;
BEGIN
  -- Validate inputs
  IF length(trim(p_customer_name)) < 2 THEN
    RAISE EXCEPTION 'Customer name must be at least 2 characters';
  END IF;
  IF length(trim(p_customer_phone)) < 10 THEN
    RAISE EXCEPTION 'Invalid phone number';
  END IF;
  IF length(trim(p_customer_address)) < 5 THEN
    RAISE EXCEPTION 'Address must be at least 5 characters';
  END IF;

  -- Validate stock availability if batch_id provided
  IF p_batch_id IS NOT NULL THEN
    SELECT * INTO v_inv FROM inventory WHERE batch_id = p_batch_id FOR UPDATE;
    
    IF v_inv IS NOT NULL THEN
      -- Calculate total quantity from items
      FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
      LOOP
        v_total_qty := v_total_qty + (v_item->>'quantity')::integer;
      END LOOP;
      
      -- Check channel-specific stock
      SELECT * INTO v_channel_row 
      FROM distribution_channels 
      WHERE inventory_id = v_inv.id AND channel = p_channel
      FOR UPDATE;
      
      IF v_channel_row IS NOT NULL THEN
        IF NOT v_channel_row.enabled THEN
          RAISE EXCEPTION 'This sales channel is currently disabled';
        END IF;
        IF (v_channel_row.sold_units + v_total_qty) > v_channel_row.allocated_stock THEN
          RAISE EXCEPTION 'Insufficient stock in % channel. Available: %', 
            p_channel, (v_channel_row.allocated_stock - v_channel_row.sold_units);
        END IF;
      END IF;
      
      -- Check overall inventory
      IF (v_inv.sold_units + v_total_qty) > v_inv.total_stock THEN
        RAISE EXCEPTION 'Insufficient total inventory. Available: %', 
          (v_inv.total_stock - v_inv.sold_units);
      END IF;
    END IF;
  END IF;

  -- Generate order number
  v_order_number := generate_order_number(p_channel);

  -- Create order
  INSERT INTO orders (order_number, customer_name, customer_phone, customer_address, 
    channel, total_amount, commission, seller_id, batch_id)
  VALUES (v_order_number, trim(p_customer_name), trim(p_customer_phone), trim(p_customer_address),
    p_channel, p_total_amount, p_commission, auth.uid(), p_batch_id)
  RETURNING id INTO v_order_id;

  -- Insert order items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO order_items (order_id, product_name, quantity, unit_price, total_price)
    VALUES (
      v_order_id,
      v_item->>'productName',
      (v_item->>'quantity')::integer,
      (v_item->>'unitPrice')::numeric,
      (v_item->>'totalPrice')::numeric
    );
  END LOOP;

  RETURN json_build_object('order_id', v_order_id, 'order_number', v_order_number);
END;
$function$;

-- Restrict to authenticated users only
REVOKE ALL ON FUNCTION public.create_order_with_stock_check FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_order_with_stock_check FROM anon;
GRANT EXECUTE ON FUNCTION public.create_order_with_stock_check TO authenticated;

-- =============================================================
-- Fix: Batch cancellation should refund partner investments
-- =============================================================
CREATE OR REPLACE FUNCTION public.refund_cancelled_batch()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_participation record;
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status = 'funding' THEN
    FOR v_participation IN
      SELECT id, user_id, total_invested, units_owned
      FROM batch_participations
      WHERE batch_id = NEW.id
    LOOP
      -- Refund wallet
      UPDATE wallets SET balance = balance + v_participation.total_invested
      WHERE user_id = v_participation.user_id;
      
      -- Create refund transaction
      INSERT INTO transactions (user_id, type, amount, description, reference_id, status)
      VALUES (
        v_participation.user_id,
        'deposit',
        v_participation.total_invested,
        'Refund — ' || NEW.batch_name || ' cancelled (' || v_participation.units_owned || ' units)',
        v_participation.id::text,
        'completed'
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$function$;

-- Attach trigger
CREATE TRIGGER trg_refund_cancelled_batch
  AFTER UPDATE ON public.batches
  FOR EACH ROW
  WHEN (NEW.status = 'cancelled' AND OLD.status = 'funding')
  EXECUTE FUNCTION public.refund_cancelled_batch();

-- Revoke direct execution of trigger function
REVOKE ALL ON FUNCTION public.refund_cancelled_batch FROM PUBLIC;
REVOKE ALL ON FUNCTION public.refund_cancelled_batch FROM anon;
REVOKE ALL ON FUNCTION public.refund_cancelled_batch FROM authenticated;