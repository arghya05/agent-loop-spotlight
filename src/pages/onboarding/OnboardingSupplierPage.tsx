import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import {
  ChevronLeft, CheckCircle2, AlertTriangle, XCircle, Clock, Calendar,
  Send, FileText, MapPin, User, Mail, Shield, AlertCircle, Ban,
  ExternalLink, Eye, MessageSquare, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import suppliersData from '@/data/onboarding/suppliers.json';
import casesData from '@/data/onboarding/cases.json';
import { useOnboardingStore } from '@/store/onboardingStore';
import { toast } from 'sonner';

const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const formatDateTime = (dateStr: string) => new Date(dateStr).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

const stageSteps = ['Request Received', 'Document Collection', 'Document Extraction', 'Policy Validation', 'External Screening', 'Risk Scoring', 'Approval Gate', 'Supplier Activated'];

const docStatusColor: Record<string, string> = {
  verified: 'text-status-success',
  flagged: 'text-status-warning',
  pending: 'text-status-warning',
  missing: 'text-status-danger',
  expired: 'text-status-danger',
  fail: 'text-status-danger',
};

const docStatusIcon: Record<string, React.ReactNode> = {
  verified: <CheckCircle2 className="w-3.5 h-3.5" />,
  flagged: <AlertTriangle className="w-3.5 h-3.5" />,
  pending: <Clock className="w-3.5 h-3.5" />,
  missing: <XCircle className="w-3.5 h-3.5" />,
  expired: <XCircle className="w-3.5 h-3.5" />,
  fail: <XCircle className="w-3.5 h-3.5" />,
};

const severityColor: Record<string, string> = {
  critical: 'bg-status-danger text-primary-foreground',
  high: 'bg-status-warning text-primary-foreground',
  medium: 'bg-status-warning/60 text-foreground',
  low: 'bg-muted text-muted-foreground',
};

export const OnboardingSupplierPage = () => {
  const { supplierId } = useParams<{ supplierId: string }>();
  const navigate = useNavigate();
  const { addAuditEntry, currentRole } = useOnboardingStore();
  const [approving, setApproving] = useState(false);
  const [approved, setApproved] = useState(false);

  const supplier = suppliersData.suppliers.find(s => s.id === supplierId);
  const caseData = casesData.cases.find(c => c.supplierId === supplierId);

  if (!supplier) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => navigate(-1)}><ChevronLeft className="w-4 h-4 mr-1" /> Back</Button>
        <p className="mt-4 text-muted-foreground">Supplier not found</p>
      </div>
    );
  }

  const bucketColors: Record<string, string> = {
    'fast-track': 'bg-status-success',
    'needs-review': 'bg-status-warning',
    'blocked': 'bg-status-danger',
  };

  const riskExplanation = () => {
    const drivers: string[] = [];
    const failedChecks = supplier.checks.filter(c => c.status === 'fail' || c.status === 'flagged');
    failedChecks.forEach(c => drivers.push(`${c.name}: ${c.status}`));
    const missingDocs = supplier.requiredDocs.filter(d => d.status !== 'verified');
    missingDocs.forEach(d => drivers.push(`${d.type}: ${d.status}`));
    supplier.externalSignals.forEach(s => drivers.push(`${s.source}: ${s.snippet.slice(0, 60)}...`));
    return drivers;
  };

  const handleApprove = () => {
    setApproving(true);
    setTimeout(() => {
      setApproving(false);
      setApproved(true);
      toast.success(`${supplier.name} approved and activated`, { description: 'Vendor record created in ERP. Monitoring enabled.' });
      addAuditEntry({
        timestamp: new Date().toISOString(),
        actor: 'User',
        role: currentRole,
        decision: `Approved ${supplier.name}`,
        details: 'Supplier activated, vendor master record created'
      });
    }, 2000);
  };

  const handleReject = () => {
    toast.error(`${supplier.name} rejected`, { description: 'Reason required. Case moved to blocked.' });
    addAuditEntry({
      timestamp: new Date().toISOString(),
      actor: 'User',
      role: currentRole,
      decision: `Rejected ${supplier.name}`,
      details: 'Supplier onboarding blocked'
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{supplier.name}</h1>
            <Badge className={cn("text-xs", bucketColors[supplier.bucketTag])}>{supplier.bucketTag.replace('-', ' ')}</Badge>
            <Badge variant="outline" className="text-xs">Risk: {supplier.riskScore}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{supplier.country} • {supplier.factoryLocations.join(', ')}</p>
        </div>
      </div>

      {/* 3-Column Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* LEFT: Supplier Snapshot */}
        <div className="col-span-3 space-y-4">
          <Card className="card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="w-4 h-4 text-primary" /> Supplier Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 rounded bg-muted/50">
                  <p className="text-[10px] text-muted-foreground uppercase">Risk Score</p>
                  <p className={cn("font-semibold", supplier.riskScore >= 60 ? "text-status-danger" : supplier.riskScore >= 26 ? "text-status-warning" : "text-status-success")}>{supplier.riskScore}</p>
                </div>
                <div className="p-2 rounded bg-muted/50">
                  <p className="text-[10px] text-muted-foreground uppercase">Bucket</p>
                  <p className="font-semibold capitalize">{supplier.bucketTag.replace('-', ' ')}</p>
                </div>
              </div>

              <div className="pt-2 border-t space-y-2">
                <div className="flex items-center gap-2 text-xs"><MapPin className="w-3 h-3 text-muted-foreground" /><span>{supplier.country}</span></div>
                <div className="flex items-center gap-2 text-xs"><User className="w-3 h-3 text-muted-foreground" /><span>{supplier.owner}</span></div>
                <div className="flex items-center gap-2 text-xs"><Calendar className="w-3 h-3 text-muted-foreground" /><span>Next review: {formatDate(supplier.nextReviewDue)}</span></div>
              </div>

              <div className="pt-2 border-t space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase">Categories</p>
                <div className="flex flex-wrap gap-1">{supplier.categories.map((c, i) => <Badge key={i} variant="secondary" className="text-[10px]">{c}</Badge>)}</div>
              </div>

              <div className="pt-3 space-y-2">
                <Button className="w-full" size="sm" onClick={() => navigate(`/onboarding/case/${supplier.onboardingCaseId}`)}>
                  <Eye className="w-4 h-4 mr-2" /> Open Case Workspace
                </Button>
                <Button variant="outline" className="w-full" size="sm" onClick={() => { toast.success('Message sent to supplier'); }}>
                  <Send className="w-4 h-4 mr-2" /> Message Supplier
                </Button>
                <Button variant="outline" className="w-full" size="sm" onClick={() => { toast.info('Escalated to Compliance Lead'); }}>
                  <AlertCircle className="w-4 h-4 mr-2" /> Escalate
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CENTER: Timeline + Documents */}
        <div className="col-span-5 space-y-4">
          {/* Onboarding Timeline */}
          <Card className="card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" /> Onboarding Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {stageSteps.map((step, i) => {
                  const stageData = caseData?.timeline.find(t => t.stage === step);
                  const status = stageData?.status || 'pending';
                  return (
                    <div key={step} className={cn("flex items-center gap-3 px-3 py-2 rounded-lg text-sm", status === 'complete' ? 'bg-status-success/5' : status === 'in_progress' ? 'bg-primary/5 border border-primary/20' : status === 'blocked' ? 'bg-status-danger/5 border border-status-danger/20' : 'bg-muted/30 opacity-60')}>
                      <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0", status === 'complete' ? 'bg-status-success text-primary-foreground' : status === 'in_progress' ? 'bg-primary text-primary-foreground' : status === 'blocked' ? 'bg-status-danger text-primary-foreground' : 'bg-muted text-muted-foreground')}>
                        {status === 'complete' ? <CheckCircle2 className="w-3.5 h-3.5" /> : status === 'blocked' ? <XCircle className="w-3.5 h-3.5" /> : i + 1}
                      </div>
                      <div className="flex-1">
                        <span className="font-medium">{step}</span>
                        {stageData?.completedAt && <span className="text-[10px] text-muted-foreground ml-2">{formatDateTime(stageData.completedAt)}</span>}
                      </div>
                      {status === 'in_progress' && <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card className="card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> Required Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {supplier.requiredDocs.map((doc, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30">
                    <span className={docStatusColor[doc.status]}>{docStatusIcon[doc.status]}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{doc.type}</p>
                      {doc.uploadedAt && <p className="text-[10px] text-muted-foreground">Uploaded {formatDate(doc.uploadedAt)}</p>}
                      {doc.status === 'missing' && <p className="text-[10px] text-status-danger">Not yet received</p>}
                      {doc.status === 'pending' && <p className="text-[10px] text-status-warning">Awaiting upload</p>}
                    </div>
                    <Badge variant="outline" className={cn("text-[10px] capitalize", docStatusColor[doc.status])}>{doc.status}</Badge>
                    {Object.keys(doc.extractedFields).length > 0 && (
                      <Button variant="ghost" size="sm" className="h-6 text-[10px] text-primary">
                        <Eye className="w-3 h-3 mr-1" /> Fields
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 italic">Fields extracted using Document AI</p>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Risk + Evidence + Comms + Decision */}
        <div className="col-span-4 space-y-4">
          {/* Risk Explanation */}
          <Card className="card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" /> Risk Explanation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 rounded-lg bg-muted/30 mb-3">
                <p className="text-sm text-foreground">
                  {supplier.riskScore <= 25
                    ? `${supplier.name} is a low-risk supplier with all mandatory checks passed and documents validated. Eligible for auto-approval.`
                    : supplier.riskScore <= 60
                    ? `${supplier.name} shows moderate risk signals requiring human review before approval. Key concerns include incomplete documentation and external screening flags.`
                    : `${supplier.name} is blocked due to critical compliance failures. Sanctions screening, adverse media, or mandatory document failures prevent progression.`
                  }
                </p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] text-muted-foreground uppercase font-medium">Top Risk Drivers</p>
                {riskExplanation().slice(0, 5).map((d, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs p-1.5 rounded bg-status-danger/5">
                    <AlertTriangle className="w-3 h-3 text-status-danger shrink-0" />
                    <span className="text-foreground">{d}</span>
                  </div>
                ))}
                {riskExplanation().length === 0 && <p className="text-xs text-status-success">No risk drivers detected</p>}
              </div>
            </CardContent>
          </Card>

          {/* External Signals */}
          {supplier.externalSignals.length > 0 && (
            <Card className="card-elevated">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-primary" /> External Signals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {supplier.externalSignals.map((signal, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-muted/30 border border-border/50">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={cn("text-[10px]", severityColor[signal.severity])}>{signal.severity}</Badge>
                        <span className="text-xs font-medium text-foreground">{signal.source}</span>
                        <Badge variant="outline" className="text-[10px] ml-auto">{signal.type}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{signal.snippet}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{formatDate(signal.date)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Communications */}
          <Card className="card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" /> Communications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[150px]">
                <div className="space-y-2">
                  {supplier.commsTrail.map((comm, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs p-2 rounded bg-muted/30">
                      <Mail className="w-3 h-3 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <p className="text-foreground">{comm.snippet}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{formatDateTime(comm.time)} • {comm.channel}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Decision Panel */}
          <Card className="card-elevated border-2 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" /> Decision
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {approved ? (
                <div className="p-3 rounded-lg bg-status-success/10 text-center">
                  <CheckCircle2 className="w-6 h-6 text-status-success mx-auto mb-1" />
                  <p className="text-sm font-medium text-status-success">Supplier Approved & Activated</p>
                </div>
              ) : (
                <>
                  <Button className="w-full" onClick={handleApprove} disabled={approving}>
                    {approving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</> : <><CheckCircle2 className="w-4 h-4 mr-2" /> Approve & Activate</>}
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => toast.info('Approved with conditions. Monitoring tasks created.')}>
                    <AlertTriangle className="w-4 h-4 mr-2" /> Approve with Conditions
                  </Button>
                  <Button variant="destructive" className="w-full" onClick={handleReject}>
                    <Ban className="w-4 h-4 mr-2" /> Reject / Block
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
