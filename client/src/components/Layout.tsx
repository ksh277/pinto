import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/useLanguage";
import {
  Share2,
  Calendar,
  FileText,
  Users,
  MessageSquare,
  MessageCircle,
  Puzzle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatbotWidget } from "./ChatbotWidget";

interface LayoutProps {
  children: ReactNode;
  showCommunityNav?: boolean;
}

interface CommunityNavItem {
  id: string;
  label: { ko: string; en: string; ja: string; zh: string };
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  isNew?: boolean;
}

const communityNavItems: CommunityNavItem[] = [
  {
    id: "reviews",
    label: { ko: "사용후기", en: "Reviews", ja: "レビュー", zh: "评价" },
    href: "/reviews",
    icon: MessageCircle,
    badge: "HOT",
  },
  {
    id: "collections",
    label: { ko: "모음전", en: "Collections", ja: "コレクション", zh: "合集" },
    href: "/collections",
    icon: Puzzle,
  },
  {
    id: "resources",
    label: { ko: "자료실", en: "Resources", ja: "資料室", zh: "资源" },
    href: "/resources",
    icon: FileText,
  },
  {
    id: "events",
    label: { ko: "이벤트", en: "Events", ja: "イベント", zh: "活动" },
    href: "/events",
    icon: Calendar,
    badge: "3",
  },
  {
    id: "membership",
    label: {
      ko: "회원등급혜택",
      en: "Membership Benefits",
      ja: "会員特典",
      zh: "会员福利",
    },
    href: "/rewards",
    icon: Users,
    isNew: true,
  },
];

function CommunityTopNav() {
  const { t } = useLanguage();
  const [location] = useLocation();

  const isItemActive = (item: CommunityNavItem) => {
    if (item.href === "/reviews") {
      return location === "/reviews" || location.startsWith("/reviews/");
    }
    if (item.href === "/collections") {
      return (
        location === "/collections" || location.startsWith("/collections/")
      );
    }
    if (item.href === "/resources") {
      return location === "/resources" || location.startsWith("/resources/");
    }
    if (item.href === "/events") {
      return location === "/events" || location.startsWith("/events/");
    }
    if (item.href === "/rewards") {
      return location === "/rewards" || location.startsWith("/rewards/");
    }
    return location.startsWith(item.href);
  };

  return (
    <div className="sticky top-0 z-50 bg-slate-800 dark:bg-slate-800 border-b border-slate-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-14">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {communityNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = isItemActive(item);

              return (
                <Link key={item.id} href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "relative h-10 px-4 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive
                        ? "text-white bg-slate-700 border-b-2 border-white"
                        : "text-white hover:text-gray-200 hover:bg-slate-700/50",
                    )}
                  >
                    <Icon className="h-4 w-4 mr-2 text-white" />
                    {t(item.label)}
                    {item.badge && (
                      <Badge
                        variant={
                          item.badge === "HOT" ? "destructive" : "secondary"
                        }
                        className="ml-2 h-4 px-1.5 text-xs"
                      >
                        {item.badge}
                      </Badge>
                    )}
                    {item.isNew && (
                      <Badge
                        variant="default"
                        className="ml-2 h-4 px-1.5 text-xs bg-green-500"
                      >
                        NEW
                      </Badge>
                    )}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center justify-center space-x-1 overflow-x-auto">
            {communityNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = isItemActive(item);

              return (
                <Link key={item.id} href={item.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "relative flex-shrink-0 h-8 px-2 text-xs font-medium rounded-md transition-colors",
                      isActive
                        ? "text-white bg-slate-700 border-b-2 border-white"
                        : "text-white hover:text-gray-200 hover:bg-slate-700/50",
                    )}
                  >
                    <Icon className="h-3 w-3 mr-1 text-white" />
                    {t(item.label)}
                    {item.badge && (
                      <Badge
                        variant={
                          item.badge === "HOT" ? "destructive" : "secondary"
                        }
                        className="ml-1 h-3 px-1 text-xs"
                      >
                        {item.badge}
                      </Badge>
                    )}
                    {item.isNew && (
                      <Badge
                        variant="default"
                        className="ml-1 h-3 px-1 text-xs bg-green-500"
                      >
                        NEW
                      </Badge>
                    )}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Layout({ children, showCommunityNav = false }: LayoutProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background dark:bg-[#1a1a1a]">
      {showCommunityNav && <CommunityTopNav />}
      <div className={cn(showCommunityNav ? "pt-0" : "")}>{children}</div>

      {/* Global Fixed Floating Buttons */}
      <ChatbotWidget />

      {/* Editor Button (Bottom-Left) */}
      <div className="fixed bottom-6 left-6 z-50 fab-slide-in-left">
        <Link href="/editor">
          <Button
            size="lg"
            className="bg-black hover:bg-gray-800 text-white shadow-lg rounded-full px-4 sm:px-6 py-3 flex items-center space-x-2 transition-all hover:shadow-xl transform hover:scale-105"
          >
            <div className="flex items-center space-x-2">
              <Puzzle className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="font-medium text-xs sm:text-sm">
                {t({
                  ko: "굿즈에디터",
                  en: "Goods Editor",
                  ja: "グッズエディター",
                  zh: "商品编辑器",
                })}
              </span>
            </div>
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default Layout;
