import { useParams, useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
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
      { id: "keyring", name: { ko: "아크릴키링", en: "Acrylic Keyring", ja: "アクリルキーリング", zh: "亚克力钥匙扣" }, slug: "keyring", count: 120 },
      { id: "korotto", name: { ko: "코롯토", en: "Korotto", ja: "コロット", zh: "Korotto" }, slug: "korotto", count: 85 },
      { id: "smarttok", name: { ko: "스마트톡", en: "Smart Tok", ja: "スマートトーク", zh: "智能支架" }, slug: "smarttok", count: 67 },
      { id: "stand", name: { ko: "스탠드/디오라마", en: "Stand/Diorama", ja: "スタンド/ジオラマ", zh: "支架/立体模型" }, slug: "stand", count: 94 },
      { id: "holder", name: { ko: "포카홀더", en: "Card Holder", ja: "カードホルダー", zh: "卡片夹" }, slug: "holder", count: 78 },
      { id: "shaker", name: { ko: "아크릴쉐이커", en: "Acrylic Shaker", ja: "アクリルシェーカー", zh: "亚克力摇摇杯" }, slug: "shaker", count: 52 }
    ]
  },
  wood: {
    id: "wood",
    name: { ko: "우드굿즈", en: "Wood Goods", ja: "ウッドグッズ", zh: "木制商品" },
    subcategories: [
      { id: "keyring", name: { ko: "우드키링", en: "Wood Keyring", ja: "ウッドキーリング", zh: "木制钥匙扣" }, slug: "keyring", count: 45 },
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
  const { category, subcategory } = useParams();
  const [, setLocation] = useLocation();
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>(subcategory || "");

  const currentCategory = categoryData[category as keyof typeof categoryData];
  
  // Query for products
  const { data: products, isLoading } = useQuery({
    queryKey: ['/api/products', category, subcategory],
    queryFn: async () => {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      
      // Filter products based on category and subcategory
      let filteredProducts = data;
      
      if (category === 'acrylic') {
        // First filter to only acrylic products (categoryId: 4)
        filteredProducts = data.filter((product: Product) => 
          product.categoryId === 4 || 
          product.nameKo.includes('아크릴') ||
          product.name.toLowerCase().includes('acrylic')
        );
        
        // Then filter by subcategory if specified
        if (subcategory) {
          const subcategoryFilters = {
            'keyring': (product: Product) => 
              product.nameKo.includes('키링') || 
              product.name.toLowerCase().includes('keyring') ||
              product.name.toLowerCase().includes('keychain'),
            'korotto': (product: Product) => 
              product.nameKo.includes('코롯토') || 
              product.name.toLowerCase().includes('korotto'),
            'smarttok': (product: Product) => 
              product.nameKo.includes('스마트톡') || 
              product.name.toLowerCase().includes('smart tok') ||
              product.name.toLowerCase().includes('grip'),
            'stand': (product: Product) => 
              product.nameKo.includes('스탠드') || 
              product.nameKo.includes('디오라마') ||
              product.name.toLowerCase().includes('stand') ||
              product.name.toLowerCase().includes('diorama'),
            'holder': (product: Product) => 
              product.nameKo.includes('포카홀더') || 
              product.nameKo.includes('홀더') ||
              product.name.toLowerCase().includes('holder') ||
              product.name.toLowerCase().includes('card'),
            'shaker': (product: Product) => 
              product.nameKo.includes('쉐이커') || 
              product.name.toLowerCase().includes('shaker'),
            'carabiner': (product: Product) => 
              product.nameKo.includes('카라비너') || 
              product.name.toLowerCase().includes('carabiner'),
            'mirror': (product: Product) => 
              product.nameKo.includes('거울') || 
              product.name.toLowerCase().includes('mirror'),
            'magnet': (product: Product) => 
              product.nameKo.includes('자석') || 
              product.nameKo.includes('마그넷') ||
              product.name.toLowerCase().includes('magnet'),
            'stationery': (product: Product) => 
              product.nameKo.includes('문구') || 
              product.name.toLowerCase().includes('stationery'),
            'cutting': (product: Product) => 
              product.nameKo.includes('재단') || 
              product.name.toLowerCase().includes('cutting')
          };
          
          const filterFn = subcategoryFilters[subcategory as keyof typeof subcategoryFilters];
          if (filterFn) {
            filteredProducts = filteredProducts.filter(filterFn);
          }
        }
      } else if (category) {
        // Filter by other categories
        filteredProducts = data.filter((product: Product) => 
          product.name.toLowerCase().includes(category.toLowerCase())
        );
      }
      
      return filteredProducts;
    }
  });

  const handleTabClick = (subcat: SubCategory) => {
    setActiveTab(subcat.slug);
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">카테고리를 찾을 수 없습니다</h2>
          <Link href="/" className="text-blue-600 hover:underline">홈으로 돌아가기</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 py-4 text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700">홈</Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium">{t(currentCategory.name)}</span>
            {subcategory && (
              <>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900 font-medium">
                  {t(currentCategory.subcategories.find(sub => sub.slug === subcategory)?.name || { ko: '', en: '', ja: '', zh: '' })}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Category Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{t(currentCategory.name)}</h1>
            <p className="text-gray-600 mb-6">
              {subcategory 
                ? `${t(currentCategory.subcategories.find(sub => sub.slug === subcategory)?.name || { ko: '', en: '', ja: '', zh: '' })} 상품을 확인해보세요`
                : '다양한 맞춤 굿즈를 만나보세요'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Subcategory Tabs */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto scrollbar-hide">
            <div className="flex space-x-0 min-w-max">
              {/* All Products Tab */}
              <button
                onClick={() => {
                  setActiveTab('');
                  setLocation(`/category/${category}`);
                }}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  !subcategory 
                    ? 'border-blue-500 text-blue-600 bg-blue-50' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
                    subcategory === subcat.slug
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span>{t(subcat.name)}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {subcat.count}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
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
            <div className="text-gray-500 mb-4">
              <Grid className="w-12 h-12 mx-auto mb-2" />
              <p className="text-lg">해당 카테고리에 상품이 없습니다</p>
              <p className="text-sm">다른 카테고리를 확인해보세요</p>
            </div>
            <Link 
              href="/products"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              전체 상품 보기
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}