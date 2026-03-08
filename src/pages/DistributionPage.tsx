import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Search, AlertTriangle, CheckCircle, ShieldAlert, Eye, Settings2,
  TrendingUp, Package, ArrowUpRight, ArrowDownRight, Info, ToggleLeft, ToggleRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  mockDistributions, ProductDistribution, CHANNEL_CONFIG, PRICING_RULES,
  DistributionChannel, computeChannelPrices
} from "@/data/distribution";
import { useToast } from "@/hooks/use-toast";

const channelOrder: DistributionChannel[] = ["platform", "retail", "dropshipper", "distributor"];

const DistributionPage = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState(mockDistributions);
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductDistribution | null>(null);
  const [editPrices, setEditPrices] = useState<Record<DistributionChannel, string>>({
    platform: "", retail: "", dropshipper: "", distributor: "",
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

    // Hierarchy check: Platform ≥ Retail ≥ Dropship > Distributor
    if (platform && retail && retail.enabled && retail.price > platform.price)
      conflicts.push("Retail price exceeds platform price");
    if (retail && dropship && dropship.enabled && dropship.price > retail.price)
      conflicts.push("Dropship price exceeds retail price");
    if (dropship && distributor && distributor.enabled && distributor.price > dropship.price)
      conflicts.push("Distributor price exceeds dropship price");

    // MAP check
    ch.forEach((c) => {
      if (c.enabled && c.price < c.minPrice)
        conflicts.push(`${CHANNEL_CONFIG[c.channel].label} below MAP (৳${c.minPrice})`);
    });

    // Margin check (20% above cost)
    const minMarginPrice = product.productionCost * 1.2;
    ch.forEach((c) => {
      if (c.enabled && c.price < minMarginPrice)
        conflicts.push(`${CHANNEL_CONFIG[c.channel].label} below minimum margin (৳${Math.round(minMarginPrice)})`);
    });

    // Allocation check (no channel > 60%)
    ch.forEach((c) => {
      if (c.enabled && product.totalStock > 0 && (c.allocatedStock / product.totalStock) > 0.6)
        conflicts.push(`${CHANNEL_CONFIG[c.channel].label} exceeds 60% stock allocation`);
    });

    return conflicts;
  };

  const allConflicts = products.flatMap((p) => detectConflicts(p).map((c) => ({ product: p.productName, conflict: c })));

  // Toggle channel
  const toggleChannel = (productId: string, channel: DistributionChannel) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.productId !== productId) return p;
        return {
          ...p,
          channels: p.channels.map((c) =>
            c.channel === channel ? { ...c, enabled: !c.enabled } : c
          ),
        };
      })
    );
    toast({ title: "Channel Updated" });
  };

  // Open edit dialog
  const openEdit = (product: ProductDistribution) => {
    setSelectedProduct(product);
    const prices: Record<DistributionChannel, string> = { platform: "", retail: "", dropshipper: "", distributor: "" };
    product.channels.forEach((c) => { prices[c.channel] = c.price.toString(); });
    setEditPrices(prices);
  };

  // Save prices
  const savePrices = () => {
    if (!selectedProduct) return;
    const newPrices = { ...editPrices };
    // Validate hierarchy
    const p = Number(newPrices.platform);
    const r = Number(newPrices.retail);
    const d = Number(newPrices.dropshipper);
    const dist = Number(newPrices.distributor);

    if (r > p || d > r || dist > d) {
      toast({ title: "Price Hierarchy Violation", description: "Platform ≥ Retail ≥ Dropship > Distributor", variant: "destructive" });
      return;
    }

    const minMargin = selectedProduct.productionCost * 1.2;
    if ([p, r, d, dist].some((v) => v > 0 && v < minMargin)) {
      toast({ title: "Margin Too Low", description: `All prices must be ≥ ৳${Math.round(minMargin)} (20% above cost)`, variant: "destructive" });
      return;
    }

    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.productId !== selectedProduct.productId) return prod;
        return {
          ...prod,
          channels: prod.channels.map((c) => ({
            ...c,
            price: Number(newPrices[c.channel]) || c.price,
          })),
        };
      })
    );
    toast({ title: "Prices Updated", description: `${selectedProduct.productName} channel prices saved.` });
    setSelectedProduct(null);
  };

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
                        <div className="w-12 h-12 rounded-lg bg-muted/50 flex items-center justify-center text-2xl">{product.productImage}</div>
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
                        const marginPct = ((margin / product.productionCost) * 100).toFixed(0);
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
                                onCheckedChange={() => toggleChannel(product.productId, ch)}
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

                            {/* Stock allocation bar */}
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

              {/* Pricing Example */}
              <div className="bg-card rounded-xl shadow-card border border-border/50 p-5">
                <h2 className="font-display font-semibold text-lg mb-4">Example: Pricing Waterfall</h2>
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-3">Product: Cotton T-Shirt (Production Cost: ৳300)</div>
                  <div className="space-y-2">
                    {[
                      { label: "Platform (Direct)", price: 650, pct: "117%", bar: 100 },
                      { label: "Retail Shop", price: 553, pct: "84%", bar: 85 },
                      { label: "Dropshipper", price: 420, pct: "40%", bar: 65 },
                      { label: "Distributor", price: 358, pct: "19%", bar: 55 },
                      { label: "MAP Floor", price: 360, pct: "20%", bar: 55 },
                    ].map((item, i) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className={i === 4 ? "text-destructive font-medium" : ""}>{item.label}</span>
                          <span className="font-medium">৳{item.price} <span className="text-muted-foreground">({item.pct} margin)</span></span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${i === 4 ? "bg-destructive/50 border-r-2 border-destructive" : "bg-primary"}`}
                            style={{ width: `${item.bar}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-primary" />
                    All channels maintain hierarchy: Platform ≥ Retail ≥ Dropship &gt; Distributor ≥ MAP
                  </div>
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
                              <span className="text-xl">{p.productImage}</span>
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
                  <Button onClick={savePrices}>Save Prices</Button>
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
