import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useStoreOpsStore } from '@/store/storeOpsStore';
import { getStoreAgent, storeBucketMeta, storeOpsSignals } from '@/data/storeOps';
import {
  Activity,
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronLeft,
  Database,
  FileBarChart,
  FileSearch,
  GitBranch,
  ListChecks,
  Loader2,
  Play,
  Send,
  ShieldCheck,
  UserCheck,
  Zap,
} from 'lucide-react';

const stepIconCycle = [Database, Activity, FileSearch, ShieldCheck, GitBranch, FileBarChart];

const buildInvestigationSteps = (
  workflow: string[],
  sources: string[],
  metricLabel: string,
  threshold: string,
  category: string,
  storeName: string,
) => {
  const descriptors: Record<string, string> = {
    Sense: `Pulling ${sources.slice(0, 3).join(', ')}…`,
    'Sense Footfall': `Reading footfall + queue cameras at ${storeName}…`,
    'Read Category Context': `Loading ${category} category rules + calendar…`,
    'Forecast Demand': `Forecasting ${category} demand for ${storeName}…`,
    Detect: `Scanning for ${metricLabel} anomalies…`,
    'Detect Leakage': 'Correlating POS, RFID, refunds, overrides…',
    'Capture Shelf': 'Ingesting latest shelf image vs approved planogram…',
    Segment: 'Segmenting loyalty + intent signals…',
    'Segment Demand': 'Segmenting loyalty + intent signals…',
    Prioritize: `Comparing ${metricLabel} vs ${threshold}…`,
    'Predict Queue': 'Forecasting queue wait against SLA…',
    'Compare Thresholds': `Comparing ${metricLabel} vs ${threshold}…`,
    'Check Shelf': 'Cross-checking shelf camera + POS velocity…',
    'Check Skills': 'Mapping roster to skill + clearance rules…',
    'Compare Layout': 'Diffing shelf image against approved layout…',
    Diagnose: 'Building root cause across evidence…',
    'Correlate Evidence': 'Linking POS, RFID, CCTV exception metadata…',
    Govern: `Applying ${category} guardrails…`,
    'Explain Variance': 'Explaining category variance…',
    'Rank Risk': 'Ranking leakage exposure…',
    'Check Backroom': 'Confirming backroom + nearby-store stock…',
    'Detect Gap': 'Detecting coverage gap vs forecast…',
    'Match Campaign': 'Matching active campaign + brand event…',
    'Detect Gap (planogram)': 'Locating missing blocks / wrong adjacency…',
    Recommend: 'Drafting recommended store action…',
    'Recommend Action': 'Drafting recommended store action…',
    'Recommend Pick/Transfer': 'Drafting pick + inter-store transfer plan…',
    'Recommend Roster': 'Drafting roster + call-in plan…',
    Assign: 'Routing to recommended owner…',
    'Allocate Advisor': 'Allocating advisor / specialist…',
    'Open Capacity': 'Opening lanes + mobile POS…',
    'Create Task': 'Creating reset / pick task in task manager…',
    'Freeze Exposure': 'Freezing high-value transfers…',
    Notify: 'Sending nudge to store team…',
    'Notify LP': 'Notifying Loss Prevention…',
    'Notify Duty Manager': 'Notifying duty manager…',
    'Notify Manager': 'Notifying store + workforce planner…',
    'Send Nudge': 'Sending loyalty / advisor nudge…',
    Monitor: 'Monitoring recovery pulse…',
    'Confirm Fill': 'Awaiting photo confirmation of shelf fill…',
    'Verify Photo': 'Awaiting verification photo from associate…',
    'Resolve POS': 'Rebooting / failover for POS lane…',
    'Measure Conversion': 'Measuring conversion lift post-action…',
  };
  return workflow.map((label, idx) => ({
    id: `step-${idx}`,
    label,
    icon: stepIconCycle[idx % stepIconCycle.length],
    description: descriptors[label] || `${label}…`,
  }));
};

const buildExecutionPhases = (agentShortLabel: string, owner: string) => [
  { id: 'dispatch', label: 'Dispatching', description: `Preparing ${agentShortLabel} task…` },
  { id: 'assign', label: 'Assigning', description: `Routing to ${owner}…` },
  { id: 'notify', label: 'Notifying', description: `Notifying ${owner} + regional ops…` },
  { id: 'complete', label: 'Complete', description: 'Store task active and audit logged' },
];

type TaskStatus = 'queued' | 'running' | 'complete';

interface ExecTask {
  id: string;
  title: string;
  owner: string;
  priority: string;
  status: TaskStatus;
}

export const StoreOpsSignalDetailPage = () => {
  const navigate = useNavigate();
  const { agentId, signalId } = useParams();
  const agent = getStoreAgent(agentId);
  const { addAuditEntry, updateSignal, signalOverrides } = useStoreOpsStore();
  const signal = useMemo(() => storeOpsSignals.find((item) => item.id === signalId), [signalId]);

  const investigationSteps = useMemo(
    () => signal
      ? buildInvestigationSteps(agent.workflow, signal.sources, signal.metricLabel, signal.threshold, signal.category, signal.storeName)
      : [],
    [agent, signal],
  );
  const executionPhases = useMemo(
    () => signal ? buildExecutionPhases(agent.shortLabel, signal.recommendedOwner) : [],
    [agent, signal],
  );

  const [currentStep, setCurrentStep] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const [isExecuting, setIsExecuting] = useState(false);
  const [executionPhase, setExecutionPhase] = useState(-1);
  const [executingTasks, setExecutingTasks] = useState<ExecTask[]>([]);
  const [executionComplete, setExecutionComplete] = useState(false);
  const execIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Run investigation steps
  useEffect(() => {
    if (isRunning && currentStep < investigationSteps.length - 1) {
      const timer = setTimeout(() => {
        const next = currentStep + 1;
        setCurrentStep(next);
        if (next === investigationSteps.length - 1) {
          setTimeout(() => {
            setIsRunning(false);
            setIsComplete(true);
          }, 800);
        }
      }, 1100);
      return () => clearTimeout(timer);
    }
  }, [isRunning, currentStep]);

  // Run execution phases
  useEffect(() => {
    if (isExecuting && executionPhase < executionPhases.length - 1) {
      const timer = setTimeout(() => {
        const next = executionPhase + 1;
        setExecutionPhase(next);
        if (next === executionPhases.length - 1) {
          setTimeout(() => {
            setIsExecuting(false);
            setExecutionComplete(true);
          }, 500);
        }
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [isExecuting, executionPhase]);

  // Progress tasks
  useEffect(() => {
    if (executionComplete && executingTasks.length > 0) {
      execIntervalRef.current = setInterval(() => {
        setExecutingTasks((prev) => {
          const running = prev.find((t) => t.status === 'running');
          const queued = prev.find((t) => t.status === 'queued');
          if (running) {
            return prev.map((t) => (t.id === running.id ? { ...t, status: 'complete' as TaskStatus } : t));
          }
          if (queued) {
            return prev.map((t) => (t.id === queued.id ? { ...t, status: 'running' as TaskStatus } : t));
          }
          if (execIntervalRef.current) clearInterval(execIntervalRef.current);
          return prev;
        });
      }, 1600);
      return () => {
        if (execIntervalRef.current) clearInterval(execIntervalRef.current);
      };
    }
  }, [executionComplete, executingTasks.length]);

  if (!signal) return <div className="p-6">Store ops signal not found.</div>;

  const status = signalOverrides[signal.id]?.status || signal.status;
  const bucketMeta = storeBucketMeta[signal.bucket];

  const startInvestigation = () => {
    setIsRunning(true);
    setCurrentStep(0);
    addAuditEntry({ actor: 'Store Ops Agent', event: 'Investigation started', details: `${signal.id} · ${signal.storeName}` });
  };

  const approve = () => {
    updateSignal(signal.id, { status: 'investigating' });
    addAuditEntry({ actor: 'Store Manager', event: 'Action accepted', details: `${signal.id}: ${signal.recommendedAction}` });
    toast.success('Store action accepted');
  };

  const enforcePlan = () => {
    const tasks: ExecTask[] = [
      { id: `${signal.id}-t1`, title: signal.recommendedAction, owner: signal.recommendedOwner, priority: signal.severity, status: 'running' },
      ...signal.actionTrace.slice(1, 3).map((t, i) => ({
        id: `${signal.id}-t${i + 2}`,
        title: t,
        owner: signal.recommendedOwner,
        priority: 'medium',
        status: 'queued' as TaskStatus,
      })),
    ];
    setExecutingTasks(tasks);
    setIsExecuting(true);
    setExecutionPhase(0);
    updateSignal(signal.id, { status: 'fixed', owner: signal.recommendedOwner });
    addAuditEntry({ actor: 'Store Ops Agent', event: 'Action enforced', details: `${signal.id}: tasks dispatched to ${signal.recommendedOwner}` });
    toast.success(`Task sent to ${signal.recommendedOwner}`);
  };

  const allTasksComplete = executingTasks.length > 0 && executingTasks.every((t) => t.status === 'complete');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Badge variant="outline" className={cn('text-xs', bucketMeta.badgeClass)}>{bucketMeta.label}</Badge>
            <Badge variant="outline" className="text-xs">{agent.shortLabel}</Badge>
            <Badge variant="outline" className="text-xs">{signal.category}</Badge>
            <Badge variant="outline" className="text-xs capitalize">{status}</Badge>
          </div>
          <h1 className="text-2xl font-bold text-foreground">{signal.storeName} · {signal.department}</h1>
          <p className="text-sm text-muted-foreground">
            {signal.metricLabel}: <span className="font-medium text-foreground">{signal.metricValue}</span> vs target {signal.threshold} · {signal.storeId} · {signal.country}
          </p>
        </div>
        {!isRunning && !isComplete && (
          <Button onClick={startInvestigation}>
            <Play className="w-4 h-4 mr-2" />
            Start Investigation
          </Button>
        )}
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Estimated impact</p>
          <p className="text-2xl font-bold">${(signal.estimatedImpact / 1000).toFixed(0)}K</p>
        </div>
      </div>

      {/* Multi-agent reasoning trace */}
      <Card className="card-elevated">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" /> Multi-Agent Reasoning Trace
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2 text-xs">
            {[
              { icon: Database, label: 'SENSE', detail: signal.sources.join(' · ') },
              { icon: Bot, label: 'DIAGNOSE', detail: signal.metricLabel },
              { icon: ShieldCheck, label: 'GOVERN', detail: `Threshold ${signal.threshold}` },
              { icon: ListChecks, label: 'RECOMMEND', detail: signal.recommendedOwner },
              { icon: Send, label: 'NOTIFY', detail: `Due in ${signal.dueIn}` },
            ].map((step) => (
              <div key={step.label} className="p-3 rounded-lg bg-muted/40 border border-border">
                <step.icon className="w-4 h-4 text-primary mb-2" />
                <p className="font-semibold text-[10px] text-muted-foreground tracking-wide">{step.label}</p>
                <p className="text-xs mt-1 line-clamp-2">{step.detail}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 3-column investigation workspace */}
      <div className="grid grid-cols-12 gap-6">
        {/* Investigation Steps */}
        <div className="col-span-4">
          <Card className="card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Investigation Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {investigationSteps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === index && isRunning;
                const isCompleted = currentStep > index || isComplete;
                const isPending = currentStep < index;
                return (
                  <div
                    key={step.id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg transition-all',
                      isActive && 'bg-status-info-bg border border-status-info/40',
                      isCompleted && 'bg-status-success-bg/50',
                      isPending && 'bg-muted/30 opacity-50',
                    )}
                  >
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center',
                        isActive && 'bg-status-info text-white',
                        isCompleted && 'bg-status-success text-white',
                        isPending && 'bg-muted text-muted-foreground',
                      )}
                    >
                      {isActive ? <Loader2 className="w-4 h-4 animate-spin" /> : isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className={cn('text-sm font-medium', isActive && 'text-status-info', isCompleted && 'text-status-success')}>{step.label}</p>
                      {isActive && <p className="text-xs text-muted-foreground">{step.description}</p>}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Root Cause */}
        <div className="col-span-4">
          <Card className="card-elevated h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Root Cause Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              {isComplete ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <p className="text-sm font-medium mb-2">Primary Root Cause ({Math.round(signal.confidence * 100)}% confidence)</p>
                    <p className="text-sm text-muted-foreground">{signal.reason}</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-muted-foreground">Agent confidence</span>
                      <span className="font-medium">{Math.round(signal.confidence * 100)}%</span>
                    </div>
                    <Progress value={signal.confidence * 100} className="h-2" />
                  </div>
                  <div className="space-y-2 pt-2 border-t border-border">
                    <p className="text-xs font-medium text-muted-foreground uppercase">Evidence Used</p>
                    {signal.evidence.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 rounded bg-muted/30 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-status-success mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-48 text-muted-foreground">
                  <p className="text-sm">Run investigation to see analysis</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recommended Plan + Execution */}
        <div className="col-span-4">
          <Card className="card-elevated h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Recommended Store Action</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isComplete ? (
                <>
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className={cn(
                        status === 'fixed' && 'bg-status-success-bg text-status-success border-status-success/30',
                        status !== 'fixed' && 'bg-status-warning-bg text-status-warning border-status-warning/30',
                      )}
                    >
                      {status.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">Owner: {signal.recommendedOwner}</span>
                  </div>

                  <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 text-sm font-medium">
                    {signal.recommendedAction}
                  </div>

                  {(isExecuting || executionComplete) && (
                    <div className="p-3 rounded-lg bg-muted/30 border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-status-info" />
                        <span className="text-xs font-medium">Agent Execution</span>
                      </div>
                      <div className="flex items-center gap-1 flex-wrap">
                        {executionPhases.map((phase, idx) => (
                          <div key={phase.id} className="flex items-center">
                            <div
                              className={cn(
                                'px-2 py-1 rounded text-[10px] font-medium transition-all',
                                executionPhase > idx && 'bg-status-success text-white',
                                executionPhase === idx && isExecuting && 'bg-status-info text-white animate-pulse',
                                executionPhase < idx && 'bg-muted text-muted-foreground',
                              )}
                            >
                              {phase.label}
                            </div>
                            {idx < executionPhases.length - 1 && <ArrowRight className="w-3 h-3 mx-1 text-muted-foreground" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 max-h-48 overflow-auto">
                    {executingTasks.length > 0 ? (
                      executingTasks.map((task) => (
                        <div
                          key={task.id}
                          className={cn(
                            'p-2 rounded border text-sm transition-all',
                            task.status === 'complete' && 'bg-status-success-bg/50 border-status-success/30',
                            task.status === 'running' && 'bg-status-info-bg border-status-info/40',
                            task.status === 'queued' && 'bg-muted/30 border-border',
                          )}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={task.priority === 'critical' ? 'destructive' : 'outline'} className="text-[9px] px-1">
                              {task.priority}
                            </Badge>
                            <div className="flex-1" />
                            {task.status === 'running' && <Loader2 className="w-3 h-3 animate-spin text-status-info" />}
                            {task.status === 'complete' && <CheckCircle2 className="w-3 h-3 text-status-success" />}
                          </div>
                          <p className="text-xs">{task.title}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{task.owner}</p>
                        </div>
                      ))
                    ) : (
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between"><span className="text-muted-foreground">Due in</span><span className="font-medium">{signal.dueIn}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Severity</span><span className="font-medium capitalize">{signal.severity}</span></div>
                        <div className="pt-2 border-t border-border">
                          <p className="text-muted-foreground mb-1">Tool trace</p>
                          {signal.actionTrace.map((t, i) => (
                            <p key={i} className="text-[11px] p-2 rounded bg-muted/40 mb-1">{t}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {allTasksComplete && (
                    <div className="p-2 rounded-lg bg-status-success-bg/50 border border-status-success/30 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-status-success" />
                      All store tasks complete · audit trail updated
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={approve} disabled={status === 'fixed'}>
                      <UserCheck className="w-3.5 h-3.5 mr-1" /> Accept
                    </Button>
                    <Button size="sm" className="flex-1" onClick={enforcePlan} disabled={isExecuting || executingTasks.length > 0}>
                      <Send className="w-3.5 h-3.5 mr-1" /> Enforce & Notify
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-48 text-muted-foreground">
                  <p className="text-sm">Run investigation to see plan</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
