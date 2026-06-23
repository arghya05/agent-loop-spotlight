import { useLocation } from 'react-router-dom';

export type AgentContext = 'supplier-performance' | 'dispatch-readiness' | 'supplier-onboarding' | 'invoice-cash-ops' | 'contract-lifecycle' | 'pricing-intelligence' | 'autonomous-inventory' | 'product-onboarding' | 'store-ops';

export const useAgentContext = (): AgentContext => {
  const location = useLocation();
  
  if (location.pathname.startsWith('/store-ops')) return 'store-ops';
  if (location.pathname.startsWith('/dispatch')) return 'dispatch-readiness';
  if (location.pathname.startsWith('/onboarding')) return 'supplier-onboarding';
  if (location.pathname.startsWith('/invoice')) return 'invoice-cash-ops';
  if (location.pathname.startsWith('/contract')) return 'contract-lifecycle';
  if (location.pathname.startsWith('/pricing')) return 'pricing-intelligence';
  if (location.pathname.startsWith('/inventory')) return 'autonomous-inventory';
  if (location.pathname.startsWith('/product')) return 'product-onboarding';
  
  return 'supplier-performance';
};

export const getAgentLabel = (context: AgentContext): string => {
  if (context === 'dispatch-readiness') return 'Dispatch Readiness Agent';
  if (context === 'supplier-onboarding') return 'Supplier Onboarding Agent';
  if (context === 'invoice-cash-ops') return 'Invoice & Cash Optimization Agent';
  if (context === 'contract-lifecycle') return 'Contract Lifecycle Agent';
  if (context === 'pricing-intelligence') return 'Pricing Intelligence Agent';
  if (context === 'autonomous-inventory') return 'Autonomous Inventory Agent';
  if (context === 'product-onboarding') return 'Product Onboarding Agent';
  if (context === 'store-ops') return 'Store Ops Agent';
  return 'Supplier Performance Agent';
};
