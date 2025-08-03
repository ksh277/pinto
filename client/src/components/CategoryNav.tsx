import { useState } from "react";
import { Link } from "wouter";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

interface CategoryNavProps {
  className?: string;
}

export function CategoryNav({ className }: CategoryNavProps) {
  const { t } = useLanguage();
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  const categories = [
    {
      id: 'reviews',
      name: { ko: "사용후기", en: "Reviews", ja: "レビュー", zh: "评价" },
      items: []
    },
    {
      id: 'resources',
      name: { ko: "자료실", en: "Resources", ja: "資料室", zh: "资源" },
      items: []
    },
    {
      id: 'events',
      name: { ko: "이벤트", en: "Events", ja: "イベント", zh: "活动" },
      items: []
    },
    {
      id: 'membership',
      name: { ko: "회원등급혜택", en: "Membership Benefits", ja: "会員特典", zh: "会员福利" },
      items: []
    }
  ];

  const hoveredCategory = categories.find(cat => cat.id === hoveredTab);

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
                  href={`/category/${category.id}/all`}
                  className={cn(
                    "relative py-4 px-2 text-sm font-medium whitespace-nowrap transition-colors block",
                    "hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:text-gray-700",
                    hoveredTab === category.id
                      ? "text-gray-900 dark:text-white border-b-2 border-black"
                      : "text-gray-500 dark:text-white hover:text-gray-700 dark:hover:text-gray-200"
                  )}
                >
                  {t(category.name)}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Hover Sub Menu */}
        {hoveredTab && hoveredCategory && hoveredCategory.items.length > 0 && (
          <div
            className="absolute left-0 right-0 bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-gray-600 shadow-lg z-50 animate-in fade-in-0 duration-200"
            onMouseEnter={() => setHoveredTab(hoveredTab)}
            onMouseLeave={() => setHoveredTab(null)}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                {hoveredCategory.items.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <Link 
                      href={`/category/${hoveredCategory.id}/${item.slug}`}
                      className="text-sm text-gray-600 dark:text-white hover:text-gray-900 dark:hover:text-gray-200 transition-colors px-2 py-1 whitespace-nowrap"
                    >
                      {t(item.name)}
                    </Link>
                    {index < hoveredCategory.items.length - 1 && (
                      <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-3" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}