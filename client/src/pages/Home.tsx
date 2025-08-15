import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { Hero } from "@/components/Hero";
import { CategoryNav } from "@/components/CategoryNav";
import { ProductCardSkeleton } from "@/components/ProductCardSkeleton";
import { PopularBox } from "@/components/PopularBox";
import { ProductCard } from "@/components/ProductCard";
import { InstagramFeed } from "@/components/InstagramFeed";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import type { Product } from "@/types/product";

const currency = (n?: number | null) => ((n ?? 0) as number).toLocaleString() + " 원";
const imgFallback = "/api/placeholder/600/600";

export default function Home() {
  const { toast } = useToast();
  const { language, t } = useLanguage();
  const [favorites, setFavorites] = useState<number[]>([]);

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


  const fetchCategoryProducts = async (category: string) => {
    const params = new URLSearchParams({ category, limit: "4" });
    const res = await fetch(`/api/products?${params.toString()}`);
    if (!res.ok) {
      throw new Error("Failed to fetch products");
    }
    const data = await res.json();
    const items = data.items || data;
    return items.map((p: any) => ({
      ...p,
      nameKo: p.name_ko,
      imageUrl: p.image_url,
    }));
  };

  const {
    data: acrylicProducts = [],
    isLoading: acrylicLoading,
    error: acrylicError,
  } = useQuery({
    queryKey: ["category-products", "acrylic"],
    queryFn: () => fetchCategoryProducts("acrylic"),
  });

  const {
    data: woodProducts = [],
    isLoading: woodLoading,
    error: woodError,
  } = useQuery({
    queryKey: ["category-products", "wood"],
    queryFn: () => fetchCategoryProducts("wood"),
  });

  const {
    data: lanyardProducts = [],
    isLoading: lanyardLoading,
    error: lanyardError,
  } = useQuery({
    queryKey: ["category-products", "lanyard"],
    queryFn: () => fetchCategoryProducts("lanyard"),
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




        {/* Acrylic Goods */}
        <motion.section
          className="section-spacing"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="flex items-center justify-between section-header">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🪞</span>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                {t({ ko: "아크릴 굿즈", en: "Acrylic Goods" })}
              </h2>
            </div>
            <Link href="/category/acrylic/all">
              <button className="text-sm text-blue-500 hover:underline flex items-center">
                {t({ ko: "더보기", en: "View More" })}{" "}
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </Link>
          </div>
          {acrylicLoading ? (
            <ProductCardSkeleton count={4} gridClassName="grid grid-cols-2 md:grid-cols-4 gap-4" />
          ) : acrylicError ? (
            <p className="text-sm text-gray-500">데이터를 불러오지 못했어요.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {acrylicProducts.slice(0, 4).map((p: Product) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAddToCart={handleAddToCart}
                  onToggleFavorite={handleToggleFavorite}
                  isFavorite={favorites.includes(p.id as number)}
                />
              ))}
            </div>
          )}
        </motion.section>

        {/* Wood Goods */}
        <motion.section
          className="section-spacing"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="flex items-center justify-between section-header">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🪵</span>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                {t({ ko: "우드 굿즈", en: "Wood Goods" })}
              </h2>
            </div>
            <Link href="/category/wood/all">
              <button className="text-sm text-blue-500 hover:underline flex items-center">
                {t({ ko: "더보기", en: "View More" })}{" "}
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </Link>
          </div>
          {woodLoading ? (
            <ProductCardSkeleton count={4} gridClassName="grid grid-cols-2 md:grid-cols-4 gap-4" />
          ) : woodError ? (
            <p className="text-sm text-gray-500">데이터를 불러오지 못했어요.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {woodProducts.slice(0, 4).map((p: Product) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAddToCart={handleAddToCart}
                  onToggleFavorite={handleToggleFavorite}
                  isFavorite={favorites.includes(p.id as number)}
                />
              ))}
            </div>
          )}
        </motion.section>

        {/* Lanyard Goods */}
        <motion.section
          className="section-spacing"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="flex items-center justify-between section-header">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">📿</span>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                {t({ ko: "랜야드 굿즈", en: "Lanyard Goods" })}
              </h2>
            </div>
            <Link href="/category/lanyard/all">
              <button className="text-sm text-blue-500 hover:underline flex items-center">
                {t({ ko: "더보기", en: "View More" })}{" "}
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </Link>
          </div>
          {lanyardLoading ? (
            <ProductCardSkeleton count={4} gridClassName="grid grid-cols-2 md:grid-cols-4 gap-4" />
          ) : lanyardError ? (
            <p className="text-sm text-gray-500">데이터를 불러오지 못했어요.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {lanyardProducts.slice(0, 4).map((p: Product) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAddToCart={handleAddToCart}
                  onToggleFavorite={handleToggleFavorite}
                  isFavorite={favorites.includes(p.id as number)}
                />
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
