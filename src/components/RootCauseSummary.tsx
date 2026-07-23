import { AlertTriangle, HelpCircle, TrendingDown, Wrench, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export interface RootCauseSignalLike {
  entity: string;
  location: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  bucket: 'breached' | 'at-risk' | 'optimized';
  metricLabel: string;
  metricValue: string;
  threshold: string;
  reason: string;
  evidence: string[];
  estimatedImpact: number;
  recommendedAction: string;
  recommendedOwner: string;
  confidence: number;
  dueIn: string;
}

interface Props {
  signal: RootCauseSignalLike;
  domainLabel?: string; // e.g. "Supply Chain" | "Store Ops"
}

const bucketLine = (b: RootCauseSignalLike['bucket'], metricLabel: string, metricValue: string, threshold: string) => {
  if (b === 'breached') return `${metricLabel} is at ${metricValue} — outside the acceptable range of ${threshold}.`;
  if (b === 'at-risk') return `${metricLabel} is trending toward a breach (currently ${metricValue}, target ${threshold}).`;
  return `${metricLabel} is healthy at ${metricValue} (target ${threshold}).`;
};

const impactFmt = (n: number) => {
  if (!n) return 'No revenue exposure right now.';
  if (n >= 1000) return `~$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K at risk if we don't act.`;
  return `~$${n} at risk if we don't act.`;
};

export const RootCauseSummary = ({ signal, domainLabel = 'Agent' }: Props) => {
  const what = bucketLine(signal.bucket, signal.metricLabel, signal.metricValue, signal.threshold);
  return (
    <div className="space-y-4">
      {/* Plain-English summary card */}
      <div className="p-4 rounded-lg bg-muted/40 border border-border space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Root cause · in plain English</p>
          <Badge variant="outline" className="text-[10px]">{Math.round(signal.confidence * 100)}% confidence</Badge>
        </div>

        <div className="grid gap-3">
          <div className="flex gap-3">
            <AlertTriangle className="w-4 h-4 text-status-warning mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase">What happened</p>
              <p className="text-sm">{what}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{signal.entity} · {signal.location}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <HelpCircle className="w-4 h-4 text-status-info mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase">Why it happened</p>
              <p className="text-sm">{signal.reason}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <TrendingDown className="w-4 h-4 text-status-danger mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase">Business impact</p>
              <p className="text-sm">{impactFmt(signal.estimatedImpact)}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Wrench className="w-4 h-4 text-status-success mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase">What to do next</p>
              <p className="text-sm">{signal.recommendedAction}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Owner: {signal.recommendedOwner} · Act within {signal.dueIn}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Confidence */}
      <div>
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-muted-foreground">{domainLabel} confidence</span>
          <span className="font-medium">{Math.round(signal.confidence * 100)}%</span>
        </div>
        <Progress value={signal.confidence * 100} className="h-2" />
      </div>

      {/* Evidence */}
      <div className="space-y-2 pt-2 border-t border-border">
        <p className="text-xs font-medium text-muted-foreground uppercase">Evidence the agent used</p>
        {signal.evidence.map((item, i) => (
          <div key={i} className="flex items-start gap-2 p-2 rounded bg-muted/30 text-sm">
            <CheckCircle2 className="w-4 h-4 text-status-success mt-0.5 flex-shrink-0" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
