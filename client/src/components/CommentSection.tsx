import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { MessageSquare, User, Send, Edit2, Trash2, Save, X } from 'lucide-react'
import { Link } from 'wouter'
import { useSupabaseAuth } from '@/components/SupabaseProvider'
import { useAuth } from '@/contexts/AuthContext'
import { NicknameSetupDialog } from '@/components/NicknameSetupDialog'
import { 
  usePostComments, 
  useCreatePostComment, 
  useUpdatePostComment, 
  useDeletePostComment,
  formatPostDate 
} from '@/hooks/useCommunityPosts'

interface CommentSectionProps {
  postId: string
  commentsCount?: number
}

interface CommentItemProps {
  comment: any
  currentUser: any
  onEdit: (commentId: string, newContent: string) => void
  onDelete: (commentId: string) => void
  isEditing: boolean
  onStartEdit: () => void
  onCancelEdit: () => void
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  currentUser,
  onEdit,
  onDelete,
  isEditing,
  onStartEdit,
  onCancelEdit
}) => {
  const [editContent, setEditContent] = useState(comment.content)
  const isOwner = currentUser && comment.user_id === currentUser.id

  const handleSaveEdit = () => {
    if (editContent.trim() !== comment.content) {
      onEdit(comment.id, editContent.trim())
    }
    onCancelEdit()
  }

  const handleCancelEdit = () => {
    setEditContent(comment.content)
    onCancelEdit()
  }

  return (
    <div className="flex items-start space-x-3 py-4">
      <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
        <User className="w-4 h-4 text-gray-300" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <span className="font-medium text-white text-sm">
            {comment.users?.nickname || comment.users?.username || comment.users?.email || '익명'}
          </span>
          <span className="text-xs text-gray-400">
            {formatPostDate(comment.created_at)}
          </span>
          {isOwner && !isEditing && (
            <div className="flex items-center space-x-1 ml-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={onStartEdit}
                className="text-gray-400 hover:text-white hover:bg-gray-700 p-1 h-auto"
              >
                <Edit2 className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(comment.id)}
                className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-1 h-auto"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
        
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="bg-[#1a1a1a] border-gray-600 text-white placeholder-gray-400 text-sm"
              rows={3}
            />
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                onClick={handleSaveEdit}
                disabled={!editContent.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-xs"
              >
                <Save className="w-3 h-3 mr-1" />
                저장
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelEdit}
                className="text-white border-gray-600 hover:bg-gray-700 text-xs"
              >
                <X className="w-3 h-3 mr-1" />
                취소
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
            {comment.content}
          </p>
        )}
      </div>
    </div>
  )
}

export const CommentSection: React.FC<CommentSectionProps> = ({ postId, commentsCount = 0 }) => {
  const { user } = useSupabaseAuth()
  const { user: authUser } = useAuth()
  const { data: comments, isLoading, error } = usePostComments(postId)
  const createComment = useCreatePostComment()
  const updateComment = useUpdatePostComment()
  const deleteComment = useDeletePostComment()

  const [commentContent, setCommentContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [showNicknameDialog, setShowNicknameDialog] = useState(false)

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !commentContent.trim()) {
      return
    }

    if (!authUser?.nickname) {
      setShowNicknameDialog(true)
      return
    }

    setIsSubmitting(true)
    try {
      await createComment.mutateAsync({
        post_id: postId,
        content: commentContent.trim()
      })
      setCommentContent('')
    } catch (error) {
      console.error('Error creating comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditComment = async (commentId: string, newContent: string) => {
    try {
      await updateComment.mutateAsync({
        commentId,
        content: newContent
      })
      setEditingCommentId(null)
    } catch (error) {
      console.error('Error updating comment:', error)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm('댓글을 삭제하시겠습니까?')) {
      try {
        await deleteComment.mutateAsync(commentId)
      } catch (error) {
        console.error('Error deleting comment:', error)
      }
    }
  }

  const actualCommentsCount = comments?.length || commentsCount

  return (
    <>
    <Card className="bg-[#1a1a1a] border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <MessageSquare className="w-5 h-5 mr-2" />
          댓글 {actualCommentsCount}개
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Comment Form */}
        {user ? (
          <form onSubmit={handleSubmitComment} className="mb-6">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-gray-300" />
              </div>
              <div className="flex-1">
                <Textarea
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="댓글을 입력하세요..."
                  rows={3}
                  className="bg-[#1a1a1a] border-gray-600 text-white placeholder-gray-400 mb-3"
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={!commentContent.trim() || isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isSubmitting ? '작성 중...' : '댓글 작성'}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="bg-[#1a1a1a] border border-gray-600 rounded-lg p-4 mb-6 text-center">
            <p className="text-gray-400 mb-4">
              댓글을 작성하려면 로그인이 필요합니다.
            </p>
            <Link href="/login">
              <Button className="bg-blue-600 hover:bg-blue-700">
                로그인
              </Button>
            </Link>
          </div>
        )}

        {/* Comments List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-600 rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-600 rounded w-1/4 animate-pulse"></div>
                  <div className="h-12 bg-gray-600 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <p className="text-red-400">
              댓글을 불러오는 중 오류가 발생했습니다.
            </p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="mt-4 text-white border-gray-600 hover:bg-gray-700"
            >
              다시 시도
            </Button>
          </div>
        ) : !comments || comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-400 mb-2">
              아직 댓글이 없습니다.
            </p>
            <p className="text-gray-500 text-sm">
              첫 번째 댓글을 남겨보세요!
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {comments.map((comment, index) => (
              <div key={comment.id}>
                <CommentItem
                  comment={comment}
                  currentUser={user}
                  onEdit={handleEditComment}
                  onDelete={handleDeleteComment}
                  isEditing={editingCommentId === comment.id}
                  onStartEdit={() => setEditingCommentId(comment.id)}
                  onCancelEdit={() => setEditingCommentId(null)}
                />
                {index < comments.length - 1 && (
                  <Separator className="bg-gray-600" />
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
    <NicknameSetupDialog
      open={showNicknameDialog}
      onOpenChange={setShowNicknameDialog}
      onSuccess={() => setShowNicknameDialog(false)}
    />
    </>
  )
}

export default CommentSection
