
-- ============================================================
-- SECURITY AUDIT: Revoke PUBLIC access + restore triggers
-- ============================================================

-- 1. REVOKE PUBLIC execute on sensitive functions, grant only to authenticated
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.join_batch(uuid, integer, numeric) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.join_batch(uuid, integer, numeric) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.process_withdrawal(numeric, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.process_withdrawal(numeric, text, text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.process_deposit(numeric, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.process_deposit(numeric, text, text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.refund_withdrawal(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.refund_withdrawal(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.log_audit_event(text, text, text, jsonb, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.log_audit_event(text, text, text, jsonb, jsonb) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.admin_sync_batch_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_sync_batch_stats() TO authenticated;

-- 2. DROP and RE-CREATE all triggers to ensure they exist

-- batches triggers
DROP TRIGGER IF EXISTS trg_auto_close_batch ON batches;
CREATE TRIGGER trg_auto_close_batch BEFORE UPDATE ON batches FOR EACH ROW EXECUTE FUNCTION auto_close_batch();

DROP TRIGGER IF EXISTS trg_validate_batch_update ON batches;
CREATE TRIGGER trg_validate_batch_update BEFORE UPDATE ON batches FOR EACH ROW EXECUTE FUNCTION validate_batch_update();

DROP TRIGGER IF EXISTS trg_batches_updated_at ON batches;
CREATE TRIGGER trg_batches_updated_at BEFORE UPDATE ON batches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_auto_create_inventory ON batches;
CREATE TRIGGER trg_auto_create_inventory AFTER UPDATE ON batches FOR EACH ROW EXECUTE FUNCTION auto_create_inventory();

DROP TRIGGER IF EXISTS trg_notify_batch_status_change ON batches;
CREATE TRIGGER trg_notify_batch_status_change AFTER UPDATE ON batches FOR EACH ROW EXECUTE FUNCTION notify_batch_status_change();

-- batch_participations triggers
DROP TRIGGER IF EXISTS trg_validate_participation_update ON batch_participations;
CREATE TRIGGER trg_validate_participation_update BEFORE UPDATE ON batch_participations FOR EACH ROW EXECUTE FUNCTION validate_participation_update();

-- inventory triggers
DROP TRIGGER IF EXISTS trg_auto_create_distribution_channels ON inventory;
CREATE TRIGGER trg_auto_create_distribution_channels AFTER INSERT ON inventory FOR EACH ROW EXECUTE FUNCTION auto_create_distribution_channels();

DROP TRIGGER IF EXISTS trg_inventory_updated_at ON inventory;
CREATE TRIGGER trg_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- distribution_channels triggers
DROP TRIGGER IF EXISTS trg_distribution_channels_updated_at ON distribution_channels;
CREATE TRIGGER trg_distribution_channels_updated_at BEFORE UPDATE ON distribution_channels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- orders triggers
DROP TRIGGER IF EXISTS trg_sync_inventory_on_order ON orders;
CREATE TRIGGER trg_sync_inventory_on_order AFTER UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION sync_inventory_on_order();

DROP TRIGGER IF EXISTS trg_distribute_profit_on_delivery ON orders;
CREATE TRIGGER trg_distribute_profit_on_delivery AFTER UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION distribute_profit_on_delivery();

DROP TRIGGER IF EXISTS trg_generate_tracking_number ON orders;
CREATE TRIGGER trg_generate_tracking_number BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION generate_tracking_number();

DROP TRIGGER IF EXISTS trg_notify_order_status_change ON orders;
CREATE TRIGGER trg_notify_order_status_change AFTER UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION notify_order_status_change();

DROP TRIGGER IF EXISTS trg_orders_updated_at ON orders;
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- transactions triggers
DROP TRIGGER IF EXISTS trg_notify_wallet_credit ON transactions;
CREATE TRIGGER trg_notify_wallet_credit AFTER INSERT ON transactions FOR EACH ROW EXECUTE FUNCTION notify_wallet_credit();

-- wallets triggers
DROP TRIGGER IF EXISTS trg_audit_wallet_changes ON wallets;
CREATE TRIGGER trg_audit_wallet_changes AFTER UPDATE ON wallets FOR EACH ROW EXECUTE FUNCTION audit_wallet_changes();

DROP TRIGGER IF EXISTS trg_wallets_updated_at ON wallets;
CREATE TRIGGER trg_wallets_updated_at BEFORE UPDATE ON wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- user_roles triggers
DROP TRIGGER IF EXISTS trg_audit_role_insert ON user_roles;
CREATE TRIGGER trg_audit_role_insert AFTER INSERT ON user_roles FOR EACH ROW EXECUTE FUNCTION audit_role_changes();

DROP TRIGGER IF EXISTS trg_audit_role_delete ON user_roles;
CREATE TRIGGER trg_audit_role_delete AFTER DELETE ON user_roles FOR EACH ROW EXECUTE FUNCTION audit_role_changes();

-- profiles triggers
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
