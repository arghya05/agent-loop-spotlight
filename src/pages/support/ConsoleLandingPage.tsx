import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ticketsData from '@/data/support/tickets.json';
import {
  Headphones, Clock, CheckCircle2, AlertTriangle, TrendingUp,
  Zap, ExternalLink, Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  new: 'bg-primary/10 text-primary',
  in_progress: 'bg-status-warning/10 text-status-warning',
  waiting_on_supplier: 'bg-blue-500/10 text-blue-500',
  waiting_on_it: 'bg-purple-500/10 text-purple-500',
  resolved: 'bg-status-success/10 text-status-success',
  closed: 'bg-muted text-muted-foreground',
};

export const ConsoleLandingPage = () => {
  const navigate = useNavigate();
  const tickets = ticketsData as any[];
  const open = tickets.filter(t => !['resolved', 'closed'].includes(t.status));
  const resolved = tickets.filter(t => t.status === 'resolved' || t.status === 'closed');
  const autoResolved = resolved.filter(t => t.resolution?.resolutionType === 'auto_resolved');
  const slaBreach = tickets.filter(t => t.priority === 'critical' && t.status !== 'closed');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Headphones className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Support Admin Console</h1>
          </div>
          <p className="text-sm text-muted-foreground">Manage supplier support tickets, agent actions, and escalations</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: 'Open Tickets', value: open.length, icon: AlertTriangle, color: 'text-status-warning' },
          { label: 'Avg Resolution', value: '2.4h', icon: Clock },
          { label: 'Auto-Resolved', value: `${Math.round((autoResolved.length / Math.max(resolved.length, 1)) * 100)}%`, icon: Zap, color: 'text-status-success' },
          { label: 'SLA Breaches', value: slaBreach.length, icon: AlertTriangle, color: 'text-status-danger' },
          { label: 'Total (7d)', value: tickets.length, icon: TrendingUp },
        ].map(kpi => (
          <Card key={kpi.label} className="card-elevated">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 mb-1">
                <kpi.icon className={cn("w-4 h-4", kpi.color || 'text-muted-foreground')} />
                <span className="text-xs text-muted-foreground">{kpi.label}</span>
              </div>
              <p className="text-xl font-bold">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Queue */}
      <Card className="card-elevated">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Ticket Queue</CardTitle>
            <Badge variant="outline">{tickets.length} tickets</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Ticket', 'Supplier', 'Category', 'Priority', 'Status', 'Updated', 'Actions'].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tickets.map(t => (
                <tr key={t.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-2.5 px-3">
                    <p className="font-medium">{t.id}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">{t.summary}</p>
                  </td>
                  <td className="py-2.5 px-3 text-muted-foreground">{t.supplierOrg}</td>
                  <td className="py-2.5 px-3"><Badge variant="secondary" className="text-[10px]">{t.intentCategory?.replace(/_/g, ' ')}</Badge></td>
                  <td className="py-2.5 px-3"><Badge variant={t.priority === 'critical' ? 'destructive' : t.priority === 'high' ? 'default' : 'outline'} className="text-[10px]">{t.priority}</Badge></td>
                  <td className="py-2.5 px-3"><Badge className={cn("text-[10px]", statusColors[t.status])}>{t.status.replace(/_/g, ' ')}</Badge></td>
                  <td className="py-2.5 px-3 text-xs text-muted-foreground">{new Date(t.updatedAt).toLocaleString()}</td>
                  <td className="py-2.5 px-3">
                    <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => navigate(`/support/console/ticket/${t.id}`)}>
                      Open
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};
