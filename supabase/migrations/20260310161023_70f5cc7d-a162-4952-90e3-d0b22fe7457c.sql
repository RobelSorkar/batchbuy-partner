
-- Notify seller when their order is first created
CREATE OR REPLACE FUNCTION public.notify_order_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.seller_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, title, message, type, reference_id)
    VALUES (NEW.seller_id,
      'নতুন অর্ডার পেয়েছেন',
      'অর্ডার ' || NEW.order_number || ' — ৳' || NEW.total_amount || ' (' || NEW.customer_name || ')',
      'order', NEW.id::text);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_order_created
AFTER INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.notify_order_created();

-- Notify user when withdrawal is approved or rejected
CREATE OR REPLACE FUNCTION public.notify_withdrawal_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF OLD.status = NEW.status THEN RETURN NEW; END IF;
  IF NEW.type != 'withdrawal' THEN RETURN NEW; END IF;

  IF NEW.status = 'completed' THEN
    INSERT INTO notifications (user_id, title, message, type, reference_id)
    VALUES (NEW.user_id, 'উত্তোলন অনুমোদিত',
      '৳' || NEW.amount || ' সফলভাবে উত্তোলন করা হয়েছে। ' || COALESCE(NEW.description, ''),
      'wallet', NEW.id::text);
  ELSIF NEW.status = 'failed' THEN
    INSERT INTO notifications (user_id, title, message, type, reference_id)
    VALUES (NEW.user_id, 'উত্তোলন বাতিল',
      '৳' || NEW.amount || ' আপনার ওয়ালেটে ফেরত দেওয়া হয়েছে।',
      'wallet', NEW.id::text);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_withdrawal_status
AFTER UPDATE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.notify_withdrawal_status();

-- Notify partners when inventory is created for their batch
CREATE OR REPLACE FUNCTION public.notify_inventory_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_participant record;
BEGIN
  IF TG_OP = 'INSERT' AND NEW.batch_id IS NOT NULL THEN
    FOR v_participant IN
      SELECT DISTINCT user_id FROM batch_participations WHERE batch_id = NEW.batch_id
    LOOP
      INSERT INTO notifications (user_id, title, message, type, reference_id)
      VALUES (v_participant.user_id, 'ইনভেন্টরি প্রস্তুত',
        NEW.product_name || ' — ' || NEW.total_stock || ' ইউনিট ওয়্যারহাউসে (' || COALESCE(NEW.warehouse_location, 'Main') || ')',
        'inventory', NEW.batch_id::text);
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_inventory_created
AFTER INSERT ON public.inventory
FOR EACH ROW EXECUTE FUNCTION public.notify_inventory_created();
