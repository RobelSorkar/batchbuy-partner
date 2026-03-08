
-- ============================================
-- 1. handle_new_user: auto-create profile, wallet, role on signup
-- ============================================
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. auto_close_batch: transition to 'production' when fully funded
-- ============================================
CREATE OR REPLACE TRIGGER on_batch_fully_funded
  BEFORE UPDATE ON public.batches
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_close_batch();

-- ============================================
-- 3. auto_create_inventory: create inventory when batch completes
-- ============================================
CREATE OR REPLACE TRIGGER on_batch_completed
  AFTER UPDATE ON public.batches
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_inventory();

-- ============================================
-- 4. auto_create_distribution_channels: create channels when inventory added
-- ============================================
CREATE OR REPLACE TRIGGER on_inventory_created
  AFTER INSERT ON public.inventory
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_distribution_channels();

-- ============================================
-- 5. sync_inventory_on_order: deduct stock on delivery
-- ============================================
CREATE OR REPLACE TRIGGER on_order_delivered_sync_inventory
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_inventory_on_order();

-- ============================================
-- 6. distribute_profit_on_delivery: credit partners + dropshipper commission
-- ============================================
CREATE OR REPLACE TRIGGER on_order_delivered_distribute_profit
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.distribute_profit_on_delivery();

-- ============================================
-- 7. update_updated_at on key tables
-- ============================================
CREATE OR REPLACE TRIGGER set_updated_at_batches
  BEFORE UPDATE ON public.batches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER set_updated_at_orders
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER set_updated_at_inventory
  BEFORE UPDATE ON public.inventory
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER set_updated_at_wallets
  BEFORE UPDATE ON public.wallets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER set_updated_at_distribution_channels
  BEFORE UPDATE ON public.distribution_channels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 8. RLS: Allow users to update their own batch_participations
-- ============================================
CREATE POLICY "Users can update own participations"
  ON public.batch_participations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
