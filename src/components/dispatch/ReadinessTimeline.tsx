import { useEffect, useMemo } from 'react';
import { useDispatchStore } from '@/store/dispatchStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, ReferenceLine, BarChart, Bar
} from 'recharts';
import { 
  AlertTriangle, CheckCircle, Clock, Package, 
  Scissors, Activity, Wrench, Shield, Box, Truck
} from 'lucide-react';

import posData from '@/data/dispatch/pos.json';
import milestonesData from '@/data/dispatch/milestones.json';
import materialsData from '@/data/dispatch/materials.json';
import qualityData from '@/data/dispatch/quality.json';
import capacityData from '@/data/dispatch/capacity.json';

const MILESTONE_ICONS: Record<string, React.ReactNode> = {
  'Cutting': <Scissors className="w-3 h-3" />,
  'Sewing': <Activity className="w-3 h-3" />,
  'Washing/Dyeing': <Wrench className="w-3 h-3" />,
  'Finishing': <Package className="w-3 h-3" />,
  'QA/AQL': <Shield className="w-3 h-3" />,
  'Packing': <Box className="w-3 h-3" />,
  'Ex-factory': <Truck className="w-3 h-3" />,
  'Port Gate-in': <Truck className="w-3 h-3" />,
  'DC Receiving': <CheckCircle className="w-3 h-3" />
};

const AgentStepper = () => {
  const { agentRunning, agentCompleted, currentAgentStep, agentSteps, advanceAgentStep, completeAgentRun } = useDispatchStore();
  
  useEffect(() => {
    if (agentRunning && currentAgentStep < agentSteps.length - 1) {
      const timer = setTimeout(() => {
        advanceAgentStep();
      }, 600);
      return () => clearTimeout(timer);
    } else if (agentRunning && currentAgentStep === agentSteps.length - 1) {
      const timer = setTimeout(() => {
        completeAgentRun();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [agentRunning, currentAgentStep, agentSteps.length, advanceAgentStep, completeAgentRun]);
  
  if (!agentRunning && !agentCompleted) return null;
  
  return (
    <div className="bg-status-info-bg border border-status-info/30 rounded-lg p-3 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <Activity className="w-4 h-4 text-status-info" />
        <span className="text-sm font-semibold text-status-info">
          {agentCompleted ? 'Analysis Complete' : 'Running Agent Analysis...'}
        </span>
      </div>
      <div className="flex gap-1">
        {agentSteps.map((step, idx) => (
          <div key={step} className="flex-1">
            <div 
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx <= currentAgentStep 
                  ? 'bg-status-info' 
                  : 'bg-status-info/20'
              }`}
            />
            <span className={`text-[8px] mt-0.5 block truncate ${
              idx <= currentAgentStep ? 'text-status-info' : 'text-muted-foreground'
            }`}>
              {step.split(' ')[0]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ReadinessTimeline = () => {
  const { selectedPOId, agentCompleted, probabilityOnTime, expectedSlipDays } = useDispatchStore();
  
  const selectedPO = useMemo(() => {
    return posData.pos.find(p => p.po_id === selectedPOId);
  }, [selectedPOId]);
  
  const milestones = useMemo(() => {
    const data = milestonesData.milestones.find(m => m.po_id === selectedPOId);
    return data?.stages || [];
  }, [selectedPOId]);
  
  const materials = useMemo(() => {
    const data = materialsData.materials.find(m => m.po_id === selectedPOId);
    return data?.materials || [];
  }, [selectedPOId]);
  
  const quality = useMemo(() => {
    return qualityData.quality.find(q => q.po_id === selectedPOId);
  }, [selectedPOId]);
  
  const capacity = useMemo(() => {
    if (!selectedPO) return null;
    return capacityData.capacity.find(c => c.factory_id === selectedPO.factory_id);
  }, [selectedPO]);
  
  // Generate probability curve data
  const probabilityCurve = useMemo(() => {
    if (!selectedPO) return [];
    
    const exFactoryDate = new Date(selectedPO.committed_ex_factory_date);
    const today = new Date('2024-01-30');
    const daysUntilExFactory = Math.ceil((exFactoryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    return Array.from({ length: Math.max(daysUntilExFactory + 5, 14) }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      // Simulate probability declining as we approach deadline without progress
      const daysRemaining = daysUntilExFactory - i;
      const baseProbability = selectedPO.status === 'red' ? 0.35 : selectedPO.status === 'amber' ? 0.55 : 0.85;
      const probability = Math.max(0.1, baseProbability - (i * 0.02));
      
      return {
        date: date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        probability: probability * 100,
        isExFactory: i === daysUntilExFactory
      };
    });
  }, [selectedPO]);
  
  if (!selectedPOId) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Select a PO from the radar to view readiness details</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col gap-4 overflow-auto scrollbar-thin">
      <AgentStepper />
      
      {/* Probability Timeline Chart */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Readiness Timeline & On-Time Probability</CardTitle>
            {agentCompleted && (
              <Badge variant={probabilityOnTime < 0.5 ? "destructive" : "secondary"}>
                {(probabilityOnTime * 100).toFixed(0)}% On-Time
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={probabilityCurve}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'On-Time Probability']}
                contentStyle={{ fontSize: 12 }}
              />
              <Area 
                type="monotone" 
                dataKey="probability" 
                stroke="hsl(var(--primary))" 
                fill="hsl(var(--primary))" 
                fillOpacity={0.2}
              />
              {selectedPO && (
                <ReferenceLine 
                  x={new Date(selectedPO.committed_ex_factory_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} 
                  stroke="hsl(var(--status-danger))" 
                  strokeDasharray="5 5"
                  label={{ value: 'Ex-Factory', fontSize: 10, fill: 'hsl(var(--status-danger))' }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      {/* Milestone Progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Milestone Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {milestones.map((milestone, idx) => (
              <div key={milestone.stage} className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  milestone.status === 'completed' ? 'bg-status-success text-white' :
                  milestone.status === 'in_progress' ? 'bg-status-warning text-white' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {MILESTONE_ICONS[milestone.stage] || <Clock className="w-3 h-3" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{milestone.stage}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {milestone.actual_date || milestone.planned_date}
                    </span>
                  </div>
                  {milestone.delay_days > 0 && (
                    <span className="text-[10px] text-status-danger">+{milestone.delay_days}d delay</span>
                  )}
                </div>
                {milestone.status === 'completed' && (
                  <CheckCircle className="w-4 h-4 text-status-success" />
                )}
                {milestone.status === 'in_progress' && (
                  <Clock className="w-4 h-4 text-status-warning animate-pulse" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Risk Indicator Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3">
          <div className="text-[10px] text-muted-foreground mb-1">Material On-Time</div>
          <div className={`text-lg font-bold ${materials.some(m => m.risk_flag) ? 'text-status-danger' : 'text-status-success'}`}>
            {materials.filter(m => !m.risk_flag).length}/{materials.length}
          </div>
          <div className="text-[9px] text-muted-foreground">
            {materials.filter(m => m.risk_flag).length} delayed
          </div>
        </Card>
        
        <Card className="p-3">
          <div className="text-[10px] text-muted-foreground mb-1">Quality Hold Rate</div>
          <div className={`text-lg font-bold ${quality?.hold_rate && quality.hold_rate > 3 ? 'text-status-danger' : 'text-status-success'}`}>
            {quality?.hold_rate?.toFixed(1) || 0}%
          </div>
          <div className="text-[9px] text-muted-foreground">
            {quality?.threshold_breach ? 'Above threshold' : 'Within threshold'}
          </div>
        </Card>
        
        <Card className="p-3">
          <div className="text-[10px] text-muted-foreground mb-1">Capacity Util.</div>
          <div className={`text-lg font-bold ${capacity?.overall_utilization && capacity.overall_utilization > 85 ? 'text-status-warning' : 'text-foreground'}`}>
            {capacity?.overall_utilization || 0}%
          </div>
          <div className="text-[9px] text-muted-foreground">
            {capacity?.capacity_shortfall_pct || 0}% shortfall
          </div>
        </Card>
      </div>
      
      {/* Agent Narrative */}
      {agentCompleted && selectedPO && (
        <Card className="border-status-warning/50 bg-status-warning-bg/30">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-status-warning" />
              <CardTitle className="text-sm font-semibold">Agent Analysis</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs leading-relaxed">
              <strong>PO {selectedPO.po_id}</strong> has a <span className="text-status-danger font-semibold">{(probabilityOnTime * 100).toFixed(0)}% probability</span> of 
              on-time ex-factory, with expected slip of <span className="text-status-danger font-semibold">{expectedSlipDays} days</span>.
              {' '}
              <strong>Drivers:</strong> {materials.filter(m => m.risk_flag).length > 0 && `fabric greige ETA slipped ${materials.find(m => m.risk_flag)?.slip_days || 0} days, `}
              {quality?.hold_rate && quality.hold_rate > 3 && `quality holds at ${quality.hold_rate}% vs 3% threshold, `}
              {capacity?.capacity_shortfall_pct && capacity.capacity_shortfall_pct > 0 && `sewing capacity is ${capacity.capacity_shortfall_pct}% below plan. `}
              If no intervention in 48h, air-freight escalation risk increases for UAE launch SKUs.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
