import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Star,
  Search,
  Heart,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";

type ReviewAPI = {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  product: {
    id: number | null;
    name: string;
    price: number;
    thumbnail: string | null;
    categoryName: string;
  };
  images: string[];
  counts: { likes: number; comments: number };
  user: { id: number; username: string };
};
const SORT_OPTIONS = ["최신순", "평점순", "좋아요순"];

export default function ReviewsPage() {
  const { data: list = [], isLoading, error } = useQuery<ReviewAPI[]>({
    queryKey: ['/api/reviews', { limit: 20 }],
    queryFn: async () => {
      const res = await fetch('/api/reviews?limit=20');
      if (!res.ok) throw new Error('리뷰를 불러오는데 실패했습니다.');
      return res.json();
    },
    staleTime: 60_000,
  });

  const [filteredReviews, setFilteredReviews] = useState<ReviewAPI[]>([]);
  const [categories, setCategories] = useState<string[]>(['전체']);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [sortBy, setSortBy] = useState('최신순');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 6;

  useEffect(() => {
    setCategories(['전체', ...Array.from(new Set(list.map(r => r.product.categoryName)))]);
    let filtered = [...list];

    if (selectedCategory !== '전체') {
      filtered = filtered.filter(review => review.product.categoryName === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(review =>
        review.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.comment.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    switch (sortBy) {
      case '평점순':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case '좋아요순':
        filtered.sort((a, b) => b.counts.likes - a.counts.likes);
        break;
      case '최신순':
      default:
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    setFilteredReviews(filtered);
    setCurrentPage(1);
  }, [list, selectedCategory, sortBy, searchQuery]);

  const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);
  const startIndex = (currentPage - 1) * reviewsPerPage;
  const currentReviews = filteredReviews.slice(startIndex, startIndex + reviewsPerPage);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "w-4 h-4",
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        )}
      />
    ));
  };

  if (isLoading) {
    return <div className="p-8">로딩중...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">리뷰를 불러오는데 실패했습니다.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">사용후기</h1>
              <p className="text-gray-600">실제 고객들의 생생한 후기를 만나보세요</p>
            </div>
            <div className="text-sm text-gray-500">
              총 {filteredReviews.length}개의 후기
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="후기 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map(option => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {currentReviews.map((review) => (
            <Link key={review.id} href={`/reviews/${review.id}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-0">
                  {review.images.length > 0 ? (
                    <div className="grid grid-cols-2 gap-1">
                      {review.images.slice(0, 4).map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`review-${review.id}-${idx}`}
                          className="w-full aspect-square object-cover"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gray-100" />
                  )}

                  <div className="p-4">
                    {/* Product Summary */}
                    <div className="flex items-center space-x-3 mb-3">
                      {review.product.thumbnail && (
                        <img
                          src={review.product.thumbnail}
                          alt={review.product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div>
                        <div className="font-medium text-sm text-gray-900">
                          {review.product.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          [{review.product.categoryName}] {review.product.price.toLocaleString()}원
                        </div>
                      </div>
                    </div>

                    {/* User Info and Rating */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-500" />
                        </div>
                        <div>
                          <div className="font-medium text-sm text-gray-900">
                            {review.user.username}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(review.createdAt).toISOString().slice(0,10).replaceAll('-','.')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {renderStars(review.rating)}
                      </div>
                    </div>

                    {/* Review Text */}
                    <p className="text-sm text-gray-800 line-clamp-3 mb-3">
                      {review.comment}
                    </p>

                    {/* Counts */}
                    <div className="flex items-center space-x-4 text-sm text-gray-500 border-t pt-2">
                      <div className="flex items-center">
                        <Heart className="w-4 h-4 mr-1" />
                        {review.counts.likes}
                      </div>
                      <div className="flex items-center">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        {review.counts.comments}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center mt-12 space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              이전
            </Button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="min-w-[40px]"
              >
                {page}
              </Button>
            ))}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              다음
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Empty State */}
        {currentReviews.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <MessageCircle className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              검색 결과가 없습니다
            </h3>
            <p className="text-gray-600">
              다른 검색어나 필터를 시도해보세요
            </p>
          </div>
        )}
      </div>
    </div>
  );
}