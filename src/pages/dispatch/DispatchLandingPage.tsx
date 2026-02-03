import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Package, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ChevronRight, 
  DollarSign,
  Users,
  TrendingUp,
  Send,
  Zap,
  Factory,
  Bot,
  Play,
  Loader2,
  Square,
  FileText,
  Search,
  Database,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import dispatchVendorsData from '@/data/dispatch/vendors.json';
import dispatchSettingsData from '@/data/dispatch/settings.json';

type BucketTag = 'Flow' | 'AW' | 'SS';

interface DispatchVendor {
  id: string;
  name: string;
  factoryLocation: string;
  route: string;
  dc: string;
  categoryTags: string[];
  owner: string;
  bucketTag: string;
  riskScore: number;
  openPOCount: number;
  totalVolumeUnits: number;
  tradedDollar: number;
  atRiskDollar: number;
  lastReviewDate: string;
  nextReviewDue: string;
  riskDrivers: string[];
  commsTrail: any[];
}

const bucketConfig: Record<BucketTag, { label: string; fullLabel: string; color: string; bgColor: string; icon: React.ReactNode; description: string; planType: string }> = {
  Flow: { 
    label: 'On Track', 
    fullLabel: 'On Track',
    color: 'text-status-success', 
    bgColor: 'bg-status-success-bg border-status-success/20',
    icon: <CheckCircle2 className="w-5 h-5" />,
    description: 'Low risk, all milestones on schedule',
    planType: 'Maintain Plan'
  },
  AW: { 
    label: 'Watchlist', 
    fullLabel: 'Watchlist',
    color: 'text-status-warning', 
    bgColor: 'bg-status-warning-bg border-status-warning/20',
    icon: <AlertTriangle className="w-5 h-5" />,
    description: 'Early warning, risk rising but recoverable',
    planType: 'Recovery Plan'
  },
  SS: { 
    label: 'Slipping', 
    fullLabel: 'Slipping',
    color: 'text-status-danger', 
    bgColor: 'bg-status-danger-bg border-status-danger/20',
    icon: <XCircle className="w-5 h-5" />,
    description: 'High probability of missing ex-factory date',
    planType: 'Expedite Plan'
  }
};

const autopilotSteps = [
  { id: 'scan', label: 'Scanning vendors', duration: 1500 },
  { id: 'milestone', label: 'Checking milestones', duration: 1800 },
  { id: 'risk', label: 'Analyzing risk signals', duration: 2000 },
  { id: 'plan', label: 'Generating interventions', duration: 1500 },
  { id: 'approve', label: 'Auto-approving plans', duration: 1200 },
  { id: 'execute', label: 'Dispatching nudges', duration: 2000 },
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

export const DispatchLandingPage = () => {
  const navigate = useNavigate();
  const vendors = dispatchVendorsData.vendors as DispatchVendor[];
  const settings = dispatchSettingsData;
  
  // Autopilot state
  const [isAutopilotRunning, setIsAutopilotRunning] = useState(false);
  const [autopilotStep, setAutopilotStep] = useState(-1);
  const [autopilotComplete, setAutopilotComplete] = useState(false);
  const [processedVendors, setProcessedVendors] = useState<string[]>([]);
  const [activityLog, setActivityLog] = useState<{time: string; icon: string; message: string; vendor?: string; type: 'info' | 'action' | 'success'}[]>([]);
  const autopilotRef = useRef<NodeJS.Timeout | null>(null);
  const activityScrollRef = useRef<HTMLDivElement>(null);
  
  // Calculate bucket stats
  const getBucketStats = () => {
    const stats: Record<BucketTag, { count: number; pos: number; volume: number; atRisk: number; drivers: string[] }> = {
      Flow: { count: 0, pos: 0, volume: 0, atRisk: 0, drivers: [] },
      AW: { count: 0, pos: 0, volume: 0, atRisk: 0, drivers: [] },
      SS: { count: 0, pos: 0, volume: 0, atRisk: 0, drivers: [] }
    };

    vendors.forEach(v => {
      const bucket = v.bucketTag as BucketTag;
      if (stats[bucket]) {
        stats[bucket].count++;
        stats[bucket].pos += v.openPOCount;
        stats[bucket].volume += v.totalVolumeUnits;
        stats[bucket].atRisk += v.atRiskDollar;
        v.riskDrivers.forEach(d => {
          if (!stats[bucket].drivers.includes(d)) stats[bucket].drivers.push(d);
        });
      }
    });

    Object.keys(stats).forEach(key => {
      stats[key as BucketTag].drivers = stats[key as BucketTag].drivers.slice(0, 2);
    });

    return stats;
  };

  const bucketStats = getBucketStats();
  const totalPOs = vendors.reduce((sum, v) => sum + v.openPOCount, 0);
  const totalVolume = vendors.reduce((sum, v) => sum + v.totalVolumeUnits, 0);
  const totalAtRisk = vendors.reduce((sum, v) => sum + v.atRiskDollar, 0);
  const onTimePerformance = Math.round((bucketStats.Flow.pos / totalPOs) * 100);

  // Attention queue: SS and AW vendors sorted by risk
  const attentionQueue = vendors
    .filter(v => v.bucketTag === 'SS' || v.bucketTag === 'AW')
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 10);

  // Early warning signals
  const earlyWarnings = [
    { type: 'Fabric Delay', count: 3, severity: 'critical' },
    { type: 'QC Hold', count: 2, severity: 'warning' },
    { type: 'Sewing Behind', count: 4, severity: 'warning' },
    { type: 'Capacity Issue', count: 1, severity: 'info' },
    { type: 'Inspection Backlog', count: 2, severity: 'critical' }
  ];

  // Helper to add activity log entry
  const addActivityLog = (icon: string, message: string, vendor?: string, type: 'info' | 'action' | 'success' = 'info') => {
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setActivityLog(prev => [...prev, { time, icon, message, vendor, type }]);
  };

  // Autopilot workflow effect
  useEffect(() => {
    if (isAutopilotRunning && autopilotStep < autopilotSteps.length - 1) {
      const currentStepConfig = autopilotSteps[autopilotStep + 1];
      
      autopilotRef.current = setTimeout(() => {
        const nextStep = autopilotStep + 1;
        setAutopilotStep(nextStep);

        if (nextStep === 0) {
          addActivityLog('database', `Connecting to dispatch database...`, undefined, 'info');
          setTimeout(() => {
            addActivityLog('search', `Found ${attentionQueue.length} vendors requiring attention`, undefined, 'info');
            attentionQueue.forEach((vendor, idx) => {
              setTimeout(() => {
                addActivityLog('alert', `Queued: ${vendor.name} (Risk: ${vendor.riskScore})`, vendor.name, 'info');
              }, idx * 200);
            });
          }, 500);
        }

        if (nextStep === 1) {
          attentionQueue.forEach((vendor, idx) => {
            setTimeout(() => {
              addActivityLog('clock', `Checking milestones for ${vendor.name}...`, vendor.name, 'action');
            }, idx * 400);
            setTimeout(() => {
              addActivityLog('chart', `${vendor.openPOCount} POs analyzed, ${vendor.riskDrivers.length} delays detected`, vendor.name, 'info');
            }, idx * 400 + 200);
          });
        }

        if (nextStep === 2) {
          attentionQueue.forEach((vendor, idx) => {
            setTimeout(() => {
              addActivityLog('lightbulb', `Risk analysis: ${vendor.name}`, vendor.name, 'action');
            }, idx * 300);
            setTimeout(() => {
              const causes = vendor.riskDrivers.slice(0, 2).join(', ') || 'Milestone delay detected';
              addActivityLog('target', `Identified: ${causes}`, vendor.name, 'info');
            }, idx * 300 + 150);
          });
        }

        if (nextStep === 3) {
          attentionQueue.forEach((vendor, idx) => {
            const bucket = vendor.bucketTag as BucketTag;
            const planType = bucketConfig[bucket]?.planType || 'Recovery Plan';
            setTimeout(() => {
              addActivityLog('file', `Generating ${planType} for ${vendor.name}...`, vendor.name, 'action');
            }, idx * 350);
            setTimeout(() => {
              addActivityLog('checklist', `Plan ready: interventions queued`, vendor.name, 'success');
            }, idx * 350 + 200);
          });
        }

        if (nextStep === 4) {
          attentionQueue.forEach((vendor, idx) => {
            setTimeout(() => {
              addActivityLog('shield', `Auto-approved plan for ${vendor.name}`, vendor.name, 'success');
            }, idx * 250);
          });
          
          setTimeout(() => {
            addActivityLog('check', `All ${attentionQueue.length} plans approved`, undefined, 'success');
          }, attentionQueue.length * 250 + 100);
        }

        if (nextStep === 5) {
          attentionQueue.forEach((vendor, idx) => {
            setTimeout(() => {
              addActivityLog('play', `Dispatching nudge for ${vendor.name}...`, vendor.name, 'action');
            }, idx * 400);
            setTimeout(() => {
              addActivityLog('mail', `Notifying owner: ${vendor.owner}`, vendor.name, 'info');
            }, idx * 400 + 150);
            setTimeout(() => {
              addActivityLog('check', `${vendor.name} remediation initiated`, vendor.name, 'success');
              setProcessedVendors(prev => [...prev, vendor.id]);
            }, idx * 400 + 300);
          });
        }

        if (nextStep === autopilotSteps.length - 1) {
          setTimeout(() => {
            addActivityLog('trophy', `Workflow complete! Processed ${attentionQueue.length} vendors`, undefined, 'success');
            setIsAutopilotRunning(false);
            setAutopilotComplete(true);
          }, 500);
        }
      }, currentStepConfig?.duration || 1500);

      return () => {
        if (autopilotRef.current) {
          clearTimeout(autopilotRef.current);
        }
      };
    }
  }, [isAutopilotRunning, autopilotStep, attentionQueue]);

  // Auto-scroll activity log
  useEffect(() => {
    if (activityScrollRef.current) {
      activityScrollRef.current.scrollTop = activityScrollRef.current.scrollHeight;
    }
  }, [activityLog]);

  const startAutopilot = () => {
    setIsAutopilotRunning(true);
    setAutopilotStep(0);
    setAutopilotComplete(false);
    setProcessedVendors([]);
    setActivityLog([]);
    addActivityLog('rocket', 'Autopilot initiated - starting dispatch readiness workflow', undefined, 'action');
  };

  const stopAutopilot = () => {
    if (autopilotRef.current) {
      clearTimeout(autopilotRef.current);
    }
    setIsAutopilotRunning(false);
  };

  const autopilotProgress = autopilotStep >= 0 
    ? ((autopilotStep + 1) / autopilotSteps.length) * 100 
    : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dispatch Readiness Home</h1>
          <p className="text-sm text-muted-foreground">Portfolio-level manufacturing & dispatch readiness</p>
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
            <span>Last refresh: {formatDate(settings.lastRefresh)}</span>
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
            <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-3 border-b border-border/50">
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

            {/* Real-time Activity Log - show during running */}
            {isAutopilotRunning && (
              <div className="bg-background/50 rounded-lg border border-border/50 overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 bg-muted/30 border-b border-border/50">
                  <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                    <FileText className="w-3.5 h-3.5 text-primary" />
                    Live Activity Feed
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    {activityLog.length} events
                  </Badge>
                </div>
                <ScrollArea className="h-[180px]" ref={activityScrollRef}>
                  <div className="p-2 space-y-1">
                    {activityLog.length === 0 ? (
                      <div className="flex items-center justify-center h-32 text-xs text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Initializing...
                      </div>
                    ) : (
                      activityLog.map((entry, i) => (
                        <div 
                          key={i} 
                          className={cn(
                            "flex items-start gap-2 px-2 py-1.5 rounded text-xs transition-all",
                            entry.type === 'action' && "bg-primary/5",
                            entry.type === 'success' && "bg-status-success/5",
                            i === activityLog.length - 1 && "animate-pulse"
                          )}
                        >
                          <span className="text-muted-foreground font-mono w-16 flex-shrink-0">
                            {entry.time}
                          </span>
                          <span className={cn(
                            "w-5 h-5 rounded flex items-center justify-center flex-shrink-0",
                            entry.type === 'action' && "bg-primary/10 text-primary",
                            entry.type === 'success' && "bg-status-success/10 text-status-success",
                            entry.type === 'info' && "bg-muted text-muted-foreground"
                          )}>
                            {entry.icon === 'database' && <Database className="w-3 h-3" />}
                            {entry.icon === 'search' && <Search className="w-3 h-3" />}
                            {entry.icon === 'alert' && <AlertCircle className="w-3 h-3" />}
                            {entry.icon === 'clock' && <Clock className="w-3 h-3" />}
                            {entry.icon === 'chart' && <TrendingUp className="w-3 h-3" />}
                            {entry.icon === 'lightbulb' && <Zap className="w-3 h-3" />}
                            {entry.icon === 'target' && <AlertTriangle className="w-3 h-3" />}
                            {entry.icon === 'file' && <FileText className="w-3 h-3" />}
                            {entry.icon === 'checklist' && <CheckCircle2 className="w-3 h-3" />}
                            {entry.icon === 'shield' && <ShieldCheck className="w-3 h-3" />}
                            {entry.icon === 'check' && <CheckCircle2 className="w-3 h-3" />}
                            {entry.icon === 'play' && <Play className="w-3 h-3" />}
                            {entry.icon === 'mail' && <Send className="w-3 h-3" />}
                            {entry.icon === 'trophy' && <CheckCircle2 className="w-3 h-3" />}
                            {entry.icon === 'rocket' && <Zap className="w-3 h-3" />}
                          </span>
                          <span className="flex-1 text-foreground">
                            {entry.message}
                          </span>
                          {entry.vendor && (
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                              {entry.vendor.split(' ')[0]}
                            </Badge>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Completion Summary - show after complete */}
            {autopilotComplete && (
              <div className="space-y-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-status-success/10 border border-status-success/20 text-center">
                    <p className="text-2xl font-bold text-status-success">{processedVendors.length}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Vendors Processed</p>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-center">
                    <p className="text-2xl font-bold text-primary">{processedVendors.length}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Plans Approved</p>
                  </div>
                  <div className="p-3 rounded-lg bg-status-info/10 border border-status-info/20 text-center">
                    <p className="text-2xl font-bold text-status-info">{processedVendors.length * 3}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Tasks Dispatched</p>
                  </div>
                  <div className="p-3 rounded-lg bg-status-warning/10 border border-status-warning/20 text-center">
                    <p className="text-2xl font-bold text-status-warning">{processedVendors.length}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Nudges Sent</p>
                  </div>
                </div>

                {/* Processed Vendors List */}
                <div className="bg-background/50 rounded-lg border border-border/50 overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 bg-muted/30 border-b border-border/50">
                    <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
                      Vendors Remediated
                    </div>
                  </div>
                  <div className="p-3 space-y-2">
                    {attentionQueue.map((vendor) => {
                      const bucket = vendor.bucketTag as BucketTag;
                      return (
                        <div key={vendor.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-4 h-4 text-status-success" />
                            <div>
                              <p className="text-sm font-medium text-foreground">{vendor.name}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {bucketConfig[bucket]?.planType || 'Recovery Plan'} • {vendor.openPOCount} POs • Owner notified
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-status-success/10 text-status-success border-status-success/20 text-[10px]">
                              Remediation Active
                            </Badge>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-7 text-xs"
                              onClick={() => navigate(`/dispatch/vendor/${vendor.id}`)}
                            >
                              View
                              <ChevronRight className="w-3 h-3 ml-1" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Portfolio KPIs */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="card-elevated">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">On-Time Rate</p>
                <p className="text-3xl font-bold text-status-success">{onTimePerformance}%</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-status-success/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-status-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">POs In Flight</p>
                <p className="text-3xl font-bold text-foreground">{totalPOs}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Volume</p>
                <p className="text-3xl font-bold text-foreground">{(totalVolume / 1000).toFixed(0)}K</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-status-info/10 flex items-center justify-center">
                <Factory className="w-6 h-6 text-status-info" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated border-status-danger/30">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">$ At Risk</p>
                <p className="text-3xl font-bold text-status-danger">{formatCurrency(totalAtRisk)}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-status-danger/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-status-danger" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Vendors</p>
                <p className="text-3xl font-bold text-foreground">{vendors.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                <Users className="w-6 h-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bucket Cards */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Readiness Buckets</h2>
        <div className="grid grid-cols-3 gap-4">
          {(['SS', 'AW', 'Flow'] as BucketTag[]).map((bucket) => {
            const config = bucketConfig[bucket];
            const stats = bucketStats[bucket];

            return (
              <Card 
                key={bucket}
                className={cn(
                  "card-elevated cursor-pointer hover:shadow-md transition-all border",
                  config.bgColor
                )}
                onClick={() => navigate(`/dispatch/bucket/${bucket.toLowerCase()}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className={cn("flex items-center gap-2", config.color)}>
                      {config.icon}
                      <div>
                        <CardTitle className="text-sm font-semibold">{config.fullLabel}</CardTitle>
                        <p className="text-[10px] text-muted-foreground font-normal">{config.description}</p>
                      </div>
                    </div>
                    <ChevronRight className={cn("w-4 h-4", config.color)} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stats.count}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">Vendors</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stats.pos}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">POs</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{(stats.volume / 1000).toFixed(0)}K</p>
                      <p className="text-[10px] text-muted-foreground uppercase">Units</p>
                    </div>
                    <div>
                      <p className={cn("text-2xl font-bold", bucket !== 'Flow' ? 'text-status-danger' : 'text-foreground')}>
                        {formatCurrency(stats.atRisk)}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase">At Risk</p>
                    </div>
                  </div>
                  {stats.drivers.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {stats.drivers.map((driver, i) => (
                        <Badge key={i} variant="secondary" className="text-[9px] px-1.5 py-0">
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

      <div className="grid grid-cols-3 gap-6">
        {/* Attention Queue */}
        <div className="col-span-2">
          <Card className="card-elevated">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-status-danger" />
                <CardTitle className="text-lg">Today's Attention Queue</CardTitle>
                <Badge variant="destructive" className="text-xs">{attentionQueue.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[160px]">Vendor</TableHead>
                    <TableHead className="w-[60px]">Bucket</TableHead>
                    <TableHead className="w-[60px] text-right">Risk</TableHead>
                    <TableHead className="w-[50px] text-right">POs</TableHead>
                    <TableHead className="w-[80px] text-right">$ At Risk</TableHead>
                    <TableHead>Top Risk Driver</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attentionQueue.map((vendor) => (
                    <TableRow key={vendor.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{vendor.name}</p>
                          <p className="text-[10px] text-muted-foreground">{vendor.factoryLocation}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={cn(
                            "text-[10px]",
                            vendor.bucketTag === 'SS' ? "bg-status-danger text-white" : "bg-status-warning text-white"
                          )}
                        >
                          {vendor.bucketTag}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={cn(
                          "font-mono font-semibold text-sm",
                          vendor.riskScore >= 70 ? "text-status-danger" : "text-status-warning"
                        )}>
                          {vendor.riskScore}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">{vendor.openPOCount}</TableCell>
                      <TableCell className="text-right font-mono text-sm text-status-danger">
                        {formatCurrency(vendor.atRiskDollar)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {vendor.riskDrivers[0] || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          className="h-7 text-xs"
                          onClick={() => navigate(`/dispatch/vendor/${vendor.id}`)}
                        >
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Early Warning Signals */}
        <div>
          <Card className="card-elevated">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-status-warning" />
                <CardTitle className="text-lg">Early Warning Signals</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {earlyWarnings.map((warning, i) => (
                <div 
                  key={i}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors",
                    warning.severity === 'critical' && "bg-status-danger/5 border-status-danger/20",
                    warning.severity === 'warning' && "bg-status-warning/5 border-status-warning/20",
                    warning.severity === 'info' && "bg-muted/50 border-border"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      warning.severity === 'critical' && "bg-status-danger/10",
                      warning.severity === 'warning' && "bg-status-warning/10",
                      warning.severity === 'info' && "bg-muted"
                    )}>
                      {warning.severity === 'critical' ? (
                        <XCircle className="w-4 h-4 text-status-danger" />
                      ) : warning.severity === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-status-warning" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <span className="text-sm font-medium">{warning.type}</span>
                  </div>
                  <Badge 
                    className={cn(
                      "text-xs",
                      warning.severity === 'critical' && "bg-status-danger",
                      warning.severity === 'warning' && "bg-status-warning",
                      warning.severity === 'info' && "bg-muted text-muted-foreground"
                    )}
                  >
                    {warning.count} POs
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};