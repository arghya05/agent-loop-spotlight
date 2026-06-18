import { Fragment } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import contractsData from '@/data/contract/contracts.json';
import {
  FileText,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  TrendingUp,
  ExternalLink,
  ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

const bucketMeta: Record<string, { label: string; description: string; color: string; icon: any }> = {
  compliant: { label: 'Compliant', description: 'All obligations met; no leakage detected', color: 'bg-status-success/10 text-status-success', icon: CheckCircle2 },
  at_risk: { label: 'At Risk', description: 'Risk of missing benefit (rebate not claimed, promo not applied)', color: 'bg-status-warning/10 text-status-warning', icon: AlertTriangle },
  violations: { label: 'Violations', description: 'Confirmed misses; penalties/rebates due', color: 'bg-status-danger/10 text-status-danger', icon: Shield },
  expiring_soon: { label: 'Expiring Soon', description: 'Renewals needed; expiring benefits/terms', color: 'bg-purple-500/10 text-purple-500', icon: Calendar },
  renegotiation: { label: 'Renegotiation Opportunities', description: 'Terms no longer competitive; volume shifts', color: 'bg-blue-500/10 text-blue-500', icon: TrendingUp },
};

export const ContractBucketPage = () => {
  const { bucketId } = useParams();
  const navigate = useNavigate();

  const meta = bucketMeta[bucketId || ''] || bucketMeta.compliant;
  const contracts = (contractsData as any[]).filter(c => c.bucketTag === bucketId);
  const Icon = meta.icon;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/contract/landing')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", meta.color.split(' ')[0])}>
          <Icon className={cn("w-5 h-5", meta.color.split(' ')[1])} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{meta.label}</h1>
          <p className="text-sm text-muted-foreground">{meta.description}</p>
        </div>
        <Badge variant="outline" className="ml-auto">{contracts.length} contracts</Badge>
      </div>

      <Card className="card-elevated">
        <CardContent className="pt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Contract</th>
                <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Supplier</th>
                <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Coverage</th>
                <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Risk</th>
                <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Violations</th>
                <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">$ Impact</th>
                <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">End Date</th>
                <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Region</th>
                <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((c) => {
                const showWhy = bucketId === 'at_risk' || bucketId === 'violations';
                const flagged = (c.obligations || []).filter((o: any) =>
                  bucketId === 'violations' ? o.enforcementStatus === 'violated' : o.enforcementStatus === 'at_risk' || o.enforcementStatus === 'violated'
                );
                const daysLeft = Math.ceil((new Date(c.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                return (
                <>
                <tr key={c.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-2.5 px-3 font-medium">{c.contractName}</td>
                  <td className="py-2.5 px-3">{c.supplierName}</td>
                  <td className="py-2.5 px-3">{c.coverageScore}%</td>
                  <td className="py-2.5 px-3">
                    <Badge variant={c.riskScore > 60 ? 'destructive' : c.riskScore > 30 ? 'default' : 'secondary'} className="text-[10px]">
                      {c.riskScore}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3">{c.obligations.filter((o: any) => o.enforcementStatus === 'violated').length}</td>
                  <td className="py-2.5 px-3 font-medium">${(c.leakageEstimateDollar / 1000).toFixed(1)}K</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{c.endDate}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{c.region}</td>
                  <td className="py-2.5 px-3">
                    <div className="flex gap-1">
                      <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => navigate(`/contract/contract/${c.id}`)}>
                        Review
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => navigate(`/contract/supplier/${c.supplierId}`)}>
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
                {showWhy && (flagged.length > 0 || c.leakageEstimateDollar > 0) && (
                  <tr key={`${c.id}-why`} className="bg-muted/20">
                    <td colSpan={9} className="px-3 py-2">
                      <div className="flex items-start gap-2 flex-wrap">
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground pt-0.5">
                          Why {bucketId === 'violations' ? 'violated' : 'at risk'}:
                        </span>
                        {flagged.map((o: any) => (
                          <Badge
                            key={o.id}
                            variant="outline"
                            className={cn(
                              'text-[11px] font-normal',
                              o.enforcementStatus === 'violated'
                                ? 'border-status-danger/40 bg-status-danger-bg text-status-danger'
                                : 'border-status-warning/40 bg-status-warning-bg text-status-warning'
                            )}
                          >
                            {o.type.toUpperCase()}: {o.description}{o.impactDollar > 0 ? ` (−$${(o.impactDollar / 1000).toFixed(1)}K)` : ''}
                          </Badge>
                        ))}
                        {c.riskScore > 60 && (
                          <Badge variant="outline" className="text-[11px] font-normal border-status-danger/40 bg-status-danger-bg text-status-danger">
                            Risk score {c.riskScore} (high)
                          </Badge>
                        )}
                        {daysLeft > 0 && daysLeft < 60 && (
                          <Badge variant="outline" className="text-[11px] font-normal border-status-warning/40 bg-status-warning-bg text-status-warning">
                            Expires in {daysLeft} days
                          </Badge>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
                </>
              );})}
              {contracts.length === 0 && (
                <tr><td colSpan={9} className="py-8 text-center text-muted-foreground">No contracts in this bucket</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};
