
-- SECURITY FIX 7: Add input validation to edge function by requiring auth in config
-- Already handled via verify_jwt = false with manual validation in code

-- SECURITY FIX 8: Add audit logging table for sensitive operations
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  table_name text,
  record_id text,
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- No one can modify audit logs via API
CREATE POLICY "No modifications to audit logs"
  ON public.audit_logs FOR ALL
  USING (false);

-- SECURITY FIX 9: Create audit logging function
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_action text,
  p_table_name text,
  p_record_id text,
  p_old_values jsonb DEFAULT NULL,
  p_new_values jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values)
  VALUES (auth.uid(), p_action, p_table_name, p_record_id, p_old_values, p_new_values);
END;
$function$;

-- SECURITY FIX 10: Add audit trigger for wallet changes
CREATE OR REPLACE FUNCTION public.audit_wallet_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.balance != NEW.balance THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values)
    VALUES (
      NEW.user_id, 
      'balance_change', 
      'wallets', 
      NEW.id::text,
      jsonb_build_object('balance', OLD.balance),
      jsonb_build_object('balance', NEW.balance, 'change', NEW.balance - OLD.balance)
    );
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_audit_wallet_changes ON wallets;
CREATE TRIGGER trg_audit_wallet_changes
  AFTER UPDATE ON wallets
  FOR EACH ROW
  EXECUTE FUNCTION audit_wallet_changes();

-- SECURITY FIX 11: Add audit trigger for role changes
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values)
    VALUES (auth.uid(), 'role_assigned', 'user_roles', NEW.id::text, 
      jsonb_build_object('target_user', NEW.user_id, 'role', NEW.role));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values)
    VALUES (auth.uid(), 'role_removed', 'user_roles', OLD.id::text,
      jsonb_build_object('target_user', OLD.user_id, 'role', OLD.role));
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$function$;

DROP TRIGGER IF EXISTS trg_audit_role_changes ON user_roles;
CREATE TRIGGER trg_audit_role_changes
  AFTER INSERT OR DELETE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION audit_role_changes();
