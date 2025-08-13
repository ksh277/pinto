import { useParams, useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { ProductGrid } from "@/components/ProductGrid";
import { Product } from "@/shared/schema";
import { ChevronRight, Grid } from "lucide-react";
import { motion } from "framer-motion";

interface SubCategory {
  id: string;
  name: { ko: string; en: string; ja: string; zh: string };
  slug: string;
  count: number;
}

const categoryData = {
  acrylic: {
    id: "acrylic",
    name: { ko: "아크릴굿즈", en: "Acrylic Goods", ja: "アクリルグッズ", zh: "亚克力商品" },
    subcategories: [
      { id: "keyring", name: { ko: "키링", en: "Keyring", ja: "キーリング", zh: "钥匙扣" }, slug: "keyring", count: 15 },
      { id: "korotto", name: { ko: "코롯토", en: "Korotto", ja: "コロット", zh: "Korotto" }, slug: "korotto", count: 85 },
      { id: "holder", name: { ko: "포카홀더", en: "Card Holder", ja: "カードホルダー", zh: "卡片夹" }, slug: "holder", count: 78 },
      { id: "shaker", name: { ko: "아크릴쉐이커", en: "Acrylic Shaker", ja: "アクリルシェーカー", zh: "亚克力摇摇杯" }, slug: "shaker", count: 52 }
    ]
  },
  wood: {
    id: "wood",
    name: { ko: "우드굿즈", en: "Wood Goods", ja: "ウッドグッズ", zh: "木制商品" },
    subcategories: [
      { id: "coaster", name: { ko: "코스터", en: "Coaster", ja: "コースター", zh: "杯垫" }, slug: "coaster", count: 38 },
      { id: "magnet", name: { ko: "마그넷", en: "Magnet", ja: "マグネット", zh: "磁铁" }, slug: "magnet", count: 29 }
    ]
  },
  lanyard: {
    id: "lanyard",
    name: { ko: "렌야드굿즈", en: "Lanyard Goods", ja: "ランヤードグッズ", zh: "挂绳商品" },
    subcategories: [
      { id: "neck", name: { ko: "목걸이형", en: "Neck Strap", ja: "首掛け型", zh: "颈挂式" }, slug: "neck", count: 32 },
      { id: "phone", name: { ko: "핸드폰용", en: "Phone Strap", ja: "携帯用", zh: "手机挂绳" }, slug: "phone", count: 28 }
    ]
  },
  packaging: {
    id: "packaging",
    name: { ko: "포장/부자재", en: "Packaging/Materials", ja: "包装/副資材", zh: "包装/辅材" },
    subcategories: [
      { id: "box", name: { ko: "박스", en: "Box", ja: "ボックス", zh: "盒子" }, slug: "box", count: 15 },
      { id: "bag", name: { ko: "포장지", en: "Wrapping", ja: "包装紙", zh: "包装纸" }, slug: "bag", count: 12 }
    ]
  }
};

export default function CategoryPage() {
  const { category, subcategory, page } = useParams();
  const [, setLocation] = useLocation();
  const { language, t } = useLanguage();

  // activeTab is now directly controlled by subcategory parameter
  const activeTab = subcategory || "";

  const currentCategory = categoryData[category as keyof typeof categoryData];

  const PAGE_SIZE = 15;
  const pageNum = Math.max(1, Number(page ?? "1"));
  const subParam = (subcategory && subcategory !== "all") ? subcategory : undefined;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["products", category, subParam, pageNum],
    queryFn: async () => {
      const qs = new URLSearchParams({
        ...(category ? { category } : {}),
        ...(subParam ? { subcategory: subParam } : {}),
        limit: String(PAGE_SIZE),
        page: String(pageNum),
      });
      const res = await fetch(`/api/products?` + qs.toString());
      const text = await res.text();
      if (!res.ok) throw new Error(`GET /api/products failed ${res.status} ${res.statusText} — ${text}`);
      const json = JSON.parse(text);
      return json;
    },
    staleTime: 0,
  });
  console.log("API products resp:", data);

  const items = (data?.items ?? []).map((it: any) => ({
    id: it.id,
    category: (it.category ?? "").toLowerCase(),
    subcategory: (it.subcategory ?? "").toLowerCase(),
    nameKo: it.nameKo ?? it.name_ko ?? it.name,
    priceKrw: it.priceKrw ?? it.price_krw ?? it.price,
    reviewCount: it.reviewCount ?? it.review_count ?? 0,
    thumbnailUrl: it.thumbnailUrl ?? it.thumbnail_url ?? null,
    createdAt: it.createdAt ?? it.created_at,
  }));

  const filtered = items
    .filter(p => !category || p.category === category.toLowerCase())
    .filter(p => !subParam || p.subcategory === subParam.toLowerCase());

  const products = filtered.map(p => ({
    id: p.id,
    nameKo: p.nameKo,
    basePrice: String(p.priceKrw ?? 0),
    category: p.category,
    subcategory: p.subcategory,
    reviewCount: p.reviewCount,
    thumbnailUrl: p.thumbnailUrl,
    createdAt: p.createdAt,
  })) as Product[];

  const loading = isLoading;

  if (isError) {
    return <div style={{padding:16,border:"1px solid #f00",color:"#f00"}}>
      <b>제품 로드 실패</b><br/>{String((error as any)?.message)}
    </div>;
  }

  const handleTabClick = (subcat: SubCategory) => {
    setLocation(`/category/${category}/${subcat.slug}`);
    
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (product: Product) => {
    console.log('Added to cart:', product);
  };

  const handleToggleFavorite = (product: Product) => {
    console.log('Toggle favorite:', product);
  };

  if (!currentCategory) {
    return (
      <div className="min-h-screen bg-background dark:bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">카테고리를 찾을 수 없습니다</h2>
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">홈으로 돌아가기</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-[#1a1a1a]">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 py-4 text-sm">
            <Link href="/" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">홈</Link>
            <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <span className="text-gray-900 dark:text-white font-medium">{t(currentCategory.name)}</span>
            {subcategory && subcategory !== 'all' && (
              <>
                <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                <span className="text-gray-900 dark:text-white font-medium">
                  {t(currentCategory.subcategories.find(sub => sub.slug === subcategory)?.name || { ko: '', en: '', ja: '', zh: '' })}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Category Header */}
      <div className="bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t(currentCategory.name)}</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {subcategory && subcategory !== 'all'
                ? `${t(currentCategory.subcategories.find(sub => sub.slug === subcategory)?.name || { ko: '', en: '', ja: '', zh: '' })} 상품을 확인해보세요`
                : '다양한 맞춤 굿즈를 만나보세요'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Subcategory Tabs */}
      <div className="bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto scrollbar-hide">
            <div className="flex space-x-0 min-w-max">
              {/* All Products Tab */}
              <button
                onClick={() => {
                  console.log('Clicking 전체 button, navigating to /all route');
                  setLocation(`/category/${category}/all`);
                  // Smooth scroll to top
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === '' || activeTab === 'all'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Grid className="w-4 h-4" />
                  <span>전체</span>
                </div>
              </button>

              {/* Subcategory Tabs */}
              {currentCategory.subcategories.map((subcat) => (
                <button
                  key={subcat.id}
                  onClick={() => handleTabClick(subcat)}
                  className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === subcat.slug
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span>{t(subcat.name)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-[#1a1a1a] rounded-lg shadow-sm p-4 animate-pulse">
                <div className="aspect-square bg-gray-200 dark:bg-[#1a1a1a] rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-200 dark:bg-[#1a1a1a] rounded mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-[#1a1a1a] rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <motion.div
            key={`${category}-${subcategory}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ProductGrid 
              products={products} 
              onAddToCart={handleAddToCart}
              onToggleFavorite={handleToggleFavorite}
              className="grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            />
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400 mb-4">
              <Grid className="w-12 h-12 mx-auto mb-2" />
              <p className="text-lg">해당 카테고리에 상품이 없습니다</p>
              <p className="text-sm">다른 카테고리를 확인해보세요</p>
            </div>
            <Link 
              href="/products"
              className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              전체 상품 보기
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}