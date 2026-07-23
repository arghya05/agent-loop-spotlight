import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { LandingPage } from "@/pages/LandingPage";
import { BucketPage } from "@/pages/BucketPage";
import { VendorPage } from "@/pages/VendorPage";
import { VendorsPage } from "@/pages/VendorsPage";
import { InvestigatePage } from "@/pages/InvestigatePage";
import { SettingsPage } from "@/pages/SettingsPage";
import { AdminAgentsPage } from "@/pages/AdminAgentsPage";
import { ConnectorsPage } from "@/pages/ConnectorsPage";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { DispatchLandingPage } from "@/pages/dispatch/DispatchLandingPage";
import { DispatchBucketPage } from "@/pages/dispatch/DispatchBucketPage";
import { DispatchVendorPage } from "@/pages/dispatch/DispatchVendorPage";
import { OnboardingLandingPage } from "@/pages/onboarding/OnboardingLandingPage";
import { OnboardingBucketPage } from "@/pages/onboarding/OnboardingBucketPage";
import { OnboardingSupplierPage } from "@/pages/onboarding/OnboardingSupplierPage";
import { OnboardingCasePage } from "@/pages/onboarding/OnboardingCasePage";
import { InvoiceLandingPage } from "@/pages/invoice/InvoiceLandingPage";
import { InvoiceBucketPage } from "@/pages/invoice/InvoiceBucketPage";
import { InvoiceDetailPage } from "@/pages/invoice/InvoiceDetailPage";
import { DisputePage } from "@/pages/invoice/DisputePage";
import { SupplierAPPage } from "@/pages/invoice/SupplierAPPage";
import { ContractLandingPage } from "@/pages/contract/ContractLandingPage";
import { ContractBucketPage } from "@/pages/contract/ContractBucketPage";
import { ContractDetailPage } from "@/pages/contract/ContractDetailPage";
import { ContractSupplierPage } from "@/pages/contract/ContractSupplierPage";
import { ObligationDetailPage } from "@/pages/contract/ObligationDetailPage";
import { ContractCasePage } from "@/pages/contract/ContractCasePage";
import { PricingLandingPage } from "@/pages/pricing/PricingLandingPage";
import { PricingBucketPage } from "@/pages/pricing/PricingBucketPage";
import { PricingSignalDetailPage } from "@/pages/pricing/PricingSignalDetailPage";
import { InventoryLandingPage } from "@/pages/inventory/InventoryLandingPage";
import { InventoryBucketPage } from "@/pages/inventory/InventoryBucketPage";
import { InventorySignalDetailPage } from "@/pages/inventory/InventorySignalDetailPage";
import { ProductLandingPage } from "@/pages/product/ProductLandingPage";
import { ProductBucketPage } from "@/pages/product/ProductBucketPage";
import { ProductItemDetailPage } from "@/pages/product/ProductItemDetailPage";
import { StoreOpsLandingPage } from "@/pages/storeOps/StoreOpsLandingPage";
import { StoreOpsBucketPage } from "@/pages/storeOps/StoreOpsBucketPage";
import { StoreOpsSignalDetailPage } from "@/pages/storeOps/StoreOpsSignalDetailPage";
import { StoreOpsUtilityPage } from "@/pages/storeOps/StoreOpsUtilityPage";
import Login from "./pages/Login";
import { SuperAgentsHub } from "./pages/SuperAgentsHub";
import { SupplyChainAgentPage } from "./pages/SupplyChainAgentPage";
import { SupplyChainBucketPage } from "./pages/SupplyChainBucketPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = sessionStorage.getItem('algonomy_logged_in');
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/hub" element={<ProtectedRoute><SuperAgentsHub /></ProtectedRoute>} />
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/bucket/:bucketId" element={<BucketPage />} />
            <Route path="/bucket" element={<Navigate to="/bucket/critical" replace />} />
            <Route path="/vendor/:vendorId" element={<VendorPage />} />
            <Route path="/vendors" element={<VendorsPage />} />
            <Route path="/investigate/:vendorId" element={<InvestigatePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/admin/agents" element={<AdminAgentsPage />} />
            <Route path="/connectors" element={<ConnectorsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            {/* Dispatch Readiness Agent Routes */}
            <Route path="/dispatch/landing" element={<DispatchLandingPage />} />
            <Route path="/dispatch/bucket/:bucketId" element={<DispatchBucketPage />} />
            <Route path="/dispatch/vendor/:vendorId" element={<DispatchVendorPage />} />
            <Route path="/dispatch/analytics" element={<AnalyticsPage />} />
            <Route path="/dispatch/connectors" element={<ConnectorsPage />} />
            <Route path="/dispatch/settings" element={<SettingsPage />} />
            <Route path="/dispatch/admin/agents" element={<AdminAgentsPage />} />
            {/* Supplier Onboarding Agent Routes */}
            <Route path="/onboarding/landing" element={<OnboardingLandingPage />} />
            <Route path="/onboarding/bucket/:bucketId" element={<OnboardingBucketPage />} />
            <Route path="/onboarding/supplier/:supplierId" element={<OnboardingSupplierPage />} />
            <Route path="/onboarding/case/:caseId" element={<OnboardingCasePage />} />
            <Route path="/onboarding/analytics" element={<AnalyticsPage />} />
            <Route path="/onboarding/connectors" element={<ConnectorsPage />} />
            <Route path="/onboarding/settings" element={<SettingsPage />} />
            <Route path="/onboarding/admin/agents" element={<AdminAgentsPage />} />
            {/* Invoice & Cash Optimization Agent Routes */}
            <Route path="/invoice/landing" element={<InvoiceLandingPage />} />
            <Route path="/invoice/bucket/:bucketId" element={<InvoiceBucketPage />} />
            <Route path="/invoice/invoice/:invoiceId" element={<InvoiceDetailPage />} />
            <Route path="/invoice/dispute/:disputeId" element={<DisputePage />} />
            <Route path="/invoice/supplier/:supplierId" element={<SupplierAPPage />} />
            <Route path="/invoice/analytics" element={<AnalyticsPage />} />
            <Route path="/invoice/connectors" element={<ConnectorsPage />} />
            <Route path="/invoice/settings" element={<SettingsPage />} />
            <Route path="/invoice/admin/agents" element={<AdminAgentsPage />} />
            {/* Contract Lifecycle Agent Routes */}
            <Route path="/contract/landing" element={<ContractLandingPage />} />
            <Route path="/contract/bucket/:bucketId" element={<ContractBucketPage />} />
            <Route path="/contract/contract/:contractId" element={<ContractDetailPage />} />
            <Route path="/contract/supplier/:supplierId" element={<ContractSupplierPage />} />
            <Route path="/contract/obligation/:obligationId" element={<ObligationDetailPage />} />
            <Route path="/contract/case/:caseId" element={<ContractCasePage />} />
            <Route path="/contract/analytics" element={<AnalyticsPage />} />
            <Route path="/contract/connectors" element={<ConnectorsPage />} />
            <Route path="/contract/settings" element={<SettingsPage />} />
            <Route path="/contract/admin/agents" element={<AdminAgentsPage />} />
            {/* Pricing Intelligence Agent Routes */}
            <Route path="/pricing/landing" element={<PricingLandingPage />} />
            <Route path="/pricing/bucket/:bucketId" element={<PricingBucketPage />} />
            <Route path="/pricing/signal/:signalId" element={<PricingSignalDetailPage />} />
            <Route path="/pricing/analytics" element={<AnalyticsPage />} />
            <Route path="/pricing/connectors" element={<ConnectorsPage />} />
            <Route path="/pricing/settings" element={<SettingsPage />} />
            <Route path="/pricing/admin/agents" element={<AdminAgentsPage />} />
            {/* Autonomous Inventory Agent Routes */}
            <Route path="/inventory/landing" element={<InventoryLandingPage />} />
            <Route path="/inventory/bucket/:bucketId" element={<InventoryBucketPage />} />
            <Route path="/inventory/signal/:signalId" element={<InventorySignalDetailPage />} />
            <Route path="/inventory/analytics" element={<AnalyticsPage />} />
            <Route path="/inventory/connectors" element={<ConnectorsPage />} />
            <Route path="/inventory/settings" element={<SettingsPage />} />
            <Route path="/inventory/admin/agents" element={<AdminAgentsPage />} />
            {/* Product Onboarding Agent Routes */}
            <Route path="/product/landing" element={<ProductLandingPage />} />
            <Route path="/product/bucket/:bucketId" element={<ProductBucketPage />} />
            <Route path="/product/item/:itemId" element={<ProductItemDetailPage />} />
            <Route path="/product/analytics" element={<AnalyticsPage />} />
            <Route path="/product/connectors" element={<ConnectorsPage />} />
            <Route path="/product/settings" element={<SettingsPage />} />
            <Route path="/product/admin/agents" element={<AdminAgentsPage />} />
            {/* Extra Supply Chain Agent Routes */}
            <Route path="/supply-chain/:agentId" element={<SupplyChainAgentPage />} />
            {/* Store Ops Agent Routes */}
            <Route path="/store-ops" element={<StoreOpsLandingPage />} />
            <Route path="/store-ops/landing" element={<StoreOpsLandingPage />} />
            <Route path="/store-ops/:agentId/landing" element={<StoreOpsLandingPage />} />
            <Route path="/store-ops/:agentId/bucket/:bucketId" element={<StoreOpsBucketPage />} />
            <Route path="/store-ops/:agentId/signal/:signalId" element={<StoreOpsSignalDetailPage />} />
            <Route path="/store-ops/:agentId/analytics" element={<StoreOpsUtilityPage type="analytics" />} />
            <Route path="/store-ops/:agentId/connectors" element={<StoreOpsUtilityPage type="connectors" />} />
            <Route path="/store-ops/:agentId/settings" element={<StoreOpsUtilityPage type="settings" />} />
            <Route path="/store-ops/:agentId/admin/agents" element={<StoreOpsUtilityPage type="admin" />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
