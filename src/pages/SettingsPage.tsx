import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGovernanceStore } from '@/store/governanceStore';
import { useAppStore } from '@/store/appStore';
import { useAgentContext, getAgentLabel } from '@/hooks/useAgentContext';
import { 
  Settings as SettingsIcon,
  Scale,
  Target,
  Calendar,
  Save,
  RotateCcw,
  AlertCircle,
  Truck,
  TrendingUp,
  CheckCircle2,
  Clock,
  Package
} from 'lucide-react';
import dispatchSettings from '@/data/dispatch/settings.json';

// Dispatch-specific settings component
const DispatchSettings = () => {
  const [bucketThresholds, setBucketThresholds] = useState(dispatchSettings.bucketThresholds);
  const [reviewFrequency, setReviewFrequency] = useState(dispatchSettings.reviewFrequency);
  const [notificationRules, setNotificationRules] = useState(dispatchSettings.notificationRules);
  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = () => {
    setHasChanges(false);
    // In real app, would persist to backend
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Truck className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Dispatch Readiness Settings</h1>
          </div>
          <p className="text-sm text-muted-foreground">Configure bucket thresholds, milestone tracking, and SLA rules</p>
        </div>
        {hasChanges && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setHasChanges(false)}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="buckets" className="space-y-6">
        <TabsList>
          <TabsTrigger value="buckets">Bucket Thresholds</TabsTrigger>
          <TabsTrigger value="milestones">Milestone Model</TabsTrigger>
          <TabsTrigger value="frequency">Review Frequency</TabsTrigger>
          <TabsTrigger value="notifications">Notification & SLA</TabsTrigger>
        </TabsList>

        <TabsContent value="buckets" className="space-y-6">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Target className="w-4 h-4" />
                Dispatch Readiness Bucket Configuration
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Define risk score ranges for Flow, AW (Watchlist), and SS (Slipping Schedule) buckets
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-6">
                {/* Flow Bucket */}
                <div className="p-4 rounded-lg border-2 border-status-success/30 bg-status-success/5">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-5 h-5 text-status-success" />
                    <div>
                      <p className="font-semibold text-status-success">{bucketThresholds.flow.label}</p>
                      <p className="text-xs text-muted-foreground">{bucketThresholds.flow.description}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Max Risk Score</Label>
                      <Input
                        type="number"
                        value={bucketThresholds.flow.maxRiskScore}
                        onChange={(e) => {
                          setBucketThresholds({
                            ...bucketThresholds,
                            flow: { ...bucketThresholds.flow, maxRiskScore: parseInt(e.target.value) || 0 }
                          });
                          setHasChanges(true);
                        }}
                        className="text-center text-lg font-mono mt-1"
                      />
                    </div>
                    <p className="text-xs text-center text-muted-foreground">Score ≤ {bucketThresholds.flow.maxRiskScore}</p>
                  </div>
                </div>

                {/* AW Bucket */}
                <div className="p-4 rounded-lg border-2 border-status-warning/30 bg-status-warning/5">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-status-warning" />
                    <div>
                      <p className="font-semibold text-status-warning">{bucketThresholds.aw.label}</p>
                      <p className="text-xs text-muted-foreground">{bucketThresholds.aw.description}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-muted-foreground">Min Score</Label>
                        <Input
                          type="number"
                          value={bucketThresholds.aw.minRiskScore}
                          onChange={(e) => {
                            setBucketThresholds({
                              ...bucketThresholds,
                              aw: { ...bucketThresholds.aw, minRiskScore: parseInt(e.target.value) || 0 }
                            });
                            setHasChanges(true);
                          }}
                          className="text-center font-mono mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Max Score</Label>
                        <Input
                          type="number"
                          value={bucketThresholds.aw.maxRiskScore}
                          onChange={(e) => {
                            setBucketThresholds({
                              ...bucketThresholds,
                              aw: { ...bucketThresholds.aw, maxRiskScore: parseInt(e.target.value) || 0 }
                            });
                            setHasChanges(true);
                          }}
                          className="text-center font-mono mt-1"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-center text-muted-foreground">
                      Score {bucketThresholds.aw.minRiskScore} – {bucketThresholds.aw.maxRiskScore}
                    </p>
                  </div>
                </div>

                {/* SS Bucket */}
                <div className="p-4 rounded-lg border-2 border-status-danger/30 bg-status-danger/5">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-status-danger" />
                    <div>
                      <p className="font-semibold text-status-danger">{bucketThresholds.ss.label}</p>
                      <p className="text-xs text-muted-foreground">{bucketThresholds.ss.description}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Min Risk Score</Label>
                      <Input
                        type="number"
                        value={bucketThresholds.ss.minRiskScore}
                        onChange={(e) => {
                          setBucketThresholds({
                            ...bucketThresholds,
                            ss: { ...bucketThresholds.ss, minRiskScore: parseInt(e.target.value) || 0 }
                          });
                          setHasChanges(true);
                        }}
                        className="text-center text-lg font-mono mt-1"
                      />
                    </div>
                    <p className="text-xs text-center text-muted-foreground">Score ≥ {bucketThresholds.ss.minRiskScore}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Critical Milestones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dispatchSettings.criticalMilestones.map((milestone, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {idx + 1}
                      </div>
                      <span className="text-sm font-medium">{milestone}</span>
                    </div>
                    <Badge variant="secondary">Critical</Badge>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground pt-2">
                  Missing any critical milestone triggers immediate bucket escalation
                </p>
              </CardContent>
            </Card>

            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Default Lead Times (Days)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(dispatchSettings.defaultLeadTimes).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-2 rounded-lg">
                    <span className="text-sm text-muted-foreground capitalize">
                      {key.replace(/([A-Z])/g, ' → $1').replace('To', '→')}
                    </span>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={value}
                        className="w-16 h-8 text-center text-sm font-mono"
                        onChange={() => setHasChanges(true)}
                      />
                      <span className="text-xs text-muted-foreground">days</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="frequency" className="space-y-6">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Review Frequency by Bucket
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                {[
                  { bucket: 'Flow', key: 'flow', days: reviewFrequency.flow, color: 'text-status-success', description: 'Low-risk POs on track' },
                  { bucket: 'AW (Watchlist)', key: 'aw', days: reviewFrequency.aw, color: 'text-status-warning', description: 'Early warning signals' },
                  { bucket: 'SS (Slipping)', key: 'ss', days: reviewFrequency.ss, color: 'text-status-danger', description: 'High risk of delay' }
                ].map(({ bucket, key, days, color, description }) => (
                  <div key={bucket} className="p-4 rounded-lg border border-border text-center">
                    <p className={`text-sm font-semibold ${color} mb-1`}>{bucket}</p>
                    <p className="text-xs text-muted-foreground mb-3">{description}</p>
                    <Input
                      type="number"
                      value={days}
                      onChange={(e) => {
                        setReviewFrequency({ ...reviewFrequency, [key]: parseInt(e.target.value) || 0 });
                        setHasChanges(true);
                      }}
                      className="w-20 mx-auto text-center text-2xl font-bold"
                    />
                    <p className="text-xs text-muted-foreground mt-2">days</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">SLA & Notification Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border border-border">
                  <Label className="text-xs text-muted-foreground">Milestone Delay Threshold</Label>
                  <p className="text-sm text-muted-foreground mt-1 mb-2">
                    Days late before triggering alert
                  </p>
                  <Input
                    type="number"
                    value={notificationRules.milestoneDelayThreshold}
                    onChange={(e) => {
                      setNotificationRules({ ...notificationRules, milestoneDelayThreshold: parseInt(e.target.value) || 0 });
                      setHasChanges(true);
                    }}
                    className="text-center text-lg font-mono"
                  />
                </div>
                <div className="p-4 rounded-lg border border-border">
                  <Label className="text-xs text-muted-foreground">Escalation After</Label>
                  <p className="text-sm text-muted-foreground mt-1 mb-2">
                    Days without response before escalating
                  </p>
                  <Input
                    type="number"
                    value={notificationRules.escalationAfterDays}
                    onChange={(e) => {
                      setNotificationRules({ ...notificationRules, escalationAfterDays: parseInt(e.target.value) || 0 });
                      setHasChanges(true);
                    }}
                    className="text-center text-lg font-mono"
                  />
                </div>
                <div className="p-4 rounded-lg border border-border">
                  <Label className="text-xs text-muted-foreground">Supplier Response SLA</Label>
                  <p className="text-sm text-muted-foreground mt-1 mb-2">
                    Hours for supplier to respond
                  </p>
                  <Input
                    type="number"
                    value={notificationRules.supplierResponseSLA}
                    onChange={(e) => {
                      setNotificationRules({ ...notificationRules, supplierResponseSLA: parseInt(e.target.value) || 0 });
                      setHasChanges(true);
                    }}
                    className="text-center text-lg font-mono"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Supplier Performance settings component (original)
const SupplierPerformanceSettings = () => {
  const { scoringSettings, updateScoringSettings, vendors, policyControls, updatePolicyControl } = useGovernanceStore();
  const { addAuditEntry, currentRole } = useAppStore();
  
  const [weights, setWeights] = useState(scoringSettings.weights);
  const [thresholds, setThresholds] = useState(scoringSettings.thresholds);
  const [hasChanges, setHasChanges] = useState(false);

  const handleWeightChange = (key: keyof typeof weights, value: number) => {
    const newWeights = { ...weights, [key]: value / 100 };
    setWeights(newWeights);
    setHasChanges(true);
  };

  const handleThresholdChange = (key: keyof typeof thresholds, value: number) => {
    const newThresholds = { ...thresholds, [key]: value };
    setThresholds(newThresholds);
    setHasChanges(true);
  };

  const handleSave = () => {
    updateScoringSettings({ weights, thresholds });
    addAuditEntry({
      timestamp: new Date().toISOString(),
      actor: currentRole === 'ops_manager' ? 'Ops Manager' : 'Category Head',
      role: currentRole,
      decision: 'Scoring settings updated',
      toolsUsed: ['settings_editor'],
      details: `Updated weights and thresholds. OTIF: ${weights.otif}, Fill: ${weights.fillRate}, Quality: ${weights.quality}, Compliance: ${weights.compliance}`
    });
    setHasChanges(false);
  };

  const handleReset = () => {
    setWeights(scoringSettings.weights);
    setThresholds(scoringSettings.thresholds);
    setHasChanges(false);
  };

  // Calculate preview distribution
  const getDistribution = () => {
    const buckets = { good: 0, average: 0, needs_review: 0, critical: 0 };
    vendors.forEach(v => {
      const score = 
        v.metrics.otif.current * weights.otif +
        v.metrics.fillRate.current * weights.fillRate +
        v.metrics.quality.current * weights.quality +
        (100 - v.metrics.compliance.current * 10) * weights.compliance;
      
      if (score >= thresholds.good) buckets.good++;
      else if (score >= thresholds.average) buckets.average++;
      else if (score >= thresholds.needsReview) buckets.needs_review++;
      else buckets.critical++;
    });
    return buckets;
  };

  const distribution = getDistribution();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Supplier Performance Settings</h1>
          </div>
          <p className="text-sm text-muted-foreground">Governance configuration and scoring rules</p>
        </div>
        {hasChanges && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="scoring" className="space-y-6">
        <TabsList>
          <TabsTrigger value="scoring">Scoring & Weights</TabsTrigger>
          <TabsTrigger value="thresholds">Bucket Thresholds</TabsTrigger>
          <TabsTrigger value="frequency">Review Frequency</TabsTrigger>
          <TabsTrigger value="policies">Policy Controls</TabsTrigger>
        </TabsList>

        <TabsContent value="scoring" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Scale className="w-4 h-4" />
                  Metric Weights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { key: 'otif', label: 'OTIF', description: 'On-Time In-Full delivery rate' },
                  { key: 'fillRate', label: 'Fill Rate', description: 'Order fulfillment percentage' },
                  { key: 'quality', label: 'Quality', description: 'Product quality score' },
                  { key: 'compliance', label: 'Compliance', description: 'Regulatory compliance (inverted)' }
                ].map(({ key, label, description }) => (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">{label}</Label>
                        <p className="text-xs text-muted-foreground">{description}</p>
                      </div>
                      <span className="text-lg font-mono font-bold">
                        {(weights[key as keyof typeof weights] * 100).toFixed(0)}%
                      </span>
                    </div>
                    <Slider
                      value={[weights[key as keyof typeof weights] * 100]}
                      onValueChange={([v]) => handleWeightChange(key as keyof typeof weights, v)}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>
                ))}

                <Separator />

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm font-medium">Total Weight</span>
                  <span className={`text-lg font-mono font-bold ${
                    Math.abs(Object.values(weights).reduce((a, b) => a + b, 0) - 1) < 0.01 
                      ? 'text-status-success' 
                      : 'text-status-danger'
                  }`}>
                    {(Object.values(weights).reduce((a, b) => a + b, 0) * 100).toFixed(0)}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Live Preview Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  Shows how vendors would be distributed with current settings
                </p>
                
                {[
                  { key: 'good', label: 'Good Performers', color: 'bg-status-success' },
                  { key: 'average', label: 'Average', color: 'bg-status-warning' },
                  { key: 'needs_review', label: 'Needs Review', color: 'bg-orange-500' },
                  { key: 'critical', label: 'Critical', color: 'bg-status-danger' }
                ].map(({ key, label, color }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${color}`} />
                      <span className="text-sm">{label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${color}`}
                          style={{ width: `${(distribution[key as keyof typeof distribution] / vendors.length) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-mono w-8 text-right">
                        {distribution[key as keyof typeof distribution]}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="thresholds" className="space-y-6">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Bucket Threshold Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                {[
                  { key: 'good', label: 'Good Performers', description: 'Minimum score for Good bucket', color: 'text-status-success' },
                  { key: 'average', label: 'Average', description: 'Minimum score for Average bucket', color: 'text-status-warning' },
                  { key: 'needsReview', label: 'Needs Review', description: 'Minimum score for Needs Review', color: 'text-orange-600' },
                  { key: 'critical', label: 'Critical', description: 'Below this is Critical', color: 'text-status-danger' }
                ].map(({ key, label, description, color }) => (
                  <div key={key} className="p-4 rounded-lg border border-border">
                    <Label className={`text-sm font-medium ${color}`}>{label}</Label>
                    <p className="text-xs text-muted-foreground mb-3">{description}</p>
                    <Input
                      type="number"
                      value={thresholds[key as keyof typeof thresholds]}
                      onChange={(e) => handleThresholdChange(key as keyof typeof thresholds, parseInt(e.target.value) || 0)}
                      className="text-center text-lg font-mono"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="frequency" className="space-y-6">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Review Frequency by Bucket
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { bucket: 'Good Performers', days: 30, color: 'text-status-success' },
                  { bucket: 'Average', days: 14, color: 'text-status-warning' },
                  { bucket: 'Needs Review', days: 7, color: 'text-orange-600' },
                  { bucket: 'Critical', days: 3, color: 'text-status-danger' }
                ].map(({ bucket, days, color }) => (
                  <div key={bucket} className="p-4 rounded-lg border border-border text-center">
                    <p className={`text-sm font-medium ${color} mb-2`}>{bucket}</p>
                    <p className="text-3xl font-bold text-foreground">{days}</p>
                    <p className="text-xs text-muted-foreground">days</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-6">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Policy Control Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {policyControls.map((policy) => (
                <div key={policy.id} className="p-4 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Switch 
                        checked={policy.enabled}
                        onCheckedChange={(checked) => updatePolicyControl(policy.id, { enabled: checked })}
                      />
                      <div>
                        <p className="text-sm font-medium">{policy.name}</p>
                        <p className="text-xs text-muted-foreground">{policy.description}</p>
                      </div>
                    </div>
                    <Badge variant={policy.triggeredCount > 0 ? 'destructive' : 'secondary'}>
                      {policy.triggeredCount} triggered
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-3 pl-12">
                    <div>
                      <Label className="text-xs text-muted-foreground">Threshold</Label>
                      <Input 
                        type="number" 
                        value={policy.threshold}
                        onChange={(e) => updatePolicyControl(policy.id, { threshold: parseInt(e.target.value) || 0 })}
                        className="w-20 h-8 text-center"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Consecutive Days</Label>
                      <Input 
                        type="number" 
                        value={policy.consecutiveDays}
                        onChange={(e) => updatePolicyControl(policy.id, { consecutiveDays: parseInt(e.target.value) || 1 })}
                        className="w-20 h-8 text-center"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Main Settings Page that switches based on context
export const SettingsPage = () => {
  const agentContext = useAgentContext();
  
  if (agentContext === 'dispatch-readiness') {
    return <DispatchSettings />;
  }
  
  return <SupplierPerformanceSettings />;
};
