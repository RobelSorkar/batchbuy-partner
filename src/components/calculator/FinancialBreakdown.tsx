import { Info, ChevronDown, ChevronUp } from "lucide-react";

interface FinancialBreakdownProps {
  show: boolean;
  onToggle: () => void;
  investment: number;
  costPerUnit: number;
  wholesalePrice: number;
  retailPrice: number;
  logisticsCostPerUnit: number;
  sellThrough: number;
  main: {
    unitsFinanced: number;
    unitsSold: number;
    totalCost: number;
    totalLogistics: number;
    totalCostWithLogistics: number;
    wholesaleRevenue: number;
    wholesaleGrossProfit: number;
    retailRevenue: number;
    retailGrossProfit: number;
    unusedAmount: number;
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
  negative,
}: {
  label: string;
  value: string;
  bold?: boolean;
  muted?: boolean;
  primary?: boolean;
  negative?: boolean;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className={muted ? "text-muted-foreground" : "text-foreground"}>{label}</span>
      <span
        className={`font-mono ${bold ? "font-bold" : "font-medium"} ${
          primary ? "text-primary" : negative ? "text-destructive" : muted ? "text-muted-foreground" : "text-foreground"
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
  wholesalePrice,
  retailPrice,
  logisticsCostPerUnit,
  sellThrough,
  main,
}: FinancialBreakdownProps) => {
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
            {/* Units */}
            <Step label="Financing Amount" value={`৳${investment.toLocaleString()}`} />
            <Step
              label={`Units Financed — CEIL(৳${investment.toLocaleString()} ÷ ৳${costPerUnit})`}
              value={main.unitsFinanced.toString()}
            />
            <Step
              label={`Units Sold (${main.unitsFinanced} × ${sellThrough}%)`}
              value={main.unitsSold.toString()}
            />

            {/* Costs */}
            <div className="border-t border-border/30 pt-2" />
            <Step
              label={`Actual Investment (${main.unitsFinanced} × ৳${costPerUnit})`}
              value={`৳${main.totalCost.toLocaleString()}`}
            />
            <Step
              label={`Logistics Cost (${main.unitsFinanced} × ৳${logisticsCostPerUnit})`}
              value={`৳${main.totalLogistics.toLocaleString()}`}
            />
            <Step
              label="Total Cost (Inventory + Logistics)"
              value={`৳${main.totalCostWithLogistics.toLocaleString()}`}
              bold
            />

            {/* Wholesale */}
            <div className="border-t border-border/30 pt-2" />
            <Step
              label={`Wholesale Revenue (${main.unitsSold} × ৳${wholesalePrice})`}
              value={`৳${main.wholesaleRevenue.toLocaleString()}`}
            />
            <Step
              label="Wholesale Gross Profit (Revenue − Total Cost)"
              value={`৳${main.wholesaleGrossProfit.toLocaleString()}`}
              bold
              negative={main.wholesaleGrossProfit < 0}
            />

            {/* Retail */}
            <div className="border-t border-border/30 pt-2" />
            <Step
              label={`Retail Revenue (${main.unitsSold} × ৳${retailPrice})`}
              value={`৳${main.retailRevenue.toLocaleString()}`}
            />
            <Step
              label="Retail Gross Profit (Revenue − Total Cost)"
              value={`৳${main.retailGrossProfit.toLocaleString()}`}
              bold
              negative={main.retailGrossProfit < 0}
            />

            {/* Commission & Net */}
            <div className="border-t border-border/30 pt-2" />
            <Step
              label="Platform Commission (15% of retail gross profit)"
              value={`− ৳${main.commission.toLocaleString()}`}
              muted
            />
            <Step label="Net Profit" value={`৳${main.netProfit.toLocaleString()}`} bold primary />
            <Step
              label="ROI (Net Profit ÷ Total Investment × 100)"
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
