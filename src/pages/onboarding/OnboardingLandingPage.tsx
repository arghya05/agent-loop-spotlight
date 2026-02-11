import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import {
  Clock,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronRight,
  Users,
  TrendingUp,
  Bot,
  Zap,
  Play,
  Loader2,
  Square,
  FileText,
  Search,
  ShieldCheck,
  Shield,
  FileWarning,
  Timer,
  Ban
} from 'lucide-react';
import { cn } from '@/lib/utils';
import suppliersData from '@/data/onboarding/suppliers.json';
import casesData from '@/data/onboarding/cases.json';
import settingsData from '@/data/onboarding/settings.json';

type Bucket = 'fast-track' | 'needs-review' | 'blocked';

const bucketConfig: Record<Bucket, { label: string; color: string; bgColor: string; icon: React.ReactNode; description: string }> = {
  'fast-track': {
    label: 'Fast Track',
    color: 'text-status-success',
    bgColor: 'bg-status-success-bg border-status-success/20',
    icon: <CheckCircle2 className="w-5 h-5" />,
    description: 'Low risk, auto-approvable',
  },
  'needs-review': {
    label: 'Needs Review',
    color: 'text-status-warning',
    bgColor: 'bg-status-warning-bg border-status-warning/20',
    icon: <AlertTriangle className="w-5 h-5" />,
    description: 'Medium/high risk, needs human approval',
  },
  'blocked': {
    label: 'Blocked',
    color: 'text-status-danger',
    bgColor: 'bg-status-danger-bg border-status-danger/20',
    icon: <Ban className="w-5 h-5" />,
    description: 'Fails mandatory checks',
  },
};

const autopilotSteps = [
  { id: 'scan', label: 'Scanning queue', duration: 1500 },
  { id: 'docs', label: 'Checking documents', duration: 1800 },
  { id: 'screen', label: 'External screening', duration: 2000 },
  { id: 'score', label: 'Calculating risk', duration: 1500 },
  { id: 'approve', label: 'Auto-approving', duration: 1200 },
  { id: 'execute', label: 'Activating suppliers', duration: 2000 },
  { id: 'complete', label: 'Workflow complete', duration: 500 },
];

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const OnboardingLandingPage = () => {
  const navigate = useNavigate();
  const suppliers = suppliersData.suppliers;
  const cases = casesData.cases;
  const settings = settingsData;

  const [isAutopilotRunning, setIsAutopilotRunning] = useState(false);
  const [autopilotStep, setAutopilotStep] = useState(-1);
  const [autopilotComplete, setAutopilotComplete] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [activityLog, setActivityLog] = useState<{ time: string; icon: string; message: string; type: 'info' | 'action' | 'success' }[]>([]);
  const autopilotRef = useRef<NodeJS.Timeout | null>(null);
  const activityScrollRef = useRef<HTMLDivElement>(null);

  const bucketStats: Record<Bucket, { count: number; drivers: string[] }> = {
    'fast-track': { count: 0, drivers: [] },
    'needs-review': { count: 0, drivers: [] },
    'blocked': { count: 0, drivers: [] },
  };

  suppliers.forEach(s => {
    const bucket = s.bucketTag as Bucket;
    if (bucketStats[bucket]) {
      bucketStats[bucket].count++;
      const missing = s.requiredDocs.filter(d => d.status === 'missing' || d.status === 'pending').map(d => `Missing ${d.type}`);
      const flags = s.externalSignals.filter(e => e.severity === 'critical').map(e => e.type);
      bucketStats[bucket].drivers = [...new Set([...bucketStats[bucket].drivers, ...missing.slice(0, 1), ...flags.slice(0, 1)])].slice(0, 3);
    }
  });

  const totalNew = suppliers.length;
  const inProgress = cases.filter(c => c.stage !== 'Supplier Activated').length;
  const avgOnboardingDays = 8.2;
  const riskExposure = suppliers.filter(s => s.riskScore > 60).length;
  const attentionQueue = suppliers.filter(s => s.bucketTag !== 'fast-track').sort((a, b) => b.riskScore - a.riskScore);

  const addActivityLog = (icon: string, message: string, type: 'info' | 'action' | 'success' = 'info') => {
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setActivityLog(prev => [...prev, { time, icon, message, type }]);
  };

  useEffect(() => {
    if (isAutopilotRunning && autopilotStep < autopilotSteps.length - 1) {
      const currentStepConfig = autopilotSteps[autopilotStep + 1];
      autopilotRef.current = setTimeout(() => {
        const nextStep = autopilotStep + 1;
        setAutopilotStep(nextStep);

        if (nextStep === 0) {
          addActivityLog('search', `Found ${attentionQueue.length} suppliers in queue`, 'info');
          attentionQueue.forEach((s, idx) => {
            setTimeout(() => addActivityLog('alert', `Queued: ${s.name} (Risk: ${s.riskScore})`, 'info'), idx * 200);
          });
        }
        if (nextStep === 1) {
          attentionQueue.forEach((s, idx) => {
            setTimeout(() => addActivityLog('file', `Checking docs for ${s.name}...`, 'action'), idx * 300);
          });
        }
        if (nextStep === 2) {
          attentionQueue.forEach((s, idx) => {
            setTimeout(() => addActivityLog('shield', `Screening ${s.name} against sanctions/ESG/media...`, 'action'), idx * 350);
          });
        }
        if (nextStep === 3) {
          attentionQueue.forEach((s, idx) => {
            setTimeout(() => addActivityLog('target', `${s.name}: Risk score ${s.riskScore} → ${s.bucketTag}`, 'info'), idx * 250);
          });
        }
        if (nextStep === 4) {
          const fastTrack = suppliers.filter(s => s.bucketTag === 'fast-track');
          fastTrack.forEach((s, idx) => {
            setTimeout(() => addActivityLog('check', `Auto-approved: ${s.name}`, 'success'), idx * 200);
          });
        }
        if (nextStep === 5) {
          const fastTrack = suppliers.filter(s => s.bucketTag === 'fast-track');
          fastTrack.forEach((s, idx) => {
            setTimeout(() => {
              addActivityLog('play', `Activating ${s.name} in vendor master...`, 'action');
              setProcessedCount(prev => prev + 1);
            }, idx * 400);
          });
        }
        if (nextStep === autopilotSteps.length - 1) {
          setTimeout(() => {
            addActivityLog('trophy', `Complete! Processed ${suppliers.filter(s => s.bucketTag === 'fast-track').length} fast-track suppliers`, 'success');
            setIsAutopilotRunning(false);
            setAutopilotComplete(true);
          }, 500);
        }
      }, currentStepConfig?.duration || 1500);

      return () => { if (autopilotRef.current) clearTimeout(autopilotRef.current); };
    }
  }, [isAutopilotRunning, autopilotStep]);

  useEffect(() => {
    if (activityScrollRef.current) {
      activityScrollRef.current.scrollTop = activityScrollRef.current.scrollHeight;
    }
  }, [activityLog]);

  const startAutopilot = () => {
    setIsAutopilotRunning(true);
    setAutopilotStep(0);
    setAutopilotComplete(false);
    setProcessedCount(0);
    setActivityLog([]);
    addActivityLog('rocket', 'Autopilot initiated - starting onboarding workflow', 'action');
  };

  const stopAutopilot = () => {
    if (autopilotRef.current) clearTimeout(autopilotRef.current);
    setIsAutopilotRunning(false);
  };

  const autopilotProgress = autopilotStep >= 0 ? ((autopilotStep + 1) / autopilotSteps.length) * 100 : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Onboarding & Compliance Home</h1>
          <p className="text-sm text-muted-foreground">Supplier onboarding pipeline, risk exposure & compliance status</p>
        </div>
        <div className="flex items-center gap-4">
          {!isAutopilotRunning && !autopilotComplete && (
            <Button onClick={startAutopilot} className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 gap-2">
              <Bot className="w-4 h-4" />
              <Zap className="w-3 h-3" />
              Run Autopilot
              <Badge variant="secondary" className="ml-1 bg-white/20 text-primary-foreground">{attentionQueue.length}</Badge>
            </Button>
          )}
          {isAutopilotRunning && (
            <Button onClick={stopAutopilot} variant="destructive" className="gap-2">
              <Square className="w-4 h-4" />
              Stop
            </Button>
          )}
          {autopilotComplete && (
            <Button onClick={() => { setAutopilotComplete(false); setAutopilotStep(-1); }} variant="outline" className="gap-2 border-status-success text-status-success">
              <CheckCircle2 className="w-4 h-4" />
              Complete
            </Button>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>Last refresh: {formatDate(settings.lastRefresh)}</span>
          </div>
        </div>
      </div>

      {/* Autopilot Panel */}
      {(isAutopilotRunning || autopilotComplete) && (
        <Card className={cn("card-elevated border-2 transition-all", isAutopilotRunning && "border-primary/50 bg-primary/5", autopilotComplete && "border-status-success/50 bg-status-success-bg")}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-4 mb-4">
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", isAutopilotRunning ? "bg-primary text-primary-foreground" : "bg-status-success text-primary-foreground")}>
                {isAutopilotRunning ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-foreground">{isAutopilotRunning ? 'Autopilot Running' : 'Autopilot Complete'}</p>
                  <span className="text-sm text-muted-foreground">{processedCount} suppliers processed</span>
                </div>
                <Progress value={autopilotProgress} className="h-2" />
              </div>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-3 border-b border-border/50">
              {autopilotSteps.map((step, index) => (
                <div key={step.id} className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all", autopilotStep > index && "bg-status-success text-primary-foreground", autopilotStep === index && isAutopilotRunning && "bg-primary text-primary-foreground animate-pulse", autopilotStep < index && "bg-muted text-muted-foreground")}>
                  {autopilotStep > index ? <CheckCircle2 className="w-3 h-3" /> : autopilotStep === index && isAutopilotRunning ? <Loader2 className="w-3 h-3 animate-spin" /> : <span className="w-3 h-3 rounded-full bg-current opacity-30" />}
                  {step.label}
                </div>
              ))}
            </div>
            {isAutopilotRunning && (
              <div className="bg-background/50 rounded-lg border border-border/50 overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 bg-muted/30 border-b border-border/50">
                  <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                    <FileText className="w-3.5 h-3.5 text-primary" />
                    Live Activity Feed
                  </div>
                  <Badge variant="secondary" className="text-[10px]">{activityLog.length} events</Badge>
                </div>
                <div ref={activityScrollRef} className="max-h-[120px] overflow-y-auto scrollbar-thin p-2 space-y-1">
                  {activityLog.map((entry, i) => (
                    <div key={i} className={cn("flex items-start gap-2 text-xs px-2 py-1 rounded", entry.type === 'success' ? 'bg-status-success/10' : entry.type === 'action' ? 'bg-primary/5' : 'bg-transparent')}>
                      <span className="text-muted-foreground font-mono text-[10px] mt-0.5 shrink-0">{entry.time}</span>
                      <span className={cn(entry.type === 'success' ? 'text-status-success' : entry.type === 'action' ? 'text-primary' : 'text-foreground')}>{entry.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="card-elevated">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">New Requests (7d)</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{totalNew}</p>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Timer className="w-4 h-4 text-status-warning" />
              <span className="text-xs text-muted-foreground">In Progress</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{inProgress}</p>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-status-info" />
              <span className="text-xs text-muted-foreground">Avg Onboarding</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{avgOnboardingDays}d</p>
            <span className="text-[10px] text-status-success">↓ 1.3d vs last month</span>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-status-success" />
              <span className="text-xs text-muted-foreground">Fast Track</span>
            </div>
            <p className="text-2xl font-bold text-status-success">{bucketStats['fast-track'].count}</p>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-status-danger" />
              <span className="text-xs text-muted-foreground">Risk Exposure</span>
            </div>
            <p className="text-2xl font-bold text-status-danger">{riskExposure}</p>
            <span className="text-[10px] text-muted-foreground">high-risk suppliers</span>
          </CardContent>
        </Card>
      </div>

      {/* Bucket Cards */}
      <div className="grid grid-cols-3 gap-4">
        {(Object.keys(bucketConfig) as Bucket[]).map(bucket => {
          const config = bucketConfig[bucket];
          const stats = bucketStats[bucket];
          return (
            <Card
              key={bucket}
              className={cn("card-elevated border cursor-pointer hover:shadow-md transition-all", config.bgColor)}
              onClick={() => navigate(`/onboarding/bucket/${bucket}`)}
            >
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={config.color}>{config.icon}</span>
                    <h3 className="font-semibold text-foreground">{config.label}</h3>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-3xl font-bold text-foreground mb-1">{stats.count}</p>
                <p className="text-xs text-muted-foreground mb-3">{config.description}</p>
                {stats.drivers.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {stats.drivers.map((d, i) => (
                      <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0">{d}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Onboarding Queue */}
      <Card className="card-elevated">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Onboarding Queue
            </CardTitle>
            <Badge variant="secondary">{suppliers.length} suppliers</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[160px]">Supplier</TableHead>
                <TableHead className="w-[90px]">Bucket</TableHead>
                <TableHead className="w-[70px] text-right">Risk</TableHead>
                <TableHead className="w-[120px]">Stage</TableHead>
                <TableHead>Missing Items</TableHead>
                <TableHead>Key Flags</TableHead>
                <TableHead className="w-[80px]">Owner</TableHead>
                <TableHead className="w-[180px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.sort((a, b) => b.riskScore - a.riskScore).map(supplier => {
                const caseData = cases.find(c => c.supplierId === supplier.id);
                const missingDocs = supplier.requiredDocs.filter(d => d.status === 'missing' || d.status === 'pending');
                const criticalFlags = supplier.externalSignals.filter(e => e.severity === 'critical');
                const bConfig = bucketConfig[supplier.bucketTag as Bucket];

                return (
                  <TableRow key={supplier.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <p className="font-medium">{supplier.name}</p>
                        <p className="text-xs text-muted-foreground">{supplier.country}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("text-[10px]", supplier.bucketTag === 'blocked' ? 'bg-status-danger text-primary-foreground' : supplier.bucketTag === 'needs-review' ? 'bg-status-warning text-primary-foreground' : 'bg-status-success text-primary-foreground')}>
                        {bConfig?.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={cn("font-mono font-semibold", supplier.riskScore >= 60 ? "text-status-danger" : supplier.riskScore >= 26 ? "text-status-warning" : "text-status-success")}>
                        {supplier.riskScore}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs">{caseData?.stage || 'N/A'}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {missingDocs.slice(0, 2).map((d, i) => (
                          <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0 border-status-warning/50 text-status-warning">
                            {d.type}
                          </Badge>
                        ))}
                        {missingDocs.length === 0 && <span className="text-[10px] text-status-success">All complete</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {criticalFlags.slice(0, 2).map((f, i) => (
                          <Badge key={i} variant="destructive" className="text-[10px] px-1.5 py-0">
                            {f.type}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{supplier.owner}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button size="sm" className="h-7 text-xs" onClick={() => navigate(`/onboarding/case/${supplier.onboardingCaseId}`)}>
                          Review
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => navigate(`/onboarding/supplier/${supplier.id}`)}>
                          360
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

      {/* Policy Controls */}
      <Card className="card-elevated">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            Policy Controls Snapshot
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {settings.policyControls.map(control => (
              <div key={control.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <Switch checked={control.enabled} className="mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-foreground">{control.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{control.description}</p>
                  <p className="text-[10px] text-primary mt-1">Triggered {control.triggeredCount}x</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
