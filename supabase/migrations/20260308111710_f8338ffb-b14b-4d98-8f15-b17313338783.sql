
-- Final cleanup of remaining duplicate triggers on batches
DROP TRIGGER IF EXISTS on_batch_completed ON batches;
DROP TRIGGER IF EXISTS on_batch_fully_funded ON batches;
DROP TRIGGER IF EXISTS set_updated_at_batches ON batches;
DROP TRIGGER IF EXISTS update_batches_updated_at ON batches;

-- Cleanup duplicate wallets triggers
DROP TRIGGER IF EXISTS set_updated_at_wallets ON wallets;
DROP TRIGGER IF EXISTS trg_updated_at_wallets ON wallets;
DROP TRIGGER IF EXISTS update_wallets_updated_at ON wallets;
