import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePricingStore } from '@/store/pricingStore';
import signalsData from '@/data/pricing/signals.json';
import { toast } from 'sonner';
import {
  Tag,
  TrendingUp,
  Megaphone,
  Scissors,
  DollarSign,
  RefreshCw,
  Zap,
  ExternalLink,
  Activity,
  Search,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AutopilotPanel, AutopilotStep } from '@/components/AutopilotPanel';

const modeConfig = [
  { id: 'reprice', label: 'Reprice', color: 'bg-blue-500/10 text-blue-500', icon: TrendingUp, desc: 'Real-time response to competitor moves' },
  { id: 'promote', label: 'Promote', color: 'bg-purple-500/10 text-purple-500', icon: Megaphone, desc: 'Right offer, right segment, right moment' },
  { id: 'markdown', label: 'Markdown', color: 'bg-amber-500/10 text-amber-500', icon: Scissors, desc: 'Clear seasonal stock above margin floor' },
];

export const PricingLandingPage = () => {
  const navigate = useNavigate();
  const { addAuditEntry } = usePricingStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const signals = signalsData as any[];
  const pending = signals.filter(s => s.status === 'pending');
  const totalImpact = signals.reduce((s, x) => s + (x.expectedRevenueLift || 0), 0);
  const skusMonitored = 4820;

  const modeStats = modeConfig.map(m => {
    const list = signals.filter(s => s.mode === m.id);
    const impact = list.reduce((s, x) => s + x.expectedRevenueLift, 0);
    return { ...m, count: list.length, impact };
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsRefreshing(false);
    addAuditEntry({ actor: 'User', event: 'Manual refresh', details: 'Pulled external pricing signals' });
    toast.success('External signals refreshed');
  };

  const autopilotSteps: AutopilotStep[] = [
    { id: 'retrieve', label: 'Retrieve external signals', duration: 1500,
      activities: () => [
        { message: 'DataWeave: 3,210 competitor prices pulled', type: 'info' },
        { message: 'Price2Spy: 1,610 stock + price updates', type: 'info' },
        { message: 'Google Trends: 312 demand signals', type: 'info' },
        { message: 'Internal POS: 18,400 sell-through rows', type: 'info' },
      ] },
    { id: 'classify', label: 'Classify — what action is needed?', duration: 1400,
      activities: () => [{ message: `Classified ${signals.length * 24} SKUs → ${modeStats[0].count * 11} reprice / ${modeStats[1].count * 8} promote / ${modeStats[2].count * 12} markdown`, type: 'info' }] },
    { id: 'reprice', label: 'Mode 1 · Plan + execute reprice', duration: 1600,
      activities: () => signals.filter(s => s.mode === 'reprice').map(s => ({ message: `${s.sku} ${s.productName} → $${s.recommendedPrice}`, type: 'action' as const })) },
    { id: 'promote', label: 'Mode 2 · Design + launch promotions', duration: 1600,
      activities: () => signals.filter(s => s.mode === 'promote').map(s => ({ message: `${s.productName}: targeted offer to ${s.externalSources[0]} segment`, type: 'action' as const })) },
    { id: 'markdown', label: 'Mode 3 · Supervise + apply markdown', duration: 1800,
      activities: () => signals.filter(s => s.mode === 'markdown').map(s => ({ message: `${s.productName}: markdown above margin floor $${s.marginFloor}`, type: 'success' as const })) },
    { id: 'complete', label: 'Complete · prices live 24/7', duration: 400 },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Tag className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Pricing Intelligence Agent — One Agent, Three Modes</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Captures external competitor &amp; demand signals, then auto-decides Reprice · Promote · Markdown across web · app · POS
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
          {isRefreshing ? 'Refreshing...' : 'Pull Signals'}
        </Button>
      </div>

      <AutopilotPanel
        steps={autopilotSteps}
        queueCount={pending.length}
        itemLabel="signals"
        title="Pricing Intelligence Autopilot"
        onComplete={(n) => {
          toast.success(`Autopilot complete · ${n} pricing actions executed`);
          addAuditEntry({ actor: 'Autopilot Agent', event: 'Autopilot run', details: `Executed ${n} reprice/promote/markdown actions` });
        }}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-6 gap-3">
        {[
          { label: 'SKUs Monitored', value: skusMonitored.toLocaleString(), icon: Layers },
          { label: 'Signals Today', value: signals.length, icon: Activity },
          { label: 'Pending Actions', value: pending.length, icon: Zap },
          { label: 'Reprice / Promo / MD', value: `${modeStats[0].count} / ${modeStats[1].count} / ${modeStats[2].count}`, icon: Search },
          { label: 'Revenue Lift (Exp.)', value: `$${(totalImpact / 1000).toFixed(1)}K`, icon: DollarSign },
          { label: 'Margin Protected', value: '24/7', icon: TrendingUp },
        ].map((kpi) => (
          <Card key={kpi.label} className="card-elevated">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 mb-2">
                <kpi.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{kpi.label}</span>
              </div>
              <p className="text-lg font-bold text-foreground">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Three Mode Cards */}
      <div className="grid grid-cols-3 gap-4">
        {modeStats.map((m) => {
          const Icon = m.icon;
          return (
            <Card
              key={m.id}
              className="card-elevated cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/pricing/bucket/${m.id}`)}
            >
              <CardContent className="pt-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", m.color.split(' ')[0])}>
                    <Icon className={cn("w-5 h-5", m.color.split(' ')[1])} />
                  </div>
                  <Badge variant="outline" className="text-xs">MODE · {m.label.toUpperCase()}</Badge>
                </div>
                <h3 className="font-semibold text-base mb-1">{m.label}</h3>
                <p className="text-xs text-muted-foreground mb-3">{m.desc}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{m.count} SKUs</span>
                  <span className="font-medium">${(m.impact / 1000).toFixed(1)}K lift</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Today's Action Queue */}
      <Card className="card-elevated">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Today's Pricing Action Queue
            </CardTitle>
            <Badge variant="outline">{signals.length} signals</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">SKU</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Product</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Mode</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Current</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Recommended</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Comp. Avg</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Lift</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {signals.map((s) => {
                  const mode = modeConfig.find(m => m.id === s.mode);
                  return (
                    <tr key={s.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-2.5 px-3 font-mono text-xs">{s.sku}</td>
                      <td className="py-2.5 px-3 font-medium">{s.productName}</td>
                      <td className="py-2.5 px-3">
                        <Badge variant="outline" className={cn("text-[10px]", mode?.color)}>
                          {mode?.label}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3">${s.currentPrice.toFixed(2)}</td>
                      <td className="py-2.5 px-3 font-semibold">${s.recommendedPrice.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{s.competitorAvg ? `$${s.competitorAvg.toFixed(2)}` : '—'}</td>
                      <td className="py-2.5 px-3 font-medium text-status-success">+${(s.expectedRevenueLift / 1000).toFixed(1)}K</td>
                      <td className="py-2.5 px-3">
                        <Badge variant={s.status === 'pending' ? 'outline' : s.status === 'approved' ? 'default' : 'secondary'} className="text-[10px]">
                          {s.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3">
                        <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => navigate(`/pricing/signal/${s.id}`)}>
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
    </div>
  );
};
