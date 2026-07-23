import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import signalsData from '@/data/inventory/signals.json';
import { useInventoryStore } from '@/store/inventoryStore';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle2, XCircle, Send, Zap, Database, Brain, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RootCauseSummary } from '@/components/RootCauseSummary';

const modeColor: Record<string, string> = {
  replenish: 'bg-blue-500/10 text-blue-500',
  transfer: 'bg-purple-500/10 text-purple-500',
  monitor: 'bg-emerald-500/10 text-emerald-500',
};

export const InventorySignalDetailPage = () => {
  const { signalId } = useParams();
  const navigate = useNavigate();
  const { addAuditEntry, updateSignal, signalOverrides } = useInventoryStore();
  const s = (signalsData as any[]).find(x => x.id === signalId);

  if (!s) return <div className="p-6">Signal not found.</div>;

  const override = signalOverrides[s.id] || {};
  const status = override.status || s.status;
  const coverDays = s.forecast14d > 0 ? ((s.onHand + s.inTransit) / (s.forecast14d / 14)).toFixed(1) : '—';

  const approve = () => {
    updateSignal(s.id, { status: 'approved', approvedQty: s.recommendedQty });
    addAuditEntry({ actor: 'User', event: 'Order approved', details: `${s.sku} ${s.productName} → ${s.recommendedQty} units` });
    toast.success(`Approved ${s.recommendedQty} units for ${s.sku}`);
  };
  const reject = () => {
    updateSignal(s.id, { status: 'rejected' });
    addAuditEntry({ actor: 'User', event: 'Order rejected', details: `${s.sku} recommendation rejected` });
    toast.info('Recommendation rejected');
  };
  const publish = () => {
    updateSignal(s.id, { status: 'executed' });
    addAuditEntry({ actor: 'OrderAgent', event: 'Order placed', details: `${s.po} → ${s.recommendedSupplier} · ${s.recommendedQty} units · ETA ${s.leadTimeDays}d` });
    toast.success(`Order placed with ${s.recommendedSupplier}`);
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className={cn('text-xs', modeColor[s.mode])}>MODE · {s.mode.toUpperCase()}</Badge>
            <Badge variant="outline" className="text-xs">{s.category}</Badge>
            <Badge variant="outline" className="text-xs">{s.location}</Badge>
            <Badge variant={status === 'executed' ? 'default' : status === 'approved' ? 'default' : 'outline'} className="text-xs">{status}</Badge>
          </div>
          <h1 className="text-2xl font-bold">{s.productName}</h1>
          <p className="text-sm text-muted-foreground font-mono">{s.sku}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Recommended Order</p>
          <p className="text-3xl font-bold">{s.recommendedQty > 0 ? `${s.recommendedQty.toLocaleString()} u` : '—'}</p>
          <p className="text-xs font-medium text-muted-foreground">via {s.recommendedSupplier}</p>
        </div>
      </div>

      {/* Agent Flow */}
      <Card className="card-elevated">
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /> Multi-Agent Reasoning Trace</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2 text-xs">
            {[
              { icon: Database, label: 'FORECAST', detail: `${s.demandTrend} · 14d` },
              { icon: Brain, label: 'INVENTORY', detail: `On hand ${s.onHand}` },
              { icon: Zap, label: 'ORDER', detail: s.recommendedQty > 0 ? `→ ${s.recommendedQty}u` : 'No action' },
              { icon: ShieldCheck, label: 'SUPERVISE', detail: `Safety ${s.safetyStock}` },
              { icon: Send, label: 'SUPPLIER', detail: s.recommendedSupplier !== '—' ? s.recommendedSupplier.split(' ').slice(0, 2).join(' ') : '—' },
            ].map((step, i) => (
              <div key={i} className="p-3 rounded-lg bg-muted/40 border border-border">
                <step.icon className="w-4 h-4 text-primary mb-2" />
                <p className="font-semibold text-[10px] text-muted-foreground tracking-wide">{step.label}</p>
                <p className="text-xs mt-1">{step.detail}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* Demand / Stock signals */}
        <Card className="card-elevated">
          <CardHeader><CardTitle className="text-sm">Demand &amp; Stock Signals</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">On Hand</span><span className="font-medium">{s.onHand.toLocaleString()} units</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">In Transit</span><span className="font-medium">{s.inTransit.toLocaleString()} units</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Cover Days</span><span className="font-medium">{coverDays}d</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Forecast 14d</span><span className="font-medium">{s.forecast14d.toLocaleString()} units · {s.demandTrend}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Stockout Risk</span><span className="font-medium">{s.stockoutRiskPct}%</span></div>
            <Progress value={s.stockoutRiskPct} className="h-1.5" />
            <div className="pt-3 border-t">
              <p className="text-xs text-muted-foreground mb-2">Agents &amp; Sources</p>
              <div className="flex flex-wrap gap-1">
                {s.externalSources.map((src: string) => <Badge key={src} variant="secondary" className="text-[10px]">{src}</Badge>)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plan & Guardrails */}
        <Card className="card-elevated">
          <CardHeader><CardTitle className="text-sm">Plan &amp; Guardrails</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Safety Stock</span><span className="font-medium">{s.safetyStock.toLocaleString()} u</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Reorder Point</span><span className="font-medium">{s.reorderPoint.toLocaleString()} u</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Lead Time</span><span className="font-medium">{s.leadTimeDays} days</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Recommended Qty</span><span className="font-medium">{s.recommendedQty.toLocaleString()} u</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">PO / STO</span><span className="font-medium font-mono">{s.po}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Expected Savings</span><span className="font-medium text-status-success">+${s.expectedSavings.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Confidence</span><span className="font-medium">{Math.round(s.confidence * 100)}%</span></div>
            <div className="pt-3 border-t">
              <p className="text-xs text-muted-foreground mb-2">Destinations</p>
              <div className="flex flex-wrap gap-1">
                {s.channels.map((c: string) => <Badge key={c} variant="outline" className="text-[10px]">{c}</Badge>)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rationale */}
      <Card className="card-elevated">
        <CardHeader><CardTitle className="text-sm">Why This Recommendation</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm">{s.rationale}</p>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card className="card-elevated">
        <CardContent className="pt-4">
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={reject} disabled={status !== 'pending'}>
              <XCircle className="w-4 h-4 mr-2" /> Reject
            </Button>
            <Button variant="default" onClick={approve} disabled={status !== 'pending'}>
              <CheckCircle2 className="w-4 h-4 mr-2" /> Approve {s.recommendedQty.toLocaleString()} units
            </Button>
            <Button variant="default" onClick={publish} disabled={status === 'executed'}>
              <Send className="w-4 h-4 mr-2" /> Place Order with Supplier
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
