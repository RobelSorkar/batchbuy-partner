import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Marketplace from "./pages/Marketplace";
import BatchDetail from "./pages/BatchDetail";
import PartnerDashboard from "./pages/PartnerDashboard";
import DropshipperDashboard from "./pages/DropshipperDashboard";
import DropshipperProducts from "./pages/DropshipperProducts";
import DropshipperOrders from "./pages/DropshipperOrders";
import WalletPage from "./pages/WalletPage";
import AdminDashboard from "./pages/AdminDashboard";
import CreateBatch from "./pages/CreateBatch";
import WarehousePage from "./pages/WarehousePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/batch/:id" element={<BatchDetail />} />
          <Route path="/partner" element={<PartnerDashboard />} />
          <Route path="/dropshipper" element={<DropshipperDashboard />} />
          <Route path="/dropshipper/products" element={<DropshipperProducts />} />
          <Route path="/dropshipper/orders" element={<DropshipperOrders />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/create-batch" element={<CreateBatch />} />
          <Route path="/warehouse" element={<WarehousePage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
