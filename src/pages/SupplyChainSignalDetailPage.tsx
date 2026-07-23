import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/appStore';
import { supplyBucketMeta, supplyChainSignals } from '@/data/supplyChainSignals';
import { supplyChainAgents } from '@/data/supplyChainAgents';
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
  MapPin,
  Play,
  Send,
  ShieldCheck,
  UserCheck,
  Zap,
} from 'lucide-react';

const stepIconCycle = [Database, Activity, FileSearch, ShieldCheck, GitBranch, FileBarChart];

const fmtCurrency = (value: number) =>
  value >= 1000 ? `AED ${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K` : `AED ${value}`;

const buildInvestigationSteps = (workflow: string[], sources: string[], metricLabel: string, threshold: string) =>
  workflow.map((label, idx) => ({
    id: `step-${idx}`,
    label,
    icon: stepIconCycle[idx % stepIconCycle.length],
    description:
      idx === 0
        ? `Pulling ${sources.slice(0, 3).join(', ')}…`
        : idx === 1
          ? `Scanning ${metricLabel} against ${threshold}…`
          : idx === workflow.length - 1
            ? 'Routing owner, SLA, and audit trail…'
            : `${label}…`,
  }));

type TaskStatus = 'queued' | 'running' | 'complete';

interface ExecTask {
  id: string;
  title: string;
  owner: string;
  priority: string;
  status: TaskStatus;
}

export const SupplyChainSignalDetailPage = () => {
  const navigate = useNavigate();
  const { agentId, signalId } = useParams();
  const agent = supplyChainAgents.find((item) => item.id === agentId);
  const signal = useMemo(() => supplyChainSignals.find((item) => item.id === signalId && item.agentId === agentId), [agentId, signalId]);
  const { addAuditEntry, addToolTrace, currentRole } = useAppStore();

  const [currentStep, setCurrentStep] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionPhase, setExecutionPhase] = useState(-1);
  const [executingTasks, setExecutingTasks] = useState<ExecTask[]>([]);
  const [executionComplete, setExecutionComplete] = useState(false);
  const execIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const investigationSteps = useMemo(
    () => (agent && signal ? buildInvestigationSteps(agent.workflow, signal.sources, signal.metricLabel, signal.threshold) : []),
    [agent, signal],
  );

  const executionPhases = [
    { id: 'dispatch', label: 'Dispatching' },
    { id: 'assign', label: 'Assigning' },
    { id: 'notify', label: 'Notifying' },
    { id: 'complete', label: 'Complete' },
  ];

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
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isRunning, currentStep, investigationSteps.length]);

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
      }, 850);
      return () => clearTimeout(timer);
    }
  }, [isExecuting, executionPhase, executionPhases.length]);

  useEffect(() => {
    if (executionComplete && executingTasks.length > 0) {
      execIntervalRef.current = setInterval(() => {
        setExecutingTasks((prev) => {
          const running = prev.find((task) => task.status === 'running');
          const queued = prev.find((task) => task.status === 'queued');
          if (running) return prev.map((task) => (task.id === running.id ? { ...task, status: 'complete' as TaskStatus } : task));
          if (queued) return prev.map((task) => (task.id === queued.id ? { ...task, status: 'running' as TaskStatus } : task));
          if (execIntervalRef.current) clearInterval(execIntervalRef.current);
          return prev;
        });
      }, 1400);
      return () => {
        if (execIntervalRef.current) clearInterval(execIntervalRef.current);
      };
    }
  }, [executionComplete, executingTasks.length]);

  if (!agent || !signal) return <div className="p-6 text-sm text-muted-foreground">Supply-chain signal not found.</div>;

  const bucketMeta = supplyBucketMeta[signal.bucket];
  const allTasksComplete = executingTasks.length > 0 && executingTasks.every((task) => task.status === 'complete');

  const startInvestigation = () => {
    setIsRunning(true);
    setCurrentStep(0);
    addToolTrace({
      timestamp: new Date().toISOString(),
      toolName: `${agent.shortLabel} Investigation`,
      action: `Opened investigation for ${signal.entity}`,
      dataSources: signal.sources,
      duration: 420,
    });
    addAuditEntry({
      timestamp: new Date().toISOString(),
      actor: 'Supply Chain Agent',
      role: currentRole,
      decision: 'Investigation started',
      toolsUsed: signal.sources,
      details: `${agent.shortLabel}: ${signal.entity}`,
    });
  };

  const acceptPlan = () => {
    setAccepted(true);
    addAuditEntry({
      timestamp: new Date().toISOString(),
      actor: 'Planner',
      role: currentRole,
      decision: 'Recommendation accepted',
      toolsUsed: [agent.id],
      details: signal.recommendedAction,
    });
    toast.success('Recommendation accepted');
  };

  const enforcePlan = () => {
    setAccepted(true);
    setExecutingTasks([
      { id: `${signal.id}-t1`, title: signal.recommendedAction, owner: signal.recommendedOwner, priority: signal.severity, status: 'running' },
      ...signal.actionTrace.slice(1, 3).map((trace, index) => ({
        id: `${signal.id}-t${index + 2}`,
        title: trace,
        owner: signal.recommendedOwner,
        priority: 'medium',
        status: 'queued' as TaskStatus,
      })),
    ]);
    setIsExecuting(true);
    setExecutionPhase(0);
    addToolTrace({
      timestamp: new Date().toISOString(),
      toolName: `${agent.shortLabel} Action Engine`,
      action: `Enforced plan for ${signal.entity}`,
      dataSources: signal.sources,
      duration: 610,
    });
    addAuditEntry({
      timestamp: new Date().toISOString(),
      actor: 'Supply Chain Agent',
      role: currentRole,
      decision: 'Action enforced',
      toolsUsed: signal.sources,
      details: `${signal.id}: tasks dispatched to ${signal.recommendedOwner}`,
    });
    toast.success(`Task sent to ${signal.recommendedOwner}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Badge variant="outline" className={cn('text-xs', bucketMeta.badgeClass)}>{bucketMeta.label}</Badge>
            <Badge variant="outline" className="text-xs">{agent.shortLabel}</Badge>
            <Badge variant="outline" className="text-xs capitalize">{signal.severity}</Badge>
            {accepted && <Badge variant="outline" className="text-xs bg-status-success-bg text-status-success border-status-success/30">Accepted</Badge>}
          </div>
          <h1 className="text-2xl font-bold text-foreground">{signal.entity}</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> {signal.location} · {signal.metricLabel}: <span className="font-medium text-foreground">{signal.metricValue}</span> vs {signal.threshold}
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
          <p className="text-2xl font-bold">{signal.estimatedImpact > 0 ? fmtCurrency(signal.estimatedImpact) : 'Monitor'}</p>
        </div>
      </div>

      <Card className="card-elevated">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /> Multi-Agent Reasoning Trace</CardTitle>
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

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-4">
          <Card className="card-elevated">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Investigation Steps</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {investigationSteps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === index && isRunning;
                const isCompleted = currentStep > index || isComplete;
                const isPending = currentStep < index;
                return (
                  <div key={step.id} className={cn('flex items-center gap-3 p-3 rounded-lg transition-all', isActive && 'bg-status-info-bg border border-status-info/40', isCompleted && 'bg-status-success-bg/50', isPending && 'bg-muted/30 opacity-50')}>
                    <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', isActive && 'bg-status-info text-white', isCompleted && 'bg-status-success text-white', isPending && 'bg-muted text-muted-foreground')}>
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

        <div className="col-span-4">
          <Card className="card-elevated h-full">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Root Cause · What & Why</CardTitle></CardHeader>
            <CardContent>
              {isComplete ? (
                <RootCauseSummary signal={signal} domainLabel="Supply Chain agent" />
              ) : (
                <div className="flex items-center justify-center h-48 text-muted-foreground"><p className="text-sm">Run investigation to see analysis</p></div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="col-span-4">
          <Card className="card-elevated h-full">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Recommended Supply Chain Action</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {isComplete ? (
                <>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={cn(accepted ? 'bg-status-success-bg text-status-success border-status-success/30' : 'bg-status-warning-bg text-status-warning border-status-warning/30')}>{accepted ? 'ACCEPTED' : 'PENDING'}</Badge>
                    <span className="text-xs text-muted-foreground">Owner: {signal.recommendedOwner}</span>
                  </div>
                  <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 text-sm font-medium">{signal.recommendedAction}</div>

                  {(isExecuting || executionComplete) && (
                    <div className="p-3 rounded-lg bg-muted/30 border border-border">
                      <div className="flex items-center gap-2 mb-2"><Zap className="w-4 h-4 text-status-info" /><span className="text-xs font-medium">Agent Execution</span></div>
                      <div className="flex items-center gap-1 flex-wrap">
                        {executionPhases.map((phase, idx) => (
                          <div key={phase.id} className="flex items-center">
                            <div className={cn('px-2 py-1 rounded text-[10px] font-medium transition-all', executionPhase > idx && 'bg-status-success text-white', executionPhase === idx && isExecuting && 'bg-status-info text-white animate-pulse', executionPhase < idx && 'bg-muted text-muted-foreground')}>{phase.label}</div>
                            {idx < executionPhases.length - 1 && <ArrowRight className="w-3 h-3 mx-1 text-muted-foreground" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 max-h-48 overflow-auto">
                    {executingTasks.length > 0 ? executingTasks.map((task) => (
                      <div key={task.id} className={cn('p-2 rounded border text-sm transition-all', task.status === 'complete' && 'bg-status-success-bg/50 border-status-success/30', task.status === 'running' && 'bg-status-info-bg border-status-info/40', task.status === 'queued' && 'bg-muted/30 border-border')}>
                        <div className="flex items-center gap-2 mb-1"><Badge variant={task.priority === 'critical' ? 'destructive' : 'outline'} className="text-[9px] px-1">{task.priority}</Badge><div className="flex-1" />{task.status === 'running' && <Loader2 className="w-3 h-3 animate-spin text-status-info" />}{task.status === 'complete' && <CheckCircle2 className="w-3 h-3 text-status-success" />}</div>
                        <p className="text-xs">{task.title}</p><p className="text-[10px] text-muted-foreground mt-1">{task.owner}</p>
                      </div>
                    )) : (
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between"><span className="text-muted-foreground">Due in</span><span className="font-medium">{signal.dueIn}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Severity</span><span className="font-medium capitalize">{signal.severity}</span></div>
                        <div className="pt-2 border-t border-border"><p className="text-muted-foreground mb-1">Tool trace</p>{signal.actionTrace.map((trace) => <p key={trace} className="text-[11px] p-2 rounded bg-muted/40 mb-1">{trace}</p>)}</div>
                      </div>
                    )}
                  </div>

                  {allTasksComplete && <div className="p-2 rounded-lg bg-status-success-bg/50 border border-status-success/30 text-xs flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-status-success" />All supply-chain tasks complete · audit trail updated</div>}

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={acceptPlan} disabled={accepted}><UserCheck className="w-3.5 h-3.5 mr-1" />Accept</Button>
                    <Button size="sm" className="flex-1" onClick={enforcePlan} disabled={isExecuting || executingTasks.length > 0}><Send className="w-3.5 h-3.5 mr-1" />Enforce & Notify</Button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-48 text-muted-foreground"><p className="text-sm">Run investigation to see plan</p></div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};