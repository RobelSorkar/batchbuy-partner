
DROP POLICY IF EXISTS "Partners can create batches" ON public.batches;

CREATE POLICY "Only admins can create batches"
ON public.batches
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
