import { useState } from 'react';
import { useAppStore, Task, TaskStatus } from '@/store/appStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  ChevronRight,
  Clock,
  Mail,
  TrendingUp,
  RefreshCw,
  Lock
} from 'lucide-react';
import improvementPlanData from '@/data/improvementPlan.json';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

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
    approvePlan
  } = useAppStore();

  const plan = improvementPlanData.plans.SUP001;
  
  if (investigationStatus !== 'completed') {
    return (
      <Card className="card-elevated h-full flex items-center justify-center">
        <div className="text-center p-6">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">Complete investigation to generate plan</p>
        </div>
      </Card>
    );
  }

  const groupedActions = plan.actions.reduce((acc, action) => {
    if (!acc[action.category]) acc[action.category] = [];
    acc[action.category].push(action);
    return acc;
  }, {} as Record<string, typeof plan.actions>);

  const canApprove = currentRole === 'ops_manager' || currentRole === 'category_head';
  const canApproveAll = currentRole === 'category_head';

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            Improvement Plan
          </CardTitle>
          <Badge 
            className={`text-[10px] ${
              planStatus === 'approved' ? 'bg-status-success' : 
              planStatus === 'pending_approval' ? 'bg-status-warning' : 
              'bg-muted'
            } text-white`}
          >
            {planStatus.replace('_', ' ')}
          </Badge>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Recovery: OTIF → {plan.expectedOtifRecovery}% in {plan.recoveryTimeline}
        </p>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[300px] overflow-auto scrollbar-thin">
        {Object.entries(groupedActions).map(([category, actions]) => {
          const IconComponent = categoryIcons[category] || Package;
          return (
            <div key={category} className="space-y-2">
              <div className="flex items-center gap-2">
                <IconComponent className="w-3.5 h-3.5 text-muted-foreground" />
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{category}</p>
              </div>
              {actions.map((action) => {
                const isEnabled = enabledActions.includes(action.id);
                const needsCategoryHead = action.requiresApproval && currentRole !== 'category_head';
                
                return (
                  <div 
                    key={action.id} 
                    className={`p-2.5 rounded-lg border ${isEnabled ? 'bg-card' : 'bg-muted/30 opacity-60'}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-xs font-medium truncate">{action.title}</p>
                          <Badge className={`${priorityColors[action.priority]} text-[9px] px-1.5 py-0`}>
                            {action.priority}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground line-clamp-2">{action.description}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[9px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Due: {action.dueDate.split('-').slice(1).join('/')}
                          </span>
                          <span className="text-[9px] text-status-success">{action.expectedImpact}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
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
  const { currentRole, planStatus, approvePlan } = useAppStore();
  
  const canApprove = (currentRole === 'ops_manager' || currentRole === 'category_head') && planStatus === 'pending_approval';

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Approvals
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
          <div className="flex items-center gap-2 p-3 bg-status-success-bg rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-status-success" />
            <div>
              <p className="text-xs font-medium text-status-success">Plan Approved</p>
              <p className="text-[10px] text-muted-foreground">Tasks have been created</p>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button 
              className="flex-1 bg-status-success hover:bg-status-success/90"
              size="sm"
              disabled={!canApprove}
              onClick={approvePlan}
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
  const { tasks, updateTaskStatus, planStatus } = useAppStore();

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

  const TaskColumn = ({ title, tasks, status, color }: { title: string; tasks: Task[]; status: TaskStatus; color: string }) => (
    <div className="flex-1 min-w-0">
      <div className={`flex items-center gap-2 mb-2 pb-2 border-b-2 ${color}`}>
        <p className="text-[10px] font-semibold uppercase tracking-wide">{title}</p>
        <Badge variant="secondary" className="text-[9px] h-4 px-1.5">{tasks.length}</Badge>
      </div>
      <div className="space-y-1.5 max-h-[180px] overflow-auto scrollbar-thin">
        {tasks.map((task) => (
          <div 
            key={task.id} 
            className="p-2 bg-card rounded border text-[10px] cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => {
              const nextStatus: Record<TaskStatus, TaskStatus> = {
                todo: 'in_progress',
                in_progress: 'done',
                done: 'todo'
              };
              updateTaskStatus(task.id, nextStatus[task.status]);
            }}
          >
            <p className="font-medium truncate">{task.title}</p>
            <p className="text-muted-foreground">{task.assignee}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <ClipboardList className="w-4 h-4" />
          Execution Tasks
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3">
          <TaskColumn title="To Do" tasks={tasksByStatus.todo} status="todo" color="border-muted-foreground" />
          <TaskColumn title="In Progress" tasks={tasksByStatus.in_progress} status="in_progress" color="border-status-warning" />
          <TaskColumn title="Done" tasks={tasksByStatus.done} status="done" color="border-status-success" />
        </div>
      </CardContent>
    </Card>
  );
};

const SupplierCommunication = () => {
  const { planStatus } = useAppStore();
  
  if (planStatus !== 'approved') return null;

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Mail className="w-4 h-4" />
          Supplier Communication
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="p-3 bg-muted/30 rounded-lg text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">To: SuratHomeTex Pvt Ltd</span>
            <Badge variant="outline" className="text-[9px]">Draft</Badge>
          </div>
          <p className="text-muted-foreground">
            Subject: Urgent: Corrective Action Required - Arabic Label Compliance & ASN Quality
          </p>
          <div className="p-2 bg-card rounded border text-[10px]">
            <p>Dear Rajesh Patel,</p>
            <p className="mt-1">We have identified critical compliance issues with recent shipments requiring immediate attention...</p>
            <p className="mt-1 text-primary">Action Required: Rollback to Label Template V2.1 immediately</p>
          </div>
          <Button size="sm" className="w-full mt-2">
            <Mail className="w-3.5 h-3.5 mr-1" />
            Send via Supplier Portal
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const RecoveryProjection = () => {
  const { planStatus } = useAppStore();
  
  if (planStatus !== 'approved') return null;

  const projectionData = [
    { day: 0, actual: 76, projected: 76 },
    { day: 2, actual: null, projected: 78 },
    { day: 4, actual: null, projected: 81 },
    { day: 7, actual: null, projected: 84 },
    { day: 10, actual: null, projected: 87 },
    { day: 14, actual: null, projected: 91 },
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
                domain={[70, 95]} 
                tick={{ fontSize: 9 }}
                width={25}
              />
              <Tooltip 
                contentStyle={{ fontSize: '10px' }}
                formatter={(value: number) => [`${value}%`, 'OTIF']}
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
          <span className="text-muted-foreground">Current: 76%</span>
          <span className="text-status-success font-medium">Target: 91% (14 days)</span>
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
