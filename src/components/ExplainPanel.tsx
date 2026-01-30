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
  XCircle
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
import evidenceData from '@/data/evidence.json';
import suppliersData from '@/data/suppliers.json';

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
        const isPending = idx > currentAgentStep && investigationStatus === 'running';

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

const HypothesisRevisionCard = () => {
  const { originalHypothesis, revisedHypothesis, hasShownRevision, startRevision, isRevising, investigationStatus } = useAppStore();
  
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
            {/* Original Hypothesis - Struck through */}
            <div className="p-3 bg-status-danger-bg/30 rounded-lg border border-status-danger/20">
              <div className="flex items-center gap-2 mb-1">
                <XCircle className="w-3.5 h-3.5 text-status-danger" />
                <span className="text-[10px] font-medium text-status-danger">INVALIDATED</span>
              </div>
              <p className="text-xs line-through text-muted-foreground">{originalHypothesis}</p>
            </div>

            <div className="flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </div>

            {/* Revised Hypothesis */}
            <div className="p-3 bg-status-success-bg/50 rounded-lg border border-status-success/30">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
                <span className="text-[10px] font-medium text-status-success">REVISED (91% confidence)</span>
              </div>
              <p className="text-xs text-foreground">{revisedHypothesis}</p>
            </div>

            <p className="text-[10px] text-muted-foreground italic">
              This demonstrates adaptive learning: the agent updated its root cause analysis based on new evidence (port dwell normalized), proving it's not a static script.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const RootCauseGraph = () => {
  const { hasShownRevision } = useAppStore();
  
  // Different nodes based on whether revision has happened
  const baseNodes: Node[] = [
    {
      id: 'otif',
      position: { x: 400, y: 20 },
      data: { label: 'OTIF ↓ 76%' },
      style: { 
        background: 'hsl(0, 84%, 60%)', 
        color: 'white', 
        borderRadius: '8px',
        padding: '8px 12px',
        fontSize: '11px',
        fontWeight: 600,
        border: 'none'
      },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    },
    {
      id: 'late_grn',
      position: { x: 250, y: 100 },
      data: { label: 'Late GRN' },
      style: { 
        background: hasShownRevision ? 'hsl(0, 84%, 60%)' : 'hsl(217, 91%, 50%)', 
        color: 'white', 
        borderRadius: '8px',
        padding: '6px 10px',
        fontSize: '10px',
        fontWeight: 500,
        border: hasShownRevision ? '3px solid hsl(0, 84%, 40%)' : 'none'
      },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    },
    {
      id: 'dc_hold',
      position: { x: 520, y: 100 },
      data: { label: 'DC Compliance Hold' },
      style: { 
        background: 'hsl(217, 91%, 50%)', 
        color: 'white', 
        borderRadius: '8px',
        padding: '6px 10px',
        fontSize: '10px',
        fontWeight: 500,
        border: 'none'
      },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    },
    {
      id: 'port_dwell',
      position: { x: 80, y: 180 },
      data: { label: hasShownRevision ? 'Port Dwell ✓' : 'Port Dwell ↑' },
      style: { 
        background: hasShownRevision ? 'hsl(142, 76%, 36%)' : 'hsl(38, 92%, 50%)', 
        color: 'white', 
        borderRadius: '8px',
        padding: '6px 10px',
        fontSize: '10px',
        fontWeight: 500,
        border: 'none',
        opacity: hasShownRevision ? 0.6 : 1
      },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    },
    {
      id: 'asn_errors',
      position: { x: 250, y: 180 },
      data: { label: hasShownRevision ? 'ASN Errors ⚠️' : 'ASN Errors' },
      style: { 
        background: hasShownRevision ? 'hsl(0, 84%, 60%)' : 'hsl(38, 92%, 50%)', 
        color: 'white', 
        borderRadius: '8px',
        padding: '6px 10px',
        fontSize: '10px',
        fontWeight: 500,
        border: hasShownRevision ? '3px solid hsl(0, 84%, 40%)' : 'none'
      },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    },
    {
      id: 'arabic_label',
      position: { x: 520, y: 180 },
      data: { label: 'Arabic Label Issues' },
      style: { 
        background: 'hsl(38, 92%, 50%)', 
        color: 'white', 
        borderRadius: '8px',
        padding: '6px 10px',
        fontSize: '10px',
        fontWeight: 500,
        border: 'none'
      },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    },
    {
      id: 'forwarder',
      position: { x: 80, y: 260 },
      data: { label: hasShownRevision ? 'Forwarder ✓' : 'Forwarder Switch' },
      style: { 
        background: hasShownRevision ? 'hsl(142, 76%, 36%)' : 'hsl(280, 67%, 52%)', 
        color: 'white', 
        borderRadius: '8px',
        padding: '6px 10px',
        fontSize: '10px',
        fontWeight: 500,
        border: 'none',
        opacity: hasShownRevision ? 0.6 : 1
      },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    },
    {
      id: 'sscc_missing',
      position: { x: 200, y: 260 },
      data: { label: 'SSCC Missing' },
      style: { 
        background: hasShownRevision ? 'hsl(0, 84%, 60%)' : 'hsl(280, 67%, 52%)', 
        color: 'white', 
        borderRadius: '8px',
        padding: '6px 10px',
        fontSize: '10px',
        fontWeight: 500,
        border: 'none'
      },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    },
    {
      id: 'carton_mismatch',
      position: { x: 320, y: 260 },
      data: { label: 'Carton Mismatch' },
      style: { 
        background: hasShownRevision ? 'hsl(0, 84%, 60%)' : 'hsl(280, 67%, 52%)', 
        color: 'white', 
        borderRadius: '8px',
        padding: '6px 10px',
        fontSize: '10px',
        fontWeight: 500,
        border: 'none'
      },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    },
    {
      id: 'template_update',
      position: { x: 520, y: 260 },
      data: { label: 'Template V2.3' },
      style: { 
        background: 'hsl(280, 67%, 52%)', 
        color: 'white', 
        borderRadius: '8px',
        padding: '6px 10px',
        fontSize: '10px',
        fontWeight: 500,
        border: 'none'
      },
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

  return (
    <div className="h-[280px] w-full border rounded-lg overflow-hidden bg-surface-sunken">
      <ReactFlow 
        nodes={baseNodes} 
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
      {hasShownRevision && (
        <div className="absolute top-2 right-2 p-1.5 bg-status-success-bg rounded text-[9px] text-status-success font-medium">
          Graph Updated
        </div>
      )}
    </div>
  );
};

const KPIChart = () => {
  const [showChangePoint, setShowChangePoint] = useState(true);
  const data = kpiTrendsData.SUP001.daily;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium">OTIF Trend (Jan 2024)</p>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 text-[10px]"
          onClick={() => setShowChangePoint(!showChangePoint)}
        >
          {showChangePoint ? 'Hide' : 'Show'} Change Point
        </Button>
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
              domain={[70, 100]} 
              tick={{ fontSize: 9 }}
              width={30}
            />
            <Tooltip 
              contentStyle={{ fontSize: '11px' }}
              labelFormatter={(v) => `Date: ${v}`}
            />
            {showChangePoint && (
              <ReferenceLine 
                x="2024-01-14" 
                stroke="hsl(0, 84%, 60%)" 
                strokeDasharray="4 4"
                label={{ value: 'Jan 14', position: 'top', fontSize: 9, fill: 'hsl(0, 84%, 60%)' }}
              />
            )}
            <Line 
              type="monotone" 
              dataKey="otif" 
              stroke="hsl(217, 91%, 50%)" 
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

const EvidenceCards = () => {
  const [openSection, setOpenSection] = useState<string | null>(null);
  
  const evidence = evidenceData;

  return (
    <div className="space-y-2">
      <Collapsible open={openSection === 'shipments'} onOpenChange={() => setOpenSection(openSection === 'shipments' ? null : 'shipments')}>
        <CollapsibleTrigger asChild>
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardContent className="p-3 flex items-center gap-3">
              <Ship className="w-4 h-4 text-status-warning" />
              <div className="flex-1">
                <p className="text-xs font-medium">Shipment Delays</p>
                <p className="text-[10px] text-muted-foreground">2 shipments affected, avg +3 days delay</p>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${openSection === 'shipments' ? 'rotate-180' : ''}`} />
            </CardContent>
          </Card>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-1 p-3 bg-muted/30 rounded-lg text-xs space-y-2">
            {evidence.shipmentDelays.map((s) => (
              <div key={s.id} className="p-2 bg-card rounded border">
                <p className="font-medium">{s.id}</p>
                <p className="text-muted-foreground">Forwarder: {s.forwarder}</p>
                <p className="text-status-danger">Port dwell: {s.portDwell} days (was {s.previousPortDwell})</p>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible open={openSection === 'compliance'} onOpenChange={() => setOpenSection(openSection === 'compliance' ? null : 'compliance')}>
        <CollapsibleTrigger asChild>
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardContent className="p-3 flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-status-danger" />
              <div className="flex-1">
                <p className="text-xs font-medium">Compliance Holds</p>
                <p className="text-[10px] text-muted-foreground">3 holds, Arabic label nonconformance</p>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${openSection === 'compliance' ? 'rotate-180' : ''}`} />
            </CardContent>
          </Card>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-1 p-3 bg-muted/30 rounded-lg text-xs space-y-2">
            {evidence.complianceHolds.map((c) => (
              <div key={c.id} className="p-2 bg-card rounded border">
                <p className="font-medium">{c.subcategory} - {c.skuCount} SKUs</p>
                <p className="text-muted-foreground">{c.issue}</p>
                <p className="text-[10px]">{c.details}</p>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible open={openSection === 'asn'} onOpenChange={() => setOpenSection(openSection === 'asn' ? null : 'asn')}>
        <CollapsibleTrigger asChild>
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardContent className="p-3 flex items-center gap-3">
              <FileText className="w-4 h-4 text-status-warning" />
              <div className="flex-1">
                <p className="text-xs font-medium">ASN Errors</p>
                <p className="text-[10px] text-muted-foreground">3 ASN issues, GRN delays up to 4.2h</p>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${openSection === 'asn' ? 'rotate-180' : ''}`} />
            </CardContent>
          </Card>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-1 p-3 bg-muted/30 rounded-lg text-xs space-y-2">
            {evidence.asnErrors.map((a) => (
              <div key={a.id} className="p-2 bg-card rounded border">
                <p className="font-medium">{a.errorType}</p>
                <p className="text-muted-foreground">GRN Delay: +{a.grnDelay}h</p>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export const ExplainPanel = () => {
  const { selectedSupplierId, investigationStatus, confidenceScore, hasShownRevision, isRevising } = useAppStore();
  
  const supplier = suppliersData.suppliers.find(s => s.id === selectedSupplierId);

  if (!selectedSupplierId) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Select a supplier to investigate</p>
        </div>
      </div>
    );
  }

  const showCompleted = investigationStatus === 'completed' || investigationStatus === 'revising';

  return (
    <div className="flex flex-col gap-4 h-full overflow-auto scrollbar-thin pr-1">
      {/* Investigation Header */}
      <Card className="card-elevated">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Investigation: {supplier?.name} → {supplier?.primaryDC}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge 
                className={`text-[10px] ${
                  investigationStatus === 'running' 
                    ? 'bg-status-info text-white' 
                    : investigationStatus === 'revising'
                      ? 'bg-status-warning text-white'
                      : investigationStatus === 'completed' 
                        ? 'bg-status-success text-white' 
                        : 'bg-muted text-muted-foreground'
                }`}
              >
                {investigationStatus === 'running' ? 'Running' : 
                 investigationStatus === 'revising' ? 'Revising' :
                 investigationStatus === 'completed' ? 'Completed' : 'Pending'}
              </Badge>
              {showCompleted && (
                <Badge variant="outline" className="text-[10px]">
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
      {showCompleted && (
        <>
          <Card className="card-elevated border-l-4 border-l-primary animate-fade-in">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-xs font-medium text-primary">Root Cause Analysis</p>
                  <p className="text-sm leading-relaxed">
                    {hasShownRevision ? (
                      <>
                        <strong className="text-status-success">[REVISED]</strong> OTIF fell from <strong>94% to 76%</strong> starting Jan 14. 
                        <strong className="text-status-danger"> Primary driver: ASN mapping errors</strong> (carton count mismatches, missing SSCC barcodes) causing 
                        GRN delays of 4-6 hours. Port dwell has <strong className="text-status-success">normalized to 1.9 days</strong> after QuickFreight stabilized operations. 
                        Arabic label compliance (Template V2.3) remains a secondary factor affecting 26 SKUs.
                      </>
                    ) : (
                      <>
                        OTIF fell from <strong>94% to 76%</strong> starting Jan 14. Primary drivers: 
                        (1) port-to-DC lead time <strong>+2.3 days</strong> on Mundra→Jebel Ali due to forwarder switch to QuickFreight Logistics, 
                        (2) DXB compliance holds from <strong>Arabic care-label nonconformance</strong> across 3 towel subcategories (Template V2.3 applied instead of approved V2.1), and 
                        (3) ASN accuracy dropped to <strong>91.1%</strong>, causing carton count mismatches and missing SSCC barcodes, slowing receiving and triggering partial GRNs.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hypothesis Revision Card */}
          <HypothesisRevisionCard />

          {/* Evidence Cards */}
          <div className="animate-slide-in-right">
            <p className="section-header">Supporting Evidence</p>
            <EvidenceCards />
          </div>

          {/* Root Cause Graph */}
          <div className="animate-slide-in-right relative" style={{ animationDelay: '100ms' }}>
            <p className="section-header">Causal Graph</p>
            <RootCauseGraph />
          </div>

          {/* KPI Chart */}
          <Card className="card-elevated animate-slide-in-right" style={{ animationDelay: '200ms' }}>
            <CardContent className="p-4">
              <KPIChart />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
