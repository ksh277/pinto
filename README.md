# Pinto

## 환경 변수

프로젝트를 실행하려면 다음 Supabase 관련 환경 변수를 설정해야 합니다:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## API 테스트

서버가 실행 중일 때 다음 예시로 `/api/products` 엔드포인트를 테스트할 수 있습니다:

```bash
curl "http://localhost:3000/api/products?category=acrylic&subcategory=keyring"
```

응답에는 15개의 키링 상품이 포함되고 `priceKrw` 및 `reviewCount` 값이 정수로 내려옵니다.
