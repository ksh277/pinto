import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Heart,
  MessageCircle,
  ShoppingCart,
  Eye,
  ArrowRight,
  ChevronRight,
  Puzzle,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Hero } from "@/components/Hero";
import { CategoryNav } from "@/components/CategoryNav";
import { SectionHeader } from "@/components/SectionHeader";
import { ProductCardSkeleton } from "@/components/ProductCardSkeleton";
import { ProductCard } from "@/components/ProductCard";
import { HotProductPreview } from "@/components/HotProductPreview";
import { PopularBox } from "@/components/PopularBox";
import { InstagramFeed } from "@/components/InstagramFeed";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import type { Product } from "@shared/schema";

type CreatorReview = {
  id: number;
  productImage: string;
  productName: string;
  userName: string;
  rating: number;
  date: string;
  reviewCount: number;
  comment: string;
  tags: string[];
};

type CommunityItem = {
  id: number;
  image: string;
  title: string;
  likes: number;
  comments: number;
  tags: string[];
  author: string;
};

type MaterialReco = {
  id: number;
  image: string;
  title: string;
  price: number;
  originalPrice?: number | null;
  reviewCount: number;
  badge: string;
  material: string;
  discount: number;
};

export default function Home() {
  const { toast } = useToast();
  const { language, t } = useLanguage();
  const isMobile = useIsMobile();
  const [favorites, setFavorites] = useState<number[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json();
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      return response.json();
    },
  });

  const { data: creatorReviews, isLoading: isLoadingCreatorReviews, isError: isErrorCreator } =
    useQuery<CreatorReview[]>({
      queryKey: ['creatorReviews', { limit: 4 }],
      queryFn: async () => {
        const res = await fetch('/api/reviews/creator?limit=4');
        if (!res.ok) throw new Error('Failed to fetch creator reviews');
        return res.json();
      },
    });

  const { data: communityShowcase, isLoading: isLoadingCommunity, isError: isErrorCommunity } =
    useQuery<CommunityItem[]>({
      queryKey: ['communityShowcase', { limit: 4 }],
      queryFn: async () => {
        const res = await fetch('/api/community/highlight?limit=4');
        if (!res.ok) throw new Error('Failed to fetch community showcase');
        return res.json();
      },
    });

  const { data: materialRecommendations, isLoading: isLoadingMaterial, isError: isErrorMaterial } =
    useQuery<MaterialReco[]>({
      queryKey: ['materialRecommendations', { limit: 4 }],
      queryFn: async () => {
        const res = await fetch('/api/recommendations/materials?limit=4');
        if (!res.ok) throw new Error('Failed to fetch material recommendations');
        return res.json();
      },
    });



  const handleAddToCart = (product: Product) => {
    toast({
      title: t({ ko: "장바구니에 추가되었습니다", en: "Added to cart" }),
      description: `${product.nameKo || product.name}`,
    });
  };

  const handleToggleFavorite = (product: Product) => {
    setFavorites((prev) =>
      prev.includes(product.id)
        ? prev.filter((id) => id !== product.id)
        : [...prev, product.id],
    );
    toast({
      title: t({ ko: "찜 목록에 추가되었습니다", en: "Added to favorites" }),
      description: `${product.nameKo || product.name}`,
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <div className="min-h-screen bg-background dark:bg-[#1a1a1a]">
      <CategoryNav />
      <Hero />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        {/* Popular Products Section */}
        <motion.section
          className="section-spacing"
          variants={containerVariants}
          initial="visible"
          animate="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {/* Section Header */}
          <div className="flex items-center justify-between section-header">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🔥</span>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  {t({ ko: "인기상품", en: "Popular Items", ja: "人気商品", zh: "热门商品" })}
                </h2>
                <p className="text-sm text-muted-foreground hidden sm:block">
                  {t({
                    ko: "지금 가장 핫한 아이템들을 만나보세요",
                    en: "Meet the hottest items right now",
                  })}
                </p>
              </div>
            </div>
            <Link href="/products">
              <button className="text-sm text-blue-500 hover:underline flex items-center">
                {t({ ko: "더보기", en: "View More", ja: "もっと見る", zh: "查看更多" })}{" "}
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </Link>
          </div>

          {isLoading ? (
            <ProductCardSkeleton
              count={3}
              gridClassName="grid grid-cols-1 md:grid-cols-3 gap-6"
            />
          ) : (
            <>
              {/* Desktop View - 3 Column Grid */}
              <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6">
                <PopularBox
                  title={t({ ko: "1개부터 제작 가능해요!", en: "Available from 1 piece!", ja: "1個から製作可能です！", zh: "1件起即可制作！" })}
                  description={t({ ko: "소량 제작도 부담 없이", en: "Small quantity orders welcome" })}
                  image="/api/placeholder/400/300"
                  products={products?.slice(0, 3) || []}
                  bgColor="bg-purple-50"
                />
                <PopularBox
                  title={t({ ko: "굿즈 행사 단체 키트", en: "Event Group Kit", ja: "グッズイベント団体キット", zh: "商品活动团体套装" })}
                  description={t({ ko: "단체 주문 특가 혜택", en: "Special group order benefits" })}
                  image="/api/placeholder/400/300"
                  products={products?.slice(3, 6) || []}
                  bgColor="bg-green-50"
                />
                <PopularBox
                  title={t({ ko: "베스트 단체 티셔츠", en: "Best Group T-shirts", ja: "ベスト団体Tシャツ", zh: "最佳团体T恤" })}
                  description={t({ ko: "인기 단체복 추천", en: "Popular group clothing recommendations" })}
                  image="/api/placeholder/400/300"
                  products={products?.slice(6, 9) || []}
                  bgColor="bg-blue-50"
                />
              </div>

              {/* Mobile View - Swiper Carousel */}
              <div className="md:hidden">
                <Swiper
                  modules={[Navigation, Pagination, Autoplay]}
                  spaceBetween={16}
                  slidesPerView={1}
                  navigation={{
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                  }}
                  pagination={{
                    clickable: true,
                    bulletClass: 'swiper-pagination-bullet',
                    bulletActiveClass: 'swiper-pagination-bullet-active',
                  }}
                  autoplay={{
                    delay: 4000,
                    disableOnInteraction: false,
                  }}
                  loop={true}
                  className="popular-products-swiper"
                >
                  <SwiperSlide>
                    <PopularBox
                      title={t({ ko: "1개부터 제작 가능해요!", en: "Available from 1 piece!", ja: "1個から製作可能です！", zh: "1件起即可制作！" })}
                      description={t({ ko: "소량 제작도 부담 없이", en: "Small quantity orders welcome" })}
                      image="/api/placeholder/400/300"
                      products={products?.slice(0, 3) || []}
                      bgColor="bg-purple-50"
                    />
                  </SwiperSlide>
                  <SwiperSlide>
                    <PopularBox
                      title={t({ ko: "굿즈 행사 단체 키트", en: "Event Group Kit", ja: "グッズイベント団体キット", zh: "商品活动团体套装" })}
                      description={t({ ko: "단체 주문 특가 혜택", en: "Special group order benefits" })}
                      image="/api/placeholder/400/300"
                      products={products?.slice(3, 6) || []}
                      bgColor="bg-green-50"
                    />
                  </SwiperSlide>
                  <SwiperSlide>
                    <PopularBox
                      title={t({ ko: "베스트 단체 티셔츠", en: "Best Group T-shirts", ja: "ベスト団体Tシャツ", zh: "最佳团体T恤" })}
                      description={t({ ko: "인기 단체복 추천", en: "Popular group clothing recommendations" })}
                      image="/api/placeholder/400/300"
                      products={products?.slice(6, 9) || []}
                      bgColor="bg-blue-50"
                    />
                  </SwiperSlide>
                </Swiper>
              </div>
            </>
          )}
        </motion.section>

        {/* Creator Reviews Section */}
        <motion.section
          className="section-spacing"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Section Header */}
          <div className="flex items-center justify-between section-header">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🤗</span>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  {t({
                    ko: "창작자들의 소중한 리뷰",
                    en: "Precious Reviews from Creators",
                    ja: "クリエイターの大切なレビュー",
                    zh: "创作者宝贵评论"
                  })}
                </h2>
                <p className="text-sm text-muted-foreground hidden sm:block">
                  {t({
                    ko: "실제 창작자들이 남긴 생생한 후기를 확인해보세요",
                    en: "Check out vivid reviews from real creators",
                    ja: "実際のクリエイターが残した生の感想をご覧ください",
                    zh: "查看真实创作者留下的生动评价"
                  })}
                </p>
              </div>
            </div>
            <Link href="/reviews">
              <button className="text-sm text-blue-500 hover:underline flex items-center">
                {t({ ko: "더보기", en: "View More", ja: "もっと見る", zh: "查看更多" })}{" "}
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </Link>
          </div>

          {isLoadingCreatorReviews ? (
            <ProductCardSkeleton
              count={4}
              gridClassName="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            />
          ) : isErrorCreator ? (
            <p className="text-sm text-red-500">Failed to load reviews</p>
          ) : (
            <motion.div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {(creatorReviews ?? []).slice(0, 4).map((review) => (
                <motion.div
                  key={review.id}
                  variants={itemVariants}
                  className="w-full"
                >
                  <Link href={`/product/${review.id}`}>
                    <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-xl hover:scale-[1.01] transition-all duration-300 min-h-[320px] md:min-h-[420px] flex flex-col">
                      {/* Large Review Image - 70% of card height */}
                      <div className="relative flex-[0_0_70%]">
                        <img
                          src={review.productImage}
                          alt={review.productName}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = "/api/placeholder/360/280";
                          }}
                        />

                        {/* HOT Badge */}
                        <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                          HOT
                        </div>

                        {/* LIKE Button */}
                        <div className="absolute top-3 right-3 bg-white/80 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                          LIKE {review.reviewCount}
                        </div>
                      </div>

                      {/* Review Content - 30% of card height */}
                      <div className="flex-[0_0_30%] p-4 flex flex-col justify-between">
                        <div className="space-y-2">
                          <h3 className="text-base font-semibold text-gray-900 dark:text-white line-clamp-1">
                            {review.productName}
                          </h3>
                          <p className="text-sm text-black dark:text-white line-clamp-2 font-medium leading-snug mt-1">
                            {review.comment}
                          </p>
                        </div>

                        <div className="text-sm text-gray-500 dark:text-gray-300 pt-2 border-t border-gray-100 dark:border-gray-600">
                          리뷰 {review.reviewCount} / 평점 {review.rating}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.section>

        {/* Community Showcase */}
        <motion.section
          className="section-spacing"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="flex items-center justify-between section-header">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🔥</span>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  {t({
                    ko: "굿즈 자랑 커뮤니티",
                    en: "Goods Showcase Community",
                  })}
                </h2>
                <p className="text-sm text-muted-foreground hidden sm:block">
                  {t({
                    ko: "멋진 굿즈들을 자랑해보세요",
                    en: "Show off your amazing goods",
                  })}
                </p>
              </div>
            </div>
            <Link href="/community">
              <button className="text-sm text-blue-500 hover:underline flex items-center">
                {t({ ko: "더보기", en: "View More", ja: "もっと見る", zh: "查看更多" })}{" "}
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </Link>
          </div>

          {isLoadingCommunity ? (
            <ProductCardSkeleton
              count={4}
              gridClassName="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            />
          ) : isErrorCommunity ? (
            <p className="text-sm text-red-500">Failed to load community</p>
          ) : (
            <motion.div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {(communityShowcase ?? []).slice(0, 4).map((item) => (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  className="w-full"
                >
                  <Link href={`/community/${item.id}`}>
                    <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-xl hover:scale-[1.01] transition-all duration-300 min-h-[320px] md:min-h-[400px] flex flex-col">
                      {/* Large Community Image - 70% of card height */}
                      <div className="relative flex-[0_0_70%]">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = "/api/placeholder/360/280";
                          }}
                        />

                        {/* LIKE Button */}
                        <div className="absolute top-3 right-3 bg-white/80 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                          LIKE {item.likes}
                        </div>
                      </div>

                      {/* Community Content - 30% of card height */}
                      <div className="flex-[0_0_30%] p-4 flex flex-col justify-between">
                        <div className="space-y-2">
                          <h3 className="text-base font-semibold text-gray-900 dark:text-white line-clamp-1">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-200 truncate leading-snug">
                            @{item.author}
                          </p>
                          <p className="text-sm text-black dark:text-white line-clamp-2 font-medium leading-snug mt-1">
                            {item.tags.join(', ')}
                          </p>
                        </div>

                        <div className="text-sm text-gray-500 dark:text-gray-300 pt-2 border-t border-gray-100 dark:border-gray-600">
                          댓글 {item.comments} / LIKE {item.likes}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.section>

        {/* Material Recommendations */}
        <motion.section
          className="section-spacing"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="flex items-center justify-between section-header">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">✨</span>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  {t({
                    ko: "자재별 추천",
                    en: "Material-Based Recommendations",
                  })}
                </h2>
                <p className="text-sm text-muted-foreground hidden sm:block">
                  {t({
                    ko: "원하는 재질의 완벽한 굿즈를 찾아보세요",
                    en: "Find perfect goods with your desired materials",
                  })}
                </p>
              </div>
            </div>
            <Link href="/products">
              <button className="text-sm text-blue-500 hover:underline flex items-center">
                {t({ ko: "더보기", en: "View More", ja: "もっと見る", zh: "查看更多" })}{" "}
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </Link>
          </div>

          {isLoadingMaterial ? (
            <ProductCardSkeleton
              count={4}
              gridClassName="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            />
          ) : isErrorMaterial ? (
            <p className="text-sm text-red-500">Failed to load recommendations</p>
          ) : (
            <motion.div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {(materialRecommendations ?? []).slice(0, 4).map((item) => (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  className="w-full"
                >
                  <Link href={`/product/${item.id}`}>
                    <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-xl hover:scale-[1.01] transition-all duration-300 min-h-[320px] md:min-h-[400px] flex flex-col">
                      {/* Large Material Image - 70% of card height */}
                      <div className="relative flex-[0_0_70%]">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = "/api/placeholder/360/280";
                          }}
                        />

                        {/* Material Badge */}
                        <div className="absolute top-3 left-3 bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">
                          {item.badge}
                        </div>

                        {/* LIKE Button */}
                        <div className="absolute top-3 right-3 bg-white/80 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                          LIKE {Math.floor(item.reviewCount * 0.6)}
                        </div>
                      </div>

                      {/* Material Content - 30% of card height */}
                      <div className="flex-[0_0_30%] p-4 flex flex-col justify-between">
                        <div className="space-y-2">
                          <h3 className="text-base font-semibold text-gray-900 dark:text-white line-clamp-1">
                            {item.title}
                          </h3>

                          <p className="text-lg font-bold text-blue-600 dark:text-white">
                            ₩{Number(item.price ?? 0).toLocaleString()}
                          </p>

                          {/* Material Description */}
                          <p className="text-sm text-black dark:text-white line-clamp-2 font-medium leading-snug mt-1">
                            {item.material === "홀로그램" ? "무지개색 홀로그램 효과로 각도마다 다른 색감을 연출하는 프리미엄 키링입니다."
                              : item.material === "투명아크릴" ? "투명하고 깔끔한 아크릴 소재로 제작되어 세련된 느낌을 주는 스탠드입니다."
                              : item.material === "미러" ? "거울 효과가 있는 미러 아크릴로 빛 반사가 아름다운 키링입니다."
                              : "천연 우드 소재에 정밀한 레이저 각인으로 고급스러운 마감을 자랑합니다."
                            }
                          </p>
                        </div>

                        <div className="text-sm text-gray-500 dark:text-gray-300 pt-2 border-t border-gray-100 dark:border-gray-600">
                          리뷰 {item.reviewCount} / LIKE {Math.floor(item.reviewCount * 0.6)}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.section>

        {/* Instagram Feed Section */}
        <InstagramFeed />
      </div>

      {/* Bottom spacing to prevent floating button overlap */}
      <div className="h-24"></div>
    </div>
  );
}
