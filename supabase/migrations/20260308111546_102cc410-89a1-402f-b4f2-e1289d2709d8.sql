
-- Re-create inventory trigger for distribution channels
DROP TRIGGER IF EXISTS trg_auto_create_distribution_channels ON inventory;
CREATE TRIGGER trg_auto_create_distribution_channels
  AFTER INSERT ON inventory
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_distribution_channels();

-- Create updated_at trigger for inventory
DROP TRIGGER IF EXISTS trg_inventory_updated_at ON inventory;
CREATE TRIGGER trg_inventory_updated_at
  BEFORE UPDATE ON inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Manually create distribution channels for existing inventory
DO $$
DECLARE
  v_inv RECORD;
  v_batch batches%ROWTYPE;
  v_map numeric;
BEGIN
  FOR v_inv IN SELECT * FROM inventory LOOP
    SELECT * INTO v_batch FROM batches WHERE id = v_inv.batch_id;
    
    IF v_batch IS NOT NULL THEN
      v_map := v_batch.production_cost_per_unit * 1.2;
      
      INSERT INTO distribution_channels (inventory_id, channel, enabled, price, min_price, max_price, allocated_stock)
      VALUES
        (v_inv.id, 'platform', true, v_batch.retail_price, v_map, v_batch.retail_price, ROUND(v_inv.total_stock * 0.2)),
        (v_inv.id, 'retail', true, ROUND(v_batch.retail_price * 0.85), v_map, v_batch.retail_price, ROUND(v_inv.total_stock * 0.3)),
        (v_inv.id, 'dropshipper', true, ROUND(v_batch.retail_price * 0.65), v_map, ROUND(v_batch.retail_price * 0.85), ROUND(v_inv.total_stock * 0.3)),
        (v_inv.id, 'distributor', true, ROUND(v_batch.retail_price * 0.55), v_map, ROUND(v_batch.retail_price * 0.65), ROUND(v_inv.total_stock * 0.2))
      ON CONFLICT (inventory_id, channel) DO NOTHING;
    END IF;
  END LOOP;
END $$;
