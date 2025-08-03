import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Heart,
  MessageCircle,
  Calendar,
  User,
  Trash2,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { apiRequest } from "@/lib/queryClient";
import { formatDistance } from "date-fns";
import { ko } from "date-fns/locale";
import type { CommunityPost, CommunityComment } from "@shared/schema";

interface CommentWithUser {
  id: number;
  post_id: number;
  user_id: number;
  comment: string;
  created_at: string;
  username: string;
  first_name?: string;
  last_name?: string;
}

interface PostWithUser {
  id: number;
  title: string;
  content?: string;
  description?: string;
  image_url?: string;
  likes: number;
  user_id: number;
  created_at: string;
  username: string;
  first_name?: string;
  last_name?: string;
}

export default function CommunityPostDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");

  const { data: post, isLoading: postLoading } = useQuery<PostWithUser>({
    queryKey: ["/api/community/posts", id],
    enabled: !!id,
  });

  const { data: comments, isLoading: commentsLoading } = useQuery<
    CommentWithUser[]
  >({
    queryKey: ["/api/community/posts", id, "comments"],
    enabled: !!id,
  });

  const createCommentMutation = useMutation({
    mutationFn: async (comment: string) => {
      return apiRequest(`/api/community/posts/${id}/comments`, {
        method: "POST",
        body: JSON.stringify({
          user_id: user?.id,
          comment,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/community/posts", id, "comments"],
      });
      setNewComment("");
      toast({
        title: "댓글이 등록되었습니다",
        description: "새로운 댓글이 성공적으로 등록되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "댓글 등록 실패",
        description: "댓글을 등록하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      return apiRequest(`/api/community/posts/${id}/comments/${commentId}`, {
        method: "DELETE",
        body: JSON.stringify({
          user_id: user?.id,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/community/posts", id, "comments"],
      });
      toast({
        title: "댓글이 삭제되었습니다",
        description: "댓글이 성공적으로 삭제되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "댓글 삭제 실패",
        description: "댓글을 삭제하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitComment = () => {
    if (!user) {
      toast({
        title: "로그인이 필요합니다",
        description: "댓글을 작성하려면 로그인해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) {
      toast({
        title: "댓글을 입력해주세요",
        description: "댓글 내용을 입력하신 후 등록해주세요.",
        variant: "destructive",
      });
      return;
    }

    createCommentMutation.mutate(newComment);
  };

  const handleDeleteComment = (commentId: number) => {
    if (!user) return;

    if (window.confirm("댓글을 삭제하시겠습니까?")) {
      deleteCommentMutation.mutate(commentId);
    }
  };

  if (postLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a] p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-[#1a1a1a] rounded mb-4"></div>
            <div className="h-96 bg-gray-200 dark:bg-[#1a1a1a] rounded mb-4"></div>
            <div className="h-24 bg-gray-200 dark:bg-[#1a1a1a] rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-20 dark:bg-[#1a1a1a] p-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            게시글을 찾을 수 없습니다
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            요청하신 게시글이 존재하지 않거나 삭제되었을 수 있습니다.
          </p>
        </div>
      </div>
    );
  }

  const displayName =
    post.first_name && post.last_name
      ? `${post.first_name} ${post.last_name}`
      : post.username;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a] p-4">
      <div className="max-w-4xl mx-auto">
        {/* Post Content */}
        <Card className="mb-6 bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {displayName}
                  </h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {formatDistance(new Date(post.created_at), new Date(), {
                        addSuffix: true,
                        locale: ko,
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                  <Heart className="w-4 h-4" />
                  <span className="text-sm">{post.likes}</span>
                </div>
                <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">{comments?.length || 0}</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {post.title || "제목 없음"}
              </h1>
              {post.description && (
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {post.description}
                </p>
              )}
            </div>
            {post.image_url && (
              <div className="mb-4">
                <img
                  src={post.image_url}
                  alt="Post image"
                  className="w-full max-w-2xl mx-auto rounded-lg shadow-md"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card className="bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-700">
          <CardHeader>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              댓글 {comments?.length || 0}개
            </h2>
          </CardHeader>
          <CardContent>
            {/* New Comment Form */}
            {user ? (
              <div className="mb-6">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="댓글을 입력하세요..."
                      className="min-h-[80px] border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white"
                      maxLength={500}
                    />
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {newComment.length}/500
                      </span>
                      <Button
                        onClick={handleSubmitComment}
                        disabled={
                          createCommentMutation.isPending || !newComment.trim()
                        }
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Send className="w-4 h-4 mr-1" />
                        {createCommentMutation.isPending
                          ? "등록 중..."
                          : "댓글 등록"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-[#1a1a1a] rounded-lg">
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  댓글을 작성하려면 로그인해주세요.
                </p>
              </div>
            )}

            {/* Comments List */}
            {commentsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gray-200 dark:bg-[#1a1a1a] rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 dark:bg-[#1a1a1a] rounded w-1/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-[#1a1a1a] rounded w-3/4 mb-1"></div>
                        <div className="h-3 bg-gray-200 dark:bg-[#1a1a1a] rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : comments && comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => {
                  const commentDisplayName =
                    comment.first_name && comment.last_name
                      ? `${comment.first_name} ${comment.last_name}`
                      : comment.username;

                  return (
                    <div
                      key={comment.id}
                      className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {commentDisplayName}
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {formatDistance(
                                  new Date(comment.created_at),
                                  new Date(),
                                  {
                                    addSuffix: true,
                                    locale: ko,
                                  },
                                )}
                              </span>
                            </div>
                            {user && String(user.id) === String(comment.user_id) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteComment(comment.id)}
                                disabled={deleteCommentMutation.isPending}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 mt-1 leading-relaxed">
                            {comment.comment}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  아직 댓글이 없습니다.
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                  첫 번째 댓글을 작성해보세요!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
