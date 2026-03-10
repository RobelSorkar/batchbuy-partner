
-- Drop existing triggers first to avoid conflicts
DROP TRIGGER IF EXISTS trg_generate_tracking_number ON public.orders;
DROP TRIGGER IF EXISTS trg_notify_order_status_change ON public.orders;
DROP TRIGGER IF EXISTS trg_sync_inventory_on_order ON public.orders;
DROP TRIGGER IF EXISTS trg_distribute_profit_on_delivery ON public.orders;
DROP TRIGGER IF EXISTS trg_orders_updated_at ON public.orders;
DROP TRIGGER IF EXISTS trg_auto_close_batch ON public.batches;
DROP TRIGGER IF EXISTS trg_validate_batch_update ON public.batches;
DROP TRIGGER IF EXISTS trg_notify_batch_status_change ON public.batches;
DROP TRIGGER IF EXISTS trg_refund_cancelled_batch ON public.batches;
DROP TRIGGER IF EXISTS trg_batches_updated_at ON public.batches;
DROP TRIGGER IF EXISTS trg_auto_create_distribution_channels ON public.inventory;
DROP TRIGGER IF EXISTS trg_inventory_updated_at ON public.inventory;
DROP TRIGGER IF EXISTS trg_validate_participation_update ON public.batch_participations;
DROP TRIGGER IF EXISTS trg_audit_wallet_changes ON public.wallets;
DROP TRIGGER IF EXISTS trg_wallets_updated_at ON public.wallets;
DROP TRIGGER IF EXISTS trg_notify_wallet_credit ON public.transactions;
DROP TRIGGER IF EXISTS trg_audit_role_changes ON public.user_roles;
DROP TRIGGER IF EXISTS trg_distribution_channels_updated_at ON public.distribution_channels;

-- Orders table triggers
CREATE TRIGGER trg_generate_tracking_number
  BEFORE UPDATE ON public.orders FOR EACH ROW
  EXECUTE FUNCTION public.generate_tracking_number();

CREATE TRIGGER trg_notify_order_status_change
  AFTER UPDATE ON public.orders FOR EACH ROW
  EXECUTE FUNCTION public.notify_order_status_change();

CREATE TRIGGER trg_sync_inventory_on_order
  AFTER UPDATE ON public.orders FOR EACH ROW
  EXECUTE FUNCTION public.sync_inventory_on_order();

CREATE TRIGGER trg_distribute_profit_on_delivery
  AFTER UPDATE ON public.orders FOR EACH ROW
  EXECUTE FUNCTION public.distribute_profit_on_delivery();

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON public.orders FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Batches triggers
CREATE TRIGGER trg_auto_close_batch
  BEFORE UPDATE ON public.batches FOR EACH ROW
  EXECUTE FUNCTION public.auto_close_batch();

CREATE TRIGGER trg_validate_batch_update
  BEFORE UPDATE ON public.batches FOR EACH ROW
  EXECUTE FUNCTION public.validate_batch_update();

CREATE TRIGGER trg_notify_batch_status_change
  AFTER UPDATE ON public.batches FOR EACH ROW
  EXECUTE FUNCTION public.notify_batch_status_change();

CREATE TRIGGER trg_refund_cancelled_batch
  AFTER UPDATE ON public.batches FOR EACH ROW
  EXECUTE FUNCTION public.refund_cancelled_batch();

CREATE TRIGGER trg_batches_updated_at
  BEFORE UPDATE ON public.batches FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inventory triggers
CREATE TRIGGER trg_auto_create_distribution_channels
  AFTER INSERT ON public.inventory FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_distribution_channels();

CREATE TRIGGER trg_inventory_updated_at
  BEFORE UPDATE ON public.inventory FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Batch participations
CREATE TRIGGER trg_validate_participation_update
  BEFORE UPDATE ON public.batch_participations FOR EACH ROW
  EXECUTE FUNCTION public.validate_participation_update();

-- Wallets
CREATE TRIGGER trg_audit_wallet_changes
  AFTER UPDATE ON public.wallets FOR EACH ROW
  EXECUTE FUNCTION public.audit_wallet_changes();

CREATE TRIGGER trg_wallets_updated_at
  BEFORE UPDATE ON public.wallets FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Transactions
CREATE TRIGGER trg_notify_wallet_credit
  AFTER INSERT ON public.transactions FOR EACH ROW
  EXECUTE FUNCTION public.notify_wallet_credit();

-- User roles
CREATE TRIGGER trg_audit_role_changes
  AFTER INSERT OR DELETE ON public.user_roles FOR EACH ROW
  EXECUTE FUNCTION public.audit_role_changes();

-- Distribution channels
CREATE TRIGGER trg_distribution_channels_updated_at
  BEFORE UPDATE ON public.distribution_channels FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
