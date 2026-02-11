import { useLocation } from 'react-router-dom';

export type AgentContext = 'supplier-performance' | 'dispatch-readiness' | 'supplier-onboarding' | 'invoice-cash-ops' | 'contract-lifecycle' | 'supplier-portal';

export const useAgentContext = (): AgentContext => {
  const location = useLocation();
  
  if (location.pathname.startsWith('/dispatch')) {
    return 'dispatch-readiness';
  }
  if (location.pathname.startsWith('/onboarding')) {
    return 'supplier-onboarding';
  }
  if (location.pathname.startsWith('/invoice')) {
    return 'invoice-cash-ops';
  }
  if (location.pathname.startsWith('/contract')) {
    return 'contract-lifecycle';
  }
  if (location.pathname.startsWith('/support')) {
    return 'supplier-portal';
  }
  
  return 'supplier-performance';
};

export const getAgentLabel = (context: AgentContext): string => {
  if (context === 'dispatch-readiness') return 'Dispatch Readiness Agent';
  if (context === 'supplier-onboarding') return 'Supplier Onboarding Agent';
  if (context === 'invoice-cash-ops') return 'Invoice & Cash Optimization Agent';
  if (context === 'contract-lifecycle') return 'Contract Lifecycle Agent';
  if (context === 'supplier-portal') return 'Supplier Portal Support Agent';
  return 'Supplier Performance Agent';
};
