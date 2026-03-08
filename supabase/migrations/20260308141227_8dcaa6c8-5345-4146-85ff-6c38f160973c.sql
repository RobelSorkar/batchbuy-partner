
-- Revoke default public execute grant on trigger functions
REVOKE ALL ON FUNCTION public.distribute_profit_on_delivery() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.sync_inventory_on_order() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.auto_close_batch() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.auto_create_inventory() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.auto_create_distribution_channels() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.validate_batch_update() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.validate_participation_update() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.audit_wallet_changes() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.audit_role_changes() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.notify_wallet_credit() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.notify_batch_status_change() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.notify_order_status_change() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.generate_tracking_number() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC;

-- Also lock down generate_order_number from anon
REVOKE ALL ON FUNCTION public.generate_order_number(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.generate_order_number(text) TO authenticated;
