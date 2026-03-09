import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Package, TrendingUp, Wallet, Layers, BarChart3, Settings2, Loader2, MapPin, Calendar, Warehouse, User, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useMyParticipations } from "@/hooks/useBatches";
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

  // Build a lookup from batch_id → inventory row
  const invMap = new Map<string, any>();
  (inventoryRows || []).forEach((inv: any) => {
    if (inv.batch_id) invMap.set(inv.batch_id, inv);
  });

  // Build inventory from participations
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
    const batchAgeDays = Math.max(0, Math.floor((Date.now() - joinedAt.getTime()) / (1000 * 60 * 60 * 24)));

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
      batchAgeDays,
      mode: (p as any).inventory_mode as InventoryMode || "platform",
      status: batch.status === "completed" ? "Completed" : batch.status === "production" ? "Production" : "Active",
    };
  }).filter(Boolean);

  const totalOwned = inventory.reduce((s, i: any) => s + i.totalOwned, 0);
  const totalSold = inventory.reduce((s, i: any) => s + i.unitsSold, 0);
  const totalRemaining = inventory.reduce((s, i: any) => s + i.remaining, 0);
  const totalAssetValue = inventory.reduce((s, i: any) => s + i.inventoryValue, 0);
  const totalProfit = (transactions || [])
    .filter((t: any) => t.type === "profit")
    .reduce((s: number, t: any) => s + Number(t.amount), 0);

  const stats = [
    { label: "Total Units Owned", value: totalOwned.toString(), icon: Package },
    { label: "Active Batches", value: inventory.length.toString(), icon: Layers },
    { label: "Wallet Balance", value: `৳${(wallet?.balance || 0).toLocaleString()}`, icon: Wallet },
    { label: "Total Profit", value: `৳${totalProfit.toLocaleString()}`, icon: TrendingUp },
  ];

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold">Production Partner Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage your production inventory and earnings</p>
          </div>
          <div className="flex gap-3">
            <Link to="/partner/inventory"><Button variant="outline" className="gap-2"><Warehouse className="w-4 h-4" /> Warehouse View</Button></Link>
            <Link to="/marketplace"><Button>Browse & Finance Batches</Button></Link>
          </div>
        </div>

        {/* Stats */}
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

        {/* Ownership & Custody Banner */}
        {inventory.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Inventory Owner</div>
                  <div className="font-display font-semibold">Investor (You)</div>
                  <div className="text-xs text-muted-foreground mt-0.5">You own all financed product units</div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Warehouse Custodian</div>
                  <div className="font-display font-semibold">Platform</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Products stored & fulfilled by the platform</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Inventory Summary Strip */}
        {inventory.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <Card className="border-border/50 shadow-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-display font-bold">{totalOwned}</div>
                <div className="text-xs text-muted-foreground">Total Units</div>
              </CardContent>
            </Card>
            <Card className="border-border/50 shadow-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-display font-bold">{totalSold}</div>
                <div className="text-xs text-muted-foreground">Sold Units</div>
              </CardContent>
            </Card>
            <Card className="border-border/50 shadow-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-display font-bold">{totalRemaining}</div>
                <div className="text-xs text-muted-foreground">Remaining Inventory</div>
              </CardContent>
            </Card>
            <Card className="border-border/50 shadow-card sm:col-span-2">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Inventory Asset Value</div>
                  <div className="text-2xl font-display font-bold text-primary">৳{totalAssetValue.toLocaleString()}</div>
                  <div className="text-[10px] text-muted-foreground">{totalRemaining} unsold × avg cost per unit</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Inventory Table */}
        <div className="bg-card rounded-xl shadow-card border border-border/50">
          <div className="p-5 border-b border-border/50 flex items-center justify-between">
            <h2 className="font-display font-semibold text-lg">Inventory Management</h2>
            {inventory.length > 0 && (
              <Link to="/partner/inventory" className="text-xs text-primary hover:underline">View detailed warehouse →</Link>
            )}
          </div>
          {inventory.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <p className="text-muted-foreground">No inventory yet. Here's how to get started:</p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>1. <Link to="/wallet" className="text-primary hover:underline">Deposit funds</Link> into your wallet</p>
                <p>2. <Link to="/marketplace" className="text-primary hover:underline">Browse batches</Link> and finance production to own product units</p>
                <p>3. Earn profit when your units are sold</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Product / Batch</th>
                    <th className="text-center text-xs font-medium text-muted-foreground px-3 py-3">Total</th>
                    <th className="text-center text-xs font-medium text-muted-foreground px-3 py-3">Sold</th>
                    <th className="text-center text-xs font-medium text-muted-foreground px-3 py-3">Remaining</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3">Warehouse</th>
                    <th className="text-center text-xs font-medium text-muted-foreground px-3 py-3">Age</th>
                    <th className="text-right text-xs font-medium text-muted-foreground px-3 py-3">Asset Value</th>
                    <th className="text-center text-xs font-medium text-muted-foreground px-3 py-3">Status</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item: any) => {
                    const pct = item.totalOwned > 0 ? Math.round((item.unitsSold / item.totalOwned) * 100) : 0;
                    return (
                      <tr key={item.id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-4">
                          <div className="text-sm font-medium">{item.productName}</div>
                          <div className="text-xs text-muted-foreground">{item.batchName}</div>
                        </td>
                        <td className="px-3 py-4 text-center text-sm font-semibold">{item.totalOwned}</td>
                        <td className="px-3 py-4 text-center text-sm">{item.unitsSold}</td>
                        <td className="px-3 py-4 text-center text-sm font-semibold">{item.remaining}</td>
                        <td className="px-3 py-4">
                          <div className="flex items-center gap-1 text-xs">
                            <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                            <span className="truncate max-w-[100px]">{item.warehouseLocation}</span>
                          </div>
                        </td>
                        <td className="px-3 py-4 text-center">
                          <div className="flex items-center justify-center gap-1 text-xs">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            {item.batchAgeDays}d
                          </div>
                        </td>
                        <td className="px-3 py-4 text-right text-sm font-semibold text-primary">৳{item.inventoryValue.toLocaleString()}</td>
                        <td className="px-3 py-4 text-center">
                          <Badge variant={item.status === "Completed" ? "default" : "secondary"} className="text-xs">{item.status}</Badge>
                        </td>
                        <td className="px-3 py-4">
                          <Button variant="ghost" size="sm" onClick={() => openManage(item)} className="gap-1">
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
        </div>
      </div>

      <Dialog open={manageOpen} onOpenChange={setManageOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Manage Inventory</DialogTitle>
            <DialogDescription>{selectedItem?.productName} — {selectedItem?.batchName}</DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-5 pt-2">
              {/* Ownership labels */}
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

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-3 text-center bg-muted/50 rounded-lg p-4">
                <div><div className="text-xs text-muted-foreground">Total Units</div><div className="text-lg font-display font-bold">{selectedItem.totalOwned}</div></div>
                <div><div className="text-xs text-muted-foreground">Sold</div><div className="text-lg font-display font-bold">{selectedItem.unitsSold}</div></div>
                <div><div className="text-xs text-muted-foreground">Remaining</div><div className="text-lg font-display font-bold">{selectedItem.remaining}</div></div>
              </div>

              {/* Warehouse & asset value */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1"><MapPin className="w-3 h-3" /> Warehouse</div>
                  <div className="text-sm font-medium">{selectedItem.warehouseLocation}</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1"><Calendar className="w-3 h-3" /> Batch Age</div>
                  <div className="text-sm font-medium">{selectedItem.batchAgeDays} days</div>
                </div>
              </div>

              <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                <div className="text-xs text-muted-foreground mb-1">Inventory Asset Value</div>
                <div className="text-2xl font-display font-bold text-primary">৳{selectedItem.inventoryValue.toLocaleString()}</div>
                <div className="text-[10px] text-muted-foreground mt-1">{selectedItem.remaining} unsold units × ৳{selectedItem.costPerUnit} cost/unit</div>
              </div>

              <div className="space-y-3">
                <Label>Inventory Control Mode</Label>
                <div className="grid gap-2">
                  {(["collect", "platform", "hybrid"] as InventoryMode[]).map((mode) => (
                    <button key={mode} type="button" onClick={() => setNewMode(mode)}
                      className={`text-left p-4 rounded-lg border transition-all ${newMode === mode ? "border-primary bg-accent ring-1 ring-primary/20" : "border-border hover:border-primary/30"}`}>
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
