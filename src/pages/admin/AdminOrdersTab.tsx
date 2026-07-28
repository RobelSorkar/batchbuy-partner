import { useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Search, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useOrders } from "@/hooks/useOrders";
import { orderStatusColors } from "./adminStyles";

type Order = NonNullable<ReturnType<typeof useOrders>["data"]>[number];

interface AdminOrdersTabProps {
  orders: Order[];
}

const channelLabels: Record<string, string> = {
  dropshipper: "Sales Partner", dropship: "Sales Partner", platform: "Platform", retail: "Retail", distributor: "Distributor",
};

const nextStatusMap: Record<string, string> = {
  pending: "confirmed",
  confirmed: "processing",
  processing: "packed",
  packed: "shipped",
  shipped: "out_for_delivery",
  out_for_delivery: "delivered",
};

const AdminOrdersTab = ({ orders }: AdminOrdersTabProps) => {
  const [orderSearch, setOrderSearch] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const filteredOrders = orders.filter((o) =>
    orderSearch === "" || o.order_number?.toLowerCase().includes(orderSearch.toLowerCase()) || o.customer_name?.toLowerCase().includes(orderSearch.toLowerCase())
  );

  const advanceOrder = async (orderId: string, orderNumber: string, nextStatus: string) => {
    try {
      await supabase.from("orders").update({ status: nextStatus }).eq("id", orderId);
      toast({ title: `Order ${orderNumber} → ${nextStatus}` });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    } catch (e) {
      toast({ title: "Error", description: getErrorMessage(e), variant: "destructive" });
    }
  };

  const cancelOrder = async (orderId: string, orderNumber: string) => {
    try {
      await supabase.from("orders").update({ status: "cancelled" }).eq("id", orderId);
      toast({ title: `Order ${orderNumber} cancelled`, variant: "destructive" });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    } catch (e) {
      toast({ title: "Error", description: getErrorMessage(e), variant: "destructive" });
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-card border border-border/50">
      <div className="flex items-center justify-between p-5 border-b border-border/50">
        <h2 className="font-display font-semibold text-lg">Recent Orders</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input placeholder="Search orders..." className="pl-8 h-8 text-xs w-48" value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} />
          </div>
          <Link to="/admin/orders"><Button size="sm">Full Management →</Button></Link>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              {["Order #", "Customer", "Items", "Amount", "Channel", "Status", "Date", "Actions"].map((h) => (
                <th key={h} className="text-left text-xs font-medium text-muted-foreground px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredOrders.slice(0, 10).map((o) => {
              const canAdvance = !["delivered", "cancelled"].includes(o.status);
              const nextStatus = nextStatusMap[o.status];
              return (
                <tr key={o.id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-4 text-sm font-mono font-medium">{o.order_number}</td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{o.customer_name}</td>
                  <td className="px-5 py-4 text-xs text-muted-foreground">{(o.order_items || []).map((i) => i.product_name).join(", ") || "—"}</td>
                  <td className="px-5 py-4 text-sm font-semibold">৳{Number(o.total_amount).toLocaleString()}</td>
                  <td className="px-5 py-4"><span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground capitalize">{channelLabels[o.channel] || o.channel}</span></td>
                  <td className="px-5 py-4"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${orderStatusColors[o.status] || ""}`}>{o.status}</span></td>
                  <td className="px-5 py-4 text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-1">
                      {canAdvance && nextStatus && (
                        <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={() => advanceOrder(o.id, o.order_number, nextStatus)}>
                          {nextStatus === "confirmed" ? "Approve" : nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
                        </Button>
                      )}
                      {canAdvance && o.status !== "cancelled" && (
                        <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2 text-destructive" onClick={() => cancelOrder(o.id, o.order_number)}>
                          <XCircle className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {filteredOrders.length === 0 && <div className="p-8 text-center text-muted-foreground">No orders found.</div>}
    </div>
  );
};

export default AdminOrdersTab;
