import { useState, useEffect } from "react";
import { Heart, ShoppingCart, Eye, ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";
import { useFavorites } from "@/hooks/useFavorites";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product & { 
    reviewCount?: number; 
    likeCount?: number; 
    stock?: number;
    isOutOfStock?: boolean;
    isLowStock?: boolean;
  };
  onAddToCart?: (product: Product) => void;
  onToggleFavorite?: (product: Product) => void;
  isFavorite?: boolean;
}

export function ProductCard({
  product,
  onAddToCart,
  onToggleFavorite,
  isFavorite = false,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(isFavorite);
  const { language, t } = useLanguage();
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

  const formattedPrice = parseInt(product.basePrice).toLocaleString();
  const reviewCount = product.reviewsCount || product.reviewCount || 0;
  const likeCount = product.likesCount || product.likeCount || 0;

  return (
    <Link href={`/product/${product.id}`} className="block">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="allprint-card"
      >
        <div className="allprint-card-image">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} loading="lazy" />
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
