import { DispatchTopBar } from '@/components/dispatch/DispatchTopBar';
import { POReadinessRadar } from '@/components/dispatch/POReadinessRadar';
import { ReadinessTimeline } from '@/components/dispatch/ReadinessTimeline';
import { AgentActionsPanel } from '@/components/dispatch/AgentActionsPanel';
import { DispatchBottomDrawer } from '@/components/dispatch/DispatchBottomDrawer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Clock, Plane, CheckCircle } from 'lucide-react';

const ROICard = () => (
  <Card className="bg-gradient-to-br from-status-success-bg to-card border-status-success/20">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-semibold flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-status-success" />
        ROI Impact
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 gap-3 text-center">
        <div>
          <div className="text-xl font-bold text-status-success">20-25%</div>
          <div className="text-[10px] text-muted-foreground">Ex-factory On-Time Improvement</div>
        </div>
        <div>
          <div className="text-xl font-bold text-primary flex items-center justify-center gap-1">
            <Clock className="w-4 h-4" />
            10-12d
          </div>
          <div className="text-[10px] text-muted-foreground">Advance Notice for Contingency</div>
        </div>
        <div>
          <div className="text-xl font-bold text-status-warning flex items-center justify-center gap-1">
            <Plane className="w-4 h-4" />
            ↓
          </div>
          <div className="text-[10px] text-muted-foreground">Reduced Air-freight Escalations</div>
        </div>
        <div>
          <div className="text-xl font-bold text-foreground flex items-center justify-center gap-1">
            <CheckCircle className="w-4 h-4 text-status-success" />
          </div>
          <div className="text-[10px] text-muted-foreground">Agentic Accountability</div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const DispatchReadinessView = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <DispatchTopBar />

      {/* Main Content */}
      <main className="pt-16 pb-16">
        <div className="px-6 py-4">
          {/* Section Headers */}
          <div className="grid grid-cols-12 gap-6 mb-4">
            <div className="col-span-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-status-danger animate-pulse" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  PO Readiness Radar
                </h2>
              </div>
            </div>
            <div className="col-span-5">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Readiness Timeline + Risk
                </h2>
              </div>
            </div>
            <div className="col-span-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-status-success" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Agent Actions + Accountability
                </h2>
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
          <div className="grid grid-cols-12 gap-6" style={{ minHeight: 'calc(100vh - 220px)' }}>
            {/* Left Column */}
            <div className="col-span-3 flex flex-col gap-4">
              <div className="flex-1">
                <POReadinessRadar />
              </div>
              <ROICard />
            </div>

            {/* Middle Column */}
            <div className="col-span-5">
              <ReadinessTimeline />
            </div>

            {/* Right Column */}
            <div className="col-span-4">
              <AgentActionsPanel />
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Drawer */}
      <DispatchBottomDrawer />
    </div>
  );
};
