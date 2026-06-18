import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import signalsData from '@/data/pricing/signals.json';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

const modeMeta: Record<string, { label: string; color: string; desc: string }> = {
  reprice: { label: 'Reprice', color: 'bg-blue-500/10 text-blue-500', desc: 'Real-time response to competitor moves — price updated in minutes' },
  promote: { label: 'Promote', color: 'bg-purple-500/10 text-purple-500', desc: 'Right offer, right segment, right moment — zero manual campaign setup' },
  markdown: { label: 'Markdown', color: 'bg-amber-500/10 text-amber-500', desc: 'Clears seasonal stock on time — recovers margin, eliminates dead inventory' },
};

export const PricingBucketPage = () => {
  const { bucketId } = useParams();
  const navigate = useNavigate();
  const mode = bucketId || 'reprice';
  const meta = modeMeta[mode] || modeMeta.reprice;
  const signals = (signalsData as any[]).filter(s => s.mode === mode);

  return (
    <div className="p-6 space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/pricing/landing')}>
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Pricing Home
      </Button>

      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className={cn('text-xs', meta.color)}>MODE · {meta.label.toUpperCase()}</Badge>
          </div>
          <h1 className="text-2xl font-bold">{meta.label} Bucket</h1>
          <p className="text-sm text-muted-foreground">{meta.desc}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">SKUs in bucket</p>
          <p className="text-2xl font-bold">{signals.length}</p>
        </div>
      </div>

      <Card className="card-elevated">
        <CardHeader><CardTitle className="text-base">Signals</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">SKU</th>
                <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Product</th>
                <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Current → Recommended</th>
                <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Confidence</th>
                <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Lift</th>
                <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Sources</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {signals.map(s => (
                <tr key={s.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-2.5 px-2 font-mono text-xs">{s.sku}</td>
                  <td className="py-2.5 px-2 font-medium">{s.productName}</td>
                  <td className="py-2.5 px-2">${s.currentPrice.toFixed(2)} → <span className="font-semibold">${s.recommendedPrice.toFixed(2)}</span></td>
                  <td className="py-2.5 px-2">{Math.round(s.confidence * 100)}%</td>
                  <td className="py-2.5 px-2 text-status-success font-medium">+${(s.expectedRevenueLift / 1000).toFixed(1)}K</td>
                  <td className="py-2.5 px-2 text-xs text-muted-foreground">{s.externalSources.slice(0, 2).join(', ')}</td>
                  <td className="py-2.5 px-2">
                    <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => navigate(`/pricing/signal/${s.id}`)}>
                      Review <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};
