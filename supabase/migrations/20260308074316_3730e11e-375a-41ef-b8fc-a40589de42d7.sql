
-- ============================================================
-- CRITICAL FIX: Convert ALL RESTRICTIVE policies to PERMISSIVE
-- PostgreSQL denies all access when only RESTRICTIVE policies exist.
-- We must DROP and re-CREATE each policy as PERMISSIVE.
-- ============================================================

-- ═══ BATCHES ═══
DROP POLICY IF EXISTS "Anyone can view batches" ON public.batches;
CREATE POLICY "Anyone can view batches" ON public.batches FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage batches" ON public.batches;
CREATE POLICY "Admins can manage batches" ON public.batches FOR ALL USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Partners can create batches" ON public.batches;
CREATE POLICY "Partners can create batches" ON public.batches FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'partner') OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Partners can update own batches" ON public.batches;
CREATE POLICY "Partners can update own batches" ON public.batches FOR UPDATE
  USING (auth.uid() = created_by);

-- ═══ BATCH_PARTICIPATIONS ═══
DROP POLICY IF EXISTS "Users can view own participations" ON public.batch_participations;
CREATE POLICY "Users can view own participations" ON public.batch_participations FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own participations" ON public.batch_participations;
CREATE POLICY "Users can insert own participations" ON public.batch_participations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all participations" ON public.batch_participations;
CREATE POLICY "Admins can view all participations" ON public.batch_participations FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- ═══ INVENTORY ═══
DROP POLICY IF EXISTS "Authenticated users can view inventory" ON public.inventory;
CREATE POLICY "Authenticated users can view inventory" ON public.inventory FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage inventory" ON public.inventory;
CREATE POLICY "Admins can manage inventory" ON public.inventory FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Warehouse can manage inventory" ON public.inventory;
CREATE POLICY "Warehouse can manage inventory" ON public.inventory FOR ALL
  USING (public.has_role(auth.uid(), 'warehouse'));

-- ═══ ORDERS ═══
DROP POLICY IF EXISTS "Sellers can view own orders" ON public.orders;
CREATE POLICY "Sellers can view own orders" ON public.orders FOR SELECT
  USING (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
CREATE POLICY "Admins can manage all orders" ON public.orders FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Warehouse can view orders" ON public.orders;
CREATE POLICY "Warehouse can view orders" ON public.orders FOR SELECT
  USING (public.has_role(auth.uid(), 'warehouse'));

DROP POLICY IF EXISTS "Warehouse can update orders" ON public.orders;
CREATE POLICY "Warehouse can update orders" ON public.orders FOR UPDATE
  USING (public.has_role(auth.uid(), 'warehouse'));

DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

-- ═══ ORDER_ITEMS ═══
DROP POLICY IF EXISTS "Order items follow order access" ON public.order_items;
CREATE POLICY "Order items follow order access" ON public.order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND (orders.seller_id = auth.uid()
      OR public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'warehouse'))
  ));

DROP POLICY IF EXISTS "Users can insert order items" ON public.order_items;
CREATE POLICY "Users can insert order items" ON public.order_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.seller_id = auth.uid()
  ));

-- ═══ PROFILES ═══
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ═══ TRANSACTIONS ═══
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;
CREATE POLICY "Admins can view all transactions" ON public.transactions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update transactions" ON public.transactions;
CREATE POLICY "Admins can update transactions" ON public.transactions FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- ═══ USER_ROLES ═══
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- ═══ WALLETS ═══
DROP POLICY IF EXISTS "Users can view own wallet" ON public.wallets;
CREATE POLICY "Users can view own wallet" ON public.wallets FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all wallets" ON public.wallets;
CREATE POLICY "Admins can view all wallets" ON public.wallets FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- ═══ DISTRIBUTION_CHANNELS ═══
DROP POLICY IF EXISTS "Authenticated users can view distribution channels" ON public.distribution_channels;
CREATE POLICY "Authenticated users can view distribution channels" ON public.distribution_channels FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage distribution channels" ON public.distribution_channels;
CREATE POLICY "Admins can manage distribution channels" ON public.distribution_channels FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- FIX: Signup role assignment via SECURITY DEFINER function
-- Since users can't INSERT into user_roles directly, we need
-- a function that's called from the auth trigger.
-- ============================================================

-- Function to assign role during signup (called from handle_new_user trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_role text;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Create wallet
  INSERT INTO public.wallets (user_id, balance)
  VALUES (NEW.id, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Auto-assign role from signup metadata
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'partner');
  IF v_role IN ('partner', 'dropshipper', 'distributor', 'warehouse') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, v_role::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'partner'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Ensure trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
