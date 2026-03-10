
-- Order fraud detection function
CREATE OR REPLACE FUNCTION public.check_order_fraud(
  p_customer_phone text,
  p_customer_name text,
  p_customer_address text,
  p_batch_id uuid,
  p_quantity integer
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_recent_same_phone integer;
  v_recent_same_address integer;
  v_pending_same_phone integer;
  v_duplicate_exact integer;
BEGIN
  -- 1. Exact duplicate check: same phone + same batch + pending/confirmed in last 24h
  SELECT COUNT(*) INTO v_duplicate_exact
  FROM orders
  WHERE customer_phone = p_customer_phone
    AND batch_id = p_batch_id
    AND status IN ('pending', 'confirmed', 'processing')
    AND created_at > now() - interval '24 hours';

  IF v_duplicate_exact > 0 THEN
    RETURN json_build_object('blocked', true, 'reason', 'duplicate_order',
      'message', 'এই নম্বর থেকে ইতিমধ্যে এই পণ্যের অর্ডার করা হয়েছে। অনুগ্রহ করে ২৪ ঘণ্টা পর আবার চেষ্টা করুন।');
  END IF;

  -- 2. Rate limit: max 3 orders from same phone in 1 hour
  SELECT COUNT(*) INTO v_recent_same_phone
  FROM orders
  WHERE customer_phone = p_customer_phone
    AND created_at > now() - interval '1 hour';

  IF v_recent_same_phone >= 3 THEN
    RETURN json_build_object('blocked', true, 'reason', 'rate_limit_phone',
      'message', 'এই নম্বর থেকে অনেক অর্ডার করা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর চেষ্টা করুন।');
  END IF;

  -- 3. Rate limit: max 5 orders from same address in 1 hour
  SELECT COUNT(*) INTO v_recent_same_address
  FROM orders
  WHERE LOWER(TRIM(customer_address)) = LOWER(TRIM(p_customer_address))
    AND created_at > now() - interval '1 hour';

  IF v_recent_same_address >= 5 THEN
    RETURN json_build_object('blocked', true, 'reason', 'rate_limit_address',
      'message', 'এই ঠিকানা থেকে অনেক অর্ডার করা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর চেষ্টা করুন।');
  END IF;

  -- 4. Suspicious: too many pending orders from same phone (never completed)
  SELECT COUNT(*) INTO v_pending_same_phone
  FROM orders
  WHERE customer_phone = p_customer_phone
    AND status IN ('pending', 'cancelled')
    AND created_at > now() - interval '7 days';

  IF v_pending_same_phone >= 5 THEN
    RETURN json_build_object('blocked', true, 'reason', 'suspicious_pattern',
      'message', 'এই নম্বর থেকে অনেক অর্ডার বাতিল/অসম্পূর্ণ হয়েছে। অনুগ্রহ করে সাহায্যের জন্য যোগাযোগ করুন।');
  END IF;

  -- 5. Suspicious: bulk quantity from public checkout
  IF p_quantity > 10 THEN
    RETURN json_build_object('blocked', true, 'reason', 'bulk_quantity',
      'message', 'সর্বোচ্চ ১০টি পণ্য একসাথে অর্ডার করা যায়। বেশি পরিমাণের জন্য যোগাযোগ করুন।');
  END IF;

  RETURN json_build_object('blocked', false);
END;
$$;

-- Allow edge functions (service role) and authenticated users to call it
GRANT EXECUTE ON FUNCTION public.check_order_fraud(text, text, text, uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_order_fraud(text, text, text, uuid, integer) TO service_role;

-- Index for fraud check queries
CREATE INDEX IF NOT EXISTS idx_orders_phone_created ON orders (customer_phone, created_at);
CREATE INDEX IF NOT EXISTS idx_orders_batch_phone ON orders (batch_id, customer_phone, status);
