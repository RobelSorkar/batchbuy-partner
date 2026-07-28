-- Product categories, previously hard-coded in CreateProject.tsx. Moving to a
-- real table so admins can add new ones without a code deploy.

CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Anyone signed in can see the list (needed to populate the category picker).
CREATE POLICY "Authenticated users can view categories"
  ON public.categories FOR SELECT TO authenticated
  USING (true);

-- Only admins can add or remove categories.
CREATE POLICY "Admins can insert categories"
  ON public.categories FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete categories"
  ON public.categories FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Seed with the categories that were previously hard-coded, so existing
-- behavior doesn't change for anyone.
INSERT INTO public.categories (name) VALUES
  ('Apparel'), ('Beauty'), ('Accessories'), ('Home & Kitchen'),
  ('Electronics'), ('Food & Beverage'), ('Health'), ('Sports')
ON CONFLICT (name) DO NOTHING;
