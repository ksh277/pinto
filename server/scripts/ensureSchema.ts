import { sb } from '../db/supabase';

export const PRODUCTS_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price integer NOT NULL,
  thumbnail_url text,
  category text,
  status text DEFAULT 'published',
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_products_status_created_at
  ON public.products(status, created_at DESC);
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

