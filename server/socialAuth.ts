import { Request, Response, Express } from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { supabase } from './lib/supabase';

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-here";

interface NaverUserInfo {
  id: string;
  email: string;
  nickname: string;
  name: string;
  profile_image: string;
}

interface KakaoUserInfo {
  id: number;
  kakao_account: {
    email: string;
    profile: {
      nickname: string;
      profile_image_url: string;
    };
  };
}

// 사용자 정보로 JWT 토큰 생성
const generateJWT = (user: any) => {
  return jwt.sign(
    {
      id: user.id,
      userId: user.id,
      username: user.username,
      email: user.email,
      isAdmin: user.is_admin || false,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// 사용자 정보로 회원가입 또는 로그인 처리
const handleSocialLogin = async (socialId: string, email: string, nickname: string, provider: string, profileImage?: string) => {
  try {
    // 기존 사용자 확인 (소셜 ID 또는 이메일로)
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .or(`email.eq.${email},username.eq.${provider}_${socialId}`)
      .single();

    let user;
    
    if (existingUser) {
      // 기존 사용자 업데이트
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({
          username: `${provider}_${socialId}`,
          full_name: nickname,
          avatar_url: profileImage,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUser.id)
        .select()
        .single();

      if (error) throw error;
      user = updatedUser;
    } else {
      // 새 사용자 생성
      const { data: newUser, error } = await supabase
        .from('users')
        .insert([{
          email: email,
          username: `${provider}_${socialId}`,
          full_name: nickname,
          avatar_url: profileImage,
          membership_tier: 'basic',
          points_balance: 0,
          total_spent: 0,
          is_admin: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      user = newUser;
    }

    return user;
  } catch (error) {
    console.error('Error in handleSocialLogin:', error);
    throw error;
  }
};

export function initializeSocialAuth(app: Express) {
  // 네이버 로그인 시작
  app.get('/auth/naver', (req: Request, res: Response) => {
    const clientId = process.env.NAVER_CLIENT_ID;
    const redirectUri = encodeURIComponent(process.env.NAVER_REDIRECT_URI || `${req.protocol}://${req.get('host')}/auth/naver/callback`);
    const state = Math.random().toString(36).substring(7); // CSRF 방지용 state
    
    if (!clientId) {
      return res.status(500).json({ error: '네이버 클라이언트 ID가 설정되지 않았습니다.' });
    }

    // 세션에 state 저장
    (req.session as any).naverState = state;
    
    const naverAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}`;
    
    res.redirect(naverAuthUrl);
  });

  // 네이버 로그인 콜백
  app.get('/auth/naver/callback', async (req: Request, res: Response) => {
    const { code, state, error } = req.query;

    if (error) {
      console.error('Naver OAuth error:', error);
      return res.redirect('/login?error=naver_oauth_error');
    }

    if (!code || !state) {
      return res.redirect('/login?error=missing_parameters');
    }

    // state 검증
    if (state !== (req.session as any).naverState) {
      return res.redirect('/login?error=invalid_state');
    }

    try {
      // 액세스 토큰 요청
      const tokenResponse = await axios.post('https://nid.naver.com/oauth2.0/token', null, {
        params: {
          grant_type: 'authorization_code',
          client_id: process.env.NAVER_CLIENT_ID,
          client_secret: process.env.NAVER_CLIENT_SECRET,
          code: code,
          state: state,
        },
      });

      const accessToken = tokenResponse.data.access_token;

      // 사용자 정보 요청
      const userResponse = await axios.get('https://openapi.naver.com/v1/nid/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const naverUser: NaverUserInfo = userResponse.data.response;

      // 사용자 처리
      const user = await handleSocialLogin(
        naverUser.id,
        naverUser.email,
        naverUser.nickname || naverUser.name,
        'naver',
        naverUser.profile_image
      );

      // JWT 토큰 생성
      const token = generateJWT(user);

      // 프론트엔드로 리다이렉트하면서 토큰 전달
      res.redirect(`/?token=${token}&social_login=success`);

    } catch (error) {
      console.error('Naver login error:', error);
      res.redirect('/login?error=naver_login_failed');
    }
  });

  // 카카오 로그인 시작
  app.get('/auth/kakao', (req: Request, res: Response) => {
    const clientId = process.env.KAKAO_CLIENT_ID;
    const redirectUri = encodeURIComponent(process.env.KAKAO_REDIRECT_URI || `${req.protocol}://${req.get('host')}/auth/kakao/callback`);
    
    if (!clientId) {
      return res.status(500).json({ error: '카카오 클라이언트 ID가 설정되지 않았습니다.' });
    }

    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;
    
    res.redirect(kakaoAuthUrl);
  });

  // 카카오 로그인 콜백
  app.get('/auth/kakao/callback', async (req: Request, res: Response) => {
    const { code, error } = req.query;

    if (error) {
      console.error('Kakao OAuth error:', error);
      return res.redirect('/login?error=kakao_oauth_error');
    }

    if (!code) {
      return res.redirect('/login?error=missing_code');
    }

    try {
      // 액세스 토큰 요청
      const tokenResponse = await axios.post('https://kauth.kakao.com/oauth/token', null, {
        params: {
          grant_type: 'authorization_code',
          client_id: process.env.KAKAO_CLIENT_ID,
          client_secret: process.env.KAKAO_CLIENT_SECRET,
          redirect_uri: process.env.KAKAO_REDIRECT_URI || `${req.protocol}://${req.get('host')}/auth/kakao/callback`,
          code: code,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const accessToken = tokenResponse.data.access_token;

      // 사용자 정보 요청
      const userResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
      });

      const kakaoUser: KakaoUserInfo = userResponse.data;

      // 사용자 처리
      const user = await handleSocialLogin(
        kakaoUser.id.toString(),
        kakaoUser.kakao_account.email,
        kakaoUser.kakao_account.profile.nickname,
        'kakao',
        kakaoUser.kakao_account.profile.profile_image_url
      );

      // JWT 토큰 생성
      const token = generateJWT(user);

      // 프론트엔드로 리다이렉트하면서 토큰 전달
      res.redirect(`/?token=${token}&social_login=success`);

    } catch (error) {
      console.error('Kakao login error:', error);
      res.redirect('/login?error=kakao_login_failed');
    }
  });

  // 소셜 로그인 상태 확인 API
  app.get('/api/auth/social/status', (req: Request, res: Response) => {
    res.json({
      naver: !!process.env.NAVER_CLIENT_ID,
      kakao: !!process.env.KAKAO_CLIENT_ID,
    });
  });
}