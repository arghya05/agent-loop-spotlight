import { useAppStore } from '@/store/appStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronUp, 
  ChevronDown, 
  Activity, 
  History,
  Clock,
  Cpu,
  Database,
  User,
  RefreshCcw,
  Bot
} from 'lucide-react';

const formatTimestamp = (iso: string) => {
  const date = new Date(iso);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const ToolTraceTab = () => {
  const { toolTraces } = useAppStore();

  if (toolTraces.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-drawer-foreground/50">
        <div className="text-center">
          <Cpu className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-xs">Run investigation to see tool traces</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[200px] overflow-auto scrollbar-thin">
      {toolTraces.map((trace) => (
        <div 
          key={trace.id} 
          className={`p-3 rounded-lg ${
            trace.isRevision 
              ? 'bg-status-warning/20 border border-status-warning/30' 
              : 'bg-drawer-border/30'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              {trace.isRevision ? (
                <RefreshCcw className="w-3.5 h-3.5 text-status-warning" />
              ) : (
                <Cpu className="w-3.5 h-3.5 text-status-info" />
              )}
              <span className={`text-xs font-medium ${trace.isRevision ? 'text-status-warning' : 'text-drawer-foreground'}`}>
                {trace.toolName}
              </span>
              {trace.isRevision && (
                <Badge className="bg-status-warning text-white text-[8px] px-1 py-0">
                  REVISION
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[9px] border-drawer-border text-drawer-foreground/70">
                {trace.duration.toFixed(0)}ms
              </Badge>
              <span className="text-[10px] text-drawer-foreground/50 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTimestamp(trace.timestamp)}
              </span>
            </div>
          </div>
          <p className={`text-[11px] mb-1 ${trace.isRevision ? 'text-status-warning' : 'text-drawer-foreground/70'}`}>
            {trace.action}
          </p>
          <div className="flex items-center gap-1 flex-wrap">
            <Database className="w-3 h-3 text-drawer-foreground/40" />
            {trace.dataSources.map((ds, i) => (
              <Badge 
                key={i} 
                variant="secondary" 
                className="text-[9px] bg-drawer-border/50 text-drawer-foreground/60 px-1.5 py-0"
              >
                {ds}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const AuditTrailTab = () => {
  const { auditTrail } = useAppStore();

  if (auditTrail.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-drawer-foreground/50">
        <div className="text-center">
          <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-xs">No audit entries yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[200px] overflow-auto scrollbar-thin">
      {auditTrail.slice().reverse().map((entry) => (
        <div 
          key={entry.id} 
          className={`p-3 rounded-lg ${
            entry.isAutopilot 
              ? 'bg-status-info/20 border border-status-info/30' 
              : 'bg-drawer-border/30'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              {entry.isAutopilot ? (
                <Bot className="w-3.5 h-3.5 text-status-info" />
              ) : (
                <User className="w-3.5 h-3.5 text-status-success" />
              )}
              <span className={`text-xs font-medium ${entry.isAutopilot ? 'text-status-info' : 'text-drawer-foreground'}`}>
                {entry.actor}
              </span>
              <Badge variant="outline" className="text-[9px] border-drawer-border text-drawer-foreground/70">
                {entry.role}
              </Badge>
              {entry.isAutopilot && (
                <Badge className="bg-status-info text-white text-[8px] px-1 py-0">
                  AUTO
                </Badge>
              )}
            </div>
            <span className="text-[10px] text-drawer-foreground/50 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTimestamp(entry.timestamp)}
            </span>
          </div>
          <p className={`text-xs font-medium mb-1 ${entry.isAutopilot ? 'text-status-info' : 'text-status-success'}`}>
            {entry.decision}
          </p>
          <p className="text-[10px] text-drawer-foreground/60">{entry.details}</p>
          {entry.toolsUsed.length > 0 && (
            <div className="flex items-center gap-1 mt-1.5 flex-wrap">
              <span className="text-[9px] text-drawer-foreground/40">Tools:</span>
              {entry.toolsUsed.map((tool, i) => (
                <Badge 
                  key={i} 
                  variant="secondary" 
                  className="text-[9px] bg-drawer-border/50 text-drawer-foreground/60 px-1.5 py-0"
                >
                  {tool}
                </Badge>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export const BottomDrawer = () => {
  const { isDrawerOpen, setDrawerOpen, drawerTab, setDrawerTab, toolTraces, auditTrail } = useAppStore();

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300 ${
        isDrawerOpen ? 'translate-y-0' : 'translate-y-[calc(100%-44px)]'
      }`}
    >
      {/* Handle */}
      <div 
        className="drawer-panel rounded-t-xl cursor-pointer"
        onClick={() => setDrawerOpen(!isDrawerOpen)}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-drawer-border">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-drawer-foreground/70" />
              <span className="text-sm font-semibold text-drawer-foreground">Agent Trace & Audit</span>
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
          <Button variant="ghost" size="icon" className="h-6 w-6 text-drawer-foreground/70 hover:text-drawer-foreground">
            {isDrawerOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="drawer-panel px-4 pb-4">
        <Tabs value={drawerTab} onValueChange={(v) => setDrawerTab(v as 'trace' | 'audit')}>
          <TabsList className="bg-drawer-border/50 mb-3">
            <TabsTrigger value="trace" className="text-xs data-[state=active]:bg-drawer data-[state=active]:text-drawer-foreground">
              <Activity className="w-3.5 h-3.5 mr-1" />
              Tool Trace
            </TabsTrigger>
            <TabsTrigger value="audit" className="text-xs data-[state=active]:bg-drawer data-[state=active]:text-drawer-foreground">
              <History className="w-3.5 h-3.5 mr-1" />
              Audit Trail
            </TabsTrigger>
          </TabsList>
          <TabsContent value="trace" className="mt-0">
            <ToolTraceTab />
          </TabsContent>
          <TabsContent value="audit" className="mt-0">
            <AuditTrailTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
