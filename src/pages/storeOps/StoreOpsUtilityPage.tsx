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
import { getStoreAgent, storeBucketMeta, storeOpsAgents, storeOpsConnectors, storeOpsSettings, storeOpsSignals } from '@/data/storeOps';
import { BarChart, Bar, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BarChart3, Bot, CheckCircle2, Download, History, Loader2, Plug, RefreshCw, Save, Settings, Store, XCircle, Play } from 'lucide-react';

interface StoreOpsUtilityPageProps {
  type: 'analytics' | 'connectors' | 'settings' | 'admin';
}

export const StoreOpsUtilityPage = ({ type }: StoreOpsUtilityPageProps) => {
  const { agentId } = useParams();
  const agent = getStoreAgent(agentId);

  if (type === 'analytics') return <StoreOpsAnalytics agentId={agent.id} agentLabel={agent.label} />;
  if (type === 'connectors') return <StoreOpsConnectors />;
  if (type === 'settings') return <StoreOpsSettings />;
  return <StoreOpsAdmin />;
};

const StoreOpsAnalytics = ({ agentId, agentLabel }: { agentId: string; agentLabel: string }) => {
  const signals = storeOpsSignals.filter((signal) => signal.agentId === agentId);
  const bucketData = [
    { name: 'Breached', value: signals.filter((signal) => signal.bucket === 'breached').length, color: 'hsl(var(--status-danger))' },
    { name: 'At Risk', value: signals.filter((signal) => signal.bucket === 'at-risk').length, color: 'hsl(var(--status-warning))' },
    { name: 'Optimized', value: signals.filter((signal) => signal.bucket === 'optimized').length, color: 'hsl(var(--status-success))' },
  ];
  const categoryData = ['Grocery', 'Fashion', 'Jewellery', 'Cosmetics', 'Toys'].map((category) => ({
    category,
    breached: signals.filter((signal) => signal.category === category && signal.bucket === 'breached').length,
    atRisk: signals.filter((signal) => signal.category === category && signal.bucket === 'at-risk').length,
  }));
  const trend = [
    { week: 'W1', health: 78, exceptions: 19 },
    { week: 'W2', health: 81, exceptions: 16 },
    { week: 'W3', health: 84, exceptions: 12 },
    { week: 'W4', health: 88, exceptions: 9 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">{agentLabel} Analytics</h1>
          </div>
          <p className="text-sm text-muted-foreground">Store exception trends, category breach mix, and operational recovery reporting</p>
        </div>
        <Button variant="outline" onClick={() => toast.success('Store ops analytics report exported')}><Download className="w-4 h-4 mr-2" />Export Report</Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Store Health', value: '88%' },
          { label: 'Breached', value: bucketData[0].value },
          { label: 'At Risk', value: bucketData[1].value },
          { label: 'Impact Protected', value: `$${(signals.reduce((sum, signal) => sum + signal.estimatedImpact, 0) / 1000).toFixed(0)}K` },
        ].map((item) => (
          <Card key={item.label} className="card-elevated">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-2xl font-bold mt-1">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="card-elevated">
          <CardHeader><CardTitle className="text-sm">Exception Mix</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={bucketData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={88} label>
                  {bucketData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardHeader><CardTitle className="text-sm">Category Breaches</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="breached" fill="hsl(var(--status-danger))" name="Breached" radius={[4, 4, 0, 0]} />
                <Bar dataKey="atRisk" fill="hsl(var(--status-warning))" name="At Risk" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="card-elevated col-span-2">
          <CardHeader><CardTitle className="text-sm">Store Health Recovery Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="health" stroke="hsl(var(--primary))" strokeWidth={2} name="Health Score" />
                <Line type="monotone" dataKey="exceptions" stroke="hsl(var(--status-danger))" strokeWidth={2} name="Open Exceptions" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const StoreOpsConnectors = () => {
  const [connectors, setConnectors] = useState(storeOpsConnectors);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const sync = async (connector: typeof storeOpsConnectors[number]) => {
    setSyncingId(connector.id);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setConnectors((items) => items.map((item) => item.id === connector.id ? { ...item, status: 'connected', lastSync: new Date().toISOString() } : item));
    setSyncingId(null);
    toast.success(`${connector.name} synced`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1"><Plug className="w-5 h-5 text-primary" /><h1 className="text-2xl font-bold text-foreground">Store Ops Connectors</h1></div>
          <p className="text-sm text-muted-foreground">POS, WFM, inventory, queue, planogram, and CRM integrations for store agents</p>
        </div>
        <Button onClick={() => toast.success('Connector marketplace opened')}><Plug className="w-4 h-4 mr-2" />Add Connector</Button>
      </div>
      <div className="grid grid-cols-2 gap-6">
        {connectors.map((connector) => (
          <Card key={connector.id} className="card-elevated">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3"><div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', connector.status === 'connected' ? 'bg-status-success/10' : 'bg-muted')}><Plug className={cn('w-5 h-5', connector.status === 'connected' ? 'text-status-success' : 'text-muted-foreground')} /></div><div><CardTitle className="text-base">{connector.name}</CardTitle><p className="text-xs text-muted-foreground">{connector.description}</p></div></div>
                <Badge variant={connector.status === 'connected' ? 'default' : 'outline'} className="text-xs">{connector.status === 'connected' ? <><CheckCircle2 className="w-3 h-3 mr-1" />Connected</> : <><XCircle className="w-3 h-3 mr-1" />Configured</>}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-muted/50 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">Endpoint</span><span className="font-medium text-xs">{connector.endpoint}</span></div></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Last Sync</span><span className="font-medium">{connector.lastSync ? new Date(connector.lastSync).toLocaleString() : 'Never'}</span></div>
              <Button size="sm" variant="outline" className="w-full" onClick={() => sync(connector)} disabled={syncingId === connector.id}>{syncingId === connector.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}{syncingId === connector.id ? 'Syncing...' : 'Sync Now'}</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const StoreOpsSettings = () => {
  const [hasChanges, setHasChanges] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1"><Settings className="w-5 h-5 text-primary" /><h1 className="text-2xl font-bold text-foreground">Store Ops Settings</h1></div>
          <p className="text-sm text-muted-foreground">Category rules, guardrails, automation controls, and field notification settings</p>
        </div>
        <Button disabled={!hasChanges} onClick={() => { setHasChanges(false); toast.success('Store ops settings saved'); }}><Save className="w-4 h-4 mr-2" />Save Changes</Button>
      </div>
      <Tabs defaultValue="rules">
        <TabsList>
          <TabsTrigger value="rules">Category Rules</TabsTrigger>
          <TabsTrigger value="guardrails">Guardrails</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>
        <TabsContent value="rules" className="mt-4">
          <Card className="card-elevated"><CardHeader><CardTitle className="text-sm">Retail Category Logic</CardTitle></CardHeader><CardContent className="space-y-3">{storeOpsSettings.categoryRules.map((rule) => <div key={rule.category} className="p-3 rounded-lg border border-border bg-muted/30"><div className="flex items-center justify-between mb-1"><p className="font-medium text-sm">{rule.category}</p><Badge variant="outline" className="text-[10px]">{rule.threshold}</Badge></div><p className="text-xs text-muted-foreground">{rule.rule}</p></div>)}</CardContent></Card>
        </TabsContent>
        <TabsContent value="guardrails" className="mt-4">
          <Card className="card-elevated"><CardHeader><CardTitle className="text-sm">Operational Guardrails</CardTitle></CardHeader><CardContent className="space-y-4">{Object.entries(storeOpsSettings.guardrails).map(([key, value]) => <div key={key} className="flex items-center justify-between"><Label className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label><Input className="w-32 text-right" defaultValue={String(value)} onChange={() => setHasChanges(true)} /></div>)}</CardContent></Card>
        </TabsContent>
        <TabsContent value="automation" className="mt-4">
          <Card className="card-elevated"><CardHeader><CardTitle className="text-sm">Automation Toggles</CardTitle></CardHeader><CardContent className="space-y-4">{Object.entries(storeOpsSettings.automation).map(([key, value]) => <div key={key} className="flex items-center justify-between"><Label className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label><Switch defaultChecked={value} onCheckedChange={() => setHasChanges(true)} /></div>)}</CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const StoreOpsAdmin = () => {
  const [agents, setAgents] = useState(storeOpsAgents.map((agent, index) => ({ ...agent, active: true, schedule: index % 2 ? 'Every 30 min' : 'Every 15 min', lastRun: new Date(Date.now() - (index + 1) * 900000).toISOString() })));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1"><Bot className="w-5 h-5 text-primary" /><h1 className="text-2xl font-bold text-foreground">Store Ops Agent Administration</h1></div>
          <p className="text-sm text-muted-foreground">Enable, schedule, run, and audit all Store Ops agents independently from Supply Chain agents</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {agents.map((agent) => (
          <Card key={agent.id} className="card-elevated">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><Store className="w-5 h-5 text-primary" /><h3 className="font-semibold text-sm">{agent.label}</h3></div><Switch checked={agent.active} onCheckedChange={(checked) => setAgents((items) => items.map((item) => item.id === agent.id ? { ...item, active: checked } : item))} /></div>
              <p className="text-xs text-muted-foreground mb-3">{agent.mission}</p>
              <div className="space-y-2 text-xs"><div className="flex justify-between"><span className="text-muted-foreground">Schedule</span><span>{agent.schedule}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Last Run</span><span>{new Date(agent.lastRun).toLocaleString()}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Primary KPI</span><span>{agent.primaryKpi}</span></div></div>
              <div className="flex gap-2 mt-3"><Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => toast.success(`${agent.label} logs opened`)}><History className="w-3 h-3 mr-1" />Logs</Button><Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => toast.success(`${agent.label} run triggered`)}><Play className="w-3 h-3 mr-1" />Run Now</Button></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
