import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Filter,
  Heart,
  MessageCircle,
  Share2,
  ChevronLeft,
  ChevronRight,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Review {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  reviewText: string;
  productName: string;
  productCategory: string;
  images: string[];
  date: string;
  likes: number;
  isVerifiedPurchase: boolean;
  tags: string[];
}

// Mock review data - replace with real API data
const MOCK_REVIEWS: Review[] = [
  {
    id: "1",
    userName: "주영현 번명월",
    rating: 5,
    reviewText: "정말 좋네요! 내 아들이 너무 좋아해서 계속 만들어는 예정이고 지금꺼지 굉장히 만족해요!",
    productName: "아크릴 키링",
    productCategory: "키링",
    images: ["/api/placeholder/200/200"],
    date: "2024.08.15",
    likes: 267,
    isVerifiedPurchase: true,
    tags: ["품질좋음", "빠른배송"]
  },
  {
    id: "2",
    userName: "이다현 배우",
    rating: 5,
    reviewText: "처음 인쇄해본 케이크 꾸미기 솜씨가 행상되는 늘을 수 있게해주셔서 너무 편리하고요",
    productName: "포토카드 홀더",
    productCategory: "홀더",
    images: ["/api/placeholder/200/200"],
    date: "2024.08.14",
    likes: 412,
    isVerifiedPurchase: true,
    tags: ["디자인좋음"]
  },
  {
    id: "3",
    userName: "주영현 번명월",
    rating: 4,
    reviewText: "아크릴 제품 새워서 정말 굳슝카리한선정은 섰는 데 적질이 낭 편차맨에 너무 걱정이..",
    productName: "스마트톡",
    productCategory: "스마트톡",
    images: ["/api/placeholder/200/200"],
    date: "2024.08.13",
    likes: 356,
    isVerifiedPurchase: true,
    tags: ["실용적"]
  },
  {
    id: "4",
    userName: "이다현 배우",
    rating: 5,
    reviewText: "배우민 기념악의 투어에서 만출이니다. 실서니라 작고 굽 넘 케어만셔서 닫가 이뤄..",
    productName: "뱃지",
    productCategory: "뱃지",
    images: ["/api/placeholder/200/200"],
    date: "2024.08.12",
    likes: 430,
    isVerifiedPurchase: true,
    tags: ["기념품"]
  },
  {
    id: "5",
    userName: "이다현 배우",
    rating: 5,
    reviewText: "아크릴에서 케이크 어디던 숨층이신니다. 싶서니라 작고 굽 넘 케어만셔서 닫가 이뤄넓서 김답시...",
    productName: "아크릴 원형 뱃지",
    productCategory: "뱃지",
    images: ["/api/placeholder/200/200"],
    date: "2024.08.11",
    likes: 388,
    isVerifiedPurchase: true,
    tags: ["아크릴", "고품질"]
  },
  {
    id: "6",
    userName: "박서연",
    rating: 5,
    reviewText: "퀄리티가 정말 좋아요! 색감도 선명하고 내구성도 뛰어나네요. 다음에도 주문할게요!",
    productName: "포토카드",
    productCategory: "포토카드",
    images: ["/api/placeholder/200/200"],
    date: "2024.08.10",
    likes: 245,
    isVerifiedPurchase: true,
    tags: ["포토카드", "고화질"]
  }
];

const CATEGORIES = ["전체", "키링", "스마트톡", "뱃지", "포토카드", "홀더"];
const SORT_OPTIONS = ["최신순", "평점순", "좋아요순"];

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [sortBy, setSortBy] = useState("최신순");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 6;

  // Filter and sort reviews
  useEffect(() => {
    let filtered = [...reviews];

    // Filter by category
    if (selectedCategory !== "전체") {
      filtered = filtered.filter(review => review.productCategory === selectedCategory);
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(review =>
        review.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.reviewText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.userName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort reviews
    switch (sortBy) {
      case "평점순":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "좋아요순":
        filtered.sort((a, b) => b.likes - a.likes);
        break;
      case "최신순":
      default:
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
    }

    setFilteredReviews(filtered);
    setCurrentPage(1);
  }, [reviews, selectedCategory, sortBy, searchQuery]);

  // Pagination
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

  const handleLike = (reviewId: string) => {
    setReviews(prev => prev.map(review =>
      review.id === reviewId 
        ? { ...review, likes: review.likes + 1 }
        : review
    ));
  };

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
                  {CATEGORIES.map(category => (
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentReviews.map((review) => (
            <Card key={review.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                {/* Review Image */}
                <div className="relative aspect-square">
                  <img
                    src={review.images[0]}
                    alt={review.productName}
                    className="w-full h-full object-cover"
                  />
                  {review.isVerifiedPurchase && (
                    <Badge className="absolute top-2 left-2 bg-green-500 text-white text-xs">
                      구매 인증
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white text-gray-700"
                    onClick={() => handleLike(review.id)}
                  >
                    <Heart className="w-4 h-4 mr-1" />
                    {review.likes}
                  </Button>
                </div>

                {/* Review Content */}
                <div className="p-4">
                  {/* User Info and Rating */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-500" />
                      </div>
                      <div>
                        <div className="font-medium text-sm text-gray-900">
                          {review.userName}
                        </div>
                        <div className="text-xs text-gray-500">{review.date}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {renderStars(review.rating)}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="text-sm text-gray-600 mb-2">
                    [{review.productCategory}] {review.productName}
                  </div>

                  {/* Review Text */}
                  <p className="text-sm text-gray-800 line-clamp-3 mb-3">
                    {review.reviewText}
                  </p>

                  {/* Tags */}
                  {review.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {review.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center space-x-3">
                      <Button variant="ghost" size="sm" className="text-gray-500">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        댓글
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-500">
                        <Share2 className="w-4 h-4 mr-1" />
                        공유
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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