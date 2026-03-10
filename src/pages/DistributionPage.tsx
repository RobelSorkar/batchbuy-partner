import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Search, AlertTriangle, CheckCircle, ShieldAlert, Eye, Settings2,
  TrendingUp, Package, ArrowUpRight, ArrowDownRight, Info, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import {
  DistributionChannel, CHANNEL_CONFIG, PRICING_RULES,
} from "@/data/distribution";
import { useToast } from "@/hooks/use-toast";

type ChannelRow = {
  id: string;
  inventory_id: string;
  channel: string;
  enabled: boolean;
  price: number;
  min_price: number;
  max_price: number;
  allocated_stock: number;
  sold_units: number;
};

type InventoryWithChannels = {
  id: string;
  product_name: string;
  batch_id: string | null;
  total_stock: number;
  sold_units: number;
  status: string;
  batch: { production_cost_per_unit: number; retail_price: number } | null;
  distribution_channels: ChannelRow[];
};

interface ProductDistribution {
  productId: string;
  productName: string;
  productionCost: number;
  retailPrice: number;
  totalStock: number;
  channels: {
    id: string;
    channel: DistributionChannel;
    enabled: boolean;
    price: number;
    minPrice: number;
    maxPrice: number;
    allocatedStock: number;
    soldUnits: number;
  }[];
}

const channelOrder: DistributionChannel[] = ["platform", "retail", "dropshipper", "distributor"];

const DistributionPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductDistribution | null>(null);
  const [editPrices, setEditPrices] = useState<Record<DistributionChannel, string>>({
    platform: "", retail: "", dropshipper: "", distributor: "",
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["distribution-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory")
        .select("*, distribution_channels(*)")
        .order("product_name");
      if (error) throw error;

      // Also fetch batch info for production cost
      const batchIds = [...new Set((data || []).map((i: any) => i.batch_id).filter(Boolean))];
      let batchMap: Record<string, any> = {};
      if (batchIds.length > 0) {
        const { data: batches } = await supabase
          .from("batches")
          .select("id, production_cost_per_unit, retail_price")
          .in("id", batchIds);
        batchMap = (batches || []).reduce((acc: any, b: any) => { acc[b.id] = b; return acc; }, {});
      }

      return (data || []).map((inv: any): ProductDistribution => {
        const batch = inv.batch_id ? batchMap[inv.batch_id] : null;
        const prodCost = batch?.production_cost_per_unit || 0;
        const retailPrice = batch?.retail_price || 0;

        const channels = channelOrder.map((ch) => {
          const dc = (inv.distribution_channels || []).find((d: any) => d.channel === ch);
          return {
            id: dc?.id || "",
            channel: ch,
            enabled: dc?.enabled ?? false,
            price: dc?.price || 0,
            minPrice: dc?.min_price || Math.round(prodCost * 1.2),
            maxPrice: dc?.max_price || retailPrice,
            allocatedStock: dc?.allocated_stock || 0,
            soldUnits: dc?.sold_units || 0,
          };
        });

        return {
          productId: inv.id,
          productName: inv.product_name,
          productionCost: prodCost,
          retailPrice,
          totalStock: inv.total_stock,
          channels,
        };
      });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ channelId, enabled }: { channelId: string; enabled: boolean }) => {
      const { error } = await supabase
        .from("distribution_channels")
        .update({ enabled })
        .eq("id", channelId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["distribution-products"] });
      toast({ title: "Channel Updated" });
    },
  });

  const updatePricesMutation = useMutation({
    mutationFn: async ({ channels }: { channels: { id: string; price: number }[] }) => {
      for (const ch of channels) {
        const { error } = await supabase
          .from("distribution_channels")
          .update({ price: ch.price })
          .eq("id", ch.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["distribution-products"] });
      toast({ title: "Prices Updated" });
      setSelectedProduct(null);
    },
  });

  const filtered = products.filter((p) =>
    p.productName.toLowerCase().includes(search.toLowerCase())
  );

  // Aggregate stats
  const totalChannelSales = channelOrder.map((ch) => ({
    channel: ch,
    ...CHANNEL_CONFIG[ch],
    totalSold: products.reduce((s, p) => s + (p.channels.find((c) => c.channel === ch)?.soldUnits || 0), 0),
    totalStock: products.reduce((s, p) => s + (p.channels.find((c) => c.channel === ch)?.allocatedStock || 0), 0),
    revenue: products.reduce((s, p) => {
      const c = p.channels.find((c) => c.channel === ch);
      return s + (c ? c.soldUnits * c.price : 0);
    }, 0),
  }));

  // Price conflict detection
  const detectConflicts = (product: ProductDistribution) => {
    const conflicts: string[] = [];
    const ch = product.channels;
    const platform = ch.find((c) => c.channel === "platform");
    const retail = ch.find((c) => c.channel === "retail");
    const dropship = ch.find((c) => c.channel === "dropshipper");
    const distributor = ch.find((c) => c.channel === "distributor");

    if (platform && retail && retail.enabled && retail.price > platform.price)
      conflicts.push("Retail price exceeds platform price");
    if (retail && dropship && dropship.enabled && dropship.price > retail.price)
      conflicts.push("Sales Partner price exceeds retail price");
    if (dropship && distributor && distributor.enabled && distributor.price > dropship.price)
      conflicts.push("Distributor price exceeds Sales Partner price");

    ch.forEach((c) => {
      if (c.enabled && c.price < c.minPrice)
        conflicts.push(`${CHANNEL_CONFIG[c.channel].label} below MAP (৳${c.minPrice})`);
    });

    const minMarginPrice = product.productionCost * 1.2;
    ch.forEach((c) => {
      if (c.enabled && c.price < minMarginPrice)
        conflicts.push(`${CHANNEL_CONFIG[c.channel].label} below minimum margin (৳${Math.round(minMarginPrice)})`);
    });

    ch.forEach((c) => {
      if (c.enabled && product.totalStock > 0 && (c.allocatedStock / product.totalStock) > 0.6)
        conflicts.push(`${CHANNEL_CONFIG[c.channel].label} exceeds 60% stock allocation`);
    });

    return conflicts;
  };

  const allConflicts = products.flatMap((p) => detectConflicts(p).map((c) => ({ product: p.productName, conflict: c })));

  const toggleChannel = (product: ProductDistribution, channel: DistributionChannel) => {
    const ch = product.channels.find((c) => c.channel === channel);
    if (!ch || !ch.id) return;
    toggleMutation.mutate({ channelId: ch.id, enabled: !ch.enabled });
  };

  const openEdit = (product: ProductDistribution) => {
    setSelectedProduct(product);
    const prices: Record<DistributionChannel, string> = { platform: "", retail: "", dropshipper: "", distributor: "" };
    product.channels.forEach((c) => { prices[c.channel] = c.price.toString(); });
    setEditPrices(prices);
  };

  const savePrices = () => {
    if (!selectedProduct) return;
    const p = Number(editPrices.platform);
    const r = Number(editPrices.retail);
    const d = Number(editPrices.dropshipper);
    const dist = Number(editPrices.distributor);

    if (r > p || d > r || dist > d) {
      toast({ title: "Price Hierarchy Violation", description: "Platform ≥ Retail ≥ Dropship > Distributor", variant: "destructive" });
      return;
    }

    const minMargin = selectedProduct.productionCost * 1.2;
    if ([p, r, d, dist].some((v) => v > 0 && v < minMargin)) {
      toast({ title: "Margin Too Low", description: `All prices must be ≥ ৳${Math.round(minMargin)} (20% above cost)`, variant: "destructive" });
      return;
    }

    const channels = channelOrder.map((ch) => ({
      id: selectedProduct.channels.find((c) => c.channel === ch)!.id,
      price: Number(editPrices[ch]),
    })).filter((c) => c.id);

    updatePricesMutation.mutate({ channels });
  };

  if (isLoading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Multi-Channel Distribution</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage pricing, channels, and stock allocation across all sales channels</p>
        </div>

        {/* Channel Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {totalChannelSales.map((ch) => (
            <div key={ch.channel} className="bg-card rounded-xl p-5 shadow-card border border-border/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xl">{ch.icon}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${ch.color}`}>{ch.label}</span>
              </div>
              <div className="text-xl font-display font-bold">৳{ch.revenue.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground mt-1">{ch.totalSold} sold · {ch.totalStock} allocated</div>
            </div>
          ))}
        </div>

        {/* Conflict Alert */}
        {allConflicts.length > 0 && (
          <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="w-5 h-5 text-destructive" />
              <h3 className="font-display font-semibold text-sm text-destructive">{allConflicts.length} Pricing Conflict{allConflicts.length > 1 ? "s" : ""} Detected</h3>
            </div>
            <div className="space-y-1">
              {allConflicts.slice(0, 5).map((c, i) => (
                <div key={i} className="text-xs flex items-center gap-2">
                  <AlertTriangle className="w-3 h-3 text-destructive flex-shrink-0" />
                  <span className="font-medium">{c.product}:</span>
                  <span className="text-muted-foreground">{c.conflict}</span>
                </div>
              ))}
              {allConflicts.length > 5 && <div className="text-xs text-muted-foreground">+{allConflicts.length - 5} more...</div>}
            </div>
          </div>
        )}

        {products.length === 0 && (
          <div className="bg-card rounded-xl shadow-card border border-border/50 p-12 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-display font-semibold text-lg">No Products in Distribution</h2>
            <p className="text-muted-foreground text-sm mt-1">Distribution channels are auto-created when batches complete and inventory is added.</p>
          </div>
        )}

        {products.length > 0 && (
          <Tabs defaultValue="products" className="space-y-4">
            <TabsList>
              <TabsTrigger value="products">Product Channels</TabsTrigger>
              <TabsTrigger value="pricing-rules">Pricing Rules</TabsTrigger>
              <TabsTrigger value="channel-overview">Channel Overview</TabsTrigger>
            </TabsList>

            {/* ═══ PRODUCT CHANNELS ═══ */}
            <TabsContent value="products">
              <div className="space-y-4">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search products..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>

                {filtered.map((product) => {
                  const conflicts = detectConflicts(product);
                  return (
                    <div key={product.productId} className={`bg-card rounded-xl shadow-card border ${conflicts.length > 0 ? "border-destructive/30" : "border-border/50"}`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-border/50 gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-muted/50 flex items-center justify-center">
                            <Package className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="font-display font-semibold">{product.productName}</div>
                            <div className="text-xs text-muted-foreground">
                              Production: ৳{product.productionCost} · Total Stock: {product.totalStock} units
                              {conflicts.length > 0 && (
                                <span className="ml-2 text-destructive font-medium">⚠ {conflicts.length} conflict{conflicts.length > 1 ? "s" : ""}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => openEdit(product)}>
                          <Settings2 className="w-3.5 h-3.5" /> Edit Pricing
                        </Button>
                      </div>

                      {/* Channel Grid */}
                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border/30">
                        {channelOrder.map((ch) => {
                          const channel = product.channels.find((c) => c.channel === ch);
                          if (!channel) return null;
                          const cfg = CHANNEL_CONFIG[ch];
                          const margin = channel.price - product.productionCost;
                          const marginPct = product.productionCost > 0 ? ((margin / product.productionCost) * 100).toFixed(0) : "0";
                          const isBelow = channel.price < channel.minPrice;

                          return (
                            <div key={ch} className={`p-4 ${!channel.enabled ? "opacity-50" : ""}`}>
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{cfg.icon}</span>
                                  <span className="text-xs font-medium">{cfg.label}</span>
                                </div>
                                <Switch
                                  checked={channel.enabled}
                                  onCheckedChange={() => toggleChannel(product, ch)}
                                  disabled={!channel.id}
                                />
                              </div>

                              <div className={`text-xl font-display font-bold ${isBelow ? "text-destructive" : ""}`}>
                                ৳{channel.price}
                              </div>

                              <div className="mt-2 space-y-1 text-xs">
                                <div className="flex justify-between text-muted-foreground">
                                  <span>Margin</span>
                                  <span className={`font-medium ${Number(marginPct) < 20 ? "text-destructive" : "text-primary"}`}>
                                    ৳{margin} ({marginPct}%)
                                  </span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                  <span>MAP Floor</span>
                                  <span>৳{channel.minPrice}</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                  <span>Allocated</span>
                                  <span>{channel.allocatedStock} units</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                  <span>Sold</span>
                                  <span className="text-primary font-medium">{channel.soldUnits}</span>
                                </div>
                              </div>

                              <div className="mt-2">
                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${channel.soldUnits > 0 ? "bg-primary" : "bg-muted-foreground/30"}`}
                                    style={{ width: `${channel.allocatedStock > 0 ? (channel.soldUnits / channel.allocatedStock) * 100 : 0}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Price hierarchy visual */}
                      <div className="px-5 py-3 border-t border-border/30 bg-muted/20">
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span className="font-medium">Price Flow:</span>
                          {product.channels
                            .filter((c) => c.enabled)
                            .sort((a, b) => b.price - a.price)
                            .map((c, i, arr) => (
                              <span key={c.channel} className="flex items-center gap-1">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${CHANNEL_CONFIG[c.channel].color}`}>
                                  {CHANNEL_CONFIG[c.channel].label.split(" ")[0]} ৳{c.price}
                                </span>
                                {i < arr.length - 1 && <span className="text-muted-foreground">→</span>}
                              </span>
                            ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            {/* ═══ PRICING RULES ═══ */}
            <TabsContent value="pricing-rules">
              <div className="space-y-4">
                <div className="bg-card rounded-xl shadow-card border border-border/50 p-5">
                  <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-primary" /> Platform Pricing Rules
                  </h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    These rules prevent price conflicts and protect margins across all distribution channels.
                  </p>

                  <div className="space-y-4">
                    {PRICING_RULES.map((rule) => (
                      <div key={rule.id} className={`rounded-lg border p-4 ${rule.severity === "critical" ? "border-destructive/30 bg-destructive/5" : "border-border/50 bg-muted/20"}`}>
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {rule.severity === "critical" ? (
                              <AlertTriangle className="w-4 h-4 text-destructive" />
                            ) : (
                              <Info className="w-4 h-4 text-accent-foreground" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold">{rule.name}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase ${rule.severity === "critical" ? "bg-destructive/10 text-destructive" : "bg-accent text-accent-foreground"}`}>
                                {rule.severity}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{rule.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ═══ CHANNEL OVERVIEW ═══ */}
            <TabsContent value="channel-overview">
              <div className="space-y-6">
                {channelOrder.map((ch) => {
                  const cfg = CHANNEL_CONFIG[ch];
                  const channelProducts = products.filter((p) => p.channels.some((c) => c.channel === ch && c.enabled));
                  const totalRevenue = channelProducts.reduce((s, p) => {
                    const c = p.channels.find((c) => c.channel === ch);
                    return s + (c ? c.soldUnits * c.price : 0);
                  }, 0);
                  const totalSold = channelProducts.reduce((s, p) => s + (p.channels.find((c) => c.channel === ch)?.soldUnits || 0), 0);
                  const totalAllocated = channelProducts.reduce((s, p) => s + (p.channels.find((c) => c.channel === ch)?.allocatedStock || 0), 0);

                  return (
                    <div key={ch} className="bg-card rounded-xl shadow-card border border-border/50">
                      <div className="flex items-center justify-between p-5 border-b border-border/50">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{cfg.icon}</span>
                          <div>
                            <h2 className="font-display font-semibold text-lg">{cfg.label}</h2>
                            <p className="text-xs text-muted-foreground">{cfg.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-display font-bold text-primary">৳{totalRevenue.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">{totalSold} sold / {totalAllocated} allocated</div>
                        </div>
                      </div>
                      <div className="divide-y divide-border/30">
                        {channelProducts.map((p) => {
                          const c = p.channels.find((c) => c.channel === ch)!;
                          const margin = c.price - p.productionCost;
                          return (
                            <div key={p.productId} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                              <div className="flex items-center gap-3">
                                <Package className="w-5 h-5 text-muted-foreground" />
                                <div>
                                  <div className="text-sm font-medium">{p.productName}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {c.soldUnits}/{c.allocatedStock} sold · ৳{margin} margin/unit
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-bold">৳{c.price}</div>
                                <div className="text-xs text-primary font-medium">৳{(c.soldUnits * c.price).toLocaleString()} rev</div>
                              </div>
                            </div>
                          );
                        })}
                        {channelProducts.length === 0 && (
                          <div className="p-4 text-center text-sm text-muted-foreground">No products in this channel</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Edit Pricing Dialog */}
        <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
          <DialogContent className="max-w-md">
            {selectedProduct && (
              <>
                <DialogHeader>
                  <DialogTitle>Edit Channel Pricing</DialogTitle>
                  <DialogDescription>
                    {selectedProduct.productName} — Production Cost: ৳{selectedProduct.productionCost}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="bg-muted/30 rounded-lg p-3 text-xs text-muted-foreground flex items-center gap-2">
                    <Info className="w-4 h-4 flex-shrink-0" />
                    <span>Prices must follow: Platform ≥ Retail ≥ Dropship &gt; Distributor ≥ MAP (৳{Math.round(selectedProduct.productionCost * 1.2)})</span>
                  </div>
                  {channelOrder.map((ch) => {
                    const channel = selectedProduct.channels.find((c) => c.channel === ch);
                    if (!channel) return null;
                    const cfg = CHANNEL_CONFIG[ch];
                    return (
                      <div key={ch}>
                        <label className="text-sm font-medium mb-1.5 flex items-center gap-2">
                          <span>{cfg.icon}</span> {cfg.label}
                          <span className="text-xs text-muted-foreground">(MAP: ৳{channel.minPrice})</span>
                        </label>
                        <Input
                          type="number"
                          value={editPrices[ch]}
                          onChange={(e) => setEditPrices((prev) => ({ ...prev, [ch]: e.target.value }))}
                          placeholder={`৳${channel.price}`}
                        />
                      </div>
                    );
                  })}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSelectedProduct(null)}>Cancel</Button>
                  <Button onClick={savePrices} disabled={updatePricesMutation.isPending}>
                    {updatePricesMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Save Prices
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default DistributionPage;
