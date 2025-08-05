import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, Gift, ShoppingCart, Star, TrendingUp, Clock, Plus, Minus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

interface PointHistory {
  id: number;
  userId: number;
  type: "earn" | "use";
  source: string;
  amount: number;
  balance: number;
  createdAt: string;
}

interface UserPoints {
  points: number;
  history: PointHistory[];
}

export default function PointsGuide() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user points
  const { data: userPoints, isLoading: isPointsLoading } = useQuery<UserPoints>({
    queryKey: [`/api/users/${user?.id}/points`],
    enabled: !!user?.id,
  });

  // Earn points mutation for testing
  const earnPointsMutation = useMutation({
    mutationFn: async ({ amount, source }: { amount: number; source: string }) => {
      return apiRequest(`/api/points/earn`, {
        method: "POST",
        body: JSON.stringify({ amount, source }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/points`] });
      toast({
        title: "포인트 적립 완료",
        description: "포인트가 성공적으로 적립되었습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "포인트 적립 실패",
        description: error.message || "포인트 적립에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  // Use points mutation for testing
  const usePointsMutation = useMutation({
    mutationFn: async ({ amount, source }: { amount: number; source: string }) => {
      return apiRequest(`/api/points/use`, {
        method: "POST",
        body: JSON.stringify({ amount, source }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/points`] });
      toast({
        title: "포인트 사용 완료",
        description: "포인트가 성공적으로 사용되었습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "포인트 사용 실패",
        description: error.message || "포인트 사용에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTypeIcon = (type: string) => {
    return type === "earn" ? (
      <Plus className="w-4 h-4 text-green-600" />
    ) : (
      <Minus className="w-4 h-4 text-red-600" />
    );
  };

  const getTypeColor = (type: string) => {
    return type === "earn" ? "text-green-600" : "text-red-600";
  };

  const pointEarningMethods = [
    {
      icon: <Star className="w-6 h-6 text-yellow-500" />,
      title: "리뷰 작성",
      description: "제품 리뷰 작성 시 50P 적립",
      points: "+50P",
    },
    {
      icon: <ShoppingCart className="w-6 h-6 text-blue-500" />,
      title: "구매 적립",
      description: "구매 금액의 1% 포인트 적립",
      points: "+1%",
    },
    {
      icon: <Gift className="w-6 h-6 text-purple-500" />,
      title: "이벤트 참여",
      description: "각종 이벤트 참여 시 포인트 적립",
      points: "+다양",
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-green-500" />,
      title: "회원 등급",
      description: "회원 등급에 따른 추가 적립",
      points: "+보너스",
    },
  ];

  const pointUsageMethods = [
    {
      title: "할인 쿠폰",
      description: "1,000P = 1,000원 할인 쿠폰",
      minPoints: "1,000P",
    },
    {
      title: "배송비 무료",
      description: "3,000P로 배송비 무료",
      minPoints: "3,000P",
    },
    {
      title: "굿즈 교환",
      description: "한정판 굿즈와 포인트 교환",
      minPoints: "5,000P~",
    },
    {
      title: "현금 할인",
      description: "결제 시 포인트 직접 사용",
      minPoints: "100P~",
    },
  ];

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <Coins className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">포인트 가이드</h1>
          <p className="text-gray-600 mb-6">로그인 후 포인트를 확인하고 사용해보세요!</p>
          <Button onClick={() => window.location.href = "/login"}>
            로그인하기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Coins className="w-8 h-8 text-yellow-500" />
          포인트 가이드
        </h1>
        <p className="text-gray-600">
          포인트를 모아서 다양한 혜택을 받아보세요!
        </p>
      </div>

      {/* Current Points Card */}
      <Card className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Coins className="w-6 h-6 text-yellow-500" />
              내 포인트
            </span>
            {isPointsLoading ? (
              <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
            ) : (
              <Badge variant="outline" className="text-lg px-3 py-1 bg-white">
                {userPoints?.points?.toLocaleString() || 0}P
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            현재 보유 중인 포인트입니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => earnPointsMutation.mutate({ amount: 50, source: "테스트 적립" })}
              disabled={earnPointsMutation.isPending}
            >
              테스트 적립 (+50P)
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => usePointsMutation.mutate({ amount: 100, source: "테스트 사용" })}
              disabled={usePointsMutation.isPending || (userPoints?.points || 0) < 100}
            >
              테스트 사용 (-100P)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Point Earning Methods */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>포인트 적립 방법</CardTitle>
          <CardDescription>
            다양한 방법으로 포인트를 적립해보세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {pointEarningMethods.map((method, index) => (
              <div key={index} className="flex items-start gap-3 p-4 rounded-lg border bg-gray-50">
                {method.icon}
                <div className="flex-1">
                  <h3 className="font-semibold">{method.title}</h3>
                  <p className="text-sm text-gray-600">{method.description}</p>
                </div>
                <Badge variant="secondary">{method.points}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Point Usage Methods */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>포인트 사용 방법</CardTitle>
          <CardDescription>
            모은 포인트로 다양한 혜택을 받아보세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {pointUsageMethods.map((method, index) => (
              <div key={index} className="flex items-start gap-3 p-4 rounded-lg border bg-gray-50">
                <Gift className="w-6 h-6 text-purple-500" />
                <div className="flex-1">
                  <h3 className="font-semibold">{method.title}</h3>
                  <p className="text-sm text-gray-600">{method.description}</p>
                </div>
                <Badge variant="outline">{method.minPoints}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Point History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            포인트 내역
          </CardTitle>
          <CardDescription>
            최근 포인트 적립 및 사용 내역입니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isPointsLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
                  <div className="animate-pulse bg-gray-200 h-10 w-10 rounded-full"></div>
                  <div className="flex-1">
                    <div className="animate-pulse bg-gray-200 h-4 w-32 mb-1 rounded"></div>
                    <div className="animate-pulse bg-gray-200 h-3 w-24 rounded"></div>
                  </div>
                  <div className="animate-pulse bg-gray-200 h-6 w-16 rounded"></div>
                </div>
              ))}
            </div>
          ) : userPoints?.history?.length ? (
            <div className="space-y-3">
              {userPoints.history.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border bg-gray-50">
                  <div className="p-2 rounded-full bg-white">
                    {getTypeIcon(item.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{item.source}</h4>
                    <p className="text-sm text-gray-600">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${getTypeColor(item.type)}`}>
                      {item.type === "earn" ? "+" : ""}{item.amount.toLocaleString()}P
                    </p>
                    <p className="text-sm text-gray-600">
                      잔액: {item.balance.toLocaleString()}P
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>아직 포인트 내역이 없습니다</p>
              <p className="text-sm">첫 번째 리뷰를 작성해서 포인트를 받아보세요!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}