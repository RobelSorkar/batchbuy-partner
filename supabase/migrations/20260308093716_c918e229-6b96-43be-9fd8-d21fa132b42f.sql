
-- Drop existing triggers to avoid conflicts
DROP TRIGGER IF EXISTS trg_auto_close_batch ON public.batches;
DROP TRIGGER IF EXISTS trg_auto_create_inventory ON public.batches;
DROP TRIGGER IF EXISTS trg_auto_create_distribution_channels ON public.inventory;
DROP TRIGGER IF EXISTS trg_sync_inventory_on_order ON public.orders;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS trg_updated_at_batches ON public.batches;
DROP TRIGGER IF EXISTS trg_updated_at_inventory ON public.inventory;
DROP TRIGGER IF EXISTS trg_updated_at_orders ON public.orders;
DROP TRIGGER IF EXISTS trg_updated_at_wallets ON public.wallets;
DROP TRIGGER IF EXISTS trg_updated_at_distribution_channels ON public.distribution_channels;
DROP TRIGGER IF EXISTS trg_updated_at_profiles ON public.profiles;

-- Re-create all triggers
CREATE TRIGGER trg_auto_close_batch BEFORE UPDATE ON public.batches FOR EACH ROW EXECUTE FUNCTION public.auto_close_batch();
CREATE TRIGGER trg_auto_create_inventory AFTER UPDATE ON public.batches FOR EACH ROW EXECUTE FUNCTION public.auto_create_inventory();
CREATE TRIGGER trg_auto_create_distribution_channels AFTER INSERT ON public.inventory FOR EACH ROW EXECUTE FUNCTION public.auto_create_distribution_channels();
CREATE TRIGGER trg_sync_inventory_on_order AFTER UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.sync_inventory_on_order();
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
CREATE TRIGGER trg_updated_at_batches BEFORE UPDATE ON public.batches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_updated_at_inventory BEFORE UPDATE ON public.inventory FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_updated_at_orders BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_updated_at_wallets BEFORE UPDATE ON public.wallets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_updated_at_distribution_channels BEFORE UPDATE ON public.distribution_channels FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_updated_at_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
