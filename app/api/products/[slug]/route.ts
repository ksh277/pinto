import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../server/lib/supabase';
import { camelize, Product } from '../../../../shared/types';

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  const { data, error } = await supabase
    .from('products')
    .select(
      'id, category, subcategory, name_ko, name_en, slug, price_krw, review_count, thumbnail_url, is_active, created_at'
    )
    .eq('slug', slug)
    .maybeSingle();

  if (error || !data) {
    const message = error ? error.message : 'not found';
    return NextResponse.json({ error: message }, { status: 404 });
  }

  const item = camelize<Product>(data);
  return NextResponse.json(item);
}
