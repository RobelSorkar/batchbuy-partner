
-- Clean up remaining duplicate triggers on inventory
DROP TRIGGER IF EXISTS on_inventory_created ON inventory;
DROP TRIGGER IF EXISTS set_updated_at_inventory ON inventory;
DROP TRIGGER IF EXISTS trg_updated_at_inventory ON inventory;
DROP TRIGGER IF EXISTS update_inventory_updated_at ON inventory;

-- Clean up duplicate triggers on batches
DROP TRIGGER IF EXISTS trg_batches_updated_at ON batches;
DROP TRIGGER IF EXISTS trg_updated_at_batches ON batches;
DROP TRIGGER IF EXISTS trg_auto_close_batch ON batches;
DROP TRIGGER IF EXISTS trg_auto_create_inventory ON batches;
DROP TRIGGER IF EXISTS trg_updated_at_batches ON batches;

-- Keep only properly named single triggers
-- Batches: trg_auto_close_batch, trg_auto_create_inventory, trg_batches_updated_at, trg_notify_batch_status
CREATE TRIGGER trg_batches_updated_at
  BEFORE UPDATE ON batches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_auto_close_batch
  BEFORE UPDATE ON batches
  FOR EACH ROW
  EXECUTE FUNCTION auto_close_batch();

CREATE TRIGGER trg_auto_create_inventory
  AFTER UPDATE ON batches
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status IS DISTINCT FROM 'completed')
  EXECUTE FUNCTION auto_create_inventory();

-- Clean up duplicate wallets triggers
DROP TRIGGER IF EXISTS trg_wallets_updated_at ON wallets;
CREATE TRIGGER trg_wallets_updated_at
  BEFORE UPDATE ON wallets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
