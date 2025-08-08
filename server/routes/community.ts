import { Router } from 'express';
import { sb } from '../db/supabase';

const router = Router();

router.get('/highlight', async (req, res) => {
  try {
    const limit = Math.min(parseInt(String(req.query.limit ?? 4), 10) || 4, 12);

    const { data: posts, error: pErr } = await sb
      .from('community_posts')
      .select('id, title, author_masked, image_url, created_at, is_featured')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (pErr) throw pErr;

    const postIds = (posts ?? []).map(p => p.id);

    const { data: counts, error: cErr } = await sb
      .from('v_community_counts')
      .select('post_id, likes, comments')
      .in('post_id', postIds);

    if (cErr) throw cErr;

    const countMap = new Map(counts?.map(c => [c.post_id, c]));

    const payload = (posts ?? []).map(p => {
      const cnt = countMap.get(p.id);
      return {
        id: p.id,
        image: p.image_url ?? '/api/placeholder/360/280',
        title: p.title ?? '제목 없음',
        likes: Number(cnt?.likes ?? 0),
        comments: Number(cnt?.comments ?? 0),
        tags: [] as string[],
        author: p.author_masked ?? '사용자***',
      };
    });

    res.json(payload);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ message: 'Failed to fetch community highlight' });
  }
});

export default router;
