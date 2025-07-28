import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronLeft, ChevronRight, Package, AlertCircle } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import FavoriteButton from "@/components/FavoriteButton";
import { AddToCartButton } from "@/components/AddToCartButton";

interface Product {
  id: string;
  name: string;
  name_ko: string;
  base_price: number;
  stock_quantity: number;
  is_featured: boolean;
  is_available: boolean;
  image_url?: string;
  category_id: string;
  created_at: string;
}

interface ProductsGridProps {
  pageSize?: number;
}

const ProductsGrid: React.FC<ProductsGridProps> = ({ pageSize = 12 }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const { toast } = useToast();

  const totalPages = Math.ceil(totalCount / pageSize);

  const fetchProducts = async (page: number) => {
    if (!isSupabaseConfigured) {
      setError("Supabase가 구성되지 않았습니다. 환경 변수를 설정해주세요.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize - 1;

      // Fetch products with pagination - only approved and active products
      const {
        data,
        error: fetchError,
        count,
      } = await supabase
        .from("products")
        .select("*", { count: "exact" })
        .eq("is_approved", true)
        .eq("is_active", true)
        .eq("is_active", true)
        .eq("is_approved", true)
        .range(startIndex, endIndex)
        .order("created_at", { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setProducts(data || []);
      setTotalCount(count || 0);

      if (data && data.length > 0) {
        toast({
          title: "상품 로드 완료",
          description: `${data.length}개의 상품을 불러왔습니다.`,
        });
      }
    } catch (err: any) {
      const errorMessage =
        err.message || "상품을 불러오는 중 오류가 발생했습니다.";
      setError(errorMessage);
      toast({
        title: "오류 발생",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage, pageSize]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(price);
  };

  if (!isSupabaseConfigured) {
    return (
      <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-orange-800 dark:text-orange-200">
          Supabase 환경 변수가 설정되지 않았습니다. .env 파일에
          VITE_SUPABASE_URL과 VITE_SUPABASE_ANON_KEY를 추가해주세요.
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: pageSize }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-0">
                <Skeleton className="h-48 w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-red-800 dark:text-red-200">
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
          상품이 없습니다
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          아직 등록된 상품이 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card
            key={product.id}
            className="overflow-hidden hover:shadow-lg transition-shadow"
          >
            <CardContent className="p-0">
              {/* Product Image */}
              <div className="h-48 bg-gray-100 dark:bg-[#1a1a1a] relative">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name_ko || product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-12 w-12 text-gray-400" />
                  </div>
                )}

                {/* Status Badges */}
                <div className="absolute top-2 left-2 flex gap-1">
                  {product.is_featured && (
                    <Badge variant="destructive" className="text-xs">
                      HOT
                    </Badge>
                  )}
                  {!product.is_available && (
                    <Badge variant="secondary" className="text-xs">
                      품절
                    </Badge>
                  )}
                </div>

                {/* Favorite Button */}
                <div className="absolute top-2 right-2">
                  <FavoriteButton
                    productId={product.id}
                    variant="icon-only"
                    className="bg-white/80 hover:bg-white/90 backdrop-blur-sm"
                  />
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4 space-y-2">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
                  {product.name_ko || product.name}
                </h3>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {formatPrice(product.base_price)}
                  </span>

                  {product.stock_quantity !== null && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      재고: {product.stock_quantity}개
                    </div>
                  )}
                </div>

                {/* Additional Info */}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>ID: {product.id.slice(0, 8)}...</span>
                  <span>
                    {new Date(product.created_at).toLocaleDateString("ko-KR")}
                  </span>
                </div>

                {/* Add to Cart Button */}
                <AddToCartButton
                  product={product}
                  variant="compact"
                  className="mt-3"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            이전
          </Button>

          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            다음
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Pagination Info */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        전체 {totalCount}개 상품 중 {(currentPage - 1) * pageSize + 1}-
        {Math.min(currentPage * pageSize, totalCount)}개 표시
      </div>
    </div>
  );
};

export default ProductsGrid;
