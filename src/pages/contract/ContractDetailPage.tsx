import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useContractStore } from '@/store/contractStore';
import contractsData from '@/data/contract/contracts.json';
import casesData from '@/data/contract/cases.json';
import { toast } from 'sonner';
import {
  FileText, Shield, AlertTriangle, CheckCircle2, Clock, DollarSign,
  ArrowLeft, Send, MessageSquare, Gavel, TrendingUp, ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  met: 'bg-status-success/10 text-status-success',
  at_risk: 'bg-status-warning/10 text-status-warning',
  violated: 'bg-status-danger/10 text-status-danger',
  unknown: 'bg-muted text-muted-foreground',
};

export const ContractDetailPage = () => {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const { currentRole, addAuditEntry } = useContractStore();
  const [activeOblTab, setActiveOblTab] = useState('all');

  const contract = (contractsData as any[]).find(c => c.id === contractId);
  const relatedCase = (casesData as any[]).find(cs => cs.contractId === contractId);

  if (!contract) {
    return <div className="p-6"><p>Contract not found.</p></div>;
  }

  const obligations = contract.obligations as any[];
  const filteredObligations = activeOblTab === 'all'
    ? obligations
    : obligations.filter((o: any) => o.enforcementStatus === activeOblTab);

  const handleApprove = (action: string) => {
    addAuditEntry({ actor: currentRole, event: `Approved: ${action}`, details: `Contract ${contract.contractName}` });
    toast.success(`${action} approved and queued for execution`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">{contract.contractName}</h1>
          <p className="text-sm text-muted-foreground">{contract.supplierName} · {contract.region}</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* LEFT: Contract Snapshot */}
        <div className="col-span-3 space-y-4">
          <Card className="card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Contract Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge variant="outline">{contract.status}</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Period</span><span>{contract.startDate} → {contract.endDate}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Coverage</span><span className="font-medium">{contract.coverageScore}%</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Risk Score</span>
                <Badge variant={contract.riskScore > 60 ? 'destructive' : contract.riskScore > 30 ? 'default' : 'secondary'}>{contract.riskScore}</Badge>
              </div>
              <div className="flex justify-between"><span className="text-muted-foreground">Leakage Est.</span><span className="font-bold text-status-danger">${(contract.leakageEstimateDollar / 1000).toFixed(1)}K</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Last Review</span><span>{contract.lastReviewedDate}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Next Due</span><span>{contract.nextReviewDue}</span></div>
              <div className="flex flex-wrap gap-1 pt-2">
                {contract.categoryTags.map((t: string) => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Button className="w-full" size="sm" onClick={() => {
              addAuditEntry({ actor: currentRole, event: 'Review started', details: contract.contractName });
              toast.success('Review session started');
            }}>
              <Shield className="w-4 h-4 mr-2" />Review Now
            </Button>
            {relatedCase && (
              <Button className="w-full" size="sm" variant="outline" onClick={() => navigate(`/contract/case/${relatedCase.id}`)}>
                <Gavel className="w-4 h-4 mr-2" />Open Case
              </Button>
            )}
            <Button className="w-full" size="sm" variant="outline" onClick={() => navigate(`/contract/supplier/${contract.supplierId}`)}>
              <ExternalLink className="w-4 h-4 mr-2" />Supplier 360
            </Button>
            <Button className="w-full" size="sm" variant="outline" onClick={() => toast.success('Message sent to supplier')}>
              <Send className="w-4 h-4 mr-2" />Message Supplier
            </Button>
          </div>
        </div>

        {/* CENTER: Obligations Dashboard */}
        <div className="col-span-5 space-y-4">
          <Card className="card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="w-4 h-4" />Obligations Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeOblTab} onValueChange={setActiveOblTab}>
                <TabsList className="mb-3">
                  <TabsTrigger value="all">All ({obligations.length})</TabsTrigger>
                  <TabsTrigger value="met">Met</TabsTrigger>
                  <TabsTrigger value="at_risk">At Risk</TabsTrigger>
                  <TabsTrigger value="violated">Violated</TabsTrigger>
                </TabsList>
                <TabsContent value={activeOblTab}>
                  <div className="space-y-2">
                    {filteredObligations.map((obl: any) => (
                      <div key={obl.id} className="p-3 rounded-lg border border-border hover:bg-muted/30 cursor-pointer" onClick={() => navigate(`/contract/obligation/${obl.id}`)}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px]">{obl.type}</Badge>
                            <Badge className={cn("text-[10px]", statusColors[obl.enforcementStatus])}>{obl.enforcementStatus.replace('_', ' ')}</Badge>
                          </div>
                          {obl.impactDollar > 0 && (
                            <span className="text-xs font-bold text-status-danger">${(obl.impactDollar / 1000).toFixed(1)}K</span>
                          )}
                        </div>
                        <p className="text-sm">{obl.description}</p>
                      </div>
                    ))}
                    {filteredObligations.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">No obligations in this category</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* English Explanation */}
          <Card className="card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />Contract Enforcement Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 rounded-lg bg-muted/30 text-sm leading-relaxed">
                {contract.bucketTag === 'compliant' ? (
                  <p>All obligations under <strong>{contract.contractName}</strong> are currently being met. Coverage score is {contract.coverageScore}% with all monitored terms validated against transaction data. No action required at this time.</p>
                ) : contract.bucketTag === 'violations' ? (
                  <p>
                    <strong>{contract.contractName}</strong> has {obligations.filter((o: any) => o.enforcementStatus === 'violated').length} confirmed violations 
                    totaling <strong className="text-status-danger">${(contract.leakageEstimateDollar / 1000).toFixed(1)}K</strong> in leakage. 
                    Key issues: {obligations.filter((o: any) => o.enforcementStatus === 'violated').map((o: any) => o.description).join('; ')}. 
                    Recommended actions include filing penalty claims and requesting credit notes from the supplier.
                  </p>
                ) : (
                  <p>
                    <strong>{contract.contractName}</strong> has a risk score of {contract.riskScore} with 
                    ${(contract.leakageEstimateDollar / 1000).toFixed(1)}K in potential leakage. 
                    {obligations.filter((o: any) => o.enforcementStatus === 'at_risk').length} obligations are at risk of non-compliance. 
                    Proactive intervention is recommended to prevent further leakage.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Actions + Timeline + Comms */}
        <div className="col-span-4 space-y-4">
          {/* Recommended Actions */}
          <Card className="card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Gavel className="w-4 h-4" />Recommended Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {obligations.filter((o: any) => o.enforcementStatus !== 'met').length > 0 ? (
                obligations.filter((o: any) => o.enforcementStatus !== 'met').map((obl: any) => (
                  <div key={obl.id} className="p-3 rounded-lg border border-border space-y-2">
                    <p className="text-sm font-medium">{obl.type === 'rebate' ? 'Claim rebate' : obl.type === 'penalty' ? 'Trigger penalty' : obl.type === 'price' ? 'Correct pricing' : 'Review obligation'}: {obl.description}</p>
                    {obl.impactDollar > 0 && <p className="text-xs text-muted-foreground">Expected recovery: ${(obl.impactDollar / 1000).toFixed(1)}K</p>}
                    <div className="flex gap-2">
                      <Button size="sm" className="h-7 text-xs" onClick={() => handleApprove(`${obl.type} action for ${obl.id}`)}>
                        Approve & Execute
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => toast.info('Edit mode opened for this action')}>Edit</Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground py-2">No pending actions — all obligations met.</p>
              )}
            </CardContent>
          </Card>

          {/* Approval Gate */}
          <Card className="card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Approval Gate</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between"><span className="text-muted-foreground">Acting as</span><Badge>{currentRole}</Badge></div>
              <p className="text-xs text-muted-foreground">
                {currentRole === 'Category Manager' && 'Can approve commercial claims below $25K threshold'}
                {currentRole === 'Finance Controller' && 'Can approve payment holds and large claims'}
                {currentRole === 'Admin' && 'Full override capability with reason'}
                {currentRole === 'Procurement' && 'Can approve price corrections and renegotiation packs'}
              </p>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4" />Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contract.timeline.map((evt: any, i: number) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{evt.event}</p>
                      <p className="text-xs text-muted-foreground">{evt.actor} · {new Date(evt.time).toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground">{evt.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
