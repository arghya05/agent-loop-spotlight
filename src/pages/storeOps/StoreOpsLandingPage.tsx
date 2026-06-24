import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AutopilotPanel, AutopilotStep } from '@/components/AutopilotPanel';
import { cn } from '@/lib/utils';
import { useStoreOpsStore } from '@/store/storeOpsStore';
import { getStoreAgent, storeBucketMeta, storeOpsAgents, storeOpsSignals, StoreAgentId, StoreBucketId } from '@/data/storeOps';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bot,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock,
  HeartHandshake,
  Layers,
  Map,
  PackageSearch,
  RefreshCw,
  ShieldAlert,
  ShoppingCart,
  Store,
  Zap,
} from 'lucide-react';

const formatToday = () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const iconMap = {
  Store,
  Layers,
  ShieldAlert,
  ShoppingCart,
  PackageSearch,
  Map,
  HeartHandshake,
  CalendarClock,
};

const bucketOrder: StoreBucketId[] = ['breached', 'at-risk', 'optimized'];

export const StoreOpsLandingPage = () => {
  const navigate = useNavigate();
  const { agentId } = useParams();
  const { addAuditEntry } = useStoreOpsStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const activeAgent = agentId ? getStoreAgent(agentId) : null;
  const scopedSignals = useMemo(
    () => activeAgent ? storeOpsSignals.filter((signal) => signal.agentId === activeAgent.id) : storeOpsSignals,
    [activeAgent]
  );

  const breached = scopedSignals.filter((signal) => signal.bucket === 'breached');
  const atRisk = scopedSignals.filter((signal) => signal.bucket === 'at-risk');
  const optimized = scopedSignals.filter((signal) => signal.bucket === 'optimized');
  const totalImpact = scopedSignals.reduce((sum, signal) => sum + signal.estimatedImpact, 0);

  const autopilotSteps: AutopilotStep[] = [
    {
      id: 'sense',
      label: 'Sense · POS, footfall, WFM, shelf, CRM',
      duration: 1200,
      activities: () => [
        { message: `${scopedSignals.length} store signals ingested across ${new Set(scopedSignals.map((s) => s.storeId)).size} stores`, type: 'info' },
        { message: `${breached.length} breached and ${atRisk.length} at-risk exceptions detected`, type: 'info' },
      ],
    },
    {
      id: 'diagnose',
      label: 'Diagnose · explain breach reasons',
      duration: 1400,
      activities: () => [...breached, ...atRisk].slice(0, 5).map((signal) => ({
        message: `${signal.storeName} · ${signal.metricLabel}: ${signal.reason}`,
        type: 'action' as const,
      })),
    },
    {
      id: 'recommend',
      label: 'Recommend · owner + action',
      duration: 1400,
      activities: () => [...breached, ...atRisk].slice(0, 5).map((signal) => ({
        message: `${signal.recommendedOwner}: ${signal.recommendedAction}`,
        type: 'action' as const,
      })),
    },
    {
      id: 'notify',
      label: 'Notify · field task created',
      duration: 900,
      activities: () => [{ message: 'Store manager nudges, task checklists, and regional escalation digest prepared', type: 'success' }],
    },
    { id: 'complete', label: 'Complete · audit trail updated', duration: 400 },
  ];

  const refresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
    addAuditEntry({ actor: 'User', event: 'Store ops refresh', details: `${activeAgent?.label || 'All Store Ops Agents'} signals refreshed` });
    toast.success('Store ops signals refreshed');
  };

  if (!activeAgent) {
    const topBreaches = storeOpsSignals.filter((signal) => signal.bucket === 'breached').slice(0, 4);

    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Store className="w-5 h-5 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Store Ops Agent Suite</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Independent store operations workspace with the same landing, bucket, detail, reason, action, audit, and autopilot patterns as Supply Chain.
            </p>
          </div>
          <Button variant="outline" onClick={refresh} disabled={isRefreshing}>
            <RefreshCw className={cn('w-4 h-4 mr-2', isRefreshing && 'animate-spin')} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Store Signals'}
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Store Agents', value: storeOpsAgents.length, icon: Bot },
            { label: 'Breached Exceptions', value: storeOpsSignals.filter((s) => s.bucket === 'breached').length, icon: AlertTriangle },
            { label: 'At Risk Exceptions', value: storeOpsSignals.filter((s) => s.bucket === 'at-risk').length, icon: Activity },
            { label: 'Value Protected', value: `$${(storeOpsSignals.reduce((sum, signal) => sum + signal.estimatedImpact, 0) / 1000).toFixed(0)}K`, icon: BarChart3 },
          ].map((kpi) => (
            <Card key={kpi.label} className="card-elevated">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <kpi.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{kpi.label}</p>
                    <p className="text-xl font-bold">{kpi.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <AutopilotPanel
          steps={autopilotSteps}
          queueCount={storeOpsSignals.filter((signal) => signal.bucket !== 'optimized').length}
          itemLabel="store exceptions"
          title="Store Ops Autopilot"
          onComplete={(count) => {
            addAuditEntry({ actor: 'Store Ops Autopilot', event: 'Autopilot run', details: `${count} store exceptions diagnosed and routed` });
            toast.success(`Store Ops Autopilot complete · ${count} exceptions routed`);
          }}
        />

        <Card className="card-elevated">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bot className="w-5 h-5 text-primary" />
                  Store Ops Agents
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  What each store agent does and the steps it follows from sense to notify
                </p>
              </div>
              <Badge variant="outline" className="text-xs">{storeOpsAgents.length} agents</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {storeOpsAgents.map((agent) => {
                const Icon = iconMap[agent.icon as keyof typeof iconMap] || Store;
                const agentSignals = storeOpsSignals.filter((signal) => signal.agentId === agent.id);
                const agentBreaches = agentSignals.filter((signal) => signal.bucket === 'breached').length;

                return (
                  <div
                    key={agent.id}
                    className="rounded-lg border border-border bg-muted/20 p-4 hover:bg-muted/40 transition-colors cursor-pointer"
                    onClick={() => navigate(`/store-ops/${agent.id}/landing`)}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-sm">{agent.label}</h3>
                          <Badge variant="outline" className={cn('text-[9px] whitespace-nowrap', agentBreaches > 0 ? storeBucketMeta.breached.badgeClass : storeBucketMeta.optimized.badgeClass)}>
                            {agentBreaches > 0 ? `${agentBreaches} breached` : 'healthy'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground italic">{agent.mission}</p>
                      </div>
                    </div>
                    <p className="text-xs text-foreground/80 mb-3 leading-relaxed">
                      {agent.description}
                    </p>
                    <div className="border-t border-border/60 pt-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                        How it works
                      </p>
                      <ol className="space-y-1.5">
                        {agent.workflow.map((step, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                            <span className="w-4 h-4 rounded-full bg-primary/10 text-primary text-[9px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                    <Button size="sm" variant="ghost" className="w-full mt-3 text-xs h-7">
                      Open {agent.shortLabel} <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Zap className="w-4 h-4 text-primary" />Top Breached Reasons</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {topBreaches.map((signal) => (
              <button key={signal.id} onClick={() => navigate(`/store-ops/${signal.agentId}/signal/${signal.id}`)} className="text-left p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/60 transition-colors">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <p className="font-medium text-sm">{signal.storeName}</p>
                  <Badge variant="outline" className={cn('text-[10px]', storeBucketMeta[signal.bucket].badgeClass)}>{storeBucketMeta[signal.bucket].label}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{signal.reason}</p>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  const Icon = iconMap[activeAgent.icon as keyof typeof iconMap] || Store;
  const bucketStats = bucketOrder.map((bucketId) => ({
    id: bucketId,
    meta: storeBucketMeta[bucketId],
    count: scopedSignals.filter((signal) => signal.bucket === bucketId).length,
    impact: scopedSignals.filter((signal) => signal.bucket === bucketId).reduce((sum, signal) => sum + signal.estimatedImpact, 0),
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Guided Demo Mode Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-lg p-4">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Zap className="w-4 h-4" />
            Guided Demo
          </div>
          <div className="flex items-center gap-4 text-sm text-foreground flex-wrap">
            {['Choose bucket', 'Pick store exception', 'Run investigation', 'Enforce & notify'].map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <span className={cn('w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center', i === 0 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground')}>
                  {i + 1}
                </span>
                <span>{label}</span>
                {i < 3 && <ChevronRight className="w-4 h-4 text-muted-foreground ml-2" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Icon className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">{activeAgent.label}</h1>
          </div>
          <p className="text-sm text-muted-foreground">{activeAgent.description}</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={refresh} disabled={isRefreshing}>
            <RefreshCw className={cn('w-4 h-4 mr-2', isRefreshing && 'animate-spin')} />
            {isRefreshing ? 'Refreshing...' : 'Pull Store Signals'}
          </Button>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>Last refresh: {formatToday()}</span>
          </div>
        </div>
      </div>


      <AutopilotPanel
        steps={autopilotSteps}
        queueCount={[...breached, ...atRisk].length}
        itemLabel="store exceptions"
        title={`${activeAgent.shortLabel} Autopilot`}
        onComplete={(count) => {
          addAuditEntry({ actor: 'Store Ops Autopilot', event: `${activeAgent.label} run`, details: `${count} exceptions diagnosed and routed` });
          toast.success(`${activeAgent.shortLabel} Autopilot complete · ${count} exceptions routed`);
        }}
      />

      <div className="grid grid-cols-5 gap-3">
        {[
          { label: activeAgent.primaryKpi, value: breached.length ? 'Breached' : 'Healthy', icon: Activity },
          { label: 'Breached', value: breached.length, icon: AlertTriangle },
          { label: 'At Risk', value: atRisk.length, icon: Zap },
          { label: 'Optimized', value: optimized.length, icon: CheckCircle2 },
          { label: 'Value at Stake', value: `$${(totalImpact / 1000).toFixed(0)}K`, icon: BarChart3 },
        ].map((kpi) => (
          <Card key={kpi.label} className="card-elevated">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <kpi.icon className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
              </div>
              <p className="text-lg font-bold">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {bucketStats.map((bucket) => (
          <Card key={bucket.id} className={cn('card-elevated cursor-pointer hover:shadow-md transition-shadow border-2', bucket.meta.panelClass)} onClick={() => navigate(`/store-ops/${activeAgent.id}/bucket/${bucket.id}`)}>
            <CardContent className="pt-5 space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className={cn('text-xs', bucket.meta.badgeClass)}>{bucket.meta.label}</Badge>
                <p className="text-2xl font-bold">{bucket.count}</p>
              </div>
              <div>
                <h3 className="font-semibold">{bucket.meta.label} Bucket</h3>
                <p className="text-xs text-muted-foreground mt-1">{bucket.meta.description}</p>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Impact</span>
                <span className="font-medium">${(bucket.impact / 1000).toFixed(0)}K</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="card-elevated">
        <CardHeader><CardTitle className="text-base">Today's {activeAgent.shortLabel} Queue</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Store</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Category</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Bucket</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Metric</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Why breached / at risk</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Owner</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {scopedSignals.map((signal) => (
                  <tr key={signal.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-2.5 px-3 font-medium">{signal.storeName}<p className="text-[10px] text-muted-foreground">{signal.storeId} · {signal.country}</p></td>
                    <td className="py-2.5 px-3">{signal.category}</td>
                    <td className="py-2.5 px-3"><Badge variant="outline" className={cn('text-[10px]', storeBucketMeta[signal.bucket].badgeClass)}>{storeBucketMeta[signal.bucket].label}</Badge></td>
                    <td className="py-2.5 px-3"><span className="font-medium">{signal.metricValue}</span><p className="text-[10px] text-muted-foreground">Target {signal.threshold}</p></td>
                    <td className="py-2.5 px-3 text-xs text-muted-foreground max-w-md">{signal.reason}</td>
                    <td className="py-2.5 px-3 text-xs">{signal.recommendedOwner}</td>
                    <td className="py-2.5 px-3 text-right"><Button size="sm" className="h-7 text-xs" onClick={() => navigate(`/store-ops/${activeAgent.id}/signal/${signal.id}`)}>Review <ArrowRight className="w-3 h-3 ml-1" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
