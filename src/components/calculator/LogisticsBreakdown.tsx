import { Truck } from "lucide-react";

const LOGISTICS_COMPONENTS = [
  { label: "Packaging", cost: 10 },
  { label: "Warehouse handling", cost: 5 },
  { label: "Delivery to warehouse/reseller", cost: 15 },
  { label: "Return & damage buffer", cost: 5 },
  { label: "Platform operations", cost: 5 },
];

interface LogisticsBreakdownProps {
  logisticsCostPerUnit: number;
  unitsFinanced: number;
}

const LogisticsBreakdown = ({ logisticsCostPerUnit, unitsFinanced }: LogisticsBreakdownProps) => {
  const totalLogistics = logisticsCostPerUnit * unitsFinanced;

  return (
    <div className="bg-muted/30 rounded-xl p-5 border border-border/50 space-y-4">
      <h4 className="font-semibold text-foreground flex items-center gap-2 text-sm">
        <Truck className="w-4 h-4 text-primary" />
        Logistics Cost Breakdown (per unit)
      </h4>

      <div className="space-y-1.5">
        {LOGISTICS_COMPONENTS.map((item) => (
          <div key={item.label} className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">{item.label}</span>
            <span className="font-mono font-medium text-foreground">৳{item.cost}</span>
          </div>
        ))}
        <div className="border-t border-border/40 pt-2 mt-2 flex justify-between items-center text-sm">
          <span className="font-semibold text-foreground">Total Logistics per Unit</span>
          <span className="font-mono font-bold text-foreground">৳{logisticsCostPerUnit}</span>
        </div>
      </div>

      <div className="bg-accent/30 rounded-lg p-3 space-y-1">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">
            Total Logistics Cost ({logisticsCostPerUnit} × {unitsFinanced} units)
          </span>
          <span className="font-mono font-bold text-accent-foreground">
            ৳{totalLogistics.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LogisticsBreakdown;
