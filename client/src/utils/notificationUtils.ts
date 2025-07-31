import { apiRequest } from "@/lib/queryClient";

export interface CreateNotificationData {
  user_id: number;
  type: "comment" | "like" | "order" | "system";
  title: string;
  message: string;
  related_id?: number;
  related_type?: string;
  related_url?: string;
}

export const createNotification = async (data: CreateNotificationData) => {
  try {
    const response = await apiRequest("/api/notifications", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.json();
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

// Helper functions for common notification types
export const createCommentNotification = (
  userId: number,
  postTitle: string,
  commenterName: string,
  postId: number,
) => {
  return createNotification({
    user_id: userId,
    type: "comment",
    title: "새 댓글이 달렸습니다",
    message: `${commenterName}님이 "${postTitle}" 게시물에 댓글을 달았습니다.`,
    related_id: postId,
    related_type: "post",
    related_url: `/community/${postId}`,
  });
};

export const createLikeNotification = (
  userId: number,
  postTitle: string,
  likerName: string,
  postId: number,
) => {
  return createNotification({
    user_id: userId,
    type: "like",
    title: "좋아요를 받았습니다",
    message: `${likerName}님이 "${postTitle}" 게시물을 좋아합니다.`,
    related_id: postId,
    related_type: "post",
    related_url: `/community/${postId}`,
  });
};

export const createOrderNotification = (
  userId: number,
  orderStatus: string,
  orderId: number,
) => {
  const statusMessages = {
    payment_completed: "결제가 완료되었습니다",
    processing: "주문이 제작 중입니다",
    shipping: "주문이 배송 중입니다",
    delivered: "주문이 배송 완료되었습니다",
    canceled: "주문이 취소되었습니다",
  };

  return createNotification({
    user_id: userId,
    type: "order",
    title: "주문 상태 업데이트",
    message:
      statusMessages[orderStatus as keyof typeof statusMessages] ||
      "주문 상태가 변경되었습니다",
    related_id: orderId,
    related_type: "order",
    related_url: `/mypage?tab=orders`,
  });
};

export const createSystemNotification = (
  userId: number,
  title: string,
  message: string,
  relatedUrl?: string,
) => {
  return createNotification({
    user_id: userId,
    type: "system",
    title,
    message,
    related_url: relatedUrl,
  });
};

// Create sample notifications for testing
export const createSampleNotifications = async (userId: number) => {
  const notifications = [
    {
      user_id: userId,
      type: "comment" as const,
      title: "새 댓글이 달렸습니다",
      message: '김철수님이 "아크릴 키링 후기" 게시물에 댓글을 달았습니다.',
      related_id: 1,
      related_type: "post",
      related_url: "/community/1",
    },
    {
      user_id: userId,
      type: "like" as const,
      title: "좋아요를 받았습니다",
      message: '이영희님이 "스마트톡 디자인 공유" 게시물을 좋아합니다.',
      related_id: 2,
      related_type: "post",
      related_url: "/community/2",
    },
    {
      user_id: userId,
      type: "order" as const,
      title: "주문 상태 업데이트",
      message: "주문 #12345가 배송 중입니다. 예상 도착일: 2024-01-20",
      related_id: 12345,
      related_type: "order",
      related_url: "/mypage?tab=orders",
    },
    {
      user_id: userId,
      type: "system" as const,
      title: "회원 등급 업데이트",
      message:
        "축하합니다! SPECIAL 등급으로 승급하셨습니다. 더 많은 혜택을 누리세요!",
      related_url: "/rewards",
    },
    {
      user_id: userId,
      type: "comment" as const,
      title: "새 댓글이 달렸습니다",
      message: '박민수님이 "포카홀더 제작 문의" 게시물에 댓글을 달았습니다.',
      related_id: 3,
      related_type: "post",
      related_url: "/community/3",
    },
  ];

  try {
    const results = await Promise.all(
      notifications.map((notification) => createNotification(notification)),
    );
    return results;
  } catch (error) {
    console.error("Error creating sample notifications:", error);
    throw error;
  }
};
