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
      <div className="flex items-center justify-center h-24 text-drawer-foreground/50">
        <div className="text-center">
          <Cpu className="w-6 h-6 mx-auto mb-1.5 opacity-50" />
          <p className="text-xs">Run investigation to see tool traces</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3 max-h-[140px] overflow-auto scrollbar-thin">
      {toolTraces.slice(-6).map((trace) => (
        <div 
          key={trace.id} 
          className={`p-2.5 rounded-lg ${
            trace.isRevision 
              ? 'bg-status-warning/20 border border-status-warning/30' 
              : 'bg-drawer-border/30'
          }`}
        >
          <div className="flex items-center gap-1.5 mb-1">
            {trace.isRevision ? (
              <RefreshCcw className="w-3 h-3 text-status-warning" />
            ) : (
              <Cpu className="w-3 h-3 text-status-info" />
            )}
            <span className={`text-[10px] font-semibold truncate ${trace.isRevision ? 'text-status-warning' : 'text-drawer-foreground'}`}>
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
  const { auditTrail } = useAppStore();

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
    <div className="grid grid-cols-2 gap-3 max-h-[140px] overflow-auto scrollbar-thin">
      {auditTrail.slice().reverse().slice(0, 4).map((entry) => (
        <div 
          key={entry.id} 
          className={`p-2.5 rounded-lg ${
            entry.isAutopilot 
              ? 'bg-status-info/20 border border-status-info/30' 
              : 'bg-drawer-border/30'
          }`}
        >
          <div className="flex items-center gap-1.5 mb-1">
            {entry.isAutopilot ? (
              <Bot className="w-3 h-3 text-status-info" />
            ) : (
              <User className="w-3 h-3 text-status-success" />
            )}
            <span className={`text-[10px] font-semibold truncate ${entry.isAutopilot ? 'text-status-info' : 'text-drawer-foreground'}`}>
              {entry.actor}
            </span>
            <span className="text-[8px] text-drawer-foreground/50 ml-auto flex items-center gap-0.5">
              <Clock className="w-2.5 h-2.5" />
              {formatTimestamp(entry.timestamp)}
            </span>
          </div>
          <p className={`text-[10px] font-medium truncate ${entry.isAutopilot ? 'text-status-info' : 'text-status-success'}`}>
            {entry.decision}
          </p>
        </div>
      ))}
    </div>
  );
};

export const BottomDrawer = () => {
  const { isDrawerOpen, setDrawerOpen, drawerTab, setDrawerTab, toolTraces, auditTrail } = useAppStore();

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
              <span className="text-sm font-bold text-drawer-foreground">Agent Trace & Audit</span>
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
        <Tabs value={drawerTab} onValueChange={(v) => setDrawerTab(v as 'trace' | 'audit')}>
          <TabsList className="bg-drawer-border/50 mb-3">
            <TabsTrigger value="trace" className="text-xs data-[state=active]:bg-drawer data-[state=active]:text-drawer-foreground">
              <Activity className="w-3.5 h-3.5 mr-1.5" />
              Tool Trace
            </TabsTrigger>
            <TabsTrigger value="audit" className="text-xs data-[state=active]:bg-drawer data-[state=active]:text-drawer-foreground">
              <History className="w-3.5 h-3.5 mr-1.5" />
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
