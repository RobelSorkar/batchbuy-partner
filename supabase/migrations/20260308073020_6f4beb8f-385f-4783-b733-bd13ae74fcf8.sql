
-- ============================================================
-- 1. FIX CRITICAL RLS: Remove self-insert on user_roles
-- ============================================================
DROP POLICY IF EXISTS "Users can insert own role" ON public.user_roles;

-- ============================================================
-- 2. FIX CRITICAL RLS: Remove direct wallet UPDATE by users
-- ============================================================
DROP POLICY IF EXISTS "Users can update own wallet" ON public.wallets;

-- ============================================================
-- 3. FIX CRITICAL RLS: Remove direct transaction INSERT by users
--    (transactions should only be created by SECURITY DEFINER functions)
-- ============================================================
DROP POLICY IF EXISTS "Users can create own transactions" ON public.transactions;

-- ============================================================
-- 4. FIX PROFILE EXPOSURE: Restrict profile SELECT to own profile + admins
-- ============================================================
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- 5. ATOMIC WALLET WITHDRAWAL (SECURITY DEFINER)
-- ============================================================
CREATE OR REPLACE FUNCTION public.process_withdrawal(
  p_amount numeric,
  p_method text,
  p_account text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_wallet wallets%ROWTYPE;
  v_txn_id uuid;
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
  
  -- Create transaction record
  INSERT INTO transactions (user_id, type, amount, description, status)
  VALUES (auth.uid(), 'withdrawal', p_amount, 
    'Withdrawal to ' || p_method || ' — ' || p_account, 'pending')
  RETURNING id INTO v_txn_id;
  
  -- Deduct from wallet atomically
  UPDATE wallets SET balance = balance - p_amount WHERE user_id = auth.uid();
  
  RETURN json_build_object('transaction_id', v_txn_id, 'amount', p_amount, 'new_balance', v_wallet.balance - p_amount);
END;
$$;

-- ============================================================
-- 6. BATCH AUTO-CLOSE TRIGGER (when remaining_units = 0)
-- ============================================================
CREATE OR REPLACE FUNCTION public.auto_close_batch()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.remaining_units = 0 AND OLD.remaining_units > 0 THEN
    NEW.status = 'production';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_close_batch ON public.batches;
CREATE TRIGGER trg_auto_close_batch
  BEFORE UPDATE ON public.batches
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_close_batch();

-- ============================================================
-- 7. AUTO-CREATE INVENTORY when batch status → 'completed'
-- ============================================================
CREATE OR REPLACE FUNCTION public.auto_create_inventory()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

DROP TRIGGER IF EXISTS trg_auto_create_inventory ON public.batches;
CREATE TRIGGER trg_auto_create_inventory
  AFTER UPDATE ON public.batches
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_inventory();

-- ============================================================
-- 8. ORDER → INVENTORY STOCK SYNC (deduct on fulfillment)
-- ============================================================
CREATE OR REPLACE FUNCTION public.sync_inventory_on_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_item record;
BEGIN
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' AND NEW.batch_id IS NOT NULL THEN
    -- Sum order items and deduct from inventory
    FOR v_item IN SELECT product_name, quantity FROM order_items WHERE order_id = NEW.id
    LOOP
      UPDATE inventory 
      SET sold_units = sold_units + v_item.quantity,
          total_stock = total_stock - v_item.quantity
      WHERE batch_id = NEW.batch_id AND product_name = v_item.product_name;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_inventory_on_order ON public.orders;
CREATE TRIGGER trg_sync_inventory_on_order
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_inventory_on_order();

-- ============================================================
-- 9. updated_at triggers (missing from schema)
-- ============================================================
DROP TRIGGER IF EXISTS trg_wallets_updated_at ON public.wallets;
CREATE TRIGGER trg_wallets_updated_at
  BEFORE UPDATE ON public.wallets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_inventory_updated_at ON public.inventory;
CREATE TRIGGER trg_inventory_updated_at
  BEFORE UPDATE ON public.inventory
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_orders_updated_at ON public.orders;
CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_batches_updated_at ON public.batches;
CREATE TRIGGER trg_batches_updated_at
  BEFORE UPDATE ON public.batches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
