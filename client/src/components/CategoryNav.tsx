import { useState } from "react";
import { Link } from "wouter";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

interface CategoryNavProps {
  className?: string;
}

interface TranslatedText {
  ko: string;
  en: string;
  ja: string;
  zh: string;
}

interface SubCategory {
  name: TranslatedText;
  slug: string;
}

interface CategoryGroup {
  id: string;
  title: TranslatedText;
  items: SubCategory[];
}

interface Category {
  id: string;
  name: TranslatedText;
  items?: SubCategory[];
  groups?: CategoryGroup[];
}

export function CategoryNav({ className }: CategoryNavProps) {
  const { t } = useLanguage();
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  const baseCategories: Category[] = [
    {
      id: "acrylic",
      name: { ko: "아크릴굿즈", en: "Acrylic Goods", ja: "アクリルグッズ", zh: "亚克力商品" },
      items: [
        { name: { ko: "코롯토", en: "Korotto", ja: "コロット", zh: "科罗托" }, slug: "korotto" },
        { name: { ko: "포카홀더", en: "Card Holder", ja: "カードホルダー", zh: "卡片夹" }, slug: "holder" },
        { name: { ko: "아크릴쉐이커", en: "Acrylic Shaker", ja: "アクリルシェイカー", zh: "亚克力摇摆器" }, slug: "shaker" },
        { name: { ko: "아크릴카라비너", en: "Acrylic Carabiner", ja: "アクリルカラビナ", zh: "亚克力登山扣" }, slug: "carabiner" },
        { name: { ko: "거울", en: "Mirror", ja: "ミラー", zh: "镜子" }, slug: "mirror" },
        { name: { ko: "문구류", en: "Stationery", ja: "文具", zh: "文具" }, slug: "stationery" },
        { name: { ko: "아크릴 재단", en: "Acrylic Cutting", ja: "アクリルカット", zh: "亚克力切割" }, slug: "cutting" },
      ],
    },
    {
      id: "wood",
      name: { ko: "우드굿즈", en: "Wood Goods", ja: "ウッドグッズ", zh: "木制商品" },
      items: [
        { name: { ko: "우드마그넷", en: "Wood Magnet", ja: "ウッドマグネット", zh: "木制磁铁" }, slug: "magnet" },
      ],
    },
    {
      id: "packaging",
      name: { ko: "포장/부자재", en: "Packaging/Materials", ja: "包装/副資材", zh: "包装/辅料" },
      items: [
        { name: { ko: "스와치", en: "Swatch", ja: "スウォッチ", zh: "色样" }, slug: "swatch" },
        { name: { ko: "부자재", en: "Materials", ja: "副資材", zh: "辅料" }, slug: "materials" },
        { name: { ko: "포장재", en: "Packaging", ja: "包装材", zh: "包装材料" }, slug: "packaging" },
      ],
    },
  ];

  const categories: Category[] = [
    {
      id: "all",
      name: { ko: "전체 메뉴", en: "All", ja: "全て", zh: "全部" },
      groups: baseCategories.map((cat) => ({
        id: cat.id,
        title: cat.name,
        items: cat.items || [],
      })),
    },
    ...baseCategories,
  ];

  const hoveredCategory = categories.find((cat) => cat.id === hoveredTab);

  return (
    <div className={cn("bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-gray-600 relative", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tab Navigation */}
        <div className="flex justify-center">
          <div className="flex space-x-8 overflow-x-auto">
            {categories.map((category) => (
              <div
                key={category.id}
                className="relative"
                onMouseEnter={() => setHoveredTab(category.id)}
                onMouseLeave={() => setHoveredTab(null)}
              >
                <Link
                  href={
                    category.id === "all"
                      ? "/products"
                      : `/category/${category.id}/all`
                  }
                  className={cn(
                    "relative py-4 px-2 text-sm font-medium whitespace-nowrap transition-colors block",
                    "hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:text-gray-700",
                    hoveredTab === category.id
                      ? "text-gray-900 dark:text-white border-b-2 border-black"
                      : "text-gray-500 dark:text-white hover:text-gray-700 dark:hover:text-gray-200",
                  )}
                >
                  {t(category.name)}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Hover Sub Menu */}
        {hoveredTab && hoveredCategory && (
          hoveredCategory.id === "all" ? (
            <div
              className="absolute left-0 right-0 bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-gray-600 shadow-lg z-50 animate-in fade-in-0 duration-200"
              onMouseEnter={() => setHoveredTab(hoveredTab)}
              onMouseLeave={() => setHoveredTab(null)}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
                  {hoveredCategory.groups?.map((group) => (
                    <div key={group.id} className="space-y-2">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                        {t(group.title)}
                      </h3>
                      <ul className="space-y-1">
                        {group.items.map((item, index) => (
                          <li key={index}>
                            <Link
                              href={`/category/${group.id}/${item.slug}`}
                              className="block text-sm text-gray-600 dark:text-white hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                            >
                              {t(item.name)}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div
              className="absolute left-0 right-0 bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-gray-600 shadow-lg z-50 animate-in fade-in-0 duration-200"
              onMouseEnter={() => setHoveredTab(hoveredTab)}
              onMouseLeave={() => setHoveredTab(null)}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                  {hoveredCategory.items?.map((item, index) => (
                    <div key={index} className="flex items-center">
                      <Link
                        href={`/category/${hoveredCategory.id}/${item.slug}`}
                        className="text-sm text-gray-600 dark:text-white hover:text-gray-900 dark:hover:text-gray-200 transition-colors px-2 py-1 whitespace-nowrap"
                      >
                        {t(item.name)}
                      </Link>
                      {index < (hoveredCategory.items?.length || 0) - 1 && (
                        <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-3" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
