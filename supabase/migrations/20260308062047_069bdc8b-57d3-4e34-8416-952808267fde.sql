
-- 1. UTILITY: updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 2. PROFILES
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. USER ROLES
CREATE TYPE public.app_role AS ENUM ('admin', 'partner', 'dropshipper', 'distributor', 'warehouse');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 4. PRODUCTION BATCHES
CREATE TABLE public.batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name TEXT NOT NULL,
  batch_name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  image TEXT,
  production_cost_per_unit NUMERIC NOT NULL,
  wholesale_price NUMERIC NOT NULL,
  retail_price NUMERIC NOT NULL,
  total_quantity INT NOT NULL,
  funded_units INT NOT NULL DEFAULT 0,
  remaining_units INT NOT NULL,
  min_participation NUMERIC NOT NULL DEFAULT 10000,
  status TEXT NOT NULL DEFAULT 'funding' CHECK (status IN ('funding','production','shipping','completed')),
  manufacturer TEXT,
  warehouse TEXT,
  production_time_days INT DEFAULT 30,
  deadline TIMESTAMPTZ,
  partners_joined INT NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view batches" ON public.batches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage batches" ON public.batches FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Partners can create batches" ON public.batches FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'partner') OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_batches_updated_at BEFORE UPDATE ON public.batches
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. BATCH PARTICIPATIONS
CREATE TABLE public.batch_participations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  units_owned INT NOT NULL,
  total_invested NUMERIC NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.batch_participations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own participations" ON public.batch_participations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own participations" ON public.batch_participations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all participations" ON public.batch_participations FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 6. ORDERS
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_address TEXT,
  channel TEXT NOT NULL CHECK (channel IN ('platform','retail','dropshipper','distributor')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','processing','ready','shipped','delivered','returned','cancelled')),
  total_amount NUMERIC NOT NULL,
  commission NUMERIC DEFAULT 0,
  seller_id UUID REFERENCES auth.users(id),
  batch_id UUID REFERENCES public.batches(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers can view own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = seller_id);
CREATE POLICY "Admins can manage all orders" ON public.orders FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Warehouse can view orders" ON public.orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'warehouse'));
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = seller_id);

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. ORDER ITEMS
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  quantity INT NOT NULL,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Order items follow order access" ON public.order_items FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND (orders.seller_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'warehouse')))
);

-- 8. WALLETS
CREATE TABLE public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  balance NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wallet" ON public.wallets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own wallet" ON public.wallets FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON public.wallets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.wallets (user_id, balance) VALUES (NEW.id, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created_wallet
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_wallet();

-- 9. TRANSACTIONS
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('investment','profit','withdrawal','commission','reinvestment')),
  amount NUMERIC NOT NULL,
  description TEXT,
  reference_id TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending','completed','failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all transactions" ON public.transactions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 10. INVENTORY
CREATE TABLE public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES public.batches(id),
  product_name TEXT NOT NULL,
  sku TEXT,
  total_stock INT NOT NULL DEFAULT 0,
  allocated_stock INT NOT NULL DEFAULT 0,
  sold_units INT NOT NULL DEFAULT 0,
  warehouse_location TEXT,
  status TEXT NOT NULL DEFAULT 'in_stock' CHECK (status IN ('in_stock','low_stock','out_of_stock')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view inventory" ON public.inventory FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage inventory" ON public.inventory FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Warehouse can manage inventory" ON public.inventory FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'warehouse'));

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON public.inventory
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
