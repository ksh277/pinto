import React, { useState, useEffect } from "react";
import {
  User,
  Package,
  Heart,
  Star,
  Settings,
  LogOut,
  Edit2,
  Eye,
  EyeOff,
  MessageSquare,
  ShoppingBag,
  Calendar,
  RefreshCw,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useSupabaseAuth } from "@/components/SupabaseProvider";
import { Link, useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/useLanguage";
import { RefundRequestModal } from "@/components/RefundRequestModal";
import { RefundRequestList } from "@/components/RefundRequestList";
import { RefundRequestButton } from "@/components/RefundRequestButton";
import { useRefundRequestCheck } from "@/hooks/useRefundRequest";

interface CommunityPost {
  id: string;
  title: string;
  content: string;
  created_at: string;
  category: string;
  comments_count: number;
  likes_count: number;
}

interface FavoriteProduct {
  id: string;
  product_id: string;
  created_at: string;
  products: {
    id: string;
    name: string;
    name_ko: string;
    base_price: number;
    image_url: string;
    category_id: string;
  };
}

interface UserOrder {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  order_items: any[];
}

export default function MyPageSupabase() {
  const { user: localUser, logout: localLogout } = useAuth();
  const { user: supabaseUser, signOut } = useSupabaseAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { t } = useLanguage();

  // Refund request state
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: localUser?.name || supabaseUser?.user_metadata?.name || "사용자",
    email: localUser?.email || supabaseUser?.email || "user@example.com",
    phone: localUser?.phone || "010-1234-5678",
    address: localUser?.address || "서울시 강남구 테헤란로 123",
    password: "••••••••",
  });

  const currentUser = supabaseUser || localUser;
  const isLoggedIn = !!currentUser;

  // 내가 쓴 글 조회
  const { data: myPosts, isLoading: postsLoading } = useQuery({
    queryKey: ["myPosts", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];

      const { data, error } = await supabase
        .from("community_posts")
        .select(
          `
          id,
          title,
          content,
          created_at,
          category,
          comments_count,
          likes_count
        `,
        )
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching posts:", error);
        return [];
      }

      return data || [];
    },
    enabled: isLoggedIn,
  });

  // 찜한 상품 조회
  const { data: myFavorites, isLoading: favoritesLoading } = useQuery({
    queryKey: ["myFavorites", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];

      const { data, error } = await supabase
        .from("favorites")
        .select(
          `
          id,
          product_id,
          created_at,
          products (
            id,
            name,
            name_ko,
            base_price,
            image_url,
            category_id
          )
        `,
        )
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching favorites:", error);
        return [];
      }

      return data || [];
    },
    enabled: isLoggedIn,
  });

  // 주문 내역 조회
  const { data: myOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ["myOrders", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];

      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          id,
          status,
          total_amount,
          created_at,
          order_items
        `,
        )
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error);
        return [];
      }

      return data || [];
    },
    enabled: isLoggedIn,
  });

  const handleLogout = async () => {
    try {
      if (supabaseUser) {
        await signOut();
      }

      if (localUser) {
        localLogout();
      }

      localStorage.removeItem("cart");
      localStorage.removeItem("wishlist");

      toast({
        title: "로그아웃 완료",
        description: "성공적으로 로그아웃되었습니다.",
      });

      setLocation("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleRemoveFavorite = async (favoriteId: string) => {
    try {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("id", favoriteId);

      if (error) {
        console.error("Error removing favorite:", error);
        return;
      }

      toast({
        title: "찜 해제",
        description: "찜 목록에서 제거되었습니다.",
      });

      // 쿼리 재실행으로 UI 업데이트
      window.location.reload();
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      payment_completed: {
        label: "결제 완료",
        icon: <Clock className="w-3 h-3 mr-1" />,
        color:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      },
      processing: {
        label: "제작 중",
        icon: <Package className="w-3 h-3 mr-1" />,
        color:
          "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      },
      shipping: {
        label: "배송 중",
        icon: <Truck className="w-3 h-3 mr-1" />,
        color:
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      },
      delivered: {
        label: "배송 완료",
        icon: <CheckCircle className="w-3 h-3 mr-1" />,
        color:
          "bg-gray-100 text-gray-800 dark:bg-[#1a1a1a]/30 dark:text-gray-300",
      },
      canceled: {
        label: "취소됨",
        icon: <XCircle className="w-3 h-3 mr-1" />,
        color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      },
    } as const;

    const info =
      statusMap[status as keyof typeof statusMap] ||
      statusMap.payment_completed;

    return (
      <Badge className={`flex items-center ${info.color}`}>
        {info.icon}
        {info.label}
      </Badge>
    );
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a] flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              로그인이 필요합니다
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              마이페이지를 이용하려면 로그인해주세요.
            </p>
            <div className="space-y-3">
              <Link href="/login">
                <Button className="w-full">로그인하기</Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" className="w-full">
                  회원가입
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userInfo.name}님
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  {userInfo.email}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  가입일:{" "}
                  {formatDate(
                    currentUser?.created_at || new Date().toISOString(),
                  )}
                </p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/20"
            >
              <LogOut className="h-4 w-4 mr-2" />
              로그아웃
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    내가 쓴 글
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {myPosts?.length || 0}
                  </p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    찜한 상품
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {myFavorites?.length || 0}
                  </p>
                </div>
                <Heart className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    주문 내역
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {myOrders?.length || 0}
                  </p>
                </div>
                <ShoppingBag className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="posts">내가 쓴 글</TabsTrigger>
            <TabsTrigger value="favorites">찜한 상품</TabsTrigger>
            <TabsTrigger value="orders">주문 내역</TabsTrigger>
            <TabsTrigger value="refunds">환불 요청</TabsTrigger>
          </TabsList>

          {/* 내가 쓴 글 */}
          <TabsContent value="posts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>내가 쓴 글</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {postsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="border rounded-lg p-4 animate-pulse"
                      >
                        <div className="h-4 bg-gray-200 dark:bg-[#1a1a1a] rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-[#1a1a1a] rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : myPosts && myPosts.length > 0 ? (
                  <div className="space-y-4">
                    {myPosts.map((post: CommunityPost) => (
                      <div
                        key={post.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                              {post.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                              {post.content}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                              <span>{formatDate(post.created_at)}</span>
                              <span>댓글 {post.comments_count || 0}</span>
                              <span>좋아요 {post.likes_count || 0}</span>
                              <Badge variant="outline" className="text-xs">
                                {post.category}
                              </Badge>
                            </div>
                          </div>
                          <Link href={`/community/${post.id}`}>
                            <Button variant="ghost" size="sm">
                              보기
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      아직 작성한 글이 없습니다.
                    </p>
                    <Link href="/community/write">
                      <Button>첫 글 작성하기</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 찜한 상품 */}
          <TabsContent value="favorites" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5" />
                  <span>찜한 상품</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {favoritesLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="border rounded-lg p-4 animate-pulse"
                      >
                        <div className="h-40 bg-gray-200 dark:bg-[#1a1a1a] rounded mb-4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-[#1a1a1a] rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-[#1a1a1a] rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : myFavorites && myFavorites.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {myFavorites.map((favorite: FavoriteProduct) => (
                      <div
                        key={favorite.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="relative">
                          <img
                            src={
                              favorite.products.image_url ||
                              "/api/placeholder/200/200"
                            }
                            alt={
                              favorite.products.name_ko ||
                              favorite.products.name
                            }
                            className="w-full h-40 object-cover rounded mb-4"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                            onClick={() => handleRemoveFavorite(favorite.id)}
                          >
                            <Heart className="h-4 w-4 text-red-500 fill-current" />
                          </Button>
                        </div>
                        <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                          {favorite.products.name_ko || favorite.products.name}
                        </h3>
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-2">
                          {formatPrice(favorite.products.base_price)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                          찜한 날짜: {formatDate(favorite.created_at)}
                        </p>
                        <div className="flex space-x-2">
                          <Link href={`/product/${favorite.products.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                            >
                              상품 보기
                            </Button>
                          </Link>
                          <Button size="sm" className="flex-1">
                            장바구니 추가
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      아직 찜한 상품이 없습니다.
                    </p>
                    <Link href="/category/acrylic">
                      <Button>상품 둘러보기</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 주문 내역 */}
          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>주문 내역</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="border rounded-lg p-4 animate-pulse"
                      >
                        <div className="h-4 bg-gray-200 dark:bg-[#1a1a1a] rounded w-1/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-[#1a1a1a] rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-[#1a1a1a] rounded w-1/3"></div>
                      </div>
                    ))}
                  </div>
                ) : myOrders && myOrders.length > 0 ? (
                  <div className="space-y-4">
                    {myOrders.map((order: UserOrder) => (
                      <div
                        key={order.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                              주문번호: {order.id}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                              주문일: {formatDate(order.created_at)}
                            </p>
                            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                              {formatPrice(order.total_amount)}
                            </p>
                          </div>
                          <div className="flex items-center space-x-3">
                            {getStatusBadge(order.status)}
                            <Link href={`/order/${order.id}`}>
                              <Button variant="outline" size="sm">
                                상세보기
                              </Button>
                            </Link>
                            <RefundRequestButton
                              orderId={parseInt(order.id)}
                              orderAmount={order.total_amount}
                              orderDate={order.created_at}
                              orderStatus={order.status}
                              onRefundRequest={() => {
                                setSelectedOrder(order);
                                setRefundModalOpen(true);
                              }}
                            />
                          </div>
                        </div>

                        {/* 주문 상품 목록 */}
                        {order.order_items && order.order_items.length > 0 && (
                          <div className="border-t pt-4">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                              주문 상품 ({order.order_items.length}개)
                            </h4>
                            <div className="space-y-2">
                              {order.order_items
                                .slice(0, 3)
                                .map((item: any, index: number) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between text-sm"
                                  >
                                    <span className="text-gray-600 dark:text-gray-300">
                                      {item.productName || `상품 ${index + 1}`}
                                    </span>
                                    <span className="text-gray-900 dark:text-white">
                                      {item.quantity}개 ×{" "}
                                      {formatPrice(item.price)}
                                    </span>
                                  </div>
                                ))}
                              {order.order_items.length > 3 && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  외 {order.order_items.length - 3}개 상품
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      아직 주문한 상품이 없습니다.
                    </p>
                    <Link href="/category/acrylic">
                      <Button>쇼핑 시작하기</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 환불 요청 */}
          <TabsContent value="refunds" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <RefreshCw className="h-5 w-5" />
                  <span>환불 요청</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RefundRequestList />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Refund Request Modal */}
      {selectedOrder && (
        <RefundRequestModal
          orderId={parseInt(selectedOrder.id)}
          isOpen={refundModalOpen}
          onClose={() => {
            setRefundModalOpen(false);
            setSelectedOrder(null);
          }}
          orderAmount={selectedOrder.total_amount}
          orderDate={selectedOrder.created_at}
        />
      )}
    </div>
  );
}
