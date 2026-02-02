import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalTopBar } from '@/components/GlobalTopBar';
import { SupplierHealthRadar } from '@/components/SupplierHealthRadar';
import { ExplainPanel } from '@/components/ExplainPanel';
import { EnforcePlan } from '@/components/EnforcePlan';
import { BottomDrawer } from '@/components/BottomDrawer';
import { PolicyControlsPanel } from '@/components/PolicyControlsPanel';
import { AgentDecisionTimeline } from '@/components/AgentDecisionTimeline';
import { DispatchReadinessView } from '@/components/dispatch/DispatchReadinessView';
import { useAppStore } from '@/store/appStore';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Package, LogOut } from 'lucide-react';
import algonomyLogo from '@/assets/algonomy-logo.png';
import { Button } from '@/components/ui/button';

type AgentView = 'performance' | 'dispatch';

const PerformanceAgentView = () => {
  const { investigationStatus } = useAppStore();
  
  return (
    <div className="min-h-screen bg-background">
      {/* Global Top Bar */}
      <GlobalTopBar />

      {/* Main Content - 3 Column Layout */}
      <main className="pt-16 pb-16">
        <div className="px-6 py-4">
          {/* Section Headers Row */}
          <div className="grid grid-cols-12 gap-6 mb-4">
            <div className="col-span-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-status-danger animate-pulse" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Monitor
                </h2>
                <span className="text-xs text-muted-foreground">Select & Investigate</span>
              </div>
            </div>
            <div className="col-span-5">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${investigationStatus === 'completed' ? 'bg-status-success' : 'bg-primary'} ${investigationStatus === 'running' ? 'animate-pulse' : ''}`} />
                <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Explain
                </h2>
                <span className="text-xs text-muted-foreground">Root Cause Analysis</span>
              </div>
            </div>
            <div className="col-span-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-status-success" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Enforce
                </h2>
                <span className="text-xs text-muted-foreground">Plan & Execute</span>
              </div>
            </div>
          </div>
          
          {/* Flow Indicator */}
          <div className="grid grid-cols-12 gap-6 mb-6">
            <div className="col-span-12">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-gradient-to-r from-status-danger via-primary to-status-success rounded-full opacity-30" />
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-12 gap-6" style={{ minHeight: 'calc(100vh - 200px)' }}>
            {/* Left Column: Monitor */}
            <div className="col-span-3 flex flex-col gap-5">
              <SupplierHealthRadar />
              <PolicyControlsPanel />
              <AgentDecisionTimeline />
            </div>

            {/* Middle Column: Explain */}
            <div className="col-span-5">
              <ExplainPanel />
            </div>

            {/* Right Column: Enforce */}
            <div className="col-span-4">
              <EnforcePlan />
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Drawer */}
      <BottomDrawer />
    </div>
  );
};

const Index = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<AgentView>('performance');
  
  // Check if logged in
  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('algonomy_logged_in');
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [navigate]);
  
  const handleLogout = () => {
    sessionStorage.removeItem('algonomy_logged_in');
    sessionStorage.removeItem('algonomy_user');
    navigate('/login');
  };
  
  const currentUser = sessionStorage.getItem('algonomy_user') || 'User';
  
  return (
    <div className="relative">
      {/* Agent Switcher - Fixed Tab Bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] bg-background border-b">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <img src={algonomyLogo} alt="Algonomy" className="h-8" />
            <span className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Atlas</span>
          </div>
          
          <Tabs value={activeView} onValueChange={(v) => setActiveView(v as AgentView)}>
            <TabsList className="grid grid-cols-2 w-[500px]">
              <TabsTrigger value="performance" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <span className="text-xs font-semibold">BUC4: Supplier Performance Agent</span>
              </TabsTrigger>
              <TabsTrigger value="dispatch" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span className="text-xs font-semibold">BUC5: Dispatch Readiness Agent</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              Welcome, <span className="font-medium text-foreground">{currentUser}</span>
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="h-8 text-xs">
              <LogOut className="w-3.5 h-3.5 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </div>
      
      {/* Content with extra top padding for tab bar */}
      <div className="pt-12">
        {activeView === 'performance' ? (
          <PerformanceAgentView />
        ) : (
          <DispatchReadinessView />
        )}
      </div>
    </div>
  );
};

export default Index;
