
-- CRITICAL FIX 1: Add admin check to refund_withdrawal
CREATE OR REPLACE FUNCTION public.refund_withdrawal(p_transaction_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  v_txn transactions%ROWTYPE;
BEGIN
  -- SECURITY: Only admins can refund withdrawals
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: admin role required';
  END IF;

  SELECT * INTO v_txn FROM transactions WHERE id = p_transaction_id FOR UPDATE;

  IF v_txn IS NULL THEN
    RAISE EXCEPTION 'Transaction not found';
  END IF;

  IF v_txn.type != 'withdrawal' THEN
    RAISE EXCEPTION 'Transaction is not a withdrawal';
  END IF;

  IF v_txn.status NOT IN ('pending', 'processing') THEN
    RAISE EXCEPTION 'Withdrawal cannot be refunded (status: %)', v_txn.status;
  END IF;

  UPDATE transactions SET status = 'failed' WHERE id = p_transaction_id;
  UPDATE wallets SET balance = balance + v_txn.amount WHERE user_id = v_txn.user_id;

  RETURN json_build_object(
    'transaction_id', p_transaction_id,
    'refunded_amount', v_txn.amount,
    'user_id', v_txn.user_id
  );
END;
$$;

-- CRITICAL FIX 2: Add admin check to admin_sync_batch_stats  
CREATE OR REPLACE FUNCTION public.admin_sync_batch_stats()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: admin role required';
  END IF;

  PERFORM set_config('app.calling_function', 'join_batch', true);
  
  UPDATE batches b SET
    funded_units = COALESCE((SELECT SUM(bp.units_owned) FROM batch_participations bp WHERE bp.batch_id = b.id), 0),
    partners_joined = COALESCE((SELECT COUNT(*) FROM batch_participations bp WHERE bp.batch_id = b.id), 0),
    remaining_units = b.total_quantity - COALESCE((SELECT SUM(bp.units_owned) FROM batch_participations bp WHERE bp.batch_id = b.id), 0);
  
  PERFORM set_config('app.calling_function', '', true);
END;
$$;

-- CRITICAL FIX 3: Revoke EXECUTE on trigger functions from anon and authenticated
-- These should only be invoked by triggers, not directly by users
REVOKE EXECUTE ON FUNCTION public.distribute_profit_on_delivery() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_inventory_on_order() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.auto_close_batch() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.auto_create_inventory() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.auto_create_distribution_channels() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_batch_update() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_participation_update() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.audit_wallet_changes() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.audit_role_changes() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_wallet_credit() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_batch_status_change() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_order_status_change() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_tracking_number() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;

-- CRITICAL FIX 4: Revoke anon access to generate_order_number (should be auth only)
REVOKE EXECUTE ON FUNCTION public.generate_order_number(text) FROM anon;

-- CRITICAL FIX 5: Add admin check to log_audit_event
CREATE OR REPLACE FUNCTION public.log_audit_event(p_action text, p_table_name text, p_record_id text, p_old_values jsonb DEFAULT NULL, p_new_values jsonb DEFAULT NULL)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: admin role required';
  END IF;
  INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values)
  VALUES (auth.uid(), p_action, p_table_name, p_record_id, p_old_values, p_new_values);
END;
$$;
