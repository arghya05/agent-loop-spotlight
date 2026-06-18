import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useInventoryStore } from '@/store/inventoryStore';
import signalsData from '@/data/inventory/signals.json';
import { toast } from 'sonner';
import {
  Package,
  PackagePlus,
  ArrowLeftRight,
  Eye,
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
  { id: 'replenish', label: 'Replenish', color: 'bg-blue-500/10 text-blue-500', icon: PackagePlus, desc: 'ForecastAgent → InventoryAgent → OrderAgent → SupplierSystem' },
  { id: 'transfer', label: 'Transfer', color: 'bg-purple-500/10 text-purple-500', icon: ArrowLeftRight, desc: 'Rebalance network stock before paying expedite fees' },
  { id: 'monitor', label: 'Monitor', color: 'bg-emerald-500/10 text-emerald-500', icon: Eye, desc: 'Stock levels sufficient — monitor continuously' },
];

export const InventoryLandingPage = () => {
  const navigate = useNavigate();
  const { addAuditEntry } = useInventoryStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const signals = signalsData as any[];
  const pending = signals.filter(s => s.status === 'pending');
  const totalSavings = signals.reduce((s, x) => s + (x.expectedSavings || 0), 0);
  const skusMonitored = 6240;

  const modeStats = modeConfig.map(m => {
    const list = signals.filter(s => s.mode === m.id);
    const impact = list.reduce((s, x) => s + x.expectedSavings, 0);
    return { ...m, count: list.length, impact };
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsRefreshing(false);
    addAuditEntry({ actor: 'User', event: 'Manual refresh', details: 'Pulled forecast + stock signals' });
    toast.success('Inventory signals refreshed');
  };

  const autopilotSteps: AutopilotStep[] = [
    { id: 'forecast', label: 'ForecastAgent · Provide updated demand forecast', duration: 1500,
      activities: () => [
        { message: 'POS Live: 18,400 sell-through rows processed', type: 'info' },
        { message: 'Google Trends: 312 demand signals', type: 'info' },
        { message: 'Demand re-forecasted for 142 SKUs', type: 'info' },
      ] },
    { id: 'inventory', label: 'InventoryAgent · Check current stock vs forecast', duration: 1400,
      activities: () => [{ message: `${signals.length * 24} SKUs evaluated → ${modeStats[0].count * 11} below ROP / ${modeStats[1].count * 8} overstock pockets / ${modeStats[2].count * 12} healthy`, type: 'info' }] },
    { id: 'replenish', label: 'OrderAgent · Trigger reorder requests', duration: 1600,
      activities: () => signals.filter(s => s.mode === 'replenish').map(s => ({ message: `${s.sku} ${s.productName} → PO ${s.recommendedQty} units · ${s.recommendedSupplier}`, type: 'action' as const })) },
    { id: 'transfer', label: 'InventoryAgent · Rebalance via stock transfer', duration: 1600,
      activities: () => signals.filter(s => s.mode === 'transfer').map(s => ({ message: `${s.productName}: STO ${s.recommendedQty} units → ${s.channels[0]}`, type: 'action' as const })) },
    { id: 'supplier', label: 'SupplierSystem · Confirm orders and delivery schedule', duration: 1500,
      activities: () => signals.filter(s => s.mode === 'replenish').map(s => ({ message: `${s.recommendedSupplier} confirmed ${s.po} · ETA ${s.leadTimeDays}d`, type: 'success' as const })) },
    { id: 'complete', label: 'Complete · inventory records updated', duration: 400 },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Autonomous Inventory Agent — Forecast · Stock · Order</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Multi-agent workflow: ForecastAgent → InventoryAgent → OrderAgent → SupplierSystem · Replenish · Transfer · Monitor across the network
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
        title="Autonomous Inventory Autopilot"
        onComplete={(n) => {
          toast.success(`Autopilot complete · ${n} inventory actions executed`);
          addAuditEntry({ actor: 'Autopilot Agent', event: 'Autopilot run', details: `Executed ${n} replenish/transfer/monitor actions` });
        }}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-6 gap-3">
        {[
          { label: 'SKUs Monitored', value: skusMonitored.toLocaleString(), icon: Layers },
          { label: 'Signals Today', value: signals.length, icon: Activity },
          { label: 'Pending Actions', value: pending.length, icon: Zap },
          { label: 'Replenish / Xfer / Monitor', value: `${modeStats[0].count} / ${modeStats[1].count} / ${modeStats[2].count}`, icon: Search },
          { label: 'Savings (Exp.)', value: `$${(totalSavings / 1000).toFixed(1)}K`, icon: DollarSign },
          { label: 'Stockout Coverage', value: '24/7', icon: PackagePlus },
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
              onClick={() => navigate(`/inventory/bucket/${m.id}`)}
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
                  <span className="font-medium">${(m.impact / 1000).toFixed(1)}K saved</span>
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
              Today's Inventory Action Queue
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
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">On Hand</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">ROP</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Forecast 14d</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Action</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Status</th>
                  <th></th>
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
                      <td className="py-2.5 px-3">{s.onHand.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{s.reorderPoint.toLocaleString()}</td>
                      <td className="py-2.5 px-3 font-semibold">{s.forecast14d.toLocaleString()}</td>
                      <td className="py-2.5 px-3 font-medium">{s.recommendedQty > 0 ? `${s.recommendedQty.toLocaleString()} units` : '—'}</td>
                      <td className="py-2.5 px-3">
                        <Badge variant={s.status === 'pending' ? 'outline' : s.status === 'approved' ? 'default' : 'secondary'} className="text-[10px]">
                          {s.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3">
                        <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => navigate(`/inventory/signal/${s.id}`)}>
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
