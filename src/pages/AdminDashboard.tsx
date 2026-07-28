import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import { Link } from "react-router-dom";
import { Users, Layers, TrendingUp, ShoppingCart, ArrowUpRight, ArrowDownRight, Wallet, DollarSign, RefreshCw, Loader2 } from "lucide-react";
import EditProjectDialog from "@/components/EditProjectDialog";
import UserDetailDialog from "@/components/UserDetailDialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/utils";
import { useAdminUsers, useAdminWithdrawals, AdminUser } from "@/hooks/useAdminData";
import { useProjects, ProjectRow } from "@/hooks/useProjects";
import { useOrders } from "@/hooks/useOrders";
import { useInventory } from "@/hooks/useInventory";
import { supabase } from "@/integrations/supabase/client";
import AdminOverviewTab from "./admin/AdminOverviewTab";
import AdminUsersTab from "./admin/AdminUsersTab";
import AdminProjectsTab from "./admin/AdminProjectsTab";
import AdminInventoryTab from "./admin/AdminInventoryTab";
import AdminOrdersTab from "./admin/AdminOrdersTab";
import AdminWalletsTab from "./admin/AdminWalletsTab";
import AdminWithdrawalsTab from "./admin/AdminWithdrawalsTab";
import AdminReportsTab from "./admin/AdminReportsTab";

const AdminDashboard = ({ defaultTab = "overview", defaultRoleFilter }: { defaultTab?: string; defaultRoleFilter?: string }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [syncing, setSyncing] = useState(false);
  const [reconciling, setReconciling] = useState(false);
  const [userDetail, setUserDetail] = useState<AdminUser | null>(null);
  const [editingProject, setEditingProject] = useState<ProjectRow | null>(null);

  const syncBatchStats = useCallback(async () => {
    setSyncing(true);
    try {
      const { error } = await supabase.rpc("admin_sync_batch_stats");
      if (error) throw error;
      toast({ title: "Project stats synced", description: "funded_units and partners_joined recalculated from source records." });
    } catch (e) {
      toast({ title: "Sync failed", description: getErrorMessage(e), variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  }, [toast]);

  const reconcileWallets = useCallback(async () => {
    setReconciling(true);
    try {
      const { data, error } = await supabase.rpc("reconcile_wallet_balances");
      if (error) throw error;
      const result = data as { wallets_checked: number; mismatches_fixed: number };
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "Wallet reconciliation complete", description: `${result.wallets_checked} wallets checked, ${result.mismatches_fixed} mismatches fixed.` });
    } catch (e) {
      toast({ title: "Reconciliation failed", description: getErrorMessage(e), variant: "destructive" });
    } finally {
      setReconciling(false);
    }
  }, [toast, queryClient]);

  // Real data hooks
  const { data: users = [], isLoading: loadingUsers } = useAdminUsers();
  const { data: batches = [], isLoading: loadingBatches } = useProjects();
  const { data: orders = [], isLoading: loadingOrders } = useOrders("admin");
  const { data: inventory = [], isLoading: loadingInventory } = useInventory();
  const { data: withdrawals = [], isLoading: loadingWithdrawals } = useAdminWithdrawals();
  const isLoading = loadingUsers || loadingBatches || loadingOrders || loadingInventory || loadingWithdrawals;

  // Computed stats shared across tabs
  const totalWalletBalance = users.reduce((s, u) => s + u.walletBalance, 0);
  const totalInvested = users.reduce((s, u) => s + u.totalInvested, 0);
  const totalEarned = users.reduce((s, u) => s + u.totalEarned, 0);
  const totalWarehouseStock = inventory.reduce((s, i) => s + (i.total_stock - i.sold_units), 0);
  const totalSoldUnits = inventory.reduce((s, i) => s + i.sold_units, 0);
  const pendingWithdrawals = withdrawals.filter((w) => w.status === "pending");
  const pendingWithdrawalTotal = pendingWithdrawals.reduce((s, w) => s + Number(w.amount), 0);

  const projectStatusCounts = {
    funding: batches.filter((b) => b.status === "funding").length,
    production: batches.filter((b) => b.status === "production").length,
    completed: batches.filter((b) => b.status === "completed").length,
  };

  const platformStats = [
    { label: "Total Users", value: users.length.toString(), change: `${users.filter((u) => u.role === "partner").length} partners`, up: true, icon: Users, tab: "users" },
    { label: "Active Projects", value: batches.length.toString(), change: `${projectStatusCounts.funding} in funding`, up: true, icon: Layers, tab: "batches" },
    { label: "Total Orders", value: orders.length.toString(), change: `${orders.filter((o) => o.status === "delivered").length} delivered`, up: true, icon: ShoppingCart, tab: "orders" },
    { label: "Platform Revenue", value: `৳${orders.reduce((s, o) => s + Number(o.total_amount), 0).toLocaleString()}`, change: "From all orders", up: true, icon: TrendingUp, tab: "orders" },
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

          <TabsContent value="overview">
            <AdminOverviewTab
              pendingWithdrawalsCount={pendingWithdrawals.length}
              pendingWithdrawalTotal={pendingWithdrawalTotal}
              projectStatusCounts={projectStatusCounts}
              orders={orders}
              users={users}
              batches={batches}
              totalWarehouseStock={totalWarehouseStock}
              onNavigateTab={setActiveTab}
            />
          </TabsContent>

          <TabsContent value="users">
            <AdminUsersTab users={users} defaultRoleFilter={defaultRoleFilter} onSelectUser={setUserDetail} />
          </TabsContent>

          <TabsContent value="batches">
            <AdminProjectsTab batches={batches} onEditProject={setEditingProject} />
          </TabsContent>

          <TabsContent value="inventory">
            <AdminInventoryTab inventory={inventory} totalWarehouseStock={totalWarehouseStock} totalSoldUnits={totalSoldUnits} />
          </TabsContent>

          <TabsContent value="orders">
            <AdminOrdersTab orders={orders} />
          </TabsContent>

          <TabsContent value="wallets">
            <AdminWalletsTab users={users} totalWalletBalance={totalWalletBalance} totalInvested={totalInvested} totalEarned={totalEarned} />
          </TabsContent>

          <TabsContent value="withdrawals">
            <AdminWithdrawalsTab withdrawals={withdrawals} />
          </TabsContent>

          <TabsContent value="reports">
            <AdminReportsTab orders={orders} users={users} totalWalletBalance={totalWalletBalance} totalInvested={totalInvested} projectStatusCounts={projectStatusCounts} />
          </TabsContent>
        </Tabs>

        {/* User Detail Dialog */}
        <UserDetailDialog
          user={userDetail}
          open={!!userDetail}
          onOpenChange={(open) => { if (!open) { setUserDetail(null); } }}
          onUserUpdate={(updatedUser) => setUserDetail(updatedUser)}
        />
        <EditProjectDialog batch={editingProject} open={!!editingProject} onOpenChange={(o) => !o && setEditingProject(null)} />
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
