import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft, MessageSquare, CheckCircle2, Clock, Send, FileCheck
} from 'lucide-react';
import disputesData from '@/data/invoice/disputes.json';
import { useInvoiceStore } from '@/store/invoiceStore';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  draft: 'text-muted-foreground',
  pending_supplier: 'text-amber-500',
  pending_approval: 'text-blue-500',
  negotiating: 'text-purple-500',
  resolved: 'text-emerald-500',
  closed: 'text-muted-foreground',
};

export const DisputePage = () => {
  const { disputeId } = useParams<{ disputeId: string }>();
  const navigate = useNavigate();
  const { role, addAuditEvent } = useInvoiceStore();
  const dispute = (disputesData as any[]).find(d => d.id === disputeId);

  if (!dispute) return <div className="p-6 text-muted-foreground">Dispute not found</div>;

  const handleAction = (action: string) => {
    addAuditEvent({ time: new Date().toISOString(), actor: role, event: action, details: `${action} on ${dispute.id}` });
    toast.success(`${action} executed for ${dispute.id}`);
  };

  return (
    <div className="p-6 space-y-4 max-w-[1200px] mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">Dispute {dispute.id}</h1>
        <Badge variant="outline" className={`text-xs capitalize ${statusColors[dispute.status] || ''}`}>
          {dispute.status.replace(/_/g, ' ')}
        </Badge>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Left: Summary */}
        <div className="col-span-4 space-y-4">
          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Dispute Summary</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Invoice</span><span className="font-medium">{dispute.invoiceNumber}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Supplier</span><span className="font-medium">{dispute.supplierName}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Invoice Amount</span><span>${dispute.amount.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Variance Total</span><span className="text-red-500 font-medium">${dispute.varianceTotal.toLocaleString()}</span></div>
              <Separator />
              <div>
                <span className="text-muted-foreground block mb-1">Reason Codes</span>
                <div className="flex flex-wrap gap-1">
                  {dispute.reasonCodes.map((r: string) => (
                    <Badge key={r} variant="outline" className="text-[9px] capitalize">{r.replace(/_/g, ' ')}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Approval Gate */}
          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Approval Gate</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {dispute.approvals.length > 0 ? dispute.approvals.map((a: any, i: number) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{a.role}: {a.approver}</span>
                  <Badge variant="outline" className="text-[9px] ml-auto">{a.decision}</Badge>
                </div>
              )) : (
                <p className="text-xs text-muted-foreground">No approvals yet</p>
              )}
              <Separator />
              <div className="space-y-2">
                <Button size="sm" className="w-full text-xs" onClick={() => handleAction('Approve Settlement')}>Approve Settlement</Button>
                <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => handleAction('Send to Supplier')}>
                  <Send className="w-3 h-3 mr-1" /> Send to Supplier
                </Button>
                <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => handleAction('Close Dispute')}>Close Dispute</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center: Proposed Settlement */}
        <div className="col-span-4 space-y-4">
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-primary" />
                Proposed Settlement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Credit Note</span><span className="font-bold text-emerald-600">${dispute.proposedResolution.creditNoteAmount.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Revised Invoice</span><span className="font-medium">${dispute.proposedResolution.revisedInvoiceAmount.toLocaleString()}</span></div>
                {dispute.proposedResolution.paymentHoldDays > 0 && (
                  <div className="flex justify-between"><span className="text-muted-foreground">Hold Days</span><span>{dispute.proposedResolution.paymentHoldDays}</span></div>
                )}
              </div>
              <Separator />
              <div className="p-3 bg-muted/50 rounded text-xs leading-relaxed text-foreground">
                {dispute.proposedResolution.settlementText}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Comms Trail */}
        <div className="col-span-4 space-y-4">
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                Communication Trail
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dispute.commsTrail.map((msg: any, i: number) => (
                <div key={i} className="p-2 rounded bg-muted/50 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{msg.sender}</span>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-[9px]">{msg.channel}</Badge>
                      <Badge variant="outline" className="text-[9px]">{msg.status}</Badge>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{msg.snippet}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-muted-foreground">{new Date(msg.time).toLocaleString()}</p>
                    {msg.followUpDue && (
                      <span className="text-[10px] text-amber-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Follow-up: {new Date(msg.followUpDue).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm" className="text-xs h-7 flex-1" onClick={() => handleAction('Send Reminder')}>
                  <Send className="w-3 h-3 mr-1" /> Reminder
                </Button>
                <Button variant="outline" size="sm" className="text-xs h-7 flex-1" onClick={() => handleAction('Request Revised Invoice')}>
                  Revised Invoice
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
