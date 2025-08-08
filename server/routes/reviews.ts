import { Router } from 'express';
import { sb } from '../db/supabase';

const router = Router();

router.get('/creator', async (req, res) => {
  try {
    const limit = Math.min(parseInt(String(req.query.limit ?? 4), 10) || 4, 12);

    const { data: reviews, error: rErr } = await sb
      .from('reviews')
      .select('id, product_id, user_name, rating, comment, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (rErr) throw rErr;

    const productIds = Array.from(new Set((reviews ?? []).map(r => r.product_id)));

    const { data: products, error: pErr } = await sb
      .from('products')
      .select('id, name, name_ko, thumbnail_url')
      .in('id', productIds);

    if (pErr) throw pErr;

    const { data: counts, error: cErr } = await sb
      .from('v_product_review_counts')
      .select('product_id, review_count, avg_rating')
      .in('product_id', productIds);

    if (cErr) throw cErr;

    const productMap = new Map(products?.map(p => [p.id, p]));
    const countMap = new Map(counts?.map(c => [c.product_id, c]));

    const payload = (reviews ?? []).map(r => {
      const p = productMap.get(r.product_id);
      const cnt = countMap.get(r.product_id);
      return {
        id: r.id,
        productImage: p?.thumbnail_url ?? '/api/placeholder/360/280',
        productName: p?.name_ko ?? p?.name ?? '상품명 미상',
        userName: r.user_name ?? '사용자***',
        rating: r.rating ?? 0,
        date: new Date(r.created_at).toISOString().slice(0,10).replaceAll('-','.'),
        reviewCount: Number(cnt?.review_count ?? 0),
        comment: r.comment ?? '',
        tags: [] as string[],
      };
    });

    res.json(payload);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ message: 'Failed to fetch creator reviews' });
  }
});

export default router;
