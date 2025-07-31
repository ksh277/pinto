import React, { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Package,
  CreditCard,
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Printer,
  Calendar,
  DollarSign,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { RefundRequestButton } from "@/components/RefundRequestButton";

interface Order {
  id: number;
  user_id: number;
  status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  shipping_address: any;
  order_items: any[];
}

interface Payment {
  id: number;
  order_id: number;
  method: string;
  status: string;
  amount: number;
  created_at: string;
  transaction_id?: string;
}

interface ShippingInfo {
  id: number;
  order_id: number;
  recipient_name: string;
  recipient_phone: string;
  shipping_address: string;
  shipping_method: string;
  tracking_number?: string;
  shipping_status: string;
  created_at: string;
}

interface DeliveryTracking {
  id: number;
  order_id: number;
  courier_company: string;
  tracking_number: string;
  current_status: string;
  estimated_delivery: string;
  created_at: string;
}

interface PrintJob {
  id: number;
  order_id: number;
  status: string;
  print_details: any;
  created_at: string;
  completed_at?: string;
}

export default function OrderDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [refundReason, setRefundReason] = useState("");

  const orderId = id ? parseInt(id) : 0;

  // Fetch order data
  const {
    data: order,
    isLoading: orderLoading,
    error: orderError,
  } = useQuery<Order>({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) {
        throw new Error("주문 정보를 불러오는데 실패했습니다.");
      }
      return response.json();
    },
    enabled: !!orderId,
  });

  // Fetch payment data
  const { data: payment, isLoading: paymentLoading } = useQuery<Payment>({
    queryKey: ["payment", orderId],
    queryFn: async () => {
      const response = await fetch(`/api/payments/order/${orderId}`);
      if (!response.ok) {
        return null; // Payment info might not exist
      }
      return response.json();
    },
    enabled: !!orderId,
  });

  // Fetch shipping info
  const { data: shipping, isLoading: shippingLoading } = useQuery<ShippingInfo>(
    {
      queryKey: ["shipping", orderId],
      queryFn: async () => {
        const response = await fetch(`/api/shipping/${orderId}`);
        if (!response.ok) {
          return null; // Shipping info might not exist
        }
        return response.json();
      },
      enabled: !!orderId,
    },
  );

  // Fetch delivery tracking
  const { data: tracking, isLoading: trackingLoading } =
    useQuery<DeliveryTracking>({
      queryKey: ["delivery-tracking", orderId],
      queryFn: async () => {
        const response = await fetch(`/api/delivery-tracking/${orderId}`);
        if (!response.ok) {
          return null; // Tracking info might not exist
        }
        return response.json();
      },
      enabled: !!orderId,
    });

  // Fetch print job info
  const { data: printJob, isLoading: printJobLoading } = useQuery<PrintJob>({
    queryKey: ["print-job", orderId],
    queryFn: async () => {
      const response = await fetch(`/api/print-jobs/${orderId}`);
      if (!response.ok) {
        return null; // Print job info might not exist
      }
      return response.json();
    },
    enabled: !!orderId,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(price);
  };

  // Refund request mutation
  const refundMutation = useMutation({
    mutationFn: async () => {
      const token =
        localStorage.getItem("token") ||
        document.cookie.replace(
          /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
          "$1",
        );
      const response = await fetch(`/api/orders/${orderId}/refund`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          reason: refundReason || "환불 요청",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "환불 요청에 실패했습니다.");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "환불 요청 완료",
        description: data.message || "환불 요청이 성공적으로 접수되었습니다.",
      });
      // Refresh order data and refund request check
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({
        queryKey: ["refund-request-check", orderId],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "환불 요청 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRefundRequest = () => {
    if (refundMutation.isPending) return;
    refundMutation.mutate();
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      payment_completed: {
        label: "결제완료",
        color:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      },
      processing: {
        label: "처리중",
        color:
          "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      },
      shipping: {
        label: "배송중",
        color:
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      },
      delivered: {
        label: "배송완료",
        color:
          "bg-gray-100 text-gray-800 dark:bg-[#1a1a1a]/30 dark:text-gray-300",
      },
      canceled: {
        label: "취소됨",
        color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      },
      refund_requested: {
        label: "환불요청됨",
        color:
          "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
      },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || {
      label: status,
      color:
        "bg-gray-100 text-gray-800 dark:bg-[#1a1a1a]/30 dark:text-gray-300",
    };

    return <Badge className={statusInfo.color}>{statusInfo.label}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusMap = {
      pending: {
        label: "결제 대기",
        color:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      },
      completed: {
        label: "결제 완료",
        color:
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      },
      failed: {
        label: "결제 실패",
        color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      },
      refunded: {
        label: "환불 완료",
        color:
          "bg-gray-100 text-gray-800 dark:bg-[#1a1a1a]/30 dark:text-gray-300",
      },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || {
      label: status,
      color:
        "bg-gray-100 text-gray-800 dark:bg-[#1a1a1a]/30 dark:text-gray-300",
    };

    return <Badge className={statusInfo.color}>{statusInfo.label}</Badge>;
  };

  if (orderLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            주문 정보를 불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  if (orderError || !order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a] flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              주문을 찾을 수 없습니다
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              요청하신 주문 정보를 불러올 수 없습니다.
            </p>
            <Link href="/mypage">
              <Button>주문 내역으로 돌아가기</Button>
            </Link>
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                주문 상세
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                주문번호: {order.id}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusBadge(order.status)}
              <RefundRequestButton
                orderId={order.id}
                orderAmount={order.total_amount}
                orderDate={order.created_at}
                orderStatus={order.status}
                onRefundRequest={handleRefundRequest}
              />
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>주문 요약</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  주문일
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatDate(order.created_at)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  주문 상태
                </p>
                <div className="mt-1">{getStatusBadge(order.status)}</div>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  총 결제 금액
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatPrice(order.total_amount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="items" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="items">주문 상품</TabsTrigger>
            <TabsTrigger value="payment">결제 정보</TabsTrigger>
            <TabsTrigger value="shipping">배송 정보</TabsTrigger>
            <TabsTrigger value="tracking">배송 추적</TabsTrigger>
            <TabsTrigger value="print">제작 현황</TabsTrigger>
          </TabsList>

          {/* Order Items */}
          <TabsContent value="items" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>주문 상품</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {order.order_items && order.order_items.length > 0 ? (
                  <div className="space-y-4">
                    {order.order_items.map((item: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-start justify-between p-4 border rounded-lg dark:border-gray-700"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="w-16 h-16 bg-gray-200 dark:bg-[#1a1a1a] rounded-lg flex items-center justify-center">
                            <Package className="h-8 w-8 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {item.productName ||
                                item.products?.name_ko ||
                                `상품 ${index + 1}`}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              수량: {item.quantity}개
                            </p>
                            {Array.isArray(item.options) &&
                              item.options.length > 0 && (
                                <ul className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                                  {item.options.map((opt: any) => (
                                    <li key={opt.name}>
                                      <strong>{opt.name}</strong>: {opt.value}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            {item.design_data?.imageUrl && (
                              <div className="mt-2">
                                <img
                                  src={item.design_data.imageUrl}
                                  alt="디자인 미리보기"
                                  className="w-60 border rounded"
                                />
                              </div>
                            )}
                            {item.design_data && !item.design_data.imageUrl && (
                              <div className="mt-2 bg-gray-100 dark:bg-[#1a1a1a] p-2 rounded">
                                <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                  {JSON.stringify(item.design_data, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {formatPrice(
                              (item.price || item.unit_price || 0) *
                                item.quantity,
                            )}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            개당{" "}
                            {formatPrice(item.price || item.unit_price || 0)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    주문 상품 정보가 없습니다.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Info */}
          <TabsContent value="payment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>결제 정보</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {paymentLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 dark:bg-[#1a1a1a] rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-[#1a1a1a] rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-[#1a1a1a] rounded w-1/3"></div>
                  </div>
                ) : payment ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          결제 수단
                        </p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {payment.method}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          결제 상태
                        </p>
                        <div className="mt-1">
                          {getPaymentStatusBadge(payment.status)}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          결제 금액
                        </p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {formatPrice(payment.amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          결제 시각
                        </p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {formatDate(payment.created_at)}
                        </p>
                      </div>
                    </div>
                    {payment.transaction_id && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          거래 ID
                        </p>
                        <p className="text-sm font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-[#1a1a1a] p-2 rounded">
                          {payment.transaction_id}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    결제 정보가 없습니다.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shipping Info */}
          <TabsContent value="shipping" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>배송 정보</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {shippingLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 dark:bg-[#1a1a1a] rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-[#1a1a1a] rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-[#1a1a1a] rounded w-3/4"></div>
                  </div>
                ) : shipping ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          수령인
                        </p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {shipping.recipient_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          연락처
                        </p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {shipping.recipient_phone}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        배송 주소
                      </p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {shipping.shipping_address}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          배송 방법
                        </p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {shipping.shipping_method}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          배송 상태
                        </p>
                        <div className="mt-1">
                          {getStatusBadge(shipping.shipping_status)}
                        </div>
                      </div>
                    </div>
                    {shipping.tracking_number && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          운송장 번호
                        </p>
                        <p className="text-sm font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-[#1a1a1a] p-2 rounded">
                          {shipping.tracking_number}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    배송 정보가 없습니다.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Delivery Tracking */}
          <TabsContent value="tracking" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Truck className="h-5 w-5" />
                  <span>배송 추적</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {trackingLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 dark:bg-[#1a1a1a] rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-[#1a1a1a] rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-[#1a1a1a] rounded w-1/3"></div>
                  </div>
                ) : tracking ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          택배사
                        </p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {tracking.courier_company}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          운송장 번호
                        </p>
                        <p className="text-sm font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-[#1a1a1a] p-2 rounded">
                          {tracking.tracking_number}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          현재 상태
                        </p>
                        <div className="mt-1">
                          {getStatusBadge(tracking.current_status)}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          예상 도착일
                        </p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {formatDate(tracking.estimated_delivery)}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    배송 추적 정보가 없습니다.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Print Job Status */}
          <TabsContent value="print" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Printer className="h-5 w-5" />
                  <span>제작 현황</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {printJobLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 dark:bg-[#1a1a1a] rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-[#1a1a1a] rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-[#1a1a1a] rounded w-1/3"></div>
                  </div>
                ) : printJob ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          제작 상태
                        </p>
                        <div className="mt-1">
                          {getStatusBadge(printJob.status)}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          제작 시작일
                        </p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {formatDate(printJob.created_at)}
                        </p>
                      </div>
                    </div>
                    {printJob.completed_at && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          제작 완료일
                        </p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {formatDate(printJob.completed_at)}
                        </p>
                      </div>
                    )}
                    {printJob.print_details && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                          제작 상세
                        </p>
                        <div className="bg-gray-100 dark:bg-[#1a1a1a] p-4 rounded-lg">
                          <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {JSON.stringify(printJob.print_details, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    제작 현황 정보가 없습니다.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
