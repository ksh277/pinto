import { NextRequest, NextResponse } from 'next/server';
import { sb } from '../../../../server/db/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const value = searchParams.get('value');

  if (!value) {
    return NextResponse.json(
      { available: false, message: 'value required' },
      { status: 400 },
    );
  }

  try {
    const { data, error } = await sb
      .from('users')
      .select('id')
      .eq('username', value)
      .maybeSingle();

    if (error) throw error;

    if (data) {
      return NextResponse.json({ available: false, message: '이미 사용 중' });
    }

    return NextResponse.json({ available: true });
  } catch (e) {
    console.error('[GET /api/auth/check-username] error', e);
    return NextResponse.json(
      { available: false, message: 'server error' },
      { status: 500 },
    );
  }
}

