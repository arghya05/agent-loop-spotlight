import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft, FileText, AlertTriangle, TrendingUp, DollarSign, Settings
} from 'lucide-react';
import invoicesData from '@/data/invoice/invoices.json';
import disputesData from '@/data/invoice/disputes.json';
import cashData from '@/data/invoice/cashOpportunities.json';
import { toast } from 'sonner';

export const SupplierAPPage = () => {
  const { supplierId } = useParams<{ supplierId: string }>();
  const navigate = useNavigate();
  const invoices = (invoicesData as any[]).filter(i => i.supplierId === supplierId);
  const disputes = (disputesData as any[]).filter(d => d.supplierId === supplierId);
  const cashOpps = (cashData as any[]).filter(c => c.supplierId === supplierId);

  if (invoices.length === 0) return <div className="p-6 text-muted-foreground">Supplier not found</div>;

  const supplierName = invoices[0].supplierName;
  const totalAmount = invoices.reduce((s, i) => s + i.total, 0);
  const exceptionCount = invoices.filter(i => i.bucketTag !== 'matched').length;
  const exceptionRate = Math.round((exceptionCount / invoices.length) * 100);
  const avgConfidence = Math.round(invoices.reduce((s, i) => s + i.confidenceScore, 0) / invoices.length);
  const totalSavings = cashOpps.reduce((s, c) => s + c.decision.expectedSavings, 0);

  const topDisputeReasons = disputes.flatMap(d => d.reasonCodes).reduce((acc: Record<string, number>, r: string) => {
    acc[r] = (acc[r] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-4 max-w-[1200px] mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">{supplierName}</h1>
        <Badge variant="outline" className="text-xs">AP 360</Badge>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: 'Total Invoices', value: invoices.length, icon: FileText },
          { label: 'Total Amount', value: `$${(totalAmount / 1000).toFixed(0)}K`, icon: DollarSign },
          { label: 'Exception Rate', value: `${exceptionRate}%`, icon: AlertTriangle },
          { label: 'Avg Confidence', value: `${avgConfidence}%`, icon: TrendingUp },
          { label: 'Cash Savings', value: `$${totalSavings.toLocaleString()}`, icon: DollarSign },
        ].map((kpi) => (
          <Card key={kpi.label} className="border-border">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <kpi.icon className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">{kpi.label}</span>
              </div>
              <p className="text-lg font-bold text-foreground">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Invoice History */}
        <div className="col-span-8 space-y-4">
          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Invoice History</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {invoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between p-2 rounded bg-muted/30 hover:bg-muted/50 cursor-pointer text-xs" onClick={() => navigate(`/invoice/invoice/${inv.id}`)}>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{inv.invoiceNumber}</span>
                    <Badge variant="outline" className="text-[9px] capitalize">{inv.bucketTag.replace(/_/g, ' ')}</Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <span>${inv.total.toLocaleString()}</span>
                    <Badge variant={inv.confidenceScore > 70 ? 'default' : 'secondary'} className="text-[10px]">{inv.confidenceScore}%</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="col-span-4 space-y-4">
          {/* Top Dispute Reasons */}
          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Top Dispute Reasons</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(topDisputeReasons).length > 0 ? Object.entries(topDisputeReasons).map(([reason, count]) => (
                <div key={reason} className="flex items-center justify-between text-xs">
                  <span className="capitalize text-muted-foreground">{reason.replace(/_/g, ' ')}</span>
                  <Badge variant="outline" className="text-[10px]">{count as number}</Badge>
                </div>
              )) : (
                <p className="text-xs text-muted-foreground">No disputes</p>
              )}
            </CardContent>
          </Card>

          {/* Policy Controls */}
          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Settings className="w-3.5 h-3.5" /> Policy Controls</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => toast.success('Stricter tolerances applied')}>Set Stricter Tolerances</Button>
              <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => toast.success('Auto-pay toggled')}>Toggle Auto-Pay</Button>
              <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => toast.success('Terms negotiation initiated')}>Negotiate Master Terms</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
