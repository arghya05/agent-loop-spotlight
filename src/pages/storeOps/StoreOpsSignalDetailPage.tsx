import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useStoreOpsStore } from '@/store/storeOpsStore';
import { getStoreAgent, storeBucketMeta, storeOpsSignals } from '@/data/storeOps';
import { ArrowLeft, Bot, CheckCircle2, Database, ListChecks, Send, ShieldCheck, UserCheck, Zap } from 'lucide-react';

export const StoreOpsSignalDetailPage = () => {
  const navigate = useNavigate();
  const { agentId, signalId } = useParams();
  const agent = getStoreAgent(agentId);
  const { addAuditEntry, updateSignal, signalOverrides } = useStoreOpsStore();
  const signal = useMemo(() => storeOpsSignals.find((item) => item.id === signalId), [signalId]);

  if (!signal) return <div className="p-6">Store ops signal not found.</div>;

  const status = signalOverrides[signal.id]?.status || signal.status;
  const bucketMeta = storeBucketMeta[signal.bucket];

  const approve = () => {
    updateSignal(signal.id, { status: 'investigating' });
    addAuditEntry({ actor: 'Store Manager', event: 'Action accepted', details: `${signal.id}: ${signal.recommendedAction}` });
    toast.success('Store action accepted and moved to investigating');
  };

  const enforce = () => {
    updateSignal(signal.id, { status: 'fixed', owner: signal.recommendedOwner });
    addAuditEntry({ actor: 'Store Ops Agent', event: 'Action enforced', details: `${signal.id}: task sent to ${signal.recommendedOwner}` });
    toast.success(`Task sent to ${signal.recommendedOwner}`);
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </Button>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="outline" className={cn('text-xs', bucketMeta.badgeClass)}>{bucketMeta.label}</Badge>
            <Badge variant="outline" className="text-xs">{agent.shortLabel}</Badge>
            <Badge variant="outline" className="text-xs">{signal.category}</Badge>
            <Badge variant="outline" className="text-xs">{status}</Badge>
          </div>
          <h1 className="text-2xl font-bold text-foreground">{signal.storeName} · {signal.department}</h1>
          <p className="text-sm text-muted-foreground">{signal.metricLabel}: <span className="font-medium text-foreground">{signal.metricValue}</span> vs target {signal.threshold}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Estimated impact</p>
          <p className="text-3xl font-bold">${(signal.estimatedImpact / 1000).toFixed(0)}K</p>
          <p className="text-xs text-muted-foreground">Confidence {Math.round(signal.confidence * 100)}%</p>
        </div>
      </div>

      <Card className="card-elevated">
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /> Multi-Agent Reasoning Trace</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2 text-xs">
            {[
              { icon: Database, label: 'SENSE', detail: signal.sources.join(' · ') },
              { icon: Bot, label: 'DIAGNOSE', detail: signal.metricLabel },
              { icon: ShieldCheck, label: 'GOVERN', detail: `Threshold ${signal.threshold}` },
              { icon: ListChecks, label: 'RECOMMEND', detail: signal.recommendedOwner },
              { icon: Send, label: 'NOTIFY', detail: signal.dueIn },
            ].map((step) => (
              <div key={step.label} className="p-3 rounded-lg bg-muted/40 border border-border">
                <step.icon className="w-4 h-4 text-primary mb-2" />
                <p className="font-semibold text-[10px] text-muted-foreground tracking-wide">{step.label}</p>
                <p className="text-xs mt-1 line-clamp-2">{step.detail}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        <Card className="card-elevated">
          <CardHeader><CardTitle className="text-sm">Why This Is {bucketMeta.label}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed">{signal.reason}</p>
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-muted-foreground">Agent confidence</span>
                <span className="font-medium">{Math.round(signal.confidence * 100)}%</span>
              </div>
              <Progress value={signal.confidence * 100} className="h-2" />
            </div>
            <div className="pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Evidence used</p>
              <div className="space-y-2">
                {signal.evidence.map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-status-success mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader><CardTitle className="text-sm">Recommended Store Action</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="p-3 rounded-lg border border-primary/20 bg-primary/5">
              <p className="font-medium">{signal.recommendedAction}</p>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-muted-foreground">Owner</span><span className="font-medium">{signal.recommendedOwner}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Due in</span><span className="font-medium">{signal.dueIn}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Severity</span><span className="font-medium capitalize">{signal.severity}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Store</span><span className="font-medium">{signal.storeId} · {signal.country}</span></div>
            </div>
            <div className="pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Tool trace</p>
              <div className="space-y-2">
                {signal.actionTrace.map((trace) => (
                  <p key={trace} className="text-xs p-2 rounded bg-muted/40">{trace}</p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="card-elevated">
        <CardContent className="pt-4">
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={approve} disabled={status === 'fixed'}>
              <UserCheck className="w-4 h-4 mr-2" /> Accept Action
            </Button>
            <Button onClick={enforce} disabled={status === 'fixed'}>
              <Send className="w-4 h-4 mr-2" /> Enforce & Notify Store
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
