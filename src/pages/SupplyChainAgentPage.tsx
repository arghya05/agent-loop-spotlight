import { useMemo, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supplyChainAgents } from '@/data/supplyChainAgents';
import {
  supplyChainSignals,
  supplyBucketMeta,
  SupplyBucketId,
  SupplyChainSignal,
} from '@/data/supplyChainSignals';
import {
  ArrowLeft, Sparkles, Target, Workflow, Activity, AlertTriangle,
  TrendingDown, CheckCircle2, Clock, DollarSign, User, MapPin, ChevronRight,
  Radar, ListChecks, Database, Wand2, Play, RefreshCw, Zap, Layers, ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { AutopilotPanel, AutopilotStep } from '@/components/AutopilotPanel';

const bucketOrder: SupplyBucketId[] = ['breached', 'at-risk', 'optimized'];

const bucketIcon: Record<SupplyBucketId, typeof AlertTriangle> = {
  breached: AlertTriangle,
  'at-risk': TrendingDown,
  optimized: CheckCircle2,
};

const bucketAccent: Record<SupplyBucketId, string> = {
  breached: 'bg-status-danger/10 text-status-danger',
  'at-risk': 'bg-status-warning/10 text-status-warning',
  optimized: 'bg-status-success/10 text-status-success',
};

const fmtCurrency = (v: number) =>
  v >= 1000 ? `AED ${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}K` : `AED ${v}`;

export const SupplyChainAgentPage = () => {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const agent = supplyChainAgents.find((a) => a.id === agentId);
  const signals = useMemo(
    () => supplyChainSignals.filter((s) => s.agentId === agentId),
    [agentId]
  );
  const [selected, setSelected] = useState<SupplyChainSignal | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [bucketFilter, setBucketFilter] = useState<SupplyBucketId | 'all'>('all');
  const tableRef = useRef<HTMLDivElement>(null);

  const byBucket = useMemo(() => {
    const map = { breached: [], 'at-risk': [], optimized: [] } as Record<SupplyBucketId, SupplyChainSignal[]>;
    signals.forEach((s) => map[s.bucket].push(s));
    return map;
  }, [signals]);

  const totalImpact = signals.reduce((a, s) => a + s.estimatedImpact, 0);
  const pending = byBucket.breached.length + byBucket['at-risk'].length;
  const avgConfidence = signals.length
    ? Math.round((signals.reduce((a, s) => a + s.confidence, 0) / signals.length) * 100)
    : 0;
  const criticalCount = signals.filter((s) => s.severity === 'critical' || s.severity === 'high').length;

  if (!agent) {
    return (
      <div className="p-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/landing')}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <p className="mt-4 text-sm text-muted-foreground">Agent not found.</p>
      </div>
    );
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((r) => setTimeout(r, 1200));
    setIsRefreshing(false);
    toast.success(`${agent.shortLabel} signals refreshed`);
  };

  const runAgent = async () => {
    setIsRunning(true);
    toast.info(`${agent.shortLabel} agent running — sensing, diagnosing, and recommending…`);
    await new Promise((r) => setTimeout(r, 1400));
    setIsRunning(false);
    toast.success(`${agent.shortLabel} run complete · ${signals.length} signals refreshed · ${byBucket.breached.length} breached, ${byBucket['at-risk'].length} at risk`);
  };

  // Build agent-contextual autopilot steps from the workflow
  const autopilotSteps: AutopilotStep[] = [
    ...agent.workflow.map((step, i) => ({
      id: `step-${i}`,
      label: `Step ${i + 1} · ${step}`,
      duration: 1300 + (i % 3) * 150,
      activities: () => {
        // Distribute signals across steps for a lively log
        const slice = signals.slice(
          Math.floor((signals.length * i) / agent.workflow.length),
          Math.floor((signals.length * (i + 1)) / agent.workflow.length)
        );
        if (!slice.length) return [{ message: `${agent.shortLabel}: ${step}`, type: 'info' as const }];
        return slice.map((s) => ({
          message: `${s.entity} @ ${s.location} — ${s.metricLabel} ${s.metricValue} vs ${s.threshold}`,
          type: (s.bucket === 'breached' ? 'action' : s.bucket === 'optimized' ? 'success' : 'info') as
            'info' | 'action' | 'success',
        }));
      },
    })),
    {
      id: 'complete',
      label: `Complete · ${agent.shortLabel} recommendations issued`,
      duration: 400,
    },
  ];

  const filteredSignals = bucketFilter === 'all' ? signals : byBucket[bucketFilter];

  const scrollToTable = (b: SupplyBucketId) => {
    setBucketFilter(b);
    setTimeout(() => tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header — matches Product Onboarding layout */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">
              {agent.label} — Sense · Diagnose · Recommend
            </h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-4xl">{agent.mission}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-status-success/10 text-status-success border-status-success/20">Active</Badge>
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={cn('w-4 h-4 mr-2', isRefreshing && 'animate-spin')} />
            {isRefreshing ? 'Refreshing...' : 'Pull Signals'}
          </Button>
        </div>
      </div>

      {/* Autopilot panel — contextual to this agent's workflow */}
      <AutopilotPanel
        steps={autopilotSteps}
        queueCount={pending}
        itemLabel="signals"
        title={`${agent.shortLabel} Autopilot`}
        onComplete={(n) => {
          toast.success(`Autopilot complete · ${n} ${agent.shortLabel.toLowerCase()} actions executed`);
        }}
      />

      {/* KPI Cards — 6 across, matches Product Onboarding */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Live Signals', value: signals.length, icon: Layers },
          { label: 'Pending Actions', value: pending, icon: Zap },
          {
            label: 'Breached / At Risk / Optimized',
            value: `${byBucket.breached.length} / ${byBucket['at-risk'].length} / ${byBucket.optimized.length}`,
            icon: Activity,
          },
          { label: 'Impact at Stake', value: fmtCurrency(totalImpact), icon: DollarSign },
          { label: 'Avg Confidence', value: `${avgConfidence}%`, icon: Target },
          { label: 'Critical/High', value: criticalCount, icon: AlertTriangle },
        ].map((kpi) => (
          <Card key={kpi.label} className="card-elevated">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 mb-2">
                <kpi.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground line-clamp-1">{kpi.label}</span>
              </div>
              <p className="text-lg font-bold text-foreground">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Three Mode/Bucket Cards — mirror Product's Enrich/Validate/Activate */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {bucketOrder.map((b) => {
          const meta = supplyBucketMeta[b];
          const Icon = bucketIcon[b];
          const count = byBucket[b].length;
          return (
            <Card
              key={b}
              className="card-elevated cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/supply-chain/${agentId}/bucket/${b}`)}
            >
              <CardContent className="pt-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', bucketAccent[b])}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <Badge variant="outline" className={cn('text-xs', meta.badgeClass)}>
                    MODE · {meta.label.toUpperCase()}
                  </Badge>
                </div>
                <h3 className="font-semibold text-base mb-1">{meta.label}</h3>
                <p className="text-xs text-muted-foreground mb-3">{meta.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{count} signals</span>
                  <span className="font-medium">View queue</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Workflow strip */}
      <Card className="card-elevated">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Workflow className="w-4 h-4 text-primary" /> How it works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {agent.workflow.map((step, i) => (
              <li key={i} className="flex gap-2 items-start p-3 rounded-lg bg-muted/40 border border-border/50">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </div>
                <p className="text-xs leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Action Queue Table — mirrors Product Onboarding queue */}
      <Card className="card-elevated" ref={tableRef}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Today's {agent.shortLabel} Signal Queue
            </CardTitle>
            <div className="flex items-center gap-2">
              {(['all', ...bucketOrder] as const).map((b) => (
                <Button
                  key={b}
                  size="sm"
                  variant={bucketFilter === b ? 'default' : 'outline'}
                  className="h-7 text-xs"
                  onClick={() => setBucketFilter(b)}
                >
                  {b === 'all' ? `All (${signals.length})` : `${supplyBucketMeta[b].label} (${byBucket[b].length})`}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Entity</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Location</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Bucket</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Metric</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Confidence</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Owner</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Due</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Impact</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredSignals.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center py-6 text-xs text-muted-foreground italic">
                      No signals in this bucket
                    </td>
                  </tr>
                )}
                {filteredSignals.map((s) => {
                  const meta = supplyBucketMeta[s.bucket];
                  return (
                    <tr key={s.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-2.5 px-3 font-medium">{s.entity}</td>
                      <td className="py-2.5 px-3 text-muted-foreground text-xs">
                        <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{s.location}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge variant="outline" className={cn('text-[10px]', meta.badgeClass)}>
                          {meta.label}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-xs">
                        <span className="font-mono">{s.metricValue}</span>{' '}
                        <span className="text-muted-foreground">vs {s.threshold}</span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold">{Math.round(s.confidence * 100)}%</td>
                      <td className="py-2.5 px-3 text-xs text-muted-foreground">{s.recommendedOwner}</td>
                      <td className="py-2.5 px-3 text-xs">
                        <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{s.dueIn}</span>
                      </td>
                      <td className="py-2.5 px-3 text-xs font-medium">
                        {s.estimatedImpact > 0 ? fmtCurrency(s.estimatedImpact) : '—'}
                      </td>
                      <td className="py-2.5 px-3">
                        <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => setSelected(s)}>
                          Review <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-right">Last signal pull: {new Date().toLocaleString()}</p>

      {/* Detail dialog (unchanged) */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className={cn('text-[10px]', supplyBucketMeta[selected.bucket].badgeClass)}>
                    {supplyBucketMeta[selected.bucket].label}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">Severity: {selected.severity}</Badge>
                  <Badge variant="outline" className="text-[10px]">Confidence: {Math.round(selected.confidence * 100)}%</Badge>
                </div>
                <DialogTitle>{selected.entity}</DialogTitle>
                <DialogDescription className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {selected.location}</DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="p-3 rounded-lg bg-muted/40 border border-border/50">
                  <p className="text-[10px] uppercase text-muted-foreground">Metric</p>
                  <p className="text-sm font-semibold mt-1">{selected.metricLabel}</p>
                  <p className="text-lg font-mono">{selected.metricValue} <span className="text-xs text-muted-foreground">vs {selected.threshold}</span></p>
                </div>
                <div className="p-3 rounded-lg bg-muted/40 border border-border/50">
                  <p className="text-[10px] uppercase text-muted-foreground">Owner · Due</p>
                  <p className="text-sm font-semibold mt-1">{selected.recommendedOwner}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">In {selected.dueIn}{selected.estimatedImpact > 0 ? ` · ${fmtCurrency(selected.estimatedImpact)} at stake` : ''}</p>
                </div>
              </div>

              <div className="mt-2 p-3 rounded-lg border border-primary/20 bg-primary/5">
                <p className="text-[10px] uppercase text-primary flex items-center gap-1"><Wand2 className="w-3 h-3" /> Recommended action</p>
                <p className="text-sm mt-1">{selected.recommendedAction}</p>
              </div>

              <div className="mt-2 p-3 rounded-lg bg-muted/40 border border-border/50">
                <p className="text-[10px] uppercase text-muted-foreground">Why this signal</p>
                <p className="text-sm mt-1">{selected.reason}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="p-3 rounded-lg bg-muted/40 border border-border/50">
                  <p className="text-[10px] uppercase text-muted-foreground flex items-center gap-1"><ListChecks className="w-3 h-3" /> Evidence</p>
                  <ul className="text-xs mt-1 space-y-1 list-disc list-inside">
                    {selected.evidence.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
                <div className="p-3 rounded-lg bg-muted/40 border border-border/50">
                  <p className="text-[10px] uppercase text-muted-foreground flex items-center gap-1"><Database className="w-3 h-3" /> Sources</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selected.sources.map((s, i) => <Badge key={i} variant="outline" className="text-[10px]">{s}</Badge>)}
                  </div>
                </div>
              </div>

              <div className="mt-2 p-3 rounded-lg bg-muted/40 border border-border/50">
                <p className="text-[10px] uppercase text-muted-foreground">Action trace</p>
                <ol className="text-xs mt-1 space-y-1">
                  {selected.actionTrace.map((t, i) => (
                    <li key={i} className="flex gap-2"><span className="text-muted-foreground">{i + 1}.</span>{t}</li>
                  ))}
                </ol>
              </div>

              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={() => { toast.success('Action executed and logged to audit trail'); setSelected(null); }}>
                  Fix Now
                </Button>
                <Button size="sm" variant="outline" onClick={() => { toast.info('Investigation opened'); }}>
                  Investigate
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSelected(null)}>Close</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
