import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyEmail from "./pages/VerifyEmail";
import Marketplace from "./pages/Marketplace";
import BatchDetail from "./pages/BatchDetail";
import PartnerDashboard from "./pages/PartnerDashboard";
import PartnerInventory from "./pages/PartnerInventory";
import DistributorDashboard from "./pages/DistributorDashboard";
import DropshipperDashboard from "./pages/DropshipperDashboard";
import DropshipperProducts from "./pages/DropshipperProducts";
import DropshipperOrders from "./pages/DropshipperOrders";
import WalletPage from "./pages/WalletPage";
import AdminDashboard from "./pages/AdminDashboard";
import CreateBatch from "./pages/CreateBatch";
import WarehousePage from "./pages/WarehousePage";
import OrderManagement from "./pages/OrderManagement";
import DistributionPage from "./pages/DistributionPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ProfilePage from "./pages/ProfilePage";
import TransparencyDashboard from "./pages/TransparencyDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/batch/:id" element={<BatchDetail />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />

            {/* Partner routes */}
            <Route path="/partner" element={<ProtectedRoute requiredRole="partner"><PartnerDashboard /></ProtectedRoute>} />
            <Route path="/partner/inventory" element={<ProtectedRoute requiredRole="partner"><PartnerInventory /></ProtectedRoute>} />
            <Route path="/create-batch" element={<ProtectedRoute requiredRole="admin"><CreateBatch /></ProtectedRoute>} />
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
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
