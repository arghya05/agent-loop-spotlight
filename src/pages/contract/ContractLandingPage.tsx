import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useContractStore } from '@/store/contractStore';
import contractsData from '@/data/contract/contracts.json';
import casesData from '@/data/contract/cases.json';
import { toast } from 'sonner';
import {
  FileText,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Zap,
  ExternalLink,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AutopilotPanel, AutopilotStep } from '@/components/AutopilotPanel';

const bucketConfig = [
  { id: 'compliant', label: 'Compliant', color: 'bg-status-success/10 text-status-success', icon: CheckCircle2 },
  { id: 'at_risk', label: 'At Risk', color: 'bg-status-warning/10 text-status-warning', icon: AlertTriangle },
  { id: 'violations', label: 'Violations', color: 'bg-status-danger/10 text-status-danger', icon: Shield },
  { id: 'expiring_soon', label: 'Expiring Soon', color: 'bg-purple-500/10 text-purple-500', icon: Calendar },
  { id: 'renegotiation', label: 'Renegotiation', color: 'bg-blue-500/10 text-blue-500', icon: TrendingUp },
];

export const ContractLandingPage = () => {
  const navigate = useNavigate();
  const { addAuditEntry } = useContractStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const contracts = contractsData as any[];
  const cases = casesData as any[];

  const totalContracts = contracts.length;
  const avgCoverage = Math.round(contracts.reduce((s, c) => s + c.coverageScore, 0) / totalContracts);
  const totalObligations = contracts.reduce((s, c) => s + c.obligations.length, 0);
  const violationCount = contracts.filter(c => c.bucketTag === 'violations').length;
  const violationImpact = contracts.filter(c => c.bucketTag === 'violations').reduce((s, c) => s + c.leakageEstimateDollar, 0);
  const totalLeakage = contracts.reduce((s, c) => s + c.leakageEstimateDollar, 0);
  const expiringCount = contracts.filter(c => c.bucketTag === 'expiring_soon').length;

  const bucketStats = bucketConfig.map(b => {
    const inBucket = contracts.filter(c => c.bucketTag === b.id);
    const impact = inBucket.reduce((s, c) => s + c.leakageEstimateDollar, 0);
    const topDrivers = inBucket.flatMap(c => c.obligations.filter((o: any) => o.enforcementStatus !== 'met').map((o: any) => o.type));
    const driverCounts: Record<string, number> = {};
    topDrivers.forEach(d => { driverCounts[d] = (driverCounts[d] || 0) + 1; });
    const sorted = Object.entries(driverCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k);
    return { ...b, count: inBucket.length, impact, drivers: sorted };
  });

  const enforcementQueue = contracts
    .filter(c => c.bucketTag !== 'compliant')
    .sort((a, b) => b.leakageEstimateDollar - a.leakageEstimateDollar);

  const renewals = contracts.filter(c => c.bucketTag === 'expiring_soon' || c.bucketTag === 'renegotiation');

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(r => setTimeout(r, 2000));
    setIsRefreshing(false);
    addAuditEntry({ actor: 'User', event: 'Manual refresh', details: 'Contract enforcement data refreshed' });
    toast.success('Data refreshed');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Contract Enforcement Command Center</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Continuous enforcement of trade terms, rebates, penalties, and SLAs across {totalContracts} active contracts
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-6 gap-3">
        {[
          { label: 'Active Contracts', value: totalContracts, icon: FileText },
          { label: 'Avg Coverage', value: `${avgCoverage}%`, icon: Shield },
          { label: 'Obligations Monitored', value: totalObligations, icon: CheckCircle2 },
          { label: 'Violations', value: `${violationCount} ($${(violationImpact / 1000).toFixed(1)}K)`, icon: AlertTriangle },
          { label: 'Total $ at Risk', value: `$${(totalLeakage / 1000).toFixed(1)}K`, icon: DollarSign },
          { label: 'Expiring (90d)', value: expiringCount, icon: Clock },
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

      {/* Bucket Cards */}
      <div className="grid grid-cols-5 gap-4">
        {bucketStats.map((bucket) => {
          const Icon = bucket.icon;
          return (
            <Card 
              key={bucket.id} 
              className="card-elevated cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/contract/bucket/${bucket.id}`)}
            >
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", bucket.color.split(' ')[0])}>
                    <Icon className={cn("w-4 h-4", bucket.color.split(' ')[1])} />
                  </div>
                  <Badge variant="outline" className="text-xs">{bucket.count}</Badge>
                </div>
                <h3 className="font-semibold text-sm mb-1">{bucket.label}</h3>
                <p className="text-xs text-muted-foreground mb-2">
                  ${(bucket.impact / 1000).toFixed(1)}K impact
                </p>
                {bucket.drivers.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {bucket.drivers.map(d => (
                      <Badge key={d} variant="secondary" className="text-[9px] px-1.5 py-0">{d}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Enforcement Queue */}
      <Card className="card-elevated">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Today's Enforcement Queue
            </CardTitle>
            <Badge variant="outline">{enforcementQueue.length} items</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Contract</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Supplier</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Bucket</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">$ Impact</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Coverage</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">End Date</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {enforcementQueue.map((c) => {
                  const bucket = bucketConfig.find(b => b.id === c.bucketTag);
                  return (
                    <tr key={c.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-2.5 px-3 font-medium">{c.contractName}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{c.supplierName}</td>
                      <td className="py-2.5 px-3">
                        <Badge variant="outline" className={cn("text-[10px]", bucket?.color)}>
                          {bucket?.label}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 font-medium">${(c.leakageEstimateDollar / 1000).toFixed(1)}K</td>
                      <td className="py-2.5 px-3">{c.coverageScore}%</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{c.endDate}</td>
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Renewals */}
      <Card className="card-elevated">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Upcoming Renewals & Renegotiation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {renewals.map(c => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div>
                  <p className="font-medium text-sm">{c.contractName}</p>
                  <p className="text-xs text-muted-foreground">{c.supplierName} · Expires {c.endDate}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">${(c.leakageEstimateDollar / 1000).toFixed(1)}K at stake</span>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => {
                    toast.success('Renegotiation pack generated');
                    addAuditEntry({ actor: 'User', event: 'Renegotiation pack', details: `Generated for ${c.supplierName}` });
                  }}>
                    Prepare Pack
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Last Refresh */}
      <p className="text-xs text-muted-foreground text-right">Last refresh: Feb 1, 2025 2:00 PM</p>
    </div>
  );
};
