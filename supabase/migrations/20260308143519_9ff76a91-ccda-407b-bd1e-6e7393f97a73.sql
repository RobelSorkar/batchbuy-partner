-- =============================================================
-- FIX 1: Distributor price can fall below MAP floor
-- The formula ROUND(retail_price * 0.55) can produce prices below
-- the MAP floor (cost * 1.2). Use GREATEST to enforce the floor.
-- =============================================================
CREATE OR REPLACE FUNCTION public.auto_create_distribution_channels()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_batch batches%ROWTYPE;
  v_map numeric;
  v_dist_price numeric;
  v_drop_price numeric;
  v_retail_ch_price numeric;
BEGIN
  SELECT * INTO v_batch FROM batches WHERE id = NEW.batch_id;
  
  IF v_batch IS NOT NULL THEN
    v_map := v_batch.production_cost_per_unit * 1.2;
    
    -- Compute prices ensuring they stay above MAP floor
    v_dist_price := GREATEST(ROUND(v_batch.retail_price * 0.55), v_map);
    v_drop_price := GREATEST(ROUND(v_batch.retail_price * 0.65), v_map);
    v_retail_ch_price := GREATEST(ROUND(v_batch.retail_price * 0.85), v_map);
    
    INSERT INTO distribution_channels (inventory_id, channel, enabled, price, min_price, max_price, allocated_stock)
    VALUES
      (NEW.id, 'platform', true, v_batch.retail_price, v_map, v_batch.retail_price, ROUND(NEW.total_stock * 0.2)),
      (NEW.id, 'retail', true, v_retail_ch_price, v_map, v_batch.retail_price, ROUND(NEW.total_stock * 0.3)),
      (NEW.id, 'dropshipper', true, v_drop_price, v_map, v_retail_ch_price, ROUND(NEW.total_stock * 0.3)),
      (NEW.id, 'distributor', true, v_dist_price, v_map, v_drop_price, ROUND(NEW.total_stock * 0.2))
    ON CONFLICT (inventory_id, channel) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- =============================================================
-- FIX 2: join_batch should handle repeat investments by updating
-- existing participation instead of failing on unique constraint
-- =============================================================
CREATE OR REPLACE FUNCTION public.join_batch(p_batch_id uuid, p_units integer, p_total_invested numeric)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_batch batches%ROWTYPE;
  v_wallet wallets%ROWTYPE;
  v_participation_id uuid;
  v_existing_participation batch_participations%ROWTYPE;
BEGIN
  IF p_units <= 0 THEN
    RAISE EXCEPTION 'Invalid units: must be positive';
  END IF;
  
  IF p_total_invested <= 0 THEN
    RAISE EXCEPTION 'Invalid investment amount: must be positive';
  END IF;

  SELECT * INTO v_batch FROM batches WHERE id = p_batch_id FOR UPDATE;
  
  IF v_batch IS NULL THEN
    RAISE EXCEPTION 'Batch not found';
  END IF;
  
  IF v_batch.status != 'funding' THEN
    RAISE EXCEPTION 'Batch is not accepting investments';
  END IF;
  
  IF p_units > v_batch.remaining_units THEN
    RAISE EXCEPTION 'Not enough units available';
  END IF;
  
  IF p_total_invested < v_batch.min_participation THEN
    -- Only enforce minimum on FIRST participation; allow top-ups below minimum
    SELECT * INTO v_existing_participation 
    FROM batch_participations 
    WHERE batch_id = p_batch_id AND user_id = auth.uid();
    
    IF v_existing_participation IS NULL THEN
      RAISE EXCEPTION 'Below minimum participation';
    END IF;
  END IF;
  
  -- CRITICAL: Validate that investment matches unit cost
  IF p_total_invested != (p_units * v_batch.production_cost_per_unit) THEN
    RAISE EXCEPTION 'Investment amount does not match unit cost';
  END IF;
  
  -- Lock and validate wallet balance
  SELECT * INTO v_wallet FROM wallets WHERE user_id = auth.uid() FOR UPDATE;
  
  IF v_wallet IS NULL THEN
    RAISE EXCEPTION 'Wallet not found';
  END IF;
  
  IF v_wallet.balance < p_total_invested THEN
    RAISE EXCEPTION 'Insufficient wallet balance';
  END IF;
  
  -- Check for existing participation (allow top-up)
  SELECT * INTO v_existing_participation 
  FROM batch_participations 
  WHERE batch_id = p_batch_id AND user_id = auth.uid()
  FOR UPDATE;
  
  IF v_existing_participation IS NOT NULL THEN
    -- Top-up: update existing participation
    -- Temporarily allow the update via config flag
    PERFORM set_config('app.calling_function', 'join_batch', true);
    
    UPDATE batch_participations SET
      units_owned = units_owned + p_units,
      total_invested = total_invested + p_total_invested
    WHERE id = v_existing_participation.id;
    
    v_participation_id := v_existing_participation.id;
    
    -- Update batch (don't increment partners_joined for top-ups)
    UPDATE batches SET
      funded_units = funded_units + p_units,
      remaining_units = remaining_units - p_units
    WHERE id = p_batch_id;
  ELSE
    -- New participation
    INSERT INTO batch_participations (batch_id, user_id, units_owned, total_invested)
    VALUES (p_batch_id, auth.uid(), p_units, p_total_invested)
    RETURNING id INTO v_participation_id;
    
    UPDATE batches SET
      funded_units = funded_units + p_units,
      remaining_units = remaining_units - p_units,
      partners_joined = partners_joined + 1
    WHERE id = p_batch_id;
  END IF;
  
  -- Create wallet transaction (debit)
  INSERT INTO transactions (user_id, type, amount, description, reference_id, status)
  VALUES (auth.uid(), 'investment', p_total_invested, 
    'Investment in ' || v_batch.batch_name || ' — ' || p_units || ' units',
    v_participation_id::text, 'completed');
  
  -- Deduct from wallet
  UPDATE wallets SET balance = balance - p_total_invested WHERE user_id = auth.uid();
  
  PERFORM set_config('app.calling_function', '', true);
  
  RETURN json_build_object('participation_id', v_participation_id, 'units', p_units, 'invested', p_total_invested);
END;
$function$;

-- =============================================================
-- FIX 3: validate_participation_update must allow join_batch to
-- update units_owned and total_invested during top-ups
-- =============================================================
CREATE OR REPLACE FUNCTION public.validate_participation_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Allow updates from join_batch function (for top-ups)
  IF current_setting('app.calling_function', true) = 'join_batch' THEN
    RETURN NEW;
  END IF;

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
  
  IF NEW.units_sold < OLD.units_sold THEN
    RAISE EXCEPTION 'Cannot decrease units_sold';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- =============================================================
-- FIX 4: Fix existing distributor prices below MAP
-- =============================================================
UPDATE distribution_channels dc
SET price = GREATEST(dc.price, dc.min_price)
WHERE dc.price < dc.min_price;