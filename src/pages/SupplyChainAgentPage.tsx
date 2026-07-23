import { useMemo, useState } from 'react';
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
  Radar, ListChecks, Database, Wand2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const bucketOrder: SupplyBucketId[] = ['breached', 'at-risk', 'optimized'];

const bucketIcon: Record<SupplyBucketId, typeof AlertTriangle> = {
  breached: AlertTriangle,
  'at-risk': TrendingDown,
  optimized: CheckCircle2,
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

  const byBucket = useMemo(() => {
    const map = { breached: [], 'at-risk': [], optimized: [] } as Record<SupplyBucketId, SupplyChainSignal[]>;
    signals.forEach((s) => map[s.bucket].push(s));
    return map;
  }, [signals]);

  const totalImpact = signals.reduce((a, s) => a + s.estimatedImpact, 0);

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

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Badge variant="outline" className="mb-2 text-[10px] bg-primary/10 text-primary border-primary/20">
            <Sparkles className="w-3 h-3 mr-1" /> SUPPLY CHAIN AGENT
          </Badge>
          <h1 className="text-2xl font-bold">{agent.label}</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-3xl">{agent.mission}</p>
        </div>
        <Badge className="bg-status-success/10 text-status-success border-status-success/20">Active</Badge>
      </div>

      {/* KPI + description */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-elevated">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" /> Primary KPI
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-base font-semibold">{agent.primaryKpi}</p></CardContent>
        </Card>
        <Card className="card-elevated">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Open Signals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{byBucket.breached.length + byBucket['at-risk'].length}</p>
            <p className="text-[11px] text-muted-foreground">{byBucket.breached.length} breached · {byBucket['at-risk'].length} at risk</p>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" /> Impact at stake
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{fmtCurrency(totalImpact)}</p></CardContent>
        </Card>
        <Card className="card-elevated">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" /> What this agent does
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-xs leading-relaxed text-muted-foreground">{agent.description}</p></CardContent>
        </Card>
      </div>

      {/* Workflow */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Workflow className="w-4 h-4" /> How it works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {agent.workflow.map((step, i) => (
              <li key={i} className="flex gap-2 items-start p-3 rounded-lg bg-muted/40 border border-border/50">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{i + 1}</div>
                <p className="text-xs leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Buckets */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Radar className="w-4 h-4 text-primary" /> Live signals
          </h2>
          <p className="text-xs text-muted-foreground">Click any signal for reasoning trace, evidence, and recommended action</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {bucketOrder.map((b) => {
            const meta = supplyBucketMeta[b];
            const items = byBucket[b];
            const Icon = bucketIcon[b];
            return (
              <Card key={b} className={cn('card-elevated border', meta.panelClass)}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-1.5">
                      <Icon className="w-4 h-4" /> {meta.label}
                    </CardTitle>
                    <Badge variant="outline" className={cn('text-[10px]', meta.badgeClass)}>{items.length}</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">{meta.description}</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  {items.length === 0 && (
                    <p className="text-xs text-muted-foreground italic py-4 text-center">No signals in this bucket</p>
                  )}
                  {items.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelected(s)}
                      className="w-full text-left p-3 rounded-lg bg-background hover:bg-accent/50 border border-border/60 transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{s.entity}</p>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" /> {s.location}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground flex-shrink-0" />
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-[11px]">
                        <span className="font-medium">{s.metricLabel}:</span>
                        <span className="font-mono">{s.metricValue}</span>
                        <span className="text-muted-foreground">vs {s.threshold}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1.5 line-clamp-2">
                        <span className="font-medium text-foreground">Why:</span> {s.reason}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {s.dueIn}</span>
                        <span className="flex items-center gap-1"><User className="w-3 h-3" /> {s.recommendedOwner}</span>
                        {s.estimatedImpact > 0 && (
                          <span className="flex items-center gap-1 font-medium text-foreground">
                            <DollarSign className="w-3 h-3" /> {fmtCurrency(s.estimatedImpact)}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="rounded-lg border border-dashed border-border p-4 text-center bg-muted/20">
        <p className="text-xs text-muted-foreground">
          Signals stream from connected systems. Configure sources in{' '}
          <button className="text-primary underline" onClick={() => navigate('/connectors')}>Connectors</button>
          {' '}or tune policies in{' '}
          <button className="text-primary underline" onClick={() => navigate('/settings')}>Settings</button>.
        </p>
      </div>

      {/* Detail dialog */}
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
