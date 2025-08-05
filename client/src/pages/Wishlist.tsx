import React from "react";
import { Heart, ShoppingCart, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFavorites } from "@/hooks/useFavorites";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

const Wishlist = () => {
  const { user, isAuthenticated } = useAuth();
  const { favorites = [], isLoading, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();
  const { toast } = useToast();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <Heart className="w-16 h-16 mx-auto mb-4 text-blue-400" />
            <h2 className="text-2xl font-bold mb-2">로그인이 필요합니다</h2>
            <p className="text-gray-500 mb-6">
              찜 목록을 보려면 로그인해주세요.
            </p>
            <Link href="/login">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                로그인하기
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">불러오는 중...</p>
      </div>
    );
  }

  const handleRemove = (productId: string) => {
    toggleFavorite({ productId });
  };

  const handleAddToCart = (item: any) => {
    addToCart({
      productId: item.product_id,
      quantity: 1,
    });

    toast({
      title: "장바구니에 추가됨",
      description: `${item.products?.name || ""}이(가) 장바구니에 추가되었습니다.`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a] py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            찜한 상품
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {favorites.length}개의 상품이 찜 목록에 있습니다.
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <Package className="mx-auto h-24 w-24 text-gray-300 dark:text-gray-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              찜한 상품이 없습니다
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              관심있는 상품을 찜해보세요!
            </p>
            <Link href="/products">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                상품 둘러보기
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden hover:shadow-lg transition-shadow bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-700"
              >
                <div className="relative">
                  <img
                    src={item.products?.image_url || "/api/placeholder/300/300"}
                    alt={item.products?.name}
                    className="w-full h-48 object-cover"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-white/90 dark:bg-black/90 hover:bg-white dark:hover:bg-black"
                    onClick={() => handleRemove(item.product_id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                    {item.products?.description}
                  </p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      ₩{(item.products?.base_price || 0).toLocaleString()}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {new Date(item.created_at).toLocaleDateString()}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleAddToCart(item)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      size="sm"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      장바구니
                    </Button>
                    <Link href={`/product/${item.product_id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="dark:border-gray-600 dark:text-gray-300"
                      >
                        상세보기
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
