import { sb } from './supabase';

export async function checkProductsTable(): Promise<{ exists: boolean; count: number | null; error?: string }> {
  try {
    const { count, error } = await sb
      .from('products')
      .select('id', { count: 'exact', head: true });
    if (error) {
      if ((error as any).code === '42P01') {
        return { exists: false, count: null };
      }
      console.error('checkProductsTable error:', error.message, (error as any).code);
      return { exists: false, count: null, error: error.message };
    }
    return { exists: true, count: count ?? 0 };
  } catch (e: any) {
    console.error('checkProductsTable unexpected error:', e?.message);
    return { exists: false, count: null, error: e?.message };
  }
}

