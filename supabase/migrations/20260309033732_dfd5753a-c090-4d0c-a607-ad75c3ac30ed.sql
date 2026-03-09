
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Authenticated users can update own product images" ON storage.objects;
CREATE POLICY "Authenticated users can update own product images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Authenticated users can delete own product images" ON storage.objects;
CREATE POLICY "Authenticated users can delete own product images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Public read access to product images" ON storage.objects;
CREATE POLICY "Public read access to product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');
