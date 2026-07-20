import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { AppSidebar } from './AppSidebar';
import { AppTopBar } from './AppTopBar';
import { BottomDrawer } from '@/components/BottomDrawer';
import { Badge } from '@/components/ui/badge';
import { storeOpsAgents } from '@/data/storeOps';
import { supplyChainAgents } from '@/data/supplyChainAgents';
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
  CalendarClock,
  Radar,
  Shuffle,
  Warehouse,
  Route,
  PackageCheck,
  AlertTriangle,
  PiggyBank,
  MessageSquare,
  Users,
  Rocket,
  DollarSign,
  Gavel,
  ArrowLeftRight,
  LucideIcon,
} from 'lucide-react';

const supplyIconMap: Record<string, LucideIcon> = {
  Users, Truck, Rocket, DollarSign, Gavel, Tag, Package, PackageOpen,
  Radar, Shuffle, Warehouse, Route, PackageCheck, AlertTriangle, PiggyBank, MessageSquare,
};

const existingSupplyIds = new Set([
  'supplier-performance','dispatch-readiness','supplier-onboarding','invoice-cash-ops',
  'contract-lifecycle','pricing-intelligence','autonomous-inventory','product-onboarding',
]);

const extraSupplyAgentTabs = supplyChainAgents
  .filter((a) => !existingSupplyIds.has(a.id))
  .map((a) => ({
    id: a.id,
    label: a.shortLabel,
    icon: supplyIconMap[a.icon] || TrendingUp,
    active: true,
    badge: null as string | null,
    basePath: a.path,
  }));

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
  },
  ...extraSupplyAgentTabs,
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
  ArrowLeftRight,
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

      {/* Agent Tabs Bar (workspace is chosen on the post-login screen) */}
      <div className="fixed top-14 left-0 right-0 z-40 h-11 bg-muted/30 border-b border-border px-4 flex items-center gap-2 backdrop-blur-sm">
        <button
          onClick={() => navigate('/workspaces')}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors whitespace-nowrap flex-shrink-0"
          title="Change workspace"
        >
          {activeWorkspace === 'store-ops' ? <Store className="w-3.5 h-3.5" /> : <Truck className="w-3.5 h-3.5" />}
          <span>{activeWorkspace === 'store-ops' ? 'Store Ops' : 'Supply Chain'}</span>
          <span className="text-muted-foreground/60">·</span>
          <span className="text-primary">Change</span>
        </button>

        <div className="h-5 w-px bg-border flex-shrink-0" />

        <div className="flex items-center gap-1 overflow-x-auto scrollbar-thin flex-1">
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
          "pt-[100px] pb-16 min-h-screen transition-all duration-300",
          sidebarCollapsed ? "pl-16" : "pl-56"
        )}
      >
        <Outlet />
      </main>
      <BottomDrawer />
    </div>
  );
};
