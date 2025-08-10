# Pinto

## API 테스트

서버가 실행 중일 때 다음 예시로 `/api/products` 엔드포인트를 테스트할 수 있습니다:

```bash
curl -s 'http://localhost:5000/api/products'
curl -s 'http://localhost:5000/api/products?page=2&limit=5'
curl -s 'http://localhost:5000/api/products?category=mug&limit=3'
```

처음 호출에서 비어있다면 개발 모드에서 자동으로 시드가 진행된 후 재호출 시 상품이 반환됩니다.
