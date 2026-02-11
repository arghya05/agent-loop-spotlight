import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import casesData from '@/data/contract/cases.json';
import { useContractStore } from '@/store/contractStore';
import { toast } from 'sonner';
import {
  ArrowLeft, CheckCircle2, Clock, Loader2, Circle, Gavel, Send, MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

const stepIcons: Record<string, any> = {
  complete: CheckCircle2,
  in_progress: Loader2,
  pending: Circle,
};

export const ContractCasePage = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { currentRole, addAuditEntry } = useContractStore();

  const enfCase = (casesData as any[]).find(c => c.id === caseId);

  if (!enfCase) {
    return <div className="p-6"><p>Case not found.</p></div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Enforcement Case: {enfCase.id}</h1>
          <p className="text-sm text-muted-foreground">{enfCase.supplierName} · {enfCase.issueType}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant={enfCase.severity === 'high' ? 'destructive' : 'default'}>{enfCase.severity}</Badge>
          <Badge variant="outline">${(enfCase.impactDollar / 1000).toFixed(1)}K</Badge>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* LEFT: Steps */}
        <div className="col-span-5">
          <Card className="card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Gavel className="w-4 h-4" />Enforcement Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {enfCase.steps.map((step: any, i: number) => {
                  const Icon = stepIcons[step.status] || Circle;
                  return (
                    <div key={i} className="flex items-start gap-3 py-3 border-b border-border/50 last:border-0">
                      <div className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                        step.status === 'complete' ? 'bg-status-success/10' : step.status === 'in_progress' ? 'bg-primary/10' : 'bg-muted'
                      )}>
                        <Icon className={cn(
                          "w-4 h-4",
                          step.status === 'complete' ? 'text-status-success' : step.status === 'in_progress' ? 'text-primary animate-spin' : 'text-muted-foreground'
                        )} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{step.stage}</p>
                        <p className="text-xs text-muted-foreground">
                          {step.status === 'complete' && step.completedAt ? `Completed ${new Date(step.completedAt).toLocaleString()}` : step.status === 'in_progress' ? 'In progress...' : 'Pending'}
                        </p>
                        {step.status === 'in_progress' && (
                          <Button size="sm" variant="outline" className="h-6 text-xs mt-1" onClick={() => toast.success(`Re-running ${step.stage}...`)}>
                            Re-run
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Decision + Comms */}
        <div className="col-span-7 space-y-4">
          {/* Decision */}
          <Card className="card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Decision & Approvals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-muted/30">
                <p className="text-sm font-medium mb-1">Recommended Action</p>
                <p className="text-sm text-muted-foreground">{enfCase.issueType} — File claims totaling ${(enfCase.impactDollar / 1000).toFixed(1)}K</p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => {
                  addAuditEntry({ actor: currentRole, event: 'Approved enforcement case', details: `${enfCase.id}: $${(enfCase.impactDollar / 1000).toFixed(1)}K` });
                  toast.success('Case approved — executing actions');
                }}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />Approve & Execute
                </Button>
                <Button size="sm" variant="outline" onClick={() => toast.info('Case rejected')}>Reject</Button>
              </div>
              <div className="flex justify-between text-sm pt-2"><span className="text-muted-foreground">Acting as</span><Badge>{currentRole}</Badge></div>
            </CardContent>
          </Card>

          {/* Comms Trail */}
          <Card className="card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />Communication Trail
              </CardTitle>
            </CardHeader>
            <CardContent>
              {enfCase.commsTrail.length > 0 ? (
                <div className="space-y-3">
                  {enfCase.commsTrail.map((msg: any, i: number) => (
                    <div key={i} className="p-3 rounded-lg border border-border">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">{msg.channel}</Badge>
                          <span className="text-xs text-muted-foreground">{msg.sender} → {msg.recipient}</span>
                        </div>
                        <Badge variant={msg.status === 'sent' ? 'default' : 'secondary'} className="text-[10px]">{msg.status}</Badge>
                      </div>
                      <p className="text-sm">{msg.snippet}</p>
                      {msg.followUpDue && <p className="text-xs text-muted-foreground mt-1">Follow-up due: {new Date(msg.followUpDue).toLocaleDateString()}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-2">No communications yet.</p>
              )}
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" className="text-xs" onClick={() => toast.success('Reminder sent')}>
                  <Send className="w-3 h-3 mr-1" />Send Reminder
                </Button>
                <Button size="sm" variant="outline" className="text-xs" onClick={() => toast.success('Escalated')}>Escalate</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
