
-- Restrict batch_participations UPDATE policy to only allow inventory_mode changes
-- Drop the existing broad policy and create a restrictive one
DROP POLICY IF EXISTS "Users can update own participation mode" ON public.batch_participations;

CREATE POLICY "Users can update own participation mode"
ON public.batch_participations
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  -- Only inventory_mode can change; all other fields must remain the same
  -- This is enforced by the validate_participation_update trigger as defense-in-depth
);
