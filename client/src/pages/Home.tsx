import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
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
import { Link } from "wouter";
import { Hero } from "@/components/Hero";
import { CategoryNav } from "@/components/CategoryNav";
import { ProductCardSkeleton } from "@/components/ProductCardSkeleton";
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

type DbProduct = {
  id: string;
  name_ko: string | null;
  price_krw: number | null;
  image_url: string | null;
  like_count: number | null;
  review_count: number | null;
};

type ReviewWithProduct = {
  id: string;
  rating: number;
  content: string;
  created_at: string;
  product: DbProduct | null;
};

const toKRW = (n?: number | null) =>
  typeof n === "number" ? `${n.toLocaleString("ko-KR")} 원` : "가격 문의";
const imgFallback = "/api/placeholder/600/600";

const fetchLatestReviews = async (): Promise<ReviewWithProduct[]> => {
  const { data, error } = await supabase
    .from("reviews")
    .select(
      `id, rating, content, created_at,
      product:products (
        id, name_ko, image_url, price_krw, like_count, review_count
      )`
    )
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(8);

  if (error) {
    if ((error as any).code === "42P01" || (error as any).code === "42703") {
      console.error("[home] supabase", error);
      return [];
    }
    throw error;
  }
  return data ?? [];
};

const fetchRecommended = async (): Promise<DbProduct[]> => {
  const { data, error } = await supabase
    .from("products")
    .select("id, name_ko, image_url, price_krw, like_count, review_count")
    .order("like_count", { ascending: false })
    .order("review_count", { ascending: false })
    .limit(12);

  if (error) {
    if ((error as any).code === "42P01" || (error as any).code === "42703") {
      console.error("[home] supabase", error);
      return [];
    }
    throw error;
  }
  return data ?? [];
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

  const {
    data: latestReviews,
    isLoading: revLoading,
    error: revErr,
  } = useQuery({ queryKey: ["home-reviews"], queryFn: fetchLatestReviews });

  const {
    data: communityCards,
    isLoading: commLoading,
    error: commError,
  } = useQuery({
    queryKey: ["home-community"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_posts")
        .select("id, title, body, image_url, like_count, created_at")
        .order("created_at", { ascending: false })
        .limit(6);
      if (error && (error as any).code === "42P01") return [];
      if (error) throw error;
      return data || [];
    },
  });

  const {
    data: recommended,
    isLoading: recLoading,
    error: recErr,
  } = useQuery({ queryKey: ["home-recommended"], queryFn: fetchRecommended });



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

          {revLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : revErr ? (
            (console.error("[home] supabase", revErr), (
              <p className="text-sm text-gray-500">아직 후기가 없습니다.</p>
            ))
          ) : (latestReviews?.filter((r) => r.product).length ?? 0) === 0 ? (
            <p className="text-sm text-gray-500">아직 후기가 없습니다.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {latestReviews!
                .filter((r) => r.product)
                .map((r) => (
                  <Link key={r.id} href={`/product/${r.product!.id}`}>
                    <div className="rounded-lg border dark:border-gray-700 p-3 hover:shadow transition">
                      <img
                        className="w-full h-32 object-cover rounded mb-2"
                        src={r.product!.image_url || imgFallback}
                        alt={r.product!.name_ko || "상품"}
                      />
                      <div className="text-sm font-semibold truncate">
                        {r.product!.name_ko || "상품"}
                      </div>
                      <div className="text-xs text-gray-500 line-clamp-2 mt-1">
                        ★ {r.rating} · {r.content}
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
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

          {commLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : commError ? (
            (console.error(commError), (
              <p className="text-sm text-gray-500">데이터를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.</p>
            ))
          ) : (communityCards?.length ?? 0) === 0 ? (
            <p className="text-sm text-gray-500">아직 커뮤니티 글이 없습니다.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {communityCards!.slice(0, 4).map((item: any) => (
                <Link key={item.id} href={`/community/${item.id}`}>
                  <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-xl hover:scale-[1.01] transition-all duration-300 min-h-[320px] md:min-h-[400px] flex flex-col">
                    <div className="relative flex-[0_0_70%]">
                      <img
                        src={item.image_url || imgFallback}
                        alt={item.title || '게시글'}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute top-3 right-3 bg-white/80 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                        LIKE {item.like_count ?? 0}
                      </div>
                    </div>

                    <div className="flex-[0_0_30%] p-4 flex flex-col justify-between">
                      <div className="space-y-2">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white line-clamp-1">
                          {item.title}
                        </h3>
                        <p className="text-sm text-black dark:text-white line-clamp-2 font-medium leading-snug mt-1">
                          {item.body}
                        </p>
                      </div>

                      <div className="text-sm text-gray-500 dark:text-gray-300 pt-2 border-t border-gray-100 dark:border-gray-600">
                        {new Date(item.created_at).toLocaleDateString()} / LIKE {item.like_count ?? 0}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
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

          {recLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-44 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : recErr ? (
            (console.error("[home] supabase", recErr), (
              <p className="text-sm text-gray-500">아직 추천할 상품이 없습니다.</p>
            ))
          ) : (recommended?.length ?? 0) === 0 ? (
            <p className="text-sm text-gray-500">아직 추천할 상품이 없습니다.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {recommended!.map((p) => (
                <Link key={p.id} href={`/product/${p.id}`}>
                  <div className="rounded-lg border dark:border-gray-700 p-3 hover:shadow transition">
                    <img
                      className="w-full h-32 object-cover rounded mb-2"
                      src={p.image_url || imgFallback}
                      alt={p.name_ko || "상품"}
                    />
                    <div className="text-sm font-semibold truncate">{p.name_ko}</div>
                    <div className="text-xs text-gray-500 mt-1">{toKRW(p.price_krw)}</div>
                    <div className="text-[11px] text-gray-400 mt-1">
                      ❤ {p.like_count ?? 0} · 리뷰 {p.review_count ?? 0}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
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
