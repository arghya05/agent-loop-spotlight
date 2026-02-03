import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { AppSidebar } from './AppSidebar';
import { AppTopBar } from './AppTopBar';
import { BottomDrawer } from '@/components/BottomDrawer';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Truck, 
  Factory,
  ShieldCheck,
  Zap
} from 'lucide-react';

const agentTabs = [
  { 
    id: 'supplier-performance', 
    label: 'Supplier Performance Explainer + Improvement Agent',
    shortLabel: 'Supplier Performance',
    icon: TrendingUp,
    active: true,
    badge: null,
    basePath: '/landing'
  },
  { 
    id: 'dispatch-readiness', 
    label: 'Dispatch Readiness Agent',
    shortLabel: 'Dispatch Readiness',
    icon: Truck,
    active: true,
    badge: null,
    basePath: '/dispatch'
  },
  { 
    id: 'supplier-onboarding', 
    label: 'Supplier Onboarding Agent',
    shortLabel: 'Supplier Onboarding',
    icon: Factory,
    active: false,
    badge: 'Coming Soon',
    basePath: null
  },
  { 
    id: 'compliance-monitor', 
    label: 'Compliance Monitor Agent',
    shortLabel: 'Compliance Monitor',
    icon: ShieldCheck,
    active: false,
    badge: 'Coming Soon',
    basePath: null
  }
];

export const AppLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeAgent, setActiveAgent] = useState('supplier-performance');
  const navigate = useNavigate();
  const location = useLocation();

  // Sync active agent with current route
  useEffect(() => {
    if (location.pathname.startsWith('/dispatch')) {
      setActiveAgent('dispatch-readiness');
    } else {
      setActiveAgent('supplier-performance');
    }
  }, [location.pathname]);

  const handleTabChange = (tabId: string) => {
    setActiveAgent(tabId);
    if (tabId === 'supplier-performance') {
      navigate('/landing');
    } else if (tabId === 'dispatch-readiness') {
      navigate('/dispatch/landing');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppTopBar />
      
      {/* Agent Tabs Bar */}
      <div className="fixed top-14 left-0 right-0 z-40 h-12 bg-muted/50 border-b border-border flex items-center px-4">
        <div className="flex items-center gap-1">
          {agentTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeAgent === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => tab.active && handleTabChange(tab.id)}
                disabled={!tab.active}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : tab.active 
                      ? "text-foreground/70 hover:bg-muted hover:text-foreground"
                      : "text-muted-foreground/50 cursor-not-allowed"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden lg:inline">{tab.label}</span>
                <span className="lg:hidden">{tab.shortLabel}</span>
                {tab.badge && (
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-muted-foreground/20">
                    {tab.badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
        
        {/* Active Agent Indicator */}
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-status-success/10 text-status-success text-xs font-medium">
            <Zap className="w-3 h-3" />
            <span>Agent Active</span>
          </div>
        </div>
      </div>

      <AppSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      <main 
        className={cn(
          "pt-[104px] pb-16 min-h-screen transition-all duration-300",
          sidebarCollapsed ? "pl-16" : "pl-56"
        )}
      >
        <Outlet />
      </main>
      <BottomDrawer />
    </div>
  );
};
