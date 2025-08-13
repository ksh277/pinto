import { sb } from '../db/supabase';
import { checkProductsTable } from '../db/diagnostics';

const DATA = [
  { nameKo: '투명 아크릴 키링', priceKrw: 1200, reviewCount: 11774, slug: 'clear-acrylic-keyring' },
  { nameKo: '하프미러 아크릴 키링', priceKrw: 1700, reviewCount: 1321, slug: 'half-mirror-acrylic-keyring' },
  { nameKo: '글리터 아크릴 키링', priceKrw: 1200, reviewCount: 1031, slug: 'glitter-acrylic-keyring' },
  { nameKo: '유색·투명컬러 아스텔 키링', priceKrw: 1200, reviewCount: 6430, slug: 'colored-transparent-astel-keyring' },
  { nameKo: '자개 아크릴키링', priceKrw: 1200, reviewCount: 793, slug: 'nacre-acrylic-keyring' },
  { nameKo: '렌티큘러 키링', priceKrw: 1800, reviewCount: 358, slug: 'lenticular-keyring' },
  { nameKo: '거울 아크릴 키링', priceKrw: 1700, reviewCount: 331, slug: 'mirror-acrylic-keyring' },
  { nameKo: '홀로그램 아크릴 키링', priceKrw: 1700, reviewCount: 1008, slug: 'hologram-acrylic-keyring' },
  { nameKo: '5T 하프미러 아크릴 키링', priceKrw: 1900, reviewCount: 286, slug: '5t-half-mirror-acrylic-keyring' },
  { nameKo: '5T 투명 아크릴 키링', priceKrw: 1400, reviewCount: 569, slug: '5t-clear-acrylic-keyring' },
  { nameKo: '뮤트컬러 아크릴 키링', priceKrw: 1200, reviewCount: 714, slug: 'mute-color-acrylic-keyring' },
  { nameKo: '야광 아크릴 키링', priceKrw: 1300, reviewCount: 289, slug: 'glow-in-the-dark-acrylic-keyring' },
  { nameKo: '스핀 아크릴 키링', priceKrw: 1300, reviewCount: 236, slug: 'spin-acrylic-keyring' },
  { nameKo: '앞뒤도바 5T 아크릴 키링', priceKrw: 1800, reviewCount: 144, slug: 'both-sides-5t-acrylic-keyring' },
  { nameKo: '파스텔 양면 아스텔 아크릴 키링', priceKrw: 1300, reviewCount: 317, slug: 'pastel-double-astel-acrylic-keyring' },
];

function slugToPascal(slug: string): string {
  return slug
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
}

export async function seedProducts(): Promise<void> {
  const { exists } = await checkProductsTable();
  if (!exists) {
    console.warn('Products table does not exist. Skipping seed.');
    return;
  }

  const rows = DATA.map((p) => ({
    category: 'acrylic',
    subcategory: 'keyring',
    name_ko: p.nameKo,
    name_en: slugToPascal(p.slug),
    slug: p.slug,
    price_krw: p.priceKrw,
    review_count: p.reviewCount,
  }));

  const { error } = await sb.from('products').upsert(rows, { onConflict: 'slug' });
  if (error) {
    console.error('seedProducts failed:', error.message);
    throw error;
  }
  console.log(`Seeded ${rows.length} products.`);
}

