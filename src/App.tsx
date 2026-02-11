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
import Login from "./pages/Login";
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
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
