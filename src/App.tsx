import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";

const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const PartnerDashboard = lazy(() => import("./pages/PartnerDashboard"));
const PartnerInventory = lazy(() => import("./pages/PartnerInventory"));
const DistributorDashboard = lazy(() => import("./pages/DistributorDashboard"));
const DropshipperDashboard = lazy(() => import("./pages/DropshipperDashboard"));
const DropshipperProducts = lazy(() => import("./pages/DropshipperProducts"));
const DropshipperOrders = lazy(() => import("./pages/DropshipperOrders"));
const WalletPage = lazy(() => import("./pages/WalletPage"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const CreateProject = lazy(() => import("./pages/CreateProject"));
const WarehousePage = lazy(() => import("./pages/WarehousePage"));
const OrderManagement = lazy(() => import("./pages/OrderManagement"));
const DistributionPage = lazy(() => import("./pages/DistributionPage"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const TransparencyDashboard = lazy(() => import("./pages/TransparencyDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/batch/:id" element={<ProjectDetail />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/transparency" element={<TransparencyDashboard />} />

                {/* Partner routes */}
                <Route path="/partner" element={<ProtectedRoute requiredRole="partner"><PartnerDashboard /></ProtectedRoute>} />
                <Route path="/partner/inventory" element={<ProtectedRoute requiredRole="partner"><PartnerInventory /></ProtectedRoute>} />
                <Route path="/create-batch" element={<ProtectedRoute requiredRole="admin"><CreateProject /></ProtectedRoute>} />
                <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

                {/* Sales Partner routes */}
                <Route path="/sales-partner" element={<ProtectedRoute requiredRole="dropshipper"><DropshipperDashboard /></ProtectedRoute>} />
                <Route path="/sales-partner/products" element={<ProtectedRoute requiredRole="dropshipper"><DropshipperProducts /></ProtectedRoute>} />
                <Route path="/sales-partner/orders" element={<ProtectedRoute requiredRole="dropshipper"><DropshipperOrders /></ProtectedRoute>} />
                {/* Legacy dropshipper routes redirect */}
                <Route path="/dropshipper" element={<ProtectedRoute requiredRole="dropshipper"><DropshipperDashboard /></ProtectedRoute>} />
                <Route path="/dropshipper/products" element={<ProtectedRoute requiredRole="dropshipper"><DropshipperProducts /></ProtectedRoute>} />
                <Route path="/dropshipper/orders" element={<ProtectedRoute requiredRole="dropshipper"><DropshipperOrders /></ProtectedRoute>} />

                {/* Distributor routes */}
                <Route path="/distributor" element={<ProtectedRoute requiredRole="distributor"><DistributorDashboard /></ProtectedRoute>} />

                {/* Admin routes */}
                <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><AdminDashboard defaultTab="users" /></ProtectedRoute>} />
                <Route path="/admin/sales-partners" element={<ProtectedRoute requiredRole="admin"><AdminDashboard defaultTab="users" defaultRoleFilter="dropshipper" /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute requiredRole="admin"><OrderManagement role="admin" /></ProtectedRoute>} />
                <Route path="/admin/orders" element={<ProtectedRoute requiredRole="admin"><OrderManagement role="admin" /></ProtectedRoute>} />
                <Route path="/admin/distribution" element={<ProtectedRoute requiredRole="admin"><DistributionPage /></ProtectedRoute>} />
                <Route path="/admin/analytics" element={<ProtectedRoute requiredRole="admin"><AnalyticsPage /></ProtectedRoute>} />

                {/* Warehouse routes */}
                <Route path="/warehouse" element={<ProtectedRoute requiredRole="warehouse"><WarehousePage /></ProtectedRoute>} />
                <Route path="/warehouse/orders" element={<ProtectedRoute requiredRole="warehouse"><OrderManagement role="warehouse" /></ProtectedRoute>} />

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
