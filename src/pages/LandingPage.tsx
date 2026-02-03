import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { useGovernanceStore, BucketTag } from '@/store/governanceStore';
import { useAppStore } from '@/store/appStore';
import { 
  Users, 
  DollarSign, 
  Package, 
  AlertCircle,
  TrendingDown,
  ShieldAlert,
  Clock,
  ChevronRight,
  Search,
  CalendarClock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Zap,
  Loader2,
  Bot,
  Play,
  Square,
  Wrench
} from 'lucide-react';
import { cn } from '@/lib/utils';

const bucketConfig: Record<BucketTag, { label: string; shortLabel: string; planType: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  good: { 
    label: 'On Track', 
    shortLabel: 'On Track',
    planType: 'Maintain Plan',
    color: 'text-status-success', 
    bgColor: 'bg-status-success-bg border-status-success/20',
    icon: <CheckCircle2 className="w-5 h-5" />
  },
  average: { 
    label: 'Watchlist', 
    shortLabel: 'Watchlist',
    planType: 'Quick Fix Plan',
    color: 'text-status-warning', 
    bgColor: 'bg-status-warning-bg border-status-warning/20',
    icon: <AlertTriangle className="w-5 h-5" />
  },
  needs_review: { 
    label: 'At Risk', 
    shortLabel: 'At Risk',
    planType: 'Recovery Plan',
    color: 'text-orange-600', 
    bgColor: 'bg-orange-50 border-orange-200',
    icon: <AlertCircle className="w-5 h-5" />
  },
  critical: { 
    label: 'Breached', 
    shortLabel: 'Breached',
    planType: 'Contain + Escalate',
    color: 'text-status-danger', 
    bgColor: 'bg-status-danger-bg border-status-danger/20',
    icon: <XCircle className="w-5 h-5" />
  }
};

const autopilotSteps = [
  { id: 'scan', label: 'Scanning vendors', duration: 1500 },
  { id: 'investigate', label: 'Running investigation', duration: 2000 },
  { id: 'analyze', label: 'Analyzing root causes', duration: 1800 },
  { id: 'plan', label: 'Generating plans', duration: 1500 },
  { id: 'approve', label: 'Auto-approving plans', duration: 1200 },
  { id: 'execute', label: 'Executing tasks', duration: 2000 },
  { id: 'complete', label: 'Workflow complete', duration: 500 }
];

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const LandingPage = () => {
  const navigate = useNavigate();
  const { vendors, getBucketStats, getAttentionQueue, policyControls, lastRefresh, approvePlan, getPlanByVendorId } = useGovernanceStore();
  const { addAuditEntry, addToolTrace, currentRole } = useAppStore();
  
  // Autopilot state
  const [isAutopilotRunning, setIsAutopilotRunning] = useState(false);
  const [autopilotStep, setAutopilotStep] = useState(-1);
  const [autopilotComplete, setAutopilotComplete] = useState(false);
  const [currentVendorIndex, setCurrentVendorIndex] = useState(0);
  const [processedVendors, setProcessedVendors] = useState<string[]>([]);
  const autopilotRef = useRef<NodeJS.Timeout | null>(null);
  
  const bucketStats = getBucketStats();
  const attentionQueue = getAttentionQueue();
  const totalSpend = vendors.reduce((sum, v) => sum + v.totals.tradedDollar, 0);
  const totalPOs = vendors.reduce((sum, v) => sum + v.totals.totalPOs, 0);
  const needsAttention = attentionQueue.length;

  // Autopilot workflow effect
  useEffect(() => {
    if (isAutopilotRunning && autopilotStep < autopilotSteps.length - 1) {
      const currentStepConfig = autopilotSteps[autopilotStep + 1];
      
      autopilotRef.current = setTimeout(() => {
        const nextStep = autopilotStep + 1;
        setAutopilotStep(nextStep);
        
        // Add tool trace for each step
        addToolTrace({
          timestamp: new Date().toISOString(),
          toolName: 'Autopilot Agent',
          action: autopilotSteps[nextStep].label,
          dataSources: ['vendor_db', 'metrics_engine', 'plan_generator'],
          duration: autopilotSteps[nextStep].duration
        });

        // Process vendor on specific steps
        if (nextStep === 1 && currentVendorIndex < attentionQueue.length) {
          const vendor = attentionQueue[currentVendorIndex];
          addAuditEntry({
            timestamp: new Date().toISOString(),
            actor: 'Autopilot Agent',
            role: currentRole,
            decision: `Investigation started for ${vendor.name}`,
            toolsUsed: ['kpi_monitor', 'compliance_checker', 'root_cause_builder'],
            details: `Auto-processing vendor ${currentVendorIndex + 1} of ${attentionQueue.length}`
          });
        }

        // Auto-approve plans
        if (nextStep === 4) {
          attentionQueue.forEach(vendor => {
            const plan = getPlanByVendorId(vendor.id);
            if (plan && plan.status === 'pending') {
              approvePlan(plan.id, 'Autopilot Agent', currentRole);
            }
          });
          
          addAuditEntry({
            timestamp: new Date().toISOString(),
            actor: 'Autopilot Agent',
            role: currentRole,
            decision: `Auto-approved ${attentionQueue.length} improvement plans`,
            toolsUsed: ['plan_approval_engine'],
            details: 'Bulk approval completed'
          });
        }

        // Mark vendors as processed on execute step
        if (nextStep === 5) {
          setProcessedVendors(attentionQueue.map(v => v.id));
          
          addAuditEntry({
            timestamp: new Date().toISOString(),
            actor: 'Autopilot Agent',
            role: currentRole,
            decision: `Executing tasks for ${attentionQueue.length} vendors`,
            toolsUsed: ['task_dispatcher', 'notification_service'],
            details: 'All remediation tasks dispatched'
          });
        }

        // Complete
        if (nextStep === autopilotSteps.length - 1) {
          setTimeout(() => {
            setIsAutopilotRunning(false);
            setAutopilotComplete(true);
            
            addAuditEntry({
              timestamp: new Date().toISOString(),
              actor: 'Autopilot Agent',
              role: currentRole,
              decision: 'Autopilot workflow completed',
              toolsUsed: ['workflow_orchestrator'],
              details: `Processed ${attentionQueue.length} vendors, approved plans, dispatched tasks`
            });
          }, 500);
        }
      }, currentStepConfig?.duration || 1500);

      return () => {
        if (autopilotRef.current) {
          clearTimeout(autopilotRef.current);
        }
      };
    }
  }, [isAutopilotRunning, autopilotStep, currentVendorIndex, attentionQueue, addToolTrace, addAuditEntry, approvePlan, getPlanByVendorId]);

  const startAutopilot = () => {
    setIsAutopilotRunning(true);
    setAutopilotStep(0);
    setAutopilotComplete(false);
    setCurrentVendorIndex(0);
    setProcessedVendors([]);
    
    addAuditEntry({
      timestamp: new Date().toISOString(),
      actor: 'User',
      role: currentRole,
      decision: 'Autopilot mode initiated',
      toolsUsed: ['autopilot_orchestrator'],
      details: `Processing ${attentionQueue.length} vendors in attention queue`
    });
    
    addToolTrace({
      timestamp: new Date().toISOString(),
      toolName: 'Autopilot Agent',
      action: autopilotSteps[0].label,
      dataSources: ['vendor_db', 'attention_queue'],
      duration: autopilotSteps[0].duration
    });
  };

  const stopAutopilot = () => {
    if (autopilotRef.current) {
      clearTimeout(autopilotRef.current);
    }
    setIsAutopilotRunning(false);
    
    addAuditEntry({
      timestamp: new Date().toISOString(),
      actor: 'User',
      role: currentRole,
      decision: 'Autopilot mode stopped',
      toolsUsed: [],
      details: `Stopped at step: ${autopilotSteps[autopilotStep]?.label || 'initial'}`
    });
  };

  const autopilotProgress = autopilotStep >= 0 
    ? ((autopilotStep + 1) / autopilotSteps.length) * 100 
    : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Guided Demo Mode Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-lg p-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Zap className="w-4 h-4" />
            Guided Demo
          </div>
          <div className="flex items-center gap-4 text-sm text-foreground">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">1</span>
              <span>Choose bucket</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-bold flex items-center justify-center">2</span>
              <span>Pick vendor</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-bold flex items-center justify-center">3</span>
              <span>Approve plan</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-bold flex items-center justify-center">4</span>
              <span>See audit trail</span>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Supplier Governance Home</h1>
          <p className="text-sm text-muted-foreground">Portfolio overview and exception management</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Autopilot Button */}
          {!isAutopilotRunning && !autopilotComplete && attentionQueue.length > 0 && (
            <Button 
              onClick={startAutopilot}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 gap-2"
            >
              <Bot className="w-4 h-4" />
              <Zap className="w-3 h-3" />
              Run Autopilot
              <Badge variant="secondary" className="ml-1 bg-white/20 text-white">
                {attentionQueue.length}
              </Badge>
            </Button>
          )}
          
          {isAutopilotRunning && (
            <Button 
              onClick={stopAutopilot}
              variant="destructive"
              className="gap-2"
            >
              <Square className="w-4 h-4" />
              Stop Autopilot
            </Button>
          )}
          
          {autopilotComplete && (
            <Button 
              onClick={() => {
                setAutopilotComplete(false);
                setAutopilotStep(-1);
                setProcessedVendors([]);
              }}
              variant="outline"
              className="gap-2 border-status-success text-status-success"
            >
              <CheckCircle2 className="w-4 h-4" />
              Autopilot Complete
            </Button>
          )}
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>Last refresh: {formatDate(lastRefresh)}</span>
          </div>
        </div>
      </div>

      {/* Autopilot Progress Panel */}
      {(isAutopilotRunning || autopilotComplete) && (
        <Card className={cn(
          "card-elevated border-2 transition-all",
          isAutopilotRunning && "border-primary/50 bg-primary/5",
          autopilotComplete && "border-status-success/50 bg-status-success-bg"
        )}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-4 mb-4">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                isAutopilotRunning && "bg-primary text-white",
                autopilotComplete && "bg-status-success text-white"
              )}>
                {isAutopilotRunning ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-foreground">
                    {isAutopilotRunning ? 'Autopilot Running' : 'Autopilot Complete'}
                  </p>
                  <span className="text-sm text-muted-foreground">
                    {processedVendors.length}/{attentionQueue.length} vendors processed
                  </span>
                </div>
                <Progress value={autopilotProgress} className="h-2" />
              </div>
            </div>
            
            {/* Step indicators */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {autopilotSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
                    autopilotStep > index && "bg-status-success text-white",
                    autopilotStep === index && isAutopilotRunning && "bg-primary text-white animate-pulse",
                    autopilotStep < index && "bg-muted text-muted-foreground"
                  )}
                >
                  {autopilotStep > index ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : autopilotStep === index && isAutopilotRunning ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <span className="w-3 h-3 rounded-full bg-current opacity-30" />
                  )}
                  {step.label}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Portfolio Summary */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="card-elevated">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Vendors</p>
                <p className="text-3xl font-bold text-foreground">{vendors.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Spend</p>
                <p className="text-3xl font-bold text-foreground">{formatCurrency(totalSpend)}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-status-success/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-status-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total POs</p>
                <p className="text-3xl font-bold text-foreground">{totalPOs}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-status-info/10 flex items-center justify-center">
                <Package className="w-6 h-6 text-status-info" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated border-status-danger/30">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Needs Attention</p>
                <p className="text-3xl font-bold text-status-danger">{needsAttention}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-status-danger/10 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-status-danger" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bucket Cards */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Performance Buckets</h2>
        <div className="grid grid-cols-4 gap-4">
          {(['good', 'average', 'needs_review', 'critical'] as BucketTag[]).map((bucket) => {
            const config = bucketConfig[bucket];
            const stats = bucketStats[bucket];
            const spendShare = totalSpend > 0 ? ((stats.spend / totalSpend) * 100).toFixed(1) : '0';

            return (
              <Card 
                key={bucket}
                className={cn(
                  "card-elevated cursor-pointer hover:shadow-md transition-all border",
                  config.bgColor
                )}
                onClick={() => navigate(`/bucket/${bucket}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className={cn("flex items-center gap-2", config.color)}>
                      {config.icon}
                      <CardTitle className="text-sm font-semibold">{config.label}</CardTitle>
                    </div>
                    <ChevronRight className={cn("w-4 h-4", config.color)} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stats.count}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">Vendors</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{spendShare}%</p>
                      <p className="text-[10px] text-muted-foreground uppercase">Spend</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stats.pos}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">POs</p>
                    </div>
                  </div>
                  {stats.drivers.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {stats.drivers.map((driver, i) => (
                        <Badge 
                          key={i} 
                          variant="secondary" 
                          className="text-[9px] px-1.5 py-0"
                        >
                          {driver}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Attention Queue */}
      <Card className="card-elevated">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-status-danger" />
              <CardTitle className="text-lg">Attention Queue</CardTitle>
              <Badge variant="destructive" className="text-xs">{attentionQueue.length}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Vendor</TableHead>
                <TableHead className="w-[100px]">Bucket</TableHead>
                <TableHead className="w-[80px] text-right">Score</TableHead>
                <TableHead>Issues</TableHead>
                <TableHead className="w-[100px] text-right">$ Traded</TableHead>
                <TableHead className="w-[90px]">Last Review</TableHead>
                <TableHead className="w-[90px]">Next Due</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[160px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attentionQueue.map((vendor) => {
                const isProcessed = processedVendors.includes(vendor.id);
                
                return (
                  <TableRow key={vendor.id} className={cn(
                    "hover:bg-muted/50",
                    isProcessed && "bg-status-success-bg/30"
                  )}>
                    <TableCell className="font-medium">{vendor.name}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs", bucketConfig[vendor.bucketTag].color)}
                      >
                        {bucketConfig[vendor.bucketTag].label.split(' ')[0]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      <span className={cn(
                        "font-semibold",
                        vendor.compositeScore < 60 ? "text-status-danger" : 
                        vendor.compositeScore < 75 ? "text-orange-600" : "text-status-warning"
                      )}>
                        {vendor.compositeScore.toFixed(1)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {vendor.riskDrivers.slice(0, 3).map((driver, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0">
                            {driver}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatCurrency(vendor.totals.tradedDollar)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(vendor.lastReviewDate)}
                    </TableCell>
                    <TableCell className="text-xs">
                      <span className={cn(
                        new Date(vendor.nextReviewDue) < new Date() ? "text-status-danger font-medium" : "text-muted-foreground"
                      )}>
                        {formatDate(vendor.nextReviewDue)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {isProcessed ? (
                        <Badge className="bg-status-success text-white text-[10px]">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Processed
                        </Badge>
                      ) : isAutopilotRunning ? (
                        <Badge variant="outline" className="text-[10px] animate-pulse">
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          Queued
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button 
                          size="sm" 
                          className="h-7 text-xs bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                          onClick={() => navigate(`/vendor/${vendor.id}`)}
                          disabled={isAutopilotRunning}
                        >
                          <Wrench className="w-3 h-3 mr-1" />
                          Fix Now
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 text-xs"
                          onClick={() => navigate(`/investigate/${vendor.id}`)}
                          disabled={isAutopilotRunning}
                        >
                          <Search className="w-3 h-3 mr-1" />
                          Investigate
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Policy Controls Snapshot */}
      <Card className="card-elevated">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Policy Controls Snapshot</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {policyControls.map((policy) => (
              <div 
                key={policy.id}
                className="p-4 rounded-lg bg-muted/50 border border-border"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{policy.name}</span>
                  <Switch checked={policy.enabled} disabled />
                </div>
                <p className="text-xs text-muted-foreground mb-2">{policy.description}</p>
                <div className="flex items-center justify-between">
                  <Badge 
                    variant={policy.triggeredCount > 0 ? "destructive" : "secondary"}
                    className="text-xs"
                  >
                    {policy.triggeredCount} triggered this week
                  </Badge>
                  <Button variant="ghost" size="sm" className="h-6 text-xs text-primary">
                    View vendors
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};