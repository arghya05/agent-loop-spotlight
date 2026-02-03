import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useGovernanceStore } from '@/store/governanceStore';
import { 
  Bot,
  Play,
  Pause,
  Clock,
  CheckCircle2,
  AlertCircle,
  History,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

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
  const [selectedLogs, setSelectedLogs] = useState<string | null>(null);

  const toggleAgent = (agentId: string) => {
    const updated = agentConfigs.map(a => 
      a.id === agentId ? { ...a, active: !a.active } : a
    );
    setAgentConfigs(updated);
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
        {agentConfigs.map((agent) => (
          <Card key={agent.id} className="card-elevated">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    agent.active ? "bg-status-success/10" : "bg-muted"
                  )}>
                    <Bot className={cn(
                      "w-5 h-5",
                      agent.active ? "text-status-success" : "text-muted-foreground"
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
                    variant={agent.lastOutcome === 'success' ? 'default' : 'destructive'}
                    className="text-xs"
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
                  className="flex-1"
                  onClick={() => setSelectedLogs(selectedLogs === agent.id ? null : agent.id)}
                >
                  <History className="w-4 h-4 mr-2" />
                  View Logs
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Settings className="w-4 h-4 mr-2" />
                  Configure
                </Button>
                <Button size="sm" disabled={!agent.active}>
                  <Play className="w-4 h-4 mr-2" />
                  Run Now
                </Button>
              </div>

              {/* Logs Expansion */}
              {selectedLogs === agent.id && (
                <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Recent Logs</p>
                  <div className="space-y-2">
                    {agent.logs.map((log, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <span className="text-muted-foreground w-32 flex-shrink-0">
                          {formatDate(log.time)}
                        </span>
                        <Badge 
                          variant={log.status === 'success' ? 'default' : 'destructive'}
                          className="text-[10px] px-1"
                        >
                          {log.status}
                        </Badge>
                        <span className="text-muted-foreground">{log.duration}s</span>
                        <span className="flex-1">{log.summary}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
