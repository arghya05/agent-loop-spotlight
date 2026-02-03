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
import { 
  Settings as SettingsIcon,
  Scale,
  Target,
  Calendar,
  Save,
  RotateCcw,
  AlertCircle
} from 'lucide-react';

export const SettingsPage = () => {
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
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
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
