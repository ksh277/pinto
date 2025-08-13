import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../server/lib/supabase';
import { camelize, Product } from '../../../shared/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const subcategory = searchParams.get('subcategory');

  let query = supabase
    .from('products')
    .select(
      'id, category, subcategory, name_ko, name_en, slug, price_krw, review_count, thumbnail_url, is_active, created_at'
    )
    .eq('is_active', true);

  if (category) query = query.eq('category', category);
  if (subcategory) query = query.eq('subcategory', subcategory);

  const { data, error } = await query;
  if (error) {
    console.error('GET /api/products failed:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const items = (data || []).map((row) => camelize<Product>(row));
  return NextResponse.json(items);
}
