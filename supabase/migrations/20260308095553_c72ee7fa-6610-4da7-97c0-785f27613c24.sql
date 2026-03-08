ALTER TABLE public.batch_participations 
ADD COLUMN inventory_mode TEXT NOT NULL DEFAULT 'platform' 
CHECK (inventory_mode IN ('collect', 'platform', 'hybrid'));