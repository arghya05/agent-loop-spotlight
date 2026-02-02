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
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="20" fill="#1E1919"/>
              <g clipPath="url(#clip0_main)">
                <path d="M23.163 11V14.764C25.004 15.892 26.24 17.93 26.24 20.258C26.24 23.802 23.39 26.685 19.887 26.685C16.382 26.685 13.53 23.802 13.53 20.258C13.53 17.93 14.768 15.892 16.609 14.764V11C12.765 12.35 10 16 10 20.282C10 25.682 14.434 30.075 19.887 30.075C25.335 30.075 29.77 25.682 29.77 20.282C29.77 16 27.007 12.35 23.163 11Z" fill="white"/>
                <path d="M21.708 17.889H18.072V8H21.708V17.889Z" fill="#F4312A"/>
              </g>
              <defs>
                <clipPath id="clip0_main">
                  <rect width="20" height="24" fill="white" transform="translate(10 8)"/>
                </clipPath>
              </defs>
            </svg>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-wider">ALGONOMY</span>
              <span className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">Atlas</span>
            </div>
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
