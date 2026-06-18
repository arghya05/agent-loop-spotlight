import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useProductStore } from '@/store/productStore';
import itemsData from '@/data/product/items.json';
import { toast } from 'sonner';
import {
  PackageOpen,
  Sparkles,
  ShieldCheck,
  Rocket,
  RefreshCw,
  Zap,
  ExternalLink,
  Activity,
  Layers,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AutopilotPanel, AutopilotStep } from '@/components/AutopilotPanel';

const modeConfig = [
  { id: 'enrich', label: 'Enrich', color: 'bg-blue-500/10 text-blue-500', icon: Sparkles, desc: 'IntakeAgent → EnrichAgent → Image & Copy Agent fills catalog gaps' },
  { id: 'validate', label: 'Validate', color: 'bg-amber-500/10 text-amber-500', icon: ShieldCheck, desc: 'ValidateAgent + ComplianceAgent gate policy and regulatory checks' },
  { id: 'activate', label: 'Activate', color: 'bg-emerald-500/10 text-emerald-500', icon: Rocket, desc: 'ActivateAgent publishes to channels and notifies Pricing + Inventory' },
];

export const ProductLandingPage = () => {
  const navigate = useNavigate();
  const { addAuditEntry } = useProductStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const items = itemsData as any[];
  const pending = items.filter(s => s.status === 'pending');
  const avgCompleteness = Math.round(items.reduce((s, x) => s + x.completeness, 0) / items.length);

  const modeStats = modeConfig.map(m => {
    const list = items.filter(s => s.mode === m.id);
    return { ...m, count: list.length };
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsRefreshing(false);
    addAuditEntry({ actor: 'User', event: 'Manual refresh', details: 'Pulled new-item submissions + validation results' });
    toast.success('Product onboarding queue refreshed');
  };

  const autopilotSteps: AutopilotStep[] = [
    { id: 'intake', label: 'IntakeAgent · Pull new-item submissions', duration: 1400,
      activities: () => [
        { message: 'Supplier SFTP: 18 packets received from 6 suppliers', type: 'info' },
        { message: 'PIM draft records created for 18 SKUs', type: 'info' },
      ] },
    { id: 'enrich', label: 'EnrichAgent · Fill catalog gaps', duration: 1600,
      activities: () => items.filter(s => s.mode === 'enrich').map(s => ({ message: `${s.sku} ${s.productName} → filled ${s.missingFields.length} fields`, type: 'action' as const })) },
    { id: 'imagecopy', label: 'Image & Copy Agent · Generate marketing assets', duration: 1500,
      activities: () => [{ message: '11 bullet packs generated · 2 images flagged below 1500px policy', type: 'info' }] },
    { id: 'validate', label: 'ValidateAgent + ComplianceAgent · Gate checks', duration: 1500,
      activities: () => items.filter(s => s.mode === 'validate').map(s => ({ message: `${s.sku}: ${s.validationIssues.length} issue(s) flagged`, type: 'info' as const })) },
    { id: 'activate', label: 'ActivateAgent · Publish to channels', duration: 1600,
      activities: () => items.filter(s => s.mode === 'activate').map(s => ({ message: `${s.productName} published to ${s.channels.length} channels`, type: 'success' as const })) },
    { id: 'bridge', label: 'BridgeNotifier · Trigger Pricing + Inventory', duration: 1200,
      activities: () => [{ message: 'Pricing signals + replenishment plans triggered for activated SKUs', type: 'success' }] },
    { id: 'complete', label: 'Complete · onboarding records updated', duration: 400 },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <PackageOpen className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Product Onboarding Agent — Enrich · Validate · Activate</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Multi-agent workflow: IntakeAgent → EnrichAgent → Image & Copy → ValidateAgent + ComplianceAgent → ActivateAgent → BridgeNotifier
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
          {isRefreshing ? 'Refreshing...' : 'Pull Submissions'}
        </Button>
      </div>

      <AutopilotPanel
        steps={autopilotSteps}
        queueCount={pending.length}
        itemLabel="new SKUs"
        title="Product Onboarding Autopilot"
        onComplete={(n) => {
          toast.success(`Autopilot complete · ${n} onboarding actions executed`);
          addAuditEntry({ actor: 'Autopilot Agent', event: 'Autopilot run', details: `Processed ${n} enrich/validate/activate actions` });
        }}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-6 gap-3">
        {[
          { label: 'New SKUs (Queue)', value: items.length, icon: Layers },
          { label: 'Pending Actions', value: pending.length, icon: Zap },
          { label: 'Enrich / Validate / Activate', value: `${modeStats[0].count} / ${modeStats[1].count} / ${modeStats[2].count}`, icon: Activity },
          { label: 'Avg Completeness', value: `${avgCompleteness}%`, icon: ShieldCheck },
          { label: 'Avg Time-to-Live', value: '2.1d', icon: Clock },
          { label: 'Auto-Enrichment', value: '24/7', icon: Sparkles },
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
              onClick={() => navigate(`/product/bucket/${m.id}`)}
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
                  <span className="font-medium">In queue</span>
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
              Today's Onboarding Queue
            </CardTitle>
            <Badge variant="outline">{items.length} new SKUs</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">SKU</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Product</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Supplier</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Mode</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Completeness</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Issues</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Channels</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((s) => {
                  const mode = modeConfig.find(m => m.id === s.mode);
                  const issueCount = (s.missingFields?.length || 0) + (s.validationIssues?.length || 0);
                  return (
                    <tr key={s.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-2.5 px-3 font-mono text-xs">{s.sku}</td>
                      <td className="py-2.5 px-3 font-medium">{s.productName}</td>
                      <td className="py-2.5 px-3 text-muted-foreground text-xs">{s.supplier}</td>
                      <td className="py-2.5 px-3">
                        <Badge variant="outline" className={cn("text-[10px]", mode?.color)}>
                          {mode?.label}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 font-semibold">{s.completeness}%</td>
                      <td className="py-2.5 px-3">{issueCount > 0 ? <Badge variant="outline" className="text-[10px]">{issueCount} open</Badge> : <span className="text-xs text-muted-foreground">—</span>}</td>
                      <td className="py-2.5 px-3 text-xs text-muted-foreground">{s.channels.length} channels</td>
                      <td className="py-2.5 px-3">
                        <Badge variant={s.status === 'pending' ? 'outline' : s.status === 'approved' ? 'default' : 'secondary'} className="text-[10px]">
                          {s.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3">
                        <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => navigate(`/product/item/${s.id}`)}>
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

      <p className="text-xs text-muted-foreground text-right">Last submission pull: {new Date().toLocaleString()}</p>
    </div>
  );
};
