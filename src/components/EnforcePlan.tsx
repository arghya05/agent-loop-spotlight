import * as React from 'react';
import { useAppStore, Task, TaskStatus } from '@/store/appStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  ClipboardList, 
  CheckCircle2, 
  XCircle, 
  Edit3,
  Truck,
  Package,
  AlertCircle,
  Building2,
  Shield,
  Clock,
  Mail,
  TrendingUp,
  RefreshCw,
  Lock,
  PartyPopper,
  Play,
  Loader2,
  Zap
} from 'lucide-react';
import supplierDetailsData from '@/data/supplierDetails.json';
import suppliersData from '@/data/suppliers.json';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

type SupplierDetailsType = typeof supplierDetailsData;

interface PlanAction {
  id: string;
  category: string;
  title: string;
  description: string;
  owner: string;
  dueDate: string;
  expectedImpact: string;
  priority: string;
  requiresApproval: boolean;
}

const categoryIcons: Record<string, typeof Truck> = {
  'Logistics': Truck,
  'Supplier Corrective Action': Package,
  'ASN Quality Gate': AlertCircle,
  'DC Receiving': Building2,
  'Escalation': Shield
};

const priorityColors: Record<string, string> = {
  critical: 'bg-status-danger text-white',
  high: 'bg-status-warning text-white',
  medium: 'bg-status-info text-white',
  low: 'bg-muted text-muted-foreground'
};

const ImprovementPlan = () => {
  const { 
    currentRole, 
    investigationStatus, 
    enabledActions, 
    toggleAction, 
    planStatus,
    selectedSupplierId
  } = useAppStore();

  const supplierDetails = selectedSupplierId ? (supplierDetailsData as SupplierDetailsType)[selectedSupplierId as keyof SupplierDetailsType] : null;
  const plan = supplierDetails?.plan;
  
  if (investigationStatus !== 'completed' && investigationStatus !== 'revising') {
    return (
      <Card className="card-elevated h-full flex items-center justify-center">
        <div className="text-center p-6">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">Complete investigation to generate plan</p>
        </div>
      </Card>
    );
  }

  // Healthy suppliers - no plan needed
  if (!plan || !plan.actions || plan.actions.length === 0) {
    return (
      <Card className="card-elevated h-full">
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-status-success/10 flex items-center justify-center mx-auto mb-4">
            <PartyPopper className="w-8 h-8 text-status-success" />
          </div>
          <p className="text-lg font-semibold text-status-success mb-2">No Action Required</p>
          <p className="text-sm text-muted-foreground">
            This supplier is performing above target thresholds. Continue monitoring and maintain current relationship.
          </p>
          <div className="mt-4 p-3 bg-status-success-bg/50 rounded-lg">
            <p className="text-xs font-medium text-status-success">Recommendation</p>
            <p className="text-xs text-muted-foreground mt-1">
              Consider this supplier as a benchmark for best practices. Share learnings with underperforming suppliers.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const actions = plan.actions as PlanAction[];
  const groupedActions = actions.reduce((acc, action) => {
    if (!acc[action.category]) acc[action.category] = [];
    acc[action.category].push(action);
    return acc;
  }, {} as Record<string, PlanAction[]>);

  return (
    <Card className="card-elevated border-t-4 border-t-status-success">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-status-success" />
            Improvement Plan
          </CardTitle>
          <Badge 
            className={`text-[10px] ${
              planStatus === 'approved' ? 'bg-status-success text-white' : 
              planStatus === 'pending_approval' ? 'bg-status-warning text-white' : 
              'bg-muted text-muted-foreground'
            }`}
          >
            {planStatus.replace('_', ' ')}
          </Badge>
        </div>
        {plan.expectedOtifRecovery && (
          <p className="text-xs text-muted-foreground">
            Recovery: OTIF → <span className="font-semibold text-status-success">{plan.expectedOtifRecovery}%</span> in {plan.recoveryTimeline}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4 max-h-[350px] overflow-auto scrollbar-thin">
        {Object.entries(groupedActions).map(([category, actions]) => {
          const IconComponent = categoryIcons[category] || Package;
          return (
            <div key={category} className="space-y-2">
              <div className="flex items-center gap-2 pb-1 border-b">
                <IconComponent className="w-3.5 h-3.5 text-primary" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-primary">{category}</p>
              </div>
              {actions.map((action) => {
                const isEnabled = enabledActions.includes(action.id);
                const needsCategoryHead = action.requiresApproval && currentRole !== 'category_head';
                
                return (
                  <div 
                    key={action.id} 
                    className={`p-3 rounded-lg border transition-all ${isEnabled ? 'bg-card border-border' : 'bg-muted/30 opacity-60 border-transparent'}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <p className="text-xs font-semibold text-foreground">{action.title}</p>
                          <Badge className={`${priorityColors[action.priority]} text-[9px] px-1.5 py-0`}>
                            {action.priority}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground line-clamp-2">{action.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-[9px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Due: {action.dueDate.split('-').slice(1).join('/')}
                          </span>
                          <span className="text-[9px] text-status-success font-medium">{action.expectedImpact}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {needsCategoryHead && (
                          <Lock className="w-3 h-3 text-muted-foreground" />
                        )}
                        <Switch
                          checked={isEnabled}
                          onCheckedChange={() => !needsCategoryHead && toggleAction(action.id)}
                          disabled={currentRole === 'viewer' || needsCategoryHead}
                          className="scale-75"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

const ApprovalsCard = () => {
  const { currentRole, planStatus, approvePlan, selectedSupplierId } = useAppStore();
  const [isExecuting, setIsExecuting] = React.useState(false);
  const [executionProgress, setExecutionProgress] = React.useState(0);
  const [executionPhase, setExecutionPhase] = React.useState<'idle' | 'dispatching' | 'assigning' | 'notifying' | 'complete'>('idle');
  
  const supplierDetails = selectedSupplierId ? (supplierDetailsData as SupplierDetailsType)[selectedSupplierId as keyof SupplierDetailsType] : null;
  const plan = supplierDetails?.plan;
  
  // Don't show approvals for healthy suppliers
  if (!plan || !plan.actions || plan.actions.length === 0) {
    return null;
  }
  
  const canApprove = (currentRole === 'ops_manager' || currentRole === 'category_head') && planStatus === 'pending_approval';

  const handleExecutePlan = () => {
    setIsExecuting(true);
    setExecutionPhase('dispatching');
    setExecutionProgress(0);
    
    // Phase 1: Dispatching tasks
    setTimeout(() => {
      setExecutionProgress(33);
      setExecutionPhase('assigning');
    }, 800);
    
    // Phase 2: Assigning to owners
    setTimeout(() => {
      setExecutionProgress(66);
      setExecutionPhase('notifying');
    }, 1600);
    
    // Phase 3: Notifying stakeholders & completing
    setTimeout(() => {
      setExecutionProgress(100);
      setExecutionPhase('complete');
      approvePlan();
      setIsExecuting(false);
    }, 2400);
  };

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Approvals & Execution
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium">Your Role</span>
            <Badge variant="outline" className="text-[10px]">
              {currentRole === 'viewer' ? 'Viewer' : currentRole === 'ops_manager' ? 'Ops Manager' : 'Category Head'}
            </Badge>
          </div>
          <p className="text-[10px] text-muted-foreground">
            {currentRole === 'viewer' 
              ? 'View-only access. Cannot approve or modify plan.'
              : currentRole === 'ops_manager'
                ? 'Can approve plan. Escalation actions require Category Head.'
                : 'Full approval and execution authority.'
            }
          </p>
        </div>

        {planStatus === 'approved' ? (
          <div className="space-y-2">
            {isExecuting ? (
              <div className="p-3 rounded-lg border bg-primary/5 border-primary/20 space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-primary">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Agent Executing Plan...
                </div>
                <Progress value={executionProgress} className="h-2" />
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>
                    {executionPhase === 'dispatching' && '📋 Creating tasks...'}
                    {executionPhase === 'assigning' && '👤 Assigning to owners...'}
                    {executionPhase === 'notifying' && '📧 Sending notifications...'}
                    {executionPhase === 'complete' && '✅ Execution complete!'}
                  </span>
                  <span>{executionProgress}%</span>
                </div>
              </div>
            ) : executionPhase === 'complete' ? (
              <div className="p-3 rounded-lg border bg-status-success-bg/50 border-status-success/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-status-success">
                  <Zap className="w-4 h-4" />
                  Agent Active — Executing Tasks
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Tasks have been assigned and are being tracked
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-status-success-bg rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-status-success" />
                <div>
                  <p className="text-xs font-medium text-status-success">Plan Approved</p>
                  <p className="text-[10px] text-muted-foreground">Ready for execution</p>
                </div>
              </div>
            )}
            
            {executionPhase !== 'complete' && !isExecuting && (
              <Button 
                className="w-full"
                size="sm"
                onClick={handleExecutePlan}
              >
                <Play className="w-3.5 h-3.5 mr-1" />
                Execute Plan
              </Button>
            )}
          </div>
        ) : (
          <div className="flex gap-2">
            <Button 
              className="flex-1 bg-status-success hover:bg-status-success/90"
              size="sm"
              disabled={!canApprove}
              onClick={() => approvePlan()}
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Approve
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              disabled={currentRole === 'viewer'}
            >
              <Edit3 className="w-3.5 h-3.5 mr-1" />
              Edit
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              disabled={currentRole === 'viewer'}
              className="text-status-danger hover:text-status-danger"
            >
              <XCircle className="w-3.5 h-3.5 mr-1" />
              Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const TaskBoard = () => {
  const { tasks, updateTaskStatus, planStatus, selectedSupplierId } = useAppStore();

  const supplierDetails = selectedSupplierId ? (supplierDetailsData as SupplierDetailsType)[selectedSupplierId as keyof SupplierDetailsType] : null;
  const plan = supplierDetails?.plan;
  
  // Don't show task board for healthy suppliers
  if (!plan || !plan.actions || plan.actions.length === 0) {
    return null;
  }

  if (planStatus !== 'approved' && tasks.length === 0) {
    return (
      <Card className="card-elevated">
        <CardContent className="p-6 text-center">
          <ClipboardList className="w-10 h-10 mx-auto mb-2 text-muted-foreground/50" />
          <p className="text-xs text-muted-foreground">Approve plan to create tasks</p>
        </CardContent>
      </Card>
    );
  }

  const tasksByStatus = {
    todo: tasks.filter(t => t.status === 'todo'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    done: tasks.filter(t => t.status === 'done')
  };

  const TaskColumn = ({ title, tasks, status, color, icon }: { title: string; tasks: Task[]; status: TaskStatus; color: string; icon?: React.ReactNode }) => (
    <div className="flex-1 min-w-0">
      <div className={`flex items-center gap-2 mb-3 pb-2 border-b-2 ${color}`}>
        {icon}
        <p className="text-xs font-semibold uppercase tracking-wide">{title}</p>
        <Badge variant="secondary" className="text-[10px] h-5 px-2">{tasks.length}</Badge>
      </div>
      <div className="space-y-2 max-h-[220px] overflow-auto scrollbar-thin">
        {tasks.map((task) => (
          <div 
            key={task.id} 
            className={`p-3 rounded-lg border text-xs cursor-pointer transition-all shadow-sm ${
              task.status === 'in_progress' 
                ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/20' 
                : task.status === 'done'
                ? 'border-status-success/30 bg-status-success-bg/30'
                : 'bg-card hover:bg-muted/50 hover:border-primary/30'
            }`}
            onClick={() => {
              const nextStatus: Record<TaskStatus, TaskStatus> = {
                todo: 'in_progress',
                in_progress: 'done',
                done: 'todo'
              };
              updateTaskStatus(task.id, nextStatus[task.status]);
            }}
          >
            <p className="font-semibold text-foreground leading-tight mb-1">{task.title}</p>
            <p className="text-muted-foreground text-[11px]">{task.assignee}</p>
            {task.status === 'in_progress' && (
              <div className="mt-1.5 flex items-center gap-1 text-[9px] text-primary">
                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                Agent executing...
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          Agent Task Execution
          {tasks.length > 0 && (
            <Badge variant="outline" className="ml-auto text-[9px] animate-pulse bg-primary/10">
              Live
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Progress Summary */}
        {tasks.length > 0 && (
          <div className="mb-3 p-2 rounded-lg bg-muted/30 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Execution Progress</span>
              <span className="font-semibold">
                {Math.round((tasksByStatus.done.length / tasks.length) * 100)}%
              </span>
            </div>
            <Progress 
              value={(tasksByStatus.done.length / tasks.length) * 100} 
              className="h-1.5"
            />
          </div>
        )}
        
        <div className="flex gap-3">
          <TaskColumn title="Queued" tasks={tasksByStatus.todo} status="todo" color="border-muted-foreground" icon={<Clock className="w-3 h-3" />} />
          <TaskColumn title="Running" tasks={tasksByStatus.in_progress} status="in_progress" color="border-primary" icon={<Loader2 className="w-3 h-3 animate-spin" />} />
          <TaskColumn title="Complete" tasks={tasksByStatus.done} status="done" color="border-status-success" icon={<CheckCircle2 className="w-3 h-3" />} />
        </div>
        
        {tasks.length > 0 && (
          <div className="mt-3 p-2 bg-status-success-bg/30 rounded text-[10px] border border-status-success/20">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3 h-3 text-status-success" />
              <strong>Accountability Score:</strong> 
              <span className="ml-auto font-semibold text-status-success">
                {tasksByStatus.done.length}/{tasks.length} tasks completed
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const SupplierCommunication = () => {
  const { planStatus, selectedSupplierId } = useAppStore();
  const [isSending, setIsSending] = React.useState(false);
  const [isSent, setIsSent] = React.useState(false);
  
  const supplierDetails = selectedSupplierId ? (supplierDetailsData as SupplierDetailsType)[selectedSupplierId as keyof SupplierDetailsType] : null;
  const communication = supplierDetails?.communication;
  
  if (planStatus !== 'approved' || !communication) return null;

  const handleSendEmail = () => {
    setIsSending(true);
    // Simulate sending email
    setTimeout(() => {
      setIsSending(false);
      setIsSent(true);
    }, 1500);
  };

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Mail className="w-4 h-4" />
          Supplier Communication
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="p-3 bg-muted/30 rounded-lg text-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">To: {communication.to}</span>
            <Badge variant="outline" className={`text-[10px] ${isSent ? 'bg-status-success text-white border-status-success' : ''}`}>
              {isSent ? 'Sent' : 'Draft'}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Subject: {communication.subject}
          </p>
          <div className="p-3 bg-card rounded-lg border text-xs leading-relaxed">
            <p className="font-medium">Dear {communication.contact},</p>
            <p className="mt-2 text-muted-foreground">{communication.preview}</p>
          </div>
          <Button 
            size="sm" 
            className="w-full mt-2 bg-primary hover:bg-primary/90"
            onClick={handleSendEmail}
            disabled={isSending || isSent}
          >
            {isSending ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : isSent ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Email Sent
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Send via Supplier Portal
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const RecoveryProjection = () => {
  const { planStatus, selectedSupplierId } = useAppStore();
  
  const supplierDetails = selectedSupplierId ? (supplierDetailsData as SupplierDetailsType)[selectedSupplierId as keyof SupplierDetailsType] : null;
  const plan = supplierDetails?.plan;
  
  if (planStatus !== 'approved' || !plan?.expectedOtifRecovery) return null;

  const currentOtif = supplierDetails?.kpiChange?.to || 76;
  const targetOtif = plan.expectedOtifRecovery;
  
  const projectionData = [
    { day: 0, projected: currentOtif },
    { day: 2, projected: currentOtif + (targetOtif - currentOtif) * 0.15 },
    { day: 4, projected: currentOtif + (targetOtif - currentOtif) * 0.35 },
    { day: 7, projected: currentOtif + (targetOtif - currentOtif) * 0.55 },
    { day: 10, projected: currentOtif + (targetOtif - currentOtif) * 0.75 },
    { day: 14, projected: targetOtif },
  ];

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Recovery Projection
          </CardTitle>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <RefreshCw className="w-3 h-3" />
            Re-check in 24h
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[100px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={projectionData}>
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 9 }}
                tickFormatter={(v) => `D${v}`}
              />
              <YAxis 
                domain={[Math.min(currentOtif - 5, 70), Math.max(targetOtif + 5, 100)]} 
                tick={{ fontSize: 9 }}
                width={25}
              />
              <Tooltip 
                contentStyle={{ fontSize: '10px' }}
                formatter={(value: number) => [`${value.toFixed(0)}%`, 'OTIF']}
              />
              <ReferenceLine y={85} stroke="#22c55e" strokeDasharray="3 3" />
              <Line 
                type="monotone" 
                dataKey="projected" 
                stroke="hsl(217, 91%, 50%)" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-between mt-2 text-[10px]">
          <span className="text-muted-foreground">Current: {currentOtif}%</span>
          <span className="text-status-success font-medium">Target: {targetOtif}% ({plan.recoveryTimeline})</span>
        </div>
      </CardContent>
    </Card>
  );
};

export const EnforcePlan = () => {
  return (
    <div className="flex flex-col gap-4 h-full overflow-auto scrollbar-thin pr-1">
      <ImprovementPlan />
      <ApprovalsCard />
      <TaskBoard />
      <SupplierCommunication />
      <RecoveryProjection />
    </div>
  );
};