
-- SECURITY FIX 4: Enhanced process_withdrawal with daily limits
CREATE OR REPLACE FUNCTION public.process_withdrawal(p_amount numeric, p_method text, p_account text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_wallet wallets%ROWTYPE;
  v_txn_id uuid;
  v_today date := current_date;
BEGIN
  -- Lock wallet row to prevent race conditions
  SELECT * INTO v_wallet FROM wallets WHERE user_id = auth.uid() FOR UPDATE;
  
  IF v_wallet IS NULL THEN
    RAISE EXCEPTION 'Wallet not found';
  END IF;
  
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Invalid withdrawal amount';
  END IF;
  
  IF p_amount > v_wallet.balance THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;
  
  -- SECURITY: Check daily withdrawal limit
  IF v_wallet.last_withdrawal_date = v_today THEN
    IF (v_wallet.daily_withdrawn + p_amount) > v_wallet.daily_withdrawal_limit THEN
      RAISE EXCEPTION 'Daily withdrawal limit exceeded. Limit: ৳%, Already withdrawn today: ৳%', 
        v_wallet.daily_withdrawal_limit, v_wallet.daily_withdrawn;
    END IF;
  END IF;
  
  -- Create transaction record
  INSERT INTO transactions (user_id, type, amount, description, status)
  VALUES (auth.uid(), 'withdrawal', p_amount, 
    'Withdrawal to ' || p_method || ' — ' || p_account, 'pending')
  RETURNING id INTO v_txn_id;
  
  -- Deduct from wallet atomically and update daily tracking
  UPDATE wallets SET 
    balance = balance - p_amount,
    daily_withdrawn = CASE WHEN last_withdrawal_date = v_today THEN daily_withdrawn + p_amount ELSE p_amount END,
    last_withdrawal_date = v_today
  WHERE user_id = auth.uid();
  
  RETURN json_build_object('transaction_id', v_txn_id, 'amount', p_amount, 'new_balance', v_wallet.balance - p_amount);
END;
$function$;

-- SECURITY FIX 5: Prevent users from modifying sensitive participation fields
-- Users should only be able to update inventory_mode, not units_owned or total_invested
CREATE OR REPLACE FUNCTION public.validate_participation_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only allow changes to inventory_mode field
  IF NEW.units_owned != OLD.units_owned THEN
    RAISE EXCEPTION 'Cannot modify units_owned';
  END IF;
  
  IF NEW.total_invested != OLD.total_invested THEN
    RAISE EXCEPTION 'Cannot modify total_invested';
  END IF;
  
  IF NEW.batch_id != OLD.batch_id THEN
    RAISE EXCEPTION 'Cannot modify batch_id';
  END IF;
  
  IF NEW.user_id != OLD.user_id THEN
    RAISE EXCEPTION 'Cannot modify user_id';
  END IF;
  
  IF NEW.joined_at != OLD.joined_at THEN
    RAISE EXCEPTION 'Cannot modify joined_at';
  END IF;
  
  -- units_sold can only be increased by system triggers
  IF NEW.units_sold < OLD.units_sold THEN
    RAISE EXCEPTION 'Cannot decrease units_sold';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create the trigger for participation validation
DROP TRIGGER IF EXISTS trg_validate_participation_update ON batch_participations;
CREATE TRIGGER trg_validate_participation_update
  BEFORE UPDATE ON batch_participations
  FOR EACH ROW
  WHEN (NOT has_role(auth.uid(), 'admin'))
  EXECUTE FUNCTION validate_participation_update();

-- SECURITY FIX 6: Prevent batch manipulation after funding starts
CREATE OR REPLACE FUNCTION public.validate_batch_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- If batch has participations, prevent changes to critical fields
  IF OLD.funded_units > 0 THEN
    IF NEW.production_cost_per_unit != OLD.production_cost_per_unit THEN
      RAISE EXCEPTION 'Cannot modify production cost after funding started';
    END IF;
    
    IF NEW.total_quantity < OLD.funded_units THEN
      RAISE EXCEPTION 'Cannot reduce total quantity below funded units';
    END IF;
  END IF;
  
  -- Admins bypass these restrictions
  IF has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;
  
  -- Non-admins cannot change funded_units or partners_joined directly
  IF NEW.funded_units != OLD.funded_units AND OLD.funded_units > 0 THEN
    -- This should only happen via join_batch function
    IF current_setting('app.calling_function', true) IS DISTINCT FROM 'join_batch' THEN
      RAISE EXCEPTION 'Cannot modify funded_units directly';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_validate_batch_update ON batches;
CREATE TRIGGER trg_validate_batch_update
  BEFORE UPDATE ON batches
  FOR EACH ROW
  EXECUTE FUNCTION validate_batch_update();
