
-- Remove duplicate triggers that cause 2× execution
DROP TRIGGER IF EXISTS trg_distribute_profit ON public.orders;
DROP TRIGGER IF EXISTS trg_notify_batch_status ON public.batches;
DROP TRIGGER IF EXISTS trg_generate_tracking ON public.orders;
DROP TRIGGER IF EXISTS trg_notify_order_status ON public.orders;
