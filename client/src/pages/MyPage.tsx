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
import { supabase } from "@/lib/supabase";
import { Link } from "wouter";

export default function MyPage() {
  const { user: localUser, logout: localLogout } = useAuth();
  const { user: supabaseUser, signOut } = useSupabaseAuth();
  const { toast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [userInfo, setUserInfo] = useState({
    name: localUser?.name || supabaseUser?.user_metadata?.name || "사용자",
    email: localUser?.email || supabaseUser?.email || "user@example.com",
    phone: localUser?.phone || "",
    address: localUser?.address || "",
    nickname: localUser?.nickname || "",
    password: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Load user orders from Supabase
  useEffect(() => {
    const loadUserOrders = async () => {
      const currentUser = localUser || supabaseUser;
      if (!currentUser?.id) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", currentUser.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Failed to load orders:", error);
          toast({
            title: "오류",
            description: "주문 내역을 불러오지 못했습니다.",
            variant: "destructive",
          });
          return;
        }
        setOrders(data || []);
      } catch (error) {
        console.error("Error loading orders:", error);
        toast({
          title: "오류",
          description: "주문 내역을 불러오는 중 문제가 발생했습니다.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadUserOrders();
  }, [localUser?.id, supabaseUser?.id]);

  const handleLogout = async () => {
    try {
      // Supabase 로그아웃
      if (supabaseUser) {
        await signOut();
      }

      // 로컬 로그아웃
      if (localUser) {
        localLogout();
      }

      // 로컬 스토리지 정리
      localStorage.removeItem("cart");
      localStorage.removeItem("wishlist");

      toast({
        title: "로그아웃 완료",
        description: "성공적으로 로그아웃되었습니다.",
      });

      // 홈페이지로 리디렉션
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "로그아웃 오류",
        description: "로그아웃 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleSaveProfile = async () => {
    const currentUser = localUser || supabaseUser;
    if (!currentUser?.id) return;

    try {
      setLoading(true);

      // 기본 프로필 정보 업데이트
      const response = await fetch(`/api/users/${currentUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: userInfo.name.split(" ")[0],
          last_name: userInfo.name.split(" ")[1] || "",
          email: userInfo.email,
          phone: userInfo.phone,
          address: userInfo.address,
        }),
      });

      if (!response.ok) {
        throw new Error("프로필 업데이트 실패");
      }

      // 닉네임 업데이트 (별도 API 호출)
      if (userInfo.nickname && userInfo.nickname !== localUser?.nickname) {
        const nicknameResponse = await fetch(`/api/users/${currentUser.id}/nickname`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            nickname: userInfo.nickname,
          }),
        });

        if (!nicknameResponse.ok) {
          const errorData = await nicknameResponse.json();
          throw new Error(errorData.message || "닉네임 업데이트 실패");
        }
      }

      setIsEditing(false);
      toast({
        title: "프로필 수정 완료",
        description: "프로필 정보가 성공적으로 저장되었습니다.",
      });

    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "프로필 수정 실패",
        description: error instanceof Error ? error.message : "프로필 정보 저장에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    const currentUser = localUser || supabaseUser;
    if (!currentUser?.id) return;

    if (!userInfo.password || !userInfo.newPassword || !userInfo.confirmPassword) {
      toast({
        title: "입력 오류",
        description: "모든 비밀번호 필드를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (userInfo.newPassword !== userInfo.confirmPassword) {
      toast({
        title: "입력 오류",
        description: "새 비밀번호와 확인 비밀번호가 일치하지 않습니다.",
        variant: "destructive",
      });
      return;
    }

    if (userInfo.newPassword.length < 6) {
      toast({
        title: "입력 오류",
        description: "새 비밀번호는 6자 이상이어야 합니다.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/users/${currentUser.id}/password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          currentPassword: userInfo.password,
          newPassword: userInfo.newPassword,
        }),
      });

      if (response.ok) {
        setUserInfo(prev => ({
          ...prev,
          password: "",
          newPassword: "",
          confirmPassword: "",
        }));
        toast({
          title: "비밀번호 변경 완료",
          description: "비밀번호가 성공적으로 변경되었습니다.",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "비밀번호 변경 실패",
          description: errorData.message || "비밀번호 변경에 실패했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast({
        title: "비밀번호 변경 실패",
        description: "네트워크 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 주문 상태 표시 함수
  const StatusBadge = ({ status }: { status: string }) => {
    const statusMap = {
      payment_completed: {
        label: '결제 완료',
        icon: <Clock className="w-3 h-3 mr-1" />,
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      },
      processing: {
        label: '제작 중',
        icon: <Package className="w-3 h-3 mr-1" />,
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      },
      shipping: {
        label: '배송 중',
        icon: <Truck className="w-3 h-3 mr-1" />,
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      },
      delivered: {
        label: '배송 완료',
        icon: <CheckCircle className="w-3 h-3 mr-1" />,
        color: 'bg-gray-100 text-gray-800 dark:bg-[#1a1a1a]/30 dark:text-gray-300',
      },
      canceled: {
        label: '취소됨',
        icon: <XCircle className="w-3 h-3 mr-1" />,
        color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      },
    } as const;

    const info =
      statusMap[status as keyof typeof statusMap] || statusMap.payment_completed;

    return (
      <Badge className={`flex items-center ${info.color}`}>{info.icon}{info.label}</Badge>
    );
  };

  // 임시 주문 데이터 (데이터베이스에서 가져온 데이터가 없을 때 표시)
  const fallbackOrders = [
    {
      id: "ORD-2024-001",
      created_at: "2024-01-15",
      status: "배송완료",
      items: [{ name: "아크릴 키링", quantity: 2, price: 15000 }],
      total: 30000,
    },
    {
      id: "ORD-2024-002",
      date: "2024-01-10",
      status: "배송중",
      items: [{ name: "핸드폰 케이스", quantity: 1, price: 25000 }],
      total: 25000,
    },
  ];

  const currentUser = localUser || supabaseUser;

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a] py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <User className="mx-auto h-24 w-24 text-gray-300 dark:text-gray-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              로그인이 필요합니다
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              마이페이지를 이용하려면 로그인해주세요.
            </p>
            <Link href="/login">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                로그인하기
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a] py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            마이페이지
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {userInfo.name}님의 계정 정보와 주문 내역을 확인하세요.
          </p>
        </div>

        {/* 프로필 카드 */}
        <Card className="mb-8 bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-gray-900 dark:text-white">
              <span className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                프로필 정보
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                <LogOut className="h-4 w-4 mr-2" />
                로그아웃
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-gray-700 dark:text-gray-300">이름</Label>
                <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                  {userInfo.name}
                </div>
              </div>
              <div>
                <Label className="text-gray-700 dark:text-gray-300">
                  이메일
                </Label>
                <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                  {userInfo.email}
                </div>
              </div>
              <div>
                <Label className="text-gray-700 dark:text-gray-300">
                  가입일
                </Label>
                <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                  2024년 1월 1일
                </div>
              </div>
              <div>
                <Label className="text-gray-700 dark:text-gray-300">
                  회원등급
                </Label>
                <div className="mt-1">
                  <Badge variant="secondary" className="text-sm">
                    일반회원
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    총 주문
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {orders.length}건
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center">
                <Heart className="h-8 w-8 text-red-500" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    찜한 상품
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    0개
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    리뷰 작성
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    0개
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    적립금
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ₩0
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 탭 메뉴 */}
        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5 bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-700">
            <TabsTrigger
              value="orders"
              className="dark:text-gray-300 dark:data-[state=active]:bg-blue-600"
            >
              주문내역
            </TabsTrigger>
            <TabsTrigger
              value="wishlist"
              className="dark:text-gray-300 dark:data-[state=active]:bg-blue-600"
            >
              찜한상품
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="dark:text-gray-300 dark:data-[state=active]:bg-blue-600"
            >
              리뷰관리
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="dark:text-gray-300 dark:data-[state=active]:bg-blue-600"
            >
              개인정보수정
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="dark:text-gray-300 dark:data-[state=active]:bg-blue-600"
            >
              설정
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            <Card className="bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">
                  주문 내역
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="text-gray-600 dark:text-gray-300">
                        주문 내역을 불러오는 중...
                      </div>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
                      <p className="text-gray-600 dark:text-gray-300">
                        주문 내역이 없습니다.
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        첫 주문을 시작해보세요.
                      </p>
                    </div>
                  ) : (
                    orders.map((order) => (
                      <div
                        key={order.id}
                        className="border-b border-gray-200 dark:border-gray-700 pb-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              주문번호: {order.id}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {new Date(order.created_at).toLocaleDateString(
                                "ko-KR",
                              )}
                            </p>
                          </div>
                          {getStatusBadge(order.status)}
                        </div>
                        <div className="space-y-2">
                          {order.order_items?.map(
                            (item: any, index: number) => (
                              <div key={index} className="flex justify-between">
                                <span className="text-gray-900 dark:text-white">
                                  {item.products?.name_ko ||
                                    item.products?.name}{" "}
                                  x {item.quantity}
                                </span>
                                <span className="text-gray-900 dark:text-white">
                                  ₩{item.price.toLocaleString()}
                                </span>
                              </div>
                            ),
                          )}
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex justify-between font-semibold">
                            <span className="text-gray-900 dark:text-white">
                              총 금액:
                            </span>
                            <span className="text-blue-600 dark:text-blue-400">
                              ₩{order.total_amount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wishlist">
            <Card className="bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">
                  찜한 상품
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Heart className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-gray-600 dark:text-gray-300">
                    찜한 상품이 없습니다.
                  </p>
                  <Link href="/wishlist">
                    <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                      찜 목록 보기
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card className="bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">
                  리뷰 관리
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Star className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-gray-600 dark:text-gray-300">
                    작성한 리뷰가 없습니다.
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    구매한 상품에 대한 리뷰를 작성해보세요.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <div className="space-y-6">
              {/* 기본 정보 수정 */}
              <Card className="bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-gray-900 dark:text-white">
                    <span className="flex items-center">
                      <Edit2 className="h-5 w-5 mr-2" />
                      기본 정보 수정
                    </span>
                    {!isEditing ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        수정하기
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditing(false)}
                          disabled={loading}
                        >
                          취소
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveProfile}
                          disabled={loading}
                        >
                          {loading ? "저장 중..." : "저장"}
                        </Button>
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">
                        이름
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        value={userInfo.name}
                        onChange={(e) =>
                          setUserInfo({ ...userInfo, name: e.target.value })
                        }
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                        이메일
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={userInfo.email}
                        onChange={(e) =>
                          setUserInfo({ ...userInfo, email: e.target.value })
                        }
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">
                        휴대폰 번호
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={userInfo.phone}
                        onChange={(e) =>
                          setUserInfo({ ...userInfo, phone: e.target.value })
                        }
                        disabled={!isEditing}
                        placeholder="010-1234-5678"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="nickname" className="text-gray-700 dark:text-gray-300">
                        닉네임
                      </Label>
                      <Input
                        id="nickname"
                        type="text"
                        value={userInfo.nickname}
                        onChange={(e) =>
                          setUserInfo({ ...userInfo, nickname: e.target.value })
                        }
                        disabled={!isEditing}
                        placeholder="닉네임을 입력하세요"
                        className="mt-1"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="address" className="text-gray-700 dark:text-gray-300">
                        주소
                      </Label>
                      <Input
                        id="address"
                        type="text"
                        value={userInfo.address}
                        onChange={(e) =>
                          setUserInfo({ ...userInfo, address: e.target.value })
                        }
                        disabled={!isEditing}
                        placeholder="주소를 입력하세요"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 비밀번호 변경 */}
              <Card className="bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-900 dark:text-white">
                    <Settings className="h-5 w-5 mr-2" />
                    비밀번호 변경
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="currentPassword" className="text-gray-700 dark:text-gray-300">
                        현재 비밀번호
                      </Label>
                      <div className="relative mt-1">
                        <Input
                          id="currentPassword"
                          type={showPassword ? "text" : "password"}
                          value={userInfo.password}
                          onChange={(e) =>
                            setUserInfo({ ...userInfo, password: e.target.value })
                          }
                          placeholder="현재 비밀번호를 입력하세요"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="newPassword" className="text-gray-700 dark:text-gray-300">
                        새 비밀번호
                      </Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={userInfo.newPassword}
                        onChange={(e) =>
                          setUserInfo({ ...userInfo, newPassword: e.target.value })
                        }
                        placeholder="새 비밀번호를 입력하세요"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-300">
                        비밀번호 확인
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={userInfo.confirmPassword}
                        onChange={(e) =>
                          setUserInfo({ ...userInfo, confirmPassword: e.target.value })
                        }
                        placeholder="새 비밀번호를 다시 입력하세요"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    <Button
                      onClick={handleChangePassword}
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {loading ? "변경 중..." : "비밀번호 변경"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-gray-900 dark:text-white">
                  <span>개인정보 설정</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                    className="dark:border-gray-600 dark:text-gray-300"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    {isEditing ? "취소" : "편집"}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-700 dark:text-gray-300">
                      이름
                    </Label>
                    <Input
                      value={userInfo.name}
                      onChange={(e) =>
                        setUserInfo({ ...userInfo, name: e.target.value })
                      }
                      disabled={!isEditing}
                      className="mt-1 dark:bg-[#1a1a1a] dark:text-white dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700 dark:text-gray-300">
                      이메일
                    </Label>
                    <Input
                      value={userInfo.email}
                      onChange={(e) =>
                        setUserInfo({ ...userInfo, email: e.target.value })
                      }
                      disabled={!isEditing}
                      className="mt-1 dark:bg-[#1a1a1a] dark:text-white dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700 dark:text-gray-300">
                      전화번호
                    </Label>
                    <Input
                      value={userInfo.phone}
                      onChange={(e) =>
                        setUserInfo({ ...userInfo, phone: e.target.value })
                      }
                      disabled={!isEditing}
                      className="mt-1 dark:bg-[#1a1a1a] dark:text-white dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700 dark:text-gray-300">
                      주소
                    </Label>
                    <Input
                      value={userInfo.address}
                      onChange={(e) =>
                        setUserInfo({ ...userInfo, address: e.target.value })
                      }
                      disabled={!isEditing}
                      className="mt-1 dark:bg-[#1a1a1a] dark:text-white dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700 dark:text-gray-300">
                      비밀번호
                    </Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={userInfo.password}
                        onChange={(e) =>
                          setUserInfo({ ...userInfo, password: e.target.value })
                        }
                        disabled={!isEditing}
                        className="mt-1 pr-10 dark:bg-[#1a1a1a] dark:text-white dark:border-gray-600"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-1 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                  </div>
                  {isEditing && (
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        className="dark:border-gray-600 dark:text-gray-300"
                      >
                        취소
                      </Button>
                      <Button
                        onClick={handleSaveProfile}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {loading ? "저장 중..." : "저장"}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
