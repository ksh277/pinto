# 소셜 로그인 설정 가이드

## 네이버 소셜 로그인 구현 완료

### 구현된 기능
✅ **백엔드 OAuth 처리 완료**
- GET `/auth/naver` - 네이버 로그인 창 리디렉션  
- GET `/auth/naver/callback` - 네이버 콜백 처리 및 JWT 발급
- GET `/auth/kakao` - 카카오 로그인 창 리디렉션
- GET `/auth/kakao/callback` - 카카오 콜백 처리 및 JWT 발급

✅ **프론트엔드 연동 완료**
- 소셜 로그인 버튼이 `/auth/naver`, `/auth/kakao`로 리다이렉트
- URL 파라미터로 전달되는 JWT 토큰 자동 처리
- 로그인 성공 시 localStorage에 토큰 저장 및 사용자 정보 설정

✅ **사용자 처리 로직**
- 기존 사용자 확인 (이메일 또는 소셜 ID로)
- 신규 사용자 자동 회원가입
- JWT 토큰 생성 및 전달

### 필요한 환경 설정

프로덕션에서 사용하려면 다음 환경 변수를 설정해야 합니다:

```bash
# 네이버 OAuth 설정
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret  
NAVER_REDIRECT_URI=https://your-domain.com/auth/naver/callback

# 카카오 OAuth 설정  
KAKAO_CLIENT_ID=your_kakao_client_id
KAKAO_CLIENT_SECRET=your_kakao_client_secret
KAKAO_REDIRECT_URI=https://your-domain.com/auth/kakao/callback

# JWT 및 세션 설정
JWT_SECRET=your_jwt_secret_key
SESSION_SECRET=your_session_secret_key
```

### OAuth 앱 등록 방법

#### 네이버 개발자 센터
1. https://developers.naver.com/apps/ 에서 애플리케이션 등록
2. 서비스 API 설정에서 "네이버 로그인" 추가
3. Callback URL: `https://your-domain.com/auth/naver/callback`
4. 제공 정보: 이메일 주소, 닉네임, 프로필 사진

#### 카카오 개발자 센터  
1. https://developers.kakao.com/ 에서 애플리케이션 추가
2. 카카오 로그인 활성화
3. Redirect URI: `https://your-domain.com/auth/kakao/callback`
4. 동의항목: 카카오계정(이메일), 프로필 정보(닉네임, 프로필 사진)

### 테스트 방법

환경 변수 설정 후:
1. 로그인 페이지에서 "카카오" 또는 "네이버" 버튼 클릭
2. 소셜 로그인 창에서 로그인
3. 자동으로 메인 페이지로 리다이렉트되며 로그인 완료

### 기술적 세부사항

- **인증 플로우**: Authorization Code Grant 방식 사용
- **보안**: CSRF 공격 방지를 위한 state 파라미터 검증 (네이버)  
- **토큰 관리**: JWT 토큰으로 통일된 인증 시스템
- **사용자 정보**: Supabase users 테이블에 소셜 로그인 사용자 저장
- **에러 처리**: 각 단계별 에러 처리 및 사용자 피드백