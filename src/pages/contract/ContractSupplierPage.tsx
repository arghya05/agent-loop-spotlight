import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import contractsData from '@/data/contract/contracts.json';
import { toast } from 'sonner';
import { useContractStore } from '@/store/contractStore';
import {
  ArrowLeft, FileText, Shield, DollarSign, AlertTriangle, CheckCircle2,
  TrendingUp, Send, Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const ContractSupplierPage = () => {
  const { supplierId } = useParams();
  const navigate = useNavigate();
  const { addAuditEntry } = useContractStore();

  const supplierContracts = (contractsData as any[]).filter(c => c.supplierId === supplierId);
  const supplier = supplierContracts[0];

  if (!supplier) {
    return <div className="p-6"><p>Supplier not found.</p></div>;
  }

  const totalLeakage = supplierContracts.reduce((s, c) => s + c.leakageEstimateDollar, 0);
  const violationCount = supplierContracts.flatMap(c => c.obligations).filter((o: any) => o.enforcementStatus === 'violated').length;
  const totalObligations = supplierContracts.flatMap(c => c.obligations).length;
  const avgCoverage = Math.round(supplierContracts.reduce((s, c) => s + c.coverageScore, 0) / supplierContracts.length);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">{supplier.supplierName} — Contract 360</h1>
          <p className="text-sm text-muted-foreground">{supplierContracts.length} contracts · {supplier.region}</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: 'Contracts', value: supplierContracts.length, icon: FileText },
          { label: 'Avg Coverage', value: `${avgCoverage}%`, icon: Shield },
          { label: 'Total Obligations', value: totalObligations, icon: CheckCircle2 },
          { label: 'Violations', value: violationCount, icon: AlertTriangle },
          { label: 'Total Leakage', value: `$${(totalLeakage / 1000).toFixed(1)}K`, icon: DollarSign },
        ].map(kpi => (
          <Card key={kpi.label} className="card-elevated">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 mb-1">
                <kpi.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{kpi.label}</span>
              </div>
              <p className="text-lg font-bold">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contracts List */}
      <Card className="card-elevated">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Contracts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {supplierContracts.map(c => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 cursor-pointer" onClick={() => navigate(`/contract/contract/${c.id}`)}>
                <div>
                  <p className="font-medium text-sm">{c.contractName}</p>
                  <p className="text-xs text-muted-foreground">{c.startDate} → {c.endDate} · Coverage {c.coverageScore}%</p>
                </div>
                <div className="flex items-center gap-3">
                  {c.leakageEstimateDollar > 0 && (
                    <span className="text-sm font-bold text-status-danger">${(c.leakageEstimateDollar / 1000).toFixed(1)}K</span>
                  )}
                  <Badge variant={c.riskScore > 60 ? 'destructive' : c.riskScore > 30 ? 'default' : 'secondary'}>
                    Risk {c.riskScore}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card className="card-elevated">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="w-4 h-4" />Policy Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {['Tighten tolerances for this supplier', 'Require pre-PO validation', 'Disable auto-pay until resolved'].map((ctrl) => (
            <div key={ctrl} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <span className="text-sm">{ctrl}</span>
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => {
                addAuditEntry({ actor: 'User', event: `Policy: ${ctrl}`, details: supplier.supplierName });
                toast.success(`${ctrl} — applied`);
              }}>
                Apply
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
