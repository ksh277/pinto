import { useState, useEffect } from "react";
import { Heart, ShoppingCart, Eye, ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product & { reviewCount?: number; likeCount?: number };
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

  // Check if product is in wishlist on mount
  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const isInWishlist = wishlist.some((item: any) => item.id === product.id);
    setIsLiked(isInWishlist);
  }, [product.id]);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const isInWishlist = wishlist.some((item: any) => item.id === product.id);
    
    if (isInWishlist) {
      // Remove from wishlist
      const updatedWishlist = wishlist.filter((item: any) => item.id !== product.id);
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      setIsLiked(false);
      toast({
        title: "찜 목록에서 제거됨",
        description: `${product.name}이(가) 찜 목록에서 제거되었습니다.`,
      });
    } else {
      // Add to wishlist
      const wishlistItem = {
        id: product.id,
        name: product.name,
        base_price: product.basePrice,
        image_url: product.imageUrl,
        category_id: product.categoryId,
        description: product.description,
        addedAt: new Date().toISOString()
      };
      wishlist.push(wishlistItem);
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      setIsLiked(true);
      toast({
        title: "찜 목록에 추가됨",
        description: `${product.name}이(가) 찜 목록에 추가되었습니다.`,
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
  const reviewCount = product.reviewCount || 0;
  const likeCount = product.likeCount || 0;

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

          {product.isFeatured && (
            <div className="allprint-card-hot-badge">HOT</div>
          )}

          <button
            onClick={handleLike}
            className="allprint-card-like-badge hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
          >
            <Heart className={`w-3 h-3 mr-1 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
            LIKE {likeCount || 15}
          </button>
        </div>

        <div className="allprint-card-content">
          <div className="allprint-card-title">
            {language === "ko" ? product.nameKo : product.name}
          </div>
          <div className="allprint-card-price">₩ {formattedPrice}</div>
          <div className="allprint-card-stats">
            리뷰 {reviewCount?.toLocaleString() || "11,390"} / LIKE{" "}
            {likeCount || 15}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
