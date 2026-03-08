
-- 1. Notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  read boolean NOT NULL DEFAULT false,
  reference_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- 2. Add tracking_number to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_number text;

-- 3. Trigger: create notification on order status change
CREATE OR REPLACE FUNCTION public.notify_order_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_title text;
  v_message text;
  v_type text := 'order';
BEGIN
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  v_title := 'Order ' || NEW.order_number || ' Updated';
  v_message := 'Status changed to ' || NEW.status;

  IF NEW.status = 'shipped' AND NEW.tracking_number IS NOT NULL THEN
    v_message := v_message || '. Tracking: ' || NEW.tracking_number;
  END IF;

  -- Notify seller
  IF NEW.seller_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, title, message, type, reference_id)
    VALUES (NEW.seller_id, v_title, v_message, v_type, NEW.id::text);
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_order_status
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_order_status_change();

-- 4. Trigger: generate tracking number when order moves to shipped
CREATE OR REPLACE FUNCTION public.generate_tracking_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'shipped' AND (OLD.status != 'shipped' OR OLD.status IS NULL) AND NEW.tracking_number IS NULL THEN
    NEW.tracking_number := 'TRK-' || UPPER(SUBSTRING(gen_random_uuid()::text FROM 1 FOR 8));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_generate_tracking
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_tracking_number();

-- 5. Notify on batch status change (for partners)
CREATE OR REPLACE FUNCTION public.notify_batch_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_participant record;
  v_title text;
  v_message text;
BEGIN
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  v_title := 'Batch ' || NEW.batch_name || ' Updated';
  v_message := 'Status changed to ' || NEW.status;

  FOR v_participant IN
    SELECT DISTINCT user_id FROM batch_participations WHERE batch_id = NEW.id
  LOOP
    INSERT INTO notifications (user_id, title, message, type, reference_id)
    VALUES (v_participant.user_id, v_title, v_message, 'batch', NEW.id::text);
  END LOOP;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_batch_status
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_batch_status_change();

-- 6. Notify on profit distribution (wallet credit)
CREATE OR REPLACE FUNCTION public.notify_wallet_credit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.type IN ('profit', 'commission') AND NEW.status = 'completed' THEN
    INSERT INTO notifications (user_id, title, message, type, reference_id)
    VALUES (NEW.user_id, 
      CASE NEW.type WHEN 'profit' THEN 'Profit Received' ELSE 'Commission Earned' END,
      '৳' || NEW.amount::text || ' credited — ' || COALESCE(NEW.description, ''),
      'wallet', NEW.id::text);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_wallet_credit
  AFTER INSERT ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_wallet_credit();

-- 7. Storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: anyone can view, authenticated can upload
CREATE POLICY "Anyone can view product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can update own product images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can delete own product images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images');
