import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";

interface AddArgs {
  productId: string;
  quantity?: number;
  options?: any;
}

export const useCart = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch cart items using API
  const { data: cartItems = [], isLoading: isLoadingCart } = useQuery({
    queryKey: ["/api/cart", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/cart/${user?.id}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error(`${response.status}: ${await response.text()}`);
      }
      
      return response.json();
    },
  });

  // Add item to cart
  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity = 1, options }: AddArgs) => {
      if (!user) throw new Error("로그인이 필요합니다");

      const response = await apiRequest(`/api/cart`, {
        method: "POST",
        body: JSON.stringify({
          user_id: user.id,
          product_id: productId,
          quantity,
          options,
        }),
      });

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart", user?.id] });
    },
  });

  // Update quantity of an item
  const updateQuantityMutation = useMutation({
    mutationFn: async ({
      cartItemId,
      quantity,
    }: {
      cartItemId: string;
      quantity: number;
    }) => {
      if (!user) throw new Error("로그인이 필요합니다");

      const response = await apiRequest(`/api/cart/${user.id}/items/${cartItemId}`, {
        method: "PATCH",
        body: JSON.stringify({ quantity }),
      });

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart", user?.id] });
    },
  });

  // Remove item from cart
  const removeFromCartMutation = useMutation({
    mutationFn: async (cartItemId: string) => {
      if (!user) throw new Error("로그인이 필요합니다");

      const response = await apiRequest(`/api/cart/${user.id}/${cartItemId}`, {
        method: "DELETE",
      });

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart", user?.id] });
    },
  });

  // Clear cart
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("로그인이 필요합니다");

      const response = await apiRequest(`/api/cart/${user.id}/clear`, {
        method: "DELETE",
      });

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart", user?.id] });
    },
  });

  // Calculate totals
  const cartTotal = cartItems.reduce((sum: number, item: any) => {
    const price = parseFloat(item.products?.base_price || 0);
    return sum + price * item.quantity;
  }, 0);

  const itemCount = cartItems.reduce(
    (sum: number, item: any) => sum + item.quantity,
    0,
  );

  return {
    cartItems,
    cartTotal,
    itemCount,
    isLoadingCart,

    addToCart: addToCartMutation.mutate,
    removeFromCart: removeFromCartMutation.mutate,
    updateQuantity: updateQuantityMutation.mutate,
    clearCart: clearCartMutation.mutate,

    isAddingToCart: addToCartMutation.isPending,
    isRemovingFromCart: removeFromCartMutation.isPending,
    isUpdatingQuantity: updateQuantityMutation.isPending,
    isClearingCart: clearCartMutation.isPending,
  };
};