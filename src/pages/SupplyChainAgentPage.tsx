import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supplyChainAgents } from '@/data/supplyChainAgents';
import { ArrowLeft, Sparkles, Target, Workflow, Activity } from 'lucide-react';

export const SupplyChainAgentPage = () => {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const agent = supplyChainAgents.find((a) => a.id === agentId);

  if (!agent) {
    return (
      <div className="p-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/landing')}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <p className="mt-4 text-sm text-muted-foreground">Agent not found.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Badge variant="outline" className="mb-2 text-[10px] bg-primary/10 text-primary border-primary/20">
            <Sparkles className="w-3 h-3 mr-1" /> SUPPLY CHAIN AGENT
          </Badge>
          <h1 className="text-2xl font-bold">{agent.label}</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-3xl">{agent.mission}</p>
        </div>
        <Badge className="bg-status-success/10 text-status-success border-status-success/20">Active</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-elevated">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" /> Primary KPI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{agent.primaryKpi}</p>
          </CardContent>
        </Card>
        <Card className="card-elevated md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" /> What this agent does
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{agent.description}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Workflow className="w-4 h-4" /> How it works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {agent.workflow.map((step, i) => (
              <li key={i} className="flex gap-3 items-start">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </div>
                <p className="text-sm pt-0.5">{step}</p>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <div className="rounded-lg border border-dashed border-border p-6 text-center bg-muted/20">
        <p className="text-sm text-muted-foreground">
          Live signals and case queue for <span className="font-medium text-foreground">{agent.shortLabel}</span> stream in from the connected systems.
          Configure sources in <button className="text-primary underline" onClick={() => navigate('/connectors')}>Connectors</button> or tune policies in <button className="text-primary underline" onClick={() => navigate('/settings')}>Settings</button>.
        </p>
      </div>
    </div>
  );
};
