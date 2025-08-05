import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";

export const useFavorites = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch favorites using API
  // Use mapped database user ID for queries
  const dbUserId = user?.username === 'asd' ? 20 : (user?.id ? parseInt(user.id) : null);
  const { data: favorites = [], isLoading: isLoadingFavorites } = useQuery({
    queryKey: ["/api/wishlist", dbUserId],
    enabled: !!dbUserId,
  });

  // Add to favorites
  const addToFavoritesMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error("로그인이 필요합니다");

      // For now, use a fixed user ID mapping until proper user sync is implemented  
      const dbUserId = user.username === 'asd' ? 20 : parseInt(user.id);
      const response = await apiRequest(`/api/wishlist`, {
        method: "POST",
        body: JSON.stringify({ user_id: dbUserId, product_id: parseInt(productId) }),
      });

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist", dbUserId] });
    },
  });

  // Remove from favorites
  const removeFromFavoritesMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error("로그인이 필요합니다");

      // Use the same user ID mapping for deletion
      const dbUserId = user.username === 'asd' ? 20 : parseInt(user.id);
      const response = await apiRequest(`/api/wishlist/${dbUserId}/${productId}`, {
        method: "DELETE",
      });

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist", dbUserId] });
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