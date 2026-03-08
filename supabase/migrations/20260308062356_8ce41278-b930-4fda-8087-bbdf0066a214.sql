
-- Fix batch_participations: drop restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Users can view own participations" ON public.batch_participations;
DROP POLICY IF EXISTS "Users can insert own participations" ON public.batch_participations;
DROP POLICY IF EXISTS "Admins can view all participations" ON public.batch_participations;

CREATE POLICY "Users can view own participations" ON public.batch_participations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own participations" ON public.batch_participations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all participations" ON public.batch_participations FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Fix batches
DROP POLICY IF EXISTS "Anyone can view batches" ON public.batches;
DROP POLICY IF EXISTS "Admins can manage batches" ON public.batches;
DROP POLICY IF EXISTS "Partners can create batches" ON public.batches;

CREATE POLICY "Anyone can view batches" ON public.batches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage batches" ON public.batches FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Partners can create batches" ON public.batches FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'partner') OR public.has_role(auth.uid(), 'admin'));

-- Fix inventory
DROP POLICY IF EXISTS "Authenticated users can view inventory" ON public.inventory;
DROP POLICY IF EXISTS "Admins can manage inventory" ON public.inventory;
DROP POLICY IF EXISTS "Warehouse can manage inventory" ON public.inventory;

CREATE POLICY "Authenticated users can view inventory" ON public.inventory FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage inventory" ON public.inventory FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Warehouse can manage inventory" ON public.inventory FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'warehouse'));

-- Fix order_items
DROP POLICY IF EXISTS "Order items follow order access" ON public.order_items;

CREATE POLICY "Order items follow order access" ON public.order_items FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND (orders.seller_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'warehouse')))
);

-- Fix orders
DROP POLICY IF EXISTS "Sellers can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
DROP POLICY IF EXISTS "Warehouse can view orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;

CREATE POLICY "Sellers can view own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = seller_id);
CREATE POLICY "Admins can manage all orders" ON public.orders FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Warehouse can view orders" ON public.orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'warehouse'));
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = seller_id);

-- Fix profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Fix transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can create own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;

CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all transactions" ON public.transactions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Fix user_roles
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Fix wallets
DROP POLICY IF EXISTS "Users can view own wallet" ON public.wallets;
DROP POLICY IF EXISTS "Users can update own wallet" ON public.wallets;

CREATE POLICY "Users can view own wallet" ON public.wallets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own wallet" ON public.wallets FOR UPDATE TO authenticated USING (auth.uid() = user_id);
