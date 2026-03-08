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

      // Generate sequential order number server-side
      const { data: orderNumber, error: seqError } = await supabase.rpc("generate_order_number", {
        p_channel: order.channel,
      });
      if (seqError) throw seqError;

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          order_number: orderNumber,
          customer_name: order.customerName,
          customer_phone: order.customerPhone,
          customer_address: order.customerAddress,
          channel: order.channel,
          total_amount: order.totalAmount,
          commission: order.commission,
          seller_id: user.id,
          batch_id: order.batchId || null,
        })
        .select()
        .single();
      if (orderError) throw orderError;

      // Insert order items
      const itemsToInsert = order.items.map((item) => ({
        order_id: orderData.id,
        product_name: item.productName,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.totalPrice,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(itemsToInsert);
      if (itemsError) throw itemsError;

      return orderData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
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
