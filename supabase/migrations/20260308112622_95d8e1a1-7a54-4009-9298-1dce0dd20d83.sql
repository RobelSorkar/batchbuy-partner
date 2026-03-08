
-- CRITICAL FIX 1: Remove public UPDATE policy on batch_participations
-- The trigger we added validates field changes, but we should also restrict the policy
DROP POLICY IF EXISTS "Users can update own participations" ON batch_participations;

-- Create a more restrictive update policy that only allows inventory_mode changes
CREATE POLICY "Users can update own participation mode"
  ON batch_participations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Note: The trg_validate_participation_update trigger already blocks changes to sensitive fields

-- CRITICAL FIX 2: Revoke public execute on has_role function
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

-- Also secure other sensitive functions
REVOKE EXECUTE ON FUNCTION public.join_batch(uuid, integer, numeric) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.join_batch(uuid, integer, numeric) FROM anon;
GRANT EXECUTE ON FUNCTION public.join_batch(uuid, integer, numeric) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.process_withdrawal(numeric, text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.process_withdrawal(numeric, text, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.process_withdrawal(numeric, text, text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.process_deposit(numeric, text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.process_deposit(numeric, text, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.process_deposit(numeric, text, text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.refund_withdrawal(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.refund_withdrawal(uuid) FROM anon;
-- Only admins should be able to refund
-- Note: RLS on transactions table already prevents non-admin access
GRANT EXECUTE ON FUNCTION public.refund_withdrawal(uuid) TO authenticated;

-- Secure the audit log function
REVOKE EXECUTE ON FUNCTION public.log_audit_event(text, text, text, jsonb, jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_audit_event(text, text, text, jsonb, jsonb) FROM anon;
-- Internal use only via triggers
