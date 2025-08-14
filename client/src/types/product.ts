// 클라이언트와 서버에서 공통으로 사용되는 상품 타입
export type Product = {
  id: string | number;
  name?: string | null;
  nameKo?: string | null;
  imageUrl?: string | null; // 백엔드가 image_url을 반환하는 경우 컴포넌트에서 매핑
  price_krw?: number | null;
  price?: number | string | null;
  basePrice?: number | string | null;
  currency?: "KRW" | "USD" | "EUR" | string;
  reviewCount?: number;
  reviewsCount?: number;
  likeCount?: number;
  likesCount?: number;
  stock?: number;
  isOutOfStock?: boolean;
  isLowStock?: boolean;
  isFeatured?: boolean;
  detailPath?: string;
};
