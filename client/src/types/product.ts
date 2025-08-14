export interface Product {
  id: string | number;
  name?: string | null;
  nameKo?: string | null;
  imageUrl?: string | null;
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
}
