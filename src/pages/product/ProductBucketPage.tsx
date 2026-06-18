import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import itemsData from '@/data/product/items.json';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

const modeMeta: Record<string, { label: string; color: string; desc: string }> = {
  enrich: { label: 'Enrich', color: 'bg-blue-500/10 text-blue-500', desc: 'EnrichAgent fills missing catalog fields via supplier data + AI' },
  validate: { label: 'Validate', color: 'bg-amber-500/10 text-amber-500', desc: 'ValidateAgent + ComplianceAgent enforce policy & regulatory gates' },
  activate: { label: 'Activate', color: 'bg-emerald-500/10 text-emerald-500', desc: 'ActivateAgent publishes to channels and notifies downstream agents' },
};

export const ProductBucketPage = () => {
  const { bucketId } = useParams();
  const navigate = useNavigate();
  const mode = bucketId || 'enrich';
  const meta = modeMeta[mode] || modeMeta.enrich;
  const items = (itemsData as any[]).filter(s => s.mode === mode);

  return (
    <div className="p-6 space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/product/landing')}>
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Product Onboarding Home
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
          <p className="text-2xl font-bold">{items.length}</p>
        </div>
      </div>

      <Card className="card-elevated">
        <CardHeader><CardTitle className="text-base">New Items</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">SKU</th>
                <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Product</th>
                <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Supplier</th>
                <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Completeness</th>
                <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Confidence</th>
                <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Time-to-Live</th>
                <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Sources</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map(s => (
                <tr key={s.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-2.5 px-2 font-mono text-xs">{s.sku}</td>
                  <td className="py-2.5 px-2 font-medium">{s.productName}</td>
                  <td className="py-2.5 px-2 text-xs text-muted-foreground">{s.supplier}</td>
                  <td className="py-2.5 px-2 font-semibold">{s.completeness}%</td>
                  <td className="py-2.5 px-2">{Math.round(s.confidence * 100)}%</td>
                  <td className="py-2.5 px-2">{s.expectedTimeToLive}</td>
                  <td className="py-2.5 px-2 text-xs text-muted-foreground">{s.externalSources.slice(0, 2).join(', ')}</td>
                  <td className="py-2.5 px-2">
                    <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => navigate(`/product/item/${s.id}`)}>
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
