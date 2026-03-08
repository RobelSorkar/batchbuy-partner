import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Package, TrendingUp, Wallet, Layers, ArrowUpRight, ArrowDownRight, Truck, ShoppingCart, Archive, BarChart3, Settings2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMyParticipations } from "@/hooks/useBatches";
import { useWallet, useTransactions } from "@/hooks/useWallet";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

type InventoryMode = "collect" | "platform" | "hybrid";

const modeLabels: Record<InventoryMode, string> = { collect: "Self Collect", platform: "Platform Sells", hybrid: "Hybrid" };
const modeColors: Record<InventoryMode, string> = { collect: "bg-secondary text-secondary-foreground", platform: "bg-primary/10 text-primary", hybrid: "bg-accent text-accent-foreground" };
const modeDescriptions: Record<InventoryMode, string> = {
  collect: "You collect all units from the warehouse and sell them yourself.",
  platform: "The platform handles storage, listing, and fulfillment.",
  hybrid: "Split your inventory — collect some units yourself and let the platform sell the rest.",
};

const PartnerDashboard = () => {
  const { data: participations, isLoading: loadingParts } = useMyParticipations();
  const { data: wallet } = useWallet();
  const { data: transactions } = useTransactions();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [manageOpen, setManageOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [newMode, setNewMode] = useState<InventoryMode>("hybrid");
  const [saving, setSaving] = useState(false);
  const [collectQty, setCollectQty] = useState("");
  const [platformQty, setPlatformQty] = useState("");

  // Build inventory from participations
  const inventory = (participations || []).map((p: any) => {
    const batch = p.batches;
    if (!batch) return null;
    const costPerUnit = Number(batch.production_cost_per_unit);
    const retailPrice = Number(batch.retail_price);
    const unitsSold = p.units_sold || 0;
    const profitPerUnit = retailPrice - costPerUnit;
    return {
      id: p.id,
      batchName: batch.batch_name,
      productName: batch.product_name,
      totalOwned: p.units_owned,
      unitsSold,
      remaining: p.units_owned - unitsSold,
      profitEarned: unitsSold * profitPerUnit * 0.85,
      costPerUnit,
      retailPrice,
      mode: (p as any).inventory_mode as InventoryMode || "platform",
      status: batch.status === "completed" ? "Completed" : "Active",
    };
  }).filter(Boolean);

  const totalOwned = inventory.reduce((s, i: any) => s + i.totalOwned, 0);
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
            <Link to="/marketplace"><Button variant="outline">Browse Batches</Button></Link>
            <Link to="/create-batch"><Button>Create Batch</Button></Link>
          </div>
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

        <div className="bg-card rounded-xl shadow-card border border-border/50">
          <div className="p-5 border-b border-border/50">
            <h2 className="font-display font-semibold text-lg">Inventory Management</h2>
          </div>
          {inventory.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>No inventory yet. <Link to="/marketplace" className="text-primary hover:underline">Join a batch</Link> to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Product / Batch</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Owned</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Sold</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Remaining</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Profit Earned</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Status</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3"></th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item: any) => (
                    <tr key={item.id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="text-sm font-medium">{item.productName}</div>
                        <div className="text-xs text-muted-foreground">{item.batchName}</div>
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold">{item.totalOwned}</td>
                      <td className="px-5 py-4 text-sm">{item.unitsSold}</td>
                      <td className="px-5 py-4 text-sm">{item.remaining}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-primary">৳{Math.round(item.profitEarned).toLocaleString()}</td>
                      <td className="px-5 py-4 text-sm">{item.status}</td>
                      <td className="px-5 py-4">
                        <Button variant="ghost" size="sm" onClick={() => openManage(item)} className="gap-1">
                          <Settings2 className="w-3.5 h-3.5" /> Manage
                        </Button>
                      </td>
                    </tr>
                  ))}
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
              <div className="grid grid-cols-3 gap-3 text-center bg-muted/50 rounded-lg p-4">
                <div><div className="text-xs text-muted-foreground">Units</div><div className="text-lg font-display font-bold">{selectedItem.totalOwned}</div></div>
                <div><div className="text-xs text-muted-foreground">Cost/Unit</div><div className="text-lg font-display font-bold">৳{selectedItem.costPerUnit}</div></div>
                <div><div className="text-xs text-muted-foreground">Retail</div><div className="text-lg font-display font-bold">৳{selectedItem.retailPrice}</div></div>
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
