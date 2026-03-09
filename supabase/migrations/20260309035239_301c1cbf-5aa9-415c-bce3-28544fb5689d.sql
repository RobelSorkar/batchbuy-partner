
CREATE OR REPLACE FUNCTION public.join_batch(
  p_batch_id uuid,
  p_units integer,
  p_total_invested numeric,
  p_selling_preference text DEFAULT 'platform'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_batch record;
  v_wallet record;
  v_participation_id uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Validate selling preference
  IF p_selling_preference NOT IN ('platform', 'collect') THEN
    RAISE EXCEPTION 'Invalid selling preference. Must be platform or collect.';
  END IF;

  -- Lock and fetch batch
  SELECT * INTO v_batch FROM batches WHERE id = p_batch_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Batch not found';
  END IF;
  IF v_batch.status <> 'funding' THEN
    RAISE EXCEPTION 'Batch is not accepting investments';
  END IF;
  IF p_units > v_batch.remaining_units THEN
    RAISE EXCEPTION 'Not enough units available';
  END IF;

  -- Lock and check wallet
  SELECT * INTO v_wallet FROM wallets WHERE user_id = v_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Wallet not found';
  END IF;
  IF v_wallet.balance < p_total_invested THEN
    RAISE EXCEPTION 'Insufficient wallet balance';
  END IF;

  -- Deduct from wallet
  UPDATE wallets SET balance = balance - p_total_invested, updated_at = now() WHERE user_id = v_user_id;

  -- Record transaction
  INSERT INTO transactions (user_id, type, amount, description, reference_id, status)
  VALUES (v_user_id, 'investment', p_total_invested, 'Batch investment: ' || v_batch.batch_name, p_batch_id::text, 'completed');

  -- Create participation with selling preference as inventory_mode
  INSERT INTO batch_participations (batch_id, user_id, units_owned, total_invested, inventory_mode)
  VALUES (p_batch_id, v_user_id, p_units, p_total_invested, p_selling_preference)
  RETURNING id INTO v_participation_id;

  -- Update batch stats
  UPDATE batches
  SET funded_units = funded_units + p_units,
      remaining_units = remaining_units - p_units,
      partners_joined = partners_joined + 1,
      updated_at = now()
  WHERE id = p_batch_id;

  -- Create notification
  INSERT INTO notifications (user_id, title, message, type, reference_id)
  VALUES (v_user_id, 'Batch Joined', 'You invested ৳' || p_total_invested || ' in ' || v_batch.batch_name, 'investment', p_batch_id::text);

  RETURN json_build_object('success', true, 'participation_id', v_participation_id);
END;
$$;
