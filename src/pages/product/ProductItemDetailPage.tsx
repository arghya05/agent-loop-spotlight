import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import itemsData from '@/data/product/items.json';
import { useProductStore } from '@/store/productStore';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle2, XCircle, Send, Zap, Database, Sparkles, ShieldCheck, Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';

const modeColor: Record<string, string> = {
  enrich: 'bg-blue-500/10 text-blue-500',
  validate: 'bg-amber-500/10 text-amber-500',
  activate: 'bg-emerald-500/10 text-emerald-500',
};

export const ProductItemDetailPage = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { addAuditEntry, updateItem, itemOverrides } = useProductStore();
  const s = (itemsData as any[]).find(x => x.id === itemId);

  if (!s) return <div className="p-6">Item not found.</div>;

  const override = itemOverrides[s.id] || {};
  const status = override.status || s.status;

  const approve = () => {
    updateItem(s.id, { status: 'approved' });
    addAuditEntry({ actor: 'User', event: 'Onboarding approved', details: `${s.sku} ${s.productName} approved for ${s.mode}` });
    toast.success(`Approved ${s.sku} for ${s.mode}`);
  };
  const reject = () => {
    updateItem(s.id, { status: 'rejected' });
    addAuditEntry({ actor: 'User', event: 'Onboarding rejected', details: `${s.sku} sent back to supplier` });
    toast.info('Item sent back to supplier');
  };
  const publish = () => {
    updateItem(s.id, { status: 'executed' });
    addAuditEntry({ actor: 'Activate Agent', event: 'SKU published', details: `${s.sku} → ${s.channels.join(', ')}` });
    toast.success(`Published ${s.sku} to ${s.channels.length} channels`);
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
            <Badge variant="outline" className="text-xs">{s.supplier}</Badge>
            <Badge variant={status === 'executed' ? 'default' : status === 'approved' ? 'default' : 'outline'} className="text-xs">{status}</Badge>
          </div>
          <h1 className="text-2xl font-bold">{s.productName}</h1>
          <p className="text-sm text-muted-foreground font-mono">{s.sku}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Catalog Completeness</p>
          <p className="text-3xl font-bold">{s.completeness}%</p>
          <p className="text-xs font-medium text-muted-foreground">Time-to-Live: {s.expectedTimeToLive}</p>
        </div>
      </div>

      {/* Agent Flow */}
      <Card className="card-elevated">
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /> Multi-Agent Reasoning Trace</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2 text-xs">
            {[
              { icon: Database, label: 'INTAKE', detail: 'Supplier packet ingested' },
              { icon: Sparkles, label: 'ENRICH', detail: `${s.missingFields.length} fields filled` },
              { icon: ShieldCheck, label: 'VALIDATE', detail: `${s.validationIssues.length} issue(s)` },
              { icon: Rocket, label: 'ACTIVATE', detail: s.mode === 'activate' ? `→ ${s.channels.length} ch` : 'Pending' },
              { icon: Send, label: 'BRIDGE', detail: 'Pricing + Inventory' },
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
        {/* Catalog signals */}
        <Card className="card-elevated">
          <CardHeader><CardTitle className="text-sm">Catalog &amp; Compliance Signals</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Submitted</span><span className="font-medium">{new Date(s.submittedAt).toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Completeness</span><span className="font-medium">{s.completeness}%</span></div>
            <Progress value={s.completeness} className="h-1.5" />
            <div className="flex justify-between"><span className="text-muted-foreground">Missing Fields</span><span className="font-medium">{s.missingFields.length}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Validation Issues</span><span className="font-medium">{s.validationIssues.length}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Confidence</span><span className="font-medium">{Math.round(s.confidence * 100)}%</span></div>
            <div className="pt-3 border-t">
              <p className="text-xs text-muted-foreground mb-2">Agents &amp; Sources</p>
              <div className="flex flex-wrap gap-1">
                {s.externalSources.map((src: string) => <Badge key={src} variant="secondary" className="text-[10px]">{src}</Badge>)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gates & Destinations */}
        <Card className="card-elevated">
          <CardHeader><CardTitle className="text-sm">Open Gates &amp; Destinations</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {s.missingFields.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Missing Fields</p>
                <div className="flex flex-wrap gap-1">
                  {s.missingFields.map((f: string) => <Badge key={f} variant="outline" className="text-[10px] border-blue-500/30 text-blue-600">{f}</Badge>)}
                </div>
              </div>
            )}
            {s.validationIssues.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Validation Issues</p>
                <div className="flex flex-wrap gap-1">
                  {s.validationIssues.map((i: string) => <Badge key={i} variant="outline" className="text-[10px] border-amber-500/30 text-amber-600">{i}</Badge>)}
                </div>
              </div>
            )}
            <div className="pt-3 border-t">
              <p className="text-xs text-muted-foreground mb-2">Publish Channels</p>
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
              <XCircle className="w-4 h-4 mr-2" /> Send Back to Supplier
            </Button>
            <Button variant="default" onClick={approve} disabled={status !== 'pending'}>
              <CheckCircle2 className="w-4 h-4 mr-2" /> Approve {s.mode === 'enrich' ? 'Enrichment' : s.mode === 'validate' ? 'Validation' : 'Activation'}
            </Button>
            <Button variant="default" onClick={publish} disabled={status === 'executed' || s.mode !== 'activate'}>
              <Send className="w-4 h-4 mr-2" /> Publish to {s.channels.length} Channels
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
