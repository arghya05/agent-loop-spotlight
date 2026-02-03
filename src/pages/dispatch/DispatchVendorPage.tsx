import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronLeft, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock,
  Calendar,
  Send,
  FileText,
  Play,
  Package,
  Factory,
  MapPin,
  User,
  Mail,
  MessageSquare,
  Zap,
  AlertCircle,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import dispatchVendorsData from '@/data/dispatch/vendors.json';
import dispatchPlansData from '@/data/dispatch/plans.json';
import { useAppStore } from '@/store/appStore';

interface Milestone {
  name: string;
  plannedDate: string;
  actualDate: string | null;
  status: string;
  notes: string;
}

interface PO {
  id: string;
  vendorId: string;
  poNumber: string;
  skuCount: number;
  qtyUnits: number;
  valueDollar: number;
  committedExFactoryDate: string;
  committedDispatchDate: string;
  currentStatus: string;
  predictedDelayDays: number;
  delayProbability: number;
  milestones: Milestone[];
  alerts: { type: string; severity: string; createdAt: string; evidence: string }[];
}

interface Plan {
  id: string;
  vendorId: string;
  poIds: string[];
  status: string;
  createdAt: string;
  actions: { id: string; category: string; title: string; priority: string; owner: string; dueDate: string; expectedImpact: string; enabled: boolean }[];
  approvals: any[];
  tasksCreated: any[];
}

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatDateTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const DispatchVendorPage = () => {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();
  const { addAuditEntry, addToolTrace, currentRole } = useAppStore();
  
  const [selectedPOId, setSelectedPOId] = useState<string | null>(null);
  const [planApproved, setPlanApproved] = useState(false);
  const [planExecuting, setPlanExecuting] = useState(false);
  const [planActions, setPlanActions] = useState<Record<string, boolean>>({});

  const vendor = (dispatchVendorsData.vendors as any[]).find(v => v.id === vendorId);
  
  // Mock POs for the vendor
  const vendorPOs: PO[] = vendor ? [
    {
      id: "PO001", vendorId: vendor.id, poNumber: "PO-2024-001", skuCount: 12, qtyUnits: 15000, valueDollar: 950000,
      committedExFactoryDate: "2024-02-05", committedDispatchDate: "2024-02-08", currentStatus: "Sewing",
      predictedDelayDays: 8, delayProbability: 0.85,
      milestones: [
        { name: "Order Placed", plannedDate: "2024-01-02", actualDate: "2024-01-02", status: "complete", notes: "" },
        { name: "Fabric In", plannedDate: "2024-01-10", actualDate: "2024-01-14", status: "late", notes: "Mill delay - 4 days" },
        { name: "Cutting", plannedDate: "2024-01-15", actualDate: "2024-01-18", status: "late", notes: "Started 3 days late" },
        { name: "Sewing", plannedDate: "2024-01-20", actualDate: null, status: "in_progress", notes: "Currently 40% complete" },
        { name: "Under Inspection", plannedDate: "2024-01-28", actualDate: null, status: "pending", notes: "" },
        { name: "Packaging", plannedDate: "2024-02-02", actualDate: null, status: "pending", notes: "" },
        { name: "Ex-Factory", plannedDate: "2024-02-05", actualDate: null, status: "pending", notes: "At risk" }
      ],
      alerts: [{ type: "Fabric Delay", severity: "critical", createdAt: "2024-01-14", evidence: "Mill confirmed 4-day delay" }]
    },
    {
      id: "PO002", vendorId: vendor.id, poNumber: "PO-2024-002", skuCount: 8, qtyUnits: 12000, valueDollar: 720000,
      committedExFactoryDate: "2024-02-10", committedDispatchDate: "2024-02-13", currentStatus: "Cutting",
      predictedDelayDays: 5, delayProbability: 0.72,
      milestones: [
        { name: "Order Placed", plannedDate: "2024-01-05", actualDate: "2024-01-05", status: "complete", notes: "" },
        { name: "Fabric In", plannedDate: "2024-01-12", actualDate: "2024-01-15", status: "late", notes: "Same mill issue" },
        { name: "Cutting", plannedDate: "2024-01-18", actualDate: null, status: "in_progress", notes: "Started today" },
        { name: "Sewing", plannedDate: "2024-01-25", actualDate: null, status: "pending", notes: "" },
        { name: "Under Inspection", plannedDate: "2024-02-02", actualDate: null, status: "pending", notes: "" },
        { name: "Packaging", plannedDate: "2024-02-07", actualDate: null, status: "pending", notes: "" },
        { name: "Ex-Factory", plannedDate: "2024-02-10", actualDate: null, status: "pending", notes: "" }
      ],
      alerts: []
    }
  ] : [];
  
  const plan = (dispatchPlansData.plans as Plan[]).find(p => p.vendorId === vendorId);
  
  const selectedPO = selectedPOId ? vendorPOs.find(po => po.id === selectedPOId) : vendorPOs[0];

  // Initialize plan actions
  if (plan && Object.keys(planActions).length === 0) {
    const initial: Record<string, boolean> = {};
    plan.actions.forEach(a => { initial[a.id] = a.enabled; });
    if (Object.keys(initial).length > 0 && Object.keys(planActions).length === 0) {
      // This is intentionally not setting state in render - just initializing
    }
  }

  if (!vendor) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <p className="mt-4 text-muted-foreground">Vendor not found</p>
      </div>
    );
  }

  const bucketConfig: Record<string, { color: string; bg: string }> = {
    SS: { color: 'text-status-danger', bg: 'bg-status-danger' },
    AW: { color: 'text-status-warning', bg: 'bg-status-warning' },
    Flow: { color: 'text-status-success', bg: 'bg-status-success' }
  };

  const handleApprovePlan = () => {
    setPlanApproved(true);
    addAuditEntry({
      timestamp: new Date().toISOString(),
      actor: 'User',
      role: currentRole,
      decision: `Approved contingency plan for ${vendor.name}`,
      toolsUsed: ['plan_approval_engine'],
      details: `${plan?.actions.filter(a => a.enabled).length || 0} actions approved`
    });
  };

  const handleExecutePlan = () => {
    setPlanExecuting(true);
    addToolTrace({
      timestamp: new Date().toISOString(),
      toolName: 'Task Executor',
      action: `Executing plan for ${vendor.name}`,
      dataSources: ['task_templates', 'notification_service'],
      duration: 1500
    });
    
    setTimeout(() => {
      setPlanExecuting(false);
      addAuditEntry({
        timestamp: new Date().toISOString(),
        actor: 'Agent',
        role: currentRole,
        decision: `Executed plan for ${vendor.name}`,
        toolsUsed: ['task_executor', 'comms_dispatcher'],
        details: 'Tasks created, notifications sent'
      });
    }, 2000);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{vendor.name}</h1>
            <Badge className={cn("text-xs", bucketConfig[vendor.bucketTag]?.bg || 'bg-muted')}>
              {vendor.bucketTag}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Risk: {vendor.riskScore}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{vendor.factoryLocation} • {vendor.route}</p>
        </div>
      </div>

      {/* 3-Column Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* LEFT: Vendor Snapshot */}
        <div className="col-span-3 space-y-4">
          <Card className="card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Factory className="w-4 h-4 text-primary" />
                Vendor Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 rounded bg-muted/50">
                  <p className="text-[10px] text-muted-foreground uppercase">Open POs</p>
                  <p className="font-semibold">{vendor.openPOCount}</p>
                </div>
                <div className="p-2 rounded bg-muted/50">
                  <p className="text-[10px] text-muted-foreground uppercase">Volume</p>
                  <p className="font-semibold">{(vendor.totalVolumeUnits / 1000).toFixed(0)}K</p>
                </div>
                <div className="p-2 rounded bg-muted/50">
                  <p className="text-[10px] text-muted-foreground uppercase">$ Traded</p>
                  <p className="font-semibold">{formatCurrency(vendor.tradedDollar)}</p>
                </div>
                <div className="p-2 rounded bg-status-danger/10">
                  <p className="text-[10px] text-muted-foreground uppercase">$ At Risk</p>
                  <p className="font-semibold text-status-danger">{formatCurrency(vendor.atRiskDollar)}</p>
                </div>
              </div>

              <div className="pt-2 border-t space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <MapPin className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground">DC:</span>
                  <span>{vendor.dc}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <User className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Owner:</span>
                  <span>{vendor.owner}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Next Review:</span>
                  <span className={cn(
                    new Date(vendor.nextReviewDue) < new Date() && "text-status-danger font-medium"
                  )}>{formatDate(vendor.nextReviewDue)}</span>
                </div>
              </div>

              <div className="pt-2 border-t space-y-2">
                <p className="text-[10px] text-muted-foreground uppercase">Categories</p>
                <div className="flex flex-wrap gap-1">
                  {vendor.categoryTags.map((tag: string, i: number) => (
                    <Badge key={i} variant="secondary" className="text-[10px]">{tag}</Badge>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t space-y-2">
                <p className="text-[10px] text-muted-foreground uppercase">Risk Drivers</p>
                <div className="space-y-1">
                  {vendor.riskDrivers.map((driver: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs p-1.5 rounded bg-status-danger/5">
                      <AlertTriangle className="w-3 h-3 text-status-danger" />
                      <span>{driver}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 space-y-2">
                <Button 
                  className="w-full" 
                  size="sm"
                  onClick={() => {
                    import('sonner').then(({ toast }) => {
                      toast.success('Message sent to supplier', {
                        description: `Communication dispatched to ${vendor.name} regarding ${vendor.openPOCount} open POs`
                      });
                    });
                    addAuditEntry({
                      timestamp: new Date().toISOString(),
                      actor: 'User',
                      role: currentRole,
                      decision: `Sent message to ${vendor.name}`,
                      toolsUsed: ['supplier_portal'],
                      details: 'Supplier message dispatched'
                    });
                  }}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Message Supplier
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="sm"
                  onClick={() => {
                    import('sonner').then(({ toast }) => {
                      toast.success('Review scheduled', {
                        description: `Calendar invite sent for ${vendor.name} dispatch review`
                      });
                    });
                    addAuditEntry({
                      timestamp: new Date().toISOString(),
                      actor: 'User',
                      role: currentRole,
                      decision: `Scheduled review for ${vendor.name}`,
                      toolsUsed: ['calendar_scheduler'],
                      details: 'Review meeting scheduled'
                    });
                  }}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Review
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CENTER: PO List + Timeline */}
        <div className="col-span-5 space-y-4">
          {/* PO List */}
          <Card className="card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                Open POs ({vendorPOs.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">PO</TableHead>
                    <TableHead className="w-[60px] text-right">Qty</TableHead>
                    <TableHead className="w-[70px] text-right">Value</TableHead>
                    <TableHead className="w-[80px]">Ex-Factory</TableHead>
                    <TableHead className="w-[60px] text-right">Delay</TableHead>
                    <TableHead className="w-[60px] text-right">Prob</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendorPOs.map((po) => (
                    <TableRow 
                      key={po.id} 
                      className={cn(
                        "cursor-pointer transition-colors",
                        selectedPO?.id === po.id ? "bg-primary/10" : "hover:bg-muted/50"
                      )}
                      onClick={() => setSelectedPOId(po.id)}
                    >
                      <TableCell className="font-mono text-xs">{po.poNumber}</TableCell>
                      <TableCell className="text-right text-xs">{(po.qtyUnits / 1000).toFixed(0)}K</TableCell>
                      <TableCell className="text-right text-xs">{formatCurrency(po.valueDollar)}</TableCell>
                      <TableCell className="text-xs">{formatDate(po.committedExFactoryDate)}</TableCell>
                      <TableCell className="text-right">
                        <span className={cn(
                          "font-mono text-xs font-semibold",
                          po.predictedDelayDays > 5 ? "text-status-danger" :
                          po.predictedDelayDays > 0 ? "text-status-warning" : "text-status-success"
                        )}>
                          {po.predictedDelayDays > 0 ? `+${po.predictedDelayDays}d` : 'On Time'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={cn(
                          "font-mono text-xs",
                          po.delayProbability > 0.7 ? "text-status-danger" :
                          po.delayProbability > 0.4 ? "text-status-warning" : "text-status-success"
                        )}>
                          {(po.delayProbability * 100).toFixed(0)}%
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Timeline View */}
          {selectedPO && (
            <Card className="card-elevated">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    Milestone Timeline: {selectedPO.poNumber}
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {selectedPO.currentStatus}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* Gantt-like Timeline */}
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                  <div className="space-y-4">
                    {selectedPO.milestones.map((milestone, i) => {
                      const isComplete = milestone.status === 'complete';
                      const isLate = milestone.status === 'late';
                      const isInProgress = milestone.status === 'in_progress';
                      const isPending = milestone.status === 'pending';

                      return (
                        <div key={i} className="relative flex items-start gap-4 pl-8">
                          <div className={cn(
                            "absolute left-2 w-5 h-5 rounded-full flex items-center justify-center -translate-x-1/2 border-2 border-background",
                            isComplete && "bg-status-success",
                            isLate && "bg-status-danger",
                            isInProgress && "bg-primary animate-pulse",
                            isPending && "bg-muted"
                          )}>
                            {isComplete && <CheckCircle2 className="w-3 h-3 text-white" />}
                            {isLate && <XCircle className="w-3 h-3 text-white" />}
                            {isInProgress && <Loader2 className="w-3 h-3 text-white animate-spin" />}
                          </div>
                          <div className={cn(
                            "flex-1 p-3 rounded-lg border",
                            isLate && "bg-status-danger/5 border-status-danger/30",
                            isInProgress && "bg-primary/5 border-primary/30",
                            isComplete && "bg-status-success/5 border-status-success/30",
                            isPending && "bg-muted/50 border-border"
                          )}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-sm">{milestone.name}</span>
                              {isLate && (
                                <Badge className="bg-status-danger text-[9px]">LATE</Badge>
                              )}
                              {isInProgress && (
                                <Badge className="bg-primary text-[9px]">IN PROGRESS</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Planned: {formatDate(milestone.plannedDate)}</span>
                              {milestone.actualDate && (
                                <span className={isLate ? "text-status-danger" : "text-status-success"}>
                                  Actual: {formatDate(milestone.actualDate)}
                                </span>
                              )}
                            </div>
                            {milestone.notes && (
                              <p className="text-xs text-muted-foreground mt-1 italic">{milestone.notes}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Alerts */}
                {selectedPO.alerts.length > 0 && (
                  <div className="mt-4 pt-4 border-t space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase">Alerts</p>
                    {selectedPO.alerts.map((alert, i) => (
                      <div key={i} className={cn(
                        "p-2 rounded-lg text-xs flex items-start gap-2",
                        alert.severity === 'critical' ? "bg-status-danger/10" : "bg-status-warning/10"
                      )}>
                        <AlertCircle className={cn(
                          "w-4 h-4 mt-0.5",
                          alert.severity === 'critical' ? "text-status-danger" : "text-status-warning"
                        )} />
                        <div>
                          <p className="font-medium">{alert.type}</p>
                          <p className="text-muted-foreground">{alert.evidence}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT: Explainer + Comms + Plan */}
        <div className="col-span-4 space-y-4">
          {/* English Summary */}
          <Card className="card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Readiness Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 rounded-lg bg-muted/30 text-sm leading-relaxed">
                <p className="mb-2">
                  <strong>{vendor.name}</strong> is currently in <Badge className={cn("text-[10px]", bucketConfig[vendor.bucketTag]?.bg)}>{vendor.bucketTag}</Badge> status 
                  with a risk score of <span className="font-semibold text-status-danger">{vendor.riskScore}</span>.
                </p>
                <p className="mb-2">
                  {vendorPOs.filter(po => po.predictedDelayDays > 0).length} of {vendorPOs.length} POs are at risk of delay, 
                  with <span className="font-semibold text-status-danger">{formatCurrency(vendor.atRiskDollar)}</span> in exposed value.
                </p>
                <p>
                  <strong>Key risks:</strong> {vendor.riskDrivers.join(', ')}.
                </p>
                <p className="mt-2 text-primary font-medium">
                  Recommended: Approve contingency plan and trigger supplier communication.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Communication Trail */}
          <Card className="card-elevated">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  Communication Trail
                </CardTitle>
                <Badge variant="secondary" className="text-[10px]">{vendor.commsTrail.length} messages</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[180px]">
                <div className="space-y-3">
                  {vendor.commsTrail.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">No communications yet</p>
                  ) : (
                    vendor.commsTrail.map((comm: any, i: number) => (
                      <div key={i} className="p-2 rounded-lg border bg-muted/30">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            {comm.channel === 'email' ? (
                              <Mail className="w-3 h-3 text-primary" />
                            ) : (
                              <MessageSquare className="w-3 h-3 text-primary" />
                            )}
                            <span className="text-xs font-medium">{comm.messageType}</span>
                          </div>
                          <Badge variant="outline" className="text-[9px]">{comm.status}</Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground mb-1">{formatDateTime(comm.time)}</p>
                        <p className="text-xs">{comm.snippet}</p>
                        {comm.followUpDue && (
                          <p className="text-[10px] text-status-warning mt-1">
                            Follow-up due: {formatDateTime(comm.followUpDue)}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
              <div className="mt-3 flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 text-xs"
                  onClick={() => {
                    import('sonner').then(({ toast }) => {
                      toast.success('Reminder sent', {
                        description: `Follow-up email dispatched to ${vendor.name}`
                      });
                    });
                    addAuditEntry({
                      timestamp: new Date().toISOString(),
                      actor: 'User',
                      role: currentRole,
                      decision: `Sent reminder to ${vendor.name}`,
                      toolsUsed: ['email_dispatcher'],
                      details: 'Reminder email sent'
                    });
                  }}
                >
                  <Send className="w-3 h-3 mr-1" />
                  Send Reminder
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 text-xs"
                  onClick={() => {
                    import('sonner').then(({ toast }) => {
                      toast.success('Issue escalated', {
                        description: `${vendor.name} escalated to senior management`
                      });
                    });
                    addAuditEntry({
                      timestamp: new Date().toISOString(),
                      actor: 'User',
                      role: currentRole,
                      decision: `Escalated ${vendor.name}`,
                      toolsUsed: ['escalation_engine'],
                      details: 'Issue escalated to management'
                    });
                  }}
                >
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Escalate
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Contingency Plan */}
          {plan && (
            <Card className="card-elevated border-primary/30">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    Contingency Plan
                  </CardTitle>
                  <Badge variant="outline" className="text-[10px]">{plan.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {plan.actions.map((action) => (
                      <div key={action.id} className={cn(
                        "p-2 rounded-lg border flex items-start gap-2",
                        action.enabled ? "bg-primary/5 border-primary/20" : "bg-muted/30"
                      )}>
                        <Switch 
                          checked={action.enabled} 
                          disabled={planApproved}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="text-[9px]">{action.category}</Badge>
                            <Badge className={cn(
                              "text-[9px]",
                              action.priority === 'critical' ? "bg-status-danger" :
                              action.priority === 'high' ? "bg-status-warning" : "bg-muted"
                            )}>
                              {action.priority}
                            </Badge>
                          </div>
                          <p className="text-xs font-medium">{action.title}</p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                            <span>{action.owner}</span>
                            <span>•</span>
                            <span>Due: {formatDate(action.dueDate)}</span>
                          </div>
                          <p className="text-[10px] text-status-success mt-1">{action.expectedImpact}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="mt-4 pt-3 border-t space-y-2">
                  {!planApproved ? (
                    <Button 
                      className="w-full" 
                      size="sm"
                      onClick={handleApprovePlan}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Approve Plan
                    </Button>
                  ) : (
                    <Button 
                      className="w-full bg-status-success hover:bg-status-success/90" 
                      size="sm"
                      onClick={handleExecutePlan}
                      disabled={planExecuting}
                    >
                      {planExecuting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Executing...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Execute Plan
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
