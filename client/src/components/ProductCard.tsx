import { useState, useEffect } from "react";
import { Heart, ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";
import { useFavorites } from "@/hooks/useFavorites";
import type { Product } from "@/types/product";

// 금액 계산에 사용할 상수 및 유틸 함수
const FALLBACK_RATE = 1000; // 임시 환율 1:1000

// 값 → 숫자 변환 (NaN 방지)
const toNumber = (
  value: number | string | null | undefined,
): number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return Number.isNaN(value) ? null : value;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

// 상품 정보를 원화 정수로 변환
const toKRW = (product: Product): number => {
  if (typeof product.price_krw === 'number' && !Number.isNaN(product.price_krw)) {
    return product.price_krw;
  }

  const price = toNumber(product.price);
  if (price !== null) {
    return Math.round(price * FALLBACK_RATE);
  }

  const basePrice = toNumber(product.basePrice);
  if (basePrice !== null) {
    return Math.round(basePrice * FALLBACK_RATE);
  }

  return 0;
};

const KRW_FORMATTER = new Intl.NumberFormat('ko-KR', {
  style: 'currency',
  currency: 'KRW',
  maximumFractionDigits: 0,
});

// 공통 Product 타입을 사용하는 카드 컴포넌트의 props 정의
type ProductCardProps = {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onToggleFavorite?: (product: Product) => void;
  className?: string;
};

export function ProductCard({
  product: rawProduct,
  onAddToCart,
  onToggleFavorite,
  className = "",
}: ProductCardProps) {
  // 서버에서 snake_case(image_url)로 오는 경우를 대비해 매핑
  const product: Product = {
    ...rawProduct,
    imageUrl: (rawProduct as any).image_url ?? rawProduct.imageUrl,
  };

  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const { language } = useLanguage(); // t는 사용되지 않아 제거
  const { toast } = useToast();
  const { addToFavorites, removeFromFavorites, isFavorite: isInDbFavorites } = useFavorites();

  // Check if product is in database wishlist on mount
  useEffect(() => {
    const inDbFavorites = isInDbFavorites(product.id.toString());
    setIsLiked(inDbFavorites);
  }, [product.id, isInDbFavorites]);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const productIdStr = product.id.toString();
    const inDbFavorites = isInDbFavorites(productIdStr);
    
    if (inDbFavorites) {
      // Remove from database wishlist
      removeFromFavorites(productIdStr);
      setIsLiked(false);
      toast({
        title: "찜 목록에서 제거됨",
        description: `${product.nameKo || product.name}이(가) 찜 목록에서 제거되었습니다.`,
      });
    } else {
      // Add to database wishlist
      addToFavorites(productIdStr);
      setIsLiked(true);
      toast({
        title: "찜 목록에 추가됨",
        description: `${product.nameKo || product.name}이(가) 찜 목록에 추가되었습니다.`,
      });
    }
    
    onToggleFavorite?.(product);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart?.(product);
  };

  // 가격 계산 로직 리팩터링
  const formattedPrice = KRW_FORMATTER.format(toKRW(product));
  const reviewCount = product.reviewsCount ?? product.reviewCount ?? 0;
  const likeCount = product.likesCount ?? product.likeCount ?? 0;

  const link = product.detailPath ?? `/product/${product.id}`;
  return (
    <Link href={link} className="block">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        // 외부에서 전달된 className을 합쳐 사용
        className={`allprint-card ${className}`}
      >
        <div className="allprint-card-image">
          {product.imageUrl ? (
            // alt와 src에 널 병합 연산자를 사용해 TS 오류 방지
            <img
              src={product.imageUrl ?? ""}
              alt={product.name ?? "product image"}
              loading="lazy"
            />
          ) : (
            <div className="allprint-card-image-placeholder">
              <ImageIcon className="w-full h-28 object-contain mx-auto text-gray-300 dark:text-gray-700" />
            </div>
          )}

          {/* 품절/재고 부족 배지 */}
          {product.isOutOfStock && (
            <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-md font-medium z-10">
              품절
            </div>
          )}
          
          {product.isLowStock && !product.isOutOfStock && (
            <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-md font-medium z-10">
              재고 부족
            </div>
          )}
          
          {product.isFeatured && (
            <div className="allprint-card-hot-badge">HOT</div>
          )}

          <button
            onClick={handleLike}
            className="allprint-card-like-badge hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
          >
            <Heart className={`w-3 h-3 mr-1 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
            LIKE {likeCount}
          </button>
        </div>

        <div className="allprint-card-content">
          <div className="allprint-card-title">
            {language === "ko" && product.nameKo ? product.nameKo : (product.name || `상품 ${product.id}`)}
          </div>
          <div className="allprint-card-price">₩ {formattedPrice}</div>
          
          {/* 재고 정보 표시 */}
          <div className="flex items-center justify-between mb-2">
            <div className="allprint-card-stats">
              리뷰 {reviewCount} / LIKE {likeCount}
            </div>
            {product.stock !== undefined && (
              <div className={`text-xs font-medium ${
                product.isOutOfStock 
                  ? 'text-red-600' 
                  : product.isLowStock 
                    ? 'text-orange-600' 
                    : 'text-green-600'
              }`}>
                {product.isOutOfStock 
                  ? '품절' 
                  : product.isLowStock 
                    ? `재고 ${product.stock}개` 
                    : '재고 충분'}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
