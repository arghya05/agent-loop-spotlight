import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft, CheckCircle2, AlertTriangle, XCircle, Ban, DollarSign,
  Clock, FileText, Send, Shield, TrendingUp, MessageSquare
} from 'lucide-react';
import invoicesData from '@/data/invoice/invoices.json';
import disputesData from '@/data/invoice/disputes.json';
import { useInvoiceStore } from '@/store/invoiceStore';
import { toast } from 'sonner';

const bucketChip: Record<string, { label: string; color: string }> = {
  matched: { label: 'Matched', color: 'text-emerald-500 border-emerald-500/30' },
  needs_review: { label: 'Needs Review', color: 'text-amber-500 border-amber-500/30' },
  dispute: { label: 'Dispute', color: 'text-red-500 border-red-500/30' },
  hold: { label: 'Hold', color: 'text-foreground border-border' },
  cash_opportunity: { label: 'Cash Opp', color: 'text-blue-500 border-blue-500/30' },
};

export const InvoiceDetailPage = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const { role, addAuditEvent } = useInvoiceStore();
  const invoice = (invoicesData as any[]).find(i => i.id === invoiceId);
  const dispute = (disputesData as any[]).find(d => d.invoiceId === invoiceId);

  if (!invoice) return <div className="p-6 text-muted-foreground">Invoice not found</div>;

  const bc = bucketChip[invoice.bucketTag] || { label: invoice.bucketTag, color: '' };
  const totalVariance = Object.values(invoice.variance as Record<string, number>).reduce((s, v) => s + v, 0);

  const handleAction = (action: string) => {
    addAuditEvent({ time: new Date().toISOString(), actor: role, event: action, details: `${action} on ${invoice.invoiceNumber}` });
    toast.success(`${action} executed for ${invoice.invoiceNumber}`);
  };

  return (
    <div className="p-6 space-y-4 max-w-[1400px] mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">{invoice.invoiceNumber}</h1>
        <Badge variant="outline" className={`text-xs ${bc.color}`}>{bc.label}</Badge>
        <Badge variant="outline" className="text-xs">Confidence: {invoice.confidenceScore}%</Badge>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* LEFT: Invoice Snapshot */}
        <div className="col-span-3 space-y-4">
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Invoice Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Supplier</span><span className="font-medium">{invoice.supplierName}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-medium">${invoice.amount.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>${invoice.tax.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Freight</span><span>${invoice.freight.toLocaleString()}</span></div>
              <Separator />
              <div className="flex justify-between font-bold"><span>Total</span><span>${invoice.total.toLocaleString()}</span></div>
              <Separator />
              <div className="flex justify-between"><span className="text-muted-foreground">Currency</span><span>{invoice.currency}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Invoice Date</span><span>{invoice.invoiceDate}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Due Date</span><span>{invoice.dueDate}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Owner</span><span>{invoice.owner}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">BU</span><span>{invoice.businessUnit}</span></div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            {invoice.bucketTag === 'matched' && <Button className="w-full text-xs" size="sm" onClick={() => handleAction('Approve Pay')}>✓ Approve Pay</Button>}
            {invoice.bucketTag === 'needs_review' && <Button className="w-full text-xs" size="sm" onClick={() => handleAction('Approve Pay')}>✓ Approve Pay</Button>}
            {invoice.bucketTag !== 'dispute' && <Button variant="outline" className="w-full text-xs" size="sm" onClick={() => handleAction('Open Dispute')}>Open Dispute</Button>}
            <Button variant="outline" className="w-full text-xs" size="sm" onClick={() => handleAction('Put on Hold')}>Put on Hold</Button>
            <Button variant="outline" className="w-full text-xs" size="sm" onClick={() => handleAction('Request Documents')}>Request Documents</Button>
            <Button variant="ghost" className="w-full text-xs" size="sm" onClick={() => handleAction('Escalate')}>Escalate to Finance Manager</Button>
          </div>
        </div>

        {/* CENTER: Match & Variance */}
        <div className="col-span-5 space-y-4">
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Match & Variance</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="po">
                <TabsList className="h-8">
                  <TabsTrigger value="po" className="text-xs">PO Match</TabsTrigger>
                  <TabsTrigger value="grn" className="text-xs">GRN Match</TabsTrigger>
                  <TabsTrigger value="contract" className="text-xs">Contract Terms</TabsTrigger>
                </TabsList>
                <TabsContent value="po" className="mt-3 space-y-2">
                  {invoice.matchRefs.poIds.length > 0 ? (
                    <div className="text-xs space-y-2">
                      {invoice.matchRefs.poIds.map((po: string) => (
                        <div key={po} className="flex items-center gap-2 p-2 rounded bg-muted/50">
                          <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="font-medium">{po}</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 ml-auto" />
                          <span className="text-emerald-600">Linked</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-red-500 flex items-center gap-2">
                      <XCircle className="w-3.5 h-3.5" /> No PO match found
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="grn" className="mt-3 space-y-2">
                  {invoice.matchRefs.grnIds.length > 0 ? (
                    invoice.matchRefs.grnIds.map((grn: string) => (
                      <div key={grn} className="flex items-center gap-2 p-2 rounded bg-muted/50 text-xs">
                        <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="font-medium">{grn}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 ml-auto" />
                        <span className="text-emerald-600">Received</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-red-500 flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5" /> Missing GRN — cannot complete 3-way match
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="contract" className="mt-3">
                  {invoice.matchRefs.contractId ? (
                    <div className="flex items-center gap-2 p-2 rounded bg-muted/50 text-xs">
                      <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="font-medium">{invoice.matchRefs.contractId}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 ml-auto" />
                    </div>
                  ) : (
                    <div className="text-xs text-red-500 flex items-center gap-2">
                      <XCircle className="w-3.5 h-3.5" /> No contract linked
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Variance Breakdown */}
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Variance Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(['price', 'qty', 'tax', 'freight', 'other'] as const).map((k) => {
                const val = (invoice.variance as any)[k] as number;
                return (
                  <div key={k} className="flex items-center justify-between text-xs">
                    <span className="capitalize text-muted-foreground">{k} Variance</span>
                    <span className={val > 0 ? 'font-medium text-red-500' : 'text-muted-foreground'}>{val > 0 ? `$${val.toLocaleString()}` : '—'}</span>
                  </div>
                );
              })}
              <Separator />
              <div className="flex items-center justify-between text-xs font-bold">
                <span>Total Variance</span>
                <span className={totalVariance > 0 ? 'text-red-500' : 'text-emerald-500'}>${totalVariance.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* English Summary */}
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Agent Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs leading-relaxed text-foreground">
                {invoice.confidenceScore >= 90 
                  ? `Invoice ${invoice.invoiceNumber} from ${invoice.supplierName} has been successfully matched against ${invoice.matchRefs.poIds.join(', ')} with a confidence of ${invoice.confidenceScore}%. All variances are within tolerance. Recommended action: auto-approve for payment.`
                  : `Invoice ${invoice.invoiceNumber} from ${invoice.supplierName} has ${invoice.anomalyFlags.length} anomal${invoice.anomalyFlags.length === 1 ? 'y' : 'ies'} detected. ${invoice.anomalyFlags.map((f: any) => f.evidence).join('. ')}. ${invoice.recommendedAction.reason}. Expected recovery: $${invoice.recommendedAction.expectedRecovery.toLocaleString()}.`
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Actions + Timeline + Comms */}
        <div className="col-span-4 space-y-4">
          {/* Recommended Action */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Recommended Action
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs font-medium text-foreground capitalize">{invoice.recommendedAction.type.replace(/_/g, ' ')}</p>
              <p className="text-xs text-muted-foreground">{invoice.recommendedAction.reason}</p>
              {invoice.recommendedAction.expectedRecovery > 0 && (
                <div className="flex gap-4 text-xs">
                  <span>Recovery: <strong className="text-emerald-600">${invoice.recommendedAction.expectedRecovery.toLocaleString()}</strong></span>
                  {invoice.recommendedAction.expectedCycleTime > 0 && <span>Cycle: <strong>{invoice.recommendedAction.expectedCycleTime}d</strong></span>}
                </div>
              )}
              <div className="flex gap-2">
                <Button size="sm" className="text-xs h-7" onClick={() => handleAction('Approve & Execute')}>Approve & Execute</Button>
                <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => handleAction('Edit')}>Edit</Button>
                <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => handleAction('Reject')}>Reject</Button>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {invoice.timeline.map((evt: any, i: number) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                      {i < invoice.timeline.length - 1 && <div className="w-px flex-1 bg-border" />}
                    </div>
                    <div className="pb-3">
                      <p className="text-xs font-medium text-foreground">{evt.event}</p>
                      <p className="text-[10px] text-muted-foreground">{evt.details}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(evt.time).toLocaleString()} · {evt.actor}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Communications */}
          {dispute && (
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  Communications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dispute.commsTrail.map((msg: any, i: number) => (
                  <div key={i} className="p-2 rounded bg-muted/50 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{msg.sender}</span>
                      <Badge variant="outline" className="text-[9px]">{msg.channel}</Badge>
                    </div>
                    <p className="text-muted-foreground">{msg.snippet}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(msg.time).toLocaleString()}</p>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => handleAction('Send reminder')}>
                    <Send className="w-3 h-3 mr-1" /> Reminder
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => handleAction('Request credit note')}>
                    Request Credit Note
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
