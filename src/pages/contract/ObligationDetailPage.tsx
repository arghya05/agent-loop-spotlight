import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import contractsData from '@/data/contract/contracts.json';
import { toast } from 'sonner';
import { ArrowLeft, FileText, DollarSign, CheckCircle2, AlertTriangle, Gavel } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  met: 'bg-status-success/10 text-status-success',
  at_risk: 'bg-status-warning/10 text-status-warning',
  violated: 'bg-status-danger/10 text-status-danger',
  unknown: 'bg-muted text-muted-foreground',
};

export const ObligationDetailPage = () => {
  const { obligationId } = useParams();
  const navigate = useNavigate();

  const allObligations = (contractsData as any[]).flatMap(c => c.obligations.map((o: any) => ({ ...o, contractId: c.id, contractName: c.contractName, supplierName: c.supplierName })));
  const obligation = allObligations.find(o => o.id === obligationId);

  if (!obligation) {
    return <div className="p-6"><p>Obligation not found.</p></div>;
  }

  // Mock transaction links
  const mockChecks = [
    { checkName: 'Price within contract', passFail: obligation.type === 'price' && obligation.enforcementStatus === 'violated' ? 'fail' : 'pass', evidence: 'Compared invoice line prices against contract rates' },
    { checkName: 'Rebate tier applied', passFail: obligation.type === 'rebate' && obligation.enforcementStatus !== 'met' ? 'fail' : 'pass', evidence: 'Checked quarterly spend against rebate tiers' },
    { checkName: 'SLA met', passFail: obligation.type === 'SLA' && obligation.enforcementStatus === 'violated' ? 'fail' : 'pass', evidence: 'On-time delivery rate calculated from GRN data' },
    { checkName: 'Penalty triggered', passFail: obligation.type === 'penalty' && obligation.enforcementStatus === 'violated' ? 'fail' : 'n/a', evidence: 'Penalty calculation based on contract terms' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Obligation: {obligation.id}</h1>
          <p className="text-sm text-muted-foreground">{obligation.contractName} · {obligation.supplierName}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Terms */}
        <Card className="card-elevated">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Obligation Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Type</span><Badge variant="outline">{obligation.type}</Badge></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Status</span><Badge className={cn("text-xs", statusColors[obligation.enforcementStatus])}>{obligation.enforcementStatus}</Badge></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">$ Impact</span><span className="font-bold">${(obligation.impactDollar / 1000).toFixed(1)}K</span></div>
            <div className="pt-2">
              <p className="text-sm font-medium mb-1">Description</p>
              <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">{obligation.description}</p>
            </div>
            {obligation.impactDollar > 0 && (
              <div className="pt-2">
                <p className="text-sm font-medium mb-1">Simulation</p>
                <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                  If enforced correctly, expected benefit would be <strong>${(obligation.impactDollar / 1000).toFixed(1)}K</strong> recovered/prevented.
                </p>
              </div>
            )}
            <Button className="w-full" size="sm" onClick={() => toast.success('Enforcement case created')}>
              <Gavel className="w-4 h-4 mr-2" />Create Enforcement Case
            </Button>
          </CardContent>
        </Card>

        {/* Evidence & Checks */}
        <Card className="card-elevated">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Transaction Mapping & Checks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              {['PO-4521, PO-4589', 'GRN-8821, GRN-8834', 'INV-2201, INV-2215'].map((link, i) => (
                <div key={i} className="flex justify-between text-sm p-2 rounded bg-muted/30">
                  <span className="text-muted-foreground">{['POs', 'GRNs', 'Invoices'][i]}</span>
                  <span className="font-medium text-xs">{link}</span>
                </div>
              ))}
            </div>

            <p className="text-xs font-medium text-muted-foreground mb-2">Computed Checks</p>
            <div className="space-y-2">
              {mockChecks.map((check, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg border border-border">
                  <div className="flex items-center gap-2">
                    {check.passFail === 'pass' ? <CheckCircle2 className="w-4 h-4 text-status-success" /> : check.passFail === 'fail' ? <AlertTriangle className="w-4 h-4 text-status-danger" /> : <span className="w-4 h-4 text-muted-foreground">—</span>}
                    <span className="text-sm">{check.checkName}</span>
                  </div>
                  <Badge variant={check.passFail === 'pass' ? 'secondary' : check.passFail === 'fail' ? 'destructive' : 'outline'} className="text-[10px]">
                    {check.passFail}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
