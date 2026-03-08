
-- Fix: batch status trigger should be on batches table, not orders
DROP TRIGGER IF EXISTS trg_notify_batch_status ON public.orders;

CREATE TRIGGER trg_notify_batch_status
  AFTER UPDATE ON public.batches
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_batch_status_change();
