import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supplyChainAgents } from '@/data/supplyChainAgents';
import {
  supplyChainSignals,
  supplyBucketMeta,
  SupplyBucketId,
} from '@/data/supplyChainSignals';
import { ArrowLeft, ExternalLink, MapPin, Clock, DollarSign, AlertTriangle, TrendingDown, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const bucketIcon: Record<SupplyBucketId, typeof AlertTriangle> = {
  breached: AlertTriangle,
  'at-risk': TrendingDown,
  optimized: CheckCircle2,
};

const fmtCurrency = (v: number) =>
  v >= 1000 ? `AED ${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}K` : `AED ${v}`;

export const SupplyChainBucketPage = () => {
  const { agentId, bucketId } = useParams();
  const navigate = useNavigate();
  const agent = supplyChainAgents.find((a) => a.id === agentId);
  const bucket = (bucketId as SupplyBucketId) || 'breached';
  const meta = supplyBucketMeta[bucket] || supplyBucketMeta.breached;
  const Icon = bucketIcon[bucket] || AlertTriangle;

  const items = useMemo(
    () => supplyChainSignals.filter((s) => s.agentId === agentId && s.bucket === bucket),
    [agentId, bucket]
  );

  if (!agent) {
    return (
      <div className="p-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/landing')}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <p className="mt-4 text-sm text-muted-foreground">Agent not found.</p>
      </div>
    );
  }

  const totalImpact = items.reduce((a, s) => a + s.estimatedImpact, 0);

  return (
    <div className="p-6 space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(`/supply-chain/${agentId}`)}>
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to {agent.shortLabel} Home
      </Button>

      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className={cn('text-xs', meta.badgeClass)}>
              <Icon className="w-3 h-3 mr-1" /> MODE · {meta.label.toUpperCase()}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold">{meta.label} Bucket · {agent.label}</h1>
          <p className="text-sm text-muted-foreground">{meta.description}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Signals in bucket</p>
          <p className="text-2xl font-bold">{items.length}</p>
          {totalImpact > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              <DollarSign className="w-3 h-3 inline" />{fmtCurrency(totalImpact)} at stake
            </p>
          )}
        </div>
      </div>

      <Card className="card-elevated">
        <CardHeader><CardTitle className="text-base">{meta.label} Signals</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Entity</th>
                  <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Location</th>
                  <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Metric</th>
                  <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Severity</th>
                  <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Confidence</th>
                  <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Owner</th>
                  <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Due</th>
                  <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Impact</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center py-6 text-xs text-muted-foreground italic">
                      No signals in this bucket right now
                    </td>
                  </tr>
                )}
                {items.map((s) => (
                  <tr key={s.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-2.5 px-2 font-medium">{s.entity}</td>
                    <td className="py-2.5 px-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{s.location}</span>
                    </td>
                    <td className="py-2.5 px-2 text-xs">
                      <span className="font-mono">{s.metricValue}</span>{' '}
                      <span className="text-muted-foreground">vs {s.threshold}</span>
                    </td>
                    <td className="py-2.5 px-2">
                      <Badge variant="outline" className="text-[10px] capitalize">{s.severity}</Badge>
                    </td>
                    <td className="py-2.5 px-2 font-semibold">{Math.round(s.confidence * 100)}%</td>
                    <td className="py-2.5 px-2 text-xs text-muted-foreground">{s.recommendedOwner}</td>
                    <td className="py-2.5 px-2 text-xs">
                      <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{s.dueIn}</span>
                    </td>
                    <td className="py-2.5 px-2 text-xs font-medium">
                      {s.estimatedImpact > 0 ? fmtCurrency(s.estimatedImpact) : '—'}
                    </td>
                    <td className="py-2.5 px-2">
                      <Button
                        size="sm"
                        variant="default"
                        className="h-7 text-xs"
                        onClick={() => navigate(`/supply-chain/${agentId}/signal/${s.id}`)}
                      >
                        Review <ExternalLink className="w-3 h-3 ml-1" />
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
