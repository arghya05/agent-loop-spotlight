import { useDispatchStore } from '@/store/dispatchStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ChevronUp, ChevronDown, Activity, History, Brain,
  Clock, Cpu, User, TrendingUp, TrendingDown, AlertTriangle
} from 'lucide-react';

import learningData from '@/data/dispatch/learningMemory.json';

const formatTimestamp = (iso: string) => {
  const date = new Date(iso);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const ToolTraceTab = () => {
  const { toolTraces } = useDispatchStore();

  if (toolTraces.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 text-drawer-foreground/50">
        <div className="text-center">
          <Cpu className="w-6 h-6 mx-auto mb-1.5 opacity-50" />
          <p className="text-xs">Run agent check to see tool traces</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2 max-h-[140px] overflow-auto scrollbar-thin">
      {toolTraces.slice(-8).map((trace) => (
        <div key={trace.id} className="p-2 rounded-lg bg-drawer-border/30">
          <div className="flex items-center gap-1.5 mb-1">
            <Cpu className="w-3 h-3 text-status-info" />
            <span className="text-[10px] font-semibold text-drawer-foreground truncate">
              {trace.toolName}
            </span>
            <Badge variant="outline" className="text-[8px] border-drawer-border text-drawer-foreground/70 ml-auto px-1">
              {trace.duration.toFixed(0)}ms
            </Badge>
          </div>
          <p className="text-[9px] text-drawer-foreground/60 truncate">{trace.action}</p>
        </div>
      ))}
    </div>
  );
};

const AuditTrailTab = () => {
  const { auditTrail } = useDispatchStore();

  if (auditTrail.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 text-drawer-foreground/50">
        <div className="text-center">
          <History className="w-6 h-6 mx-auto mb-1.5 opacity-50" />
          <p className="text-xs">No audit entries yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2 max-h-[140px] overflow-auto scrollbar-thin">
      {auditTrail.slice().reverse().slice(0, 6).map((entry) => (
        <div key={entry.id} className="p-2 rounded-lg bg-drawer-border/30">
          <div className="flex items-center gap-1.5 mb-1">
            <User className="w-3 h-3 text-status-success" />
            <span className="text-[10px] font-semibold text-drawer-foreground truncate">
              {entry.actor}
            </span>
            <span className="text-[8px] text-drawer-foreground/50 ml-auto flex items-center gap-0.5">
              <Clock className="w-2.5 h-2.5" />
              {formatTimestamp(entry.timestamp)}
            </span>
          </div>
          <p className="text-[10px] font-medium text-status-info truncate">{entry.decision}</p>
          {entry.beforeRisk && entry.afterRisk && (
            <div className="flex items-center gap-1 mt-1 text-[9px]">
              <span className="text-status-danger">{(entry.beforeRisk * 100).toFixed(0)}%</span>
              <TrendingUp className="w-3 h-3 text-status-success" />
              <span className="text-status-success">{(entry.afterRisk * 100).toFixed(0)}%</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const LearningMemoryTab = () => {
  const fingerprints = learningData.supplierFingerprints;

  return (
    <div className="grid grid-cols-2 gap-3 max-h-[140px] overflow-auto scrollbar-thin">
      {fingerprints.slice(0, 4).map((fp) => (
        <div key={fp.factory_id} className="p-2 rounded-lg bg-drawer-border/30">
          <div className="flex items-center gap-1.5 mb-1">
            <Brain className="w-3 h-3 text-status-info" />
            <span className="text-[10px] font-semibold text-drawer-foreground truncate">
              {fp.name.split(' - ')[1] || fp.name}
            </span>
            <Badge 
              variant="outline" 
              className={`text-[8px] ml-auto px-1 ${
                fp.reliabilityTrend.trend === 'declining' ? 'border-status-danger text-status-danger' :
                fp.reliabilityTrend.trend === 'improving' ? 'border-status-success text-status-success' :
                'border-drawer-border text-drawer-foreground/70'
              }`}
            >
              {fp.reliabilityTrend.trend === 'declining' && <TrendingDown className="w-2 h-2 mr-0.5" />}
              {fp.reliabilityTrend.trend === 'improving' && <TrendingUp className="w-2 h-2 mr-0.5" />}
              {fp.reliabilityTrend.current}%
            </Badge>
          </div>
          <div className="text-[9px] text-drawer-foreground/60 space-y-0.5">
            {fp.riskFingerprint.recurring_delay_stage && (
              <p>
                <AlertTriangle className="w-2.5 h-2.5 inline mr-0.5 text-status-warning" />
                Recurring delay: {fp.riskFingerprint.recurring_delay_stage}
              </p>
            )}
            <p>Tier: <span className="text-drawer-foreground">{fp.accountabilityActions.current_tier}</span></p>
            {fp.agentAdjustments.length > 0 && (
              <p className="text-status-info truncate" title={fp.agentAdjustments[0]?.adjustment}>
                +{fp.agentAdjustments.length} learned adjustments
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export const DispatchBottomDrawer = () => {
  const { isDrawerOpen, setDrawerOpen, drawerTab, setDrawerTab, toolTraces, auditTrail } = useDispatchStore();

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300 ease-out ${
        isDrawerOpen ? 'translate-y-0' : 'translate-y-[calc(100%-48px)]'
      }`}
    >
      {/* Handle */}
      <div 
        className="drawer-panel rounded-t-xl cursor-pointer shadow-xl"
        onClick={() => setDrawerOpen(!isDrawerOpen)}
      >
        <div className="flex items-center justify-between px-6 py-3 border-b border-drawer-border">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-drawer-foreground/70" />
              <span className="text-sm font-bold text-drawer-foreground">Agent Trace, Audit & Learning</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px] bg-drawer-border text-drawer-foreground/70">
                {toolTraces.length} traces
              </Badge>
              <Badge variant="secondary" className="text-[10px] bg-drawer-border text-drawer-foreground/70">
                {auditTrail.length} audit
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-drawer-foreground/70 hover:text-drawer-foreground hover:bg-drawer-border/50">
            {isDrawerOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="drawer-panel px-6 py-4">
        <Tabs value={drawerTab} onValueChange={(v) => setDrawerTab(v as 'trace' | 'audit' | 'learning')}>
          <TabsList className="bg-drawer-border/50 mb-3">
            <TabsTrigger value="trace" className="text-xs data-[state=active]:bg-drawer data-[state=active]:text-drawer-foreground">
              <Activity className="w-3.5 h-3.5 mr-1.5" />
              Tool Trace
            </TabsTrigger>
            <TabsTrigger value="audit" className="text-xs data-[state=active]:bg-drawer data-[state=active]:text-drawer-foreground">
              <History className="w-3.5 h-3.5 mr-1.5" />
              Audit Trail
            </TabsTrigger>
            <TabsTrigger value="learning" className="text-xs data-[state=active]:bg-drawer data-[state=active]:text-drawer-foreground">
              <Brain className="w-3.5 h-3.5 mr-1.5" />
              Supplier Learning
            </TabsTrigger>
          </TabsList>
          <TabsContent value="trace" className="mt-0">
            <ToolTraceTab />
          </TabsContent>
          <TabsContent value="audit" className="mt-0">
            <AuditTrailTab />
          </TabsContent>
          <TabsContent value="learning" className="mt-0">
            <LearningMemoryTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
