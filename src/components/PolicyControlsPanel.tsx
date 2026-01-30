import { useAppStore } from '@/store/appStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
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

  // Only show triggered policies to reduce clutter
  const triggeredPolicies = policyRules.filter(p => p.isTriggered && p.isActive);
  const inactivePolicies = policyRules.filter(p => !p.isTriggered || !p.isActive);

  return (
    <Card className="card-elevated border-l-4 border-l-status-warning">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Shield className="w-4 h-4 text-status-warning" />
            Policy Controls
          </CardTitle>
          {autopilotEnabled && (
            <Badge className="bg-status-info/20 text-status-info border-status-info/30 text-[9px]">
              <Zap className="w-3 h-3 mr-1" />
              Auto-Enforce
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Triggered Policies - Prominent */}
        {triggeredPolicies.length > 0 && (
          <div className="space-y-2">
            {triggeredPolicies.map((policy) => (
              <div 
                key={policy.id}
                className="p-3 rounded-lg bg-status-danger/10 border border-status-danger/30"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <AlertTriangle className="w-4 h-4 text-status-danger flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="text-xs font-semibold text-foreground">{policy.name}</p>
                        <Badge variant="destructive" className="text-[9px] px-1.5 py-0">
                          TRIGGERED
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-[10px]">
                        <span className="text-status-danger font-medium flex items-center gap-1">
                          <TrendingDown className="w-3 h-3" />
                          {policy.currentValue.toFixed(1)}{policy.id === 'POL003' ? ' days' : '%'}
                        </span>
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {policy.consecutiveDays}/{policy.requiredDays} days
                        </span>
                      </div>
                      <p className="text-[10px] text-status-danger mt-1.5 font-medium">
                        → {policy.action}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={policy.isActive}
                    onCheckedChange={() => togglePolicyRule(policy.id)}
                    className="scale-75 flex-shrink-0"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Other Policies - Compact */}
        <div className="space-y-1.5">
          {inactivePolicies.slice(0, 2).map((policy) => (
            <div 
              key={policy.id}
              className="p-2 rounded-lg bg-muted/30 flex items-center justify-between"
            >
              <div className="flex items-center gap-2 min-w-0">
                {getStatusIcon(policy)}
                <span className="text-xs text-muted-foreground truncate">{policy.name}</span>
              </div>
              <Switch
                checked={policy.isActive}
                onCheckedChange={() => togglePolicyRule(policy.id)}
                className="scale-75 flex-shrink-0"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
