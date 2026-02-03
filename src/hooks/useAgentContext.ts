import { useLocation } from 'react-router-dom';

export type AgentContext = 'supplier-performance' | 'dispatch-readiness';

export const useAgentContext = (): AgentContext => {
  const location = useLocation();
  
  // Check if the current route is within the dispatch agent
  if (location.pathname.startsWith('/dispatch')) {
    return 'dispatch-readiness';
  }
  
  return 'supplier-performance';
};

export const getAgentLabel = (context: AgentContext): string => {
  return context === 'dispatch-readiness' 
    ? 'Dispatch Readiness Agent' 
    : 'Supplier Performance Agent';
};
