
-- Function to calculate wallet balance from transaction ledger
CREATE OR REPLACE FUNCTION public.calculate_ledger_balance(p_user_id uuid)
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(SUM(
    CASE
      WHEN type IN ('deposit', 'profit', 'commission', 'bonus') AND status = 'completed' THEN amount
      WHEN type = 'withdrawal' AND status IN ('pending', 'processing', 'completed') THEN -amount
      WHEN type = 'investment' AND status = 'completed' THEN -amount
      ELSE 0
    END
  ), 0)
  FROM transactions
  WHERE user_id = p_user_id;
$$;

-- Trigger function: sync wallet balance from ledger after any transaction change
CREATE OR REPLACE FUNCTION public.sync_wallet_from_ledger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid;
  v_new_balance numeric;
BEGIN
  v_user_id := COALESCE(NEW.user_id, OLD.user_id);
  
  v_new_balance := calculate_ledger_balance(v_user_id);
  
  UPDATE wallets SET balance = v_new_balance, updated_at = now()
  WHERE user_id = v_user_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger on transactions table
CREATE TRIGGER trg_sync_wallet_from_ledger
AFTER INSERT OR UPDATE OR DELETE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.sync_wallet_from_ledger();

-- Admin function to reconcile ALL wallet balances from ledger
CREATE OR REPLACE FUNCTION public.reconcile_wallet_balances()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_count integer := 0;
  v_mismatches integer := 0;
  v_wallet record;
  v_ledger_balance numeric;
BEGIN
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: admin role required';
  END IF;

  FOR v_wallet IN SELECT id, user_id, balance FROM wallets
  LOOP
    v_ledger_balance := calculate_ledger_balance(v_wallet.user_id);
    v_count := v_count + 1;
    
    IF v_wallet.balance != v_ledger_balance THEN
      v_mismatches := v_mismatches + 1;
      
      -- Log the discrepancy
      INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values)
      VALUES (auth.uid(), 'balance_reconciliation', 'wallets', v_wallet.id::text,
        jsonb_build_object('stored_balance', v_wallet.balance),
        jsonb_build_object('ledger_balance', v_ledger_balance, 'difference', v_ledger_balance - v_wallet.balance));
      
      -- Fix the balance
      UPDATE wallets SET balance = v_ledger_balance, updated_at = now() WHERE id = v_wallet.id;
    END IF;
  END LOOP;

  RETURN json_build_object('wallets_checked', v_count, 'mismatches_fixed', v_mismatches);
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.calculate_ledger_balance(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reconcile_wallet_balances() TO authenticated;
