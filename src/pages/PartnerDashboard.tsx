import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Package, TrendingUp, Wallet, Layers, ArrowUpRight, ArrowDownRight, Truck, ShoppingCart, Archive, BarChart3, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type InventoryMode = "collect" | "platform" | "hybrid";

// Stats are now derived from live inventory state (see component body)

interface InventoryItem {
  id: string;
  batchName: string;
  productName: string;
  totalOwned: number;
  collected: number;
  listedForSale: number;
  sold: number;
  remaining: number;
  profitEarned: number;
  costPerUnit: number;
  retailPrice: number;
  mode: InventoryMode;
  status: string;
}

const inventoryData: InventoryItem[] = [
  {
    id: "1", batchName: "Batch #47", productName: "Premium Cotton T-Shirt",
    totalOwned: 50, collected: 10, listedForSale: 22, sold: 18, remaining: 32,
    profitEarned: 6300, costPerUnit: 300, retailPrice: 650, mode: "hybrid", status: "Active",
  },
  {
    id: "2", batchName: "Batch #23", productName: "Organic Skincare Set",
    totalOwned: 30, collected: 0, listedForSale: 30, sold: 12, remaining: 18,
    profitEarned: 8400, costPerUnit: 500, retailPrice: 1200, mode: "platform", status: "Active",
  },
  {
    id: "3", batchName: "Batch #15", productName: "Handcrafted Leather Wallet",
    totalOwned: 100, collected: 20, listedForSale: 28, sold: 52, remaining: 48,
    profitEarned: 26000, costPerUnit: 800, retailPrice: 1800, mode: "hybrid", status: "Active",
  },
  {
    id: "4", batchName: "Batch #31", productName: "Bamboo Kitchen Utensils",
    totalOwned: 40, collected: 10, listedForSale: 20, sold: 10, remaining: 30,
    profitEarned: 3200, costPerUnit: 200, retailPrice: 520, mode: "collect", status: "Active",
  },
  {
    id: "5", batchName: "Batch #8", productName: "Wireless Earbuds Pro",
    totalOwned: 28, collected: 0, listedForSale: 28, sold: 0, remaining: 28,
    profitEarned: 0, costPerUnit: 1500, retailPrice: 3200, mode: "platform", status: "Pending",
  },
];

const recentActivity = [
  { text: "18 units of Cotton T-Shirt sold via platform", time: "2 hours ago" },
  { text: "Collected 10 units of Bamboo Utensils from warehouse", time: "1 day ago" },
  { text: "৳5,200 profit credited to wallet", time: "2 days ago" },
  { text: "Listed 30 units of Skincare Set for platform sale", time: "3 days ago" },
  { text: "Batch #15 production completed — inventory ready", time: "5 days ago" },
];

const modeLabels: Record<InventoryMode, string> = {
  collect: "Self Collect",
  platform: "Platform Sells",
  hybrid: "Hybrid",
};

const modeColors: Record<InventoryMode, string> = {
  collect: "bg-secondary text-secondary-foreground",
  platform: "bg-primary/10 text-primary",
  hybrid: "bg-accent text-accent-foreground",
};

const modeDescriptions: Record<InventoryMode, string> = {
  collect: "You collect all units from the warehouse and sell them yourself. Full control over pricing and distribution.",
  platform: "The platform handles storage, listing, and fulfillment. You earn profit automatically when units sell.",
  hybrid: "Split your inventory — collect some units yourself and let the platform sell the rest.",
};

const PartnerDashboard = () => {
  const [inventory, setInventory] = useState(inventoryData);

  // Derive stats from live inventory data
  const totalOwned = inventory.reduce((s, i) => s + i.totalOwned, 0);
  const totalCollected = inventory.reduce((s, i) => s + i.collected, 0);
  const totalListed = inventory.reduce((s, i) => s + i.listedForSale, 0);
  const totalSold = inventory.reduce((s, i) => s + i.sold, 0);
  const totalRemaining = inventory.reduce((s, i) => s + i.remaining, 0);
  const totalProfit = inventory.reduce((s, i) => s + i.profitEarned, 0);

  const stats = [
    { label: "Total Units Owned", value: totalOwned.toString(), change: "+24", up: true, icon: Package },
    { label: "Units Collected", value: totalCollected.toString(), change: "+10", up: true, icon: Truck },
    { label: "Listed for Platform Sale", value: totalListed.toString(), change: "+14", up: true, icon: ShoppingCart },
    { label: "Units Sold", value: totalSold.toString(), change: "+18", up: true, icon: BarChart3 },
    { label: "Remaining Inventory", value: totalRemaining.toString(), change: `-${totalSold}`, up: false, icon: Archive },
    { label: "Total Profit Earned", value: `৳${totalProfit.toLocaleString()}`, change: "+৳5,200", up: true, icon: Wallet },
  ];
  const [manageOpen, setManageOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [newMode, setNewMode] = useState<InventoryMode>("hybrid");
  const [collectQty, setCollectQty] = useState("");
  const [platformQty, setPlatformQty] = useState("");

  const openManage = (item: InventoryItem) => {
    setSelectedItem(item);
    setNewMode(item.mode);
    if (item.mode === "hybrid") {
      setCollectQty(item.collected.toString());
      setPlatformQty(item.listedForSale.toString());
    } else {
      setCollectQty("");
      setPlatformQty("");
    }
    setManageOpen(true);
  };

  const handleSave = () => {
    if (!selectedItem) return;
    const remaining = selectedItem.remaining;
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id !== selectedItem.id) return item;
        if (newMode === "collect") {
          return { ...item, mode: "collect", collected: remaining, listedForSale: 0 };
        } else if (newMode === "platform") {
          return { ...item, mode: "platform", collected: 0, listedForSale: remaining };
        } else {
          const c = Math.min(Number(collectQty) || 0, remaining);
          const p = Math.min(Number(platformQty) || 0, remaining - c);
          return { ...item, mode: "hybrid", collected: c, listedForSale: p };
        }
      })
    );
    setManageOpen(false);
  };

  return (
    <DashboardLayout role="partner">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold">Production Partner Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage your production inventory and earnings</p>
          </div>
          <div className="flex gap-3">
            <Link to="/marketplace">
              <Button variant="outline">Browse Batches</Button>
            </Link>
            <Link to="/create-batch">
              <Button>Create Batch</Button>
            </Link>
          </div>
        </div>

        {/* Stats — 6 cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl p-4 shadow-card border border-border/50">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                  <stat.icon className="w-4 h-4 text-accent-foreground" />
                </div>
              </div>
              <div className="text-xl font-display font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
              <div className={`flex items-center gap-1 mt-1 text-[10px] font-medium ${stat.up ? "text-primary" : "text-destructive"}`}>
                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </div>
            </div>
          ))}
        </div>

        {/* Inventory Table */}
        <div className="bg-card rounded-xl shadow-card border border-border/50">
          <div className="flex items-center justify-between p-5 border-b border-border/50">
            <h2 className="font-display font-semibold text-lg">Inventory Management</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Product / Batch</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Total Owned</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Collected</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Platform Listed</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Sold</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Remaining</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Profit</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Mode</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="text-sm font-medium">{item.productName}</div>
                      <div className="text-xs text-muted-foreground">{item.batchName}</div>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold">{item.totalOwned}</td>
                    <td className="px-5 py-4 text-sm">{item.collected}</td>
                    <td className="px-5 py-4 text-sm">{item.listedForSale}</td>
                    <td className="px-5 py-4 text-sm text-primary font-medium">{item.sold}</td>
                    <td className="px-5 py-4">
                      <span className={`text-sm font-semibold ${item.remaining === 0 ? "text-muted-foreground" : ""}`}>
                        {item.remaining}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-primary">
                      ৳{item.profitEarned.toLocaleString()}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-medium ${modeColors[item.mode]}`}>
                        {modeLabels[item.mode]}
                      </span>
                    </td>
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
        </div>

        {/* Bottom row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profit Summary */}
          <div className="lg:col-span-2 bg-card rounded-xl shadow-card border border-border/50 p-6">
            <h2 className="font-display font-semibold text-lg mb-4">Profit Summary by Batch</h2>
            <div className="space-y-4">
              {inventory.filter(i => i.sold > 0).map((item) => {
                const maxProfit = item.totalOwned * (item.retailPrice - item.costPerUnit);
                const progressPct = maxProfit > 0 ? (item.profitEarned / maxProfit) * 100 : 0;
                return (
                  <div key={item.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.productName}</span>
                      <span className="text-primary font-semibold">
                        ৳{item.profitEarned.toLocaleString()} / ৳{maxProfit.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{item.sold} of {item.totalOwned} sold</span>
                      <span>{progressPct.toFixed(0)}% of max profit</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-card rounded-xl shadow-card border border-border/50">
            <div className="p-5 border-b border-border/50">
              <h2 className="font-display font-semibold text-lg">Recent Activity</h2>
            </div>
            <div className="p-5 space-y-4">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                  <div>
                    <p className="text-sm">{activity.text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Manage Inventory Dialog */}
      <Dialog open={manageOpen} onOpenChange={setManageOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Manage Inventory</DialogTitle>
            <DialogDescription>
              {selectedItem?.productName} — {selectedItem?.batchName}
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-5 pt-2">
              {/* Current summary */}
              <div className="grid grid-cols-3 gap-3 text-center bg-muted/50 rounded-lg p-4">
                <div>
                  <div className="text-xs text-muted-foreground">Remaining</div>
                  <div className="text-lg font-display font-bold">{selectedItem.remaining}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Cost/Unit</div>
                  <div className="text-lg font-display font-bold">৳{selectedItem.costPerUnit}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Retail</div>
                  <div className="text-lg font-display font-bold">৳{selectedItem.retailPrice}</div>
                </div>
              </div>

              {/* Mode Selection */}
              <div className="space-y-3">
                <Label>Inventory Control Mode</Label>
                <div className="grid gap-2">
                  {(["collect", "platform", "hybrid"] as InventoryMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setNewMode(mode)}
                      className={`text-left p-4 rounded-lg border transition-all ${
                        newMode === mode
                          ? "border-primary bg-accent ring-1 ring-primary/20"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">{modeLabels[mode]}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${modeColors[mode]}`}>
                          {mode === selectedItem.mode ? "Current" : ""}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{modeDescriptions[mode]}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Hybrid split controls */}
              {newMode === "hybrid" && (
                <div className="bg-muted/30 rounded-lg p-4 space-y-3 border border-border/50">
                  <p className="text-sm font-medium">Split your {selectedItem.remaining} remaining units:</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="collect-qty" className="text-xs">Units to Collect</Label>
                      <Input
                        id="collect-qty"
                        type="number"
                        min="0"
                        max={selectedItem.remaining}
                        value={collectQty}
                        onChange={(e) => {
                          const val = Math.min(Number(e.target.value) || 0, selectedItem.remaining);
                          setCollectQty(val.toString());
                          setPlatformQty((selectedItem.remaining - val).toString());
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="platform-qty" className="text-xs">Units for Platform Sale</Label>
                      <Input
                        id="platform-qty"
                        type="number"
                        min="0"
                        max={selectedItem.remaining}
                        value={platformQty}
                        onChange={(e) => {
                          const val = Math.min(Number(e.target.value) || 0, selectedItem.remaining);
                          setPlatformQty(val.toString());
                          setCollectQty((selectedItem.remaining - val).toString());
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* What happens */}
              <div className="bg-accent/50 rounded-lg p-4 border border-primary/10 text-sm space-y-1">
                {newMode === "collect" && (
                  <>
                    <p className="font-medium text-accent-foreground">✓ All {selectedItem.remaining} units will be marked for collection</p>
                    <p className="text-muted-foreground">Visit the warehouse to collect your inventory</p>
                  </>
                )}
                {newMode === "platform" && (
                  <>
                    <p className="font-medium text-accent-foreground">✓ All {selectedItem.remaining} units listed for platform sale</p>
                    <p className="text-muted-foreground">The platform handles listing, fulfillment, and delivery</p>
                  </>
                )}
                {newMode === "hybrid" && (
                  <>
                    <p className="font-medium text-accent-foreground">✓ {collectQty || 0} units to collect · {platformQty || 0} for platform sale</p>
                    <p className="text-muted-foreground">Flexible control over your inventory</p>
                  </>
                )}
              </div>

              <Button onClick={handleSave} className="w-full" size="lg">
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
