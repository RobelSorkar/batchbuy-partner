import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DropshipProduct {
  id: string;
  name: string;
  category: string;
  image: string;
  retailPrice: number;
  dropshipPrice: number;
  sellerProfit: number;
  stock: number;
  description: string;
  rating: number;
  totalSold: number;
  batchId: string;
  status: string;
}

export function useDropshipProducts() {
  return useQuery({
    queryKey: ["dropship-products"],
    queryFn: async () => {
      // Products available for dropshipping come from batches that are in production or completed
      // combined with inventory data
      const { data: batches, error } = await supabase
        .from("batches")
        .select("*");
      if (error) throw error;

      // Also get inventory for stock info
      const { data: inventory } = await supabase
        .from("inventory")
        .select("*");

      return (batches || []).map((batch) => {
        const inv = (inventory || []).find((i) => i.batch_id === batch.id);
        const wholesalePrice = Number(batch.wholesale_price);
        const retailPrice = Number(batch.retail_price);
        const dropshipPrice = wholesalePrice; // dropshippers pay wholesale
        const sellerProfit = retailPrice - dropshipPrice;
        const stock = inv ? inv.total_stock - inv.sold_units : batch.remaining_units;

        return {
          id: batch.id,
          name: batch.product_name,
          category: batch.category || "General",
          image: batch.image || "📦",
          retailPrice,
          dropshipPrice,
          sellerProfit,
          stock: Math.max(0, stock),
          description: batch.description || "",
          rating: 0,
          totalSold: inv?.sold_units || batch.funded_units - batch.remaining_units,
          batchId: batch.id,
          status: batch.status,
        } as DropshipProduct;
      });
    },
  });
}
