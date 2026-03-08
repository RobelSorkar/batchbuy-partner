
-- Add missing unique constraints and FK for notifications
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_user_id_unique,
  ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);

ALTER TABLE wallets
  DROP CONSTRAINT IF EXISTS wallets_user_id_unique,
  ADD CONSTRAINT wallets_user_id_unique UNIQUE (user_id);

ALTER TABLE notifications
  DROP CONSTRAINT IF EXISTS notifications_user_id_fkey,
  ADD CONSTRAINT notifications_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add index on audit_logs for table_name lookups
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
