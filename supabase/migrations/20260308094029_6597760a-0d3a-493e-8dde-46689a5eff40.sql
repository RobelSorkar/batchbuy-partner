
-- 1. Add units_sold tracking to batch_participations
ALTER TABLE public.batch_participations ADD COLUMN IF NOT EXISTS units_sold integer NOT NULL DEFAULT 0;

-- 2. Enhance profit distribution to track per-partner units sold
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
  v_partner_units_share integer;
  v_total_batch_units integer;
  v_item_qty_remaining integer;
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
    v_total_profit := v_item.total_price - (v_batch.production_cost_per_unit * v_item.quantity);
    IF v_total_profit <= 0 THEN CONTINUE; END IF;

    -- Platform takes 15%, partners get 85%
    v_total_profit := v_total_profit * 0.85;

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

  -- 3. Credit dropshipper commission if seller exists
  IF NEW.seller_id IS NOT NULL AND COALESCE(NEW.commission, 0) > 0 THEN
    UPDATE wallets SET balance = balance + NEW.commission WHERE user_id = NEW.seller_id;
    INSERT INTO transactions (user_id, type, amount, description, reference_id, status)
    VALUES (NEW.seller_id, 'commission', NEW.commission,
      'Commission from order ' || NEW.order_number,
      NEW.id::text, 'completed');
  END IF;

  RETURN NEW;
END;
$$;

-- 4. Create deposit function (SECURITY DEFINER for wallet insert protection)
CREATE OR REPLACE FUNCTION public.process_deposit(p_amount numeric, p_method text, p_account text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_txn_id uuid;
  v_wallet wallets%ROWTYPE;
BEGIN
  SELECT * INTO v_wallet FROM wallets WHERE user_id = auth.uid() FOR UPDATE;
  IF v_wallet IS NULL THEN
    RAISE EXCEPTION 'Wallet not found';
  END IF;

  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Invalid deposit amount';
  END IF;

  IF p_amount < 500 THEN
    RAISE EXCEPTION 'Minimum deposit is ৳500';
  END IF;

  -- Create pending deposit transaction
  INSERT INTO transactions (user_id, type, amount, description, status)
  VALUES (auth.uid(), 'deposit', p_amount,
    'Deposit via ' || p_method || ' — ' || p_account, 'pending')
  RETURNING id INTO v_txn_id;

  -- Credit wallet immediately (in production, this would be after payment verification)
  UPDATE wallets SET balance = balance + p_amount WHERE user_id = auth.uid();

  -- Mark as completed
  UPDATE transactions SET status = 'completed' WHERE id = v_txn_id;

  RETURN json_build_object('transaction_id', v_txn_id, 'amount', p_amount, 'new_balance', v_wallet.balance + p_amount);
END;
$$;
