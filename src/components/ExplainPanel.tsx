import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Brain, 
  CheckCircle2, 
  Circle, 
  Loader2, 
  ChevronDown, 
  Ship, 
  AlertTriangle, 
  FileText,
  Sparkles,
  RefreshCcw,
  ArrowRight,
  Lightbulb,
  XCircle,
  TrendingUp,
  PackageX
} from 'lucide-react';
import ReactFlow, { 
  Node, 
  Edge, 
  Background,
  MarkerType,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import kpiTrendsData from '@/data/kpiTrends.json';
import supplierDetailsData from '@/data/supplierDetails.json';
import suppliersData from '@/data/suppliers.json';

type SupplierDetailsType = typeof supplierDetailsData;
type KpiTrendsType = typeof kpiTrendsData;

const AgentStepper = () => {
  const { agentSteps, currentAgentStep, investigationStatus, advanceAgentStep, completeInvestigation } = useAppStore();

  useEffect(() => {
    if (investigationStatus === 'running' && currentAgentStep < agentSteps.length - 1) {
      const timer = setTimeout(() => {
        advanceAgentStep();
      }, 1500);
      return () => clearTimeout(timer);
    } else if (investigationStatus === 'running' && currentAgentStep === agentSteps.length - 1) {
      const timer = setTimeout(() => {
        completeInvestigation();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentAgentStep, investigationStatus, agentSteps.length, advanceAgentStep, completeInvestigation]);

  const isCompleteOrRevising = investigationStatus === 'completed' || investigationStatus === 'revising';

  return (
    <div className="space-y-2">
      {agentSteps.map((step, idx) => {
        const isActive = idx === currentAgentStep && investigationStatus === 'running';
        const isComplete = idx < currentAgentStep || isCompleteOrRevising;

        return (
          <div 
            key={step}
            className={`agent-step ${isActive ? 'agent-step-active' : isComplete ? 'agent-step-complete' : 'agent-step-pending'}`}
          >
            {isComplete ? (
              <CheckCircle2 className="w-4 h-4 text-status-success flex-shrink-0" />
            ) : isActive ? (
              <Loader2 className="w-4 h-4 text-status-info animate-spin flex-shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            )}
            <span className={`text-xs ${isActive ? 'font-medium' : ''}`}>{step}</span>
            {isActive && (
              <span className="ml-auto text-[10px] text-status-info">Processing...</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

const RevisionStepper = () => {
  const { isRevising, revisionStep, advanceRevision, completeRevision } = useAppStore();
  
  const revisionSteps = [
    'Counter-Evidence Detected',
    'Hypothesis Validation',
    'Cause Re-ranking',
    'Plan Adjustment'
  ];

  useEffect(() => {
    if (isRevising && revisionStep < revisionSteps.length - 1) {
      const timer = setTimeout(() => {
        advanceRevision();
      }, 1200);
      return () => clearTimeout(timer);
    } else if (isRevising && revisionStep === revisionSteps.length - 1) {
      const timer = setTimeout(() => {
        completeRevision();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [revisionStep, isRevising, revisionSteps.length, advanceRevision, completeRevision]);

  return (
    <div className="space-y-2">
      {revisionSteps.map((step, idx) => {
        const isActive = idx === revisionStep;
        const isComplete = idx < revisionStep;

        return (
          <div 
            key={step}
            className={`agent-step ${isActive ? 'bg-status-warning-bg border border-status-warning/50' : isComplete ? 'bg-status-success-bg' : 'bg-muted/30 opacity-50'}`}
          >
            {isComplete ? (
              <CheckCircle2 className="w-4 h-4 text-status-success flex-shrink-0" />
            ) : isActive ? (
              <RefreshCcw className="w-4 h-4 text-status-warning animate-spin flex-shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            )}
            <span className={`text-xs ${isActive ? 'font-medium text-status-warning' : ''}`}>{step}</span>
            {isActive && (
              <span className="ml-auto text-[10px] text-status-warning">Revising...</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

interface HypothesisRevisionCardProps {
  supplierDetails: SupplierDetailsType[keyof SupplierDetailsType];
}

const HypothesisRevisionCard = ({ supplierDetails }: HypothesisRevisionCardProps) => {
  const { hasShownRevision, startRevision, isRevising, investigationStatus } = useAppStore();
  
  // Only show revision for suppliers that have a revised hypothesis
  if (!supplierDetails?.hypotheses?.revised) {
    return null;
  }
  
  const showRevisionButton = investigationStatus === 'completed' && !hasShownRevision && !isRevising;
  
  if (!hasShownRevision && !isRevising && !showRevisionButton) {
    return null;
  }

  return (
    <Card className={`card-elevated border-l-4 ${isRevising ? 'border-l-status-warning' : hasShownRevision ? 'border-l-status-success' : 'border-l-status-info'}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Lightbulb className={`w-4 h-4 ${isRevising ? 'text-status-warning' : 'text-status-success'}`} />
          {isRevising ? 'Revising Hypothesis...' : hasShownRevision ? 'Hypothesis Revised' : 'Counterexample Learning'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {showRevisionButton && (
          <>
            <p className="text-xs text-muted-foreground">
              Agent detected new evidence that contradicts the initial hypothesis. Click to see adaptive learning in action.
            </p>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full border-status-warning text-status-warning hover:bg-status-warning-bg"
              onClick={startRevision}
            >
              <RefreshCcw className="w-3.5 h-3.5 mr-1" />
              Simulate Counter-Evidence
            </Button>
          </>
        )}

        {isRevising && <RevisionStepper />}

        {hasShownRevision && (
          <div className="space-y-3">
            <div className="p-3 bg-status-danger-bg/30 rounded-lg border border-status-danger/20">
              <div className="flex items-center gap-2 mb-1">
                <XCircle className="w-3.5 h-3.5 text-status-danger" />
                <span className="text-[10px] font-medium text-status-danger">INVALIDATED</span>
              </div>
              <p className="text-xs line-through text-muted-foreground">{supplierDetails.hypotheses.original}</p>
            </div>

            <div className="flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </div>

            <div className="p-3 bg-status-success-bg/50 rounded-lg border border-status-success/30">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
                <span className="text-[10px] font-medium text-status-success">REVISED (91% confidence)</span>
              </div>
              <p className="text-xs text-foreground">{supplierDetails.hypotheses.revised}</p>
            </div>

            <p className="text-[10px] text-muted-foreground italic">
              This demonstrates adaptive learning: the agent updated its root cause analysis based on new evidence.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface RootCauseGraphProps {
  supplierId: string;
}

const RootCauseGraph = ({ supplierId }: RootCauseGraphProps) => {
  const { hasShownRevision } = useAppStore();
  
  // Different graph structures per supplier
  const getNodesAndEdges = () => {
    if (supplierId === 'SUP001') {
      // SuratHomeTex - India forwarder/compliance issues
      const nodes: Node[] = [
        {
          id: 'otif',
          position: { x: 400, y: 20 },
          data: { label: 'OTIF ↓ 76%' },
          style: { background: 'hsl(0, 84%, 60%)', color: 'white', borderRadius: '8px', padding: '8px 12px', fontSize: '11px', fontWeight: 600, border: 'none' },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
        },
        {
          id: 'late_grn',
          position: { x: 250, y: 100 },
          data: { label: 'Late GRN' },
          style: { background: hasShownRevision ? 'hsl(0, 84%, 60%)' : 'hsl(217, 91%, 50%)', color: 'white', borderRadius: '8px', padding: '6px 10px', fontSize: '10px', fontWeight: 500, border: hasShownRevision ? '3px solid hsl(0, 84%, 40%)' : 'none' },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
        },
        {
          id: 'dc_hold',
          position: { x: 520, y: 100 },
          data: { label: 'DC Compliance Hold' },
          style: { background: 'hsl(217, 91%, 50%)', color: 'white', borderRadius: '8px', padding: '6px 10px', fontSize: '10px', fontWeight: 500, border: 'none' },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
        },
        {
          id: 'port_dwell',
          position: { x: 80, y: 180 },
          data: { label: hasShownRevision ? 'Port Dwell ✓' : 'Port Dwell ↑' },
          style: { background: hasShownRevision ? 'hsl(142, 76%, 36%)' : 'hsl(38, 92%, 50%)', color: 'white', borderRadius: '8px', padding: '6px 10px', fontSize: '10px', fontWeight: 500, border: 'none', opacity: hasShownRevision ? 0.6 : 1 },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
        },
        {
          id: 'asn_errors',
          position: { x: 250, y: 180 },
          data: { label: hasShownRevision ? 'ASN Errors ⚠️' : 'ASN Errors' },
          style: { background: hasShownRevision ? 'hsl(0, 84%, 60%)' : 'hsl(38, 92%, 50%)', color: 'white', borderRadius: '8px', padding: '6px 10px', fontSize: '10px', fontWeight: 500, border: hasShownRevision ? '3px solid hsl(0, 84%, 40%)' : 'none' },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
        },
        {
          id: 'arabic_label',
          position: { x: 520, y: 180 },
          data: { label: 'Arabic Label Issues' },
          style: { background: 'hsl(38, 92%, 50%)', color: 'white', borderRadius: '8px', padding: '6px 10px', fontSize: '10px', fontWeight: 500, border: 'none' },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
        },
        {
          id: 'forwarder',
          position: { x: 80, y: 260 },
          data: { label: hasShownRevision ? 'Forwarder ✓' : 'Forwarder Switch' },
          style: { background: hasShownRevision ? 'hsl(142, 76%, 36%)' : 'hsl(280, 67%, 52%)', color: 'white', borderRadius: '8px', padding: '6px 10px', fontSize: '10px', fontWeight: 500, border: 'none', opacity: hasShownRevision ? 0.6 : 1 },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
        },
        {
          id: 'sscc_missing',
          position: { x: 200, y: 260 },
          data: { label: 'SSCC Missing' },
          style: { background: hasShownRevision ? 'hsl(0, 84%, 60%)' : 'hsl(280, 67%, 52%)', color: 'white', borderRadius: '8px', padding: '6px 10px', fontSize: '10px', fontWeight: 500, border: 'none' },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
        },
        {
          id: 'carton_mismatch',
          position: { x: 320, y: 260 },
          data: { label: 'Carton Mismatch' },
          style: { background: hasShownRevision ? 'hsl(0, 84%, 60%)' : 'hsl(280, 67%, 52%)', color: 'white', borderRadius: '8px', padding: '6px 10px', fontSize: '10px', fontWeight: 500, border: 'none' },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
        },
        {
          id: 'template_update',
          position: { x: 520, y: 260 },
          data: { label: 'Template V2.3' },
          style: { background: 'hsl(280, 67%, 52%)', color: 'white', borderRadius: '8px', padding: '6px 10px', fontSize: '10px', fontWeight: 500, border: 'none' },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
        },
      ];
      const edges: Edge[] = [
        { id: 'e1', source: 'late_grn', target: 'otif', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: hasShownRevision ? '#dc2626' : '#64748b', strokeWidth: hasShownRevision ? 2 : 1 } },
        { id: 'e2', source: 'dc_hold', target: 'otif', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#64748b' } },
        { id: 'e3', source: 'port_dwell', target: 'late_grn', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: hasShownRevision ? '#22c55e' : '#64748b', strokeDasharray: hasShownRevision ? '5 5' : undefined } },
        { id: 'e4', source: 'asn_errors', target: 'late_grn', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: hasShownRevision ? '#dc2626' : '#64748b', strokeWidth: hasShownRevision ? 2 : 1 } },
        { id: 'e5', source: 'arabic_label', target: 'dc_hold', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#64748b' } },
        { id: 'e6', source: 'forwarder', target: 'port_dwell', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: hasShownRevision ? '#22c55e' : '#64748b', strokeDasharray: hasShownRevision ? '5 5' : undefined } },
        { id: 'e7', source: 'sscc_missing', target: 'asn_errors', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: hasShownRevision ? '#dc2626' : '#64748b' } },
        { id: 'e8', source: 'carton_mismatch', target: 'asn_errors', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: hasShownRevision ? '#dc2626' : '#64748b' } },
        { id: 'e9', source: 'template_update', target: 'arabic_label', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#64748b' } },
      ];
      return { nodes, edges };
    } else if (supplierId === 'SUP003') {
      // GuangZhou Fashion - packaging/CNY issues
      const nodes: Node[] = [
        {
          id: 'otif',
          position: { x: 300, y: 20 },
          data: { label: 'OTIF ↓ 89%' },
          style: { background: 'hsl(38, 92%, 50%)', color: 'white', borderRadius: '8px', padding: '8px 12px', fontSize: '11px', fontWeight: 600, border: 'none' },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
        },
        {
          id: 'transit_delay',
          position: { x: 150, y: 100 },
          data: { label: 'Transit Delay +1.2d' },
          style: { background: 'hsl(217, 91%, 50%)', color: 'white', borderRadius: '8px', padding: '6px 10px', fontSize: '10px', fontWeight: 500, border: 'none' },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
        },
        {
          id: 'packaging_damage',
          position: { x: 420, y: 100 },
          data: { label: hasShownRevision ? 'Packaging ⚠️' : 'Packaging Damage' },
          style: { background: hasShownRevision ? 'hsl(0, 84%, 60%)' : 'hsl(217, 91%, 50%)', color: 'white', borderRadius: '8px', padding: '6px 10px', fontSize: '10px', fontWeight: 500, border: hasShownRevision ? '3px solid hsl(0, 84%, 40%)' : 'none' },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
        },
        {
          id: 'port_congestion',
          position: { x: 100, y: 180 },
          data: { label: hasShownRevision ? 'Port Congestion ✓' : 'Shenzhen Congestion' },
          style: { background: hasShownRevision ? 'hsl(142, 76%, 36%)' : 'hsl(38, 92%, 50%)', color: 'white', borderRadius: '8px', padding: '6px 10px', fontSize: '10px', fontWeight: 500, border: 'none', opacity: hasShownRevision ? 0.6 : 1 },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
        },
        {
          id: 'asn_timing',
          position: { x: 250, y: 180 },
          data: { label: 'ASN Timing' },
          style: { background: 'hsl(38, 92%, 50%)', color: 'white', borderRadius: '8px', padding: '6px 10px', fontSize: '10px', fontWeight: 500, border: 'none' },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
        },
        {
          id: 'carton_quality',
          position: { x: 420, y: 180 },
          data: { label: '12% Carton Damage' },
          style: { background: hasShownRevision ? 'hsl(0, 84%, 60%)' : 'hsl(38, 92%, 50%)', color: 'white', borderRadius: '8px', padding: '6px 10px', fontSize: '10px', fontWeight: 500, border: hasShownRevision ? '3px solid hsl(0, 84%, 40%)' : 'none' },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
        },
        {
          id: 'cny_prep',
          position: { x: 100, y: 260 },
          data: { label: 'CNY Preparation' },
          style: { background: 'hsl(280, 67%, 52%)', color: 'white', borderRadius: '8px', padding: '6px 10px', fontSize: '10px', fontWeight: 500, border: 'none' },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
        },
        {
          id: 'supplier_qc',
          position: { x: 420, y: 260 },
          data: { label: 'Supplier QC Gap' },
          style: { background: 'hsl(280, 67%, 52%)', color: 'white', borderRadius: '8px', padding: '6px 10px', fontSize: '10px', fontWeight: 500, border: 'none' },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
        },
      ];
      const edges: Edge[] = [
        { id: 'e1', source: 'transit_delay', target: 'otif', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: hasShownRevision ? '#22c55e' : '#64748b', strokeDasharray: hasShownRevision ? '5 5' : undefined } },
        { id: 'e2', source: 'packaging_damage', target: 'otif', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: hasShownRevision ? '#dc2626' : '#64748b', strokeWidth: hasShownRevision ? 2 : 1 } },
        { id: 'e3', source: 'port_congestion', target: 'transit_delay', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: hasShownRevision ? '#22c55e' : '#64748b', strokeDasharray: hasShownRevision ? '5 5' : undefined } },
        { id: 'e4', source: 'asn_timing', target: 'transit_delay', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#64748b' } },
        { id: 'e5', source: 'carton_quality', target: 'packaging_damage', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: hasShownRevision ? '#dc2626' : '#64748b', strokeWidth: hasShownRevision ? 2 : 1 } },
        { id: 'e6', source: 'cny_prep', target: 'port_congestion', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: hasShownRevision ? '#22c55e' : '#64748b', strokeDasharray: hasShownRevision ? '5 5' : undefined } },
        { id: 'e7', source: 'supplier_qc', target: 'carton_quality', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: hasShownRevision ? '#dc2626' : '#64748b' } },
      ];
      return { nodes, edges };
    } else {
      // Healthy suppliers (SUP002, SUP004) - simple positive graph
      const nodes: Node[] = [
        {
          id: 'otif',
          position: { x: 250, y: 50 },
          data: { label: supplierId === 'SUP002' ? 'OTIF 96% ✓' : 'OTIF 97% ✓' },
          style: { background: 'hsl(142, 76%, 36%)', color: 'white', borderRadius: '8px', padding: '8px 12px', fontSize: '11px', fontWeight: 600, border: 'none' },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
        },
        {
          id: 'local_supply',
          position: { x: 150, y: 140 },
          data: { label: 'Local Supply Chain' },
          style: { background: 'hsl(142, 76%, 36%)', color: 'white', borderRadius: '8px', padding: '6px 10px', fontSize: '10px', fontWeight: 500, border: 'none' },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
        },
        {
          id: 'compliance_ok',
          position: { x: 350, y: 140 },
          data: { label: 'Compliance 100%' },
          style: { background: 'hsl(142, 76%, 36%)', color: 'white', borderRadius: '8px', padding: '6px 10px', fontSize: '10px', fontWeight: 500, border: 'none' },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
        },
        {
          id: 'asn_ok',
          position: { x: 250, y: 220 },
          data: { label: 'ASN Accuracy 99%+' },
          style: { background: 'hsl(142, 76%, 36%)', color: 'white', borderRadius: '8px', padding: '6px 10px', fontSize: '10px', fontWeight: 500, border: 'none' },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
        },
      ];
      const edges: Edge[] = [
        { id: 'e1', source: 'local_supply', target: 'otif', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#22c55e' } },
        { id: 'e2', source: 'compliance_ok', target: 'otif', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#22c55e' } },
        { id: 'e3', source: 'asn_ok', target: 'local_supply', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#22c55e' } },
      ];
      return { nodes, edges };
    }
  };

  const { nodes, edges } = getNodesAndEdges();

  return (
    <div className="h-[280px] w-full border rounded-lg overflow-hidden bg-surface-sunken relative">
      <ReactFlow 
        nodes={nodes} 
        edges={edges}
        fitView
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnDoubleClick={false}
      >
        <Background color="#e2e8f0" gap={16} />
      </ReactFlow>
      {hasShownRevision && (supplierId === 'SUP001' || supplierId === 'SUP003') && (
        <div className="absolute top-2 right-2 p-1.5 bg-status-success-bg rounded text-[9px] text-status-success font-medium">
          Graph Updated
        </div>
      )}
    </div>
  );
};

interface KPIChartProps {
  supplierId: string;
}

const KPIChart = ({ supplierId }: KPIChartProps) => {
  const [showChangePoint, setShowChangePoint] = useState(true);
  const supplierKpi = (kpiTrendsData as KpiTrendsType)[supplierId as keyof KpiTrendsType];
  const data = supplierKpi?.daily || [];
  const changeDate = supplierKpi?.changeDate;

  const currentOtif = data.length > 0 ? data[data.length - 1].otif : 0;
  const isHealthy = currentOtif >= 95;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium">OTIF Trend (Jan 2024)</p>
        {changeDate && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 text-[10px]"
            onClick={() => setShowChangePoint(!showChangePoint)}
          >
            {showChangePoint ? 'Hide' : 'Show'} Change Point
          </Button>
        )}
      </div>
      <div className="h-[120px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 9 }} 
              tickFormatter={(v) => v.split('-')[2]}
            />
            <YAxis 
              domain={isHealthy ? [90, 100] : [70, 100]} 
              tick={{ fontSize: 9 }}
              width={30}
            />
            <Tooltip 
              contentStyle={{ fontSize: '11px' }}
              labelFormatter={(v) => `Date: ${v}`}
            />
            {showChangePoint && changeDate && (
              <ReferenceLine 
                x={changeDate} 
                stroke="hsl(0, 84%, 60%)" 
                strokeDasharray="4 4"
                label={{ value: changeDate.split('-')[2], position: 'top', fontSize: 9, fill: 'hsl(0, 84%, 60%)' }}
              />
            )}
            <Line 
              type="monotone" 
              dataKey="otif" 
              stroke={isHealthy ? "hsl(142, 76%, 36%)" : "hsl(217, 91%, 50%)"} 
              strokeWidth={2}
              dot={{ r: 2 }}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

interface EvidenceCardsProps {
  supplierDetails: SupplierDetailsType[keyof SupplierDetailsType];
}

const EvidenceCards = ({ supplierDetails }: EvidenceCardsProps) => {
  const [openSection, setOpenSection] = useState<string | null>(null);
  
  const evidence = supplierDetails?.evidence;
  
  if (!evidence) return null;

  const hasShipments = evidence.shipmentDelays && evidence.shipmentDelays.length > 0;
  const hasCompliance = evidence.complianceHolds && evidence.complianceHolds.length > 0;
  const hasAsn = evidence.asnErrors && evidence.asnErrors.length > 0;

  if (!hasShipments && !hasCompliance && !hasAsn) {
    return (
      <div className="p-4 bg-status-success-bg/50 rounded-lg border border-status-success/30 text-center">
        <TrendingUp className="w-8 h-8 text-status-success mx-auto mb-2" />
        <p className="text-sm font-medium text-status-success">No Issues Detected</p>
        <p className="text-xs text-muted-foreground">Supplier is performing above targets</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {hasShipments && (
        <Collapsible open={openSection === 'shipments'} onOpenChange={() => setOpenSection(openSection === 'shipments' ? null : 'shipments')}>
          <CollapsibleTrigger asChild>
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent className="p-3 flex items-center gap-3">
                <Ship className="w-4 h-4 text-status-warning" />
                <div className="flex-1">
                  <p className="text-xs font-medium">Shipment Delays</p>
                  <p className="text-[10px] text-muted-foreground">{evidence.shipmentDelays.length} shipments affected</p>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${openSection === 'shipments' ? 'rotate-180' : ''}`} />
              </CardContent>
            </Card>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-1 p-3 bg-muted/30 rounded-lg text-xs space-y-2">
              {evidence.shipmentDelays.map((s: { id: string; summary: string; detail: string; impact: string; status: string }) => (
                <div key={s.id} className="p-2 bg-card rounded border">
                  <p className="font-medium">{s.id}</p>
                  <p className="text-muted-foreground">{s.summary}</p>
                  <p className="text-muted-foreground">{s.detail}</p>
                  <p className="text-status-danger">{s.impact}</p>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {hasCompliance && (
        <Collapsible open={openSection === 'compliance'} onOpenChange={() => setOpenSection(openSection === 'compliance' ? null : 'compliance')}>
          <CollapsibleTrigger asChild>
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent className="p-3 flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 text-status-danger" />
                <div className="flex-1">
                  <p className="text-xs font-medium">Compliance Holds</p>
                  <p className="text-[10px] text-muted-foreground">{evidence.complianceHolds.length} holds</p>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${openSection === 'compliance' ? 'rotate-180' : ''}`} />
              </CardContent>
            </Card>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-1 p-3 bg-muted/30 rounded-lg text-xs space-y-2">
              {evidence.complianceHolds.map((c: { id: string; subcategory: string; skuCount: number; issue: string; details: string }) => (
                <div key={c.id} className="p-2 bg-card rounded border">
                  <p className="font-medium">{c.subcategory} - {c.skuCount} SKUs</p>
                  <p className="text-muted-foreground">{c.issue}</p>
                  <p className="text-[10px]">{c.details}</p>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {hasAsn && (
        <Collapsible open={openSection === 'asn'} onOpenChange={() => setOpenSection(openSection === 'asn' ? null : 'asn')}>
          <CollapsibleTrigger asChild>
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent className="p-3 flex items-center gap-3">
                <FileText className="w-4 h-4 text-status-warning" />
                <div className="flex-1">
                  <p className="text-xs font-medium">ASN Errors</p>
                  <p className="text-[10px] text-muted-foreground">{evidence.asnErrors.length} issues found</p>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${openSection === 'asn' ? 'rotate-180' : ''}`} />
              </CardContent>
            </Card>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-1 p-3 bg-muted/30 rounded-lg text-xs space-y-2">
              {evidence.asnErrors.map((a: { id: string; errorType: string; detail: string; grnDelay: number }) => (
                <div key={a.id} className="p-2 bg-card rounded border">
                  <p className="font-medium">{a.errorType}</p>
                  <p className="text-muted-foreground">{a.detail}</p>
                  <p className="text-status-warning">GRN Delay: +{a.grnDelay}h</p>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};

export const ExplainPanel = () => {
  const { selectedSupplierId, investigationStatus, confidenceScore, hasShownRevision, isRevising } = useAppStore();
  
  const supplier = suppliersData.suppliers.find(s => s.id === selectedSupplierId);
  const supplierDetails = selectedSupplierId ? (supplierDetailsData as SupplierDetailsType)[selectedSupplierId as keyof SupplierDetailsType] : null;

  if (!selectedSupplierId) {
    return (
      <Card className="card-elevated h-full flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Select a supplier to investigate</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Click on a row in the Supplier Health Radar</p>
        </div>
      </Card>
    );
  }

  const showCompleted = investigationStatus === 'completed' || investigationStatus === 'revising';
  const kpiChange = supplierDetails?.kpiChange as { metric: string; from: number; to: number; changeDate: string; isPositive?: boolean } | undefined;
  const isPositiveChange = kpiChange?.isPositive;

  return (
    <div className="flex flex-col gap-4 h-full overflow-auto scrollbar-thin pr-1">
      {/* Investigation Header */}
      <Card className="card-elevated border-t-4 border-t-primary">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" />
              <span>Investigation:</span>
              <span className="text-primary">{supplier?.name}</span>
              <span className="text-muted-foreground">→</span>
              <span>{supplier?.primaryDC}</span>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge 
                className={`text-[10px] ${
                  investigationStatus === 'running' 
                    ? 'bg-status-info text-white animate-pulse' 
                    : investigationStatus === 'revising'
                      ? 'bg-status-warning text-white'
                      : investigationStatus === 'completed' 
                        ? 'bg-status-success text-white' 
                        : 'bg-muted text-muted-foreground'
                }`}
              >
                {investigationStatus === 'running' ? 'Analyzing...' : 
                 investigationStatus === 'revising' ? 'Revising...' :
                 investigationStatus === 'completed' ? 'Completed' : 'Pending'}
              </Badge>
              {showCompleted && (
                <Badge variant="outline" className="text-[10px] font-semibold">
                  Confidence: {((hasShownRevision ? 0.91 : confidenceScore) * 100).toFixed(0)}%
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <AgentStepper />
        </CardContent>
      </Card>

      {/* Narrative Card */}
      {showCompleted && supplierDetails && (
        <>
          <Card className={`card-elevated border-l-4 ${isPositiveChange ? 'border-l-status-success bg-gradient-to-r from-status-success/5 to-transparent' : 'border-l-primary bg-gradient-to-r from-primary/5 to-transparent'}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full ${isPositiveChange ? 'bg-status-success/10' : 'bg-primary/10'} flex items-center justify-center flex-shrink-0`}>
                  {isPositiveChange ? (
                    <TrendingUp className="w-4 h-4 text-status-success" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div className="space-y-2 flex-1">
                  <p className={`text-xs font-bold uppercase tracking-wide ${isPositiveChange ? 'text-status-success' : 'text-primary'}`}>
                    {isPositiveChange ? 'Performance Summary' : 'Root Cause Analysis'}
                  </p>
                  <p className="text-sm leading-relaxed text-foreground">
                    {hasShownRevision && supplierDetails.narrative.revised ? (
                      <>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-status-success/20 text-status-success text-xs font-semibold mr-1">REVISED</span>
                        {supplierDetails.narrative.revised}
                      </>
                    ) : (
                      supplierDetails.narrative.default
                    )}
                  </p>
                  {kpiChange && (
                    <div className={`inline-flex items-center gap-2 px-2 py-1 rounded ${isPositiveChange ? 'bg-status-success-bg' : 'bg-status-danger-bg'}`}>
                      <span className="text-[10px] font-medium">
                        {kpiChange.metric}: {kpiChange.from}% → {kpiChange.to}%
                      </span>
                      <span className="text-[10px] text-muted-foreground">({kpiChange.changeDate})</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hypothesis Revision Card - only for suppliers with issues */}
          {supplierDetails && <HypothesisRevisionCard supplierDetails={supplierDetails} />}

          {/* Evidence Cards */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Supporting Evidence</p>
            {supplierDetails && <EvidenceCards supplierDetails={supplierDetails} />}
          </div>

          {/* Root Cause Graph */}
          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Causal Graph</p>
            <RootCauseGraph supplierId={selectedSupplierId} />
          </div>

          {/* KPI Chart */}
          <Card className="card-elevated">
            <CardContent className="p-4">
              <KPIChart supplierId={selectedSupplierId} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};