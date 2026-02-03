import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useGovernanceStore } from '@/store/governanceStore';
import { useAppStore } from '@/store/appStore';
import { 
  ChevronLeft,
  Activity,
  FileSearch,
  ShieldCheck,
  FileBarChart,
  GitBranch,
  FileEdit,
  Loader2,
  CheckCircle2,
  Zap,
  Play
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

const investigationSteps = [
  { id: 'kpi', label: 'KPI Monitor', icon: Activity, description: 'Analyzing performance metrics...' },
  { id: 'shipment', label: 'Shipment Analyzer', icon: FileSearch, description: 'Reviewing shipment data...' },
  { id: 'compliance', label: 'Compliance Checker', icon: ShieldCheck, description: 'Checking compliance status...' },
  { id: 'asn', label: 'ASN Validator', icon: FileBarChart, description: 'Validating ASN accuracy...' },
  { id: 'root_cause', label: 'Root Cause Builder', icon: GitBranch, description: 'Building root cause analysis...' },
  { id: 'plan', label: 'Plan Drafting', icon: FileEdit, description: 'Generating improvement plan...' }
];

export const InvestigatePage = () => {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();
  const { getVendorById, getPlanByVendorId, approvePlan } = useGovernanceStore();
  const { currentRole, addAuditEntry, addToolTrace } = useAppStore();
  
  const [currentStep, setCurrentStep] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const vendor = getVendorById(vendorId || '');
  const plan = getPlanByVendorId(vendorId || '');

  useEffect(() => {
    if (isRunning && currentStep < investigationSteps.length - 1) {
      const timer = setTimeout(() => {
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        
        // Add tool trace
        addToolTrace({
          timestamp: new Date().toISOString(),
          toolName: investigationSteps[nextStep].label,
          action: investigationSteps[nextStep].description,
          dataSources: ['supplier_data', 'metrics_db'],
          duration: Math.random() * 500 + 200
        });

        if (nextStep === investigationSteps.length - 1) {
          setTimeout(() => {
            setIsRunning(false);
            setIsComplete(true);
          }, 1000);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isRunning, currentStep, addToolTrace]);

  const startInvestigation = () => {
    setIsRunning(true);
    setCurrentStep(0);
    addAuditEntry({
      timestamp: new Date().toISOString(),
      actor: 'Agent',
      role: currentRole,
      decision: `Investigation started for ${vendor?.name}`,
      toolsUsed: investigationSteps.map(s => s.label),
      details: 'Initiated full investigation workflow'
    });
    
    addToolTrace({
      timestamp: new Date().toISOString(),
      toolName: investigationSteps[0].label,
      action: investigationSteps[0].description,
      dataSources: ['supplier_data', 'metrics_db'],
      duration: Math.random() * 500 + 200
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
        decision: `Plan approved for ${vendor?.name}`,
        toolsUsed: ['plan_approval'],
        details: `Improvement plan ${plan.id} approved`
      });
    }
  };

  if (!vendor) {
    return (
      <div className="p-6 flex items-center justify-center">
        <p className="text-muted-foreground">Vendor not found</p>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-foreground">Investigation Workspace</h1>
          <p className="text-sm text-muted-foreground">{vendor.name}</p>
        </div>
        {!isRunning && !isComplete && (
          <Button onClick={startInvestigation}>
            <Play className="w-4 h-4 mr-2" />
            Start Investigation
          </Button>
        )}
      </div>

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
                      "flex items-center gap-3 p-3 rounded-lg transition-all",
                      isActive && "bg-status-info-bg border border-status-info/40",
                      isCompleted && "bg-status-success-bg/50",
                      isPending && "bg-muted/30 opacity-50"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      isActive && "bg-status-info text-white",
                      isCompleted && "bg-status-success text-white",
                      isPending && "bg-muted text-muted-foreground"
                    )}>
                      {isActive ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isCompleted ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className={cn(
                        "text-sm font-medium",
                        isActive && "text-status-info",
                        isCompleted && "text-status-success"
                      )}>
                        {step.label}
                      </p>
                      {isActive && (
                        <p className="text-xs text-muted-foreground">{step.description}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Root Cause Analysis */}
        <div className="col-span-4">
          <Card className="card-elevated h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Root Cause Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              {isComplete ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <p className="text-sm font-medium mb-2">Primary Root Cause (82% confidence)</p>
                    <p className="text-sm text-muted-foreground">
                      Arabic labeling compliance failures at source factory causing DC holds 
                      and OTIF degradation. Secondary factor: ASN mapping errors increasing 
                      receiving delays.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase">Contributing Factors</p>
                    {vendor.riskDrivers.map((driver, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded bg-muted/30">
                        <div className="w-2 h-2 rounded-full bg-status-danger" />
                        <span className="text-sm">{driver}</span>
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

        {/* Improvement Plan */}
        <div className="col-span-4">
          <Card className="card-elevated h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Improvement Plan</CardTitle>
            </CardHeader>
            <CardContent>
              {isComplete && plan ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{plan.status.toUpperCase()}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {plan.actions.filter(a => a.enabled).length} actions
                    </span>
                  </div>
                  
                  <div className="space-y-2 max-h-48 overflow-auto">
                    {plan.actions.map((action) => (
                      <div 
                        key={action.id}
                        className="p-2 rounded border bg-muted/30 text-sm"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-[9px] px-1">
                            {action.category}
                          </Badge>
                          <Badge 
                            variant={action.priority === 'critical' ? 'destructive' : 'outline'}
                            className="text-[9px] px-1"
                          >
                            {action.priority}
                          </Badge>
                        </div>
                        <p className="text-xs">{action.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {action.expectedImpact}
                        </p>
                      </div>
                    ))}
                  </div>

                  {plan.status === 'pending' && (
                    <Button 
                      className="w-full" 
                      onClick={handleApprovePlan}
                      disabled={currentRole === 'viewer'}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Approve & Execute
                    </Button>
                  )}
                  
                  {plan.status === 'approved' && (
                    <div className="flex items-center gap-2 text-status-success">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm">Plan approved</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-48 text-muted-foreground">
                  <p className="text-sm">Complete investigation to generate plan</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
