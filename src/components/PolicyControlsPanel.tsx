import { useAppStore } from '@/store/appStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  Zap
} from 'lucide-react';

export const PolicyControlsPanel = () => {
  const { policyRules, togglePolicyRule, autopilotEnabled } = useAppStore();

  const getStatusIcon = (policy: typeof policyRules[0]) => {
    if (!policy.isActive) return <XCircle className="w-4 h-4 text-muted-foreground" />;
    if (policy.isTriggered) return <AlertTriangle className="w-4 h-4 text-status-danger" />;
    return <CheckCircle2 className="w-4 h-4 text-status-success" />;
  };

  const getValueTrend = (policy: typeof policyRules[0]) => {
    const isAboveThreshold = policy.id === 'POL001' || policy.id === 'POL003' 
      ? policy.currentValue > policy.threshold
      : policy.currentValue < policy.threshold;
    
    return isAboveThreshold 
      ? <TrendingDown className="w-3 h-3 text-status-danger" />
      : <TrendingUp className="w-3 h-3 text-status-success" />;
  };

  return (
    <Card className="card-elevated border-l-4 border-l-primary">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Policy Controls
          </CardTitle>
          {autopilotEnabled && (
            <Badge className="bg-status-info text-white text-[9px] flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Auto-Enforce
            </Badge>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground">
          Agent enforces these rules automatically when conditions are met
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {policyRules.map((policy) => (
          <div 
            key={policy.id}
            className={`p-3 rounded-lg border transition-all ${
              policy.isTriggered && policy.isActive 
                ? 'bg-status-danger-bg border-status-danger/30' 
                : 'bg-muted/30 border-transparent'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 flex-1">
                {getStatusIcon(policy)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs font-medium">{policy.name}</p>
                    {policy.isTriggered && policy.isActive && (
                      <Badge variant="destructive" className="text-[9px] px-1.5 py-0">
                        TRIGGERED
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="text-muted-foreground">Condition:</span>
                      <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">
                        {policy.condition}
                      </code>
                    </div>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="text-muted-foreground">Action:</span>
                      <span className={policy.isTriggered && policy.isActive ? 'text-status-danger font-medium' : ''}>
                        {policy.action}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <span className="text-muted-foreground">Current:</span>
                        <span className={`font-medium ${policy.isTriggered ? 'text-status-danger' : 'text-status-success'}`}>
                          {policy.currentValue.toFixed(1)}{policy.id === 'POL003' ? ' days' : '%'}
                        </span>
                        {getValueTrend(policy)}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {policy.consecutiveDays}/{policy.requiredDays} days
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <Switch
                checked={policy.isActive}
                onCheckedChange={() => togglePolicyRule(policy.id)}
                className="scale-75"
              />
            </div>
          </div>
        ))}

        {/* Enforcement Log Preview */}
        {policyRules.some(p => p.isTriggered && p.isActive) && (
          <div className="p-2 bg-drawer rounded-lg border border-drawer-border">
            <p className="text-[10px] font-medium text-drawer-foreground mb-1 flex items-center gap-1">
              <Zap className="w-3 h-3 text-status-warning" />
              Recent Enforcement
            </p>
            <p className="text-[9px] text-drawer-foreground/70">
              ASN Quality Gate activated at 10:00 AM. New PO release frozen pending compliance resolution.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
