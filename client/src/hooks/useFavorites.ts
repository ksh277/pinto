import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface WishlistItem {
  id: number;
  user_id: string;
  product_id: string;
  created_at: string;
  products?: {
    id: string;
    name: string;
    nameKo: string;
    image_url: string;
    base_price: number;
  };
}

export const useFavorites = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading } = useQuery<WishlistItem[]>({
    queryKey: ["wishlist", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await apiRequest(`/api/wishlist/${user.id}`);
      return response.json();
    },
    enabled: !!user?.id && isAuthenticated,
  });

  const toggleWishlistMutation = useMutation({
    mutationFn: async ({ productId }: { productId: string }) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const isFavorited = favorites?.some((fav) => fav.product_id === productId);
      
      if (isFavorited) {
        await apiRequest(`/api/wishlist/${user.id}/${productId}`, {
          method: "DELETE",
        });
        return false;
      } else {
        await apiRequest(`/api/wishlist/${user.id}`, {
          method: "POST",
          body: JSON.stringify({ product_id: productId }),
          headers: {
            "Content-Type": "application/json",
          },
        });
        return true;
      }
    },
    onSuccess: (isFavorited, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ["wishlist", user?.id] });

      toast({
        title: isFavorited ? "찜 추가 완료" : "찜 제거 완료",
        description: isFavorited
          ? "관심 상품에 추가되었습니다."
          : "관심 상품에서 제거되었습니다.",
      });
    },
    onError: (error) => {
      toast({
        title: "오류 발생",
        description: "찜 상태를 변경할 수 없습니다.",
        variant: "destructive",
      });
    },
  });

  const isFavorited = (productId: string) => {
    return favorites?.some((fav) => fav.product_id === productId) || false;
  };

  return {
    favorites,
    isLoading,
    isFavorited,
    toggleFavorite: toggleWishlistMutation.mutate,
    isToggling: toggleWishlistMutation.isPending,
    isError: toggleWishlistMutation.isError,
  };
};

export const useIsFavorite = (productId: string) => {
  const { user, isAuthenticated } = useAuth();
  const [favoriteState, setFavoriteState] = useState(false);

  const { data: isFavorited, isLoading } = useQuery({
    queryKey: ["isFavorite", user?.id, productId],
    queryFn: async () => {
      if (!user?.id || !productId) return false;
      const response = await apiRequest(`/api/wishlist/${user.id}/check/${productId}`);
      const data = await response.json();
      return data.isFavorited;
    },
    enabled: !!user?.id && !!productId && isAuthenticated,
  });

  useEffect(() => {
    if (isFavorited !== undefined) {
      setFavoriteState(isFavorited);
    }
  }, [isFavorited]);

  return {
    isFavorited: favoriteState,
    isLoading,
  };
};
