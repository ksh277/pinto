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

  // Fetch review comments
  const { data: comments = [], isLoading: isLoadingComments } = useQuery({
    queryKey: ["/api/reviews", reviewIdNumber, "comments"],
    queryFn: () => apiRequest(`/api/reviews/${reviewIdNumber}/comments`),
  });

  // Fetch review likes
  const {
    data: likesData = { count: 0, userIds: [] },
    isLoading: isLoadingLikes,
  } = useQuery({
    queryKey: ["/api/reviews", reviewIdNumber, "likes"],
    queryFn: () => apiRequest(`/api/reviews/${reviewIdNumber}/likes`),
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
        description: error.message || "댓글 작성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  // Like toggle mutation
  const likeMutation = useMutation({
    mutationFn: () =>
      apiRequest(`/api/reviews/${reviewIdNumber}/like`, {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/reviews", reviewIdNumber, "likes"],
      });
    },
    onError: (error: any) => {
      toast({
        title: "좋아요 처리 실패",
        description: error.message || "좋아요 처리 중 오류가 발생했습니다.",
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
    likes: 245,
    comments: 18,
    views: 1234,
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
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a]">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-[#1a1a1a] border-b dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 py-4 text-sm">
            <Link
              href="/"
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              홈
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <Link
              href="/community"
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              커뮤니티
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <span className="text-gray-900 dark:text-white font-medium">
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
              <Card className="bg-white dark:bg-[#1a1a1a] shadow-sm border-gray-200 dark:border-gray-700">
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
                      <Badge className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-100 px-3 py-1">
                        {mockReview.category}
                      </Badge>
                      {mockReview.verified && (
                        <Badge className="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-100 px-3 py-1">
                          인증된 구매
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Title and Rating */}
                  <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      {mockReview.title}
                    </h1>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{mockReview.author}</span>
                        <Badge variant="secondary" className="text-xs">
                          {mockReview.authorLevel}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < mockReview.rating
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300 dark:text-gray-600"
                            }`}
                          />
                        ))}
                        <span className="ml-1 font-medium">
                          {mockReview.rating}.0
                        </span>
                      </div>
                      <span>{mockReview.createdAt}</span>
                    </div>
                  </div>

                  {/* Images */}
                  <div className="mb-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {mockReview.images.map((image, index) => (
                        <div
                          key={index}
                          className="aspect-square bg-gray-100 rounded-lg overflow-hidden"
                        >
                          <img
                            src={image}
                            alt={`후기 이미지 ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="mb-8">
                    <div className="text-gray-700 dark:text-white whitespace-pre-line leading-relaxed">
                      {mockReview.content}
                    </div>
                  </div>

                  <Separator className="my-6" />

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={handleLike}
                        className={`flex items-center space-x-2 transition-colors ${
                          likesData.userIds.includes(1)
                            ? "text-red-500"
                            : "text-gray-500 hover:text-red-500"
                        }`}
                        disabled={likeMutation.isPending}
                      >
                        <Heart
                          className={`w-5 h-5 ${likesData.userIds.includes(1) ? "fill-current" : ""}`}
                        />
                        <span className="font-medium">{likesData.count}</span>
                      </button>
                      <div className="flex items-center space-x-2 text-gray-500">
                        <MessageCircle className="w-5 h-5" />
                        <span className="font-medium">{comments.length}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-500">
                        <ThumbsUp className="w-5 h-5" />
                        <span className="font-medium">
                          {mockReview.helpful}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleShare}
                      className="flex items-center space-x-2"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>공유</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Comments Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="bg-white dark:bg-[#1a1a1a] shadow-sm border-gray-200 dark:border-gray-700 mt-6">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                      댓글 ({comments.length})
                    </h3>

                    {/* Comment Form */}
                    <div className="mb-6">
                      <div className="flex space-x-3">
                        <div className="flex-1">
                          <Input
                            placeholder="댓글을 입력하세요..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmitComment();
                              }
                            }}
                            className="border-gray-200 dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-white"
                          />
                        </div>
                        <Button
                          onClick={handleSubmitComment}
                          disabled={
                            commentMutation.isPending || !newComment.trim()
                          }
                          size="sm"
                          className="px-4"
                        >
                          {commentMutation.isPending ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-4">
                      {isLoadingComments ? (
                        <div className="space-y-4">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex space-x-3">
                              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                              <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24" />
                                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : comments.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          첫 번째 댓글을 작성해보세요!
                        </div>
                      ) : (
                        comments.map((comment: any) => (
                          <div
                            key={comment.id}
                            className="flex space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                          >
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-gray-900 dark:text-white text-sm">
                                  {comment.users?.first_name ||
                                    comment.users?.username ||
                                    "익명"}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(
                                    comment.created_at,
                                  ).toLocaleDateString("ko-KR")}
                                </span>
                              </div>
                              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                                {comment.content}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Related Product */}
              <Card className="bg-white shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-bold text-gray-900 mb-4">관련 상품</h3>
                  <div className="flex items-center space-x-4">
                    <img
                      src={mockReview.product.image}
                      alt={mockReview.product.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {mockReview.product.name}
                      </h4>
                      <p className="text-sm text-gray-500 mb-2">
                        {mockReview.product.price}
                      </p>
                      <Link href={`/product/${mockReview.product.id}`}>
                        <Button size="sm" className="w-full">
                          상품 보기
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Related Reviews */}
              <Card className="bg-white shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-bold text-gray-900 mb-4">관련 후기</h3>
                  <div className="space-y-4">
                    {relatedReviews.map((review) => (
                      <Link key={review.id} href={`/reviews/${review.id}`}>
                        <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                          <img
                            src={review.image}
                            alt={review.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 text-sm truncate">
                              {review.title}
                            </h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs text-gray-500">
                                {review.author}
                              </span>
                              <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 ${
                                      i < review.rating
                                        ? "text-yellow-400 fill-current"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <Heart className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                {review.likes}
                              </span>
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
