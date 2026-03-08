
-- Distribution channels table: per-product, per-channel pricing and allocation
CREATE TABLE public.distribution_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id uuid REFERENCES public.inventory(id) ON DELETE CASCADE NOT NULL,
  channel text NOT NULL CHECK (channel IN ('platform', 'retail', 'dropshipper', 'distributor')),
  enabled boolean NOT NULL DEFAULT true,
  price numeric NOT NULL DEFAULT 0,
  min_price numeric NOT NULL DEFAULT 0,
  max_price numeric NOT NULL DEFAULT 0,
  allocated_stock integer NOT NULL DEFAULT 0,
  sold_units integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (inventory_id, channel)
);

ALTER TABLE public.distribution_channels ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view distribution channels
CREATE POLICY "Authenticated users can view distribution channels"
  ON public.distribution_channels FOR SELECT
  USING (true);

-- Admins can manage distribution channels
CREATE POLICY "Admins can manage distribution channels"
  ON public.distribution_channels FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger
CREATE TRIGGER trg_distribution_channels_updated_at
  BEFORE UPDATE ON public.distribution_channels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create distribution channels when inventory is created
CREATE OR REPLACE FUNCTION public.auto_create_distribution_channels()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_batch batches%ROWTYPE;
  v_prices record;
  v_map numeric;
BEGIN
  -- Get batch info for pricing
  SELECT * INTO v_batch FROM batches WHERE id = NEW.batch_id;
  
  IF v_batch IS NOT NULL THEN
    v_map := v_batch.production_cost_per_unit * 1.2;
    
    -- Create all 4 channel entries with computed pricing
    INSERT INTO distribution_channels (inventory_id, channel, enabled, price, min_price, max_price, allocated_stock)
    VALUES
      (NEW.id, 'platform', true, v_batch.retail_price, v_map, v_batch.retail_price, ROUND(NEW.total_stock * 0.2)),
      (NEW.id, 'retail', true, ROUND(v_batch.retail_price * 0.85), v_map, v_batch.retail_price, ROUND(NEW.total_stock * 0.3)),
      (NEW.id, 'dropshipper', true, ROUND(v_batch.retail_price * 0.65), v_map, ROUND(v_batch.retail_price * 0.85), ROUND(NEW.total_stock * 0.3)),
      (NEW.id, 'distributor', true, ROUND(v_batch.retail_price * 0.55), v_map, ROUND(v_batch.retail_price * 0.65), ROUND(NEW.total_stock * 0.2))
    ON CONFLICT (inventory_id, channel) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auto_create_distribution_channels
  AFTER INSERT ON public.inventory
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_distribution_channels();
