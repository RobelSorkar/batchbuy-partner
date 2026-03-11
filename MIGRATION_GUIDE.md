# BatchBuy Partner — Supabase Migration Guide

Complete guide to recreate this project's backend on your own Supabase instance.

---

## Prerequisites

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Install the [Supabase CLI](https://supabase.com/docs/guides/cli)
3. Note your project's **URL**, **Anon Key**, and **Service Role Key**

---

## Step 1: Schema Setup

Run these SQL statements in your Supabase SQL Editor (Dashboard → SQL Editor), **in order**.

### 1.1 Enums

```sql
CREATE TYPE public.app_role AS ENUM ('admin', 'partner', 'dropshipper', 'distributor', 'warehouse');
```

### 1.2 Tables

```sql
-- Profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  full_name text,
  avatar_url text,
  phone text,
  address text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- User Roles
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Wallets
CREATE TABLE public.wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  balance numeric NOT NULL DEFAULT 0,
  daily_withdrawal_limit numeric DEFAULT 500000,
  daily_withdrawn numeric DEFAULT 0,
  last_withdrawal_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Transactions
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  amount numeric NOT NULL,
  description text,
  reference_id text,
  status text NOT NULL DEFAULT 'completed',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Batches
CREATE TABLE public.batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_name text NOT NULL,
  product_name text NOT NULL,
  production_cost_per_unit numeric NOT NULL,
  wholesale_price numeric NOT NULL,
  retail_price numeric NOT NULL,
  total_quantity integer NOT NULL,
  remaining_units integer NOT NULL,
  funded_units integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'funding',
  min_participation numeric NOT NULL DEFAULT 10000,
  category text,
  description text,
  manufacturer text,
  warehouse text,
  production_time_days integer DEFAULT 30,
  deadline timestamptz,
  image text,
  partners_joined integer NOT NULL DEFAULT 0,
  logistics_cost_per_unit numeric NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Batch Participations
CREATE TABLE public.batch_participations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES public.batches(id),
  user_id uuid NOT NULL,
  units_owned integer NOT NULL,
  total_invested numeric NOT NULL,
  units_sold integer NOT NULL DEFAULT 0,
  inventory_mode text NOT NULL DEFAULT 'platform',
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (batch_id, user_id)
);

-- Inventory
CREATE TABLE public.inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name text NOT NULL,
  batch_id uuid UNIQUE REFERENCES public.batches(id),
  total_stock integer NOT NULL DEFAULT 0,
  allocated_stock integer NOT NULL DEFAULT 0,
  sold_units integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'in_stock',
  sku text,
  warehouse_location text,
  shelf_location text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Distribution Channels
CREATE TABLE public.distribution_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id uuid NOT NULL REFERENCES public.inventory(id),
  channel text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  price numeric NOT NULL DEFAULT 0,
  min_price numeric NOT NULL DEFAULT 0,
  max_price numeric NOT NULL DEFAULT 0,
  allocated_stock integer NOT NULL DEFAULT 0,
  sold_units integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (inventory_id, channel)
);

-- Orders
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  customer_name text NOT NULL,
  customer_phone text,
  customer_address text,
  channel text NOT NULL,
  total_amount numeric NOT NULL,
  commission numeric DEFAULT 0,
  seller_id uuid,
  batch_id uuid REFERENCES public.batches(id),
  status text NOT NULL DEFAULT 'pending',
  tracking_number text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Order Items
CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id),
  product_name text NOT NULL,
  quantity integer NOT NULL,
  unit_price numeric NOT NULL,
  total_price numeric NOT NULL
);

-- Notifications
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  read boolean NOT NULL DEFAULT false,
  reference_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Audit Logs
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  table_name text,
  record_id text,
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Order Number Sequence
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START 1;
```

### 1.3 Enable RLS on All Tables

```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distribution_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
```

---

## Step 2: Database Functions

Run each function in the SQL Editor.

### 2.1 Core Utility Functions

```sql
-- has_role (used by RLS policies)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Order number generator
CREATE OR REPLACE FUNCTION public.generate_order_number(p_channel text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_prefix text;
  v_seq bigint;
BEGIN
  v_seq := nextval('public.order_number_seq');
  CASE p_channel
    WHEN 'dropshipper' THEN v_prefix := 'DO';
    WHEN 'dropship' THEN v_prefix := 'DO';
    WHEN 'platform' THEN v_prefix := 'PO';
    WHEN 'retail' THEN v_prefix := 'RO';
    WHEN 'distributor' THEN v_prefix := 'DI';
    ELSE v_prefix := 'OR';
  END CASE;
  RETURN v_prefix || '-' || LPAD(v_seq::text, 6, '0');
END;
$$;

-- Ledger balance calculator
CREATE OR REPLACE FUNCTION public.calculate_ledger_balance(p_user_id uuid)
RETURNS numeric LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT COALESCE(SUM(
    CASE
      WHEN type IN ('deposit', 'profit', 'commission', 'bonus') AND status = 'completed' THEN amount
      WHEN type = 'withdrawal' AND status IN ('pending', 'processing', 'completed') THEN -amount
      WHEN type = 'investment' AND status = 'completed' THEN -amount
      ELSE 0
    END
  ), 0)
  FROM transactions WHERE user_id = p_user_id;
$$;
```

### 2.2 Auth & Signup

```sql
-- Handle new user signup (attach to auth.users trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  ) ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.wallets (user_id, balance)
  VALUES (NEW.id, 0) ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'partner'::app_role) ON CONFLICT (user_id, role) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'dropshipper'::app_role) ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

-- IMPORTANT: Create the auth trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 2.3 Wallet Functions

```sql
-- Process deposit
CREATE OR REPLACE FUNCTION public.process_deposit(p_amount numeric, p_method text, p_account text)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_txn_id uuid;
  v_wallet wallets%ROWTYPE;
BEGIN
  SELECT * INTO v_wallet FROM wallets WHERE user_id = auth.uid() FOR UPDATE;
  IF v_wallet IS NULL THEN RAISE EXCEPTION 'Wallet not found'; END IF;
  IF p_amount <= 0 THEN RAISE EXCEPTION 'Invalid deposit amount'; END IF;
  IF p_amount < 500 THEN RAISE EXCEPTION 'Minimum deposit is ৳500'; END IF;

  INSERT INTO transactions (user_id, type, amount, description, status)
  VALUES (auth.uid(), 'deposit', p_amount, 'Deposit via ' || p_method || ' — ' || p_account, 'pending')
  RETURNING id INTO v_txn_id;

  UPDATE wallets SET balance = balance + p_amount WHERE user_id = auth.uid();
  UPDATE transactions SET status = 'completed' WHERE id = v_txn_id;

  RETURN json_build_object('transaction_id', v_txn_id, 'amount', p_amount, 'new_balance', v_wallet.balance + p_amount);
END;
$$;

-- Process withdrawal
CREATE OR REPLACE FUNCTION public.process_withdrawal(p_amount numeric, p_method text, p_account text)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_wallet wallets%ROWTYPE;
  v_txn_id uuid;
  v_today date := current_date;
BEGIN
  SELECT * INTO v_wallet FROM wallets WHERE user_id = auth.uid() FOR UPDATE;
  IF v_wallet IS NULL THEN RAISE EXCEPTION 'Wallet not found'; END IF;
  IF p_amount <= 0 THEN RAISE EXCEPTION 'Invalid withdrawal amount'; END IF;
  IF p_amount > v_wallet.balance THEN RAISE EXCEPTION 'Insufficient balance'; END IF;

  IF v_wallet.last_withdrawal_date = v_today THEN
    IF (v_wallet.daily_withdrawn + p_amount) > v_wallet.daily_withdrawal_limit THEN
      RAISE EXCEPTION 'Daily withdrawal limit exceeded';
    END IF;
  END IF;

  INSERT INTO transactions (user_id, type, amount, description, status)
  VALUES (auth.uid(), 'withdrawal', p_amount, 'Withdrawal to ' || p_method || ' — ' || p_account, 'pending')
  RETURNING id INTO v_txn_id;

  UPDATE wallets SET
    balance = balance - p_amount,
    daily_withdrawn = CASE WHEN last_withdrawal_date = v_today THEN daily_withdrawn + p_amount ELSE p_amount END,
    last_withdrawal_date = v_today
  WHERE user_id = auth.uid();

  RETURN json_build_object('transaction_id', v_txn_id, 'amount', p_amount, 'new_balance', v_wallet.balance - p_amount);
END;
$$;

-- Refund withdrawal (admin only)
CREATE OR REPLACE FUNCTION public.refund_withdrawal(p_transaction_id uuid)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_txn transactions%ROWTYPE;
BEGIN
  IF NOT has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  SELECT * INTO v_txn FROM transactions WHERE id = p_transaction_id FOR UPDATE;
  IF v_txn IS NULL THEN RAISE EXCEPTION 'Transaction not found'; END IF;
  IF v_txn.type != 'withdrawal' THEN RAISE EXCEPTION 'Not a withdrawal'; END IF;
  IF v_txn.status NOT IN ('pending', 'processing') THEN RAISE EXCEPTION 'Cannot refund'; END IF;

  UPDATE transactions SET status = 'failed' WHERE id = p_transaction_id;
  UPDATE wallets SET balance = balance + v_txn.amount WHERE user_id = v_txn.user_id;

  RETURN json_build_object('transaction_id', p_transaction_id, 'refunded_amount', v_txn.amount, 'user_id', v_txn.user_id);
END;
$$;

-- Reconcile wallet balances (admin only)
CREATE OR REPLACE FUNCTION public.reconcile_wallet_balances()
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_count integer := 0; v_mismatches integer := 0;
  v_wallet record; v_ledger_balance numeric;
BEGIN
  IF NOT has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  FOR v_wallet IN SELECT id, user_id, balance FROM wallets LOOP
    v_ledger_balance := calculate_ledger_balance(v_wallet.user_id);
    v_count := v_count + 1;
    IF v_wallet.balance != v_ledger_balance THEN
      v_mismatches := v_mismatches + 1;
      INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values)
      VALUES (auth.uid(), 'balance_reconciliation', 'wallets', v_wallet.id::text,
        jsonb_build_object('stored_balance', v_wallet.balance),
        jsonb_build_object('ledger_balance', v_ledger_balance));
      UPDATE wallets SET balance = v_ledger_balance, updated_at = now() WHERE id = v_wallet.id;
    END IF;
  END LOOP;
  RETURN json_build_object('wallets_checked', v_count, 'mismatches_fixed', v_mismatches);
END;
$$;
```

### 2.4 Batch & Investment Functions

```sql
-- Join batch (3-arg version for basic usage)
CREATE OR REPLACE FUNCTION public.join_batch(p_batch_id uuid, p_units integer, p_total_invested numeric)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_batch batches%ROWTYPE; v_wallet wallets%ROWTYPE;
  v_participation_id uuid; v_existing batch_participations%ROWTYPE;
BEGIN
  IF p_units <= 0 THEN RAISE EXCEPTION 'Invalid units'; END IF;
  IF p_total_invested <= 0 THEN RAISE EXCEPTION 'Invalid amount'; END IF;

  SELECT * INTO v_batch FROM batches WHERE id = p_batch_id FOR UPDATE;
  IF v_batch IS NULL THEN RAISE EXCEPTION 'Batch not found'; END IF;
  IF v_batch.status != 'funding' THEN RAISE EXCEPTION 'Not accepting investments'; END IF;
  IF p_units > v_batch.remaining_units THEN RAISE EXCEPTION 'Not enough units'; END IF;
  IF p_total_invested != (p_units * v_batch.production_cost_per_unit) THEN RAISE EXCEPTION 'Amount mismatch'; END IF;

  SELECT * INTO v_existing FROM batch_participations WHERE batch_id = p_batch_id AND user_id = auth.uid();
  IF v_existing IS NULL AND p_total_invested < v_batch.min_participation THEN
    RAISE EXCEPTION 'Below minimum participation';
  END IF;

  SELECT * INTO v_wallet FROM wallets WHERE user_id = auth.uid() FOR UPDATE;
  IF v_wallet IS NULL THEN RAISE EXCEPTION 'Wallet not found'; END IF;
  IF v_wallet.balance < p_total_invested THEN RAISE EXCEPTION 'Insufficient balance'; END IF;

  IF v_existing IS NOT NULL THEN
    PERFORM set_config('app.calling_function', 'join_batch', true);
    UPDATE batch_participations SET units_owned = units_owned + p_units, total_invested = total_invested + p_total_invested WHERE id = v_existing.id;
    v_participation_id := v_existing.id;
    UPDATE batches SET funded_units = funded_units + p_units, remaining_units = remaining_units - p_units WHERE id = p_batch_id;
  ELSE
    INSERT INTO batch_participations (batch_id, user_id, units_owned, total_invested)
    VALUES (p_batch_id, auth.uid(), p_units, p_total_invested) RETURNING id INTO v_participation_id;
    UPDATE batches SET funded_units = funded_units + p_units, remaining_units = remaining_units - p_units, partners_joined = partners_joined + 1 WHERE id = p_batch_id;
  END IF;

  INSERT INTO transactions (user_id, type, amount, description, reference_id, status)
  VALUES (auth.uid(), 'investment', p_total_invested, 'Investment in ' || v_batch.batch_name || ' — ' || p_units || ' units', v_participation_id::text, 'completed');
  UPDATE wallets SET balance = balance - p_total_invested WHERE user_id = auth.uid();

  PERFORM set_config('app.calling_function', '', true);
  RETURN json_build_object('participation_id', v_participation_id, 'units', p_units, 'invested', p_total_invested);
END;
$$;

-- Join batch (4-arg version with selling preference)
CREATE OR REPLACE FUNCTION public.join_batch(p_batch_id uuid, p_units integer, p_total_invested numeric, p_selling_preference text DEFAULT 'platform')
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid(); v_batch record; v_wallet record; v_participation_id uuid;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF p_selling_preference NOT IN ('platform', 'collect') THEN RAISE EXCEPTION 'Invalid selling preference'; END IF;

  SELECT * INTO v_batch FROM batches WHERE id = p_batch_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Batch not found'; END IF;
  IF v_batch.status <> 'funding' THEN RAISE EXCEPTION 'Not accepting investments'; END IF;
  IF p_units > v_batch.remaining_units THEN RAISE EXCEPTION 'Not enough units'; END IF;

  SELECT * INTO v_wallet FROM wallets WHERE user_id = v_user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Wallet not found'; END IF;
  IF v_wallet.balance < p_total_invested THEN RAISE EXCEPTION 'Insufficient balance'; END IF;

  UPDATE wallets SET balance = balance - p_total_invested, updated_at = now() WHERE user_id = v_user_id;
  INSERT INTO transactions (user_id, type, amount, description, reference_id, status)
  VALUES (v_user_id, 'investment', p_total_invested, 'Batch investment: ' || v_batch.batch_name, p_batch_id::text, 'completed');
  INSERT INTO batch_participations (batch_id, user_id, units_owned, total_invested, inventory_mode)
  VALUES (p_batch_id, v_user_id, p_units, p_total_invested, p_selling_preference) RETURNING id INTO v_participation_id;
  UPDATE batches SET funded_units = funded_units + p_units, remaining_units = remaining_units - p_units, partners_joined = partners_joined + 1, updated_at = now() WHERE id = p_batch_id;

  INSERT INTO notifications (user_id, title, message, type, reference_id)
  VALUES (v_user_id, 'Batch Joined', 'You invested ৳' || p_total_invested || ' in ' || v_batch.batch_name, 'investment', p_batch_id::text);

  RETURN json_build_object('success', true, 'participation_id', v_participation_id);
END;
$$;

-- Admin sync batch stats
CREATE OR REPLACE FUNCTION public.admin_sync_batch_stats()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  PERFORM set_config('app.calling_function', 'join_batch', true);
  UPDATE batches b SET
    funded_units = COALESCE((SELECT SUM(bp.units_owned) FROM batch_participations bp WHERE bp.batch_id = b.id), 0),
    partners_joined = COALESCE((SELECT COUNT(*) FROM batch_participations bp WHERE bp.batch_id = b.id), 0),
    remaining_units = b.total_quantity - COALESCE((SELECT SUM(bp.units_owned) FROM batch_participations bp WHERE bp.batch_id = b.id), 0);
  PERFORM set_config('app.calling_function', '', true);
END;
$$;
```

### 2.5 Order Functions

```sql
-- Fraud check
CREATE OR REPLACE FUNCTION public.check_order_fraud(p_customer_phone text, p_customer_name text, p_customer_address text, p_batch_id uuid, p_quantity integer)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_recent_same_phone integer; v_recent_same_address integer;
  v_pending_same_phone integer; v_duplicate_exact integer;
BEGIN
  SELECT COUNT(*) INTO v_duplicate_exact FROM orders
  WHERE customer_phone = p_customer_phone AND batch_id = p_batch_id
    AND status IN ('pending', 'confirmed', 'processing') AND created_at > now() - interval '24 hours';
  IF v_duplicate_exact > 0 THEN
    RETURN json_build_object('blocked', true, 'reason', 'duplicate_order', 'message', 'Duplicate order detected');
  END IF;

  SELECT COUNT(*) INTO v_recent_same_phone FROM orders WHERE customer_phone = p_customer_phone AND created_at > now() - interval '1 hour';
  IF v_recent_same_phone >= 3 THEN
    RETURN json_build_object('blocked', true, 'reason', 'rate_limit_phone', 'message', 'Too many orders from this phone');
  END IF;

  SELECT COUNT(*) INTO v_recent_same_address FROM orders WHERE LOWER(TRIM(customer_address)) = LOWER(TRIM(p_customer_address)) AND created_at > now() - interval '1 hour';
  IF v_recent_same_address >= 5 THEN
    RETURN json_build_object('blocked', true, 'reason', 'rate_limit_address', 'message', 'Too many orders from this address');
  END IF;

  SELECT COUNT(*) INTO v_pending_same_phone FROM orders WHERE customer_phone = p_customer_phone AND status IN ('pending', 'cancelled') AND created_at > now() - interval '7 days';
  IF v_pending_same_phone >= 5 THEN
    RETURN json_build_object('blocked', true, 'reason', 'suspicious_pattern', 'message', 'Suspicious order pattern');
  END IF;

  IF p_quantity > 10 THEN
    RETURN json_build_object('blocked', true, 'reason', 'bulk_quantity', 'message', 'Max 10 items per order');
  END IF;

  RETURN json_build_object('blocked', false);
END;
$$;

-- Create order with stock check
CREATE OR REPLACE FUNCTION public.create_order_with_stock_check(
  p_customer_name text, p_customer_phone text, p_customer_address text,
  p_channel text, p_total_amount numeric, p_commission numeric,
  p_batch_id uuid DEFAULT NULL, p_items jsonb DEFAULT '[]'
)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_order_number text; v_order_id uuid; v_item jsonb;
  v_inv inventory%ROWTYPE; v_channel_row distribution_channels%ROWTYPE;
  v_total_qty integer := 0;
BEGIN
  IF length(trim(p_customer_name)) < 2 THEN RAISE EXCEPTION 'Name too short'; END IF;
  IF length(trim(p_customer_phone)) < 10 THEN RAISE EXCEPTION 'Invalid phone'; END IF;
  IF length(trim(p_customer_address)) < 5 THEN RAISE EXCEPTION 'Address too short'; END IF;

  IF p_batch_id IS NOT NULL THEN
    SELECT * INTO v_inv FROM inventory WHERE batch_id = p_batch_id FOR UPDATE;
    IF v_inv IS NOT NULL THEN
      FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
        v_total_qty := v_total_qty + (v_item->>'quantity')::integer;
      END LOOP;
      SELECT * INTO v_channel_row FROM distribution_channels WHERE inventory_id = v_inv.id AND channel = p_channel FOR UPDATE;
      IF v_channel_row IS NOT NULL THEN
        IF NOT v_channel_row.enabled THEN RAISE EXCEPTION 'Channel disabled'; END IF;
        IF (v_channel_row.sold_units + v_total_qty) > v_channel_row.allocated_stock THEN RAISE EXCEPTION 'Insufficient channel stock'; END IF;
      END IF;
      IF (v_inv.sold_units + v_total_qty) > v_inv.total_stock THEN RAISE EXCEPTION 'Insufficient inventory'; END IF;
    END IF;
  END IF;

  v_order_number := generate_order_number(p_channel);
  INSERT INTO orders (order_number, customer_name, customer_phone, customer_address, channel, total_amount, commission, seller_id, batch_id)
  VALUES (v_order_number, trim(p_customer_name), trim(p_customer_phone), trim(p_customer_address), p_channel, p_total_amount, p_commission, auth.uid(), p_batch_id)
  RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    INSERT INTO order_items (order_id, product_name, quantity, unit_price, total_price)
    VALUES (v_order_id, v_item->>'productName', (v_item->>'quantity')::integer, (v_item->>'unitPrice')::numeric, (v_item->>'totalPrice')::numeric);
  END LOOP;

  RETURN json_build_object('order_id', v_order_id, 'order_number', v_order_number);
END;
$$;

-- Audit log helper
CREATE OR REPLACE FUNCTION public.log_audit_event(p_action text, p_table_name text, p_record_id text, p_old_values jsonb DEFAULT NULL, p_new_values jsonb DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values)
  VALUES (auth.uid(), p_action, p_table_name, p_record_id, p_old_values, p_new_values);
END;
$$;
```

### 2.6 Trigger Functions (Automation)

```sql
-- Auto-close batch when fully funded
CREATE OR REPLACE FUNCTION public.auto_close_batch()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.remaining_units = 0 AND OLD.remaining_units > 0 THEN
    NEW.status = 'production';
  END IF;
  RETURN NEW;
END;
$$;

-- Auto-create inventory when batch completes
CREATE OR REPLACE FUNCTION public.auto_create_inventory()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    INSERT INTO inventory (product_name, batch_id, total_stock, status, warehouse_location)
    VALUES (NEW.product_name, NEW.id, NEW.total_quantity, 'in_stock', COALESCE(NEW.warehouse, 'Main Warehouse'))
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Auto-create distribution channels for new inventory
CREATE OR REPLACE FUNCTION public.auto_create_distribution_channels()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_batch batches%ROWTYPE; v_map numeric;
BEGIN
  SELECT * INTO v_batch FROM batches WHERE id = NEW.batch_id;
  IF v_batch IS NOT NULL THEN
    v_map := v_batch.production_cost_per_unit * 1.2;
    INSERT INTO distribution_channels (inventory_id, channel, enabled, price, min_price, max_price, allocated_stock)
    VALUES
      (NEW.id, 'platform', true, v_batch.retail_price, v_map, v_batch.retail_price, ROUND(NEW.total_stock * 0.2)),
      (NEW.id, 'retail', true, GREATEST(ROUND(v_batch.retail_price * 0.85), v_map), v_map, v_batch.retail_price, ROUND(NEW.total_stock * 0.3)),
      (NEW.id, 'dropshipper', true, GREATEST(ROUND(v_batch.retail_price * 0.65), v_map), v_map, GREATEST(ROUND(v_batch.retail_price * 0.85), v_map), ROUND(NEW.total_stock * 0.3)),
      (NEW.id, 'distributor', true, GREATEST(ROUND(v_batch.retail_price * 0.55), v_map), v_map, GREATEST(ROUND(v_batch.retail_price * 0.65), v_map), ROUND(NEW.total_stock * 0.2))
    ON CONFLICT (inventory_id, channel) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Validate batch updates
CREATE OR REPLACE FUNCTION public.validate_batch_update()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF OLD.funded_units > 0 THEN
    IF NEW.production_cost_per_unit != OLD.production_cost_per_unit THEN RAISE EXCEPTION 'Cannot modify production cost after funding'; END IF;
    IF NEW.total_quantity < OLD.funded_units THEN RAISE EXCEPTION 'Cannot reduce below funded units'; END IF;
  END IF;
  IF has_role(auth.uid(), 'admin') THEN RETURN NEW; END IF;
  IF NEW.funded_units != OLD.funded_units AND OLD.funded_units > 0 THEN
    IF current_setting('app.calling_function', true) IS DISTINCT FROM 'join_batch' THEN RAISE EXCEPTION 'Cannot modify funded_units directly'; END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Validate participation updates
CREATE OR REPLACE FUNCTION public.validate_participation_update()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF current_setting('app.calling_function', true) = 'join_batch' THEN RETURN NEW; END IF;
  IF NEW.units_owned != OLD.units_owned THEN RAISE EXCEPTION 'Cannot modify units_owned'; END IF;
  IF NEW.total_invested != OLD.total_invested THEN RAISE EXCEPTION 'Cannot modify total_invested'; END IF;
  IF NEW.batch_id != OLD.batch_id THEN RAISE EXCEPTION 'Cannot modify batch_id'; END IF;
  IF NEW.user_id != OLD.user_id THEN RAISE EXCEPTION 'Cannot modify user_id'; END IF;
  IF NEW.joined_at != OLD.joined_at THEN RAISE EXCEPTION 'Cannot modify joined_at'; END IF;
  IF NEW.units_sold < OLD.units_sold THEN RAISE EXCEPTION 'Cannot decrease units_sold'; END IF;
  RETURN NEW;
END;
$$;

-- Profit distribution on delivery
CREATE OR REPLACE FUNCTION public.distribute_profit_on_delivery()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_item record; v_participation record; v_batch batches%ROWTYPE;
  v_total_profit numeric; v_partner_share numeric; v_partner_units_share integer;
  v_total_batch_units integer; v_item_qty_remaining integer;
  v_logistics_cost numeric; v_marketing_cost numeric;
BEGIN
  IF NEW.status != 'delivered' OR OLD.status = 'delivered' THEN RETURN NEW; END IF;
  IF NEW.batch_id IS NULL THEN RETURN NEW; END IF;
  SELECT * INTO v_batch FROM batches WHERE id = NEW.batch_id;
  IF v_batch IS NULL THEN RETURN NEW; END IF;

  FOR v_item IN SELECT product_name, quantity, total_price FROM order_items WHERE order_id = NEW.id LOOP
    v_total_profit := v_item.total_price - (v_batch.production_cost_per_unit * v_item.quantity);
    IF v_total_profit <= 0 THEN CONTINUE; END IF;
    v_logistics_cost := v_batch.logistics_cost_per_unit * v_item.quantity;
    v_total_profit := v_total_profit - v_logistics_cost;
    IF v_total_profit <= 0 THEN CONTINUE; END IF;
    v_marketing_cost := ROUND(v_item.total_price * 0.10);
    v_total_profit := v_total_profit - v_marketing_cost;
    IF v_total_profit <= 0 THEN CONTINUE; END IF;
    v_total_profit := ROUND(v_total_profit * 0.85, 2);

    SELECT COALESCE(SUM(units_owned), 0) INTO v_total_batch_units FROM batch_participations WHERE batch_id = NEW.batch_id;
    IF v_total_batch_units = 0 THEN CONTINUE; END IF;
    v_item_qty_remaining := v_item.quantity;

    FOR v_participation IN SELECT id, user_id, units_owned, units_sold FROM batch_participations WHERE batch_id = NEW.batch_id ORDER BY joined_at LOOP
      v_partner_share := ROUND((v_total_profit * v_participation.units_owned) / v_total_batch_units, 2);
      v_partner_units_share := LEAST(
        CEIL((v_item.quantity::numeric * v_participation.units_owned) / v_total_batch_units),
        v_item_qty_remaining, v_participation.units_owned - v_participation.units_sold
      );
      IF v_partner_share > 0 THEN
        UPDATE wallets SET balance = balance + v_partner_share WHERE user_id = v_participation.user_id;
        INSERT INTO transactions (user_id, type, amount, description, reference_id, status)
        VALUES (v_participation.user_id, 'profit', v_partner_share, 'Profit from order ' || NEW.order_number, NEW.id::text, 'completed');
      END IF;
      IF v_partner_units_share > 0 THEN
        UPDATE batch_participations SET units_sold = units_sold + v_partner_units_share WHERE id = v_participation.id;
        v_item_qty_remaining := v_item_qty_remaining - v_partner_units_share;
      END IF;
    END LOOP;
  END LOOP;

  IF NEW.seller_id IS NOT NULL AND COALESCE(NEW.commission, 0) > 0 THEN
    UPDATE wallets SET balance = balance + NEW.commission WHERE user_id = NEW.seller_id;
    INSERT INTO transactions (user_id, type, amount, description, reference_id, status)
    VALUES (NEW.seller_id, 'commission', NEW.commission, 'Commission from order ' || NEW.order_number, NEW.id::text, 'completed');
  END IF;
  RETURN NEW;
END;
$$;

-- Sync inventory on delivery
CREATE OR REPLACE FUNCTION public.sync_inventory_on_order()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_item record; v_inv_id uuid;
BEGIN
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' AND NEW.batch_id IS NOT NULL THEN
    SELECT id INTO v_inv_id FROM inventory WHERE batch_id = NEW.batch_id;
    FOR v_item IN SELECT product_name, quantity FROM order_items WHERE order_id = NEW.id LOOP
      UPDATE inventory SET sold_units = sold_units + v_item.quantity, total_stock = total_stock - v_item.quantity WHERE batch_id = NEW.batch_id AND product_name = v_item.product_name;
      IF v_inv_id IS NOT NULL THEN
        UPDATE distribution_channels SET sold_units = sold_units + v_item.quantity, updated_at = now() WHERE inventory_id = v_inv_id AND channel = NEW.channel;
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

-- Refund cancelled batch
CREATE OR REPLACE FUNCTION public.refund_cancelled_batch()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_participation record;
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status = 'funding' THEN
    FOR v_participation IN SELECT id, user_id, total_invested, units_owned FROM batch_participations WHERE batch_id = NEW.id LOOP
      UPDATE wallets SET balance = balance + v_participation.total_invested WHERE user_id = v_participation.user_id;
      INSERT INTO transactions (user_id, type, amount, description, reference_id, status)
      VALUES (v_participation.user_id, 'deposit', v_participation.total_invested, 'Refund — ' || NEW.batch_name || ' cancelled', v_participation.id::text, 'completed');
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

-- Wallet ledger sync
CREATE OR REPLACE FUNCTION public.sync_wallet_from_ledger()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_user_id uuid; v_new_balance numeric;
BEGIN
  v_user_id := COALESCE(NEW.user_id, OLD.user_id);
  v_new_balance := calculate_ledger_balance(v_user_id);
  UPDATE wallets SET balance = v_new_balance, updated_at = now() WHERE user_id = v_user_id;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Generate tracking number
CREATE OR REPLACE FUNCTION public.generate_tracking_number()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'shipped' AND (OLD.status != 'shipped' OR OLD.status IS NULL) AND NEW.tracking_number IS NULL THEN
    NEW.tracking_number := 'TRK-' || UPPER(SUBSTRING(gen_random_uuid()::text FROM 1 FOR 8));
  END IF;
  RETURN NEW;
END;
$$;

-- Notification triggers (batch status, order status, wallet credits, etc.)
CREATE OR REPLACE FUNCTION public.notify_batch_status_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_participant record;
BEGIN
  IF OLD.status = NEW.status THEN RETURN NEW; END IF;
  FOR v_participant IN SELECT DISTINCT user_id FROM batch_participations WHERE batch_id = NEW.id LOOP
    INSERT INTO notifications (user_id, title, message, type, reference_id)
    VALUES (v_participant.user_id, 'Batch ' || NEW.batch_name || ' Updated', 'Status changed to ' || NEW.status, 'batch', NEW.id::text);
  END LOOP;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_order_created()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.seller_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, title, message, type, reference_id)
    VALUES (NEW.seller_id, 'নতুন অর্ডার পেয়েছেন', 'অর্ডার ' || NEW.order_number || ' — ৳' || NEW.total_amount, 'order', NEW.id::text);
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_order_status_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF OLD.status = NEW.status THEN RETURN NEW; END IF;
  IF NEW.seller_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, title, message, type, reference_id)
    VALUES (NEW.seller_id, 'Order ' || NEW.order_number || ' Updated',
      'Status changed to ' || NEW.status || CASE WHEN NEW.status = 'shipped' AND NEW.tracking_number IS NOT NULL THEN '. Tracking: ' || NEW.tracking_number ELSE '' END,
      'order', NEW.id::text);
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_wallet_credit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.type IN ('profit', 'commission') AND NEW.status = 'completed' THEN
    INSERT INTO notifications (user_id, title, message, type, reference_id)
    VALUES (NEW.user_id, CASE NEW.type WHEN 'profit' THEN 'Profit Received' ELSE 'Commission Earned' END,
      '৳' || NEW.amount::text || ' credited — ' || COALESCE(NEW.description, ''), 'wallet', NEW.id::text);
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_withdrawal_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF OLD.status = NEW.status THEN RETURN NEW; END IF;
  IF NEW.type != 'withdrawal' THEN RETURN NEW; END IF;
  IF NEW.status = 'completed' THEN
    INSERT INTO notifications (user_id, title, message, type, reference_id)
    VALUES (NEW.user_id, 'উত্তোলন অনুমোদিত', '৳' || NEW.amount || ' সফলভাবে উত্তোলন করা হয়েছে।', 'wallet', NEW.id::text);
  ELSIF NEW.status = 'failed' THEN
    INSERT INTO notifications (user_id, title, message, type, reference_id)
    VALUES (NEW.user_id, 'উত্তোলন বাতিল', '৳' || NEW.amount || ' আপনার ওয়ালেটে ফেরত দেওয়া হয়েছে।', 'wallet', NEW.id::text);
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_inventory_created()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_participant record;
BEGIN
  IF TG_OP = 'INSERT' AND NEW.batch_id IS NOT NULL THEN
    FOR v_participant IN SELECT DISTINCT user_id FROM batch_participations WHERE batch_id = NEW.batch_id LOOP
      INSERT INTO notifications (user_id, title, message, type, reference_id)
      VALUES (v_participant.user_id, 'ইনভেন্টরি প্রস্তুত', NEW.product_name || ' — ' || NEW.total_stock || ' ইউনিট', 'inventory', NEW.batch_id::text);
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

-- Audit trigger functions
CREATE OR REPLACE FUNCTION public.audit_batch_participation() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values) VALUES (NEW.user_id, 'batch_joined', 'batch_participations', NEW.id::text, jsonb_build_object('batch_id', NEW.batch_id, 'units_owned', NEW.units_owned, 'total_invested', NEW.total_invested));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values) VALUES (NEW.user_id, CASE WHEN NEW.units_owned != OLD.units_owned THEN 'batch_topup' ELSE 'participation_updated' END, 'batch_participations', NEW.id::text, jsonb_build_object('units_owned', OLD.units_owned), jsonb_build_object('units_owned', NEW.units_owned));
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.audit_order_changes() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values) VALUES (COALESCE(NEW.seller_id, auth.uid()), 'order_created', 'orders', NEW.id::text, jsonb_build_object('order_number', NEW.order_number, 'total_amount', NEW.total_amount));
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values) VALUES (COALESCE(auth.uid(), NEW.seller_id), 'order_status_changed', 'orders', NEW.id::text, jsonb_build_object('status', OLD.status), jsonb_build_object('status', NEW.status));
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.audit_inventory_changes() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values) VALUES (COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid), 'inventory_updated', 'inventory', NEW.id::text, jsonb_build_object('total_stock', OLD.total_stock, 'sold_units', OLD.sold_units), jsonb_build_object('total_stock', NEW.total_stock, 'sold_units', NEW.sold_units));
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.audit_transaction_status() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values) VALUES (COALESCE(auth.uid(), NEW.user_id), 'transaction_status_changed', 'transactions', NEW.id::text, jsonb_build_object('status', OLD.status), jsonb_build_object('status', NEW.status));
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.audit_wallet_changes() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.balance != NEW.balance THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values) VALUES (NEW.user_id, 'balance_change', 'wallets', NEW.id::text, jsonb_build_object('balance', OLD.balance), jsonb_build_object('balance', NEW.balance));
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.audit_role_changes() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values) VALUES (auth.uid(), 'role_assigned', 'user_roles', NEW.id::text, jsonb_build_object('target_user', NEW.user_id, 'role', NEW.role));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values) VALUES (auth.uid(), 'role_removed', 'user_roles', OLD.id::text, jsonb_build_object('target_user', OLD.user_id, 'role', OLD.role));
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;
```

---

## Step 3: Create Triggers

```sql
-- Batches
CREATE TRIGGER trg_auto_close_batch BEFORE UPDATE ON public.batches FOR EACH ROW EXECUTE FUNCTION auto_close_batch();
CREATE TRIGGER trg_auto_create_inventory AFTER UPDATE ON public.batches FOR EACH ROW EXECUTE FUNCTION auto_create_inventory();
CREATE TRIGGER trg_validate_batch_update BEFORE UPDATE ON public.batches FOR EACH ROW EXECUTE FUNCTION validate_batch_update();
CREATE TRIGGER trg_notify_batch_status AFTER UPDATE ON public.batches FOR EACH ROW EXECUTE FUNCTION notify_batch_status_change();
CREATE TRIGGER trg_refund_cancelled_batch AFTER UPDATE ON public.batches FOR EACH ROW EXECUTE FUNCTION refund_cancelled_batch();
CREATE TRIGGER trg_updated_at_batches BEFORE UPDATE ON public.batches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Batch Participations
CREATE TRIGGER trg_validate_participation BEFORE UPDATE ON public.batch_participations FOR EACH ROW EXECUTE FUNCTION validate_participation_update();
CREATE TRIGGER trg_audit_participation AFTER INSERT OR UPDATE ON public.batch_participations FOR EACH ROW EXECUTE FUNCTION audit_batch_participation();

-- Inventory
CREATE TRIGGER trg_auto_distribution_channels AFTER INSERT ON public.inventory FOR EACH ROW EXECUTE FUNCTION auto_create_distribution_channels();
CREATE TRIGGER trg_audit_inventory AFTER INSERT OR UPDATE ON public.inventory FOR EACH ROW EXECUTE FUNCTION audit_inventory_changes();
CREATE TRIGGER trg_notify_inventory AFTER INSERT ON public.inventory FOR EACH ROW EXECUTE FUNCTION notify_inventory_created();
CREATE TRIGGER trg_updated_at_inventory BEFORE UPDATE ON public.inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Orders
CREATE TRIGGER trg_distribute_profit AFTER UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION distribute_profit_on_delivery();
CREATE TRIGGER trg_sync_inventory_order AFTER UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION sync_inventory_on_order();
CREATE TRIGGER trg_generate_tracking BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION generate_tracking_number();
CREATE TRIGGER trg_notify_order_created AFTER INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION notify_order_created();
CREATE TRIGGER trg_notify_order_status AFTER UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION notify_order_status_change();
CREATE TRIGGER trg_audit_orders AFTER INSERT OR UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION audit_order_changes();
CREATE TRIGGER trg_updated_at_orders BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Transactions
CREATE TRIGGER trg_audit_transaction_status AFTER UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION audit_transaction_status();
CREATE TRIGGER trg_notify_wallet_credit AFTER INSERT ON public.transactions FOR EACH ROW EXECUTE FUNCTION notify_wallet_credit();
CREATE TRIGGER trg_notify_withdrawal_status AFTER UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION notify_withdrawal_status();
-- NOTE: Enable the ledger sync trigger only if you want auto wallet reconciliation:
-- CREATE TRIGGER trg_sync_wallet_from_ledger AFTER INSERT OR UPDATE OR DELETE ON public.transactions FOR EACH ROW EXECUTE FUNCTION sync_wallet_from_ledger();

-- Wallets
CREATE TRIGGER trg_audit_wallet AFTER UPDATE ON public.wallets FOR EACH ROW EXECUTE FUNCTION audit_wallet_changes();
CREATE TRIGGER trg_updated_at_wallets BEFORE UPDATE ON public.wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- User Roles
CREATE TRIGGER trg_audit_roles AFTER INSERT OR DELETE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION audit_role_changes();

-- Distribution Channels
CREATE TRIGGER trg_updated_at_dist BEFORE UPDATE ON public.distribution_channels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## Step 4: RLS Policies

```sql
-- PROFILES
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- USER_ROLES
CREATE POLICY "Users can view own roles" ON user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON user_roles FOR ALL USING (has_role(auth.uid(), 'admin'));

-- WALLETS
CREATE POLICY "Users can view own wallet" ON wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all wallets" ON wallets FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- TRANSACTIONS
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all transactions" ON transactions FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update transactions" ON transactions FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- BATCHES
CREATE POLICY "Anyone can view batches" ON batches FOR SELECT USING (true);
CREATE POLICY "Only admins can create batches" ON batches FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage batches" ON batches FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Partners can update own batches" ON batches FOR UPDATE USING (auth.uid() = created_by);

-- BATCH_PARTICIPATIONS
CREATE POLICY "Users can view own participations" ON batch_participations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all participations" ON batch_participations FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own participations" ON batch_participations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own participation mode" ON batch_participations FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- INVENTORY
CREATE POLICY "Authenticated users can view inventory" ON inventory FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage inventory" ON inventory FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Warehouse can manage inventory" ON inventory FOR ALL USING (has_role(auth.uid(), 'warehouse'));

-- DISTRIBUTION_CHANNELS
CREATE POLICY "Authenticated users can view distribution channels" ON distribution_channels FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage distribution channels" ON distribution_channels FOR ALL USING (has_role(auth.uid(), 'admin'));

-- ORDERS
CREATE POLICY "Sellers can view own orders" ON orders FOR SELECT USING (auth.uid() = seller_id);
CREATE POLICY "Admins can manage all orders" ON orders FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Warehouse can view orders" ON orders FOR SELECT USING (has_role(auth.uid(), 'warehouse'));
CREATE POLICY "Warehouse can update orders" ON orders FOR UPDATE USING (has_role(auth.uid(), 'warehouse'));
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = seller_id);

-- ORDER_ITEMS
CREATE POLICY "Order items follow order access" ON order_items FOR SELECT USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (orders.seller_id = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'warehouse'))));
CREATE POLICY "Users can insert order items" ON order_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.seller_id = auth.uid()));

-- NOTIFICATIONS
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- AUDIT_LOGS
CREATE POLICY "Only admins can view audit logs" ON audit_logs FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "No modifications to audit logs" ON audit_logs FOR ALL USING (false);
```

---

## Step 5: Realtime (Optional)

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.batches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
```

---

## Step 6: Storage Bucket

```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Allow public read
CREATE POLICY "Public read product images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

-- Allow authenticated uploads
CREATE POLICY "Authenticated upload product images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images');

-- Allow authenticated updates
CREATE POLICY "Authenticated update product images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'product-images');
```

---

## Step 7: Edge Functions

Copy these files to your project and deploy with `supabase functions deploy`:

### `supabase/functions/close-expired-batches/index.ts`
Already in your codebase — handles closing expired funding batches.

### `supabase/functions/create-public-order/index.ts`
Already in your codebase — handles public customer checkout.

Deploy:
```bash
supabase functions deploy close-expired-batches
supabase functions deploy create-public-order
```

---

## Step 8: Frontend Configuration

Update your `.env` file:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
VITE_SUPABASE_PROJECT_ID=YOUR_PROJECT_ID
```

Update `src/integrations/supabase/client.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
```

---

## Step 9: Create Admin User

After deploying, sign up your first user then promote to admin:

```sql
-- Find your user ID
SELECT id, email FROM auth.users WHERE email = 'your-admin@email.com';

-- Assign admin role
INSERT INTO public.user_roles (user_id, role) VALUES ('YOUR_USER_UUID', 'admin');
```

---

## Notes

- **Auth users cannot be exported** — users must re-register on the new instance
- **Storage files** (product images) must be manually re-uploaded
- **Data** can be exported as CSV from the current backend and imported via SQL `COPY` or Supabase Dashboard
- The `supabase/config.toml` in your codebase may need updating for Edge Function JWT settings (`verify_jwt = false`)
