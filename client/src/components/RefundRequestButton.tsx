import React from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRefundRequestCheck } from "@/hooks/useRefundRequest";

interface RefundRequestButtonProps {
  orderId: number;
  orderAmount: number;
  orderDate: string;
  orderStatus: string;
  onRefundRequest: () => void;
}

export const RefundRequestButton: React.FC<RefundRequestButtonProps> = ({
  orderId,
  orderAmount,
  orderDate,
  orderStatus,
  onRefundRequest,
}) => {
  const { data: refundCheck, isLoading } = useRefundRequestCheck(orderId);

  // Don't show refund button for canceled orders
  if (orderStatus === "canceled") {
    return null;
  }
  if (orderStatus === "refund_requested") {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className="text-gray-500 cursor-not-allowed"
      >
        환불 요청됨
      </Button>
    );
  }
  // Show existing refund request status
  if (refundCheck?.exists) {
    const status = refundCheck.request?.status as
      | "pending"
      | "approved"
      | "rejected";
    const statusText =
      {
        pending: "환불 검토중",
        approved: "환불 승인됨",
        rejected: "환불 거절됨",
      }[status] || "환불 요청됨";

    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className="text-gray-500 cursor-not-allowed"
      >
        {statusText}
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onRefundRequest}
      disabled={isLoading}
      className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/20"
    >
      <RefreshCw className="h-3 w-3 mr-1" />
      환불 요청
    </Button>
  );
};
