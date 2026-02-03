import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useGovernanceStore, BucketTag } from '@/store/governanceStore';
import { useAppStore } from '@/store/appStore';
import { 
  ChevronLeft,
  MapPin,
  User,
  Calendar,
  CalendarClock,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Mail,
  Send,
  FileText,
  Search,
  Clock,
  Package,
  DollarSign,
  Zap,
  Play,
  Loader2,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const bucketConfig: Record<BucketTag, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  good: { label: 'Good', color: 'text-status-success', bgColor: 'bg-status-success-bg', icon: <CheckCircle2 className="w-4 h-4" /> },
  average: { label: 'Average', color: 'text-status-warning', bgColor: 'bg-status-warning-bg', icon: <AlertTriangle className="w-4 h-4" /> },
  needs_review: { label: 'Needs Review', color: 'text-orange-600', bgColor: 'bg-orange-50', icon: <AlertCircle className="w-4 h-4" /> },
  critical: { label: 'Critical', color: 'text-status-danger', bgColor: 'bg-status-danger-bg', icon: <XCircle className="w-4 h-4" /> }
};

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const MiniSparkline = ({ data, color }: { data: number[]; color: string }) => {
  const chartData = data.map((value, index) => ({ week: `W${index + 1}`, value }));
  return (
    <div className="h-8 w-20">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const VendorPage = () => {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();
  const { getVendorById, getPlanByVendorId, approvePlan, togglePlanAction, updatePlanStatus } = useGovernanceStore();
  const { currentRole, addAuditEntry } = useAppStore();
  const [showPlanBuilder, setShowPlanBuilder] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionStep, setExecutionStep] = useState(0);

  const vendor = getVendorById(vendorId || '');
  const plan = getPlanByVendorId(vendorId || '');

  const executionSteps = [
    'Validating plan actions...',
    'Dispatching tasks to owners...',
    'Sending notifications...',
    'Updating system records...',
    'Execution complete!'
  ];

  useEffect(() => {
    if (isExecuting && executionStep < executionSteps.length) {
      const timer = setTimeout(() => {
        setExecutionStep(prev => prev + 1);
      }, 800);
      return () => clearTimeout(timer);
    } else if (isExecuting && executionStep >= executionSteps.length && plan) {
      setIsExecuting(false);
      updatePlanStatus(plan.id, 'executing');
      toast.success('Plan execution started', {
        description: `${plan.actions.filter(a => a.enabled).length} tasks dispatched to respective owners`
      });
      addAuditEntry({
        timestamp: new Date().toISOString(),
        actor: currentRole === 'ops_manager' ? 'Ops Manager' : 'Category Head',
        role: currentRole,
        decision: `Plan executed for ${vendor?.name}`,
        toolsUsed: ['plan_execution', 'task_dispatch'],
        details: `${plan.actions.filter(a => a.enabled).length} actions dispatched`
      });
    }
  }, [isExecuting, executionStep]);

  const handleReviewPlan = () => {
    if (plan) {
      updatePlanStatus(plan.id, 'pending');
      toast.success('Plan moved to review', {
        description: 'You can now review and modify actions before execution'
      });
      addAuditEntry({
        timestamp: new Date().toISOString(),
        actor: currentRole === 'ops_manager' ? 'Ops Manager' : 'Category Head',
        role: currentRole,
        decision: `Plan review started for ${vendor?.name}`,
        toolsUsed: ['plan_review'],
        details: `${plan.actions.length} actions under review`
      });
    }
  };

  const handleExecutePlan = () => {
    if (plan) {
      approvePlan(plan.id, currentRole === 'ops_manager' ? 'Ops Manager' : 'Category Head', currentRole);
      setIsExecuting(true);
      setExecutionStep(0);
    }
  };

  if (!vendor) {
    return (
      <div className="p-6 flex items-center justify-center">
        <p className="text-muted-foreground">Vendor not found</p>
      </div>
    );
  }

  const config = bucketConfig[vendor.bucketTag];

  const handleStartReview = () => {
    setIsReviewing(true);
    addAuditEntry({
      timestamp: new Date().toISOString(),
      actor: currentRole === 'ops_manager' ? 'Ops Manager' : currentRole === 'category_head' ? 'Category Head' : 'Viewer',
      role: currentRole,
      decision: `Review started for ${vendor.name}`,
      toolsUsed: [],
      details: `Initiated vendor review session`
    });
  };

  const handleApprovePlan = () => {
    if (plan) {
      const approverName = currentRole === 'ops_manager' ? 'Ops Manager' : 'Category Head';
      approvePlan(plan.id, approverName, currentRole);
      addAuditEntry({
        timestamp: new Date().toISOString(),
        actor: approverName,
        role: currentRole,
        decision: `Plan approved for ${vendor.name}`,
        toolsUsed: ['plan_approval'],
        details: `Improvement plan ${plan.id} approved with ${plan.actions.filter(a => a.enabled).length} actions`
      });
    }
  };

  // Generate narrative
  const generateNarrative = () => {
    const otifDelta = vendor.metrics.otif.current - vendor.metrics.otif.previous;
    const fillDelta = vendor.metrics.fillRate.current - vendor.metrics.fillRate.previous;
    const complianceDelta = vendor.metrics.compliance.current - vendor.metrics.compliance.previous;

    let narrative = `${vendor.name} has experienced `;
    
    if (otifDelta < -10) {
      narrative += `a significant OTIF decline of ${Math.abs(otifDelta)}% over the review period, dropping from ${vendor.metrics.otif.previous}% to ${vendor.metrics.otif.current}%. `;
    } else if (otifDelta < -5) {
      narrative += `a moderate OTIF decline of ${Math.abs(otifDelta)}%, now at ${vendor.metrics.otif.current}%. `;
    } else if (otifDelta > 0) {
      narrative += `improved OTIF by ${otifDelta}%, now at ${vendor.metrics.otif.current}%. `;
    } else {
      narrative += `stable OTIF at ${vendor.metrics.otif.current}%. `;
    }

    if (complianceDelta > 2) {
      narrative += `Compliance failures have increased significantly to ${vendor.metrics.compliance.current}%, up from ${vendor.metrics.compliance.previous}%. `;
    }

    if (vendor.complianceIssues.length > 0) {
      const criticalIssues = vendor.complianceIssues.filter(i => i.severity === 'critical');
      if (criticalIssues.length > 0) {
        narrative += `There are ${criticalIssues.length} critical compliance issues requiring immediate attention. `;
      }
    }

    if (vendor.bucketTag === 'critical' || vendor.bucketTag === 'needs_review') {
      narrative += `Recommended action: Initiate investigation and improvement plan.`;
    } else if (vendor.bucketTag === 'average') {
      narrative += `Continue monitoring with bi-weekly reviews.`;
    } else {
      narrative += `Maintain current performance cadence.`;
    }

    return narrative;
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
          <h1 className="text-2xl font-bold text-foreground">{vendor.name}</h1>
          <p className="text-sm text-muted-foreground">Vendor 360 Review</p>
        </div>
      </div>

      {/* 3-Column Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* LEFT: Vendor Snapshot */}
        <div className="col-span-3 space-y-4">
          <Card className="card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Vendor Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Bucket & Score */}
              <div className={cn("p-3 rounded-lg", config.bgColor)}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={config.color}>{config.icon}</span>
                  <Badge variant="outline" className={cn("text-xs", config.color)}>
                    {config.label}
                  </Badge>
                </div>
                <div className="text-3xl font-bold text-foreground">
                  {vendor.compositeScore.toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground">Composite Score</p>
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{vendor.route}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>{vendor.owner}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Package className="w-4 h-4" />
                  <span>{vendor.totals.totalPOs} POs</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="w-4 h-4" />
                  <span>{formatCurrency(vendor.totals.tradedDollar)}</span>
                </div>
              </div>

              <Separator />

              {/* Review Dates */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Last Review
                  </span>
                  <span className="font-medium">{formatDate(vendor.lastReviewDate)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <CalendarClock className="w-3.5 h-3.5" />
                    Next Due
                  </span>
                  <span className={cn(
                    "font-medium",
                    new Date(vendor.nextReviewDue) < new Date() ? "text-status-danger" : ""
                  )}>
                    {formatDate(vendor.nextReviewDue)}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Categories */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Categories</p>
                <div className="flex flex-wrap gap-1">
                  {vendor.categories.map((cat, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2">
                <Button 
                  className="w-full" 
                  onClick={handleStartReview}
                  disabled={isReviewing}
                >
                  {isReviewing ? 'Reviewing...' : 'Review Now'}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate(`/investigate/${vendor.id}`)}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Investigate
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full text-muted-foreground"
                  onClick={() => {
                    toast.success('Review scheduled', {
                      description: `Calendar invite sent for ${vendor.name} vendor review`
                    });
                    addAuditEntry({
                      timestamp: new Date().toISOString(),
                      actor: currentRole === 'ops_manager' ? 'Ops Manager' : 'Category Head',
                      role: currentRole,
                      decision: `Scheduled review for ${vendor.name}`,
                      toolsUsed: ['calendar_scheduler'],
                      details: 'Review meeting scheduled'
                    });
                  }}
                >
                  <CalendarClock className="w-4 h-4 mr-2" />
                  Schedule Review
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CENTER: Performance Explainer */}
        <div className="col-span-5 space-y-4">
          <Card className="card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Performance Explainer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Narrative */}
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <p className="text-sm text-foreground leading-relaxed">
                  {generateNarrative()}
                </p>
              </div>

              {/* Metrics with Sparklines */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'otif', label: 'OTIF', data: vendor.trends.otif, color: '#2563eb' },
                  { key: 'fillRate', label: 'Fill Rate', data: vendor.trends.fillRate, color: '#16a34a' },
                  { key: 'quality', label: 'Quality', data: vendor.trends.quality, color: '#9333ea' },
                  { key: 'compliance', label: 'Compliance Fail', data: vendor.trends.compliance, color: '#dc2626', inverted: true }
                ].map(({ key, label, data, color, inverted }) => {
                  const metric = vendor.metrics[key as keyof typeof vendor.metrics];
                  const delta = metric.current - metric.previous;
                  const isGood = inverted ? delta < 0 : delta > 0;

                  return (
                    <div key={key} className="p-3 rounded-lg bg-muted/30 border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">{label}</span>
                        <MiniSparkline data={data} color={color} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-foreground">
                          {typeof metric.current === 'number' ? 
                            (metric.current % 1 === 0 ? metric.current : metric.current.toFixed(1)) : metric.current}%
                        </span>
                        <span className={cn(
                          "text-xs flex items-center",
                          isGood ? "text-status-success" : "text-status-danger"
                        )}>
                          {isGood ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                          {Math.abs(delta).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Key Drivers */}
              {vendor.riskDrivers.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Key Risk Drivers</p>
                  <div className="flex flex-wrap gap-2">
                    {vendor.riskDrivers.map((driver, i) => (
                      <Badge key={i} variant="destructive" className="text-xs">
                        {driver}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Compliance + Actions + Comms */}
        <div className="col-span-4 space-y-4">
          {/* Compliance */}
          <Card className="card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Compliance Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {vendor.complianceIssues.length === 0 ? (
                <div className="flex items-center gap-2 text-status-success">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm font-medium">All compliance requirements met</span>
                </div>
              ) : (
                vendor.complianceIssues.map((issue, i) => (
                  <div 
                    key={i}
                    className={cn(
                      "p-3 rounded-lg border",
                      issue.severity === 'critical' ? "bg-status-danger-bg border-status-danger/20" : "bg-status-warning-bg border-status-warning/20"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn(
                        "text-sm font-medium",
                        issue.severity === 'critical' ? "text-status-danger" : "text-status-warning"
                      )}>
                        {issue.type}
                      </span>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[10px]",
                          issue.severity === 'critical' ? "text-status-danger" : "text-status-warning"
                        )}
                      >
                        {issue.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{issue.evidence}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      First seen: {formatDate(issue.firstSeen)} | Last seen: {formatDate(issue.lastSeen)}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Communications */}
          {(vendor.bucketTag === 'needs_review' || vendor.bucketTag === 'critical') && (
            <Card className="card-elevated">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Communications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {vendor.comms.length > 0 ? (
                  vendor.comms.map((comm, i) => (
                    <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-muted/30">
                      <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{comm.messageType}</p>
                        <p className="text-xs text-muted-foreground">
                          Sent: {formatDate(comm.sentAt)} | Status: {comm.status}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No communications sent yet</p>
                )}
                
                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1 text-xs"
                    onClick={() => {
                      toast.success('Reminder sent', {
                        description: `Follow-up email dispatched to ${vendor.name}`
                      });
                      addAuditEntry({
                        timestamp: new Date().toISOString(),
                        actor: currentRole === 'ops_manager' ? 'Ops Manager' : 'Category Head',
                        role: currentRole,
                        decision: `Sent reminder to ${vendor.name}`,
                        toolsUsed: ['email_dispatcher'],
                        details: 'Reminder email sent'
                      });
                    }}
                  >
                    <Send className="w-3.5 h-3.5 mr-1" />
                    Send Reminder
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1 text-xs"
                    onClick={() => {
                      toast.success('Vendor letter generated', {
                        description: `Formal letter prepared for ${vendor.name}`
                      });
                      addAuditEntry({
                        timestamp: new Date().toISOString(),
                        actor: currentRole === 'ops_manager' ? 'Ops Manager' : 'Category Head',
                        role: currentRole,
                        decision: `Generated vendor letter for ${vendor.name}`,
                        toolsUsed: ['document_generator'],
                        details: 'Formal vendor letter generated'
                      });
                    }}
                  >
                    <FileText className="w-3.5 h-3.5 mr-1" />
                    Vendor Letter
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Improvement Plan */}
          <Card className="card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Improvement Plan</CardTitle>
            </CardHeader>
            <CardContent>
              {plan ? (
                <div className="space-y-3">
                  {/* Status Header */}
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs font-semibold",
                        plan.status === 'draft' && "bg-muted text-muted-foreground",
                        plan.status === 'pending' && "bg-status-warning-bg text-status-warning border-status-warning",
                        plan.status === 'approved' && "bg-status-success-bg text-status-success border-status-success",
                        plan.status === 'executing' && "bg-primary/10 text-primary border-primary"
                      )}
                    >
                      {plan.status.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {plan.actions.filter(a => a.enabled).length} actions enabled
                    </span>
                  </div>
                  
                  {/* Actions List */}
                  <div className="space-y-2 max-h-52 overflow-auto">
                    {plan.actions.map((action) => (
                      <div 
                        key={action.id}
                        className={cn(
                          "p-2.5 rounded-lg border text-sm transition-all",
                          action.enabled ? "bg-muted/50 border-border" : "bg-muted/20 opacity-60 border-transparent"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Badge variant="secondary" className="text-[9px] px-1.5 py-0 font-medium">
                                {action.category}
                              </Badge>
                              <Badge 
                                variant={action.priority === 'critical' ? 'destructive' : 'outline'}
                                className="text-[9px] px-1.5 py-0"
                              >
                                {action.priority}
                              </Badge>
                            </div>
                            <p className="text-xs leading-relaxed">{action.title}</p>
                          </div>
                          <Switch 
                            checked={action.enabled}
                            onCheckedChange={() => togglePlanAction(plan.id, action.id)}
                            disabled={plan.status === 'approved' || plan.status === 'executing'}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Execution Progress */}
                  {isExecuting && (
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Loader2 className="w-4 h-4 text-primary animate-spin" />
                        <span className="text-xs font-medium text-primary">Executing Plan...</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {executionSteps[Math.min(executionStep, executionSteps.length - 1)]}
                      </p>
                      <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-500"
                          style={{ width: `${((executionStep + 1) / executionSteps.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Buttons based on status */}
                  {plan.status === 'draft' && !isExecuting && (
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={handleReviewPlan}
                      disabled={currentRole === 'viewer'}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Review Plan
                    </Button>
                  )}

                  {plan.status === 'pending' && !isExecuting && (
                    <div className="space-y-2">
                      <Button 
                        className="w-full bg-gradient-to-r from-primary to-primary/80" 
                        onClick={handleExecutePlan}
                        disabled={currentRole === 'viewer'}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Execute Plan
                      </Button>
                      <p className="text-[10px] text-center text-muted-foreground">
                        Toggle actions above before executing
                      </p>
                    </div>
                  )}
                  
                  {(plan.status === 'approved' || plan.status === 'executing') && !isExecuting && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-status-success-bg">
                      <CheckCircle2 className="w-4 h-4 text-status-success" />
                      <span className="text-sm text-status-success font-medium">
                        {plan.status === 'executing' ? 'Plan executing' : 'Plan approved'}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-3">No improvement plan yet</p>
                  {(vendor.bucketTag === 'needs_review' || vendor.bucketTag === 'critical') && (
                    <Button onClick={() => navigate(`/investigate/${vendor.id}`)}>
                      <Zap className="w-4 h-4 mr-2" />
                      Generate Plan
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
