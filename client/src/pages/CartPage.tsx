import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  CreditCard,
  Package,
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useOrders } from "@/hooks/useOrders";
import { Link, useLocation } from "wouter";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useSupabaseAuth } from "@/components/SupabaseProvider";

const CartPage = () => {
  const [, setLocation] = useLocation();
  const {
    cartItems,
    cartTotal,
    itemCount,
    isLoadingCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    isUpdatingQuantity,
    isRemovingFromCart,
    isClearingCart,
  } = useCart();
  const { user: currentUser } = useSupabaseAuth();
  const { placeOrder, isPlacingOrder } = useOrders();

  const handlePlaceOrder = async () => {
    if (!cartItems || cartItems.length === 0) {
      return;
    }

    const order = await placeOrder(cartItems);
    if (order) {
      // Redirect to orders page after successful order placement
      setLocation("/orders");
    }
  };

  // Show message if Supabase is not configured
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-[#1a1a1a] border-gray-700">
              <CardContent className="p-8 text-center">
                <Package className="w-16 h-16 mx-auto mb-4 text-blue-400" />
                <h2 className="text-2xl font-bold mb-2">장바구니</h2>
                <p className="text-gray-400 mb-6">
                  Supabase 설정이 필요합니다. 환경 변수를 설정한 후 다시
                  시도해주세요.
                </p>
                <Link href="/products">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    상품 보러가기
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-white text-black">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-white border-gray-700">
              <CardContent className="p-8 text-center">
                <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-blue-400" />
                <h2 className="text-2xl font-bold mb-2">로그인이 필요합니다</h2>
                <p className="text-gray-400 mb-6">
                  장바구니를 확인하려면 로그인해주세요.
                </p>
                <div className="space-y-3">
                  <Link href="/auth">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      로그인하기
                    </Button>
                  </Link>
                  <Link href="/products">
                    <Button variant="outline" className="w-full">
                      상품 보러가기
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoadingCart) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-700 rounded mb-6"></div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-[#1a1a1a] border-gray-700">
              <CardContent className="p-8 text-center">
                <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h2 className="text-2xl font-bold mb-2">
                  장바구니가 비어있습니다
                </h2>
                <p className="text-gray-400 mb-6">
                  원하는 상품을 장바구니에 추가해보세요.
                </p>
                <Link href="/products">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Package className="w-4 h-4 mr-2" />
                    상품 보러가기
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">장바구니</h1>
              <p className="text-gray-400">
                {itemCount}개 상품 · 총 {formatPrice(cartTotal)}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/products">
                <Button
                  variant="outline"
                  className="text-white border-gray-600 hover:bg-gray-700"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  계속 쇼핑하기
                </Button>
              </Link>
              {cartItems.length > 0 && (
                <Button
                  onClick={() => clearCart()}
                  variant="outline"
                  disabled={isClearingCart}
                  className="text-red-400 border-red-400 hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  모두 삭제
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => {
                const product = item.products;
                const price = item.price || product?.base_price || 0;
                const subtotal = price * item.quantity;

                return (
                  <Card key={item.id} className="bg-[#1a1a1a] border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={product?.image_url || "/api/placeholder/80/80"}
                            alt={product?.name || "Product"}
                            className="w-20 h-20 object-cover rounded-md"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-white truncate">
                            {product?.name_ko ||
                              product?.name ||
                              "Unknown Product"}
                          </h3>
                          <p className="text-gray-400 text-sm mt-1">
                            {formatPrice(price)} × {item.quantity}
                          </p>
                          {!product?.is_available && (
                            <Badge variant="destructive" className="mt-2">
                              품절
                            </Badge>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() =>
                              updateQuantity({
                                cartItemId: item.id,
                                quantity: Math.max(1, item.quantity - 1),
                              })
                            }
                            disabled={isUpdatingQuantity || item.quantity <= 1}
                            className="w-8 h-8"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center font-semibold">
                            {item.quantity}
                          </span>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() =>
                              updateQuantity({
                                cartItemId: item.id,
                                quantity: item.quantity + 1,
                              })
                            }
                            disabled={isUpdatingQuantity}
                            className="w-8 h-8"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Price and Remove */}
                        <div className="text-right">
                          <p className="text-lg font-bold text-white">
                            {formatPrice(subtotal)}
                          </p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFromCart(item.id)}
                            disabled={isRemovingFromCart}
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20 mt-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="bg-[#1a1a1a] border-gray-700 sticky top-8">
                <CardHeader>
                  <CardTitle className="text-white">주문 요약</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">상품 금액</span>
                    <span className="text-white">{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">배송비</span>
                    <span className="text-white">무료</span>
                  </div>
                  <Separator className="bg-gray-600" />
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-white">총 결제금액</span>
                    <span className="text-white">{formatPrice(cartTotal)}</span>
                  </div>
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handlePlaceOrder}
                    disabled={
                      isPlacingOrder || cartItems.length === 0 || !currentUser
                    }
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    {isPlacingOrder ? "주문 처리 중..." : "주문하기"}
                  </Button>
                  <Link href="/products">
                    <Button
                      variant="outline"
                      className="w-full text-white border-gray-600 hover:bg-gray-700"
                    >
                      계속 쇼핑하기
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
