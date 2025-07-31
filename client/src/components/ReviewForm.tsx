import { useState } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useSupabaseAuth } from "@/components/SupabaseProvider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { createReview } from "@/lib/supabaseApi";

interface ReviewFormProps {
  productId: string;
  onSubmitted?: () => void;
}

export default function ReviewForm({
  productId,
  onSubmitted,
}: ReviewFormProps) {
  const { user } = useSupabaseAuth();
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("로그인이 필요합니다.");
      return;
    }
    if (rating < 1 || rating > 5) {
      setError("평점을 선택해주세요.");
      return;
    }
    if (!content.trim()) {
      setError("내용을 입력해주세요.");
      return;
    }
    setSubmitting(true);
    setError(null);

    const { data: ordered } = await supabase
      .from("order_items")
      .select("id, orders!inner(user_id)")
      .eq("product_id", productId)
      .eq("orders.user_id", user.id)
      .limit(1)
      .maybeSingle();

    if (!ordered) {
      setError("구매한 상품에 대해서만 리뷰를 남길 수 있습니다.");
      setSubmitting(false);
      return;
    }

    const { data: existing } = await supabase
      .from("reviews")
      .select("id")
      .eq("product_id", productId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      setError("이미 리뷰를 작성하셨습니다.");
      setSubmitting(false);
      return;
    }

    try {
      await createReview({
        user_id: user.id,
        product_id: productId,
        rating,
        content,
      });
      setRating(0);
      setContent("");
      onSubmitted?.();
    } catch (err) {
      setError("리뷰 등록에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            onClick={() => setRating(i)}
            className={cn(
              "w-5 h-5 cursor-pointer",
              i <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300",
            )}
          />
        ))}
      </div>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[80px]"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" disabled={submitting}>
        {submitting ? "등록 중..." : "리뷰 등록"}
      </Button>
    </form>
  );
}
