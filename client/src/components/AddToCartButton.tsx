import React from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Product } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useSupabaseAuth } from "@/components/SupabaseProvider";

interface AddToCartButtonProps {
  product: Product & {
    stock?: number;
    isOutOfStock?: boolean;
    isLowStock?: boolean;
  };
  quantity?: number;
  customizationOptions?: any;
  variant?: "default" | "icon" | "compact";
  className?: string;
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  product,
  quantity = 1,
  customizationOptions,
  variant = "default",
  className = "",
}) => {
  const { addToCart, isAddingToCart } = useCart();
  const { user: currentUser } = useSupabaseAuth();
  const { toast } = useToast();

  const handleAddToCart = () => {
    if (!currentUser) {
      toast({
        title: "로그인이 필요합니다",
        description: "장바구니에 상품을 추가하려면 로그인해주세요.",
        variant: "destructive",
        action: (
          <Link href="/auth">
            <Button variant="outline" size="sm">
              로그인하기
            </Button>
          </Link>
        ),
      });
      return;
    }
    if (!isSupabaseConfigured) {
      toast({
        title: "서비스 준비 중",
        description: "장바구니 기능을 사용할 수 없습니다.",
        variant: "destructive",
      });
      return;
    }
    // 재고 확인
    if (
      product.isOutOfStock ||
      (product.stock !== undefined && product.stock <= 0)
    ) {
      toast({
        title: "품절된 상품입니다",
        description: "현재 이 상품은 품절되어 구매할 수 없습니다.",
        variant: "destructive",
      });
      return;
    }

    // 요청 수량이 재고보다 많은지 확인
    if (product.stock !== undefined && quantity > product.stock) {
      toast({
        title: "재고가 부족합니다",
        description: `요청 수량 ${quantity}개가 재고 ${product.stock}개보다 많습니다.`,
        variant: "destructive",
      });
      return;
    }

    if (!product.is_available) {
      toast({
        title: "상품을 사용할 수 없습니다",
        description: "현재 이 상품은 구매할 수 없습니다.",
        variant: "destructive",
      });
      return;
    }

    addToCart({
      productId: product.id,
      quantity,
      options: customizationOptions,
    });
  };

  if (variant === "icon") {
    return (
      <Button
        onClick={handleAddToCart}
        disabled={
          isAddingToCart || !product.is_available || product.isOutOfStock
        }
        size="icon"
        variant="outline"
        className={`shrink-0 ${className}`}
      >
        {isAddingToCart ? (
          <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        ) : (
          <Plus className="w-4 h-4" />
        )}
      </Button>
    );
  }

  if (variant === "compact") {
    return (
      <Button
        onClick={handleAddToCart}
        disabled={
          isAddingToCart || !product.is_available || product.isOutOfStock
        }
        size="sm"
        variant="outline"
        className={`shrink-0 ${className}`}
      >
        {isAddingToCart ? (
          <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-2" />
        ) : (
          <ShoppingCart className="w-4 h-4 mr-2" />
        )}
        {product.isOutOfStock ? "품절" : "담기"}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isAddingToCart || !product.is_available || product.isOutOfStock}
      className={`w-full ${className}`}
    >
      {isAddingToCart ? (
        <div className="flex items-center">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-2" />
          추가 중...
        </div>
      ) : product.isOutOfStock ? (
        <div className="flex items-center">
          <ShoppingCart className="w-4 h-4 mr-2" />
          품절
        </div>
      ) : (
        <div className="flex items-center">
          <ShoppingCart className="w-4 h-4 mr-2" />
          장바구니에 추가
        </div>
      )}
    </Button>
  );
};
