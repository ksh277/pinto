import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  ShoppingCart,
  Heart,
  Search,
  Menu,
  X,
  LogOut,
  Settings,
  Package,
  Bell,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSupabaseAuth } from "@/components/SupabaseProvider";
import { isSupabaseConfigured } from "@/lib/supabase";
import UserMenu from "@/components/auth/UserMenu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SearchModal } from "@/components/SearchModal";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";
import { useNotifications } from "@/hooks/useNotifications";
import { useLanguage } from "@/hooks/useLanguage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";

export const Header = () => {
  const [location, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [wishlistCount, setWishlistCount] = useState(0);
  const { user: localUser, logout: localLogout } = useAuth();
  const { toast } = useToast();
  const { itemCount } = useCart();
  const { unreadCount } = useNotifications();
  const { language, setLanguage, t } = useLanguage();

  // Always use local auth for now - Supabase integration can be enabled later
  const currentUser = localUser;
  const isLoading = false;

  // Get wishlist count from localStorage
  const getWishlistCount = () => {
    try {
      const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
      return wishlist.length;
    } catch {
      return 0;
    }
  };

  // Update wishlist count when component mounts and when storage changes
  useEffect(() => {
    setWishlistCount(getWishlistCount());

    const handleStorageChange = () => {
      setWishlistCount(getWishlistCount());
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("wishlist-updated", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("wishlist-updated", handleStorageChange);
    };
  }, []);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsMobileMenuOpen(false);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const navItems = [
    { name: t({ ko: "홈", en: "Home", ja: "ホーム", zh: "首页" }), href: "/" },
    {
      name: t({ ko: "상품", en: "Products", ja: "商品", zh: "产品" }),
      href: "/products",
    },
    {
      name: t({
        ko: "커뮤니티",
        en: "Community",
        ja: "コミュニティ",
        zh: "社区",
      }),
      href: "/community",
    },
    {
      name: t({ ko: "자료실", en: "Resources", ja: "資料室", zh: "资源" }),
      href: "/resources",
    },
    {
      name: t({ ko: "이벤트", en: "Events", ja: "イベント", zh: "活动" }),
      href: "/events",
    },
  ];

  const getDisplayName = () => {
    if (localUser) {
      return localUser.username || localUser.email?.split("@")[0] || "사용자";
    }
    return "사용자";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Pinto
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location === item.href
                    ? "text-foreground"
                    : "text-foreground/60"
                }`}
              >
                {item.name}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchInputChange}
                placeholder={t({
                  ko: "상품검색...",
                  en: "Search products...",
                  ja: "商品検索...",
                  zh: "搜索商品...",
                })}
                className="w-64 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </form>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSearchModalOpen(true)}
            className="md:hidden"
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Cart */}
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-4 w-4" />
              {itemCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {itemCount > 99 ? "99+" : itemCount}
                </Badge>
              )}
            </Button>
          </Link>

          {/* Favorites */}
          <Link href="/wishlist">
            <Button variant="ghost" size="icon" className="relative">
              <Heart className="h-4 w-4" />
              {/* Wishlist count badge */}
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </Button>
          </Link>

          {/* Notifications */}
          {currentUser && (
            <Link href="/notifications">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Badge>
                )}
              </Button>
            </Link>
          )}

          {/* Language Selector */}
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-28 h-10 border-0 bg-transparent">
              <div className="flex items-center space-x-1">
                <Globe className="h-4 w-4" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-gray-50 dark:bg-gray-50 border border-gray-200">
              <SelectItem value="ko" className="hover:bg-gray-100 text-gray-900">한국어</SelectItem>
              <SelectItem value="en" className="hover:bg-gray-100 text-gray-900">English</SelectItem>
              <SelectItem value="ja" className="hover:bg-gray-100 text-gray-900">日本語</SelectItem>
              <SelectItem value="zh" className="hover:bg-gray-100 text-gray-900">中文</SelectItem>
            </SelectContent>
          </Select>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Authentication */}
          <div className="flex items-center space-x-2">
            {currentUser ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-foreground">
                  {getDisplayName()}님
                </span>
                {localUser?.isAdmin && (
                  <Link href="/admin/products">
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                      {t({
                        ko: "상품관리",
                        en: "Products",
                        ja: "商品管理",
                        zh: "产品管理",
                      })}
                    </Button>
                  </Link>
                )}
                <Link href="/mypage">
                  <Button variant="ghost" size="sm">
                    {t({
                      ko: "마이페이지",
                      en: "My Page",
                      ja: "マイページ",
                      zh: "我的页面",
                    })}
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={async () => {
                    await localLogout();
                    toast({
                      title: t({
                        ko: "로그아웃 완료",
                        en: "Logout Complete",
                        ja: "ログアウト完了",
                        zh: "登出完成",
                      }),
                      description: t({
                        ko: "안전하게 로그아웃되었습니다.",
                        en: "You have been safely logged out.",
                        ja: "安全にログアウトされました。",
                        zh: "您已安全登出。",
                      }),
                    });
                    setLocation("/");
                  }}
                  title="로그아웃"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    {t({
                      ko: "로그인",
                      en: "Login",
                      ja: "ログイン",
                      zh: "登录",
                    })}
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="default" size="sm">
                    {t({
                      ko: "회원가입",
                      en: "Sign Up",
                      ja: "会員登録",
                      zh: "注册",
                    })}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Actions */}
        <div className="md:hidden flex items-center space-x-2">
          {/* Mobile Search Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSearchModalOpen(true)}
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Overlay Background */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Slide Menu */}
          <div
            className="fixed top-0 right-0 h-screen w-[85%] max-w-sm bg-white dark:bg-[#1a1a1a] shadow-lg flex flex-col transform transition-transform duration-300 ease-in-out overflow-y-auto"
            style={{ transform: "translateX(0)" }}
          >
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                메뉴
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Mobile Search */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    placeholder={t({
                      ko: "상품검색...",
                      en: "Search products...",
                      ja: "商品検索...",
                      zh: "搜索商品...",
                    })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </form>
            </div>

            {/* Mobile User Info */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              {currentUser ? (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {getDisplayName()}님
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      환영합니다!
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={async () => {
                      await localLogout();
                      setIsMobileMenuOpen(false);
                      toast({
                        title: "로그아웃 완료",
                        description: "안전하게 로그아웃되었습니다.",
                      });
                      setLocation("/");
                    }}
                    title="로그아웃"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link href="/login">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      로그인
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button
                      variant="default"
                      className="w-full"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      회원가입
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Navigation */}
            <div className="flex-1 p-4">
              <nav className="space-y-2">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-left h-12"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.name}
                      <ChevronRight className="ml-auto h-4 w-4" />
                    </Button>
                  </Link>
                ))}
              </nav>

              {/* Mobile User Actions */}
              {currentUser && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="space-y-2">
                    <Link href="/mypage">
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <User className="mr-3 h-4 w-4" />
                        마이페이지
                      </Button>
                    </Link>
                    <Link href="/cart">
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <ShoppingCart className="mr-3 h-4 w-4" />
                        장바구니
                        {itemCount > 0 && (
                          <Badge
                            variant="destructive"
                            className="ml-auto h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                          >
                            {itemCount > 99 ? "99+" : itemCount}
                          </Badge>
                        )}
                      </Button>
                    </Link>
                    <Link href="/wishlist">
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Heart className="mr-3 h-4 w-4" />
                        찜한 상품
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <ThemeToggle />
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-24 h-8 border-0 bg-transparent">
                    <div className="flex items-center space-x-1">
                      <Globe className="h-3 w-3" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-gray-50 dark:bg-gray-50 border border-gray-200">
                    <SelectItem value="ko" className="hover:bg-gray-100 text-gray-900">한국어</SelectItem>
                    <SelectItem value="en" className="hover:bg-gray-100 text-gray-900">English</SelectItem>
                    <SelectItem value="ja" className="hover:bg-gray-100 text-gray-900">日本語</SelectItem>
                    <SelectItem value="zh" className="hover:bg-gray-100 text-gray-900">中文</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Navigation Bar */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-8 py-3 overflow-x-auto">
            <Link href="/category/keychains/all">
              <Button variant="ghost" size="sm" className="text-white whitespace-nowrap">
                키링
              </Button>
            </Link>
            <Link href="/category/stands/all">
              <Button variant="ghost" size="sm" className="text-white whitespace-nowrap">
                스탠드
              </Button>
            </Link>
            <Link href="/category/smarttok/all">
              <Button variant="ghost" size="sm" className="text-white whitespace-nowrap">
                스마트톡
              </Button>
            </Link>
            <Link href="/category/badges/all">
              <Button variant="ghost" size="sm" className="text-white whitespace-nowrap">
                뱃지
              </Button>
            </Link>
            <Link href="/category/wood/all">
              <Button variant="ghost" size="sm" className="text-white whitespace-nowrap">
                우드굿즈
              </Button>
            </Link>
            <Link href="/category/lanyards/all">
              <Button variant="ghost" size="sm" className="text-white whitespace-nowrap">
                렌야드
              </Button>
            </Link>
            <Link href="/reviews/all">
              <Button variant="ghost" size="sm" className="text-white whitespace-nowrap">
                사용후기
              </Button>
            </Link>
            <Link href="/collections">
              <Button variant="ghost" size="sm" className="text-white whitespace-nowrap">
                모음전
              </Button>
            </Link>
            <Link href="/resources">
              <Button variant="ghost" size="sm" className="text-white whitespace-nowrap">
                자료실
              </Button>
            </Link>
            <Link href="/events">
              <Button variant="ghost" size="sm" className="text-white whitespace-nowrap">
                이벤트
              </Button>
            </Link>
            <Link href="/rewards">
              <Button variant="ghost" size="sm" className="text-white whitespace-nowrap">
                회원등급혜택
              </Button>
            </Link>
          </nav>
        </div>
      </div>

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </header>
  );
};