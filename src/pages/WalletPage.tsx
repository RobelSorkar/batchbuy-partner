import { useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Wallet as WalletIcon, ArrowUpRight, ArrowDownRight, ArrowDown, ArrowUp,
  Clock, CheckCircle, RefreshCw, TrendingUp, Layers, AlertCircle, Banknote, Repeat
} from "lucide-react";

// ── Types ──────────────────────────────────────────────
type TxnType = "credit" | "debit";
type TxnCategory = "profit" | "investment" | "withdrawal" | "deposit" | "commission" | "reinvest" | "bonus";

interface Transaction {
  id: string;
  type: TxnType;
  category: TxnCategory;
  description: string;
  amount: number;
  date: string;
  status: "completed" | "pending" | "processing";
}

interface ReinvestBatch {
  id: string;
  name: string;
  costPerUnit: number;
  remainingUnits: number;
}

// ── Data ───────────────────────────────────────────────
const initialTransactions: Transaction[] = [
  { id: "TXN-001", type: "credit", category: "profit", description: "Profit from Batch #42 — Cotton T-Shirts", amount: 5200, date: "Mar 7, 2026", status: "completed" },
  { id: "TXN-002", type: "debit", category: "investment", description: "Investment in Batch #47 — Organic Skincare", amount: 15000, date: "Mar 5, 2026", status: "completed" },
  { id: "TXN-003", type: "credit", category: "commission", description: "Dropshipper commission — 12 orders", amount: 3100, date: "Mar 3, 2026", status: "completed" },
  { id: "TXN-004", type: "debit", category: "withdrawal", description: "Withdrawal to bKash — 01712XXXXXX", amount: 10000, date: "Mar 1, 2026", status: "completed" },
  { id: "TXN-005", type: "credit", category: "profit", description: "Profit from Batch #38 — Leather Wallets", amount: 8400, date: "Feb 28, 2026", status: "completed" },
  { id: "TXN-006", type: "debit", category: "reinvest", description: "Auto-reinvest into Batch #31 — Bamboo Utensils", amount: 10000, date: "Feb 25, 2026", status: "completed" },
  { id: "TXN-007", type: "credit", category: "bonus", description: "Referral bonus", amount: 500, date: "Feb 22, 2026", status: "pending" },
  { id: "TXN-008", type: "credit", category: "profit", description: "Profit from Batch #29 — Artisan Coffee", amount: 2800, date: "Feb 18, 2026", status: "completed" },
  { id: "TXN-009", type: "debit", category: "investment", description: "Investment in Batch #23 — Skincare Set", amount: 10000, date: "Feb 15, 2026", status: "completed" },
];

const availableBatches: ReinvestBatch[] = [
  { id: "1", name: "Premium Cotton T-Shirt — Batch #47", costPerUnit: 300, remainingUnits: 188 },
  { id: "2", name: "Organic Skincare Set — Batch #23", costPerUnit: 500, remainingUnits: 102 },
  { id: "4", name: "Bamboo Kitchen Utensils — Batch #31", costPerUnit: 200, remainingUnits: 260 },
  { id: "6", name: "Artisan Coffee Blend — Batch #52", costPerUnit: 180, remainingUnits: 880 },
];

const withdrawMethods = [
  { value: "bkash", label: "bKash" },
  { value: "nagad", label: "Nagad" },
  { value: "rocket", label: "Rocket" },
  { value: "bank", label: "Bank Transfer" },
];

const categoryIcons: Record<TxnCategory, string> = {
  profit: "💰", investment: "📦", withdrawal: "🏧", deposit: "💵",
  commission: "🤝", reinvest: "🔄", bonus: "🎁",
};

const categoryFilters: { label: string; value: string }[] = [
  { label: "All", value: "all" },
  { label: "Profits", value: "profit" },
  { label: "Investments", value: "investment" },
  { label: "Withdrawals", value: "withdrawal" },
  { label: "Commissions", value: "commission" },
  { label: "Reinvests", value: "reinvest" },
];

// ── Component ──────────────────────────────────────────
const WalletPage = () => {
  // Balance derived: credits - debits from transactions
  // Initial: 5200 + 3100 + 8400 + 500 + 2800 (credits=20000) - 15000 - 10000 - 10000 (debits=35000) = -15000
  // But balance represents wallet deposits + earnings - withdrawals - investments
  // Using a realistic starting deposit of 50000 + earnings - debits
  const [balance, setBalance] = useState(15000);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [txnFilter, setTxnFilter] = useState("all");

  // Withdraw dialog
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("bkash");
  const [withdrawAccount, setWithdrawAccount] = useState("");
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  // Reinvest dialog
  const [reinvestOpen, setReinvestOpen] = useState(false);
  const [reinvestBatch, setReinvestBatch] = useState("");
  const [reinvestAmount, setReinvestAmount] = useState("");
  const [reinvestSuccess, setReinvestSuccess] = useState(false);

  // Auto reinvest
  const [autoReinvest, setAutoReinvest] = useState(false);
  const [autoReinvestPct, setAutoReinvestPct] = useState("50");
  const [autoReinvestSettingsOpen, setAutoReinvestSettingsOpen] = useState(false);

  const totalInvested = transactions.filter((t) => t.category === "investment" || t.category === "reinvest").reduce((s, t) => s + t.amount, 0);
  const totalEarnings = transactions.filter((t) => t.type === "credit").reduce((s, t) => s + t.amount, 0);
  const totalWithdrawn = transactions.filter((t) => t.category === "withdrawal").reduce((s, t) => s + t.amount, 0);

  const filteredTxns = txnFilter === "all"
    ? transactions
    : transactions.filter((t) => t.category === txnFilter);

  // Withdraw handler
  const handleWithdraw = () => {
    const amt = Number(withdrawAmount);
    if (amt <= 0 || amt > balance || !withdrawAccount) return;
    setBalance((b) => b - amt);
    setTransactions((prev) => [
      {
        id: `TXN-${Date.now()}`,
        type: "debit",
        category: "withdrawal",
        description: `Withdrawal to ${withdrawMethods.find(m => m.value === withdrawMethod)?.label} — ${withdrawAccount}`,
        amount: amt,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        status: "processing",
      },
      ...prev,
    ]);
    setWithdrawSuccess(true);
  };

  const closeWithdraw = () => {
    setWithdrawOpen(false);
    setTimeout(() => {
      setWithdrawSuccess(false);
      setWithdrawAmount("");
      setWithdrawAccount("");
    }, 300);
  };

  // Reinvest handler
  const selectedBatch = availableBatches.find((b) => b.id === reinvestBatch);
  const reinvestAmt = Number(reinvestAmount) || 0;
  const reinvestUnits = selectedBatch ? Math.floor(reinvestAmt / selectedBatch.costPerUnit) : 0;
  const reinvestCost = selectedBatch ? reinvestUnits * selectedBatch.costPerUnit : 0;

  const handleReinvest = () => {
    if (!selectedBatch || reinvestAmt < 10000 || reinvestUnits <= 0 || reinvestAmt > balance) return;
    setBalance((b) => b - reinvestCost);
    setTransactions((prev) => [
      {
        id: `TXN-${Date.now()}`,
        type: "debit",
        category: "reinvest",
        description: `Reinvested into ${selectedBatch.name} — ${reinvestUnits} units`,
        amount: reinvestCost,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        status: "completed",
      },
      ...prev,
    ]);
    setReinvestSuccess(true);
  };

  const closeReinvest = () => {
    setReinvestOpen(false);
    setTimeout(() => {
      setReinvestSuccess(false);
      setReinvestAmount("");
      setReinvestBatch("");
    }, 300);
  };

  return (
    <DashboardLayout role="partner">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold">Partner Wallet</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage earnings, withdrawals, and reinvestments</p>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-3">
              <WalletIcon className="w-5 h-5 text-accent-foreground" />
            </div>
            <div className="text-sm text-muted-foreground mb-1">Available Balance</div>
            <div className="text-3xl font-display font-bold">৳{balance.toLocaleString()}</div>
            <div className="flex items-center gap-1 mt-2 text-xs font-medium text-primary">
              <ArrowUpRight className="w-3 h-3" /> +৳5,200 this week
            </div>
          </div>
          <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-3">
              <Layers className="w-5 h-5 text-accent-foreground" />
            </div>
            <div className="text-sm text-muted-foreground mb-1">Total Invested</div>
            <div className="text-2xl font-display font-bold">৳{totalInvested.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-2">Across 4 active batches</div>
          </div>
          <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5 text-accent-foreground" />
            </div>
            <div className="text-sm text-muted-foreground mb-1">Total Earnings</div>
            <div className="text-2xl font-display font-bold">৳{totalEarnings.toLocaleString()}</div>
            <div className="flex items-center gap-1 mt-2 text-xs font-medium text-primary">
              <ArrowUpRight className="w-3 h-3" /> {((totalEarnings / totalInvested) * 100).toFixed(1)}% return
            </div>
          </div>
          <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-3">
              <Banknote className="w-5 h-5 text-accent-foreground" />
            </div>
            <div className="text-sm text-muted-foreground mb-1">Total Withdrawn</div>
            <div className="text-2xl font-display font-bold">৳{totalWithdrawn.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-2">3 withdrawals</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button className="gap-2" onClick={() => setWithdrawOpen(true)}>
            <ArrowUp className="w-4 h-4" /> Withdraw Funds
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => setReinvestOpen(true)}>
            <RefreshCw className="w-4 h-4" /> Reinvest Profits
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => setAutoReinvestSettingsOpen(true)}>
            <Repeat className="w-4 h-4" /> Auto-Reinvest {autoReinvest && <span className="w-2 h-2 rounded-full bg-primary" />}
          </Button>
        </div>

        {/* Auto-reinvest status banner */}
        {autoReinvest && (
          <div className="bg-accent/50 rounded-lg p-4 border border-primary/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Repeat className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Auto-Reinvest is ON</p>
                <p className="text-xs text-muted-foreground">{autoReinvestPct}% of incoming profits will be automatically reinvested</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setAutoReinvestSettingsOpen(true)}>Configure</Button>
          </div>
        )}

        {/* Transaction History */}
        <div className="bg-card rounded-xl shadow-card border border-border/50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 border-b border-border/50 gap-3">
            <h2 className="font-display font-semibold text-lg">Transaction History</h2>
            <div className="flex gap-2 flex-wrap">
              {categoryFilters.map((f) => (
                <Button
                  key={f.value}
                  variant={txnFilter === f.value ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-7 px-2.5"
                  onClick={() => setTxnFilter(f.value)}
                >
                  {f.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="divide-y divide-border/30">
            {filteredTxns.length === 0 && (
              <div className="p-8 text-center text-muted-foreground text-sm">No transactions found</div>
            )}
            {filteredTxns.map((txn) => (
              <div key={txn.id} className="p-5 flex items-center justify-between hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                    txn.type === "credit" ? "bg-primary/10" : "bg-destructive/10"
                  }`}>
                    {categoryIcons[txn.category]}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{txn.description}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                      <span>{txn.id}</span>
                      <span>·</span>
                      <span>{txn.date}</span>
                      <span className="flex items-center gap-1">
                        {txn.status === "completed" ? (
                          <CheckCircle className="w-3 h-3 text-primary" />
                        ) : txn.status === "processing" ? (
                          <RefreshCw className="w-3 h-3 text-accent-foreground animate-spin" />
                        ) : (
                          <Clock className="w-3 h-3 text-muted-foreground" />
                        )}
                        <span className="capitalize">{txn.status}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${txn.type === "credit" ? "text-primary" : "text-destructive"}`}>
                  {txn.type === "credit" ? "+" : "-"}৳{txn.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Withdraw Dialog ── */}
      <Dialog open={withdrawOpen} onOpenChange={closeWithdraw}>
        <DialogContent className="sm:max-w-md">
          {withdrawSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-display font-bold">Withdrawal Submitted</h2>
              <p className="text-muted-foreground text-sm">
                ৳{Number(withdrawAmount).toLocaleString()} will be sent to your {withdrawMethods.find(m => m.value === withdrawMethod)?.label} account. Processing takes 1-3 business days.
              </p>
              <Button onClick={closeWithdraw} className="w-full">Done</Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Withdraw Funds</DialogTitle>
                <DialogDescription>Transfer funds from your wallet</DialogDescription>
              </DialogHeader>
              <div className="space-y-5 pt-2">
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <div className="text-xs text-muted-foreground">Available Balance</div>
                  <div className="text-2xl font-display font-bold">৳{balance.toLocaleString()}</div>
                </div>

                <div className="space-y-2">
                  <Label>Withdrawal Method</Label>
                  <Select value={withdrawMethod} onValueChange={setWithdrawMethod}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {withdrawMethods.map((m) => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="w-account">Account Number</Label>
                  <Input
                    id="w-account"
                    placeholder={withdrawMethod === "bank" ? "Account number" : "Phone number"}
                    value={withdrawAccount}
                    onChange={(e) => setWithdrawAccount(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="w-amount">Amount (BDT)</Label>
                  <Input
                    id="w-amount"
                    type="number"
                    min={100}
                    max={balance}
                    placeholder="Enter amount"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="text-lg font-semibold"
                  />
                  <div className="flex gap-2">
                    {[5000, 10000, 20000].map((amt) => (
                      <Button key={amt} variant="outline" size="sm" className="text-xs" onClick={() => setWithdrawAmount(amt.toString())} disabled={amt > balance}>
                        ৳{(amt / 1000).toFixed(0)}K
                      </Button>
                    ))}
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => setWithdrawAmount(balance.toString())}>
                      Max
                    </Button>
                  </div>
                </div>

                {Number(withdrawAmount) > balance && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4" /> Insufficient balance
                  </div>
                )}

                <Button
                  onClick={handleWithdraw}
                  className="w-full"
                  size="lg"
                  disabled={!withdrawAccount || Number(withdrawAmount) <= 0 || Number(withdrawAmount) > balance}
                >
                  Withdraw ৳{Number(withdrawAmount || 0).toLocaleString()}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Reinvest Dialog ── */}
      <Dialog open={reinvestOpen} onOpenChange={closeReinvest}>
        <DialogContent className="sm:max-w-lg">
          {reinvestSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <RefreshCw className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-display font-bold">Reinvestment Successful!</h2>
              <p className="text-muted-foreground text-sm">
                ৳{reinvestCost.toLocaleString()} reinvested into {selectedBatch?.name} — you now own {reinvestUnits} additional units.
              </p>
              <Button onClick={closeReinvest} className="w-full">Done</Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Reinvest Profits</DialogTitle>
                <DialogDescription>Use your wallet balance to invest in active batches</DialogDescription>
              </DialogHeader>
              <div className="space-y-5 pt-2">
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <div className="text-xs text-muted-foreground">Available to Reinvest</div>
                  <div className="text-2xl font-display font-bold">৳{balance.toLocaleString()}</div>
                </div>

                <div className="space-y-2">
                  <Label>Select Batch</Label>
                  <Select value={reinvestBatch} onValueChange={setReinvestBatch}>
                    <SelectTrigger><SelectValue placeholder="Choose a batch to reinvest in" /></SelectTrigger>
                    <SelectContent>
                      {availableBatches.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name} — ৳{b.costPerUnit}/unit
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="r-amount">Reinvest Amount (BDT)</Label>
                  <Input
                    id="r-amount"
                    type="number"
                    min={10000}
                    max={balance}
                    placeholder="Min ৳10,000"
                    value={reinvestAmount}
                    onChange={(e) => setReinvestAmount(e.target.value)}
                    className="text-lg font-semibold"
                  />
                  <div className="flex gap-2">
                    {[10000, 20000, 50000].filter(a => a <= balance).map((amt) => (
                      <Button key={amt} variant="outline" size="sm" className="text-xs" onClick={() => setReinvestAmount(amt.toString())}>
                        ৳{(amt / 1000).toFixed(0)}K
                      </Button>
                    ))}
                  </div>
                </div>

                {selectedBatch && reinvestUnits > 0 && (
                  <div className="bg-accent/50 rounded-lg p-4 border border-primary/10 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Units you'll get</span>
                      <span className="font-bold text-lg">{reinvestUnits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Actual cost</span>
                      <span className="font-semibold">৳{reinvestCost.toLocaleString()}</span>
                    </div>
                    {reinvestAmt - reinvestCost > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Remaining in wallet</span>
                        <span>৳{(balance - reinvestCost).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                )}

                {reinvestAmt > 0 && reinvestAmt < 10000 && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4" /> Minimum reinvestment is ৳10,000
                  </div>
                )}

                <Button
                  onClick={handleReinvest}
                  className="w-full"
                  size="lg"
                  disabled={!selectedBatch || reinvestAmt < 10000 || reinvestUnits <= 0 || reinvestAmt > balance}
                >
                  Reinvest ৳{reinvestCost.toLocaleString()} for {reinvestUnits} units
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Auto-Reinvest Settings Dialog ── */}
      <Dialog open={autoReinvestSettingsOpen} onOpenChange={setAutoReinvestSettingsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Auto-Reinvest Settings</DialogTitle>
            <DialogDescription>Automatically reinvest a percentage of incoming profits</DialogDescription>
          </DialogHeader>
          <div className="space-y-5 pt-2">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div>
                <div className="text-sm font-medium">Enable Auto-Reinvest</div>
                <div className="text-xs text-muted-foreground mt-0.5">Automatically reinvest when profits arrive</div>
              </div>
              <Switch checked={autoReinvest} onCheckedChange={setAutoReinvest} />
            </div>

            {autoReinvest && (
              <>
                <div className="space-y-3">
                  <Label>Reinvest Percentage</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {["25", "50", "75", "100"].map((pct) => (
                      <Button
                        key={pct}
                        variant={autoReinvestPct === pct ? "default" : "outline"}
                        size="sm"
                        onClick={() => setAutoReinvestPct(pct)}
                      >
                        {pct}%
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {autoReinvestPct}% of each profit payment will be automatically reinvested into available batches
                  </p>
                </div>

                <div className="bg-accent/50 rounded-lg p-4 border border-primary/10 space-y-2 text-sm">
                  <p className="font-medium text-accent-foreground">How it works:</p>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>• When you receive profit (e.g. ৳5,000)</li>
                    <li>• {autoReinvestPct}% (৳{((5000 * Number(autoReinvestPct)) / 100).toLocaleString()}) is automatically reinvested</li>
                    <li>• Remaining ৳{(5000 - (5000 * Number(autoReinvestPct)) / 100).toLocaleString()} stays in your wallet</li>
                    <li>• Reinvested into your most recent active batch</li>
                  </ul>
                </div>
              </>
            )}

            <Button onClick={() => setAutoReinvestSettingsOpen(false)} className="w-full" size="lg">
              {autoReinvest ? "Save Settings" : "Close"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default WalletPage;
