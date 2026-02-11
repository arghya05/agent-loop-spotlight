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
  Package,
  Factory
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
                Define risk score ranges for On Track, Watchlist, and Slipping buckets
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
                  { bucket: 'On Track', key: 'flow', days: reviewFrequency.flow, color: 'text-status-success', description: 'Low-risk POs on track' },
                  { bucket: 'Watchlist', key: 'aw', days: reviewFrequency.aw, color: 'text-status-warning', description: 'Early warning signals' },
                  { bucket: 'Slipping', key: 'ss', days: reviewFrequency.ss, color: 'text-status-danger', description: 'High risk of delay' }
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

// Onboarding Settings
const OnboardingSettings = () => {
  const [hasChanges, setHasChanges] = useState(false);
  const onbSettings = require('@/data/onboarding/settings.json');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Factory className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Onboarding Settings</h1>
          </div>
          <p className="text-sm text-muted-foreground">Risk scoring, document requirements, and approval gate configuration</p>
        </div>
        {hasChanges && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setHasChanges(false)}><RotateCcw className="w-4 h-4 mr-2" />Reset</Button>
            <Button onClick={() => setHasChanges(false)}><Save className="w-4 h-4 mr-2" />Save Changes</Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="risk" className="space-y-6">
        <TabsList>
          <TabsTrigger value="risk">Risk Scoring</TabsTrigger>
          <TabsTrigger value="docs">Mandatory Documents</TabsTrigger>
          <TabsTrigger value="screening">External Screening</TabsTrigger>
          <TabsTrigger value="approvals">Approval Gates</TabsTrigger>
        </TabsList>

        <TabsContent value="risk" className="space-y-6">
          <Card className="card-elevated">
            <CardHeader><CardTitle className="text-sm font-semibold flex items-center gap-2"><Target className="w-4 h-4" />Bucket Thresholds</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                {[
                  { label: 'Fast Track', desc: 'Auto-approvable, low risk', threshold: '≤ 25', color: 'text-status-success border-status-success/30' },
                  { label: 'Needs Review', desc: 'Requires human approval', threshold: '26–69', color: 'text-status-warning border-status-warning/30' },
                  { label: 'Blocked', desc: 'Critical failures', threshold: '≥ 70 or hard rule', color: 'text-status-danger border-status-danger/30' },
                ].map((b) => (
                  <div key={b.label} className={`p-4 rounded-lg border-2 ${b.color.split(' ')[1]}`}>
                    <p className={`font-semibold mb-1 ${b.color.split(' ')[0]}`}>{b.label}</p>
                    <p className="text-xs text-muted-foreground mb-3">{b.desc}</p>
                    <Input value={b.threshold} className="text-center font-mono" onChange={() => setHasChanges(true)} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardHeader><CardTitle className="text-sm font-semibold flex items-center gap-2"><Scale className="w-4 h-4" />Scoring Weights</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Document Completeness', weight: 30 },
                { label: 'External Screening (Sanctions/ESG)', weight: 25 },
                { label: 'Financial Health', weight: 20 },
                { label: 'Adverse Media', weight: 15 },
                { label: 'Compliance History', weight: 10 },
              ].map((w) => (
                <div key={w.label} className="flex items-center justify-between">
                  <span className="text-sm">{w.label}</span>
                  <div className="flex items-center gap-2">
                    <Slider value={[w.weight]} max={100} step={5} className="w-32" onValueChange={() => setHasChanges(true)} />
                    <span className="text-sm font-mono w-10 text-right">{w.weight}%</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs" className="space-y-6">
          <Card className="card-elevated">
            <CardHeader><CardTitle className="text-sm font-semibold">Required Documents by Category</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {['W-8/W-9 Tax Form', 'Factory License', 'ESG Policy Statement', 'Insurance Certificate', 'Bank Details / ACH Form', 'MSME Certificate', 'Quality Certifications (ISO 9001)'].map((doc) => (
                <div key={doc} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm">{doc}</span>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-[10px]">Mandatory</Badge>
                    <Switch defaultChecked onCheckedChange={() => setHasChanges(true)} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="screening" className="space-y-6">
          <Card className="card-elevated">
            <CardHeader><CardTitle className="text-sm font-semibold">External Screening Sources</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: 'Sanctions List Screening', enabled: true, desc: 'OFAC, EU, UN sanctions lists' },
                { name: 'Adverse Media Monitoring', enabled: true, desc: 'News and media screening' },
                { name: 'ESG Risk Assessment', enabled: true, desc: 'Environmental, social, governance' },
                { name: 'Litigation History', enabled: false, desc: 'Court records and legal filings' },
              ].map((s) => (
                <div key={s.name} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div>
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                  </div>
                  <Switch defaultChecked={s.enabled} onCheckedChange={() => setHasChanges(true)} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals" className="space-y-6">
          <Card className="card-elevated">
            <CardHeader><CardTitle className="text-sm font-semibold">Approval Gate Rules</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { rule: 'Auto-approve Fast Track suppliers', enabled: true },
                { rule: 'Block on sanctions hit (hard rule)', enabled: true },
                { rule: 'Require Procurement sign-off above risk score 50', enabled: true },
                { rule: 'Require Compliance Lead for Blocked suppliers', enabled: true },
                { rule: 'Enable continuous monitoring post-activation', enabled: true },
              ].map((r) => (
                <div key={r.rule} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm">{r.rule}</span>
                  <Switch defaultChecked={r.enabled} onCheckedChange={() => setHasChanges(true)} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Invoice & Cash Ops Settings
const InvoiceSettings = () => {
  const [hasChanges, setHasChanges] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <SettingsIcon className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Invoice & Cash Ops Settings</h1>
          </div>
          <p className="text-sm text-muted-foreground">Matching tolerances, dispute rules, approval gates, and cash optimization</p>
        </div>
        {hasChanges && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setHasChanges(false)}><RotateCcw className="w-4 h-4 mr-2" />Reset</Button>
            <Button onClick={() => setHasChanges(false)}><Save className="w-4 h-4 mr-2" />Save Changes</Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="matching" className="space-y-6">
        <TabsList>
          <TabsTrigger value="matching">Matching Rules</TabsTrigger>
          <TabsTrigger value="disputes">Dispute Automation</TabsTrigger>
          <TabsTrigger value="approvals">Approval Gates</TabsTrigger>
          <TabsTrigger value="cash">Cash Optimization</TabsTrigger>
          <TabsTrigger value="fraud">Fraud / Duplicates</TabsTrigger>
        </TabsList>

        <TabsContent value="matching" className="space-y-6">
          <Card className="card-elevated">
            <CardHeader><CardTitle className="text-sm font-semibold flex items-center gap-2"><Target className="w-4 h-4" />Matching Tolerances</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { label: 'Price Tolerance', value: '5%', desc: 'Max price variance before flagging' },
                  { label: 'Quantity Tolerance', value: '2%', desc: 'Max qty variance before flagging' },
                  { label: 'Tax Tolerance', value: '1%', desc: 'Max tax variance' },
                  { label: 'Freight Tolerance', value: '10%', desc: 'Max freight variance' },
                ].map((t) => (
                  <div key={t.label} className="p-4 rounded-lg border border-border">
                    <Label className="text-sm font-medium">{t.label}</Label>
                    <p className="text-xs text-muted-foreground mb-2">{t.desc}</p>
                    <Input value={t.value} className="text-center font-mono" onChange={() => setHasChanges(true)} />
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="text-sm font-medium">Match Policy</p>
                  <p className="text-xs text-muted-foreground">Default matching strategy</p>
                </div>
                <select className="text-sm border border-border rounded px-3 py-1.5 bg-background" onChange={() => setHasChanges(true)}>
                  <option>3-way match (PO + GRN + Contract)</option>
                  <option>2-way match (PO + Invoice)</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="disputes" className="space-y-6">
          <Card className="card-elevated">
            <CardHeader><CardTitle className="text-sm font-semibold">Dispute Automation Rules</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Auto-open dispute above variance', value: '$5,000' },
                { label: 'Escalation after (days)', value: '5' },
                { label: 'Max negotiation rounds', value: '3' },
              ].map((r) => (
                <div key={r.label} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <span className="text-sm">{r.label}</span>
                  <Input value={r.value} className="w-24 text-center font-mono" onChange={() => setHasChanges(true)} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals" className="space-y-6">
          <Card className="card-elevated">
            <CardHeader><CardTitle className="text-sm font-semibold">Approval Thresholds</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Auto-pay max amount', value: '$50,000', role: 'System' },
                { label: 'Settlement approval threshold', value: '$10,000', role: 'Finance Manager' },
                { label: 'Write-off approval threshold', value: '$5,000', role: 'Controller' },
              ].map((a) => (
                <div key={a.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <span className="text-sm font-medium">{a.label}</span>
                    <p className="text-xs text-muted-foreground">Requires: {a.role}</p>
                  </div>
                  <Input value={a.value} className="w-28 text-center font-mono" onChange={() => setHasChanges(true)} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cash" className="space-y-6">
          <Card className="card-elevated">
            <CardHeader><CardTitle className="text-sm font-semibold">Cash Optimization Rules</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Min savings threshold', value: '$500' },
                { label: 'Cash constraint band', value: 'Moderate' },
              ].map((c) => (
                <div key={c.label} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <span className="text-sm">{c.label}</span>
                  <Input value={c.value} className="w-28 text-center font-mono" onChange={() => setHasChanges(true)} />
                </div>
              ))}
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm font-medium mb-2">Preferred Suppliers (for early-pay)</p>
                <div className="flex flex-wrap gap-2">
                  {['Pacific Textiles Ltd', 'Apex Chemical Supply'].map((s) => (
                    <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fraud" className="space-y-6">
          <Card className="card-elevated">
            <CardHeader><CardTitle className="text-sm font-semibold">Fraud & Duplicate Detection</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { rule: 'Duplicate invoice detection', enabled: true },
                { rule: 'Auto-hold sanctioned suppliers', enabled: true },
                { rule: 'Flag invoices without PO match', enabled: true },
              ].map((f) => (
                <div key={f.rule} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm">{f.rule}</span>
                  <Switch defaultChecked={f.enabled} onCheckedChange={() => setHasChanges(true)} />
                </div>
              ))}
              <div className="p-3 rounded-lg border border-border">
                <p className="text-sm font-medium mb-2">Blacklisted Suppliers</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="destructive" className="text-xs">Riverside Polymers LLC</Badge>
                </div>
              </div>
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
  if (agentContext === 'supplier-onboarding') {
    return <OnboardingSettings />;
  }
  if (agentContext === 'invoice-cash-ops') {
    return <InvoiceSettings />;
  }
  
  return <SupplierPerformanceSettings />;
};
