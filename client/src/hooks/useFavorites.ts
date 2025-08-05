import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";

export const useFavorites = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch favorites using API
  const { data: favorites = [], isLoading: isLoadingFavorites } = useQuery({
    queryKey: ["/api/wishlist", user?.id],
    enabled: !!user?.id,
  });

  // Add to favorites
  const addToFavoritesMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error("로그인이 필요합니다");

      const response = await apiRequest(`/api/wishlist/${user.id}`, {
        method: "POST",
        body: JSON.stringify({ productId }),
      });

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist", user?.id] });
    },
  });

  // Remove from favorites
  const removeFromFavoritesMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error("로그인이 필요합니다");

      const response = await apiRequest(`/api/wishlist/${user.id}/items/${productId}`, {
        method: "DELETE",
      });

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist", user?.id] });
    },
  });

  // Check if product is in favorites
  const isFavorite = (productId: string) => {
    return favorites.some((fav: any) => fav.product_id === productId);
  };

  return {
    favorites,
    isLoadingFavorites,
    addToFavorites: addToFavoritesMutation.mutate,
    removeFromFavorites: removeFromFavoritesMutation.mutate,
    isFavorite,
    isAddingToFavorites: addToFavoritesMutation.isPending,
    isRemovingFromFavorites: removeFromFavoritesMutation.isPending,
  };
};