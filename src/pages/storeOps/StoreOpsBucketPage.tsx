import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getStoreAgent, storeBucketMeta, storeOpsSignals, StoreBucketId } from '@/data/storeOps';
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Zap } from 'lucide-react';

const bucketIcon = {
  breached: AlertTriangle,
  'at-risk': Zap,
  optimized: CheckCircle2,
};

export const StoreOpsBucketPage = () => {
  const navigate = useNavigate();
  const { agentId, bucketId } = useParams();
  const agent = getStoreAgent(agentId);
  const bucket = (bucketId || 'breached') as StoreBucketId;
  const meta = storeBucketMeta[bucket] || storeBucketMeta.breached;
  const Icon = bucketIcon[bucket] || AlertTriangle;
  const signals = storeOpsSignals.filter((signal) => signal.agentId === agent.id && signal.bucket === bucket);
  const impact = signals.reduce((sum, signal) => sum + signal.estimatedImpact, 0);

  return (
    <div className="p-6 space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(`/store-ops/${agent.id}/landing`)}>
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to {agent.shortLabel}
      </Button>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Icon className="w-5 h-5 text-primary" />
            <Badge variant="outline" className={cn('text-xs', meta.badgeClass)}>{meta.label.toUpperCase()}</Badge>
          </div>
          <h1 className="text-2xl font-bold text-foreground">{agent.label} · {meta.label} Exceptions</h1>
          <p className="text-sm text-muted-foreground mt-1">{meta.description}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Value at stake</p>
          <p className="text-2xl font-bold">${(impact / 1000).toFixed(0)}K</p>
        </div>
      </div>

      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="text-base">Exception Queue · reasons included</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Signal</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Store</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Category</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Metric vs target</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Reason why breached / at risk</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Action</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {signals.map((signal) => (
                  <tr key={signal.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-3 px-3 font-mono text-xs">{signal.id}</td>
                    <td className="py-3 px-3 font-medium">{signal.storeName}<p className="text-[10px] text-muted-foreground">{signal.storeId} · {signal.department}</p></td>
                    <td className="py-3 px-3">{signal.category}</td>
                    <td className="py-3 px-3"><span className="font-semibold">{signal.metricValue}</span><p className="text-[10px] text-muted-foreground">{signal.metricLabel} · target {signal.threshold}</p></td>
                    <td className="py-3 px-3 text-xs text-muted-foreground max-w-xl">{signal.reason}</td>
                    <td className="py-3 px-3 text-xs max-w-sm">{signal.recommendedAction}</td>
                    <td className="py-3 px-3 text-right">
                      <Button size="sm" className="h-7 text-xs" onClick={() => navigate(`/store-ops/${agent.id}/signal/${signal.id}`)}>
                        Review <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </td>
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
