CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  subcategory text NOT NULL,
  name_ko text NOT NULL,
  name_en text,
  slug text NOT NULL UNIQUE,
  price_krw integer NOT NULL,
  review_count integer NOT NULL DEFAULT 0,
  thumbnail_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_category_subcategory
  ON public.products(category, subcategory);

CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
