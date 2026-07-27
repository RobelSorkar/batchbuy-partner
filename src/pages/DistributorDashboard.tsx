import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import { Package, TrendingUp, ShoppingCart, Wallet, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWallet";
import { useOrders, useCreateOrder } from "@/hooks/useOrders";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/utils";

const DistributorDashboard = () => {
  const { user } = useAuth();
  const { data: wallet } = useWallet();
  const { data: orders = [], isLoading: ordersLoading } = useOrders("distributor", "distributor");
  const createOrder = useCreateOrder();
  const { toast } = useToast();

  const [orderOpen, setOrderOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  // Fetch distributor-tier products from distribution_channels
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["distributor-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("distribution_channels")
        .select("*, inventory(id, product_name, batch_id, total_stock, sold_units, allocated_stock)")
        .eq("channel", "distributor")
        .eq("enabled", true);
      if (error) throw error;
      return (data || []).map((dc: any) => ({
        id: dc.id,
        name: dc.inventory?.product_name || "Unknown",
        batchId: dc.inventory?.batch_id,
        price: Number(dc.price),
        minPrice: Number(dc.min_price),
        stock: Math.max(0, dc.allocated_stock - dc.sold_units),
        allocatedStock: dc.allocated_stock,
        soldUnits: dc.sold_units,
        inventoryId: dc.inventory_id,
      }));
    },
  });

  const isLoading = productsLoading || ordersLoading;

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o: any) => !["delivered", "cancelled"].includes(o.status)).length;

  const stats = [
    { label: "Available Products", value: products.length.toString(), icon: Package },
    { label: "Total Orders", value: totalOrders.toString(), icon: ShoppingCart },
    { label: "Pending Orders", value: pendingOrders.toString(), icon: TrendingUp },
    { label: "Wallet Balance", value: `৳${(wallet?.balance || 0).toLocaleString()}`, icon: Wallet },
  ];

  const openOrderDialog = (product: any) => {
    setSelectedProduct(product);
    setQuantity("");
    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
    setOrderOpen(true);
  };

  const handleCreateOrder = async () => {
    if (!selectedProduct || !user) return;
    const qty = Number(quantity);
    if (qty <= 0 || qty > selectedProduct.stock) {
      toast({ title: "Invalid quantity", variant: "destructive" });
      return;
    }
    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      toast({ title: "Fill all customer fields", variant: "destructive" });
      return;
    }

    const totalAmount = qty * selectedProduct.price;

    try {
      await createOrder.mutateAsync({
        customerName,
        customerPhone,
        customerAddress,
        channel: "distributor",
        totalAmount,
        commission: 0,
        batchId: selectedProduct.batchId || undefined,
        items: [{
          productName: selectedProduct.name,
          quantity: qty,
          unitPrice: selectedProduct.price,
          totalPrice: totalAmount,
        }],
      });
      toast({ title: "Order placed!", description: `${qty} × ${selectedProduct.name}` });
      setOrderOpen(false);
    } catch (err) {
      toast({ title: "Order failed", description: getErrorMessage(err), variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout role="distributor">
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="distributor">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Distributor Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Browse bulk-priced products and place distributor orders</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl p-4 shadow-card border border-border/50">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center mb-2">
                <stat.icon className="w-4 h-4 text-accent-foreground" />
              </div>
              <div className="text-xl font-display font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Product Catalog */}
        <div className="bg-card rounded-xl shadow-card border border-border/50">
          <div className="p-5 border-b border-border/50">
            <h2 className="font-display font-semibold text-lg">Distributor Product Catalog</h2>
            <p className="text-xs text-muted-foreground mt-1">Bulk pricing tier — lowest per-unit cost</p>
          </div>
          {products.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>No distributor-tier products available yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Product</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Unit Price</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Available</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Sold</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product: any) => (
                    <tr key={product.id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-4 text-sm font-medium">{product.name}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-primary">৳{product.price}</td>
                      <td className="px-5 py-4 text-sm">{product.stock} units</td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">{product.soldUnits}</td>
                      <td className="px-5 py-4">
                        <Button size="sm" variant="outline" className="gap-1" onClick={() => openOrderDialog(product)} disabled={product.stock === 0}>
                          <Plus className="w-3.5 h-3.5" /> Order
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-card rounded-xl shadow-card border border-border/50">
          <div className="p-5 border-b border-border/50">
            <h2 className="font-display font-semibold text-lg">Recent Orders</h2>
          </div>
          {orders.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No orders yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Order #</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Customer</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Amount</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Status</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 20).map((order: any) => (
                    <tr key={order.id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-4 text-sm font-medium">{order.order_number}</td>
                      <td className="px-5 py-4 text-sm">{order.customer_name}</td>
                      <td className="px-5 py-4 text-sm font-semibold">৳{Number(order.total_amount).toLocaleString()}</td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-accent text-accent-foreground capitalize">
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order Dialog */}
      <Dialog open={orderOpen} onOpenChange={setOrderOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Place Distributor Order</DialogTitle>
            <DialogDescription>{selectedProduct?.name} — ৳{selectedProduct?.price}/unit</DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4 pt-2">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground">Available Stock</div>
                <div className="text-lg font-display font-bold">{selectedProduct.stock} units</div>
              </div>
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input type="number" min="1" max={selectedProduct.stock} placeholder="e.g. 50" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Business / Customer Name</Label>
                <Input placeholder="e.g. Metro Mart BD" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input placeholder="01XXXXXXXXX" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Delivery Address</Label>
                <Input placeholder="Full address" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} />
              </div>
              {Number(quantity) > 0 && (
                <div className="bg-accent/50 rounded-lg p-3 border border-primary/10 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-display font-bold text-primary">৳{(Number(quantity) * selectedProduct.price).toLocaleString()}</span>
                  </div>
                </div>
              )}
              <Button className="w-full" onClick={handleCreateOrder} disabled={createOrder.isPending}>
                {createOrder.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Confirm Order
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default DistributorDashboard;
