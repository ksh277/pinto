import { sb } from '../db/supabase';

export const PRODUCTS_SCHEMA_SQL = `
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
`;

export async function ensureProductsSchema(): Promise<void> {
  try {
    const { error } = await sb.rpc('pg_execute', { sql: PRODUCTS_SCHEMA_SQL });
    if (error) {
      console.error('ensureProductsSchema failed:', error.message);
      console.error('Run the following SQL manually if needed:\n', PRODUCTS_SCHEMA_SQL);
      throw error;
    }
  } catch (e) {
    console.error('ensureProductsSchema error:', (e as any)?.message);
    console.error('Run the following SQL manually if automatic execution is unavailable:\n', PRODUCTS_SCHEMA_SQL);
    throw e;
  }
}

