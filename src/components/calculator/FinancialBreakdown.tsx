import { Info, ChevronDown, ChevronUp } from "lucide-react";

interface FinancialBreakdownProps {
  show: boolean;
  onToggle: () => void;
  investment: number;
  costPerUnit: number;
  retailPrice: number;
  logisticsCostPerUnit: number;
  sellThrough: number;
  main: {
    unitsFinanced: number;
    unitsSold: number;
    totalCost: number;
    totalLogistics: number;
    revenueFromSold: number;
    grossProfit: number;
    commission: number;
    netProfit: number;
    roi: number;
  };
}

function Step({
  label,
  value,
  bold,
  muted,
  primary,
}: {
  label: string;
  value: string;
  bold?: boolean;
  muted?: boolean;
  primary?: boolean;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className={muted ? "text-muted-foreground" : "text-foreground"}>{label}</span>
      <span
        className={`font-mono ${bold ? "font-bold" : "font-medium"} ${
          primary ? "text-primary" : muted ? "text-muted-foreground" : "text-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

const FinancialBreakdown = ({
  show,
  onToggle,
  investment,
  costPerUnit,
  retailPrice,
  logisticsCostPerUnit,
  sellThrough,
  main,
}: FinancialBreakdownProps) => {
  const totalCostWithLogistics = main.totalCost + main.totalLogistics;

  return (
    <>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
      >
        <Info className="w-4 h-4" />
        {show ? "Hide" : "Show"} financial breakdown
        {show ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {show && (
        <div className="bg-muted/30 rounded-xl p-5 space-y-3 text-sm border border-border/50">
          <h4 className="font-semibold text-foreground mb-3">Financial Breakdown</h4>
          <div className="space-y-2">
            <Step label="Financing Amount" value={`৳${investment.toLocaleString()}`} />
            <Step
              label={`Units Financed (৳${investment.toLocaleString()} ÷ ৳${costPerUnit})`}
              value={main.unitsFinanced.toString()}
            />
            <Step
              label={`Units Sold (${main.unitsFinanced} × ${sellThrough}%)`}
              value={main.unitsSold.toString()}
            />

            <div className="border-t border-border/30 pt-2" />
            <Step
              label={`Inventory Purchase Cost (${main.unitsFinanced} × ৳${costPerUnit})`}
              value={`৳${main.totalCost.toLocaleString()}`}
            />
            <Step
              label={`Logistics Cost (${main.unitsFinanced} × ৳${logisticsCostPerUnit})`}
              value={`৳${main.totalLogistics.toLocaleString()}`}
            />
            <Step
              label="Total Cost (Inventory + Logistics)"
              value={`৳${totalCostWithLogistics.toLocaleString()}`}
              bold
            />

            <div className="border-t border-border/30 pt-2" />
            <Step
              label={`Revenue (${main.unitsSold} × ৳${retailPrice})`}
              value={`৳${main.revenueFromSold.toLocaleString()}`}
            />
            <Step
              label="Gross Profit (Revenue − Total Cost)"
              value={`৳${main.grossProfit.toLocaleString()}`}
              bold
            />
            <Step
              label="Platform Commission (15% of gross profit)"
              value={`− ৳${main.commission.toLocaleString()}`}
              muted
            />

            <div className="border-t border-border/30 pt-2" />
            <Step label="Net Profit" value={`৳${main.netProfit.toLocaleString()}`} bold primary />
            <Step
              label="ROI (Net Profit ÷ Financing Amount × 100)"
              value={`${main.roi.toFixed(1)}%`}
              bold
              primary
            />
          </div>
        </div>
      )}
    </>
  );
};

export default FinancialBreakdown;
