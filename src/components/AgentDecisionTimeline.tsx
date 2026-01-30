import { useAppStore } from '@/store/appStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  ArrowRight, 
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

const decisionIcons: Record<string, typeof TrendingUp> = {
  'continue': TrendingUp,
  'escalate': AlertTriangle,
  'rollback': RotateCcw,
  'resolved': CheckCircle2
};

const decisionColors: Record<string, string> = {
  'continue': 'text-status-info bg-status-info/10 border-status-info/30',
  'escalate': 'text-status-danger bg-status-danger/10 border-status-danger/30',
  'rollback': 'text-status-warning bg-status-warning/10 border-status-warning/30',
  'resolved': 'text-status-success bg-status-success/10 border-status-success/30'
};

export const AgentDecisionTimeline = () => {
  const { agentDecisionHistory, autopilotEnabled } = useAppStore();

  if (!autopilotEnabled || agentDecisionHistory.length === 0) {
    return null;
  }

  // Show only last 2 decisions to save space
  const recentDecisions = agentDecisionHistory.slice(-2);

  return (
    <Card className="card-elevated border-l-4 border-l-status-info">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Bot className="w-4 h-4 text-status-info" />
          Agent Decisions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {recentDecisions.map((decision, idx) => {
          const Icon = decisionIcons[decision.decision] || TrendingUp;
          const colorClass = decisionColors[decision.decision] || decisionColors.continue;
          
          return (
            <div 
              key={`${decision.day}-${idx}`}
              className={`p-2.5 rounded-lg border ${colorClass}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="text-xs font-semibold capitalize">{decision.decision}</span>
                <Badge variant="outline" className="text-[9px] ml-auto">
                  Day {decision.day}
                </Badge>
              </div>
              <p className="text-[10px] opacity-80">{decision.reason}</p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
