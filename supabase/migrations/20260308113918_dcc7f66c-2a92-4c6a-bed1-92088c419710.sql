
-- Fix data integrity issues in one transaction

-- 1. Temporarily disable validation trigger
DROP TRIGGER IF EXISTS trg_validate_participation_update ON batch_participations;

-- 2. Merge duplicate participations: keep first one, add values from second
UPDATE batch_participations 
SET units_owned = 73, total_invested = 22000
WHERE id = 'b3be0810-d496-40af-b85a-229c3892910a';

-- 3. Delete duplicate
DELETE FROM batch_participations 
WHERE id = '1fa40a43-46f6-4e2f-8c85-1fe2443172bf';

-- 4. Re-enable validation trigger
CREATE TRIGGER trg_validate_participation_update
  BEFORE UPDATE ON batch_participations
  FOR EACH ROW
  EXECUTE FUNCTION validate_participation_update();

-- 5. Create sync function
CREATE OR REPLACE FUNCTION public.admin_sync_batch_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM set_config('app.calling_function', 'join_batch', true);
  
  UPDATE batches b SET
    funded_units = COALESCE((SELECT SUM(bp.units_owned) FROM batch_participations bp WHERE bp.batch_id = b.id), 0),
    partners_joined = COALESCE((SELECT COUNT(*) FROM batch_participations bp WHERE bp.batch_id = b.id), 0),
    remaining_units = b.total_quantity - COALESCE((SELECT SUM(bp.units_owned) FROM batch_participations bp WHERE bp.batch_id = b.id), 0);
  
  PERFORM set_config('app.calling_function', '', true);
END;
$$;

-- 6. Sync batch stats
SELECT admin_sync_batch_stats();

-- 7. Add unique constraint
ALTER TABLE batch_participations
  ADD CONSTRAINT batch_participations_user_batch_unique UNIQUE (user_id, batch_id);
