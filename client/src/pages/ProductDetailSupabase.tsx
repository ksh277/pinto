import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ShoppingCart,
  Heart,
  Share2,
  Star,
  Plus,
  Minus,
  Upload,
  Download,
  MessageCircle,
  Puzzle,
  ChevronLeft,
  ChevronRight,
  FileText,
  Palette,
  Package,
  Info,
  ChevronDown,
  ChevronUp,
  Eye,
  User,
  Calendar,
  HelpCircle,
  Phone,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/contexts/AuthContext";
import { useSupabaseAuth } from "@/components/SupabaseProvider";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { apiRequest } from "@/lib/queryClient";

interface Product {
  id: string;
  name: string;
  name_ko: string;
  description: string;
  description_ko: string;
  base_price: number;
  category_id: string;
  image_url: string;
  is_active: boolean;
  is_featured: boolean;
  options: any;
  created_at: string;
}

interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string;
  display_order: number;
  created_at: string;
}

interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  users: {
    username: string;
  };
}

interface CartItem {
  user_id: string;
  product_id: string;
  quantity: number;
  customization?: any;
}

export default function ProductDetailSupabase() {
  const { id } = useParams();
  const { toast } = useToast();
  const { language, t } = useLanguage();
  const { user: localUser } = useAuth();
  const { user: supabaseUser } = useSupabaseAuth();
  const queryClient = useQueryClient();

  // State management
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedBase, setSelectedBase] = useState("");
  const [selectedPackaging, setSelectedPackaging] = useState("기본 포장");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [expandedOptions, setExpandedOptions] = useState<
    Record<string, boolean>
  >({});

  const currentUser = supabaseUser || localUser;
  const isLoggedIn = !!currentUser;

  // Product data query
  const {
    data: product,
    isLoading: productLoading,
    error: productError,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching product:", error);
        throw error;
      }

      return data;
    },
    enabled: !!id,
  });

  // Product images query
  const { data: productImages, isLoading: imagesLoading } = useQuery({
    queryKey: ["productImages", id],
    queryFn: async () => {
      if (!id) return [];

      const { data, error } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", id)
        .order("display_order");

      if (error) {
        console.error("Error fetching product images:", error);
        return [];
      }

      return data || [];
    },
    enabled: !!id,
  });

  // Product reviews query
  const { data: productReviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ["productReviews", id],
    queryFn: async () => {
      if (!id) return [];

      const { data, error } = await supabase
        .from("product_reviews")
        .select(
          `
          *,
          users (
            username
          )
        `,
        )
        .eq("product_id", id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching product reviews:", error);
        return [];
      }

      return data || [];
    },
    enabled: !!id,
  });

  // Favorite status query
  const { data: isFavorite, isLoading: favoriteLoading } = useQuery({
    queryKey: ["isFavorite", id, currentUser?.id],
    queryFn: async () => {
      if (!id || !currentUser?.id) return false;

      const { data, error } = await supabase
        .from("favorites")
        .select("*")
        .eq("user_id", currentUser.id)
        .eq("product_id", id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error checking favorite status:", error);
        return false;
      }

      return !!data;
    },
    enabled: !!id && !!currentUser?.id,
  });

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser?.id || !id) throw new Error("User not logged in");

      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", currentUser.id)
          .eq("product_id", id);

        if (error) throw error;
        return false;
      } else {
        // Add to favorites
        const { error } = await supabase.from("favorites").insert([
          {
            user_id: currentUser.id,
            product_id: id,
          },
        ]);

        if (error) throw error;
        return true;
      }
    },
    onSuccess: (newFavoriteStatus) => {
      queryClient.invalidateQueries({
        queryKey: ["isFavorite", id, currentUser?.id],
      });
      toast({
        title: newFavoriteStatus ? "찜 추가" : "찜 제거",
        description: newFavoriteStatus
          ? "찜 목록에 추가되었습니다."
          : "찜 목록에서 제거되었습니다.",
      });
    },
    onError: (error) => {
      console.error("Error toggling favorite:", error);
      toast({
        title: "오류",
        description: "찜 상태를 변경할 수 없습니다.",
        variant: "destructive",
      });
    },
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser?.id || !id) throw new Error("User not logged in");

      const { error } = await supabase.from("cart_items").insert([
        {
          user_id: currentUser.id,
          product_id: id,
          quantity: quantity,
          customization: {
            size: selectedSize,
            base: selectedBase,
            packaging: selectedPackaging,
          },
        },
      ]);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "장바구니 추가",
        description: "상품이 장바구니에 추가되었습니다.",
      });
    },
    onError: (error) => {
      console.error("Error adding to cart:", error);
      toast({
        title: "오류",
        description: "장바구니에 추가할 수 없습니다.",
        variant: "destructive",
      });
    },
  });

  // Get all available images (product main image + additional images)
  const allImages = [
    { image_url: product?.image_url || "", alt_text: product?.name || "" },
    ...(productImages || []),
  ].filter((img) => img.image_url);

  // Calculate total price
  const calculateTotalPrice = () => {
    if (!product) return 0;

    let basePrice = product.base_price;

    // Add size-based pricing
    if (selectedSize) {
      const sizeMultipliers: Record<string, number> = {
        "20x20": 1,
        "30x30": 1.2,
        "40x40": 1.5,
        "50x50": 1.8,
        "60x60": 2.2,
        "70x70": 2.5,
        "80x80": 2.8,
        "90x90": 3.2,
        "100x100": 3.5,
        "라미 20x20": 1.3,
        "라미 30x30": 1.6,
        "라미 40x40": 2.0,
        "라미 50x50": 2.4,
        "라미 60x60": 2.8,
        "라미 70x70": 3.2,
        "라미 80x80": 3.6,
        "라미 100x100": 4.0,
        "대형 100x200": 4.5,
        "대형 150x150": 5.0,
        "대형 200x200": 6.0,
        투명: 1.1,
        컬러: 1.2,
      };

      const multiplier = sizeMultipliers[selectedSize] || 1;
      basePrice *= multiplier;
    }

    // Add base-specific pricing
    if (selectedBase) {
      const baseAddons: Record<string, number> = {
        투명: 0,
        인쇄: 500,
        "라미 3T": 1000,
        "라미 5T": 1500,
      };

      basePrice += baseAddons[selectedBase] || 0;
    }

    return basePrice * quantity;
  };

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      toast({
        title: "로그인 필요",
        description: "장바구니에 추가하려면 로그인해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedSize || !selectedBase) {
      toast({
        title: "옵션 선택",
        description: "사이즈와 받침을 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    addToCartMutation.mutate();
  };

  const handleToggleFavorite = () => {
    if (!isLoggedIn) {
      toast({
        title: "로그인 필요",
        description: "찜하려면 로그인해주세요.",
        variant: "destructive",
      });
      return;
    }

    toggleFavoriteMutation.mutate();
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + allImages.length) % allImages.length,
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(price);
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  if (productLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a] flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              상품을 찾을 수 없습니다
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              요청하신 상품이 존재하지 않거나 삭제되었습니다.
            </p>
            <Link href="/category/acrylic">
              <Button>상품 목록으로 돌아가기</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
          <Link
            href="/"
            className="hover:text-gray-700 dark:hover:text-gray-200"
          >
            Home
          </Link>
          <span>/</span>
          <Link
            href="/category/acrylic"
            className="hover:text-gray-700 dark:hover:text-gray-200"
          >
            카테고리
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white">
            {product.name_ko || product.name}
          </span>
        </nav>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative bg-white dark:bg-[#1a1a1a] rounded-lg overflow-hidden">
              <img
                src={
                  allImages[currentImageIndex]?.image_url ||
                  "/api/placeholder/500/500"
                }
                alt={allImages[currentImageIndex]?.alt_text || product.name}
                className="w-full h-96 object-cover"
              />

              {allImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 dark:bg-[#1a1a1a]/80 rounded-full p-2 shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 dark:bg-[#1a1a1a]/80 rounded-full p-2 shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  </button>
                </>
              )}
            </div>

            {/* Image Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      index === currentImageIndex
                        ? "border-blue-500"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <img
                      src={image.image_url || "/api/placeholder/80/80"}
                      alt={image.alt_text || ""}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {product.name_ko || product.name}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
                {product.description_ko || product.description}
              </p>
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {formatPrice(calculateTotalPrice())}
                </span>
                {product.is_featured && (
                  <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    인기상품
                  </Badge>
                )}
              </div>
            </div>

            {/* Product Options */}
            <Card>
              <CardContent className="p-6 space-y-4">
                {/* Size Selection */}
                <div>
                  <Label className="text-sm font-medium text-gray-900 dark:text-white mb-2 block">
                    ✅ 스탠드 사이즈
                  </Label>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                    {[
                      { name: "일반 35×50", value: "35x50", price: "3,000원" },
                      {
                        name: "라미 70×140",
                        value: "70x140",
                        price: "7,000원",
                      },
                      {
                        name: "대형 100×200",
                        value: "100x200",
                        price: "15,000원",
                      },
                      { name: "투명", value: "투명", price: "4,000원" },
                    ].map((size) => (
                      <button
                        key={size.value}
                        onClick={() => setSelectedSize(size.value)}
                        className={`p-3 text-sm rounded-lg border-2 transition-all ${
                          selectedSize === size.value
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                        }`}
                      >
                        <div className="font-medium">{size.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {size.price}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Base Selection */}
                <div>
                  <Label className="text-sm font-medium text-gray-900 dark:text-white mb-2 block">
                    ✅ 받침 선택
                  </Label>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                    {[
                      { name: "투명", value: "투명", price: "+0원" },
                      { name: "인쇄", value: "인쇄", price: "+500원" },
                      { name: "라미 3T", value: "라미 3T", price: "+1,000원" },
                      { name: "라미 5T", value: "라미 5T", price: "+1,500원" },
                    ].map((base) => (
                      <button
                        key={base.value}
                        onClick={() => setSelectedBase(base.value)}
                        className={`p-3 text-sm rounded-lg border-2 transition-all ${
                          selectedBase === base.value
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                        }`}
                      >
                        <div className="font-medium">{base.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {base.price}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <Label className="text-sm font-medium text-gray-900 dark:text-white mb-2 block">
                    ✅ 수량 선택
                  </Label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-[3rem] text-center font-medium">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Packaging */}
                <div>
                  <Label className="text-sm font-medium text-gray-900 dark:text-white mb-2 block">
                    ✅ 포장 방식
                  </Label>
                  <Select
                    value={selectedPackaging}
                    onValueChange={setSelectedPackaging}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="포장 방식을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="기본 포장">기본 포장</SelectItem>
                      <SelectItem value="OPP 동봉">
                        OPP 동봉 (+500원)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Button
                onClick={handleToggleFavorite}
                variant="outline"
                className="flex-1"
                disabled={favoriteLoading || toggleFavoriteMutation.isPending}
              >
                <Heart
                  className={`h-5 w-5 mr-2 ${isFavorite ? "text-red-500 fill-current" : ""}`}
                />
                {isFavorite ? "찜 해제" : "찜하기"}
              </Button>
              <Button
                onClick={handleAddToCart}
                className="flex-1"
                disabled={addToCartMutation.isPending}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {addToCartMutation.isPending ? "추가 중..." : "장바구니 담기"}
              </Button>
            </div>
          </div>
        </div>

        {/* Product Reviews */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-400" />
              <span>상품 리뷰</span>
              <Badge variant="secondary">{productReviews?.length || 0}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reviewsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="border rounded-lg p-4 animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-[#1a1a1a] rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-[#1a1a1a] rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-[#1a1a1a] rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : productReviews && productReviews.length > 0 ? (
              <div className="space-y-4">
                {productReviews.map((review: ProductReview) => (
                  <div key={review.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          {renderStars(review.rating)}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {review.users?.username || "익명"}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(review.created_at)}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  아직 리뷰가 없습니다.
                </p>
                <Button variant="outline">첫 리뷰 작성하기</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
