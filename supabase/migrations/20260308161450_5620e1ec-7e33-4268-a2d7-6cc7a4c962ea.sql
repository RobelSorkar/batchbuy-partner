
CREATE OR REPLACE FUNCTION public.generate_order_number(p_channel text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_prefix text;
  v_seq bigint;
BEGIN
  v_seq := nextval('public.order_number_seq');
  
  CASE p_channel
    WHEN 'dropshipper' THEN v_prefix := 'DO';
    WHEN 'dropship' THEN v_prefix := 'DO';
    WHEN 'platform' THEN v_prefix := 'PO';
    WHEN 'retail' THEN v_prefix := 'RO';
    WHEN 'distributor' THEN v_prefix := 'DI';
    ELSE v_prefix := 'OR';
  END CASE;
  
  RETURN v_prefix || '-' || LPAD(v_seq::text, 6, '0');
END;
$function$;
