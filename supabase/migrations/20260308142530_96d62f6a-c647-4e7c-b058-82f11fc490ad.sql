-- Remove duplicate updated_at triggers on distribution_channels
-- Keep trg_distribution_channels_updated_at, drop the duplicates
DROP TRIGGER IF EXISTS set_updated_at_distribution_channels ON public.distribution_channels;
DROP TRIGGER IF EXISTS trg_updated_at_distribution_channels ON public.distribution_channels;