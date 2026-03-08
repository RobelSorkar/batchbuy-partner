
-- 1. Add unique constraint on batch_id
ALTER TABLE inventory ADD CONSTRAINT inventory_batch_id_unique UNIQUE (batch_id);

-- 2. Insert inventory for completed batches
INSERT INTO inventory (product_name, batch_id, total_stock, status, warehouse_location, sku)
SELECT 
  b.product_name,
  b.id,
  b.total_quantity,
  'in_stock',
  COALESCE(b.warehouse, 'Main Warehouse'),
  'SKU-' || UPPER(SUBSTRING(b.id::text FROM 1 FOR 8))
FROM batches b
WHERE b.status = 'completed'
ON CONFLICT (batch_id) DO NOTHING;

-- 3. Insert inventory for production batches
INSERT INTO inventory (product_name, batch_id, total_stock, status, warehouse_location, sku)
SELECT 
  b.product_name,
  b.id,
  b.total_quantity,
  'in_stock',
  COALESCE(b.warehouse, 'Main Warehouse'),
  'SKU-' || UPPER(SUBSTRING(b.id::text FROM 1 FOR 8))
FROM batches b
WHERE b.status = 'production'
ON CONFLICT (batch_id) DO NOTHING;

-- 4. Clean up duplicate order triggers
DROP TRIGGER IF EXISTS on_order_delivered_distribute_profit ON orders;
DROP TRIGGER IF EXISTS on_order_delivered_sync_inventory ON orders;
DROP TRIGGER IF EXISTS set_updated_at_orders ON orders;
DROP TRIGGER IF EXISTS trg_updated_at_orders ON orders;
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
