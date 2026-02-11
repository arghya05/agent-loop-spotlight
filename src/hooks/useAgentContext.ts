import { useLocation } from 'react-router-dom';

export type AgentContext = 'supplier-performance' | 'dispatch-readiness' | 'supplier-onboarding';

export const useAgentContext = (): AgentContext => {
  const location = useLocation();
  
  if (location.pathname.startsWith('/dispatch')) {
    return 'dispatch-readiness';
  }
  if (location.pathname.startsWith('/onboarding')) {
    return 'supplier-onboarding';
  }
  
  return 'supplier-performance';
};

export const getAgentLabel = (context: AgentContext): string => {
  if (context === 'dispatch-readiness') return 'Dispatch Readiness Agent';
  if (context === 'supplier-onboarding') return 'Supplier Onboarding Agent';
  return 'Supplier Performance Agent';
};
