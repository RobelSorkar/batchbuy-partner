
-- Fix: Restrict batches, inventory, distribution_channels to authenticated users only

DROP POLICY IF EXISTS "Anyone can view batches" ON public.batches;
CREATE POLICY "Authenticated users can view batches" ON public.batches FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can view inventory" ON public.inventory;
CREATE POLICY "Authenticated users can view inventory" ON public.inventory FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can view distribution channels" ON public.distribution_channels;
CREATE POLICY "Authenticated users can view distribution channels" ON public.distribution_channels FOR SELECT
  USING (auth.uid() IS NOT NULL);
