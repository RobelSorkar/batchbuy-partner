
-- Audit trigger: batch participation (join/top-up)
CREATE OR REPLACE FUNCTION public.audit_batch_participation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values)
    VALUES (NEW.user_id, 'batch_joined', 'batch_participations', NEW.id::text,
      jsonb_build_object('batch_id', NEW.batch_id, 'units_owned', NEW.units_owned, 'total_invested', NEW.total_invested, 'inventory_mode', NEW.inventory_mode));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values)
    VALUES (NEW.user_id,
      CASE WHEN NEW.units_owned != OLD.units_owned THEN 'batch_topup' ELSE 'participation_updated' END,
      'batch_participations', NEW.id::text,
      jsonb_build_object('units_owned', OLD.units_owned, 'total_invested', OLD.total_invested, 'inventory_mode', OLD.inventory_mode),
      jsonb_build_object('units_owned', NEW.units_owned, 'total_invested', NEW.total_invested, 'inventory_mode', NEW.inventory_mode));
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_audit_batch_participation
AFTER INSERT OR UPDATE ON public.batch_participations
FOR EACH ROW EXECUTE FUNCTION public.audit_batch_participation();

-- Audit trigger: order creation and status changes
CREATE OR REPLACE FUNCTION public.audit_order_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values)
    VALUES (COALESCE(NEW.seller_id, auth.uid()), 'order_created', 'orders', NEW.id::text,
      jsonb_build_object('order_number', NEW.order_number, 'channel', NEW.channel, 'total_amount', NEW.total_amount, 'status', NEW.status, 'customer_name', NEW.customer_name, 'batch_id', NEW.batch_id));
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values)
    VALUES (COALESCE(auth.uid(), NEW.seller_id), 'order_status_changed', 'orders', NEW.id::text,
      jsonb_build_object('status', OLD.status),
      jsonb_build_object('status', NEW.status, 'order_number', NEW.order_number, 'tracking_number', NEW.tracking_number));
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_audit_order_changes
AFTER INSERT OR UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.audit_order_changes();

-- Audit trigger: inventory updates
CREATE OR REPLACE FUNCTION public.audit_inventory_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values)
    VALUES (auth.uid(), 'inventory_created', 'inventory', NEW.id::text,
      jsonb_build_object('product_name', NEW.product_name, 'batch_id', NEW.batch_id, 'total_stock', NEW.total_stock, 'warehouse_location', NEW.warehouse_location));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values)
    VALUES (COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid), 'inventory_updated', 'inventory', NEW.id::text,
      jsonb_build_object('total_stock', OLD.total_stock, 'sold_units', OLD.sold_units, 'allocated_stock', OLD.allocated_stock, 'status', OLD.status),
      jsonb_build_object('total_stock', NEW.total_stock, 'sold_units', NEW.sold_units, 'allocated_stock', NEW.allocated_stock, 'status', NEW.status));
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_audit_inventory_changes
AFTER INSERT OR UPDATE ON public.inventory
FOR EACH ROW EXECUTE FUNCTION public.audit_inventory_changes();

-- Audit trigger: withdrawal approval/rejection (transaction status changes)
CREATE OR REPLACE FUNCTION public.audit_transaction_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values)
    VALUES (COALESCE(auth.uid(), NEW.user_id),
      CASE
        WHEN NEW.type = 'withdrawal' AND NEW.status = 'completed' THEN 'withdrawal_approved'
        WHEN NEW.type = 'withdrawal' AND NEW.status = 'failed' THEN 'withdrawal_rejected'
        ELSE 'transaction_status_changed'
      END,
      'transactions', NEW.id::text,
      jsonb_build_object('status', OLD.status, 'type', OLD.type, 'amount', OLD.amount),
      jsonb_build_object('status', NEW.status, 'user_id', NEW.user_id, 'amount', NEW.amount));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_audit_transaction_status
AFTER UPDATE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.audit_transaction_status();

-- Index for efficient log queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs (action, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs (user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON audit_logs (table_name, record_id);
