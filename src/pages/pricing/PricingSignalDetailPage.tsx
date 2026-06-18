import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import signalsData from '@/data/pricing/signals.json';
import { usePricingStore } from '@/store/pricingStore';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle2, XCircle, Send, Zap, Database, Brain, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const modeColor: Record<string, string> = {
  reprice: 'bg-blue-500/10 text-blue-500',
  promote: 'bg-purple-500/10 text-purple-500',
  markdown: 'bg-amber-500/10 text-amber-500',
};

export const PricingSignalDetailPage = () => {
  const { signalId } = useParams();
  const navigate = useNavigate();
  const { addAuditEntry, updateSignal, signalOverrides } = usePricingStore();
  const s = (signalsData as any[]).find(x => x.id === signalId);

  if (!s) return <div className="p-6">Signal not found.</div>;

  const override = signalOverrides[s.id] || {};
  const status = override.status || s.status;
  const changePct = ((s.recommendedPrice - s.currentPrice) / s.currentPrice) * 100;

  const approve = () => {
    updateSignal(s.id, { status: 'approved', approvedPrice: s.recommendedPrice });
    addAuditEntry({ actor: 'User', event: 'Price approved', details: `${s.sku} ${s.productName} → $${s.recommendedPrice}` });
    toast.success(`Approved $${s.recommendedPrice} for ${s.sku}`);
  };
  const reject = () => {
    updateSignal(s.id, { status: 'rejected' });
    addAuditEntry({ actor: 'User', event: 'Price rejected', details: `${s.sku} recommendation rejected` });
    toast.info('Recommendation rejected');
  };
  const publish = () => {
    updateSignal(s.id, { status: 'executed' });
    addAuditEntry({ actor: 'Executor Agent', event: 'Published', details: `${s.sku} → $${s.recommendedPrice} live on ${s.channels.join(', ')}` });
    toast.success(`Published to ${s.channels.join(' · ')}`);
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
            <Badge variant={status === 'executed' ? 'default' : status === 'approved' ? 'default' : 'outline'} className="text-xs">{status}</Badge>
          </div>
          <h1 className="text-2xl font-bold">{s.productName}</h1>
          <p className="text-sm text-muted-foreground font-mono">{s.sku}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Recommended Price</p>
          <p className="text-3xl font-bold">${s.recommendedPrice.toFixed(2)}</p>
          <p className={cn('text-xs font-medium', changePct < 0 ? 'text-status-warning' : 'text-status-success')}>
            {changePct > 0 ? '+' : ''}{changePct.toFixed(1)}% vs current ${s.currentPrice.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Agent Flow: Retrieve → Classify → Plan → Supervise → Execute */}
      <Card className="card-elevated">
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /> Agent Reasoning Trace</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2 text-xs">
            {[
              { icon: Database, label: 'RETRIEVE', detail: `${s.externalSources.length} sources` },
              { icon: Brain, label: 'CLASSIFY', detail: `Mode · ${s.mode}` },
              { icon: Zap, label: 'PLAN', detail: `→ $${s.recommendedPrice}` },
              { icon: ShieldCheck, label: 'SUPERVISE', detail: `Floor $${s.marginFloor}` },
              { icon: Send, label: 'EXECUTE', detail: s.channels.join(' · ') },
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
        {/* External Signals */}
        <Card className="card-elevated">
          <CardHeader><CardTitle className="text-sm">External Signals Captured</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Competitor Avg</span><span className="font-medium">{s.competitorAvg ? `$${s.competitorAvg.toFixed(2)}` : 'No competitor data'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Competitor Min — Max</span><span className="font-medium">{s.competitorMin ? `$${s.competitorMin} — $${s.competitorMax}` : '—'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Demand Index</span><span className="font-medium">{s.demandIndex}/100</span></div>
            <Progress value={s.demandIndex} className="h-1.5" />
            <div className="flex justify-between"><span className="text-muted-foreground">Sell-through</span><span className="font-medium">{s.sellThroughPct}%</span></div>
            <Progress value={s.sellThroughPct} className="h-1.5" />
            <div className="flex justify-between"><span className="text-muted-foreground">Stock Age / Units</span><span className="font-medium">{s.stockAgeDays}d · {s.stockUnits.toLocaleString()}u</span></div>
            <div className="pt-3 border-t">
              <p className="text-xs text-muted-foreground mb-2">Sources</p>
              <div className="flex flex-wrap gap-1">
                {s.externalSources.map((src: string) => <Badge key={src} variant="secondary" className="text-[10px]">{src}</Badge>)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Margin & Plan */}
        <Card className="card-elevated">
          <CardHeader><CardTitle className="text-sm">Plan &amp; Margin Guardrails</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Cost Price</span><span className="font-medium">${s.costPrice.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Current Margin</span><span className="font-medium">{s.marginPct.toFixed(1)}%</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Margin Floor</span><span className="font-medium">${s.marginFloor.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Ceiling Price</span><span className="font-medium">${s.ceilingPrice.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Expected Revenue Lift</span><span className="font-medium text-status-success">+${s.expectedRevenueLift.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Expected Margin Impact</span><span className={cn('font-medium', s.expectedMarginLift < 0 ? 'text-status-warning' : 'text-status-success')}>{s.expectedMarginLift > 0 ? '+' : ''}{s.expectedMarginLift.toFixed(1)}pp</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Confidence</span><span className="font-medium">{Math.round(s.confidence * 100)}%</span></div>
            <div className="pt-3 border-t">
              <p className="text-xs text-muted-foreground mb-2">Channels</p>
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
              <CheckCircle2 className="w-4 h-4 mr-2" /> Approve at ${s.recommendedPrice.toFixed(2)}
            </Button>
            <Button variant="default" onClick={publish} disabled={status === 'executed'}>
              <Send className="w-4 h-4 mr-2" /> Publish to Channels
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
