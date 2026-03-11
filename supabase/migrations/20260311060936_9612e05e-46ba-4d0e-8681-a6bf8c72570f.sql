
ALTER TABLE public.orders DROP CONSTRAINT orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check CHECK (status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'processing'::text, 'packed'::text, 'ready'::text, 'shipped'::text, 'out_for_delivery'::text, 'delivered'::text, 'returned'::text, 'cancelled'::text]));
