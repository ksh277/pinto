import { NextRequest, NextResponse } from 'next/server';
import { sb } from '../../../../server/db/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(
    Math.max(parseInt(searchParams.get('limit') || '4', 10) || 4, 1),
    12,
  );
  console.log('[GET /api/community/highlight]', { url: req.url, limit });
  try {
    console.debug('Query community posts', { limit });
    const { data: posts, error: pErr } = await sb
      .from('community_posts')
      .select('id, title, author_masked, image_url, created_at, is_featured')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);
    if (pErr) throw pErr;

    const postIds = (posts ?? []).map(p => p.id);
    console.debug('Query community counts', { postIds });
    const { data: counts, error: cErr } = await sb
      .from('v_community_counts')
      .select('post_id, likes, comments')
      .in('post_id', postIds);
    if (cErr) throw cErr;

    const countMap = new Map((counts ?? []).map(c => [c.post_id, c]));
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

    console.log('[GET /api/community/highlight] result', { rowCount: payload.length });
    return NextResponse.json(payload);
  } catch (e: any) {
    console.error('[GET /api/community/highlight] failed', e);
    return NextResponse.json({ error: e.message || 'Unknown error' }, { status: 500 });
  }
}
