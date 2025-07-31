import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useSupabaseAuth } from "@/components/SupabaseProvider";

interface AddArgs {
  productId: string;
  quantity?: number;
  options?: any;
}

export const useCart = () => {
  const { user } = useSupabaseAuth();
  const queryClient = useQueryClient();

  // Fetch cart items for the logged in user
  const fetchCartItems = async () => {
    if (!user) return [];
    const { data, error } = await supabase
      .from("cart_items")
      .select(
        `*, products(id, name, name_ko, base_price, image_url, is_available)`,
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  };

  const { data: cartItems = [], isLoading: isLoadingCart } = useQuery({
    queryKey: ["cart", user?.id],
    queryFn: fetchCartItems,
    enabled: !!user?.id && isSupabaseConfigured,
  });

  // Upsert item (increase quantity if exists)
  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity = 1, options }: AddArgs) => {
      if (!user) throw new Error("로그인이 필요합니다");

      const { data: existing, error: fetchError } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") throw fetchError;

      if (existing) {
        const { error } = await supabase
          .from("cart_items")
          .update({
            quantity: existing.quantity + quantity,
            options,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("cart_items").insert({
          user_id: user.id,
          product_id: productId,
          quantity,
          customization_options: options,
        });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", user?.id] });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error("로그인이 필요합니다");
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);

      if (error) throw error;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", user?.id] });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({
      cartItemId,
      quantity,
    }: {
      cartItemId: string;
      quantity: number;
    }) => {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity, updated_at: new Date().toISOString() })
        .eq("id", cartItemId);

      // Remove from cart mutation
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", user?.id] });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("로그인이 필요합니다");
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", user?.id] });
    },
  });
  // Calculate totals
  const cartTotal = cartItems.reduce((sum: number, item: any) => {
    const price = item.products?.base_price || 0;
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
