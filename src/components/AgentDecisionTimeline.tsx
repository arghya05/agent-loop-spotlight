import { useAppStore } from '@/store/appStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp,
  RotateCcw,
  Flag
} from 'lucide-react';

export const AgentDecisionTimeline = () => {
  const { agentDecisionHistory, currentDay, autopilotEnabled } = useAppStore();

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case 'continue': return <ArrowRight className="w-3.5 h-3.5 text-status-info" />;
      case 'escalate': return <AlertTriangle className="w-3.5 h-3.5 text-status-danger" />;
      case 'rollback': return <RotateCcw className="w-3.5 h-3.5 text-status-warning" />;
      case 'resolved': return <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />;
      default: return <Flag className="w-3.5 h-3.5 text-muted-foreground" />;
    }
  };

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'continue': return 'bg-status-info-bg text-status-info border-status-info/30';
      case 'escalate': return 'bg-status-danger-bg text-status-danger border-status-danger/30';
      case 'rollback': return 'bg-status-warning-bg text-status-warning border-status-warning/30';
      case 'resolved': return 'bg-status-success-bg text-status-success border-status-success/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (agentDecisionHistory.length === 0) {
    return (
      <Card className="card-elevated">
        <CardContent className="p-4 text-center">
          <Bot className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
          <p className="text-xs text-muted-foreground">
            {autopilotEnabled 
              ? 'Simulate days to see agent decisions'
              : 'Enable autopilot and simulate days'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Bot className="w-4 h-4" />
            Agent Decision Timeline
          </CardTitle>
          <Badge variant="outline" className="text-[10px]">
            Day {currentDay}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 max-h-[200px] overflow-auto scrollbar-thin">
        {agentDecisionHistory.slice().reverse().map((entry, idx) => (
          <div 
            key={`${entry.day}-${idx}`}
            className={`p-2.5 rounded-lg border ${getDecisionColor(entry.decision)}`}
          >
            <div className="flex items-center gap-2 mb-1">
              {getDecisionIcon(entry.decision)}
              <span className="text-xs font-medium">Day {entry.day}</span>
              <Badge 
                variant="outline" 
                className={`text-[9px] px-1.5 py-0 ml-auto ${getDecisionColor(entry.decision)}`}
              >
                {entry.decision.toUpperCase()}
              </Badge>
            </div>
            <p className="text-[10px] opacity-80">{entry.reason}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
