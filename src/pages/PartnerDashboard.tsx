import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Package, TrendingUp, Wallet, Layers, BarChart3, Settings2, Loader2, MapPin, Calendar, Warehouse, User, Shield, ArrowRight, ShoppingCart, ArrowUpRight, Clock, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useMyParticipations } from "@/hooks/useProjects";
import { useWallet, useTransactions } from "@/hooks/useWallet";
import { useInventory } from "@/hooks/useInventory";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

type InventoryMode = "collect" | "platform" | "hybrid";

const modeLabels: Record<InventoryMode, string> = { collect: "Self Collect", platform: "Platform Sells", hybrid: "Hybrid" };
const modeDescriptions: Record<InventoryMode, string> = {
  collect: "You collect all units from the warehouse and sell them yourself.",
  platform: "The platform handles storage, listing, and fulfillment.",
  hybrid: "Split your inventory — collect some units yourself and let the platform sell the rest.",
};

const PartnerDashboard = () => {
  const { data: participations, isLoading: loadingParts } = useMyParticipations();
  const { data: wallet } = useWallet();
  const { data: transactions } = useTransactions();
  const { data: inventoryRows } = useInventory();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [manageOpen, setManageOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [newMode, setNewMode] = useState<InventoryMode>("hybrid");
  const [saving, setSaving] = useState(false);

  const invMap = new Map<string, any>();
  (inventoryRows || []).forEach((inv: any) => {
    if (inv.batch_id) invMap.set(inv.batch_id, inv);
  });

  const inventory = (participations || []).map((p: any) => {
    const batch = p.batches;
    if (!batch) return null;
    const costPerUnit = Number(batch.production_cost_per_unit);
    const retailPrice = Number(batch.retail_price);
    const logisticsCostPerUnit = Number((batch as any).logistics_cost_per_unit) || 0;
    const unitsSold = p.units_sold || 0;
    const remaining = p.units_owned - unitsSold;
    const profitPerUnit = retailPrice - costPerUnit - logisticsCostPerUnit;
    const inv = invMap.get(batch.id);
    const joinedAt = new Date(p.joined_at);
    const projectAgeDays = Math.max(0, Math.floor((Date.now() - joinedAt.getTime()) / (1000 * 60 * 60 * 24)));

    return {
      id: p.id,
      batchId: batch.id,
      batchName: batch.batch_name,
      productName: batch.product_name,
      totalOwned: p.units_owned,
      unitsSold,
      remaining,
      profitEarned: unitsSold * profitPerUnit * 0.85,
      costPerUnit,
      retailPrice,
      inventoryValue: remaining * costPerUnit,
      warehouseLocation: inv?.warehouse_location || batch.warehouse || "Main Warehouse",
      batchAgeDays: projectAgeDays,
      mode: (p as any).inventory_mode as InventoryMode || "platform",
      status: batch.status === "completed" ? "Completed" : batch.status === "production" ? "Production" : "Active",
    };
  }).filter(Boolean);

  const totalOwned = inventory.reduce((s, i: any) => s + i.totalOwned, 0);
  const totalSold = inventory.reduce((s, i: any) => s + i.unitsSold, 0);
  const totalRemaining = inventory.reduce((s, i: any) => s + i.remaining, 0);
  const totalAssetValue = inventory.reduce((s, i: any) => s + i.inventoryValue, 0);
  const totalProfit = (transactions || [])
    .filter((t: any) => t.type === "profit" && t.status === "completed")
    .reduce((s: number, t: any) => s + Number(t.amount), 0);
  const pendingWithdrawals = (transactions || [])
    .filter((t: any) => t.type === "withdrawal" && t.status === "pending")
    .reduce((s: number, t: any) => s + Number(t.amount), 0);
  const totalInvested = inventory.reduce((s, i: any) => s + (i.totalOwned * i.costPerUnit), 0);

  const openManage = (item: any) => {
    setSelectedItemId(item.id);
    setNewMode(item.mode);
    setManageOpen(true);
  };

  const selectedItem = inventory.find((i: any) => i.id === selectedItemId);

  if (loadingParts) {
    return (
      <DashboardLayout role="partner">
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="partner">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight">Overview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Your production portfolio at a glance</p>
        </div>

        {/* Primary KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Wallet Balance */}
          <Card className="border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Wallet className="w-4.5 h-4.5 text-primary" />
                </div>
                <Link to="/wallet" className="text-[11px] text-primary hover:underline flex items-center gap-0.5">
                  Details <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="text-2xl font-display font-bold tracking-tight">
                ৳{(wallet?.balance || 0).toLocaleString("en-IN")}
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">Wallet Balance</div>
            </CardContent>
          </Card>

          {/* Total Units */}
          <Card className="border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                  <Package className="w-4.5 h-4.5 text-foreground/70" />
                </div>
                <Badge variant="secondary" className="text-[10px] font-normal">
                  {inventory.length} projects
                </Badge>
              </div>
              <div className="text-2xl font-display font-bold tracking-tight">{totalOwned}</div>
              <div className="text-[11px] text-muted-foreground mt-1">Units Owned</div>
            </CardContent>
          </Card>

          {/* Total Profit */}
          <Card className="border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-4.5 h-4.5 text-primary" />
                </div>
                {totalInvested > 0 && (
                  <span className="text-[11px] font-medium text-primary">
                    {totalInvested > 0 ? `${((totalProfit / totalInvested) * 100).toFixed(1)}% ROI` : ""}
                  </span>
                )}
              </div>
              <div className="text-2xl font-display font-bold tracking-tight">
                ৳{totalProfit.toLocaleString("en-IN")}
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">Total Profit Earned</div>
            </CardContent>
          </Card>

          {/* Pending Withdrawals */}
          <Card className="border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                  <Clock className="w-4.5 h-4.5 text-foreground/70" />
                </div>
                {pendingWithdrawals > 0 && (
                  <span className="w-2 h-2 rounded-full bg-destructive/70 animate-pulse" />
                )}
              </div>
              <div className="text-2xl font-display font-bold tracking-tight">
                ৳{pendingWithdrawals.toLocaleString("en-IN")}
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">Pending Withdrawals</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link to="/marketplace">
            <Card className="border-border hover:border-primary/30 hover:shadow-card-hover transition-all cursor-pointer group">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                  <Layers className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">Join Production</div>
                  <div className="text-[11px] text-muted-foreground">Browse & finance projects</div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>
          </Link>
          <Link to="/partner/inventory">
            <Card className="border-border hover:border-primary/30 hover:shadow-card-hover transition-all cursor-pointer group">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Warehouse className="w-5 h-5 text-foreground/70" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">View Inventory</div>
                  <div className="text-[11px] text-muted-foreground">Warehouse & stock details</div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>
          </Link>
          <Link to="/wallet">
            <Card className="border-border hover:border-primary/30 hover:shadow-card-hover transition-all cursor-pointer group">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Wallet className="w-5 h-5 text-foreground/70" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">Wallet & Withdraw</div>
                  <div className="text-[11px] text-muted-foreground">Deposit, withdraw, history</div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Portfolio Summary */}
        {inventory.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card className="border-border">
              <CardContent className="p-4 text-center">
                <div className="text-xs text-muted-foreground mb-1">Sold</div>
                <div className="text-xl font-display font-bold">{totalSold}</div>
                <Progress value={totalOwned > 0 ? (totalSold / totalOwned) * 100 : 0} className="h-1 mt-2" />
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-4 text-center">
                <div className="text-xs text-muted-foreground mb-1">Remaining</div>
                <div className="text-xl font-display font-bold">{totalRemaining}</div>
                <div className="text-[10px] text-muted-foreground mt-1">in warehouse</div>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-4 text-center">
                <div className="text-xs text-muted-foreground mb-1">Total Invested</div>
                <div className="text-xl font-display font-bold">৳{totalInvested.toLocaleString("en-IN")}</div>
              </CardContent>
            </Card>
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4 text-center">
                <div className="text-xs text-muted-foreground mb-1">Asset Value</div>
                <div className="text-xl font-display font-bold text-primary">৳{totalAssetValue.toLocaleString("en-IN")}</div>
                <div className="text-[10px] text-muted-foreground mt-1">{totalRemaining} unsold units</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Ownership info */}
        {inventory.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-lg border border-primary/15 bg-primary/5">
              <User className="w-4 h-4 text-primary shrink-0" />
              <div className="text-xs">
                <span className="font-medium text-foreground">Inventory Owner:</span>{" "}
                <span className="text-muted-foreground">You — all financed product units belong to you</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
              <Shield className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="text-xs">
                <span className="font-medium text-foreground">Warehouse Custodian:</span>{" "}
                <span className="text-muted-foreground">Platform — stored & fulfilled by us</span>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Table */}
        <Card className="border-border">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="font-display font-semibold text-base">Your Projects</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">Track inventory per project</p>
            </div>
            {inventory.length > 0 && (
              <Link to="/partner/inventory">
                <Button variant="ghost" size="sm" className="text-xs gap-1">
                  <Eye className="w-3.5 h-3.5" /> Full View
                </Button>
              </Link>
            )}
          </div>
          {inventory.length === 0 ? (
            <div className="p-10 text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto">
                <Package className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium mb-1">No inventory yet</p>
                 <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                   Deposit funds, browse production projects, and finance manufacturing to own product units.
                 </p>
              </div>
              <div className="flex gap-2 justify-center">
                <Link to="/wallet"><Button variant="outline" size="sm">Deposit Funds</Button></Link>
                <Link to="/marketplace"><Button size="sm">Browse Projects</Button></Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-[11px] font-medium text-muted-foreground px-5 py-3">Product</th>
                    <th className="text-center text-[11px] font-medium text-muted-foreground px-3 py-3">Owned</th>
                    <th className="text-center text-[11px] font-medium text-muted-foreground px-3 py-3">Sold</th>
                    <th className="text-center text-[11px] font-medium text-muted-foreground px-3 py-3">Remaining</th>
                    <th className="text-right text-[11px] font-medium text-muted-foreground px-3 py-3">Value</th>
                    <th className="text-center text-[11px] font-medium text-muted-foreground px-3 py-3">Status</th>
                    <th className="px-3 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item: any) => {
                    const pct = item.totalOwned > 0 ? Math.round((item.unitsSold / item.totalOwned) * 100) : 0;
                    return (
                      <tr key={item.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="text-sm font-medium">{item.productName}</div>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" /> {item.warehouseLocation}
                          </div>
                        </td>
                        <td className="px-3 py-3.5 text-center text-sm font-semibold">{item.totalOwned}</td>
                        <td className="px-3 py-3.5 text-center">
                          <div className="text-sm">{item.unitsSold}</div>
                          <div className="w-12 mx-auto mt-1">
                            <Progress value={pct} className="h-0.5" />
                          </div>
                        </td>
                        <td className="px-3 py-3.5 text-center text-sm font-medium">{item.remaining}</td>
                        <td className="px-3 py-3.5 text-right text-sm font-semibold text-primary">
                          ৳{item.inventoryValue.toLocaleString("en-IN")}
                        </td>
                        <td className="px-3 py-3.5 text-center">
                          <Badge variant={item.status === "Completed" ? "default" : "secondary"} className="text-[10px]">
                            {item.status}
                          </Badge>
                        </td>
                        <td className="px-3 py-3.5">
                          <Button variant="ghost" size="sm" onClick={() => openManage(item)} className="text-xs gap-1">
                            <Settings2 className="w-3.5 h-3.5" /> Manage
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Manage Dialog */}
      <Dialog open={manageOpen} onOpenChange={setManageOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Manage Inventory</DialogTitle>
            <DialogDescription>{selectedItem?.productName} — {selectedItem?.batchName}</DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-5 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Owner</div>
                  <div className="text-sm font-semibold mt-0.5">Investor (You)</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Custodian</div>
                  <div className="text-sm font-semibold mt-0.5">Platform Warehouse</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center bg-muted/50 rounded-lg p-4">
                <div><div className="text-xs text-muted-foreground">Total Units</div><div className="text-lg font-display font-bold">{selectedItem.totalOwned}</div></div>
                <div><div className="text-xs text-muted-foreground">Sold</div><div className="text-lg font-display font-bold">{selectedItem.unitsSold}</div></div>
                <div><div className="text-xs text-muted-foreground">Remaining</div><div className="text-lg font-display font-bold">{selectedItem.remaining}</div></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1"><MapPin className="w-3 h-3" /> Warehouse</div>
                  <div className="text-sm font-medium">{selectedItem.warehouseLocation}</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1"><Calendar className="w-3 h-3" /> Project Age</div>
                  <div className="text-sm font-medium">{selectedItem.batchAgeDays} days</div>
                </div>
              </div>

              <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                <div className="text-xs text-muted-foreground mb-1">Inventory Asset Value</div>
                <div className="text-2xl font-display font-bold text-primary">৳{selectedItem.inventoryValue.toLocaleString("en-IN")}</div>
                <div className="text-[10px] text-muted-foreground mt-1">{selectedItem.remaining} unsold units × ৳{selectedItem.costPerUnit} cost/unit</div>
              </div>

              <div className="space-y-3">
                <Label>Inventory Control Mode</Label>
                <div className="grid gap-2">
                  {(["collect", "platform", "hybrid"] as InventoryMode[]).map((mode) => (
                    <button key={mode} type="button" onClick={() => setNewMode(mode)}
                      className={`text-left p-4 rounded-lg border transition-all ${newMode === mode ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border hover:border-primary/30"}`}>
                      <div className="text-sm font-semibold">{modeLabels[mode]}</div>
                      <p className="text-xs text-muted-foreground mt-1">{modeDescriptions[mode]}</p>
                    </button>
                  ))}
                </div>
              </div>
              <Button className="w-full" disabled={saving} onClick={async () => {
                if (!selectedItemId) return;
                setSaving(true);
                const { error } = await supabase
                  .from("batch_participations")
                  .update({ inventory_mode: newMode } as any)
                  .eq("id", selectedItemId);
                setSaving(false);
                if (error) {
                  toast({ title: "Failed to save", description: error.message, variant: "destructive" });
                } else {
                  toast({ title: "Inventory mode updated" });
                  queryClient.invalidateQueries({ queryKey: ["my-participations"] });
                  setManageOpen(false);
                }
              }}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default PartnerDashboard;
