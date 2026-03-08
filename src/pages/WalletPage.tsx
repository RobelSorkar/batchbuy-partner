import DashboardLayout from "@/components/DashboardLayout";
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownRight, ArrowDown, ArrowUp, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const transactions = [
  { id: "TXN-001", type: "credit", description: "Profit from Batch #42 — Cotton T-Shirts", amount: "+৳5,200", date: "Mar 7, 2026", status: "completed" },
  { id: "TXN-002", type: "debit", description: "Investment in Batch #47 — Organic Skincare", amount: "-৳15,000", date: "Mar 5, 2026", status: "completed" },
  { id: "TXN-003", type: "credit", description: "Dropshipper commission — 12 orders", amount: "+৳3,100", date: "Mar 3, 2026", status: "completed" },
  { id: "TXN-004", type: "debit", description: "Withdrawal to bKash", amount: "-৳10,000", date: "Mar 1, 2026", status: "completed" },
  { id: "TXN-005", type: "credit", description: "Profit from Batch #38 — Leather Wallets", amount: "+৳8,400", date: "Feb 28, 2026", status: "completed" },
  { id: "TXN-006", type: "debit", description: "Investment in Batch #31 — Bamboo Utensils", amount: "-৳10,000", date: "Feb 25, 2026", status: "completed" },
  { id: "TXN-007", type: "credit", description: "Referral bonus", amount: "+৳500", date: "Feb 22, 2026", status: "pending" },
];

const WalletPage = () => {
  return (
    <DashboardLayout role="partner">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Partner Wallet</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your earnings, investments, and withdrawals</p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <WalletIcon className="w-5 h-5 text-accent-foreground" />
              </div>
            </div>
            <div className="text-sm text-muted-foreground mb-1">Available Balance</div>
            <div className="text-3xl font-display font-bold">৳32,450</div>
            <div className="flex items-center gap-1 mt-2 text-xs font-medium text-primary">
              <ArrowUpRight className="w-3 h-3" /> +৳5,200 this week
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
            <div className="text-sm text-muted-foreground mb-1">Total Invested</div>
            <div className="text-2xl font-display font-bold">৳125,000</div>
            <div className="text-xs text-muted-foreground mt-2">Across 4 active batches</div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
            <div className="text-sm text-muted-foreground mb-1">Total Earnings</div>
            <div className="text-2xl font-display font-bold">৳47,200</div>
            <div className="flex items-center gap-1 mt-2 text-xs font-medium text-primary">
              <ArrowUpRight className="w-3 h-3" /> 37.8% return rate
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button className="gap-2">
            <ArrowDown className="w-4 h-4" /> Deposit
          </Button>
          <Button variant="outline" className="gap-2">
            <ArrowUp className="w-4 h-4" /> Withdraw
          </Button>
        </div>

        {/* Transactions */}
        <div className="bg-card rounded-xl shadow-card border border-border/50">
          <div className="flex items-center justify-between p-5 border-b border-border/50">
            <h2 className="font-display font-semibold text-lg">Transaction History</h2>
            <Button variant="ghost" size="sm">Export</Button>
          </div>
          <div className="divide-y divide-border/30">
            {transactions.map((txn) => (
              <div key={txn.id} className="p-5 flex items-center justify-between hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    txn.type === "credit" ? "bg-primary/10" : "bg-destructive/10"
                  }`}>
                    {txn.type === "credit" ? (
                      <ArrowDownRight className="w-4 h-4 text-primary" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 text-destructive" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{txn.description}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                      {txn.date}
                      <span className="flex items-center gap-1">
                        {txn.status === "completed" ? (
                          <CheckCircle className="w-3 h-3 text-primary" />
                        ) : (
                          <Clock className="w-3 h-3 text-muted-foreground" />
                        )}
                        {txn.status}
                      </span>
                    </div>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${txn.type === "credit" ? "text-primary" : "text-destructive"}`}>
                  {txn.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WalletPage;
