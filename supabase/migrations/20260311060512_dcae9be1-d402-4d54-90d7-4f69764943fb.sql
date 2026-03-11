
CREATE OR REPLACE FUNCTION public.notify_dropshippers_new_product()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  v_dropshipper record;
BEGIN
  -- Only fire when batch enters production (product becomes sellable)
  IF NEW.status = 'production' AND OLD.status != 'production' THEN
    FOR v_dropshipper IN
      SELECT DISTINCT user_id FROM user_roles WHERE role = 'dropshipper'
    LOOP
      INSERT INTO notifications (user_id, title, message, type, reference_id)
      VALUES (
        v_dropshipper.user_id,
        'নতুন প্রোডাক্ট সেল করার জন্য প্রস্তুত!',
        NEW.product_name || ' এখন সেল করা যাচ্ছে। প্রোডাক্ট ব্রাউজ করে অর্ডার নিন!',
        'product',
        NEW.id::text
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_dropshippers_new_product
  AFTER UPDATE ON batches
  FOR EACH ROW
  EXECUTE FUNCTION notify_dropshippers_new_product();
