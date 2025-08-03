import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/utils";
import { Link } from "wouter";
import { isSupabaseConfigured } from "@/lib/supabase";
import DeliveryTracking from "@/components/DeliveryTracking";

const OrdersPage = () => {
  const { user } = useAuth();
  const { orders, isLoading, error } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatOrderId = (orderId: string) => {
    // Format order ID for display (e.g., #ORD-1234)
    return `#${orderId.slice(0, 8).toUpperCase()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "payment_completed":
        return <Clock className="w-4 h-4" />;
      case "processing":
        return <Package className="w-4 h-4" />;
      case "shipping":
        return <Truck className="w-4 h-4" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4" />;
      case "canceled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "payment_completed":
        return "결제 완료";
      case "processing":
        return "제작 중";
      case "shipping":
        return "배송 중";
      case "delivered":
        return "배송 완료";
      case "canceled":
        return "주문 취소";
      default:
        return "결제 완료";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "payment_completed":
        return "bg-yellow-600";
      case "processing":
        return "bg-blue-600";
      case "shipping":
        return "bg-purple-600";
      case "delivered":
        return "bg-green-600";
      case "canceled":
        return "bg-red-600";
      default:
        return "bg-gray-600";
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
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h2 className="text-2xl font-bold mb-4 text-white">
                  주문 기능을 사용하려면 Supabase 설정이 필요합니다
                </h2>
                <p className="text-gray-400 mb-6">
                  .env 파일에 VITE_SUPABASE_URL과 VITE_SUPABASE_ANON_KEY를
                  설정해주세요.
                </p>
                <Link href="/">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    홈으로 돌아가기
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-[#1a1a1a] border-gray-700">
              <CardContent className="p-8 text-center">
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h2 className="text-2xl font-bold mb-4 text-white">
                  로그인이 필요합니다
                </h2>
                <p className="text-gray-400 mb-6">
                  주문 내역을 확인하려면 로그인이 필요합니다.
                </p>
                <Link href="/auth">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    로그인하기
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-white">주문 내역</h1>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="bg-[#1a1a1a] border-gray-700">
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-600 rounded w-1/4 mb-4"></div>
                      <div className="h-4 bg-gray-600 rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-gray-600 rounded w-1/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-[#1a1a1a] border-gray-700">
              <CardContent className="p-8 text-center">
                <XCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
                <h2 className="text-2xl font-bold mb-4 text-white">
                  오류가 발생했습니다
                </h2>
                <p className="text-gray-400 mb-6">
                  주문 내역을 불러오는 중 오류가 발생했습니다.
                </p>
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  다시 시도
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">주문 내역</h1>
              <p className="text-gray-400 mt-2">
                총 {orders.length}개의 주문이 있습니다
              </p>
            </div>
            <Link href="/cart">
              <Button
                variant="outline"
                className="text-white border-gray-600 hover:bg-gray-700"
              >
                장바구니로 가기
              </Button>
            </Link>
          </div>

          {/* Orders List */}
          {orders.length === 0 ? (
            <Card className="bg-[#1a1a1a] border-gray-700">
              <CardContent className="p-8 text-center">
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h2 className="text-2xl font-bold mb-4 text-white">
                  주문 내역이 없습니다
                </h2>
                <p className="text-gray-400 mb-6">
                  아직 주문한 상품이 없습니다. 상품을 주문해보세요!
                </p>
                <Link href="/products">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    상품 ��러보 ��
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const items = order.order_items ?? order.items ?? [];
                return (
                  <Card key={order.id} className="bg-[#1a1a1a] border-gray-700">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`p-2 rounded-full ${getStatusColor(order.status)}`}
                          >
                            {getStatusIcon(order.status)}
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-white text-lg md:text-xl">
                              주문번호: {formatOrderId(order.id)}
                            </CardTitle>
                            <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {formatDate(order.created_at)}
                              </span>
                              <span className="flex items-center">
                                <ShoppingBag className="w-4 h-4 mr-1" />
                                {items.length}개 상품
                              </span>
                            </div>
                          </div>
                        </div>
                        <Badge
                          className={`${getStatusColor(order.status)} text-white`}
                        >
                          {getStatusText(order.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Order Items */}
                        <div>
                          <h4 className="text-white font-semibold mb-2">
                            주문 상품
                          </h4>
                          <div className="space-y-2">
                            {order.items?.slice(0, 2).map((item, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between py-2 border-b border-gray-600 last:border-b-0"
                              >
                                <div className="flex-1">
                                  <p className="text-white font-medium">
                                    {item.product_name ||
                                      item.products?.name_ko ||
                                      item.products?.name ||
                                      "Unknown Product"}
                                  </p>
                                  <p className="text-gray-400 text-sm">
                                    수량: {item.quantity}개 | 단가:{" "}
                                    {formatPrice(item.price || item.unit_price)}
                                  </p>
                                  {item.options && (
                                    <div className="text-xs text-gray-400 mt-1">
                                      {Array.isArray(item.options)
                                        ? item.options.map((opt: any) => (
                                            <span
                                              key={opt.name}
                                              className="mr-2"
                                            >
                                              {opt.name}: {opt.value}
                                            </span>
                                          ))
                                        : null}
                                    </div>
                                  )}
                                  {item.design_data?.imageUrl && (
                                    <img
                                      src={item.design_data.imageUrl}
                                      alt="디자인 미리보기"
                                      className="w-10 h-10 rounded mt-1"
                                    />
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="text-white font-semibold">
                                    {formatPrice(
                                      (item.price || item.unit_price) *
                                        item.quantity,
                                    )}
                                  </p>
                                </div>
                              </div>
                            ))}
                            {items.length > 2 && (
                              <div className="text-center py-2">
                                <span className="text-gray-400 text-sm">
                                  및 {items.length - 2}개 상품 더...
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <Separator className="bg-gray-600" />

                        {/* Order Summary */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
                          <div>
                            <p className="text-gray-400">총 주문 금액</p>
                            <p className="text-2xl font-bold text-white">
                              {formatPrice(order.total_price)}
                            </p>
                          </div>
                          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-white border-gray-600 hover:bg-gray-700 w-full sm:w-auto"
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  상세보기
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-[#1a1a1a] border-gray-700">
                                <DialogHeader>
                                  <DialogTitle className="text-white flex items-center space-x-2">
                                    <Package className="w-5 h-5" />
                                    <span>주문 상세 정보</span>
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-6">
                                  {/* Order Header */}
                                  <div className="bg-[#1a1a1a] p-4 rounded-lg">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <div>
                                        <p className="text-gray-400 text-sm">
                                          주문번호
                                        </p>
                                        <p className="text-white font-semibold">
                                          {formatOrderId(order.id)}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-gray-400 text-sm">
                                          주문일시
                                        </p>
                                        <p className="text-white font-semibold">
                                          {formatDate(order.created_at)}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-gray-400 text-sm">
                                          주문상태
                                        </p>
                                        <Badge
                                          className={`${getStatusColor(order.status)} text-white`}
                                        >
                                          {getStatusText(order.status)}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Order Items */}
                                  <div>
                                    <h3 className="text-white font-semibold mb-4 flex items-center">
                                      <ShoppingBag className="w-4 h-4 mr-2" />
                                      주문 상품 ({items.length}개)
                                    </h3>
                                    <div className="space-y-3">
                                      {items.map((item: any, index: number) => (
                                        <Card
                                          key={index}
                                          className="bg-[#1a1a1a] border-gray-600"
                                        >
                                          <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                              <div className="flex-1">
                                                <h4 className="text-white font-medium mb-1">
                                                  {item.product_name ||
                                                    item.products?.name_ko ||
                                                    item.products?.name ||
                                                    "Unknown Product"}
                                                </h4>
                                                <div className="flex items-center space-x-4 text-sm text-gray-400">
                                                  <span>
                                                    수량: {item.quantity}개
                                                  </span>
                                                  <span>
                                                    단가:{" "}
                                                    {formatPrice(
                                                      item.price ||
                                                        item.unit_price,
                                                    )}
                                                  </span>
                                                </div>
                                                {item.options && (
                                                  <div className="mt-2 p-2 bg-gray-700 rounded">
                                                    <p className="text-xs text-gray-300">
                                                      맞춤 옵션
                                                    </p>
                                                    <pre className="text-xs text-gray-400 mt-1">
                                                      {JSON.stringify(
                                                        item.options,
                                                        null,
                                                        2,
                                                      )}
                                                    </pre>
                                                  </div>
                                                )}
                                                {item.design_data?.imageUrl && (
                                                  <div className="mt-2">
                                                    <img
                                                      src={
                                                        item.design_data
                                                          .imageUrl
                                                      }
                                                      alt="디자인 미리보기"
                                                      className="w-20 border rounded"
                                                    />
                                                  </div>
                                                )}
                                              </div>
                                              <div className="text-right">
                                                <p className="text-white font-semibold">
                                                  {formatPrice(
                                                    (item.price ||
                                                      item.unit_price) *
                                                      item.quantity,
                                                  )}
                                                </p>
                                              </div>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Order Summary */}
                                  <div className="bg-[#1a1a1a] p-4 rounded-lg">
                                    <div className="space-y-3">
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">
                                          상품 금액
                                        </span>
                                        <span className="text-white">
                                          {formatPrice(order.total_price)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">
                                          배송비
                                        </span>
                                        <span className="text-white">무료</span>
                                      </div>
                                      <Separator className="bg-gray-600" />
                                      <div className="flex justify-between text-lg font-bold">
                                        <span className="text-white">
                                          총 결제 금액
                                        </span>
                                        <span className="text-white">
                                          {formatPrice(order.total_price)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Delivery Tracking */}
                                  <div>
                                    <DeliveryTracking
                                      orderId={order.id}
                                      orderAmount={order.total_price}
                                      showAdminActions={
                                        user?.user_metadata?.role === "admin"
                                      }
                                    />
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            {order.status === "payment_completed" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-400 border-red-400 hover:bg-red-900/20 w-full sm:w-auto"
                              >
                                주문 취소
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
