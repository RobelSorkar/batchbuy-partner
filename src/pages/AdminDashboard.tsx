import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import { Link } from "react-router-dom";
import {
  Users, Layers, TrendingUp, ShoppingCart, ArrowUpRight, ArrowDownRight,
  AlertTriangle, CheckCircle, Clock, Wallet, Package, Eye,
  Ban, DollarSign, BarChart3, PieChart,
  Search, XCircle, RefreshCw, Loader2, Pencil
} from "lucide-react";
import EditProjectDialog from "@/components/EditProjectDialog";
import UserDetailDialog from "@/components/UserDetailDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAdminUsers, useAdminWithdrawals, useUpdateTransactionStatus, useUpdateUserRole, useToggleUserRole, AdminUser } from "@/hooks/useAdminData";
import { useProjects } from "@/hooks/useProjects";
import { useOrders } from "@/hooks/useOrders";
import { useInventory } from "@/hooks/useInventory";
import { supabase } from "@/integrations/supabase/client";

// ── Helpers ───────────────────────────────────────────

const userStatusColors: Record<string, string> = {
  active: "bg-primary/10 text-primary",
  pending: "bg-accent text-accent-foreground",
  suspended: "bg-destructive/10 text-destructive",
};

const roleColors: Record<string, string> = {
  partner: "bg-primary/10 text-primary",
  dropshipper: "bg-accent text-accent-foreground",
  distributor: "bg-secondary text-secondary-foreground",
  admin: "bg-destructive/10 text-destructive",
  warehouse: "bg-secondary text-secondary-foreground",
};

const withdrawStatusColors: Record<string, string> = {
  pending: "bg-accent text-accent-foreground",
  completed: "bg-primary/10 text-primary",
  failed: "bg-destructive/10 text-destructive",
};

const orderStatusColors: Record<string, string> = {
  pending: "bg-secondary text-secondary-foreground",
  confirmed: "bg-accent text-accent-foreground",
  processing: "bg-accent text-accent-foreground",
  shipped: "bg-primary/10 text-primary",
  delivered: "bg-primary/10 text-primary",
  cancelled: "bg-destructive/10 text-destructive",
};

// ── Component ─────────────────────────────────────────

const AdminDashboard = ({ defaultTab = "overview", defaultRoleFilter }: { defaultTab?: string; defaultRoleFilter?: string }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [syncing, setSyncing] = useState(false);
  const [reconciling, setReconciling] = useState(false);

  const syncBatchStats = useCallback(async () => {
    setSyncing(true);
    try {
      const { error } = await supabase.rpc("admin_sync_batch_stats");
      if (error) throw error;
      toast({ title: "Project stats synced", description: "funded_units and partners_joined recalculated from source records." });
    } catch (e: any) {
      toast({ title: "Sync failed", description: e.message, variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  }, [toast]);

  const reconcileWallets = useCallback(async () => {
    setReconciling(true);
    try {
      const { data, error } = await supabase.rpc("reconcile_wallet_balances");
      if (error) throw error;
      const result = data as any;
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "Wallet reconciliation complete", description: `${result.wallets_checked} wallets checked, ${result.mismatches_fixed} mismatches fixed.` });
    } catch (e: any) {
      toast({ title: "Reconciliation failed", description: e.message, variant: "destructive" });
    } finally {
      setReconciling(false);
    }
  }, [toast, queryClient]);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState(defaultRoleFilter || "all");
  const [userDetail, setUserDetail] = useState<AdminUser | null>(null);
  const [batchSearch, setBatchSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [editingBatch, setEditingBatch] = useState<any>(null);

  // Real data hooks
  const { data: users = [], isLoading: loadingUsers } = useAdminUsers();
  const { data: batches = [], isLoading: loadingBatches } = useProjects();
  const { data: orders = [], isLoading: loadingOrders } = useOrders("admin");
  const { data: inventory = [], isLoading: loadingInventory } = useInventory();
  const { data: withdrawals = [], isLoading: loadingWithdrawals } = useAdminWithdrawals();
  const updateTxnStatus = useUpdateTransactionStatus();
  const updateUserRole = useUpdateUserRole();
  const toggleUserRole = useToggleUserRole();
  const isLoading = loadingUsers || loadingBatches || loadingOrders || loadingInventory || loadingWithdrawals;

  // Filtered data
  const filteredUsers = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(userSearch.toLowerCase());
    const matchRole = userRoleFilter === "all" || u.roles.includes(userRoleFilter);
    return matchSearch && matchRole;
  });

  const filteredBatches = (batches as any[]).filter((b) =>
    batchSearch === "" || b.product_name?.toLowerCase().includes(batchSearch.toLowerCase()) || b.batch_name?.toLowerCase().includes(batchSearch.toLowerCase())
  );

  const filteredOrders = (orders as any[]).filter((o) =>
    orderSearch === "" || o.order_number?.toLowerCase().includes(orderSearch.toLowerCase()) || o.customer_name?.toLowerCase().includes(orderSearch.toLowerCase())
  );

  // Withdrawal actions
  const processWithdrawal = async (id: string, action: "completed" | "failed") => {
    try {
      await updateTxnStatus.mutateAsync({ id, status: action });
      toast({
        title: action === "completed" ? "Withdrawal Approved" : "Withdrawal Rejected",
        variant: action === "failed" ? "destructive" : undefined,
      });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  // Computed stats
  const totalWalletBalance = users.reduce((s, u) => s + u.walletBalance, 0);
  const totalInvested = users.reduce((s, u) => s + u.totalInvested, 0);
  const totalEarned = users.reduce((s, u) => s + u.totalEarned, 0);
  const totalWarehouseStock = (inventory as any[]).reduce((s, i) => s + (i.total_stock - i.sold_units), 0);
  const totalSoldUnits = (inventory as any[]).reduce((s, i) => s + i.sold_units, 0);
  const pendingWithdrawals = (withdrawals as any[]).filter((w) => w.status === "pending");
  const pendingWithdrawalTotal = pendingWithdrawals.reduce((s: number, w: any) => s + Number(w.amount), 0);

  const batchStatusCounts = {
    funding: (batches as any[]).filter((b) => b.status === "funding").length,
    production: (batches as any[]).filter((b) => b.status === "production").length,
    completed: (batches as any[]).filter((b) => b.status === "completed").length,
  };

  const platformStats = [
    { label: "Total Users", value: users.length.toString(), change: `${users.filter(u => u.role === "partner").length} partners`, up: true, icon: Users, tab: "users" },
    { label: "Active Projects", value: (batches as any[]).length.toString(), change: `${batchStatusCounts.funding} in funding`, up: true, icon: Layers, tab: "batches" },
    { label: "Total Orders", value: (orders as any[]).length.toString(), change: `${(orders as any[]).filter((o: any) => o.status === "delivered").length} delivered`, up: true, icon: ShoppingCart, tab: "orders" },
    { label: "Platform Revenue", value: `৳${(orders as any[]).reduce((s: number, o: any) => s + Number(o.total_amount), 0).toLocaleString()}`, change: "From all orders", up: true, icon: TrendingUp, tab: "orders" },
    { label: "Total Wallets", value: `৳${totalWalletBalance.toLocaleString()}`, change: "Across all users", up: true, icon: Wallet, tab: "wallets" },
    { label: "Pending Withdrawals", value: pendingWithdrawals.length.toString(), change: `৳${pendingWithdrawalTotal.toLocaleString()} total`, up: false, icon: DollarSign, tab: "withdrawals" },
  ];

  if (isLoading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">Platform overview and management</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={reconcileWallets} disabled={reconciling}>
              <DollarSign className={`w-4 h-4 ${reconciling ? "animate-spin" : ""}`} /> {reconciling ? "Reconciling…" : "Reconcile Wallets"}
            </Button>
            <Button variant="outline" className="gap-2" onClick={syncBatchStats} disabled={syncing}>
              <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} /> {syncing ? "Syncing…" : "Sync Project Stats"}
            </Button>
            <Link to="/create-batch"><Button variant="outline" className="gap-2"><Layers className="w-4 h-4" /> Create Project</Button></Link>
            <Link to="/admin/orders"><Button className="gap-2"><ShoppingCart className="w-4 h-4" /> Manage Orders</Button></Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {platformStats.map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl p-4 shadow-card border border-border/50">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center mb-2">
                <stat.icon className="w-4 h-4 text-accent-foreground" />
              </div>
              <div className="text-xl font-display font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
              <button
                onClick={() => setActiveTab(stat.tab)}
                className={`text-[10px] font-medium mt-1 flex items-center gap-0.5 hover:underline cursor-pointer ${stat.up ? "text-primary" : "text-muted-foreground"}`}
              >
                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </button>
            </div>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="batches">Projects</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="wallets">Wallets</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals ({pendingWithdrawals.length})</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* ═══ OVERVIEW ═══ */}
          <TabsContent value="overview">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="bg-card rounded-xl shadow-card border border-border/50">
                <div className="p-5 border-b border-border/50">
                  <h2 className="font-display font-semibold text-lg">Pending Actions</h2>
                </div>
                <div className="p-5 space-y-4">
                  {pendingWithdrawals.length > 0 && (
                    <div className="flex items-start gap-3">
                      <Clock className="w-4 h-4 text-accent-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm">{pendingWithdrawals.length} withdrawal requests totaling ৳{pendingWithdrawalTotal.toLocaleString()}</p>
                        <Button variant="link" size="sm" className="px-0 h-auto text-xs" onClick={() => setActiveTab("withdrawals")}>Process →</Button>
                      </div>
                    </div>
                  )}
                  {batchStatusCounts.funding > 0 && (
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-4 h-4 text-accent-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm">{batchStatusCounts.funding} projects currently in funding</p>
                        <Button variant="link" size="sm" className="px-0 h-auto text-xs" onClick={() => setActiveTab("batches")}>Review →</Button>
                      </div>
                    </div>
                  )}
                  {(orders as any[]).filter((o: any) => o.status === "pending").length > 0 && (
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm">{(orders as any[]).filter((o: any) => o.status === "pending").length} orders awaiting confirmation</p>
                        <Button variant="link" size="sm" className="px-0 h-auto text-xs" onClick={() => setActiveTab("orders")}>View →</Button>
                      </div>
                    </div>
                  )}
                  {pendingWithdrawals.length === 0 && batchStatusCounts.funding === 0 && (
                    <p className="text-sm text-muted-foreground">No pending actions.</p>
                  )}
                </div>
              </div>

              <div className="lg:col-span-2 bg-card rounded-xl shadow-card border border-border/50">
                <div className="flex items-center justify-between p-5 border-b border-border/50">
                  <h2 className="font-display font-semibold text-lg">Recent Users</h2>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("users")}>View All</Button>
                </div>
                <div className="divide-y divide-border/30">
                  {users.slice(0, 5).map((user) => (
                    <div key={user.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{user.name}</div>
                          <div className="text-xs text-muted-foreground">{user.joined}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {user.roles.map((r) => (
                          <span key={r} className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${roleColors[r] || ""}`}>
                            {r === "dropshipper" ? "sales" : r}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                  {users.length === 0 && <div className="p-8 text-center text-muted-foreground">No users yet.</div>}
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {[
                { label: "Manage Orders", icon: ShoppingCart, href: "/admin/orders", desc: `${(orders as any[]).length} total orders` },
                { label: "Warehouse", icon: Package, href: "/warehouse", desc: `${Math.max(0, totalWarehouseStock)} units in stock` },
                { label: "Marketplace", icon: Layers, href: "/marketplace", desc: `${(batches as any[]).length} projects` },
                { label: "Create Project", icon: Layers, href: "/create-batch", desc: "Launch new production" },
              ].map((link) => (
                <Link key={link.label} to={link.href} className="bg-card rounded-xl p-5 shadow-card border border-border/50 hover:shadow-card-hover transition-all group">
                  <link.icon className="w-5 h-5 text-primary mb-2" />
                  <div className="text-sm font-semibold group-hover:text-primary transition-colors">{link.label}</div>
                  <div className="text-xs text-muted-foreground">{link.desc}</div>
                </Link>
              ))}
            </div>
          </TabsContent>

          {/* ═══ USERS ═══ */}
          <TabsContent value="users">
            <div className="bg-card rounded-xl shadow-card border border-border/50">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 border-b border-border/50 gap-3">
                <h2 className="font-display font-semibold text-lg">User Management</h2>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input placeholder="Search users..." className="pl-8 h-8 text-xs w-48" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />
                  </div>
                  <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
                    <SelectTrigger className="h-8 text-xs w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="partner">Partners</SelectItem>
                      <SelectItem value="dropshipper">Sales Partners</SelectItem>
                      <SelectItem value="distributor">Distributors</SelectItem>
                      <SelectItem value="admin">Admins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      {["User", "Role", "Status", "Joined", "Wallet", "Financed", "Earned", "Actions"].map((h) => (
                        <th key={h} className="text-left text-xs font-medium text-muted-foreground px-5 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">{user.name.charAt(0)}</div>
                            <div>
                              <div className="text-sm font-medium">{user.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-1">
                            {user.roles.map((r) => (
                              <span key={r} className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${roleColors[r] || ""}`}>
                                {r === "dropshipper" ? "sales" : r}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-5 py-4"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${userStatusColors[user.status]}`}>{user.status}</span></td>
                        <td className="px-5 py-4 text-sm text-muted-foreground">{user.joined}</td>
                        <td className="px-5 py-4 text-sm font-medium">৳{user.walletBalance.toLocaleString()}</td>
                        <td className="px-5 py-4 text-sm text-muted-foreground">৳{user.totalInvested.toLocaleString()}</td>
                        <td className="px-5 py-4 text-sm text-primary font-medium">৳{user.totalEarned.toLocaleString()}</td>
                        <td className="px-5 py-4">
                          <Button variant="ghost" size="sm" onClick={() => setUserDetail(user)}><Eye className="w-3.5 h-3.5" /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredUsers.length === 0 && <div className="p-8 text-center text-muted-foreground">No users found.</div>}
            </div>
          </TabsContent>

          {/* ═══ BATCHES ═══ */}
          <TabsContent value="batches">
            <div className="bg-card rounded-xl shadow-card border border-border/50">
              <div className="flex items-center justify-between p-5 border-b border-border/50">
                <h2 className="font-display font-semibold text-lg">Production Projects</h2>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input placeholder="Search projects..." className="pl-8 h-8 text-xs w-48" value={batchSearch} onChange={(e) => setBatchSearch(e.target.value)} />
                  </div>
                  <Link to="/create-batch"><Button size="sm">+ New Project</Button></Link>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      {["Product", "Project", "Status", "Qty", "Funded", "Progress", "Partners", "Deadline", ""].map((h) => (
                        <th key={h} className="text-left text-xs font-medium text-muted-foreground px-5 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBatches.map((b: any) => {
                      const progress = b.total_quantity > 0 ? Math.round((b.funded_units / b.total_quantity) * 100) : 0;
                      const batchStatusColors: Record<string, string> = {
                        funding: "bg-accent text-accent-foreground",
                        production: "bg-secondary text-secondary-foreground",
                        completed: "bg-primary/10 text-primary",
                        cancelled: "bg-destructive/10 text-destructive",
                        shipping: "bg-accent text-accent-foreground",
                      };
                      const canAdvanceBatch = (status: string) => {
                        return ["funding", "production", "shipping"].includes(status);
                      };
                      const nextBatchStatus: Record<string, string> = {
                        funding: "production",
                        production: "shipping",
                        shipping: "completed",
                      };
                      const nextBatchLabel: Record<string, string> = {
                        funding: "→ Production",
                        production: "→ Shipping",
                        shipping: "→ Completed",
                      };
                      return (
                        <tr key={b.id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              {b.image && b.image.startsWith("http") ? (
                                <img src={b.image} alt={b.product_name} className="w-8 h-8 rounded object-cover" />
                              ) : (
                                <span className="text-xl">{b.image || "📦"}</span>
                              )}
                              <span className="text-sm font-medium">{b.product_name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-xs text-muted-foreground">{b.batch_name}</td>
                          <td className="px-5 py-4"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${batchStatusColors[b.status] || ""}`}>{b.status}</span></td>
                          <td className="px-5 py-4 text-sm">{b.total_quantity}</td>
                          <td className="px-5 py-4 text-sm">{b.funded_units}/{b.total_quantity}</td>
                          <td className="px-5 py-4">
                            <div className="w-20">
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
                              </div>
                              <span className="text-[10px] text-muted-foreground">{progress}%</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm">{b.partners_joined}</td>
                          <td className="px-5 py-4 text-xs text-muted-foreground">{b.deadline ? new Date(b.deadline).toLocaleDateString() : "—"}</td>
                          <td className="px-5 py-4">
                            <div className="flex gap-1">
                              <Link to={`/batch/${b.id}`}><Button variant="ghost" size="sm"><Eye className="w-3.5 h-3.5" /></Button></Link>
                              <Button variant="ghost" size="sm" onClick={() => setEditingBatch(b)}><Pencil className="w-3.5 h-3.5" /></Button>
                              {canAdvanceBatch(b.status) && (
                                <Button size="sm" variant="outline" className="h-7 text-[10px] px-2"
                                  onClick={async () => {
                                    const next = nextBatchStatus[b.status];
                                    try {
                                      const { error } = await supabase.from("batches").update({ status: next }).eq("id", b.id);
                                      if (error) throw error;
                                      toast({ title: `${b.batch_name} → ${next}` });
                                      queryClient.invalidateQueries({ queryKey: ["batches"] });
                                    } catch (e: any) {
                                      toast({ title: "Error", description: e.message, variant: "destructive" });
                                    }
                                  }}>
                                  {nextBatchLabel[b.status]}
                                </Button>
                              )}
                              {b.status === "funding" && (
                                <Button size="sm" variant="ghost" className="h-7 text-[10px] px-2 text-destructive"
                                  onClick={async () => {
                                    try {
                                      const { error } = await supabase.from("batches").update({ status: "cancelled" }).eq("id", b.id);
                                      if (error) throw error;
                                      toast({ title: `${b.batch_name} cancelled`, variant: "destructive" });
                                      queryClient.invalidateQueries({ queryKey: ["batches"] });
                                    } catch (e: any) {
                                      toast({ title: "Error", description: e.message, variant: "destructive" });
                                    }
                                  }}>
                                  <Ban className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filteredBatches.length === 0 && <div className="p-8 text-center text-muted-foreground">No projects found.</div>}
            </div>
          </TabsContent>

          {/* ═══ INVENTORY ═══ */}
          <TabsContent value="inventory">
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
                    {(inventory as any[]).map((item: any) => {
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
              {(inventory as any[]).length === 0 && <div className="p-8 text-center text-muted-foreground">No inventory records yet.</div>}
              {(inventory as any[]).length > 0 && (
                <div className="p-5 border-t border-border/50 grid grid-cols-3 gap-4">
                  <div className="bg-muted/30 rounded-lg p-3 text-center">
                    <div className="text-2xl font-display font-bold">{(inventory as any[]).reduce((s: number, i: any) => s + i.total_stock, 0).toLocaleString()}</div>
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
          </TabsContent>

          {/* ═══ ORDERS ═══ */}
          <TabsContent value="orders">
            <div className="bg-card rounded-xl shadow-card border border-border/50">
              <div className="flex items-center justify-between p-5 border-b border-border/50">
                <h2 className="font-display font-semibold text-lg">Recent Orders</h2>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input placeholder="Search orders..." className="pl-8 h-8 text-xs w-48" value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} />
                  </div>
                  <Link to="/admin/orders"><Button size="sm">Full Management →</Button></Link>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      {["Order #", "Customer", "Items", "Amount", "Channel", "Status", "Date", "Actions"].map((h) => (
                        <th key={h} className="text-left text-xs font-medium text-muted-foreground px-5 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.slice(0, 10).map((o: any) => {
                      const canAdvance = !["delivered", "cancelled"].includes(o.status);
                      const nextStatusMap: Record<string, string> = {
                        pending: "confirmed",
                        confirmed: "processing",
                        processing: "packed",
                        packed: "shipped",
                        shipped: "out_for_delivery",
                        out_for_delivery: "delivered",
                      };
                      const nextStatus = nextStatusMap[o.status];
                      return (
                        <tr key={o.id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="px-5 py-4 text-sm font-mono font-medium">{o.order_number}</td>
                          <td className="px-5 py-4 text-sm text-muted-foreground">{o.customer_name}</td>
                          <td className="px-5 py-4 text-xs text-muted-foreground">{(o.order_items || []).map((i: any) => i.product_name).join(", ") || "—"}</td>
                          <td className="px-5 py-4 text-sm font-semibold">৳{Number(o.total_amount).toLocaleString()}</td>
                          <td className="px-5 py-4"><span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground capitalize">{{ dropshipper: "Sales Partner", dropship: "Sales Partner", platform: "Platform", retail: "Retail", distributor: "Distributor" }[o.channel] || o.channel}</span></td>
                          <td className="px-5 py-4"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${orderStatusColors[o.status] || ""}`}>{o.status}</span></td>
                          <td className="px-5 py-4 text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                          <td className="px-5 py-4">
                            <div className="flex gap-1">
                              {canAdvance && nextStatus && (
                                <Button size="sm" variant="outline" className="h-6 text-[10px] px-2"
                                  onClick={async () => {
                                    try {
                                      await supabase.from("orders").update({ status: nextStatus }).eq("id", o.id);
                                      toast({ title: `Order ${o.order_number} → ${nextStatus}` });
                                      queryClient.invalidateQueries({ queryKey: ["orders"] });
                                    } catch (e: any) {
                                      toast({ title: "Error", description: e.message, variant: "destructive" });
                                    }
                                  }}>
                                  {nextStatus === "confirmed" ? "Approve" : nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
                                </Button>
                              )}
                              {canAdvance && o.status !== "cancelled" && (
                                <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2 text-destructive"
                                  onClick={async () => {
                                    try {
                                      await supabase.from("orders").update({ status: "cancelled" }).eq("id", o.id);
                                      toast({ title: `Order ${o.order_number} cancelled`, variant: "destructive" });
                                      queryClient.invalidateQueries({ queryKey: ["orders"] });
                                    } catch (e: any) {
                                      toast({ title: "Error", description: e.message, variant: "destructive" });
                                    }
                                  }}>
                                  <XCircle className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filteredOrders.length === 0 && <div className="p-8 text-center text-muted-foreground">No orders found.</div>}
            </div>
          </TabsContent>

          {/* ═══ WALLETS ═══ */}
          <TabsContent value="wallets">
            <div className="bg-card rounded-xl shadow-card border border-border/50">
              <div className="p-5 border-b border-border/50">
                <h2 className="font-display font-semibold text-lg">User Wallets</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      {["User", "Role", "Balance", "Total Invested", "Total Earned"].map((h) => (
                        <th key={h} className="text-left text-xs font-medium text-muted-foreground px-5 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.filter(u => u.role !== "admin").map((user) => (
                      <tr key={user.id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">{user.name.charAt(0)}</div>
                            <div className="text-sm font-medium">{user.name}</div>
                          </div>
                        </td>
                        <td className="px-5 py-4"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${roleColors[user.role] || ""}`}>{user.role}</span></td>
                        <td className="px-5 py-4 text-sm font-bold">৳{user.walletBalance.toLocaleString()}</td>
                        <td className="px-5 py-4 text-sm">৳{user.totalInvested.toLocaleString()}</td>
                        <td className="px-5 py-4 text-sm text-primary font-medium">৳{user.totalEarned.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-5 border-t border-border/50 grid grid-cols-3 gap-4">
                <div className="bg-muted/30 rounded-lg p-3 text-center">
                  <div className="text-xl font-display font-bold">৳{totalWalletBalance.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Total Balance</div>
                </div>
                <div className="bg-muted/30 rounded-lg p-3 text-center">
                  <div className="text-xl font-display font-bold">৳{totalInvested.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Total Invested</div>
                </div>
                <div className="bg-primary/5 rounded-lg p-3 text-center">
                  <div className="text-xl font-display font-bold text-primary">৳{totalEarned.toLocaleString()}</div>
                  <div className="text-xs text-primary">Total Earned</div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ═══ WITHDRAWALS ═══ */}
          <TabsContent value="withdrawals">
            <div className="bg-card rounded-xl shadow-card border border-border/50">
              <div className="p-5 border-b border-border/50">
                <h2 className="font-display font-semibold text-lg">Withdrawal Requests</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      {["ID", "Amount", "Description", "Status", "Date", "Actions"].map((h) => (
                        <th key={h} className="text-left text-xs font-medium text-muted-foreground px-5 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(withdrawals as any[]).map((w: any) => (
                      <tr key={w.id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-4 text-sm font-mono">{w.id.slice(0, 8)}</td>
                        <td className="px-5 py-4 text-sm font-bold">৳{Number(w.amount).toLocaleString()}</td>
                        <td className="px-5 py-4 text-xs text-muted-foreground">{w.description || "—"}</td>
                        <td className="px-5 py-4"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${withdrawStatusColors[w.status] || ""}`}>{w.status}</span></td>
                        <td className="px-5 py-4 text-xs text-muted-foreground">{new Date(w.created_at).toLocaleDateString()}</td>
                        <td className="px-5 py-4">
                          {w.status === "pending" ? (
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" className="text-primary h-7 text-xs" onClick={() => processWithdrawal(w.id, "completed")}>
                                <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                              </Button>
                              <Button size="sm" variant="ghost" className="text-destructive h-7 text-xs" onClick={() => processWithdrawal(w.id, "failed")}>
                                <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {(withdrawals as any[]).length === 0 && <div className="p-8 text-center text-muted-foreground">No withdrawal requests.</div>}
            </div>
          </TabsContent>

          {/* ═══ REPORTS ═══ */}
          <TabsContent value="reports">
            <div className="space-y-6">
              <div className="bg-card rounded-xl shadow-card border border-border/50 p-5">
                <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" /> Financial Summary
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Total Order Revenue", value: `৳${(orders as any[]).reduce((s: number, o: any) => s + Number(o.total_amount), 0).toLocaleString()}`, sub: `${(orders as any[]).length} orders` },
                    { label: "Total Commissions", value: `৳${(orders as any[]).reduce((s: number, o: any) => s + Number(o.commission || 0), 0).toLocaleString()}`, sub: "Paid to sellers" },
                    { label: "Total Wallet Balance", value: `৳${totalWalletBalance.toLocaleString()}`, sub: `${users.length} users` },
                    { label: "Total Invested", value: `৳${totalInvested.toLocaleString()}`, sub: "In production batches" },
                  ].map((item) => (
                    <div key={item.label} className="bg-muted/30 rounded-lg p-4">
                      <div className="text-xs text-muted-foreground">{item.label}</div>
                      <div className="text-xl font-display font-bold mt-1">{item.value}</div>
                      <div className="text-[10px] text-muted-foreground mt-1">{item.sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-card rounded-xl shadow-card border border-border/50 p-5">
                  <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-primary" /> User Breakdown
                  </h2>
                  <div className="space-y-3">
                    {[
                      { label: "Production Partners", count: users.filter((u) => u.role === "partner").length, color: "bg-primary" },
                      { label: "Sales Partners", count: users.filter((u) => u.role === "dropshipper").length, color: "bg-accent" },
                      { label: "Distributors", count: users.filter((u) => u.role === "distributor").length, color: "bg-secondary" },
                      { label: "Warehouse", count: users.filter((u) => u.role === "warehouse").length, color: "bg-muted" },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{item.label}</span>
                          <span className="font-medium">{item.count} ({users.length > 0 ? ((item.count / users.length) * 100).toFixed(0) : 0}%)</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${item.color}`} style={{ width: `${users.length > 0 ? (item.count / users.length) * 100 : 0}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-card rounded-xl shadow-card border border-border/50 p-5">
                  <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-primary" /> Batch Status
                  </h2>
                  <div className="space-y-3">
                    {[
                      { label: "Funding", count: batchStatusCounts.funding, color: "bg-accent" },
                      { label: "In Production", count: batchStatusCounts.production, color: "bg-secondary" },
                      { label: "Completed", count: batchStatusCounts.completed, color: "bg-primary" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${item.color}`} />
                          <span className="text-sm">{item.label}</span>
                        </div>
                        <span className="text-lg font-display font-bold">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl shadow-card border border-border/50 p-5">
                <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-primary" /> Order Analytics
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {[
                    { label: "Total Orders", value: (orders as any[]).length },
                    { label: "Delivered", value: (orders as any[]).filter((o: any) => o.status === "delivered").length },
                    { label: "In Transit", value: (orders as any[]).filter((o: any) => ["shipped", "out_for_delivery"].includes(o.status)).length },
                    { label: "Processing", value: (orders as any[]).filter((o: any) => ["pending", "confirmed", "processing", "packed"].includes(o.status)).length },
                    { label: "Cancelled", value: (orders as any[]).filter((o: any) => o.status === "cancelled").length },
                  ].map((item) => (
                    <div key={item.label} className="bg-muted/30 rounded-lg p-3 text-center">
                      <div className="text-2xl font-display font-bold">{item.value}</div>
                      <div className="text-xs text-muted-foreground">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* User Detail Dialog */}
        <UserDetailDialog
          user={userDetail}
          open={!!userDetail}
          onOpenChange={(open) => { if (!open) { setUserDetail(null); setEditingRole(null); } }}
          onUserUpdate={(updatedUser) => setUserDetail(updatedUser)}
        />
        <EditBatchDialog batch={editingBatch} open={!!editingBatch} onOpenChange={(o) => !o && setEditingBatch(null)} />
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
