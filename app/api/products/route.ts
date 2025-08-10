import { NextRequest, NextResponse } from 'next/server';
import { sb } from '../../../server/db/supabase';
import type { Product } from '../../../types/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
  const limit = Math.max(parseInt(searchParams.get('limit') || '12', 10), 1);
  const category = searchParams.get('category');

  try {
    let query = sb.from('products').select('*', { count: 'exact' }).eq('status', 'published');
    if (category) {
      query = query.eq('category', category);
    }
    const from = (page - 1) * limit;
    const to = page * limit - 1;
    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);
    if (error) throw error;
    return NextResponse.json({ items: (data as Product[]) || [], total: count || 0, page, limit });
  } catch (e: any) {
    console.error('GET /api/products failed:', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

