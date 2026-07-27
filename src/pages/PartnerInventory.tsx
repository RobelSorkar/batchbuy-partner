import { useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Package, Warehouse, MapPin, Calendar, TrendingUp, ArrowDown, ArrowUp, Minus, Loader2, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useMyParticipations } from "@/hooks/useProjects";
import { useInventory } from "@/hooks/useInventory";

interface InventoryItem {
  participationId: string;
  batchId: string;
  batchName: string;
  productName: string;
  totalUnits: number;
  soldUnits: number;
  remainingUnits: number;
  costPerUnit: number;
  inventoryValue: number;
  warehouseLocation: string;
  shelfLocation: string;
  projectAgeDays: number;
  status: string;
}

const PartnerInventory = () => {
  const { data: participations, isLoading: loadingParts } = useMyParticipations();
  const { data: inventoryRows, isLoading: loadingInv } = useInventory();

  const items: InventoryItem[] = useMemo(() => {
    if (!participations) return [];

    // Build a lookup from batch_id → inventory row
    const invMap = new Map<string, any>();
    (inventoryRows || []).forEach((inv: any) => {
      if (inv.batch_id) invMap.set(inv.batch_id, inv);
    });

    return participations.map((p: any) => {
      const batch = p.batches;
      if (!batch) return null;

      const totalUnits = p.units_owned;
      const soldUnits = p.units_sold || 0;
      const remainingUnits = totalUnits - soldUnits;
      const costPerUnit = Number(batch.production_cost_per_unit);
      const inventoryValue = remainingUnits * costPerUnit;

      const inv = invMap.get(batch.id);
      const warehouseLocation = inv?.warehouse_location || batch.warehouse || "Main Warehouse";
      const shelfLocation = inv?.shelf_location || "—";

      const createdAt = new Date(p.joined_at);
      const projectAgeDays = Math.max(0, Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)));

      return {
        participationId: p.id,
        batchId: batch.id,
        batchName: batch.batch_name,
        productName: batch.product_name,
        totalUnits,
        soldUnits,
        remainingUnits,
        costPerUnit,
        inventoryValue,
        warehouseLocation,
        shelfLocation,
        projectAgeDays,
        status: batch.status === "completed" ? "Completed" : batch.status === "production" ? "Production" : "Active",
      } as InventoryItem;
    }).filter(Boolean) as InventoryItem[];
  }, [participations, inventoryRows]);

  const totalAssetValue = items.reduce((s, i) => s + i.inventoryValue, 0);
  const totalUnits = items.reduce((s, i) => s + i.totalUnits, 0);
  const totalSold = items.reduce((s, i) => s + i.soldUnits, 0);
  const totalRemaining = items.reduce((s, i) => s + i.remainingUnits, 0);
  const overallSoldPct = totalUnits > 0 ? Math.round((totalSold / totalUnits) * 100) : 0;

  const isLoading = loadingParts || loadingInv;

  if (isLoading) {
    return (
      <DashboardLayout role="partner">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="partner">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Warehouse Inventory</h1>
          <p className="text-muted-foreground text-sm mt-1">Track your owned inventory stored in platform warehouses</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Units", value: totalUnits.toString(), icon: Package, color: "text-primary" },
            { label: "Units Sold", value: totalSold.toString(), icon: TrendingUp, color: "text-primary" },
            { label: "Remaining", value: totalRemaining.toString(), icon: Warehouse, color: "text-accent-foreground" },
            { label: "Inventory Asset Value", value: `৳${totalAssetValue.toLocaleString()}`, icon: BarChart3, color: "text-primary" },
          ].map((stat) => (
            <Card key={stat.label} className="border-border/50 shadow-card">
              <CardContent className="p-4">
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center mb-2">
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div className="text-xl font-display font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Overall progress */}
        <Card className="border-border/50 shadow-card">
          <CardContent className="p-5">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Overall Sell-Through</span>
              <span className="font-semibold">{overallSoldPct}%</span>
            </div>
            <Progress value={overallSoldPct} className="h-3" />
            <p className="text-xs text-muted-foreground mt-1">
              {totalSold} sold out of {totalUnits} total units
            </p>
          </CardContent>
        </Card>

        {/* Batch Inventory Table */}
        <Card className="border-border/50 shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-display">Project Inventory Details</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {items.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No inventory yet. Finance projects from the marketplace to start tracking.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product / Project</TableHead>
                      <TableHead className="text-center">Total</TableHead>
                      <TableHead className="text-center">Sold</TableHead>
                      <TableHead className="text-center">Remaining</TableHead>
                      <TableHead>Warehouse</TableHead>
                      <TableHead>Shelf</TableHead>
                      <TableHead className="text-center">Age (days)</TableHead>
                      <TableHead className="text-right">Asset Value</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => {
                      return (
                        <TableRow key={item.participationId}>
                          <TableCell>
                            <div className="text-sm font-medium">{item.productName}</div>
                            <div className="text-xs text-muted-foreground">{item.batchName}</div>
                          </TableCell>
                          <TableCell className="text-center font-semibold">{item.totalUnits}</TableCell>
                          <TableCell className="text-center">{item.soldUnits}</TableCell>
                          <TableCell className="text-center font-semibold">{item.remainingUnits}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-xs">
                              <MapPin className="w-3 h-3 text-muted-foreground" />
                              {item.warehouseLocation}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">{item.shelfLocation}</TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1 text-xs">
                              <Calendar className="w-3 h-3 text-muted-foreground" />
                              {item.projectAgeDays}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-primary">
                            ৳{item.inventoryValue.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={item.status === "Completed" ? "default" : "secondary"} className="text-xs">
                              {item.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Inventory Movement Log */}
        <Card className="border-border/50 shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-display">Inventory Movement Log</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {items.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">No movements recorded yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <ArrowDown className="w-3 h-3 text-primary" /> Received
                        </div>
                      </TableHead>
                      <TableHead className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <ArrowUp className="w-3 h-3 text-destructive" /> Sold
                        </div>
                      </TableHead>
                      <TableHead className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Minus className="w-3 h-3 text-muted-foreground" /> Remaining
                        </div>
                      </TableHead>
                      <TableHead className="text-center">Sell-Through</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => {
                      const pct = item.totalUnits > 0 ? Math.round((item.soldUnits / item.totalUnits) * 100) : 0;
                      return (
                        <TableRow key={item.participationId}>
                          <TableCell>
                            <div className="text-sm font-medium">{item.productName}</div>
                            <div className="text-xs text-muted-foreground">{item.batchName}</div>
                          </TableCell>
                          <TableCell className="text-center font-semibold text-primary">{item.totalUnits}</TableCell>
                          <TableCell className="text-center font-semibold text-destructive">{item.soldUnits}</TableCell>
                          <TableCell className="text-center font-semibold">{item.remainingUnits}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 justify-center">
                              <Progress value={pct} className="h-2 w-20" />
                              <span className="text-xs text-muted-foreground">{pct}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Asset Value Summary */}
        <Card className="border-primary/20 shadow-card bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg">Inventory Asset Value</h3>
                <p className="text-xs text-muted-foreground">UnsoldUnits × CostPerUnit</p>
              </div>
            </div>
            <div className="text-4xl font-display font-bold text-primary mb-2">
              ৳{totalAssetValue.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">
              Based on {totalRemaining} unsold units across {items.length} project{items.length !== 1 ? "s" : ""}
            </p>

            {items.length > 0 && (
              <div className="mt-4 space-y-2">
                {items.map((item) => (
                  <div key={item.participationId} className="flex items-center justify-between text-sm bg-background/60 rounded-lg px-4 py-2.5">
                    <div>
                      <span className="font-medium">{item.productName}</span>
                      <span className="text-muted-foreground ml-2 text-xs">
                        {item.remainingUnits} units × ৳{item.costPerUnit}
                      </span>
                    </div>
                    <span className="font-semibold text-primary">৳{item.inventoryValue.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PartnerInventory;
