import { useState } from "react";
import { Link } from "wouter";
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
  User,
  Calendar,
  Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

interface ReviewSummary {
  id: string;
  title: string;
  userName: string;
  userLevel?: string;
  rating: number;
  reviewSummary: string;
  productName: string;
  productCategory: string;
  mainImage: string;
  date: string;
  likes: number;
  views: number;
  comments: number;
  isVerifiedPurchase: boolean;
  tags: string[];
}

// Mock review data - will connect to real database
const MOCK_REVIEW_LIST: ReviewSummary[] = [
  {
    id: "1",
    title: "회전 스핀 아크릴 키링 제작 후기",
    userName: "네기디***",
    userLevel: "VIP",
    rating: 5,
    reviewSummary: "정말 만족스러운 제품이에요! 디자인이 복잡했는데도 깔끔하게 나왔습니다.",
    productName: "아크릴 키링",
    productCategory: "키링",
    mainImage: "/api/placeholder/200/200",
    date: "2024.12.15",
    likes: 267,
    views: 1234,
    comments: 18,
    isVerifiedPurchase: true,
    tags: ["품질좋음", "빠른배송"]
  },
  {
    id: "2",
    title: "투명 아크릴 스탠드 DIY 후기",
    userName: "짱구***",
    userLevel: "일반",
    rating: 4,
    reviewSummary: "처음 제작해봤는데 생각보다 쉽고 결과물도 만족스러워요.",
    productName: "아크릴 스탠드",
    productCategory: "스탠드",
    mainImage: "/api/placeholder/200/200",
    date: "2024.12.14",
    likes: 156,
    views: 890,
    comments: 12,
    isVerifiedPurchase: true,
    tags: ["DIY", "투명"]
  },
  {
    id: "3",
    title: "커스텀 폰케이스 제작 완전 성공!",
    userName: "디모***",
    userLevel: "골드",
    rating: 5,
    reviewSummary: "내가 원하던 디자인 그대로 나왔어요. 친구들도 부러워해요!",
    productName: "폰케이스",
    productCategory: "케이스",
    mainImage: "/api/placeholder/200/200",
    date: "2024.12.13",
    likes: 234,
    views: 1567,
    comments: 25,
    isVerifiedPurchase: true,
    tags: ["커스텀", "디자인"]
  },
  {
    id: "4",
    title: "홀로그램 스티커 제작 후기",
    userName: "모토***",
    userLevel: "VIP",
    rating: 5,
    reviewSummary: "홀로그램 효과가 진짜 예뻐요. 노트북에 붙여놨는데 너무 만족!",
    productName: "홀로그램 스티커",
    productCategory: "스티커",
    mainImage: "/api/placeholder/200/200",
    date: "2024.12.12",
    likes: 189,
    views: 723,
    comments: 9,
    isVerifiedPurchase: true,
    tags: ["홀로그램", "예쁨"]
  },
  {
    id: "5",
    title: "포카홀더 제작했어요",
    userName: "이다현***",
    userLevel: "일반",
    rating: 4,
    reviewSummary: "사이즈도 딱 맞고 투명도도 좋아요. 포카 보관하기 좋습니다.",
    productName: "포토카드 홀더",
    productCategory: "홀더",
    mainImage: "/api/placeholder/200/200",
    date: "2024.12.11",
    likes: 145,
    views: 456,
    comments: 7,
    isVerifiedPurchase: true,
    tags: ["포카", "투명"]
  },
  {
    id: "6",
    title: "스마트톡 실용성 최고!",
    userName: "주영현***",
    userLevel: "골드",
    rating: 5,
    reviewSummary: "핸드폰 떨어뜨릴 걱정 없어서 너무 좋아요. 디자인도 마음에 들어요.",
    productName: "스마트톡",
    productCategory: "스마트톡",
    mainImage: "/api/placeholder/200/200",
    date: "2024.12.10",
    likes: 278,
    views: 901,
    comments: 15,
    isVerifiedPurchase: true,
    tags: ["실용적", "안전"]
  },
  {
    id: "7",
    title: "뱃지 퀄리티 대박이에요",
    userName: "박서연***",
    userLevel: "일반",
    rating: 5,
    reviewSummary: "색상 재현도가 정말 좋고 마감도 깔끔해요. 또 주문할게요!",
    productName: "아크릴 뱃지",
    productCategory: "뱃지",
    mainImage: "/api/placeholder/200/200",
    date: "2024.12.09",
    likes: 167,
    views: 634,
    comments: 11,
    isVerifiedPurchase: true,
    tags: ["색상좋음", "마감깔끔"]
  },
  {
    id: "8",
    title: "키링 선물용으로 완벽해요",
    userName: "김민지***",
    userLevel: "VIP",
    rating: 4,
    reviewSummary: "친구 생일선물로 만들었는데 너무 좋아해요. 포장도 예뻤어요.",
    productName: "아크릴 키링",
    productCategory: "키링",
    mainImage: "/api/placeholder/200/200",
    date: "2024.12.08",
    likes: 203,
    views: 789,
    comments: 13,
    isVerifiedPurchase: true,
    tags: ["선물", "포장좋음"]
  },
  {
    id: "9",
    title: "스탠드 안정성 좋아요",
    userName: "최유진***",
    userLevel: "골드",
    rating: 4,
    reviewSummary: "무거운 태블릿도 안정적으로 지탱해요. 각도 조절도 편해요.",
    productName: "아크릴 스탠드",
    productCategory: "스탠드",
    mainImage: "/api/placeholder/200/200",
    date: "2024.12.07",
    likes: 134,
    views: 567,
    comments: 8,
    isVerifiedPurchase: true,
    tags: ["안정적", "각도조절"]
  },
  {
    id: "10",
    title: "투명 케이스 깔끔해요",
    userName: "정하늘***",
    userLevel: "일반",
    rating: 5,
    reviewSummary: "투명해서 폰 색상이 그대로 보여서 좋아요. 두께도 적당해요.",
    productName: "투명 폰케이스",
    productCategory: "케이스",
    mainImage: "/api/placeholder/200/200",
    date: "2024.12.06",
    likes: 189,
    views: 678,
    comments: 16,
    isVerifiedPurchase: true,
    tags: ["투명", "두께적당"]
  },
  {
    id: "11",
    title: "홀로그램 뱃지 반짝반짝",
    userName: "송지은***",
    userLevel: "VIP",
    rating: 5,
    reviewSummary: "홀로그램 효과가 정말 예뻐요. 가방에 달고 다녀요.",
    productName: "홀로그램 뱃지",
    productCategory: "뱃지",
    mainImage: "/api/placeholder/200/200",
    date: "2024.12.05",
    likes: 245,
    views: 892,
    comments: 19,
    isVerifiedPurchase: true,
    tags: ["홀로그램", "반짝"]
  },
  {
    id: "12",
    title: "스티커 퀄리티 대만족",
    userName: "윤서아***",
    userLevel: "골드",
    rating: 4,
    reviewSummary: "방수도 되고 색상도 선명해요. 노트북 데코용으로 최고!",
    productName: "방수 스티커",
    productCategory: "스티커",
    mainImage: "/api/placeholder/200/200",
    date: "2024.12.04",
    likes: 178,
    views: 543,
    comments: 12,
    isVerifiedPurchase: true,
    tags: ["방수", "선명"]
  }
];

export default function ReviewsListPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [sortBy, setSortBy] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 12;

  // Filter and sort reviews
  const filteredReviews = MOCK_REVIEW_LIST.filter(review => {
    const matchesSearch = review.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.reviewSummary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "전체" || review.productCategory === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case "likes":
        return b.likes - a.likes;
      case "views":
        return b.views - a.views;
      case "rating":
        return b.rating - a.rating;
      case "latest":
      default:
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedReviews.length / reviewsPerPage);
  const startIndex = (currentPage - 1) * reviewsPerPage;
  const currentReviews = sortedReviews.slice(startIndex, startIndex + reviewsPerPage);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              "h-4 w-4",
              i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            )}
          />
        ))}
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
          {rating}.0
        </span>
      </div>
    );
  };

  const getUserLevelBadge = (level?: string) => {
    if (!level) return null;
    
    const levelColors = {
      "VIP": "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
      "골드": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
      "일반": "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    };

    return (
      <Badge className={cn("text-xs", levelColors[level as keyof typeof levelColors] || levelColors["일반"])}>
        {level}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a]">
      {/* Header */}
      <div className="bg-white dark:bg-[#1a1a1a] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t({ ko: "사용후기", en: "Customer Reviews", ja: "カスタマーレビュー", zh: "客户评价" })}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t({ ko: "실제 고객들의 생생한 제품 후기를 확인해보세요", en: "Check out authentic reviews from real customers", ja: "実際のお客様の生の声をご確認ください", zh: "查看真实客户的产品评价" })}
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder={t({ ko: "후기 검색...", en: "Search reviews...", ja: "レビューを検索...", zh: "搜索评价..." })}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-center">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="전체">전체</SelectItem>
                  <SelectItem value="키링">키링</SelectItem>
                  <SelectItem value="스탠드">스탠드</SelectItem>
                  <SelectItem value="케이스">케이스</SelectItem>
                  <SelectItem value="스티커">스티커</SelectItem>
                  <SelectItem value="뱃지">뱃지</SelectItem>
                  <SelectItem value="홀더">홀더</SelectItem>
                  <SelectItem value="스마트톡">스마트톡</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">최신순</SelectItem>
                  <SelectItem value="likes">좋아요순</SelectItem>
                  <SelectItem value="views">조회수순</SelectItem>
                  <SelectItem value="rating">평점순</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {currentReviews.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400 mb-4">
              <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">검색 결과가 없습니다</p>
              <p className="text-sm">다른 검색어나 필터를 시도해보세요</p>
            </div>
          </div>
        ) : (
          <>
            {/* Results Info */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                총 <span className="font-semibold text-gray-900 dark:text-white">{filteredReviews.length}</span>개의 후기
              </p>
            </div>

            {/* Reviews Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentReviews.map((review) => (
                <Link key={review.id} href={`/reviews/${review.id}`}>
                  <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer bg-white dark:bg-gray-800 overflow-hidden">
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={review.mainImage}
                        alt={review.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Title */}
                        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {review.title}
                        </h3>

                        {/* Rating */}
                        {renderStars(review.rating)}

                        {/* User Info */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {review.userName}
                            </span>
                            {getUserLevelBadge(review.userLevel)}
                          </div>
                          {review.isVerifiedPurchase && (
                            <Badge variant="secondary" className="text-xs">
                              구매확인
                            </Badge>
                          )}
                        </div>

                        {/* Product */}
                        <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                          {review.productName}
                        </div>

                        {/* Review Summary */}
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {review.reviewSummary}
                        </p>

                        {/* Stats */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center space-x-1">
                              <span>👍</span>
                              <span>{review.likes}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Eye className="h-3 w-3" />
                              <span>{review.views}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span>💬</span>
                              <span>{review.comments}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                            <Calendar className="h-3 w-3" />
                            <span>{review.date}</span>
                          </div>
                        </div>

                        {/* Tags */}
                        {review.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {review.tags.slice(0, 2).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                >
                  이전
                </Button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <Button
                    key={i + 1}
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(i + 1)}
                    className="w-8"
                  >
                    {i + 1}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                >
                  다음
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}