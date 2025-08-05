import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
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
import { motion } from "framer-motion";
import ReviewForm from "@/components/ReviewForm";
import { supabase } from "@/lib/supabase";
import { useSupabaseAuth } from "@/components/SupabaseProvider";
import type { Product, ProductReview } from "@shared/schema";

export default function ProductDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const { language, t } = useLanguage();

  // State management
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedBase, setSelectedBase] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedPackaging, setSelectedPackaging] = useState("기본 포장"); // Default packaging
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [activeTab, setActiveTab] = useState("pdf");
  const [customText, setCustomText] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const { user } = useSupabaseAuth();

  const refreshReviews = async () => {
    if (!id) return;
    const { data } = await supabase
      .from("reviews")
      .select("id,rating,content,created_at,user_id")
      .eq("product_id", id)
      .eq("is_approved", true)
      .order("created_at", { ascending: false });
    setReviews(data || []);
  };

  useEffect(() => {
    refreshReviews();
  }, [id]);

  // Fetch product data
  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: [`/api/products/${id}`],
    enabled: !!id,
  });

  // Product display data using API response with customization_options
  const productDisplay = product ? {
    ...product,
    // Basic product info
    name: product.name || "상품명",
    nameKo: product.name_ko || product.name || "상품명", 
    description: product.description || product.description_ko || "",
    basePrice: product.base_price || 0,
    imageUrl: product.image_url || "/api/placeholder/600/600",
    
    // Image gallery
    images: [
      product.image_url || "/api/placeholder/600/600",
      "/api/placeholder/600/600", 
      "/api/placeholder/600/600",
    ],
    
    // Options from customization_options or fallback defaults
    sizes: product.customization_options?.sizes || [
      { name: "일반 20x20", price: 3500, description: "기본 사이즈" },
      { name: "중형 50x50", price: 6500, description: "중형 사이즈" },
      { name: "라미 100x100", price: 12000, description: "대형 사이즈" },
      { name: "대형 200x200", price: 25000, description: "특대형 사이즈" },
    ],
    
    colors: product.customization_options?.colors || [
      { name: "투명", priceDelta: 0, hex: "#FFFFFF", opacity: 0.8 },
      { name: "반투명", priceDelta: 500, hex: "#FFFFFF", opacity: 0.5 },
      { name: "흰색", priceDelta: 300, hex: "#FFFFFF" },
      { name: "검정", priceDelta: 300, hex: "#000000" },
    ],
    
    bases: product.customization_options?.bases || [
      { name: "일반", price: 0, description: "기본 받침" },
      { name: "라미 3T", price: 1200, description: "3mm 라미네이팅" },
      { name: "라미 5T", price: 1800, description: "5mm 라미네이팅" },
    ],
    
    quantityRanges: [
      { range: "1~9", condition: "소량 주문", multiplier: 1.0 },
      { range: "10~49", condition: "중량 주문", multiplier: 0.9 },
      { range: "50~99", condition: "대량 주문", multiplier: 0.8 },
      { range: "100+", condition: "초대량 주문", multiplier: 0.7 },
    ],
    
    packaging: [
      { name: "기본 포장", price: 0, description: "개별 비닐 포장" },
      { name: "개별 포장", price: 500, description: "개별 OPP 포장" },
      { name: "선물 포장", price: 1000, description: "선물용 박스 포장" },
    ],
    
    rating: 4.5,
    reviewCount: product.reviewsCount || product.reviews_count || 0,
  } : null;

  // Mock reviews data
  const mockReviews = [
    {
      id: 1,
      userId: 1,
      productId: 1,
      rating: 5,
      title: "정말 만족스러운 품질이에요!",
      content:
        "디자인이 선명하게 나오고 아크릴 재질도 고급스럽습니다. 받침도 튼튼하고 완성도가 높네요. 다음에 또 주문할 예정입니다.",
      userName: "창작자님***",
      createdAt: new Date("2024-01-15"),
      images: ["/api/placeholder/150/150", "/api/placeholder/150/150"],
    },
    {
      id: 2,
      userId: 2,
      productId: 1,
      rating: 4,
      title: "빠른 배송과 좋은 퀄리티",
      content:
        "주문 후 2일 만에 받았어요. 색상도 정확하고 크기도 딱 맞습니다. 포장도 깔끔하게 되어있고 만족합니다.",
      userName: "굿즈러버***",
      createdAt: new Date("2024-01-10"),
      images: ["/api/placeholder/150/150"],
    },
  ];

  // Calculate total price with proper validation
  const calculateTotalPrice = () => {
    console.log("Calculating price with:", {
      selectedSize,
      selectedColor, 
      selectedBase,
      selectedPackaging,
      quantity,
      productDisplay
    });

    // Get base price from product data
    const basePrice = product?.base_price ? Number(product.base_price) : 0;
    
    // Get size price (this is the main price component)
    const sizePrice = productDisplay?.sizes?.find((s: any) => s.name === selectedSize)?.price || 0;
    
    // Get color price delta
    const colorPrice = productDisplay?.colors?.find((c: any) => c.name === selectedColor)?.priceDelta || 0;
    
    // Get base material price
    const baseTypePrice = productDisplay?.bases?.find((b: any) => b.name === selectedBase)?.price || 0;
    
    // Get packaging price
    const packagingPrice = productDisplay?.packaging?.find((p: any) => p.name === selectedPackaging)?.price || 0;

    // Calculate subtotal - use size price as main price if available, otherwise use base price
    const itemPrice = sizePrice > 0 ? sizePrice : basePrice;
    const addons = colorPrice + baseTypePrice + packagingPrice;
    const subtotal = itemPrice + addons;

    // Apply quantity-based multiplier
    const quantityRange = productDisplay?.quantityRanges?.find((r: any) => {
      if (!r.range) return false;
      const [min, max] = r.range.split(/[~-]/).map((n: string) => parseInt(n.replace(/\D/g, "")));
      return quantity >= min && (isNaN(max) || quantity <= max);
    });
    const multiplier = quantityRange?.multiplier || 1;

    const total = Math.round(subtotal * multiplier * quantity);
    
    console.log("Price calculation:", {
      basePrice,
      sizePrice,
      colorPrice,
      baseTypePrice,
      packagingPrice,
      itemPrice,
      addons,
      subtotal,
      multiplier,
      quantity,
      total
    });

    return total;
  };

  // File upload handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      toast({
        title: t({ ko: "파일 업로드 완료", en: "File uploaded successfully" }),
        description: t({
          ko: `${file.name}이(가) 업로드되었습니다.`,
          en: `${file.name} has been uploaded.`,
        }),
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      setUploadedFile(file);
      toast({
        title: t({
          ko: "PDF 파일 rk�로드 완료",
          en: "PDF file uploaded successfully",
        }),
        description: t({
          ko: `${file.name}이(가) 업로드되었습니다.`,
          en: `${file.name} has been uploaded.`,
        }),
      });
    }
  };

  const handleAddToCart = () => {
    // Validate required selections
    if (
      !selectedSize ||
      !selectedBase ||
      (productDisplay.colors.length > 0 && !selectedColor)
    ) {
      toast({
        title: t({ ko: "옵션을 선택해주세요", en: "Please select options" }),
        description: t({
          ko: "사이즈, 색상, 받침을 선택해야 합니다.",
          en: "Size, color and base must be selected.",
        }),
        variant: "destructive",
      });
      return;
    }

    try {
      // Create cart item object
      const cartItem = {
        id: productDisplay?.id,
        name: productDisplay?.name,
        nameKo: productDisplay?.nameKo,
        price: calculateTotalPrice(),
        quantity: quantity,
        image: productDisplay?.images[0],
        options: {
          size: selectedSize,
          color: selectedColor,
          base: selectedBase,
          packaging: selectedPackaging,
          uploadedFile: uploadedFile?.name || null,
          customText: customText || null,
          activeTab: activeTab,
        },
      };

      // Get existing cart from localStorage
      const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");

      // Check if item already exists with same options
      const existingItemIndex = existingCart.findIndex(
        (item: any) =>
          item.id === cartItem.id &&
          JSON.stringify(item.options) === JSON.stringify(cartItem.options),
      );

      if (existingItemIndex !== -1) {
        // Update quantity if item exists
        existingCart[existingItemIndex].quantity += quantity;
      } else {
        // Add new item to cart
        existingCart.push(cartItem);
      }

      // Save to localStorage
      localStorage.setItem("cart", JSON.stringify(existingCart));

      // Dispatch cart update event to notify header
      window.dispatchEvent(new CustomEvent("cartUpdated"));

      toast({
        title: t({ ko: "장바구니에 추가됨", en: "Added to cart" }),
        description: t({
          ko: `${productDisplay?.nameKo}이(가) 장바구니에 추가되었습니다.`,
          en: `${productDisplay?.nameKo} has been added to cart.`,
        }),
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: t({ ko: "오류", en: "Error" }),
        description: t({
          ko: "장바구니 추가 중 오류가 발생했습니다.",
          en: "An error occurred while adding to cart.",
        }),
        variant: "destructive",
      });
    }
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite
        ? t({ ko: "찜 목록에서 제거됨", en: "Removed from favorites" })
        : t({ ko: "찜 목록에 추가됨", en: "Added to favorites" }),
      description: isFavorite
        ? t({
            ko: `${productDisplay?.nameKo}이(가) 찜 목록에서 제거되었습니다.`,
            en: `${productDisplay?.nameKo} has been removed from favorites.`,
          })
        : t({
            ko: `${productDisplay?.nameKo}이(가) 찜 목록에 추가되었습니다.`,
            en: `${productDisplay?.nameKo} has been added to favorites.`,
          }),
    });
  };

  // Generate star rating
  const generateStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            상품 정보를 불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">
            상품을 불러오는 중 오류가 발생했습니다.
          </p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  // Product not found
  if (!productDisplay) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">
            상품을 찾을 수 없습니다.
          </p>
          <Link href="/products">
            <Button className="mt-4">상품 목록으로 돌아가기</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a]">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-[#1a1a1a] border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Link
              href="/"
              className="hover:text-gray-700 dark:hover:text-gray-300"
            >
              홈
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <Link
              href="/products"
              className="hover:text-gray-700 dark:hover:text-gray-300"
            >
              제품
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-gray-900 dark:text-white">
              {productDisplay.nameKo}
            </span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-white dark:bg-[#1a1a1a] rounded-lg overflow-hidden shadow-sm border dark:border-gray-700">
              <img
                src={productDisplay.images[currentImageIndex]}
                alt={productDisplay.nameKo}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            <div className="flex space-x-2 overflow-x-auto">
              {productDisplay.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    currentImageIndex === index
                      ? "border-blue-500 ring-2 ring-blue-200"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${productDisplay.nameKo} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-6">
            {/* Product Title & Rating */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {productDisplay.nameKo}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  <div className="flex mr-2">
                    {generateStars(Math.round(productDisplay.rating))}
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {productDisplay.rating} ({productDisplay.reviewCount} 리뷰)
                  </span>
                </div>
                {productDisplay.isFeatured && (
                  <Badge className="bg-red-500 text-white">인기상품</Badge>
                )}
              </div>
            </div>

            {/* Price Display */}
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-300 mb-2">
                {calculateTotalPrice().toLocaleString()} 원
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                기본 가격부터 시작 (옵션에 따라 변동)
              </div>
            </div>

            {/* Product Options */}
            <div className="space-y-4">
              {/* Size Selection - Table Format */}
              <div>
                <Label className="text-base font-medium mb-3 block text-gray-900 dark:text-white">
                  ✅ 스탠드 사이즈
                </Label>
                <div className="space-y-4">
                  {/* 일반 사이즈 */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      일반 사이즈
                    </h4>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { name: "일반 20x20", price: 3500 },
                        { name: "일반 30x15", price: 4000 },
                        { name: "일반 30x30", price: 4500 },
                        { name: "일반 40x40", price: 5500 },
                        { name: "일반 50x30", price: 6000 },
                        { name: "일반 50x50", price: 6500 },
                        { name: "일반 60x30", price: 7000 },
                        { name: "일반 60x60", price: 7500 },
                        { name: "일반 70x35", price: 8000 },
                        { name: "일반 70x50", price: 8500 },
                        { name: "일반 70x70", price: 9000 },
                        { name: "일반 80x20", price: 8500 },
                      ].map((size) => (
                        <button
                          key={size.name}
                          onClick={() => setSelectedSize(size.name)}
                          className={`p-2 rounded border text-center text-sm transition-all ${
                            selectedSize === size.name
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-900 dark:text-gray-100"
                          }`}
                        >
                          <div className="font-medium">{size.name}</div>
                          <div className="text-xs text-blue-600 dark:text-blue-400">
                            {size.price.toLocaleString()}원
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 라미 사이즈 */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      라미 사이즈
                    </h4>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { name: "라미 20x20", price: 4000 },
                        { name: "라미 30x30", price: 5000 },
                        { name: "라미 40x40", price: 6000 },
                        { name: "라미 50x50", price: 7000 },
                        { name: "라미 60x60", price: 8000 },
                        { name: "라미 70x70", price: 9000 },
                        { name: "라미 80x80", price: 10000 },
                        { name: "라미 100x100", price: 12000 },
                      ].map((size) => (
                        <button
                          key={size.name}
                          onClick={() => setSelectedSize(size.name)}
                          className={`p-2 rounded border text-center text-sm transition-all ${
                            selectedSize === size.name
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-900 dark:text-gray-100"
                          }`}
                        >
                          <div className="font-medium">{size.name}</div>
                          <div className="text-xs text-blue-600 dark:text-blue-400">
                            {size.price.toLocaleString()}원
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 대형 사이즈 */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      대형 사이즈
                    </h4>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { name: "대형 100x200", price: 15000 },
                        { name: "대형 120x200", price: 18000 },
                        { name: "대형 150x200", price: 22000 },
                        { name: "대형 200x200", price: 25000 },
                      ].map((size) => (
                        <button
                          key={size.name}
                          onClick={() => setSelectedSize(size.name)}
                          className={`p-2 rounded border text-center text-sm transition-all ${
                            selectedSize === size.name
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-900 dark:text-gray-100"
                          }`}
                        >
                          <div className="font-medium">{size.name}</div>
                          <div className="text-xs text-blue-600 dark:text-blue-400">
                            {size.price.toLocaleString()}원
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Base Selection */}
              <div>
                <Label className="text-base font-medium mb-3 block text-gray-900 dark:text-white">
                  ✅ 받침 선택
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {productDisplay.bases.map((base) => (
                    <button
                      key={base.name}
                      onClick={() => setSelectedBase(base.name)}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        selectedBase === base.name
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      <div className="font-medium">{base.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {base.description}
                      </div>
                      <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {base.price > 0
                          ? `+${base.price.toLocaleString()}원`
                          : "무료"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              {productDisplay.colors.length > 0 && (
                <div>
                  <Label className="text-base font-medium mb-3 block text-gray-900 dark:text-white">
                    ✅ 색상 선택
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {productDisplay.colors.map((color: any) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color.name)}
                        className={`p-3 rounded-lg border text-center transition-all ${
                          selectedColor === color.name
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-900 dark:text-gray-100"
                        }`}
                      >
                        <div className="font-medium">{color.name}</div>
                        {color.priceDelta ? (
                          <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            +{color.priceDelta.toLocaleString()}원
                          </div>
                        ) : null}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* Quantity Selection */}
              <div>
                <Label className="text-base font-medium mb-3 block text-gray-900 dark:text-white">
                  ✅ 수량 선택
                </Label>
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center border dark:border-gray-700 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-l-lg text-gray-900 dark:text-gray-100"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 border-x dark:border-gray-700 min-w-[60px] text-center text-gray-900 dark:text-gray-100">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-r-lg text-gray-900 dark:text-gray-100"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-[#1a1a1a]/50 rounded-lg p-3">
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    <strong>수량별 할인 안내:</strong>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 space-y-1">
                    {productDisplay.quantityRanges.map((range) => (
                      <div key={range.range} className="flex justify-between">
                        <span>
                          {range.range} ({range.condition})
                        </span>
                        <span className="font-medium">
                          {range.multiplier === 1
                            ? "정가"
                            : `${((1 - range.multiplier) * 100).toFixed(0)}% 할인`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Packaging Selection */}
              <div>
                <Label className="text-base font-medium mb-3 block text-gray-900 dark:text-white">
                  ✅ 포장 방식
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {productDisplay.packaging.map((pkg) => (
                    <button
                      key={pkg.name}
                      onClick={() => setSelectedPackaging(pkg.name)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        selectedPackaging === pkg.name
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      <div className="font-medium">{pkg.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {pkg.description}
                      </div>
                      <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {pkg.price > 0
                          ? `+${pkg.price.toLocaleString()}원`
                          : "무료"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* File Upload Section */}
              <div>
                <Label className="text-base font-medium mb-3 block text-gray-900 dark:text-white">
                  ✅ 파일 업로드
                </Label>
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="pdf">PDF 업로드</TabsTrigger>
                    <TabsTrigger value="design">도안 작업 의뢰</TabsTrigger>
                    <TabsTrigger value="editor">올댓에디터</TabsTrigger>
                  </TabsList>

                  <TabsContent value="pdf" className="mt-4">
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                        isDragOver
                          ? "border-blue-400 bg-blue-50 dark:bg-blue-900/30"
                          : uploadedFile
                            ? "border-green-400 bg-green-50 dark:bg-green-900/30"
                            : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="pdf-upload"
                      />
                      <label htmlFor="pdf-upload" className="cursor-pointer">
                        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                        {uploadedFile ? (
                          <div>
                            <p className="text-green-600 dark:text-green-400 font-medium mb-2">
                              ✅ {uploadedFile.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              파일이 업로드되었습니다. 다른 파일을 선택하려면
                              클릭하세요.
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-gray-600 dark:text-gray-300 font-medium mb-2">
                              PDF 파일을 드래그하거나 클릭하여 업로드
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              최대 50MB, PDF 파일만 업로드 가능합니다.
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                  </TabsContent>

                  <TabsContent value="design" className="mt-4">
                    <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <Palette className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                        <h3 className="font-medium text-yellow-800 dark:text-yellow-300">
                          도안 작업 의뢰
                        </h3>
                      </div>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                        전문 디자이너가 고객님의 요청에 따라 도안을
                        제작해드립니다.
                      </p>
                      <Textarea
                        placeholder="원하는 디자인에 대해 자세히 설명해주세요..."
                        value={customText}
                        onChange={(e) => setCustomText(e.target.value)}
                        className="mb-3"
                        rows={4}
                      />
                      <div className="text-xs text-yellow-600 dark:text-yellow-400">
                        * 도안 작업비: 별도 견적 (복잡도에 따라
                        5,000원~20,000원)
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="editor" className="mt-4">
                    <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <Puzzle className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                        <h3 className="font-medium text-blue-800 dark:text-blue-300">
                          굿즈에디터
                        </h3>
                      </div>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                        브라우저에서 바로 디자인을 만들어보세요! 간단한 조작으로
                        전문적인 굿즈를 제작할 수 있습니다.
                      </p>
                      <Link href="/editor">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                          <Puzzle className="w-4 h-4 mr-2" />
                          굿즈에디터 시작하기
                        </Button>
                      </Link>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={!selectedSize || !selectedBase}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {calculateTotalPrice().toLocaleString()}원 주문하기
              </Button>
              <Button
                variant="outline"
                onClick={handleToggleFavorite}
                className="p-3"
              >
                <Heart
                  className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"}`}
                />
              </Button>
              <Button
                variant="outline"
                className="p-3 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Sample File Guide */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Download className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                  샘플파일 안내
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  올바른 파일 제작을 위한 템플릿과 가이드를 확인하세요
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
            >
              <Download className="w-4 h-4 mr-2" />
              다운로드
            </Button>
          </div>
        </div>

        {/* Product Details & Reviews */}
        <div className="mt-12">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">상품 상세</TabsTrigger>
              <TabsTrigger value="reviews">상품 후기</TabsTrigger>
              <TabsTrigger value="qna">상품 문의</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-8">
              <div className="space-y-8">
                {/* Product Detail Images */}
                <div className="bg-white dark:bg-[#1a1a1a] rounded-lg p-6">
                  <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
                    상품 상세 정보
                  </h3>
                  <div className="space-y-6">
                    <img
                      src="/api/placeholder/800/600"
                      alt="상품 상세 이미지"
                      className="w-full rounded-lg"
                    />
                    <div className="prose max-w-none">
                      <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                        제품 특징
                      </h4>
                      <ul className="space-y-2 text-gray-700 dark:text-gray-100">
                        <li>• 고품질 아크릴 소재 사용으로 선명한 인쇄 품질</li>
                        <li>• 다양한 사이즈 옵션으로 원하는 크기 제작 가능</li>
                        <li>• 튼튼한 받침으로 안정적인 전시 효과</li>
                        <li>• 개인 맞춤형 디자인 제작 서비스</li>
                      </ul>

                      <h4 className="text-lg font-semibold mb-3 mt-6 text-gray-900 dark:text-white">
                        주의사항
                      </h4>
                      <ul className="space-y-2 text-gray-700 dark:text-gray-100">
                        <li>
                          • 해상도 300dpi 이상의 고해상도 이미지를 사용해주세요
                        </li>
                        <li>
                          • 색상은 모니터 환경에 따라 실제와 다를 수 있습니다
                        </li>
                        <li>
                          • 제작 완료 후 교환/환불이 어려우니 신중히
                          주문해주세요
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-8 space-y-4">
              {user && (
                <ReviewForm productId={id || ""} onSubmitted={refreshReviews} />
              )}
              {reviews.map((r) => (
                <div key={r.id} className="border p-3 rounded mb-2">
                  <p className="text-sm text-yellow-500">★ {r.rating} / 5</p>
                  <p className="text-base">{r.content}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="qna" className="mt-8">
              <div className="bg-white dark:bg-[#1a1a1a] rounded-lg p-6">
                <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
                  상품 문의
                </h3>
                <div className="text-center py-12">
                  <HelpCircle className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    아직 문의가 없습니다.
                  </p>
                  <Button
                    variant="outline"
                    className="border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    문의하기
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Product Overview Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-white dark:bg-[#1a1a1a] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t({
                ko: "상품목록 한눈에 보기",
                en: "Product Overview at a Glance",
                ja: "商品一覧一目で見る",
                zh: "产品列表一目了然",
              })}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {t({
                ko: "다양한 맞춤형 굿즈를 확인하고 원하는 상품을 찾아보세요",
                en: "Explore various custom goods and find what you're looking for",
                ja: "様々なカスタムグッズを確認し、お探しの商品を見つけてください",
                zh: "查看各种定制商品，找到您想要的产품",
              })}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 [&_a>div]:text-gray-700 [&_a>div]:dark:text-gray-300 [&_a>div:hover]:text-blue-600 [&_a>div:hover]:dark:text-blue-400 [&_a>div:hover]:bg-blue-50 [&_a>div:hover]:dark:bg-blue-900/30">
            {/* Acrylic Keyrings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🧷</span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {t({
                    ko: "아크릴 키링",
                    en: "Acrylic Keyrings",
                    ja: "アクリルキーリング",
                    zh: "亚克力钥匙扣",
                  })}
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {[
                  {
                    ko: "투명 키링",
                    en: "Clear Keyring",
                    category: "keyring",
                    subcategory: "clear",
                  },
                  {
                    ko: "하프미러 키링",
                    en: "Half Mirror Keyring",
                    category: "keyring",
                    subcategory: "halfmirror",
                  },
                  {
                    ko: "글리터 키링",
                    en: "Glitter Keyring",
                    category: "keyring",
                    subcategory: "glitter",
                  },
                  {
                    ko: "유색/투명컬러/아스텔 키링",
                    en: "Colored/Transparent/Pastel Keyring",
                    category: "keyring",
                    subcategory: "colored",
                  },
                  {
                    ko: "자개 키링",
                    en: "Mother of Pearl Keyring",
                    category: "keyring",
                    subcategory: "pearl",
                  },
                  {
                    ko: "거울 키링",
                    en: "Mirror Keyring",
                    category: "keyring",
                    subcategory: "mirror",
                  },
                  {
                    ko: "홀로그램 키링",
                    en: "Hologram Keyring",
                    category: "keyring",
                    subcategory: "hologram",
                  },
                  {
                    ko: "하프미러5T 키링",
                    en: "Half Mirror 5T Keyring",
                    category: "keyring",
                    subcategory: "halfmirror5t",
                  },
                  {
                    ko: "투명5T 키링",
                    en: "Clear 5T Keyring",
                    category: "keyring",
                    subcategory: "clear5t",
                  },
                  {
                    ko: "뮤트컬러 키링",
                    en: "Mute Color Keyring",
                    category: "keyring",
                    subcategory: "mute",
                  },
                  {
                    ko: "야광 키링",
                    en: "Glow-in-the-Dark Keyring",
                    category: "keyring",
                    subcategory: "glow",
                  },
                  {
                    ko: "회전 스핀 돌려돌려 키링",
                    en: "Rotating Spin Keyring",
                    category: "keyring",
                    subcategory: "spin",
                  },
                  {
                    ko: "랜티큘러 키링",
                    en: "Lenticular Keyring",
                    category: "keyring",
                    subcategory: "lenticular",
                  },
                  {
                    ko: "파스텔 아스텔 4T 키링",
                    en: "Pastel 4T Keyring",
                    category: "keyring",
                    subcategory: "pastel4t",
                  },
                ].map((item, index) => (
                  <Link
                    key={index}
                    href={`/category/${item.category}?sub=${item.subcategory}`}
                  >
                    <div className="text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors cursor-pointer">
                      • {language === "ko" ? item.ko : item.en}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Corot */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🧷</span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {t({
                    ko: "코롯토",
                    en: "Corot",
                    ja: "コロット",
                    zh: "科罗托",
                  })}
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {[
                  {
                    ko: "자립형 코롯토 (8T/9T)",
                    en: "Self-standing Corot (8T/9T)",
                    category: "korotto",
                    subcategory: "selfstanding",
                  },
                  {
                    ko: "뒤도바 코롯토 (10T)",
                    en: "Reverse Corot (10T)",
                    category: "korotto",
                    subcategory: "reverse",
                  },
                  {
                    ko: "아프로바 코롯토 (10T)",
                    en: "Approve Corot (10T)",
                    category: "korotto",
                    subcategory: "approve",
                  },
                ].map((item, index) => (
                  <Link
                    key={index}
                    href={`/category/${item.category}?sub=${item.subcategory}`}
                  >
                    <div className="text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors cursor-pointer">
                      • {language === "ko" ? item.ko : item.en}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Smart Tok */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">📱</span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {t({
                    ko: "스마트톡",
                    en: "Smart Tok",
                    ja: "スマートトーク",
                    zh: "智能支架",
                  })}
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {[
                  {
                    ko: "투명 스마트톡",
                    en: "Clear Smart Tok",
                    category: "smarttok",
                    subcategory: "clear",
                  },
                  {
                    ko: "거울 스마트톡",
                    en: "Mirror Smart Tok",
                    category: "smarttok",
                    subcategory: "mirror",
                  },
                  {
                    ko: "홀로그램 스마트톡",
                    en: "Hologram Smart Tok",
                    category: "smarttok",
                    subcategory: "hologram",
                  },
                  {
                    ko: "하프미러5T 스마트톡",
                    en: "Half Mirror 5T Smart Tok",
                    category: "smarttok",
                    subcategory: "halfmirror5t",
                  },
                  {
                    ko: "뮤트컬러 스마트톡",
                    en: "Mute Color Smart Tok",
                    category: "smarttok",
                    subcategory: "mute",
                  },
                  {
                    ko: "야광 스마트톡",
                    en: "Glow-in-the-Dark Smart Tok",
                    category: "smarttok",
                    subcategory: "glow",
                  },
                  {
                    ko: "회전 스마트톡",
                    en: "Rotating Smart Tok",
                    category: "smarttok",
                    subcategory: "rotating",
                  },
                ].map((item, index) => (
                  <Link
                    key={index}
                    href={`/category/${item.category}?sub=${item.subcategory}`}
                  >
                    <div className="text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors cursor-pointer">
                      • {language === "ko" ? item.ko : item.en}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Stands */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🎯</span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {t({
                    ko: "스탠드",
                    en: "Stands",
                    ja: "スタンド",
                    zh: "支架",
                  })}
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {[
                  {
                    ko: "일반 스탠드 (35×50)",
                    en: "Regular Stand (35×50)",
                    category: "stand",
                    subcategory: "regular",
                  },
                  {
                    ko: "라미 스탠드 (70×140)",
                    en: "Lami Stand (70×140)",
                    category: "stand",
                    subcategory: "lami",
                  },
                  {
                    ko: "대형 스탠드 (100×200)",
                    en: "Large Stand (100×200)",
                    category: "stand",
                    subcategory: "large",
                  },
                  {
                    ko: "투명 스탠드",
                    en: "Clear Stand",
                    category: "stand",
                    subcategory: "clear",
                  },
                  {
                    ko: "컬러 스탠드",
                    en: "Color Stand",
                    category: "stand",
                    subcategory: "color",
                  },
                ].map((item, index) => (
                  <Link
                    key={index}
                    href={`/category/${item.category}?sub=${item.subcategory}`}
                  >
                    <div className="text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors cursor-pointer">
                      • {language === "ko" ? item.ko : item.en}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Holders */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🖼️</span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {t({ ko: "홀더", en: "Holders", ja: "ホルダー", zh: "支架" })}
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {[
                  {
                    ko: "포카홀더",
                    en: "Photo Card Holder",
                    category: "holder",
                    subcategory: "photocard",
                  },
                  {
                    ko: "카드홀더",
                    en: "Card Holder",
                    category: "holder",
                    subcategory: "card",
                  },
                  {
                    ko: "명함홀더",
                    en: "Business Card Holder",
                    category: "holder",
                    subcategory: "business",
                  },
                  {
                    ko: "메모홀더",
                    en: "Memo Holder",
                    category: "holder",
                    subcategory: "memo",
                  },
                ].map((item, index) => (
                  <Link
                    key={index}
                    href={`/category/${item.category}?sub=${item.subcategory}`}
                  >
                    <div className="text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors cursor-pointer">
                      • {language === "ko" ? item.ko : item.en}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Miscellaneous */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🎨</span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {t({
                    ko: "기타 굿즈",
                    en: "Other Goods",
                    ja: "その他グッズ",
                    zh: "其他商品",
                  })}
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {[
                  {
                    ko: "셰이커",
                    en: "Shaker",
                    category: "shaker",
                    subcategory: "all",
                  },
                  {
                    ko: "카라비너",
                    en: "Carabiner",
                    category: "carabiner",
                    subcategory: "all",
                  },
                  {
                    ko: "거울",
                    en: "Mirror",
                    category: "mirror",
                    subcategory: "all",
                  },
                  {
                    ko: "자석",
                    en: "Magnet",
                    category: "magnet",
                    subcategory: "all",
                  },
                  {
                    ko: "문구류",
                    en: "Stationery",
                    category: "stationery",
                    subcategory: "all",
                  },
                  {
                    ko: "컷팅스티커",
                    en: "Cutting Sticker",
                    category: "cutting",
                    subcategory: "all",
                  },
                ].map((item, index) => (
                  <Link
                    key={index}
                    href={`/category/${item.category}?sub=${item.subcategory}`}
                  >
                    <div className="text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors cursor-pointer">
                      • {language === "ko" ? item.ko : item.en}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link href="/categories">
              <Button
                variant="outline"
                size="lg"
                className="bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700"
              >
                <Eye className="w-4 h-4 mr-2" />
                {t({
                  ko: "전체 카테고리 보기",
                  en: "View All Categories",
                  ja: "全カテゴリを見る",
                  zh: "查看所有分类",
                })}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Fixed Floating Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col items-end space-y-4 z-50">
        {/* Inquiry Button */}
        <div className="relative">
          <Button
            variant="outline"
            size="lg"
            className="bg-white dark:bg-[#1a1a1a] hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 shadow-lg border border-gray-200 dark:border-gray-700 rounded-full px-4 sm:px-6 py-3 flex items-center space-x-2 transition-all hover:shadow-xl"
          >
            <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 dark:text-blue-400" />
            <div className="text-left">
              <div className="font-medium text-xs sm:text-sm">문의하기</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                평일 9시~6시
              </div>
            </div>
          </Button>

          {/* Speech bubble */}
          <div className="absolute bottom-full right-0 mb-2 bg-gray-800 dark:bg-[#1a1a1a] text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            평일 9시~6시 (점심 12~1시)
            <div className="absolute top-full right-4 w-2 h-2 bg-gray-800 dark:bg-[#1a1a1a] transform rotate-45"></div>
          </div>
        </div>

        {/* Editor Button */}
        <Link href="/editor">
          <Button
            size="lg"
            className="bg-black dark:bg-[#1a1a1a] hover:bg-gray-800 dark:hover:bg-gray-600 text-white shadow-lg rounded-full px-4 sm:px-6 py-3 flex items-center space-x-2 transition-all hover:shadow-xl"
          >
            <Puzzle className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="font-medium text-xs sm:text-sm">
              🧩 굿즈에디터
            </span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
