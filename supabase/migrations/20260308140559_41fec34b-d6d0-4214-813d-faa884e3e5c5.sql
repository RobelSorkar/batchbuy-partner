
-- Drop duplicate triggers (keep the shorter-named ones)

-- profiles: keep trg_profiles_updated_at, drop the other 2
DROP TRIGGER IF EXISTS trg_updated_at_profiles ON profiles;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

-- user_roles: keep trg_audit_role_insert (covers INSERT), drop the other 2
-- Actually these may have different events. Let's keep trg_audit_role_changes and drop duplicates.
DROP TRIGGER IF EXISTS trg_audit_role_delete ON user_roles;
DROP TRIGGER IF EXISTS trg_audit_role_insert ON user_roles;

-- batches: keep trg_notify_batch_status, drop duplicate
DROP TRIGGER IF EXISTS trg_notify_batch_status_change ON batches;

-- orders: drop duplicates, keep shorter names
DROP TRIGGER IF EXISTS trg_distribute_profit_on_delivery ON orders;
DROP TRIGGER IF EXISTS trg_notify_order_status_change ON orders;
DROP TRIGGER IF EXISTS trg_generate_tracking_number ON orders;
