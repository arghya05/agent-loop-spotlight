import { GlobalTopBar } from '@/components/GlobalTopBar';
import { SupplierHealthRadar } from '@/components/SupplierHealthRadar';
import { ExplainPanel } from '@/components/ExplainPanel';
import { EnforcePlan } from '@/components/EnforcePlan';
import { BottomDrawer } from '@/components/BottomDrawer';
import { PolicyControlsPanel } from '@/components/PolicyControlsPanel';
import { AgentDecisionTimeline } from '@/components/AgentDecisionTimeline';
import { useAppStore } from '@/store/appStore';

const Index = () => {
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

export default Index;
