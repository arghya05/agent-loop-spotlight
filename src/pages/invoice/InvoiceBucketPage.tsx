import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  CheckCircle2, AlertTriangle, XCircle, Ban, DollarSign, ArrowLeft, ArrowRight
} from 'lucide-react';
import invoicesData from '@/data/invoice/invoices.json';

const bucketMeta: Record<string, { label: string; icon: any; color: string; description: string }> = {
  matched: { label: 'Matched / AutoPay', icon: CheckCircle2, color: 'text-emerald-500', description: 'High-confidence 3-way match, within tolerances. Ready for auto-payment.' },
  needs_review: { label: 'Needs Review', icon: AlertTriangle, color: 'text-amber-500', description: 'Match found but variance above tolerance or missing evidence. Requires human review.' },
  dispute: { label: 'Dispute', icon: XCircle, color: 'text-red-500', description: 'Dispute opened. Negotiation in progress or supplier response pending.' },
  hold: { label: 'Hold / Blocked', icon: Ban, color: 'text-foreground', description: 'Suspected fraud, duplicate invoice, sanctions/vendor blocked, or critical compliance issue.' },
  cash_opportunity: { label: 'Cash Opportunity', icon: DollarSign, color: 'text-blue-500', description: 'Eligible early-pay discounts. Optimize payment timing for working capital savings.' },
};

export const InvoiceBucketPage = () => {
  const { bucketId } = useParams<{ bucketId: string }>();
  const navigate = useNavigate();
  const invoices = (invoicesData as any[]).filter(i => i.bucketTag === bucketId);
  const meta = bucketMeta[bucketId || ''] || { label: bucketId, icon: AlertTriangle, color: '', description: '' };
  const Icon = meta.icon;
  const totalAmount = invoices.reduce((s, i) => s + i.total, 0);

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/invoice/landing')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Icon className={`w-5 h-5 ${meta.color}`} />
        <div>
          <h1 className="text-xl font-bold text-foreground">{meta.label}</h1>
          <p className="text-xs text-muted-foreground">{meta.description}</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Badge variant="outline" className="text-xs">{invoices.length} invoices</Badge>
          <Badge variant="outline" className="text-xs">${(totalAmount / 1000).toFixed(0)}K total</Badge>
        </div>
      </div>

      <Card className="border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Invoice #</TableHead>
                <TableHead className="text-xs">Supplier</TableHead>
                <TableHead className="text-xs text-right">Amount</TableHead>
                <TableHead className="text-xs">Due Date</TableHead>
                <TableHead className="text-xs text-center">Confidence</TableHead>
                <TableHead className="text-xs">Issue Tags</TableHead>
                <TableHead className="text-xs text-right">Variance $</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Owner</TableHead>
                <TableHead className="text-xs"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => {
                const totalVariance = Object.values(inv.variance as Record<string, number>).reduce((s, v) => s + v, 0);
                return (
                  <TableRow key={inv.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/invoice/invoice/${inv.id}`)}>
                    <TableCell className="text-xs font-medium">{inv.invoiceNumber}</TableCell>
                    <TableCell className="text-xs">{inv.supplierName}</TableCell>
                    <TableCell className="text-xs text-right font-medium">${inv.total.toLocaleString()}</TableCell>
                    <TableCell className="text-xs">{inv.dueDate}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={inv.confidenceScore > 70 ? 'default' : inv.confidenceScore > 40 ? 'secondary' : 'destructive'} className="text-[10px]">
                        {inv.confidenceScore}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {inv.anomalyFlags.map((f: any, i: number) => (
                          <Badge key={i} variant="outline" className={`text-[9px] px-1 py-0 ${f.severity === 'critical' ? 'border-red-500/50 text-red-500' : f.severity === 'high' ? 'border-amber-500/50 text-amber-500' : ''}`}>
                            {f.type.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                        {inv.anomalyFlags.length === 0 && <span className="text-[10px] text-muted-foreground">—</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-right">{totalVariance > 0 ? `$${totalVariance.toLocaleString()}` : '—'}</TableCell>
                    <TableCell className="text-xs capitalize">{inv.status.replace(/_/g, ' ')}</TableCell>
                    <TableCell className="text-xs">{inv.owner}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="h-6 px-2">
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
