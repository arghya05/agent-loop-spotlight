import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { supplyChainAgents } from '@/data/supplyChainAgents';
import { supplyChainSignals } from '@/data/supplyChainSignals';
import { getAgentContext, type AgentContextConfig } from '@/data/supplyChainAgentContext';
import { BarChart, Bar, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BarChart3, Bot, CheckCircle2, Download, History, Loader2, Play, Plug, RefreshCw, Save, Settings, XCircle } from 'lucide-react';

interface SupplyChainUtilityPageProps {
  type: 'analytics' | 'connectors' | 'settings' | 'admin';
}

const getAgent = (agentId?: string) => supplyChainAgents.find((agent) => agent.id === agentId) || supplyChainAgents.find((agent) => agent.id === 'demand-sensing') || supplyChainAgents[0];

export const SupplyChainUtilityPage = ({ type }: SupplyChainUtilityPageProps) => {
  const { agentId } = useParams();
  const agent = getAgent(agentId);
  const context = getAgentContext(agent.id);

  if (type === 'analytics') return <SupplyChainAnalytics agentId={agent.id} agentLabel={agent.label} />;
  if (type === 'connectors') return <SupplyChainConnectors agent={agent} context={context} />;
  if (type === 'settings') return <SupplyChainSettings agent={agent} context={context} />;
  return <SupplyChainAdmin currentAgentId={agent.id} />;
};

const SupplyChainAnalytics = ({ agentId, agentLabel }: { agentId: string; agentLabel: string }) => {
  const signals = supplyChainSignals.filter((signal) => signal.agentId === agentId);
  const bucketData = [
    { name: 'Breached', value: signals.filter((signal) => signal.bucket === 'breached').length, color: 'hsl(var(--status-danger))' },
    { name: 'At Risk', value: signals.filter((signal) => signal.bucket === 'at-risk').length, color: 'hsl(var(--status-warning))' },
    { name: 'Optimized', value: signals.filter((signal) => signal.bucket === 'optimized').length, color: 'hsl(var(--status-success))' },
  ];
  const severityData = ['critical', 'high', 'medium', 'low'].map((severity) => ({
    severity,
    count: signals.filter((signal) => signal.severity === severity).length,
  }));
  const trend = [
    { week: 'W1', health: 74, exceptions: 17 },
    { week: 'W2', health: 79, exceptions: 13 },
    { week: 'W3', health: 83, exceptions: 10 },
    { week: 'W4', health: 88, exceptions: 7 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1"><BarChart3 className="w-5 h-5 text-primary" /><h1 className="text-2xl font-bold text-foreground">{agentLabel} Analytics</h1></div>
          <p className="text-sm text-muted-foreground">Signal mix, severity exposure, and recovery trend for this supply-chain agent</p>
        </div>
        <Button variant="outline" onClick={() => toast.success('Supply-chain analytics report exported')}><Download className="w-4 h-4 mr-2" />Export Report</Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Agent Health', value: '88%' },
          { label: 'Breached', value: bucketData[0].value },
          { label: 'At Risk', value: bucketData[1].value },
          { label: 'Impact Protected', value: `AED ${(signals.reduce((sum, signal) => sum + signal.estimatedImpact, 0) / 1000).toFixed(0)}K` },
        ].map((item) => (
          <Card key={item.label} className="card-elevated"><CardContent className="pt-4"><p className="text-xs text-muted-foreground">{item.label}</p><p className="text-2xl font-bold mt-1">{item.value}</p></CardContent></Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="card-elevated">
          <CardHeader><CardTitle className="text-sm">Signal Mix</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart><Pie data={bucketData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={88} label>{bucketData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip /><Legend /></PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardHeader><CardTitle className="text-sm">Severity Mix</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={severityData}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="severity" tick={{ fontSize: 12 }} /><YAxis allowDecimals={false} tick={{ fontSize: 12 }} /><Tooltip /><Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} /></BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="card-elevated col-span-2">
          <CardHeader><CardTitle className="text-sm">Recovery Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trend}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="week" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip /><Legend /><Line type="monotone" dataKey="health" stroke="hsl(var(--primary))" strokeWidth={2} name="Health Score" /><Line type="monotone" dataKey="exceptions" stroke="hsl(var(--status-danger))" strokeWidth={2} name="Open Exceptions" /></LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

import type { SupplyChainAgent } from '@/data/supplyChainAgents';

const fallbackConnectors: AgentContextConfig['connectors'] = [
  { id: 'oms', name: 'OMS / Order Feed', description: 'Orders, reservations, promise dates, and customer SLAs', endpoint: 'oms-gcc/v2/events', system: 'IBM Sterling OMS' },
  { id: 'wms', name: 'WMS / Inventory Feed', description: 'On-hand, inbound, dock, wave, and pick-pack status', endpoint: 'wms-network/v4/nodes', system: 'Manhattan Active WM' },
  { id: 'tms', name: 'TMS / Carrier EDI', description: 'Shipment status, ETA, carrier, lane, and cost updates', endpoint: 'tms-control/v3/loads', system: 'Oracle TMS' },
  { id: 'forecast', name: 'Forecast & Demand Lake', description: 'POS, ecom, events, weather, and elasticity inputs', endpoint: 'forecast-lake/v1/signals', system: 'SAP IBP' },
];

const SupplyChainConnectors = ({ agent, context }: { agent: SupplyChainAgent; context?: AgentContextConfig }) => {
  const templates = context?.connectors ?? fallbackConnectors;
  const [connectors, setConnectors] = useState(templates.map((connector, index) => ({ ...connector, status: index === templates.length - 1 ? 'configured' : 'connected', lastSync: index === templates.length - 1 ? '' : new Date(Date.now() - (index + 1) * 900000).toISOString() })));
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const sync = async (connector: typeof connectors[number]) => {
    setSyncingId(connector.id);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setConnectors((items) => items.map((item) => item.id === connector.id ? { ...item, status: 'connected', lastSync: new Date().toISOString() } : item));
    setSyncingId(null);
    toast.success(`${connector.name} synced`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><div className="flex items-center gap-2 mb-1"><Plug className="w-5 h-5 text-primary" /><h1 className="text-2xl font-bold text-foreground">{agent.label} · Connectors</h1></div><p className="text-sm text-muted-foreground">Live operational feeds this agent depends on</p></div>
        <Button onClick={() => toast.success('Connector marketplace opened')}><Plug className="w-4 h-4 mr-2" />Add Connector</Button>
      </div>
      <div className="grid grid-cols-2 gap-6">
        {connectors.map((connector) => (
          <Card key={connector.id} className="card-elevated">
            <CardHeader className="pb-2"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', connector.status === 'connected' ? 'bg-status-success/10' : 'bg-muted')}><Plug className={cn('w-5 h-5', connector.status === 'connected' ? 'text-status-success' : 'text-muted-foreground')} /></div><div><CardTitle className="text-base">{connector.name}</CardTitle><p className="text-xs text-muted-foreground">{connector.description}</p></div></div><Badge variant={connector.status === 'connected' ? 'default' : 'outline'} className="text-xs">{connector.status === 'connected' ? <><CheckCircle2 className="w-3 h-3 mr-1" />Connected</> : <><XCircle className="w-3 h-3 mr-1" />Configured</>}</Badge></div></CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-muted/50 text-sm space-y-1">
                <div className="flex justify-between"><span className="text-muted-foreground">System</span><span className="font-medium">{connector.system}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Endpoint</span><span className="font-mono text-xs truncate max-w-[220px]" title={connector.endpoint}>{connector.endpoint}</span></div>
              </div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Last Sync</span><span className="font-medium">{connector.lastSync ? new Date(connector.lastSync).toLocaleString() : 'Never'}</span></div>
              <Button size="sm" variant="outline" className="w-full" onClick={() => sync(connector)} disabled={syncingId === connector.id}>{syncingId === connector.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}{syncingId === connector.id ? 'Syncing...' : 'Sync Now'}</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const fallbackThresholds: AgentContextConfig['thresholds'] = [
  { key: 'confidenceFloor', label: 'Confidence floor', value: '0.82', help: 'Minimum confidence to auto-propose.' },
  { key: 'breachSlaHours', label: 'Breach SLA (hours)', value: '4', help: 'Time to resolve after a breach fires.' },
  { key: 'impactEscalationAED', label: 'Impact escalation (AED)', value: '50000', help: 'Auto-escalate above this impact.' },
];
const fallbackGuardrails: AgentContextConfig['guardrails'] = [
  { label: 'Require human approval for critical fixes', defaultOn: true, help: 'Critical severity actions gated on human sign-off.' },
  { label: 'Block margin-negative recommendations', defaultOn: true, help: 'Never propose actions that erode margin.' },
  { label: 'Notify downstream agents automatically', defaultOn: true, help: 'Push handoffs to dependent agents.' },
];
const fallbackSchedules: AgentContextConfig['schedules'] = [
  { key: 'Intraday refresh', value: 'Every 15 min', help: 'Standard sense cycle.' },
  { key: 'Daily summary', value: '06:30 GST', help: 'Overnight recap.' },
  { key: 'Escalation digest', value: 'Every 2 hours', help: 'Aging breaches digest.' },
];

const SupplyChainSettings = ({ agent, context }: { agent: SupplyChainAgent; context?: AgentContextConfig }) => {
  const [hasChanges, setHasChanges] = useState(false);
  const thresholds = context?.thresholds ?? fallbackThresholds;
  const guardrails = context?.guardrails ?? fallbackGuardrails;
  const schedules = context?.schedules ?? fallbackSchedules;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><div className="flex items-center gap-2 mb-1"><Settings className="w-5 h-5 text-primary" /><h1 className="text-2xl font-bold text-foreground">{agent.label} · Settings</h1></div><p className="text-sm text-muted-foreground">Thresholds, guardrails, and schedules tuned for this agent</p></div>
        <Button disabled={!hasChanges} onClick={() => { setHasChanges(false); toast.success(`${agent.shortLabel} settings saved`); }}><Save className="w-4 h-4 mr-2" />Save Changes</Button>
      </div>
      <Tabs defaultValue="thresholds">
        <TabsList><TabsTrigger value="thresholds">Thresholds</TabsTrigger><TabsTrigger value="guardrails">Guardrails</TabsTrigger><TabsTrigger value="automation">Schedule</TabsTrigger></TabsList>
        <TabsContent value="thresholds" className="mt-4">
          <Card className="card-elevated"><CardHeader><CardTitle className="text-sm">Decision Thresholds</CardTitle></CardHeader><CardContent className="space-y-4">
            {thresholds.map((threshold) => (
              <div key={threshold.key} className="flex items-start justify-between gap-4">
                <div className="flex-1"><Label className="text-sm">{threshold.label}</Label><p className="text-xs text-muted-foreground mt-0.5">{threshold.help}</p></div>
                <div className="flex items-center gap-2"><Input className="w-28 text-right" defaultValue={threshold.value} onChange={() => setHasChanges(true)} />{threshold.unit && <span className="text-xs text-muted-foreground w-16">{threshold.unit}</span>}</div>
              </div>
            ))}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="guardrails" className="mt-4">
          <Card className="card-elevated"><CardHeader><CardTitle className="text-sm">Operational Guardrails</CardTitle></CardHeader><CardContent className="space-y-4">
            {guardrails.map((guardrail) => (
              <div key={guardrail.label} className="flex items-start justify-between gap-4">
                <div className="flex-1"><Label className="text-sm">{guardrail.label}</Label><p className="text-xs text-muted-foreground mt-0.5">{guardrail.help}</p></div>
                <Switch defaultChecked={guardrail.defaultOn} onCheckedChange={() => setHasChanges(true)} />
              </div>
            ))}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="automation" className="mt-4">
          <Card className="card-elevated"><CardHeader><CardTitle className="text-sm">Run Schedule</CardTitle></CardHeader><CardContent className="space-y-4">
            {schedules.map((schedule) => (
              <div key={schedule.key} className="flex items-start justify-between gap-4">
                <div className="flex-1"><Label className="text-sm">{schedule.key}</Label><p className="text-xs text-muted-foreground mt-0.5">{schedule.help}</p></div>
                <Input className="w-40 text-right" defaultValue={schedule.value} onChange={() => setHasChanges(true)} />
              </div>
            ))}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const existingSupplyIds = new Set(['supplier-performance', 'dispatch-readiness', 'supplier-onboarding', 'invoice-cash-ops', 'contract-lifecycle', 'pricing-intelligence', 'autonomous-inventory', 'product-onboarding']);

const SupplyChainAdmin = ({ currentAgentId }: { currentAgentId: string }) => {
  const [agents, setAgents] = useState(supplyChainAgents.filter((agent) => !existingSupplyIds.has(agent.id)).map((agent, index) => ({ ...agent, active: true, schedule: index % 2 ? 'Every 30 min' : 'Every 15 min', lastRun: new Date(Date.now() - (index + 1) * 900000).toISOString() })));
  const currentAgent = agents.find((agent) => agent.id === currentAgentId);
  const currentContext = getAgentContext(currentAgentId);

  return (
    <div className="p-6 space-y-6">
      <div><div className="flex items-center gap-2 mb-1"><Bot className="w-5 h-5 text-primary" /><h1 className="text-2xl font-bold text-foreground">Agent Administration</h1></div><p className="text-sm text-muted-foreground">Focused on {currentAgent?.label ?? 'this agent'} with peer view of the supply-chain roster</p></div>

      {currentAgent && currentContext && (
        <Card className="card-elevated border-primary/40">
          <CardHeader><div className="flex items-center justify-between"><div><CardTitle className="text-base">{currentAgent.label} — Control Center</CardTitle><p className="text-xs text-muted-foreground mt-1">{currentAgent.mission}</p></div><Switch checked={currentAgent.active} onCheckedChange={(checked) => setAgents((items) => items.map((item) => item.id === currentAgent.id ? { ...item, active: checked } : item))} /></div></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2"><p className="text-xs uppercase text-muted-foreground">KPI focus</p><p>{currentContext.admin.kpiFocus}</p></div>
            <div className="space-y-2"><p className="text-xs uppercase text-muted-foreground">Escalation owner</p><p>{currentContext.admin.escalationOwner}</p></div>
            <div className="space-y-2"><p className="text-xs uppercase text-muted-foreground">Upstream agents</p><div className="flex flex-wrap gap-1">{currentContext.admin.upstream.map((upstream) => <Badge key={upstream} variant="outline" className="text-xs">{upstream}</Badge>)}</div></div>
            <div className="space-y-2"><p className="text-xs uppercase text-muted-foreground">Downstream agents</p><div className="flex flex-wrap gap-1">{currentContext.admin.downstream.map((downstream) => <Badge key={downstream} variant="outline" className="text-xs">{downstream}</Badge>)}</div></div>
            <div className="col-span-2 flex gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={() => toast.success(`${currentAgent.label} logs opened`)}><History className="w-3 h-3 mr-1" />Audit Log</Button>
              <Button size="sm" onClick={() => toast.success(`${currentAgent.label} run triggered`)}><Play className="w-3 h-3 mr-1" />Run Now</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Other supply-chain agents</h2>
        <div className="grid grid-cols-2 gap-4">
          {agents.filter((agent) => agent.id !== currentAgentId).map((agent) => (
            <Card key={agent.id} className="card-elevated"><CardContent className="pt-4"><div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><Bot className="w-5 h-5 text-primary" /><h3 className="font-semibold text-sm">{agent.label}</h3></div><Switch checked={agent.active} onCheckedChange={(checked) => setAgents((items) => items.map((item) => item.id === agent.id ? { ...item, active: checked } : item))} /></div><p className="text-xs text-muted-foreground mb-3">{agent.mission}</p><div className="space-y-2 text-xs"><div className="flex justify-between"><span className="text-muted-foreground">Schedule</span><span>{agent.schedule}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Last Run</span><span>{new Date(agent.lastRun).toLocaleString()}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Primary KPI</span><span>{agent.primaryKpi}</span></div></div><div className="flex gap-2 mt-3"><Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => toast.success(`${agent.label} logs opened`)}><History className="w-3 h-3 mr-1" />Logs</Button><Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => toast.success(`${agent.label} run triggered`)}><Play className="w-3 h-3 mr-1" />Run Now</Button></div></CardContent></Card>
          ))}
        </div>
      </div>
    </div>
  );
};