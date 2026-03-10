
-- Remove duplicate unique constraints (they're constraints, not just indexes)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_unique;
ALTER TABLE public.wallets DROP CONSTRAINT IF EXISTS wallets_user_id_unique;
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_order_number_unique;
