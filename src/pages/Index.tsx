import { GlobalTopBar } from '@/components/GlobalTopBar';
import { SupplierHealthRadar } from '@/components/SupplierHealthRadar';
import { ExplainPanel } from '@/components/ExplainPanel';
import { EnforcePlan } from '@/components/EnforcePlan';
import { BottomDrawer } from '@/components/BottomDrawer';
import { PolicyControlsPanel } from '@/components/PolicyControlsPanel';
import { AgentDecisionTimeline } from '@/components/AgentDecisionTimeline';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Global Top Bar */}
      <GlobalTopBar />

      {/* Main Content - 3 Column Layout */}
      <main className="pt-14 pb-[260px]">
        <div className="grid grid-cols-12 gap-4 p-4 h-[calc(100vh-56px-260px)] min-h-[600px]">
          {/* Left Column: Supplier Health Radar + Policy Controls */}
          <div className="col-span-3 overflow-hidden flex flex-col gap-4">
            <div className="flex-1 min-h-0">
              <p className="section-header mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-status-info" />
                Supplier Health Radar
              </p>
              <SupplierHealthRadar />
            </div>
            <div className="flex-shrink-0">
              <PolicyControlsPanel />
            </div>
          </div>

          {/* Middle Column: Explain */}
          <div className="col-span-5 overflow-hidden">
            <div className="h-full">
              <p className="section-header mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Explain
              </p>
              <ExplainPanel />
            </div>
          </div>

          {/* Right Column: Enforce Plan + Agent Timeline */}
          <div className="col-span-4 overflow-hidden flex flex-col gap-4">
            <div className="flex-1 min-h-0">
              <p className="section-header mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-status-success" />
                Enforce Plan
              </p>
              <EnforcePlan />
            </div>
            <div className="flex-shrink-0">
              <AgentDecisionTimeline />
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
