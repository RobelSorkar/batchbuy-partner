import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useInventory } from "@/hooks/useInventory";

type InventoryItem = NonNullable<ReturnType<typeof useInventory>["data"]>[number];

interface AdminInventoryTabProps {
  inventory: InventoryItem[];
  totalWarehouseStock: number;
  totalSoldUnits: number;
}

const AdminInventoryTab = ({ inventory, totalWarehouseStock, totalSoldUnits }: AdminInventoryTabProps) => {
  return (
    <div className="bg-card rounded-xl shadow-card border border-border/50">
      <div className="flex items-center justify-between p-5 border-b border-border/50">
        <h2 className="font-display font-semibold text-lg">Warehouse Inventory</h2>
        <Link to="/warehouse"><Button variant="outline" size="sm">Full Warehouse →</Button></Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              {["Product", "SKU", "Total Stock", "Allocated", "Sold", "Warehouse", "Stock Level"].map((h) => (
                <th key={h} className="text-left text-xs font-medium text-muted-foreground px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => {
              const available = item.total_stock - item.allocated_stock - item.sold_units;
              const pct = item.total_stock > 0 ? (available / item.total_stock) * 100 : 0;
              const isLow = pct < 25;
              return (
                <tr key={item.id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-4 text-sm font-medium">{item.product_name}</td>
                  <td className="px-5 py-4 text-xs font-mono text-muted-foreground">{item.sku || "—"}</td>
                  <td className="px-5 py-4 text-sm">{item.total_stock}</td>
                  <td className="px-5 py-4 text-sm">{item.allocated_stock}</td>
                  <td className="px-5 py-4 text-sm text-primary font-medium">{item.sold_units}</td>
                  <td className="px-5 py-4 text-xs text-muted-foreground">{item.warehouse_location || "—"}</td>
                  <td className="px-5 py-4">
                    <div className="w-20">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${isLow ? "bg-destructive" : "bg-primary"}`} style={{ width: `${Math.max(0, pct)}%` }} />
                      </div>
                      <span className={`text-[10px] ${isLow ? "text-destructive" : "text-muted-foreground"}`}>{Math.max(0, pct).toFixed(0)}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {inventory.length === 0 && <div className="p-8 text-center text-muted-foreground">No inventory records yet.</div>}
      {inventory.length > 0 && (
        <div className="p-5 border-t border-border/50 grid grid-cols-3 gap-4">
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <div className="text-2xl font-display font-bold">{inventory.reduce((s, i) => s + i.total_stock, 0).toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Total Stock</div>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <div className="text-2xl font-display font-bold">{Math.max(0, totalWarehouseStock).toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Available</div>
          </div>
          <div className="bg-primary/5 rounded-lg p-3 text-center">
            <div className="text-2xl font-display font-bold text-primary">{totalSoldUnits.toLocaleString()}</div>
            <div className="text-xs text-primary">Total Sold</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventoryTab;
