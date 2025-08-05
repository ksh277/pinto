import { useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  User,
  Star,
  ThumbsUp,
  Share2,
  ChevronRight,
  Send,
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";

export default function ReviewDetail() {
  const [, params] = useRoute("/reviews/:id");
  const { toast } = useToast();
  const { language, t } = useLanguage();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const reviewId = params?.id;

  if (!reviewId) {
    return <div>리뷰를 찾을 수 없습니다.</div>;
  }

  const reviewIdNumber = parseInt(reviewId);

  // Fetch review comments with count
  const { data: commentsData = { comments: [], commentsCount: 0 }, isLoading: isLoadingComments } = useQuery({
    queryKey: ["/api/reviews", reviewIdNumber, "comments"],
    queryFn: () => apiRequest(`/api/reviews/${reviewIdNumber}/comments`),
  });

  // Fetch review likes count
  const { data: likesData = { likesCount: 0 }, isLoading: isLoadingLikes } = useQuery({
    queryKey: ["/api/reviews", reviewIdNumber, "likes"],
    queryFn: () => apiRequest(`/api/reviews/${reviewIdNumber}/likes`),
  });

  // Fetch user's like status (if authenticated)
  const { data: likeStatus = { isLiked: false, likesCount: 0 } } = useQuery({
    queryKey: ["/api/reviews", reviewIdNumber, "likes/status"],
    queryFn: () => apiRequest(`/api/reviews/${reviewIdNumber}/likes/status`),
    retry: false, // Don't retry if not authenticated
  });

  // Like toggle mutation
  const likeMutation = useMutation({
    mutationFn: () =>
      apiRequest(`/api/reviews/${reviewIdNumber}/like`, {
        method: "POST",
      }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["/api/reviews", reviewIdNumber, "likes"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/reviews", reviewIdNumber, "likes/status"],
      });
      toast({
        title: data.action === "liked" ? "좋아요!" : "좋아요 취소",
        description: data.action === "liked" ? "이 리뷰를 좋아합니다." : "좋아요를 취소했습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error.message.includes("토큰") ? "로그인이 필요합니다." : "좋아요 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  // Comment submission mutation
  const commentMutation = useMutation({
    mutationFn: (content: string) =>
      apiRequest(`/api/reviews/${reviewIdNumber}/comments`, {
        method: "POST",
        body: { content },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/reviews", reviewIdNumber, "comments"],
      });
      setNewComment("");
      toast({
        title: "댓글이 작성되었습니다!",
        description: "댓글이 성공적으로 등록되었습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "댓글 작성 실패",
        description: error.message.includes("토큰") ? "로그인이 필요합니다." : "댓글 작성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitComment = () => {
    if (!newComment.trim()) {
      toast({
        title: "댓글 내용을 입력해주세요",
        description: "댓글을 작성하기 위해 내용을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    commentMutation.mutate(newComment.trim());
  };

  const handleLike = () => {
    likeMutation.mutate();
  };

  // Mock review data - in real app, this would fetch from API
  const mockReview = {
    id: parseInt(reviewId || "1"),
    title: "회전 스핀 아크릴 키링 제작 후기",
    content: `정말 만족스러운 제품이에요! 
    
처음에는 디자인이 복잡해서 잘 나올까 걱정했는데, 생각보다 훨씬 깔끔하고 선명하게 나왔습니다. 
특히 회전 기능이 정말 재미있고 실용적이에요.

배송도 빨라서 주문한 지 3일 만에 받았고, 포장도 정말 꼼꼼하게 되어 있었습니다.
친구들 반응도 너무 좋아서 몇 개 더 주문할 예정입니다.

다음에는 다른 디자인으로도 만들어보고 싶어요!`,
    author: "네기디***",
    authorLevel: "VIP",
    images: [
      "/api/placeholder/400/400",
      "/api/placeholder/400/400",
      "/api/placeholder/400/400",
      "/api/placeholder/400/400",
    ],
    rating: 5,
    category: "아크릴키링",
    createdAt: "2024-12-10",
    verified: true,
    helpful: 89,
    product: {
      id: 1,
      name: "아크릴 키링",
      price: "8,900원",
      image: "/api/placeholder/300/300",
    },
  };

  const relatedReviews = [
    {
      id: 2,
      title: "투명 아크릴 스탠드 DIY",
      author: "짱구***",
      image: "/api/placeholder/300/300",
      rating: 4,
      likes: 156,
    },
    {
      id: 3,
      title: "커스텀 폰케이스 제작",
      author: "디모***",
      image: "/api/placeholder/300/300",
      rating: 5,
      likes: 134,
    },
    {
      id: 4,
      title: "홀로그램 스티커 제작 후기",
      author: "모토***",
      image: "/api/placeholder/300/300",
      rating: 5,
      likes: 189,
    },
  ];

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "링크가 복사되었습니다!",
      description: "친구들에게 공유해보세요.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 py-4 text-sm">
            <Link
              href="/"
              className="text-gray-500 hover:text-gray-700"
            >
              홈
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link
              href="/community"
              className="text-gray-500 hover:text-gray-700"
            >
              커뮤니티
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium">
              후기 상세
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-white shadow-sm border-gray-200">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <Link href="/community">
                      <Button variant="ghost" size="sm">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        목록으로
                      </Button>
                    </Link>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-blue-100 text-blue-600 px-3 py-1">
                        {mockReview.category}
                      </Badge>
                      {mockReview.verified && (
                        <Badge className="bg-green-100 text-green-600 px-3 py-1">
                          인증된 구매
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    {mockReview.title}
                  </h1>

                  {/* Author Info */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">
                            {mockReview.author}
                          </span>
                          <Badge className="bg-purple-100 text-purple-600 text-xs px-2 py-1">
                            {mockReview.authorLevel}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{mockReview.createdAt}</span>
                          <div className="flex items-center space-x-1">
                            {[...Array(mockReview.rating)].map((_, i) => (
                              <Star
                                key={i}
                                className="w-4 h-4 fill-yellow-400 text-yellow-400"
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleShare}>
                      <Share2 className="w-4 h-4 mr-2" />
                      공유
                    </Button>
                  </div>

                  {/* Product Info */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-4">
                      <img
                        src={mockReview.product.image}
                        alt={mockReview.product.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {mockReview.product.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {mockReview.product.price}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Images */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {mockReview.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Review image ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ))}
                  </div>

                  {/* Content */}
                  <div className="prose prose-sm max-w-none mb-8">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {mockReview.content}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-6 border-t">
                    <div className="flex items-center space-x-6">
                      <button
                        onClick={handleLike}
                        disabled={likeMutation.isPending}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                          likeStatus.isLiked
                            ? "bg-red-50 text-red-600 border border-red-200"
                            : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        <Heart
                          className={`w-5 h-5 ${
                            likeStatus.isLiked ? "fill-current" : ""
                          }`}
                        />
                        <span>{likeStatus.likesCount || 0}</span>
                      </button>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <MessageCircle className="w-5 h-5" />
                        <span>{commentsData.commentsCount || 0}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <ThumbsUp className="w-5 h-5" />
                        <span>{mockReview.helpful}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Comments Section */}
              <Card className="bg-white shadow-sm border-gray-200 mt-6">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      댓글 ({commentsData.commentsCount || 0})
                    </h3>
                  </div>

                  {/* Comment Form */}
                  <div className="mb-6">
                    <div className="flex space-x-4">
                      <Input
                        placeholder="댓글을 입력해주세요..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleSubmitComment()
                        }
                        className="flex-1"
                      />
                      <Button
                        onClick={handleSubmitComment}
                        disabled={commentMutation.isPending || !newComment.trim()}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        작성
                      </Button>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-6">
                    {isLoadingComments ? (
                      <div className="text-center py-8 text-gray-500">
                        댓글을 불러오는 중...
                      </div>
                    ) : commentsData.comments && commentsData.comments.length > 0 ? (
                      commentsData.comments.map((comment: any, index: number) => (
                        <div key={comment.id || index} className="flex space-x-4">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-gray-500" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-gray-900">
                                {comment.userId || "익명"}
                              </span>
                              <span className="text-sm text-gray-500">
                                {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : "방금"}
                              </span>
                            </div>
                            <p className="text-gray-700">{comment.content}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Related Reviews */}
              <Card className="bg-white shadow-sm border-gray-200">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    관련 후기
                  </h3>
                  <div className="space-y-4">
                    {relatedReviews.map((review) => (
                      <Link
                        key={review.id}
                        href={`/reviews/${review.id}`}
                        className="block group"
                      >
                        <div className="flex space-x-3 p-3 rounded-lg group-hover:bg-gray-50 transition-colors">
                          <img
                            src={review.image}
                            alt={review.title}
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                              {review.title}
                            </h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-sm text-gray-500">
                                {review.author}
                              </span>
                              <div className="flex items-center space-x-1">
                                {[...Array(review.rating)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className="w-3 h-3 fill-yellow-400 text-yellow-400"
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 mt-1 text-sm text-gray-500">
                              <Heart className="w-3 h-3" />
                              <span>{review.likes}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}