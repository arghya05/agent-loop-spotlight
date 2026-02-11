import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useGovernanceStore } from '@/store/governanceStore';
import { useAgentContext } from '@/hooks/useAgentContext';
import {
  LayoutDashboard,
  Box,
  Users,
  BarChart3,
  Plug,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  Truck,
  Package,
  AlertTriangle,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

// Supplier Performance nav items
const supplierNavItems = [
  { 
    label: 'Governance Home', 
    path: '/landing', 
    icon: LayoutDashboard,
    description: 'Portfolio overview'
  },
  { 
    label: 'Buckets', 
    path: '/bucket', 
    icon: Box,
    description: 'Performance buckets'
  },
  { 
    label: 'Vendors', 
    path: '/vendors', 
    icon: Users,
    description: 'Vendor directory'
  },
  { 
    label: 'Analytics', 
    path: '/analytics', 
    icon: BarChart3,
    description: 'Reports & exports'
  },
  { 
    label: 'Connectors', 
    path: '/connectors', 
    icon: Plug,
    description: 'Integrations'
  },
  { 
    label: 'Settings', 
    path: '/settings', 
    icon: Settings,
    description: 'Configuration'
  },
  { 
    label: 'Admin', 
    path: '/admin/agents', 
    icon: Shield,
    description: 'Agent management'
  }
];

// Dispatch Readiness nav items
const dispatchNavItems = [
  { label: 'Readiness Home', path: '/dispatch/landing', icon: Truck, description: 'Portfolio readiness' },
  { label: 'Slipping', path: '/dispatch/bucket/ss', icon: AlertTriangle, description: 'High risk POs' },
  { label: 'Watchlist', path: '/dispatch/bucket/aw', icon: Package, description: 'Early warning' },
  { label: 'On Track', path: '/dispatch/bucket/flow', icon: CheckCircle2, description: 'Low risk POs' },
  { label: 'Analytics', path: '/dispatch/analytics', icon: BarChart3, description: 'Reports & exports' },
  { label: 'Connectors', path: '/dispatch/connectors', icon: Plug, description: 'Integrations' },
  { label: 'Settings', path: '/dispatch/settings', icon: Settings, description: 'Configuration' },
  { label: 'Admin', path: '/dispatch/admin/agents', icon: Shield, description: 'Agent management' }
];

// Supplier Onboarding nav items
const onboardingNavItems = [
  { label: 'Onboarding Home', path: '/onboarding/landing', icon: LayoutDashboard, description: 'Pipeline overview' },
  { label: 'Fast Track', path: '/onboarding/bucket/fast-track', icon: CheckCircle2, description: 'Low risk, auto-approvable' },
  { label: 'Needs Review', path: '/onboarding/bucket/needs-review', icon: AlertTriangle, description: 'Requires human review' },
  { label: 'Blocked', path: '/onboarding/bucket/blocked', icon: TrendingUp, description: 'Critical failures' },
  { label: 'Analytics', path: '/onboarding/analytics', icon: BarChart3, description: 'Reports & exports' },
  { label: 'Connectors', path: '/onboarding/connectors', icon: Plug, description: 'Integrations' },
  { label: 'Settings', path: '/onboarding/settings', icon: Settings, description: 'Configuration' },
  { label: 'Admin', path: '/onboarding/admin/agents', icon: Shield, description: 'Agent management' }
];

export const AppSidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const location = useLocation();
  const agentContext = useAgentContext();
  const { getAttentionQueue } = useGovernanceStore();
  const attentionCount = getAttentionQueue().length;
  
  // Select nav items based on agent context
  const navItems = agentContext === 'dispatch-readiness' ? dispatchNavItems : agentContext === 'supplier-onboarding' ? onboardingNavItems : supplierNavItems;
  
  const isActive = (path: string) => {
    if (path === '/landing') return location.pathname === '/landing' || location.pathname === '/';
    if (path === '/dispatch/landing') return location.pathname === '/dispatch/landing' || location.pathname === '/dispatch';
    if (path === '/onboarding/landing') return location.pathname === '/onboarding/landing' || location.pathname === '/onboarding';
    if (path === '/bucket') return location.pathname.startsWith('/bucket') && !location.pathname.startsWith('/dispatch');
    if (path.startsWith('/dispatch/bucket/')) return location.pathname === path;
    if (path.startsWith('/onboarding/bucket/')) return location.pathname === path;
    if (path === '/admin/agents') return location.pathname.startsWith('/admin');
    return location.pathname.startsWith(path);
  };

  return (
    <aside 
      className={cn(
        "fixed left-0 top-[104px] bottom-0 z-40 flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-56"
      )}
    >
      <ScrollArea className="flex-1 py-4">
        <nav className="flex flex-col gap-1 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive(item.path) 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                  : "text-sidebar-foreground/70"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <div className="flex items-center justify-between flex-1">
                  <span>{item.label}</span>
                  {item.path === '/landing' && attentionCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="h-5 min-w-[20px] px-1.5 text-[10px] flex items-center justify-center"
                    >
                      {attentionCount}
                    </Badge>
                  )}
                </div>
              )}
              {collapsed && item.path === '/landing' && attentionCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute left-10 top-1 h-4 min-w-[16px] px-1 text-[9px]"
                >
                  {attentionCount}
                </Badge>
              )}
            </NavLink>
          ))}
        </nav>
      </ScrollArea>

      {/* Collapse Toggle */}
      <div className="p-2 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="w-full justify-center text-sidebar-foreground/70 hover:text-sidebar-foreground"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 mr-2" />
              <span className="text-xs">Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
};
