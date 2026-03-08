import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Link } from "react-router-dom";
import {
  Users, Layers, TrendingUp, ShoppingCart, ArrowUpRight, ArrowDownRight,
  AlertTriangle, CheckCircle, Clock, Wallet, Package, Truck, Eye,
  Ban, MoreHorizontal, DollarSign, BarChart3, PieChart, ArrowRight,
  Search, Download, XCircle, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockBatches } from "@/data/mockBatches";
import { mockOrders, statusMeta } from "@/data/orders";
import { useToast } from "@/hooks/use-toast";

// ── Mock Data ─────────────────────────────────────────

const platformStats = [
  { label: "Total Users", value: "1,247", change: "+82 this month", up: true, icon: Users },
  { label: "Active Batches", value: "12", change: "3 in funding", up: true, icon: Layers },
  { label: "Platform Revenue", value: "৳4.2Cr", change: "+23% MoM", up: true, icon: TrendingUp },
  { label: "Total Orders", value: "3,841", change: "+312 this week", up: true, icon: ShoppingCart },
  { label: "Total Wallets", value: "৳28.5L", change: "Across partners", up: true, icon: Wallet },
  { label: "Pending Withdrawals", value: "7", change: "৳1.82L total", up: false, icon: DollarSign },
];

interface MockUser {
  id: string;
  name: string;
  email: string;
  role: "partner" | "dropshipper" | "distributor" | "admin";
  joined: string;
  status: "active" | "pending" | "suspended";
  totalInvested?: number;
  totalEarned?: number;
  walletBalance?: number;
}

const mockUsers: MockUser[] = [
  { id: "u1", name: "Rahim Ahmed", email: "rahim@email.com", role: "partner", joined: "2026-01-15", status: "active", totalInvested: 250000, totalEarned: 87000, walletBalance: 42300 },
  { id: "u2", name: "Fatima Khatun", email: "fatima@email.com", role: "partner", joined: "2026-02-01", status: "active", totalInvested: 180000, totalEarned: 54000, walletBalance: 31200 },
  { id: "u3", name: "Kamal Hossain", email: "kamal@email.com", role: "partner", joined: "2026-02-20", status: "active", totalInvested: 320000, totalEarned: 112000, walletBalance: 68500 },
  { id: "u4", name: "Sakib Hasan", email: "sakib@email.com", role: "dropshipper", joined: "2026-01-20", status: "active", totalEarned: 34200, walletBalance: 12800 },
  { id: "u5", name: "Nadia Akter", email: "nadia@email.com", role: "dropshipper", joined: "2026-02-10", status: "active", totalEarned: 28700, walletBalance: 9400 },
  { id: "u6", name: "Jamal Uddin", email: "jamal@email.com", role: "dropshipper", joined: "2026-03-01", status: "suspended", totalEarned: 4500, walletBalance: 1200 },
  { id: "u7", name: "Metro Mart BD", email: "metro@email.com", role: "distributor", joined: "2025-11-05", status: "active", totalInvested: 580000, totalEarned: 195000, walletBalance: 82000 },
  { id: "u8", name: "Fashion Hub Ltd", email: "fashion@email.com", role: "distributor", joined: "2025-12-10", status: "active", totalInvested: 420000, totalEarned: 140000, walletBalance: 55000 },
  { id: "u9", name: "Nasrin Begum", email: "nasrin@email.com", role: "partner", joined: "2026-03-02", status: "pending", totalInvested: 0, totalEarned: 0, walletBalance: 0 },
  { id: "u10", name: "Admin User", email: "admin@prodpartner.com", role: "admin", joined: "2025-01-01", status: "active" },
];

interface WithdrawRequest {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  method: string;
  account: string;
  status: "pending" | "approved" | "rejected" | "processing" | "completed";
  requestedAt: string;
}

const mockWithdrawals: WithdrawRequest[] = [
  { id: "W-101", userId: "u1", userName: "Rahim Ahmed", amount: 25000, method: "bKash", account: "01712345678", status: "pending", requestedAt: "Mar 8, 2026" },
  { id: "W-102", userId: "u3", userName: "Kamal Hossain", amount: 50000, method: "Bank Transfer", account: "DBBL ****4521", status: "pending", requestedAt: "Mar 7, 2026" },
  { id: "W-103", userId: "u2", userName: "Fatima Khatun", amount: 15000, method: "Nagad", account: "01898765432", status: "pending", requestedAt: "Mar 7, 2026" },
  { id: "W-104", userId: "u4", userName: "Sakib Hasan", amount: 10000, method: "bKash", account: "01555667788", status: "processing", requestedAt: "Mar 6, 2026" },
  { id: "W-105", userId: "u7", userName: "Metro Mart BD", amount: 82000, method: "Bank Transfer", account: "EBL ****7890", status: "completed", requestedAt: "Mar 5, 2026" },
  { id: "W-106", userId: "u5", userName: "Nadia Akter", amount: 5000, method: "Rocket", account: "01666778899", status: "approved", requestedAt: "Mar 6, 2026" },
  { id: "W-107", userId: "u8", userName: "Fashion Hub Ltd", amount: 35000, method: "Bank Transfer", account: "BRAC ****1234", status: "rejected", requestedAt: "Mar 4, 2026" },
];

const warehouseProducts = [
  { name: "Premium Cotton T-Shirt", totalProduced: 500, inStock: 408, sold: 92, warehouse: "Gazipur Central" },
  { name: "Organic Skincare Set", totalProduced: 300, inStock: 255, sold: 45, warehouse: "Chattogram Hub" },
  { name: "Handcrafted Leather Wallet", totalProduced: 200, inStock: 148, sold: 52, warehouse: "Dhaka Central" },
  { name: "Bamboo Kitchen Utensils", totalProduced: 800, inStock: 676, sold: 124, warehouse: "Sylhet Eco Hub" },
  { name: "Wireless Earbuds Pro", totalProduced: 150, inStock: 150, sold: 0, warehouse: "Dhaka Tech WH" },
  { name: "Artisan Coffee Blend", totalProduced: 1000, inStock: 120, sold: 0, warehouse: "Rangpur Cold" },
];

const pendingActions = [
  { text: "3 new batch proposals awaiting approval", type: "warning", action: "Review", link: "/admin/batches" },
  { text: "7 withdrawal requests totaling ৳182,000", type: "warning", action: "Process" },
  { text: "Batch #42 production completed — verify delivery", type: "info", action: "Verify" },
  { text: "2 user reports pending review", type: "alert", action: "Review" },
  { text: "1 suspended user appeal received", type: "alert", action: "Review" },
];

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
};

const withdrawStatusColors: Record<string, string> = {
  pending: "bg-accent text-accent-foreground",
  approved: "bg-primary/10 text-primary",
  processing: "bg-secondary text-secondary-foreground",
  completed: "bg-primary/10 text-primary",
  rejected: "bg-destructive/10 text-destructive",
};

// ── Component ─────────────────────────────────────────

const AdminDashboard = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState(mockUsers);
  const [withdrawals, setWithdrawals] = useState(mockWithdrawals);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userDetail, setUserDetail] = useState<MockUser | null>(null);
  const [withdrawDetail, setWithdrawDetail] = useState<WithdrawRequest | null>(null);
  const [batchSearch, setBatchSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");

  // Filtered data
  const filteredUsers = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchRole = userRoleFilter === "all" || u.role === userRoleFilter;
    return matchSearch && matchRole;
  });

  const filteredBatches = mockBatches.filter((b) =>
    batchSearch === "" || b.productName.toLowerCase().includes(batchSearch.toLowerCase()) || b.batchName.toLowerCase().includes(batchSearch.toLowerCase())
  );

  const filteredOrders = mockOrders.filter((o) =>
    orderSearch === "" || o.id.toLowerCase().includes(orderSearch.toLowerCase()) || o.customerName.toLowerCase().includes(orderSearch.toLowerCase())
  );

  // User actions
  const toggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        const next = u.status === "suspended" ? "active" : "suspended";
        toast({ title: `User ${next === "suspended" ? "Suspended" : "Activated"}`, description: u.name });
        return { ...u, status: next };
      })
    );
  };

  const approveUser = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        toast({ title: "User Approved", description: u.name });
        return { ...u, status: "active" };
      })
    );
  };

  // Withdraw actions
  const processWithdrawal = (id: string, action: "approved" | "rejected") => {
    setWithdrawals((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w;
        toast({
          title: action === "approved" ? "Withdrawal Approved" : "Withdrawal Rejected",
          description: `${w.id} — ৳${w.amount.toLocaleString()} for ${w.userName}`,
          variant: action === "rejected" ? "destructive" : undefined,
        });
        return { ...w, status: action };
      })
    );
    setWithdrawDetail(null);
  };

  // Report data
  const totalInvested = users.reduce((s, u) => s + (u.totalInvested || 0), 0);
  const totalEarned = users.reduce((s, u) => s + (u.totalEarned || 0), 0);
  const totalWalletBalance = users.reduce((s, u) => s + (u.walletBalance || 0), 0);
  const totalWarehouseStock = warehouseProducts.reduce((s, p) => s + p.inStock, 0);
  const totalSoldUnits = warehouseProducts.reduce((s, p) => s + p.sold, 0);
  const batchStatusCounts = {
    funding: mockBatches.filter((b) => b.status === "funding").length,
    production: mockBatches.filter((b) => b.status === "production").length,
    completed: mockBatches.filter((b) => b.status === "completed").length,
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">Platform overview and management</p>
          </div>
          <div className="flex gap-2">
            <Link to="/create-batch">
              <Button variant="outline" className="gap-2"><Layers className="w-4 h-4" /> Create Batch</Button>
            </Link>
            <Link to="/admin/orders">
              <Button className="gap-2"><ShoppingCart className="w-4 h-4" /> Manage Orders</Button>
            </Link>
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
              <div className={`text-[10px] font-medium mt-1 flex items-center gap-0.5 ${stat.up ? "text-primary" : "text-muted-foreground"}`}>
                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </div>
            </div>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="batches">Batches</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="wallets">Wallets</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals ({withdrawals.filter((w) => w.status === "pending").length})</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* ═══ OVERVIEW ═══ */}
          <TabsContent value="overview">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Pending Actions */}
              <div className="bg-card rounded-xl shadow-card border border-border/50">
                <div className="p-5 border-b border-border/50">
                  <h2 className="font-display font-semibold text-lg">Pending Actions</h2>
                </div>
                <div className="p-5 space-y-4">
                  {pendingActions.map((action, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {action.type === "alert" ? <AlertTriangle className="w-4 h-4 text-destructive" /> :
                          action.type === "warning" ? <Clock className="w-4 h-4 text-accent-foreground" /> :
                            <CheckCircle className="w-4 h-4 text-primary" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{action.text}</p>
                        <Button variant="link" size="sm" className="px-0 h-auto text-xs">{action.action} →</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Users */}
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
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${roleColors[user.role]}`}>{user.role}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${userStatusColors[user.status]}`}>{user.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick links */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {[
                { label: "Manage Orders", icon: ShoppingCart, href: "/admin/orders", desc: `${mockOrders.length} total orders` },
                { label: "Warehouse", icon: Package, href: "/warehouse", desc: `${totalWarehouseStock} units in stock` },
                { label: "Marketplace", icon: Layers, href: "/marketplace", desc: `${mockBatches.length} active batches` },
                { label: "Create Batch", icon: Layers, href: "/create-batch", desc: "Launch new production" },
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
                      <SelectItem value="dropshipper">Dropshippers</SelectItem>
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
                      {["User", "Role", "Status", "Joined", "Wallet", "Invested", "Earned", "Actions"].map((h) => (
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
                              <div className="text-xs text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${roleColors[user.role]}`}>{user.role}</span></td>
                        <td className="px-5 py-4"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${userStatusColors[user.status]}`}>{user.status}</span></td>
                        <td className="px-5 py-4 text-sm text-muted-foreground">{user.joined}</td>
                        <td className="px-5 py-4 text-sm font-medium">৳{(user.walletBalance || 0).toLocaleString()}</td>
                        <td className="px-5 py-4 text-sm text-muted-foreground">৳{(user.totalInvested || 0).toLocaleString()}</td>
                        <td className="px-5 py-4 text-sm text-primary font-medium">৳{(user.totalEarned || 0).toLocaleString()}</td>
                        <td className="px-5 py-4">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => setUserDetail(user)}><Eye className="w-3.5 h-3.5" /></Button>
                            {user.status === "pending" && <Button variant="ghost" size="sm" className="text-primary" onClick={() => approveUser(user.id)}><CheckCircle className="w-3.5 h-3.5" /></Button>}
                            {user.role !== "admin" && (
                              <Button variant="ghost" size="sm" className={user.status === "suspended" ? "text-primary" : "text-destructive"} onClick={() => toggleUserStatus(user.id)}>
                                {user.status === "suspended" ? <RefreshCw className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* ═══ BATCHES ═══ */}
          <TabsContent value="batches">
            <div className="bg-card rounded-xl shadow-card border border-border/50">
              <div className="flex items-center justify-between p-5 border-b border-border/50">
                <h2 className="font-display font-semibold text-lg">Production Batches</h2>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input placeholder="Search batches..." className="pl-8 h-8 text-xs w-48" value={batchSearch} onChange={(e) => setBatchSearch(e.target.value)} />
                  </div>
                  <Link to="/create-batch"><Button size="sm">+ New Batch</Button></Link>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      {["Product", "Batch", "Status", "Qty", "Funded", "Progress", "Partners", "Deadline", ""].map((h) => (
                        <th key={h} className="text-left text-xs font-medium text-muted-foreground px-5 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBatches.map((b) => {
                      const progress = Math.round((b.fundedUnits / b.totalQuantity) * 100);
                      const batchStatusColors: Record<string, string> = {
                        funding: "bg-accent text-accent-foreground",
                        production: "bg-secondary text-secondary-foreground",
                        completed: "bg-primary/10 text-primary",
                        shipping: "bg-muted text-muted-foreground",
                        draft: "bg-muted text-muted-foreground",
                        cancelled: "bg-destructive/10 text-destructive",
                      };
                      return (
                        <tr key={b.id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{b.image}</span>
                              <span className="text-sm font-medium">{b.productName}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-xs text-muted-foreground">{b.batchName}</td>
                          <td className="px-5 py-4"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${batchStatusColors[b.status]}`}>{b.status}</span></td>
                          <td className="px-5 py-4 text-sm">{b.totalQuantity}</td>
                          <td className="px-5 py-4 text-sm">{b.fundedUnits}/{b.totalQuantity}</td>
                          <td className="px-5 py-4">
                            <div className="w-20">
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
                              </div>
                              <span className="text-[10px] text-muted-foreground">{progress}%</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm">{b.partnersJoined}</td>
                          <td className="px-5 py-4 text-xs text-muted-foreground">{b.deadline}</td>
                          <td className="px-5 py-4">
                            <Link to={`/batch/${b.id}`}><Button variant="ghost" size="sm"><Eye className="w-3.5 h-3.5" /></Button></Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
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
                      {["Product", "Total Produced", "In Stock", "Sold", "Warehouse", "Stock Level"].map((h) => (
                        <th key={h} className="text-left text-xs font-medium text-muted-foreground px-5 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {warehouseProducts.map((p) => {
                      const pct = (p.inStock / p.totalProduced) * 100;
                      const isLow = pct < 25;
                      return (
                        <tr key={p.name} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="px-5 py-4 text-sm font-medium">{p.name}</td>
                          <td className="px-5 py-4 text-sm">{p.totalProduced}</td>
                          <td className="px-5 py-4 text-sm font-semibold">{p.inStock}</td>
                          <td className="px-5 py-4 text-sm text-primary font-medium">{p.sold}</td>
                          <td className="px-5 py-4 text-xs text-muted-foreground">{p.warehouse}</td>
                          <td className="px-5 py-4">
                            <div className="w-20">
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${isLow ? "bg-destructive" : "bg-primary"}`} style={{ width: `${pct}%` }} />
                              </div>
                              <span className={`text-[10px] ${isLow ? "text-destructive" : "text-muted-foreground"}`}>{pct.toFixed(0)}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="p-5 border-t border-border/50 grid grid-cols-3 gap-4">
                <div className="bg-muted/30 rounded-lg p-3 text-center">
                  <div className="text-2xl font-display font-bold">{warehouseProducts.reduce((s, p) => s + p.totalProduced, 0).toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Total Produced</div>
                </div>
                <div className="bg-muted/30 rounded-lg p-3 text-center">
                  <div className="text-2xl font-display font-bold">{totalWarehouseStock.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">In Stock</div>
                </div>
                <div className="bg-primary/5 rounded-lg p-3 text-center">
                  <div className="text-2xl font-display font-bold text-primary">{totalSoldUnits.toLocaleString()}</div>
                  <div className="text-xs text-primary">Total Sold</div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ═══ ORDERS ═══ */}
          <TabsContent value="orders">
            <div className="bg-card rounded-xl shadow-card border border-border/50">
              <div className="flex items-center justify-between p-5 border-b border-border/50">
                <h2 className="font-display font-semibold text-lg">Recent Orders</h2>
                <Link to="/admin/orders"><Button size="sm">Full Order Management →</Button></Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      {["Order ID", "Product", "Customer", "Qty", "Amount", "Source", "Status", "Date"].map((h) => (
                        <th key={h} className="text-left text-xs font-medium text-muted-foreground px-5 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mockOrders.slice(0, 6).map((o) => {
                      const meta = statusMeta[o.status];
                      return (
                        <tr key={o.id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="px-5 py-4 text-sm font-mono font-medium">{o.id}</td>
                          <td className="px-5 py-4 text-sm">{o.productName}</td>
                          <td className="px-5 py-4 text-sm text-muted-foreground">{o.customerName}</td>
                          <td className="px-5 py-4 text-sm">{o.quantity}</td>
                          <td className="px-5 py-4 text-sm font-semibold">৳{(o.retailPrice * o.quantity).toLocaleString()}</td>
                          <td className="px-5 py-4"><span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground capitalize">{o.source}</span></td>
                          <td className="px-5 py-4"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${meta.color}`}>{meta.label}</span></td>
                          <td className="px-5 py-4 text-xs text-muted-foreground">{o.createdAt}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* ═══ WALLETS ═══ */}
          <TabsContent value="wallets">
            <div className="bg-card rounded-xl shadow-card border border-border/50">
              <div className="p-5 border-b border-border/50">
                <h2 className="font-display font-semibold text-lg">Partner Wallets</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      {["User", "Role", "Balance", "Total Invested", "Total Earned", "Status"].map((h) => (
                        <th key={h} className="text-left text-xs font-medium text-muted-foreground px-5 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.filter((u) => u.role !== "admin").map((user) => (
                      <tr key={user.id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">{user.name.charAt(0)}</div>
                            <div>
                              <div className="text-sm font-medium">{user.name}</div>
                              <div className="text-xs text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${roleColors[user.role]}`}>{user.role}</span></td>
                        <td className="px-5 py-4 text-sm font-bold">৳{(user.walletBalance || 0).toLocaleString()}</td>
                        <td className="px-5 py-4 text-sm">৳{(user.totalInvested || 0).toLocaleString()}</td>
                        <td className="px-5 py-4 text-sm text-primary font-medium">৳{(user.totalEarned || 0).toLocaleString()}</td>
                        <td className="px-5 py-4"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${userStatusColors[user.status]}`}>{user.status}</span></td>
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
                      {["ID", "User", "Amount", "Method", "Account", "Status", "Date", "Actions"].map((h) => (
                        <th key={h} className="text-left text-xs font-medium text-muted-foreground px-5 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.map((w) => (
                      <tr key={w.id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-4 text-sm font-mono">{w.id}</td>
                        <td className="px-5 py-4 text-sm font-medium">{w.userName}</td>
                        <td className="px-5 py-4 text-sm font-bold">৳{w.amount.toLocaleString()}</td>
                        <td className="px-5 py-4 text-xs text-muted-foreground">{w.method}</td>
                        <td className="px-5 py-4 text-xs font-mono text-muted-foreground">{w.account}</td>
                        <td className="px-5 py-4"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${withdrawStatusColors[w.status]}`}>{w.status}</span></td>
                        <td className="px-5 py-4 text-xs text-muted-foreground">{w.requestedAt}</td>
                        <td className="px-5 py-4">
                          {w.status === "pending" ? (
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" className="text-primary h-7 text-xs" onClick={() => processWithdrawal(w.id, "approved")}>
                                <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                              </Button>
                              <Button size="sm" variant="ghost" className="text-destructive h-7 text-xs" onClick={() => processWithdrawal(w.id, "rejected")}>
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
            </div>
          </TabsContent>

          {/* ═══ REPORTS ═══ */}
          <TabsContent value="reports">
            <div className="space-y-6">
              {/* Financial Summary */}
              <div className="bg-card rounded-xl shadow-card border border-border/50 p-5">
                <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" /> Financial Summary
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Platform Revenue", value: "৳4,200,000", sub: "+23% vs last month" },
                    { label: "Total Payouts", value: "৳2,850,000", sub: "To partners & dropshippers" },
                    { label: "Platform Fees", value: "৳420,000", sub: "10% platform commission" },
                    { label: "Net Profit", value: "৳930,000", sub: "After all costs" },
                  ].map((item) => (
                    <div key={item.label} className="bg-muted/30 rounded-lg p-4">
                      <div className="text-xs text-muted-foreground">{item.label}</div>
                      <div className="text-xl font-display font-bold mt-1">{item.value}</div>
                      <div className="text-[10px] text-muted-foreground mt-1">{item.sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* User & Batch Analytics */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-card rounded-xl shadow-card border border-border/50 p-5">
                  <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-primary" /> User Breakdown
                  </h2>
                  <div className="space-y-3">
                    {[
                      { label: "Production Partners", count: users.filter((u) => u.role === "partner").length, total: users.length, color: "bg-primary" },
                      { label: "Dropshippers", count: users.filter((u) => u.role === "dropshipper").length, total: users.length, color: "bg-accent" },
                      { label: "Distributors", count: users.filter((u) => u.role === "distributor").length, total: users.length, color: "bg-secondary" },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{item.label}</span>
                          <span className="font-medium">{item.count} ({((item.count / item.total) * 100).toFixed(0)}%)</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${item.color}`} style={{ width: `${(item.count / item.total) * 100}%` }} />
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

              {/* Order Analytics */}
              <div className="bg-card rounded-xl shadow-card border border-border/50 p-5">
                <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-primary" /> Order Analytics
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {[
                    { label: "Total Orders", value: mockOrders.length },
                    { label: "Delivered", value: mockOrders.filter((o) => o.status === "delivered").length },
                    { label: "In Transit", value: mockOrders.filter((o) => ["shipped", "out_for_delivery"].includes(o.status)).length },
                    { label: "Processing", value: mockOrders.filter((o) => ["placed", "confirmed", "processing", "packed"].includes(o.status)).length },
                    { label: "Cancelled", value: mockOrders.filter((o) => o.status === "cancelled").length },
                  ].map((item) => (
                    <div key={item.label} className="bg-muted/30 rounded-lg p-3 text-center">
                      <div className="text-2xl font-display font-bold">{item.value}</div>
                      <div className="text-xs text-muted-foreground">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Products */}
              <div className="bg-card rounded-xl shadow-card border border-border/50 p-5">
                <h2 className="font-display font-semibold text-lg mb-4">Top Selling Products</h2>
                <div className="space-y-3">
                  {warehouseProducts.sort((a, b) => b.sold - a.sold).slice(0, 4).map((p, i) => (
                    <div key={p.name} className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-muted-foreground w-6">#{i + 1}</span>
                        <div>
                          <div className="text-sm font-medium">{p.name}</div>
                          <div className="text-xs text-muted-foreground">{p.warehouse}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-primary">{p.sold} sold</div>
                        <div className="text-xs text-muted-foreground">{p.inStock} in stock</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* User Detail Dialog */}
        <Dialog open={!!userDetail} onOpenChange={(open) => !open && setUserDetail(null)}>
          <DialogContent className="max-w-md">
            {userDetail && (
              <>
                <DialogHeader>
                  <DialogTitle>{userDetail.name}</DialogTitle>
                  <DialogDescription>{userDetail.email}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="text-[10px] text-muted-foreground uppercase">Role</div>
                      <div className="text-sm font-medium capitalize mt-1">{userDetail.role}</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="text-[10px] text-muted-foreground uppercase">Status</div>
                      <div className="mt-1"><span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${userStatusColors[userDetail.status]}`}>{userDetail.status}</span></div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="text-[10px] text-muted-foreground uppercase">Wallet</div>
                      <div className="text-sm font-bold mt-1">৳{(userDetail.walletBalance || 0).toLocaleString()}</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="text-[10px] text-muted-foreground uppercase">Joined</div>
                      <div className="text-sm font-medium mt-1">{userDetail.joined}</div>
                    </div>
                  </div>
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total Invested</span>
                      <span className="font-semibold">৳{(userDetail.totalInvested || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total Earned</span>
                      <span className="font-bold text-primary">৳{(userDetail.totalEarned || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  {userDetail.status === "pending" && <Button onClick={() => { approveUser(userDetail.id); setUserDetail(null); }}>Approve User</Button>}
                  {userDetail.role !== "admin" && (
                    <Button variant={userDetail.status === "suspended" ? "default" : "destructive"} onClick={() => { toggleUserStatus(userDetail.id); setUserDetail(null); }}>
                      {userDetail.status === "suspended" ? "Activate" : "Suspend"}
                    </Button>
                  )}
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
