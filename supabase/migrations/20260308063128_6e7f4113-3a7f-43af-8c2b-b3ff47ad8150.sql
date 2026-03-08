
-- Fix all RLS policies to PERMISSIVE (drop RESTRICTIVE ones and recreate)

-- batch_participations
DROP POLICY IF EXISTS "Users can view own participations" ON public.batch_participations;
DROP POLICY IF EXISTS "Users can insert own participations" ON public.batch_participations;
DROP POLICY IF EXISTS "Admins can view all participations" ON public.batch_participations;

CREATE POLICY "Users can view own participations" ON public.batch_participations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own participations" ON public.batch_participations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all participations" ON public.batch_participations FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- batches
DROP POLICY IF EXISTS "Anyone can view batches" ON public.batches;
DROP POLICY IF EXISTS "Admins can manage batches" ON public.batches;
DROP POLICY IF EXISTS "Partners can create batches" ON public.batches;

CREATE POLICY "Anyone can view batches" ON public.batches FOR SELECT USING (true);
CREATE POLICY "Admins can manage batches" ON public.batches FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Partners can create batches" ON public.batches FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'partner') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Partners can update own batches" ON public.batches FOR UPDATE USING (auth.uid() = created_by);

-- inventory
DROP POLICY IF EXISTS "Authenticated users can view inventory" ON public.inventory;
DROP POLICY IF EXISTS "Admins can manage inventory" ON public.inventory;
DROP POLICY IF EXISTS "Warehouse can manage inventory" ON public.inventory;

CREATE POLICY "Authenticated users can view inventory" ON public.inventory FOR SELECT USING (true);
CREATE POLICY "Admins can manage inventory" ON public.inventory FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Warehouse can manage inventory" ON public.inventory FOR ALL USING (public.has_role(auth.uid(), 'warehouse'));

-- orders
DROP POLICY IF EXISTS "Sellers can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
DROP POLICY IF EXISTS "Warehouse can view orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;

CREATE POLICY "Sellers can view own orders" ON public.orders FOR SELECT USING (auth.uid() = seller_id);
CREATE POLICY "Admins can manage all orders" ON public.orders FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Warehouse can view orders" ON public.orders FOR SELECT USING (public.has_role(auth.uid(), 'warehouse'));
CREATE POLICY "Warehouse can update orders" ON public.orders FOR UPDATE USING (public.has_role(auth.uid(), 'warehouse'));
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = seller_id);

-- order_items
DROP POLICY IF EXISTS "Order items follow order access" ON public.order_items;

CREATE POLICY "Order items follow order access" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (orders.seller_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'warehouse')))
);
CREATE POLICY "Users can insert order items" ON public.order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.seller_id = auth.uid())
);

-- profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can create own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;

CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all transactions" ON public.transactions FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- user_roles
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own role" ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- wallets
DROP POLICY IF EXISTS "Users can view own wallet" ON public.wallets;
DROP POLICY IF EXISTS "Users can update own wallet" ON public.wallets;

CREATE POLICY "Users can view own wallet" ON public.wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own wallet" ON public.wallets FOR UPDATE USING (auth.uid() = user_id);

-- Create triggers for handle_new_user and handle_new_wallet (they exist as functions but triggers may be missing)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_auth_user_wallet ON auth.users;
CREATE TRIGGER on_auth_user_wallet AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_wallet();

-- Create a function to join a batch atomically
CREATE OR REPLACE FUNCTION public.join_batch(
  p_batch_id uuid,
  p_units integer,
  p_total_invested numeric
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_batch batches%ROWTYPE;
  v_participation_id uuid;
BEGIN
  -- Lock the batch row
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
    RAISE EXCEPTION 'Below minimum participation';
  END IF;
  
  -- Insert participation
  INSERT INTO batch_participations (batch_id, user_id, units_owned, total_invested)
  VALUES (p_batch_id, auth.uid(), p_units, p_total_invested)
  RETURNING id INTO v_participation_id;
  
  -- Update batch
  UPDATE batches SET
    funded_units = funded_units + p_units,
    remaining_units = remaining_units - p_units,
    partners_joined = partners_joined + 1
  WHERE id = p_batch_id;
  
  -- Create wallet transaction (debit)
  INSERT INTO transactions (user_id, type, amount, description, reference_id, status)
  VALUES (auth.uid(), 'investment', p_total_invested, 
    'Investment in ' || v_batch.batch_name || ' — ' || p_units || ' units',
    v_participation_id::text, 'completed');
  
  -- Deduct from wallet
  UPDATE wallets SET balance = balance - p_total_invested WHERE user_id = auth.uid();
  
  RETURN json_build_object('participation_id', v_participation_id, 'units', p_units, 'invested', p_total_invested);
END;
$$;
