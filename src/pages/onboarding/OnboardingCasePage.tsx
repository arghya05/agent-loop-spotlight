import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ChevronLeft, CheckCircle2, AlertTriangle, XCircle, Clock,
  FileText, Shield, Play, Loader2, RefreshCcw, Ban
} from 'lucide-react';
import { cn } from '@/lib/utils';
import casesData from '@/data/onboarding/cases.json';
import suppliersData from '@/data/onboarding/suppliers.json';
import { useOnboardingStore } from '@/store/onboardingStore';
import { toast } from 'sonner';

const formatDateTime = (dateStr: string) => new Date(dateStr).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

const agentSteps = [
  { id: 'collector', label: 'Document Collector', icon: FileText },
  { id: 'extractor', label: 'Document Extractor', icon: FileText },
  { id: 'validator', label: 'Policy Validator', icon: Shield },
  { id: 'screener', label: 'External Screening Agent', icon: Shield },
  { id: 'scorer', label: 'Risk Scoring Agent', icon: AlertTriangle },
  { id: 'gate', label: 'Approval Gate Orchestrator', icon: CheckCircle2 },
  { id: 'executor', label: 'Activation Executor', icon: Play },
];

export const OnboardingCasePage = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { addToolTrace, addAuditEntry, currentRole } = useOnboardingStore();

  const [runningStepIdx, setRunningStepIdx] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const caseData = casesData.cases.find(c => c.id === caseId);
  const supplier = caseData ? suppliersData.suppliers.find(s => s.id === caseData.supplierId) : null;

  if (!caseData || !supplier) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => navigate(-1)}><ChevronLeft className="w-4 h-4 mr-1" /> Back</Button>
        <p className="mt-4 text-muted-foreground">Case not found</p>
      </div>
    );
  }

  const runStep = (stepIdx: number) => {
    const step = agentSteps[stepIdx];
    setRunningStepIdx(stepIdx);
    addToolTrace({
      timestamp: new Date().toISOString(),
      toolName: step.label,
      action: `Running ${step.label} for ${supplier.name}...`,
      dataSources: ['supplier_docs', 'policy_rules', 'external_apis'],
      duration: Math.random() * 2000 + 500,
    });
    setTimeout(() => {
      setRunningStepIdx(-1);
      setCompletedSteps(prev => [...prev, step.id]);
      toast.success(`${step.label} completed`);
      addAuditEntry({
        timestamp: new Date().toISOString(),
        actor: 'Agent',
        role: currentRole,
        decision: `${step.label} completed`,
        details: `Processed for ${supplier.name}`
      });
    }, 2000);
  };

  const stageSteps = ['Request Received', 'Document Collection', 'Document Extraction', 'Policy Validation', 'External Screening', 'Risk Scoring', 'Approval Gate', 'Supplier Activated'];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">Case: {caseData.id}</h1>
            <Badge variant="outline">{supplier.name}</Badge>
            <Badge className={cn("text-xs", supplier.bucketTag === 'blocked' ? 'bg-status-danger' : supplier.bucketTag === 'needs-review' ? 'bg-status-warning' : 'bg-status-success')} >
              {supplier.bucketTag.replace('-', ' ')}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Current stage: {caseData.stage}</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* LEFT: Agent Steps */}
        <div className="col-span-5 space-y-4">
          <Card className="card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Play className="w-4 h-4 text-primary" /> Agent Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {agentSteps.map((step, idx) => {
                  const isComplete = completedSteps.includes(step.id);
                  const isRunning = runningStepIdx === idx;
                  const Icon = step.icon;
                  return (
                    <div key={step.id} className={cn("flex items-center gap-3 p-3 rounded-lg transition-all", isComplete ? 'bg-status-success/5' : isRunning ? 'bg-primary/5 border border-primary/20' : 'bg-muted/30')}>
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", isComplete ? 'bg-status-success text-primary-foreground' : isRunning ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
                        {isComplete ? <CheckCircle2 className="w-4 h-4" /> : isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{step.label}</p>
                        {isComplete && <p className="text-[10px] text-status-success">Completed</p>}
                        {isRunning && <p className="text-[10px] text-primary">Processing...</p>}
                      </div>
                      {!isComplete && !isRunning && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => runStep(idx)} disabled={runningStepIdx !== -1}>
                          <Play className="w-3 h-3 mr-1" /> Run
                        </Button>
                      )}
                      {isComplete && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={() => { setCompletedSteps(prev => prev.filter(s => s !== step.id)); runStep(idx); }} disabled={runningStepIdx !== -1}>
                          <RefreshCcw className="w-3 h-3 mr-1" /> Re-run
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Timeline + Audit + Decision */}
        <div className="col-span-7 space-y-4">
          {/* Case Timeline */}
          <Card className="card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" /> Case Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {stageSteps.map((step, i) => {
                  const stageData = caseData.timeline.find(t => t.stage === step);
                  const status = stageData?.status || 'pending';
                  return (
                    <div key={step} className={cn("flex items-center gap-3 px-3 py-2 rounded text-sm", status === 'complete' ? 'bg-status-success/5' : status === 'in_progress' ? 'bg-primary/5' : status === 'blocked' ? 'bg-status-danger/5' : 'bg-muted/20 opacity-50')}>
                      <div className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0", status === 'complete' ? 'bg-status-success text-primary-foreground' : status === 'in_progress' ? 'bg-primary text-primary-foreground' : status === 'blocked' ? 'bg-status-danger text-primary-foreground' : 'bg-muted text-muted-foreground')}>
                        {status === 'complete' ? <CheckCircle2 className="w-3 h-3" /> : status === 'blocked' ? <Ban className="w-3 h-3" /> : i + 1}
                      </div>
                      <span className="flex-1 font-medium">{step}</span>
                      {stageData?.completedAt && <span className="text-[10px] text-muted-foreground">{formatDateTime(stageData.completedAt)}</span>}
                      {status === 'in_progress' && <Loader2 className="w-3 h-3 text-primary animate-spin" />}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Audit Events */}
          <Card className="card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> Audit Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[200px]">
                <div className="space-y-2">
                  {caseData.auditEvents.map((event, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs p-2 rounded bg-muted/30">
                      <div className={cn("w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5", event.actor === 'Agent' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground')}>
                        {event.actor === 'Agent' ? <Shield className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{event.event}</p>
                        <p className="text-muted-foreground">{event.details}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{formatDateTime(event.time)} • {event.actor}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Recommended Action */}
          <Card className="card-elevated border-2 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" /> Recommended Action
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 rounded-lg bg-muted/30 mb-3">
                <p className="text-sm text-foreground">
                  {supplier.riskScore <= 25
                    ? 'This supplier qualifies for auto-approval. All mandatory documents are verified and external screening is clean.'
                    : supplier.riskScore <= 60
                    ? 'Human review required. Address missing documents and resolve flagged screening results before proceeding.'
                    : 'Critical compliance failures detected. Recommend blocking onboarding until all issues are resolved and re-screened.'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => navigate(`/onboarding/supplier/${supplier.id}`)}>
                  Open Supplier 360
                </Button>
                <Button size="sm" variant="outline" onClick={() => { toast.info('Request sent to supplier for missing information'); }}>
                  Request Info
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
