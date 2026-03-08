import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useOrders(role?: string, channel?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["orders", role, channel, user?.id],
    queryFn: async () => {
      if (!user) return [];
      let query = supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false });
      
      // Filter by channel if provided (e.g., for distributor orders)
      if (channel) {
        query = query.eq("channel", channel);
      }
      
      // Sellers only see their own; admins/warehouse see all (RLS handles this)
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useCreateOrder() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (order: {
      customerName: string;
      customerPhone: string;
      customerAddress: string;
      channel: string;
      totalAmount: number;
      commission: number;
      batchId?: string;
      items: { productName: string; quantity: number; unitPrice: number; totalPrice: number }[];
    }) => {
      if (!user) throw new Error("Not authenticated");

      // Use atomic RPC with stock validation
      const { data, error } = await supabase.rpc("create_order_with_stock_check", {
        p_customer_name: order.customerName,
        p_customer_phone: order.customerPhone,
        p_customer_address: order.customerAddress,
        p_channel: order.channel,
        p_total_amount: order.totalAmount,
        p_commission: order.commission,
        p_batch_id: order.batchId || null,
        p_items: JSON.stringify(order.items),
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["dropship-products"] });
      queryClient.invalidateQueries({ queryKey: ["distributor-products"] });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
