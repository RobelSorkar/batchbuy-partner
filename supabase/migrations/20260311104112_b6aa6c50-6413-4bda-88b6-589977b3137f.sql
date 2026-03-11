
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
  v_existing record;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_selling_preference NOT IN ('platform', 'collect') THEN
    RAISE EXCEPTION 'Invalid selling preference. Must be platform or collect.';
  END IF;

  IF p_units <= 0 THEN
    RAISE EXCEPTION 'Invalid units: must be positive';
  END IF;

  IF p_total_invested <= 0 THEN
    RAISE EXCEPTION 'Invalid investment amount: must be positive';
  END IF;

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

  IF p_total_invested != (p_units * v_batch.production_cost_per_unit) THEN
    RAISE EXCEPTION 'Investment amount does not match unit cost';
  END IF;

  SELECT * INTO v_wallet FROM wallets WHERE user_id = v_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Wallet not found';
  END IF;
  IF v_wallet.balance < p_total_invested THEN
    RAISE EXCEPTION 'Insufficient wallet balance';
  END IF;

  -- Check for existing participation (top-up)
  SELECT * INTO v_existing FROM batch_participations
  WHERE batch_id = p_batch_id AND user_id = v_user_id FOR UPDATE;

  PERFORM set_config('app.calling_function', 'join_batch', true);

  IF v_existing IS NOT NULL THEN
    -- Top-up existing participation
    UPDATE batch_participations SET
      units_owned = units_owned + p_units,
      total_invested = total_invested + p_total_invested,
      inventory_mode = p_selling_preference
    WHERE id = v_existing.id;

    v_participation_id := v_existing.id;

    UPDATE batches SET
      funded_units = funded_units + p_units,
      remaining_units = remaining_units - p_units,
      updated_at = now()
    WHERE id = p_batch_id;
  ELSE
    -- New participation
    INSERT INTO batch_participations (batch_id, user_id, units_owned, total_invested, inventory_mode)
    VALUES (p_batch_id, v_user_id, p_units, p_total_invested, p_selling_preference)
    RETURNING id INTO v_participation_id;

    UPDATE batches SET
      funded_units = funded_units + p_units,
      remaining_units = remaining_units - p_units,
      partners_joined = partners_joined + 1,
      updated_at = now()
    WHERE id = p_batch_id;
  END IF;

  UPDATE wallets SET balance = balance - p_total_invested, updated_at = now() WHERE user_id = v_user_id;

  INSERT INTO transactions (user_id, type, amount, description, reference_id, status)
  VALUES (v_user_id, 'investment', p_total_invested,
    'Investment in ' || v_batch.batch_name || ' — ' || p_units || ' units',
    v_participation_id::text, 'completed');

  INSERT INTO notifications (user_id, title, message, type, reference_id)
  VALUES (v_user_id, 'Batch Joined', 'You invested ৳' || p_total_invested || ' in ' || v_batch.batch_name, 'investment', p_batch_id::text);

  PERFORM set_config('app.calling_function', '', true);

  RETURN json_build_object('success', true, 'participation_id', v_participation_id);
END;
$$;
