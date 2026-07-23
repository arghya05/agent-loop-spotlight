import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { getStoreAgent, storeOpsAgents } from '@/data/storeOps';
import { getStoreAgentContext } from '@/data/storeOpsAgentContext';
import { BarChart, Bar, CartesianGrid, Cell, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BarChart3, Bot, CheckCircle2, Download, History, Loader2, Plug, RefreshCw, Save, Settings, Store, XCircle, Play } from 'lucide-react';

interface StoreOpsUtilityPageProps {
  type: 'analytics' | 'connectors' | 'settings' | 'admin';
}

export const StoreOpsUtilityPage = ({ type }: StoreOpsUtilityPageProps) => {
  const { agentId } = useParams();
  const agent = getStoreAgent(agentId);

  if (type === 'analytics') return <StoreOpsAnalytics agentId={agent.id} agentLabel={agent.label} />;
  if (type === 'connectors') return <StoreOpsConnectors agentId={agent.id} agentLabel={agent.label} />;
  if (type === 'settings') return <StoreOpsSettings agentId={agent.id} agentLabel={agent.label} />;
  return <StoreOpsAdmin />;
};

const StoreOpsAnalytics = ({ agentId, agentLabel }: { agentId: string; agentLabel: string }) => {
  const cfg = getStoreAgentContext(agentId).analytics;
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">{agentLabel} Analytics</h1>
          </div>
          <p className="text-sm text-muted-foreground">{cfg.headline}</p>
        </div>
        <Button variant="outline" onClick={() => toast.success(`${agentLabel} report exported`)}><Download className="w-4 h-4 mr-2" />Export Report</Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {cfg.kpis.map((k) => (
          <Card key={k.label} className="card-elevated">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">{k.label}</p>
              <p className="text-2xl font-bold mt-1">{k.value}</p>
              <p className={cn('text-[11px] mt-1', k.positive ? 'text-status-success' : 'text-status-danger')}>{k.delta}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="card-elevated">
          <CardHeader><CardTitle className="text-sm">{cfg.trend.title}</CardTitle><p className="text-xs text-muted-foreground">{cfg.trend.subtitle}</p></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={cfg.trend.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey={cfg.trend.xKey} tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                {cfg.trend.series.map((s) => (
                  <Line key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={2} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardHeader><CardTitle className="text-sm">{cfg.distribution.title}</CardTitle><p className="text-xs text-muted-foreground">{cfg.distribution.subtitle}</p></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={cfg.distribution.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                  {cfg.distribution.data.map((d, i) => <Cell key={i} fill={d.color || 'hsl(var(--primary))'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="card-elevated col-span-2">
          <CardHeader><CardTitle className="text-sm">Highlights</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-3 gap-3">
            {cfg.highlights.map((h) => (
              <div key={h.label} className="p-3 rounded-lg border border-border bg-muted/30">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{h.label}</p>
                <p className="text-base font-semibold mt-1">{h.value}</p>
                <p className="text-xs text-muted-foreground">{h.hint}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const StoreOpsConnectors = ({ agentId, agentLabel }: { agentId: string; agentLabel: string }) => {
  const [connectors, setConnectors] = useState(getStoreAgentContext(agentId).connectors);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const sync = async (id: string, name: string) => {
    setSyncingId(id);
    await new Promise((r) => setTimeout(r, 800));
    setConnectors((items) => items.map((item) => item.id === id ? { ...item, status: 'connected', lastSync: new Date().toISOString() } : item));
    setSyncingId(null);
    toast.success(`${name} synced`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1"><Plug className="w-5 h-5 text-primary" /><h1 className="text-2xl font-bold text-foreground">{agentLabel} Connectors</h1></div>
          <p className="text-sm text-muted-foreground">Systems this agent reads from and writes to</p>
        </div>
        <Button onClick={() => toast.success('Connector marketplace opened')}><Plug className="w-4 h-4 mr-2" />Add Connector</Button>
      </div>
      <div className="grid grid-cols-2 gap-6">
        {connectors.map((c) => (
          <Card key={c.id} className="card-elevated">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', c.status === 'connected' ? 'bg-status-success/10' : 'bg-muted')}>
                    <Plug className={cn('w-5 h-5', c.status === 'connected' ? 'text-status-success' : 'text-muted-foreground')} />
                  </div>
                  <div>
                    <CardTitle className="text-base">{c.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{c.description}</p>
                  </div>
                </div>
                <Badge variant={c.status === 'connected' ? 'default' : 'outline'} className="text-xs">
                  {c.status === 'connected' ? <><CheckCircle2 className="w-3 h-3 mr-1" />Connected</> : <><XCircle className="w-3 h-3 mr-1" />Configured</>}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Endpoint</span><span className="font-medium text-xs">{c.endpoint}</span></div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Last Sync</span>
                <span className="font-medium">{c.lastSync ? new Date(c.lastSync).toLocaleString() : 'Never'}</span>
              </div>
              <Button size="sm" variant="outline" className="w-full" onClick={() => sync(c.id, c.name)} disabled={syncingId === c.id}>
                {syncingId === c.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                {syncingId === c.id ? 'Syncing...' : 'Sync Now'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const StoreOpsSettings = ({ agentId, agentLabel }: { agentId: string; agentLabel: string }) => {
  const settings = useMemo(() => getStoreAgentContext(agentId).settings, [agentId]);
  const [hasChanges, setHasChanges] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1"><Settings className="w-5 h-5 text-primary" /><h1 className="text-2xl font-bold text-foreground">{agentLabel} Settings</h1></div>
          <p className="text-sm text-muted-foreground">Thresholds, guardrails, and automation switches specific to this agent</p>
        </div>
        <Button disabled={!hasChanges} onClick={() => { setHasChanges(false); toast.success(`${agentLabel} settings saved`); }}><Save className="w-4 h-4 mr-2" />Save Changes</Button>
      </div>
      <div className="grid grid-cols-2 gap-6">
        {settings.map((group) => (
          <Card key={group.title} className="card-elevated">
            <CardHeader><CardTitle className="text-sm">{group.title}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {group.fields.map((f) => (
                <div key={f.key} className="flex items-center justify-between gap-4">
                  <Label className="text-sm">{f.label}</Label>
                  {f.kind === 'toggle'
                    ? <Switch defaultChecked={f.value as boolean} onCheckedChange={() => setHasChanges(true)} />
                    : <Input className="w-32 text-right" defaultValue={String(f.value)} onChange={() => setHasChanges(true)} />}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
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
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2"><Store className="w-5 h-5 text-primary" /><h3 className="font-semibold text-sm">{agent.label}</h3></div>
                <Switch checked={agent.active} onCheckedChange={(checked) => setAgents((items) => items.map((item) => item.id === agent.id ? { ...item, active: checked } : item))} />
              </div>
              <p className="text-xs text-muted-foreground mb-3">{agent.mission}</p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Schedule</span><span>{agent.schedule}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Last Run</span><span>{new Date(agent.lastRun).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Primary KPI</span><span>{agent.primaryKpi}</span></div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => toast.success(`${agent.label} logs opened`)}><History className="w-3 h-3 mr-1" />Logs</Button>
                <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => toast.success(`${agent.label} run triggered`)}><Play className="w-3 h-3 mr-1" />Run Now</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
