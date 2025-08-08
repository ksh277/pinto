import { Router } from 'express';
import { sb } from '../db/supabase';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const limit = Math.min(parseInt(String(req.query.limit ?? 20), 10) || 20, 50);

    // 1) 리뷰 본문
    const { data: reviews, error: rErr } = await sb
      .from('reviews')
      .select('id, rating, comment, created_at, product_id, user_id')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (rErr) throw rErr;

    if (!reviews || reviews.length === 0) return res.json([]);

    const productIds = [...new Set(reviews.map(r => r.product_id))];
    const reviewIds  = reviews.map(r => r.id);
    const userIds    = [...new Set(reviews.map(r => r.user_id))];

    // 2) 제품
    const { data: products, error: pErr } = await sb
      .from('products')
      .select('id, name, name_ko, price, thumbnail_url, category_name')
      .in('id', productIds);
    if (pErr) throw pErr;
    const pMap = new Map(products?.map(p => [p.id, p]) ?? []);

    // 3) 좋아요/댓글 집계
    const { data: likeRows } = await sb
      .from('review_likes')
      .select('review_id')
      .in('review_id', reviewIds);
    const { data: cmtRows } = await sb
      .from('review_comments')
      .select('review_id')
      .in('review_id', reviewIds);

    const likeMap = new Map<number, number>();
    (likeRows ?? []).forEach(r => likeMap.set(r.review_id, (likeMap.get(r.review_id) ?? 0) + 1));
    const cmtMap = new Map<number, number>();
    (cmtRows ?? []).forEach(r => cmtMap.set(r.review_id, (cmtMap.get(r.review_id) ?? 0) + 1));

    // 4) 리뷰 이미지(최대 4)
    const { data: images, error: iErr } = await sb
      .from('review_images')
      .select('review_id, url')
      .in('review_id', reviewIds);
    if (iErr) throw iErr;
    const imgMap = new Map<number, string[]>();
    (images ?? []).forEach((row: any) => {
      const arr = imgMap.get(row.review_id) ?? [];
      if (arr.length < 4) arr.push(row.url);
      imgMap.set(row.review_id, arr);
    });

    // 5) 유저
    const { data: users, error: uErr } = await sb
      .from('profiles')
      .select('id, nickname')
      .in('id', userIds);
    if (uErr) throw uErr;
    const uMap = new Map(users?.map(u => [u.id, u]) ?? []);

    // 6) 페이로드
    const payload = reviews.map(r => {
      const p = pMap.get(r.product_id);
      const u = uMap.get(r.user_id);
      return {
        id: r.id,
        rating: r.rating ?? 0,
        comment: r.comment ?? '',
        createdAt: r.created_at,
        product: {
          id: p?.id ?? null,
          name: p?.name_ko ?? p?.name ?? '상품명',
          price: Number(p?.price ?? 0),
          thumbnail: p?.thumbnail_url ?? null,
          categoryName: p?.category_name ?? '기타'
        },
        images: imgMap.get(r.id) ?? [],
        counts: {
          likes: likeMap.get(r.id) ?? 0,
          comments: cmtMap.get(r.id) ?? 0
        },
        user: {
          id: r.user_id,
          username: u?.nickname ?? '익명'
        }
      };
    });

    res.json(payload);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
});

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
