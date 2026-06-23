import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { AppSidebar } from './AppSidebar';
import { AppTopBar } from './AppTopBar';
import { BottomDrawer } from '@/components/BottomDrawer';
import { Badge } from '@/components/ui/badge';
import { storeOpsAgents } from '@/data/storeOps';
import { 
  TrendingUp, 
  Truck, 
  Factory,
  ShieldCheck,
  Zap,
  FileText,
  Tag,
  Package,
  PackageOpen,
  Store,
  Layers,
  ShieldAlert,
  ShoppingCart,
  PackageSearch,
  Map,
  HeartHandshake,
  CalendarClock
} from 'lucide-react';

const agentTabs = [
  { 
    id: 'supplier-performance', 
    label: 'Supplier Performance',
    icon: TrendingUp,
    active: true,
    badge: null,
    basePath: '/landing'
  },
  { 
    id: 'dispatch-readiness', 
    label: 'Dispatch Readiness',
    icon: Truck,
    active: true,
    badge: null,
    basePath: '/dispatch'
  },
  { 
    id: 'supplier-onboarding', 
    label: 'Supplier Onboarding',
    icon: Factory,
    active: true,
    badge: null,
    basePath: '/onboarding'
  },
  { 
    id: 'invoice-cash-ops', 
    label: 'Invoice & Cash Ops',
    icon: ShieldCheck,
    active: true,
    badge: null,
    basePath: '/invoice'
  },
  { 
    id: 'contract-lifecycle', 
    label: 'Contract Lifecycle',
    icon: FileText,
    active: true,
    badge: null,
    basePath: '/contract'
  },
  { 
    id: 'pricing-intelligence', 
    label: 'Pricing Intelligence',
    icon: Tag,
    active: true,
    badge: null,
    basePath: '/pricing'
  },
  { 
    id: 'autonomous-inventory', 
    label: 'Autonomous Inventory',
    icon: Package,
    active: true,
    badge: null,
    basePath: '/inventory'
  },
  { 
    id: 'product-onboarding', 
    label: 'Product Onboarding',
    icon: PackageOpen,
    active: true,
    badge: null,
    basePath: '/product'
  }
];

const storeIconMap = {
  Store,
  Layers,
  ShieldAlert,
  ShoppingCart,
  PackageSearch,
  Map,
  HeartHandshake,
  CalendarClock,
};

const storeAgentTabs = [
  {
    id: 'store-ops-suite',
    label: 'Store Ops Home',
    icon: Store,
    active: true,
    badge: null,
    basePath: '/store-ops/landing'
  },
  ...storeOpsAgents.map((agent) => ({
    id: agent.id,
    label: agent.shortLabel,
    icon: storeIconMap[agent.icon as keyof typeof storeIconMap] || Store,
    active: true,
    badge: null,
    basePath: `/store-ops/${agent.id}`
  }))
];

export const AppLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeAgent, setActiveAgent] = useState('supplier-performance');
  const navigate = useNavigate();
  const location = useLocation();
  const activeWorkspace = location.pathname.startsWith('/store-ops') ? 'store-ops' : 'supply-chain';

  // Sync active agent with current route
  useEffect(() => {
    if (location.pathname.startsWith('/store-ops')) {
      const activeStoreAgent = storeOpsAgents.find((agent) => location.pathname.startsWith(`/store-ops/${agent.id}`));
      setActiveAgent(activeStoreAgent?.id || 'store-ops-suite');
    } else if (location.pathname.startsWith('/dispatch')) {
      setActiveAgent('dispatch-readiness');
    } else if (location.pathname.startsWith('/onboarding')) {
      setActiveAgent('supplier-onboarding');
    } else if (location.pathname.startsWith('/invoice')) {
      setActiveAgent('invoice-cash-ops');
    } else if (location.pathname.startsWith('/contract')) {
      setActiveAgent('contract-lifecycle');
    } else if (location.pathname.startsWith('/pricing')) {
      setActiveAgent('pricing-intelligence');
    } else if (location.pathname.startsWith('/inventory')) {
      setActiveAgent('autonomous-inventory');
    } else if (location.pathname.startsWith('/product')) {
      setActiveAgent('product-onboarding');
    } else {
      setActiveAgent('supplier-performance');
    }
  }, [location.pathname]);

  const handleWorkspaceChange = (workspace: 'supply-chain' | 'store-ops') => {
    sessionStorage.setItem('algonomy_workspace', workspace);
    navigate(workspace === 'store-ops' ? '/store-ops/landing' : '/landing');
  };

  const handleTabChange = (tabId: string) => {
    setActiveAgent(tabId);
    const storeTab = storeAgentTabs.find((tab) => tab.id === tabId);
    if (storeTab) {
      navigate(tabId === 'store-ops-suite' ? '/store-ops/landing' : `/store-ops/${tabId}/landing`);
      return;
    }

    if (tabId === 'supplier-performance') {
      navigate('/landing');
    } else if (tabId === 'dispatch-readiness') {
      navigate('/dispatch/landing');
    } else if (tabId === 'supplier-onboarding') {
      navigate('/onboarding/landing');
    } else if (tabId === 'invoice-cash-ops') {
      navigate('/invoice/landing');
    } else if (tabId === 'contract-lifecycle') {
      navigate('/contract/landing');
    } else if (tabId === 'pricing-intelligence') {
      navigate('/pricing/landing');
    } else if (tabId === 'autonomous-inventory') {
      navigate('/inventory/landing');
    } else if (tabId === 'product-onboarding') {
      navigate('/product/landing');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppTopBar />
      
      {/* Workspace + Agent Tabs Bar */}
      <div className="fixed top-14 left-0 right-0 z-40 h-16 bg-muted/30 border-b border-border px-4 py-1.5 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 rounded-lg bg-background/70 border border-border p-0.5">
            {[
              { id: 'supply-chain' as const, label: 'Supply Chain Agents', icon: Truck },
              { id: 'store-ops' as const, label: 'Store Ops Agents', icon: Store },
            ].map((workspace) => {
              const Icon = workspace.icon;
              const isActive = activeWorkspace === workspace.id;

              return (
                <button
                  key={workspace.id}
                  onClick={() => handleWorkspaceChange(workspace.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap",
                    isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{workspace.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Agent Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-status-success/10 text-status-success text-[10px] font-medium">
            <Zap className="w-3 h-3" />
            <span>Active</span>
          </div>
        </div>

        <div className="mt-1 flex items-center gap-1 overflow-x-auto scrollbar-thin">
          {(activeWorkspace === 'store-ops' ? storeAgentTabs : agentTabs).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeAgent === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => tab.active && handleTabChange(tab.id)}
                disabled={!tab.active}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : tab.active 
                      ? "text-foreground/80 hover:bg-muted hover:text-foreground"
                      : "text-muted-foreground/40 cursor-not-allowed"
                )}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <Badge variant="outline" className="text-[8px] px-1 py-0 h-4 border-muted-foreground/30 text-muted-foreground/60 font-normal ml-1">
                    {tab.badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <AppSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      <main 
        className={cn(
          "pt-[120px]",
          sidebarCollapsed ? "pl-16" : "pl-56"
        )}
      >
        <Outlet />
      </main>
      <BottomDrawer />
    </div>
  );
};
