import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Package, Eye, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { apiRequest } from "@/lib/queryClient";

interface Product {
  id: number;
  name: string;
  nameKo: string;
  description: string;
  descriptionKo: string;
  price: number;
  originalPrice: number;
  categoryId: number;
  imageUrl: string;
  isActive: boolean;
  isFeatured: boolean;
  stockQuantity: number;
  tags: string[];
  createdAt: string;
}

interface Category {
  id: number;
  name: string;
  nameKo: string;
}

export const AdminProducts = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Fetch products
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products"],
    select: (data: unknown) => (data as Product[]) || [],
  });

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: (productData: Partial<Product>) =>
      apiRequest("/api/products", {
        method: "POST",
        body: JSON.stringify(productData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "성공",
        description: "상품이 성공적으로 추가되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "상품 추가에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: ({ id, ...productData }: Partial<Product> & { id: number }) =>
      apiRequest(`/api/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(productData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setEditingProduct(null);
      toast({
        title: "성공",
        description: "상품이 성공적으로 수정되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "상품 수정에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/products/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "성공",
        description: "상품이 성공적으로 삭제되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "상품 삭제에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  // Filter products
  const filteredProducts = (products as Product[]).filter(
    (product: Product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.nameKo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" ||
        product.categoryId.toString() === selectedCategory;
      return matchesSearch && matchesCategory;
    },
  );

  const ProductForm = ({
    product,
    onSubmit,
    isLoading,
  }: {
    product?: Product | null;
    onSubmit: (data: Partial<Product>) => void;
    isLoading: boolean;
  }) => {
    const [formData, setFormData] = useState({
      name: product?.name || "",
      nameKo: product?.nameKo || "",
      description: product?.description || "",
      descriptionKo: product?.descriptionKo || "",
      price: product?.price || 0,
      originalPrice: product?.originalPrice || 0,
      categoryId: product?.categoryId || 1,
      imageUrl: product?.imageUrl || "",
      isActive: product?.isActive ?? true,
      isFeatured: product?.isFeatured ?? false,
      stockQuantity: product?.stockQuantity || 0,
      tags: product?.tags?.join(", ") || "",
      options: product?.options ? JSON.stringify(product.options, null, 2) : "",
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      let parsedOptions: any = null;
      if (formData.options) {
        try {
          parsedOptions = JSON.parse(formData.options);
        } catch {
          toast({
            title: "옵션 형식 오류",
            description: "옵션 JSON을 확인해주세요.",
            variant: "destructive",
          });
          return;
        }
      }
      onSubmit({
        ...formData,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        options: parsedOptions,
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">상품명 (English)</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="nameKo">상품명 (한국어)</Label>
            <Input
              id="nameKo"
              value={formData.nameKo}
              onChange={(e) =>
                setFormData({ ...formData, nameKo: e.target.value })
              }
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">상품 설명 (English)</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="descriptionKo">상품 설명 (한국어)</Label>
          <Textarea
            id="descriptionKo"
            value={formData.descriptionKo}
            onChange={(e) =>
              setFormData({ ...formData, descriptionKo: e.target.value })
            }
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="price">판매가격 (원)</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: Number(e.target.value) })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="originalPrice">정가 (원)</Label>
            <Input
              id="originalPrice"
              type="number"
              value={formData.originalPrice}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  originalPrice: Number(e.target.value),
                })
              }
            />
          </div>
          <div>
            <Label htmlFor="stockQuantity">재고수량</Label>
            <Input
              id="stockQuantity"
              type="number"
              value={formData.stockQuantity}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  stockQuantity: Number(e.target.value),
                })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="categoryId">카테고리</Label>
            <Select
              value={formData.categoryId.toString()}
              onValueChange={(value) =>
                setFormData({ ...formData, categoryId: Number(value) })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.nameKo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="imageUrl">이미지 URL</Label>
            <Input
              id="imageUrl"
              value={formData.imageUrl}
              onChange={(e) =>
                setFormData({ ...formData, imageUrl: e.target.value })
              }
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div>
            <div className="md:col-span-2">
              <Label htmlFor="options">옵션 JSON</Label>
              <Textarea
                id="options"
                value={formData.options}
                onChange={(e) =>
                  setFormData({ ...formData, options: e.target.value })
                }
                rows={3}
              />
            </div>
          <div>
            <Label htmlFor="tags">태그 (쉼표로 구분)</Label>
          <Input
            id="tags"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="키링, 아크릴, 투명"
          />
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
            />
            <span>활성화</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.isFeatured}
              onChange={(e) =>
                setFormData({ ...formData, isFeatured: e.target.checked })
              }
            />
            <span>추천상품</span>
          </label>
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsCreateDialogOpen(false);
              setEditingProduct(null);
            }}
          >
            취소
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "저장 중..." : product ? "수정" : "추가"}
          </Button>
        </div>
    );
  };

  if (productsLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">상품 목록을 불러오는 중...</div>
      </div>
            );
    );
  }
            
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Package className="h-6 w-6" />
          <h1 className="text-2xl font-bold">상품 관리</h1>
          <Badge variant="secondary">{filteredProducts.length}개</Badge>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              상품 추가
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>새 상품 추가</DialogTitle>
            </DialogHeader>
            <ProductForm
              onSubmit={(data) => createProductMutation.mutate(data)}
              isLoading={createProductMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="상품명으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="카테고리 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 카테고리</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.nameKo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product: Product) => (
          <Card key={product.id} className="overflow-hidden">
            <div className="relative">
              <img
                src={product.imageUrl || "/api/placeholder/300/200"}
                alt={product.nameKo}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {product.isFeatured && (
                  <Badge variant="destructive" className="text-xs">
                    추천
                  </Badge>
                )}
                {!product.isActive && (
                  <Badge variant="secondary" className="text-xs">
                    비활성
                  </Badge>
                )}
              </div>
            </div>

            <CardContent className="p-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{product.nameKo}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {product.descriptionKo}
                </p>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-lg">
                        ₩{(product.price || 0).toLocaleString()}
                      </span>
                      {(product.originalPrice || 0) > (product.price || 0) && (
                        <span className="text-sm text-gray-500 line-through">
                          ₩{(product.originalPrice || 0).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      재고: {product.stockQuantity || 0}개
                    </div>
                  </div>
                </div>

                {product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {product.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {product.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{product.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open(`/product/${product.id}`, "_blank")
                  }
                >
                  <Eye className="h-4 w-4 mr-1" />
                  미리보기
                </Button>

                <div className="flex space-x-2">
                  <Dialog
                    open={editingProduct?.id === product.id}
                    onOpenChange={(open) => {
                      if (!open) setEditingProduct(null);
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingProduct(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>상품 수정</DialogTitle>
                      </DialogHeader>
                      <ProductForm
                        product={editingProduct}
                        onSubmit={(data) =>
                          updateProductMutation.mutate({
                            ...data,
                            id: product.id,
                          })
                        }
                        isLoading={updateProductMutation.isPending}
                      />
                    </DialogContent>
                  </Dialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>상품 삭제</AlertDialogTitle>
                        <AlertDialogDescription>
                          "{product.nameKo}" 상품을 삭제하시겠습니까? 이 작업은
                          되돌릴 수 없습니다.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            deleteProductMutation.mutate(product.id)
                          }
                          className="bg-red-600 hover:bg-red-700"
                        >
                          삭제
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">검색 조건에 맞는 상품이 없습니다.</p>
        </div>
      )}
    </div>
  );
};
