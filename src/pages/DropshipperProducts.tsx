import { useState } from "react";
import { z } from "zod";
import DashboardLayout from "@/components/DashboardLayout";
import { Search, Star, TrendingUp, ShoppingCart, Share2, Copy, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useDropshipProducts, DropshipProduct } from "@/hooks/useDropshipProducts";
import { useCreateOrder } from "@/hooks/useOrders";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const orderFormSchema = z.object({
  customerName: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  customerPhone: z.string().trim().regex(/^01[3-9]\d{8}$/, "Enter a valid Bangladeshi phone number (e.g. 01XXXXXXXXX)"),
  customerAddress: z.string().trim().min(5, "Address must be at least 5 characters").max(300, "Address is too long"),
});

const categories = ["All", "Apparel", "Beauty", "Home & Kitchen", "Accessories", "Food & Beverage", "Electronics", "General"];

const DropshipperProducts = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState<DropshipProduct | null>(null);
  const [orderOpen, setOrderOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [orderQty, setOrderQty] = useState(1);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { data: products, isLoading } = useDropshipProducts();
  const createOrder = useCreateOrder();

  const filtered = (products || []).filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || p.category === category;
    return matchSearch && matchCat;
  });

  const { user } = useAuth();

  const handleCopyLink = (product: DropshipProduct) => {
    const refId = user?.id || "dropshipper";
    navigator.clipboard.writeText(`${window.location.origin}/batch/${product.id}?ref=${refId}`);
    setLinkCopied(product.id);
    toast({ title: "Link Copied!", description: "Share this link to earn commission on every sale." });
    setTimeout(() => setLinkCopied(null), 2000);
  };

  const handleCreateOrder = async () => {
    if (!selectedProduct) return;

    const result = orderFormSchema.safeParse({ customerName, customerPhone, customerAddress });
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((e) => { errors[e.path[0] as string] = e.message; });
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    const commission = selectedProduct.sellerProfit * orderQty;
    const totalAmount = selectedProduct.retailPrice * orderQty;

    try {
      await createOrder.mutateAsync({
        customerName: result.data.customerName,
        customerPhone: result.data.customerPhone,
        customerAddress: result.data.customerAddress,
        channel: "dropshipper",
        totalAmount,
        commission,
        batchId: selectedProduct.batchId,
        items: [{
          productName: selectedProduct.name,
          quantity: orderQty,
          unitPrice: selectedProduct.retailPrice,
          totalPrice: totalAmount,
        }],
      });
      toast({ title: "Order Created!", description: `You'll earn ৳${commission.toLocaleString()} commission.` });
      setOrderOpen(false);
      setCustomerName("");
      setCustomerPhone("");
      setCustomerAddress("");
      setOrderQty(1);
      setSelectedProduct(null);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout role="dropshipper">
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="dropshipper">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Browse Products</h1>
          <p className="text-muted-foreground text-sm mt-1">Find products to promote and earn commission on every sale</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search products..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((c) => (
              <Button key={c} variant={category === c ? "default" : "outline"} size="sm" onClick={() => setCategory(c)}>{c}</Button>
            ))}
          </div>
        </div>

        <p className="text-sm text-muted-foreground">{filtered.length} products available</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((product) => (
            <div key={product.id} className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden group">
              <div className="h-36 bg-muted/50 flex items-center justify-center overflow-hidden">
                {product.image && product.image.startsWith("http") ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl">{product.image}</span>
                )}
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{product.category}</span>
                  {product.totalSold > 0 && (
                    <span className="text-xs text-muted-foreground">{product.totalSold} sold</span>
                  )}
                </div>
                <h3 className="font-display font-semibold text-sm line-clamp-1">{product.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-muted/50 rounded-lg py-2">
                    <div className="text-[10px] text-muted-foreground">Retail</div>
                    <div className="text-xs font-semibold">৳{product.retailPrice}</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg py-2">
                    <div className="text-[10px] text-muted-foreground">Your Cost</div>
                    <div className="text-xs font-semibold">৳{product.dropshipPrice}</div>
                  </div>
                  <div className="bg-primary/10 rounded-lg py-2">
                    <div className="text-[10px] text-primary">Profit</div>
                    <div className="text-xs font-bold text-primary">৳{product.sellerProfit}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{product.stock} in stock</span>
                  <span className="flex items-center gap-1 text-primary font-medium">
                    <TrendingUp className="w-3 h-3" />
                    {product.dropshipPrice > 0 ? ((product.sellerProfit / product.dropshipPrice) * 100).toFixed(0) : 0}% margin
                  </span>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button size="sm" className="flex-1 gap-1.5" onClick={() => { setSelectedProduct(product); setOrderOpen(true); }}>
                    <ShoppingCart className="w-3.5 h-3.5" /> Create Order
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleCopyLink(product)}>
                    {linkCopied === product.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleCopyLink(product)}><Share2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">No products found.</div>
        )}

        <Dialog open={orderOpen} onOpenChange={setOrderOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Sales Order</DialogTitle>
              <DialogDescription>
                {selectedProduct && `${selectedProduct.name} — ৳${selectedProduct.retailPrice} retail`}
              </DialogDescription>
            </DialogHeader>
            {selectedProduct && (
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Retail Price</span>
                    <span className="font-medium">৳{selectedProduct.retailPrice}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Your Cost</span>
                    <span className="font-medium">৳{selectedProduct.dropshipPrice}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-border pt-2">
                    <span className="text-primary font-medium">Your Profit/Unit</span>
                    <span className="font-bold text-primary">৳{selectedProduct.sellerProfit}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Quantity</label>
                  <Input type="number" min={1} max={selectedProduct.stock} value={orderQty}
                    onChange={(e) => setOrderQty(Math.max(1, parseInt(e.target.value) || 1))} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Customer Name</label>
                  <Input value={customerName} onChange={(e) => { setCustomerName(e.target.value); setFieldErrors((p) => ({ ...p, customerName: "" })); }} placeholder="Full name" className={fieldErrors.customerName ? "border-destructive" : ""} />
                  {fieldErrors.customerName && <p className="text-xs text-destructive mt-1">{fieldErrors.customerName}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Customer Phone</label>
                  <Input value={customerPhone} onChange={(e) => { setCustomerPhone(e.target.value); setFieldErrors((p) => ({ ...p, customerPhone: "" })); }} placeholder="01XXXXXXXXX" className={fieldErrors.customerPhone ? "border-destructive" : ""} />
                  {fieldErrors.customerPhone && <p className="text-xs text-destructive mt-1">{fieldErrors.customerPhone}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Delivery Address</label>
                  <Input value={customerAddress} onChange={(e) => { setCustomerAddress(e.target.value); setFieldErrors((p) => ({ ...p, customerAddress: "" })); }} placeholder="Full address" className={fieldErrors.customerAddress ? "border-destructive" : ""} />
                  {fieldErrors.customerAddress && <p className="text-xs text-destructive mt-1">{fieldErrors.customerAddress}</p>}
                </div>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                  <div className="flex justify-between text-sm">
                    <span>Customer Pays</span>
                    <span className="font-bold">৳{(selectedProduct.retailPrice * orderQty).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span>Platform Charges You</span>
                    <span className="font-medium">৳{(selectedProduct.dropshipPrice * orderQty).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1 pt-2 border-t border-primary/20">
                    <span className="text-primary font-semibold">Your Commission</span>
                    <span className="font-bold text-primary">৳{(selectedProduct.sellerProfit * orderQty).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setOrderOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateOrder} disabled={!customerName || !customerPhone || !customerAddress || createOrder.isPending}>
                {createOrder.isPending ? "Creating..." : "Confirm Order"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default DropshipperProducts;
