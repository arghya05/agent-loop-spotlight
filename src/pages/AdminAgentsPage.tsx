import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGovernanceStore, AgentConfig } from '@/store/governanceStore';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Bot,
  Play,
  Clock,
  CheckCircle2,
  AlertCircle,
  History,
  Settings,
  Loader2,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { toast } from 'sonner';

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

export const AdminAgentsPage = () => {
  const { agentConfigs, setAgentConfigs } = useGovernanceStore();
  const { addAuditEntry, addToolTrace, currentRole } = useAppStore();
  const [selectedLogs, setSelectedLogs] = useState<string | null>(null);
  const [configureAgent, setConfigureAgent] = useState<AgentConfig | null>(null);
  const [runningAgent, setRunningAgent] = useState<string | null>(null);
  const [editedSchedule, setEditedSchedule] = useState('');

  const toggleAgent = (agentId: string) => {
    const agent = agentConfigs.find(a => a.id === agentId);
    const updated = agentConfigs.map(a => 
      a.id === agentId ? { ...a, active: !a.active } : a
    );
    setAgentConfigs(updated);
    
    addAuditEntry({
      timestamp: new Date().toISOString(),
      actor: 'User',
      role: currentRole,
      decision: `${agent?.active ? 'Disabled' : 'Enabled'} ${agent?.agentName}`,
      toolsUsed: [],
      details: `Agent status changed to ${agent?.active ? 'inactive' : 'active'}`
    });
    
    toast.success(`${agent?.agentName} ${agent?.active ? 'disabled' : 'enabled'}`);
  };

  const openConfigDialog = (agent: AgentConfig) => {
    setConfigureAgent(agent);
    setEditedSchedule(agent.schedule);
  };

  const saveConfiguration = () => {
    if (!configureAgent) return;
    
    const updated = agentConfigs.map(a => 
      a.id === configureAgent.id ? { ...a, schedule: editedSchedule } : a
    );
    setAgentConfigs(updated);
    
    addAuditEntry({
      timestamp: new Date().toISOString(),
      actor: 'User',
      role: currentRole,
      decision: `Updated configuration for ${configureAgent.agentName}`,
      toolsUsed: [],
      details: `Schedule changed to: ${editedSchedule}`
    });
    
    toast.success(`Configuration saved for ${configureAgent.agentName}`);
    setConfigureAgent(null);
  };

  const runAgentNow = async (agent: AgentConfig) => {
    if (runningAgent || !agent.active) return;
    
    setRunningAgent(agent.id);
    
    addToolTrace({
      timestamp: new Date().toISOString(),
      toolName: agent.agentName,
      action: 'Manual run triggered',
      dataSources: ['vendor_db', 'metrics_engine'],
      duration: 0
    });

    // Simulate agent execution
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Add new log entry
    const newLog = {
      time: new Date().toISOString(),
      status: 'success' as const,
      duration: Math.floor(Math.random() * 50) + 30,
      summary: `Manual run completed - processed all vendors`
    };
    
    const updated = agentConfigs.map(a => {
      if (a.id === agent.id) {
        return {
          ...a,
          lastRun: new Date().toISOString(),
          lastOutcome: 'success' as const,
          logs: [newLog, ...a.logs.slice(0, 4)]
        };
      }
      return a;
    });
    setAgentConfigs(updated);
    
    addAuditEntry({
      timestamp: new Date().toISOString(),
      actor: 'User',
      role: currentRole,
      decision: `Manually executed ${agent.agentName}`,
      toolsUsed: [agent.id],
      details: `Run completed in ${newLog.duration}s`
    });
    
    toast.success(`${agent.agentName} run completed successfully`);
    setRunningAgent(null);
    
    // Auto-expand logs to show the new entry
    setSelectedLogs(agent.id);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agent Administration</h1>
          <p className="text-sm text-muted-foreground">Configure and monitor autonomous agents</p>
        </div>
      </div>

      {/* Agent Cards */}
      <div className="grid grid-cols-2 gap-6">
        {agentConfigs.map((agent) => {
          const isRunning = runningAgent === agent.id;
          
          return (
            <Card key={agent.id} className="card-elevated">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      agent.active ? "bg-primary/10" : "bg-muted"
                    )}>
                      <Bot className={cn(
                        "w-5 h-5",
                        agent.active ? "text-primary" : "text-muted-foreground"
                      )} />
                    </div>
                    <div>
                      <CardTitle className="text-base">{agent.agentName}</CardTitle>
                      <p className="text-xs text-muted-foreground">{agent.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={agent.active}
                    onCheckedChange={() => toggleAgent(agent.id)}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Schedule & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Clock className="w-3.5 h-3.5" />
                      Schedule
                    </div>
                    <p className="text-sm font-medium">{agent.schedule}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      {agent.lastOutcome === 'success' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-status-warning" />
                      )}
                      Last Outcome
                    </div>
                    <Badge 
                      className={cn(
                        "text-xs",
                        agent.lastOutcome === 'success' 
                          ? "bg-status-success text-white" 
                          : "bg-status-danger text-white"
                      )}
                    >
                      {agent.lastOutcome}
                    </Badge>
                  </div>
                </div>

                {/* Timing */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last Run</span>
                  <span className="font-medium">{formatDate(agent.lastRun)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Next Run</span>
                  <span className="font-medium">{formatDate(agent.nextRun)}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className={cn(
                      "flex-1",
                      selectedLogs === agent.id && "bg-muted"
                    )}
                    onClick={() => setSelectedLogs(selectedLogs === agent.id ? null : agent.id)}
                  >
                    <History className="w-4 h-4 mr-2" />
                    View Logs
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => openConfigDialog(agent)}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Configure
                  </Button>
                  <Button 
                    size="sm" 
                    disabled={!agent.active || isRunning}
                    onClick={() => runAgentNow(agent)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isRunning ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Run Now
                      </>
                    )}
                  </Button>
                </div>

                {/* Logs Expansion */}
                {selectedLogs === agent.id && (
                  <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-muted-foreground">Recent Logs</p>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-6 w-6 p-0"
                        onClick={() => setSelectedLogs(null)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {agent.logs.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-4">No logs available</p>
                      ) : (
                        agent.logs.map((log, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs p-2 rounded bg-background/50">
                            <span className="text-muted-foreground w-28 flex-shrink-0">
                              {formatDate(log.time)}
                            </span>
                            <Badge 
                              className={cn(
                                "text-[10px] px-1.5",
                                log.status === 'success' 
                                  ? "bg-status-success text-white" 
                                  : "bg-status-danger text-white"
                              )}
                            >
                              {log.status}
                            </Badge>
                            <span className="text-muted-foreground w-10 flex-shrink-0">{log.duration}s</span>
                            <span className="flex-1 text-foreground">{log.summary}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Configure Dialog */}
      <Dialog open={!!configureAgent} onOpenChange={(open) => !open && setConfigureAgent(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Configure {configureAgent?.agentName}
            </DialogTitle>
            <DialogDescription>
              {configureAgent?.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="schedule">Schedule</Label>
              <Input
                id="schedule"
                value={editedSchedule}
                onChange={(e) => setEditedSchedule(e.target.value)}
                placeholder="e.g., Every 4 hours, Daily at 06:00"
              />
              <p className="text-xs text-muted-foreground">
                Examples: "Every 2 hours", "Daily at 09:00", "On-demand"
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Agent Status</Label>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm">Active</span>
                <Switch 
                  checked={configureAgent?.active || false}
                  onCheckedChange={() => configureAgent && toggleAgent(configureAgent.id)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Last Run Statistics</Label>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 rounded bg-muted/50">
                  <p className="text-xs text-muted-foreground">Last Outcome</p>
                  <Badge 
                    className={cn(
                      "mt-1 text-xs",
                      configureAgent?.lastOutcome === 'success' 
                        ? "bg-status-success text-white" 
                        : "bg-status-danger text-white"
                    )}
                  >
                    {configureAgent?.lastOutcome}
                  </Badge>
                </div>
                <div className="p-2 rounded bg-muted/50">
                  <p className="text-xs text-muted-foreground">Run Count (Last 7 days)</p>
                  <p className="font-semibold mt-1">{configureAgent?.logs.length || 0} runs</p>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigureAgent(null)}>
              Cancel
            </Button>
            <Button onClick={saveConfiguration}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
