import { Router } from 'express';
import { sb } from '../db/supabase';

const router = Router();

router.get('/materials', async (req, res) => {
  try {
    const limit = Math.min(parseInt(String(req.query.limit ?? 4), 10) || 4, 12);

    const { data: prods, error: pErr } = await sb
      .from('products')
      .select('id, name, name_ko, thumbnail_url, material, price, created_at, is_published')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(32);

    if (pErr) throw pErr;

    const ids = (prods ?? []).map(p => p.id);

    const { data: counts, error: cErr } = await sb
      .from('v_product_review_counts')
      .select('product_id, review_count, avg_rating')
      .in('product_id', ids);

    if (cErr) throw cErr;

    const countMap = new Map(counts?.map(c => [c.product_id, c]));

    const ranked = (prods ?? [])
      .map(p => {
        const cnt = countMap.get(p.id);
        const reviewCount = Number(cnt?.review_count ?? 0);
        const avg = Number(cnt?.avg_rating ?? 0);
        const badge = reviewCount > 200 ? 'HIT' : (avg >= 4.5 ? '추천' : 'NEW');
        const discount = badge === 'HIT' ? 20 : 0;
        return {
          id: p.id,
          image: p.thumbnail_url ?? '/api/placeholder/360/280',
          title: p.name_ko ?? p.name ?? '상품명',
          price: Number(p.price ?? 0),
          originalPrice: discount > 0 ? Math.round(Number(p.price) * 1.25) : null,
          reviewCount,
          badge,
          material: p.material ?? '',
          discount,
        };
      })
      .sort((a, b) => (b.reviewCount - a.reviewCount) || (b.discount - a.discount))
      .slice(0, limit);

    res.json(ranked);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ message: 'Failed to fetch material recommendations' });
  }
});

export default router;
