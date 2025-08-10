import { sb } from '../db/supabase';
import { checkProductsTable } from '../db/diagnostics';

export async function seedProducts(): Promise<void> {
  const { exists, count } = await checkProductsTable();
  if (!exists) {
    console.warn('Products table does not exist. Skipping seed.');
    return;
  }
  if (typeof count === 'number' && count > 0) {
    console.log('Products table already seeded.');
    return;
  }
  const rows = [
    { name: '기본 머그컵', category: 'mug', price: 9900, thumbnail_url: '/images/seed/mug.jpg' },
    { name: '코스터 세트', category: 'coaster', price: 5900, thumbnail_url: '/images/seed/coaster.jpg' },
    { name: '티셔츠', category: 'tshirt', price: 19900, thumbnail_url: '/images/seed/tshirt.jpg' },
    { name: '에코백', category: 'bag', price: 14900, thumbnail_url: '/images/seed/bag.jpg' },
    { name: '스티커 팩', category: 'sticker', price: 3900, thumbnail_url: '/images/seed/sticker.jpg' },
  ];
  const { error } = await sb.from('products').insert(rows);
  if (error) {
    console.error('seedProducts failed:', error.message);
    throw error;
  }
}

