
-- 1. Unique constraint on order_number
ALTER TABLE public.orders ADD CONSTRAINT orders_order_number_unique UNIQUE (order_number);

-- 2. Refund withdrawal function for rejected/failed withdrawals
CREATE OR REPLACE FUNCTION public.refund_withdrawal(p_transaction_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_txn transactions%ROWTYPE;
BEGIN
  -- Lock the transaction row
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

  -- Mark transaction as failed
  UPDATE transactions SET status = 'failed' WHERE id = p_transaction_id;

  -- Refund the amount back to wallet
  UPDATE wallets SET balance = balance + v_txn.amount WHERE user_id = v_txn.user_id;

  RETURN json_build_object(
    'transaction_id', p_transaction_id,
    'refunded_amount', v_txn.amount,
    'user_id', v_txn.user_id
  );
END;
$$;
