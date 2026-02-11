import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ticketsData from '@/data/support/tickets.json';
import { useSupportStore } from '@/store/supportStore';
import { toast } from 'sonner';
import { ArrowLeft, Bot, User, CheckCircle2, Clock, Send, Shield, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  new: 'bg-primary/10 text-primary', in_progress: 'bg-status-warning/10 text-status-warning',
  waiting_on_supplier: 'bg-blue-500/10 text-blue-500', waiting_on_it: 'bg-purple-500/10 text-purple-500',
  resolved: 'bg-status-success/10 text-status-success', closed: 'bg-muted text-muted-foreground',
};

export const ConsoleTicketPage = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { addAuditEntry } = useSupportStore();
  const ticket = (ticketsData as any[]).find(t => t.id === ticketId);

  if (!ticket) return <div className="p-6">Ticket not found.</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/support/console')}><ArrowLeft className="w-4 h-4" /></Button>
        <div>
          <h1 className="text-lg font-bold">{ticket.id}: {ticket.summary}</h1>
          <p className="text-xs text-muted-foreground">{ticket.supplierOrg} · {ticket.supplierUser.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* LEFT: Metadata */}
        <div className="col-span-3 space-y-3">
          <Card className="card-elevated">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Ticket Info</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge className={cn("text-[10px]", statusColors[ticket.status])}>{ticket.status.replace(/_/g, ' ')}</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Priority</span><Badge variant={ticket.priority === 'critical' ? 'destructive' : 'outline'}>{ticket.priority}</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Category</span><span className="text-xs">{ticket.intentCategory?.replace(/_/g, ' ')}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Channel</span><span>{ticket.channel}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Created</span><span className="text-xs">{new Date(ticket.createdAt).toLocaleString()}</span></div>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Supplier User</CardTitle></CardHeader>
            <CardContent className="space-y-1 text-xs">
              <p className="font-medium">{ticket.supplierUser.name}</p>
              <p className="text-muted-foreground">{ticket.supplierUser.email}</p>
              <Badge variant="outline">{ticket.supplierUser.role}</Badge>
            </CardContent>
          </Card>
          {ticket.contextSignals?.length > 0 && (
            <Card className="card-elevated">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Context</CardTitle></CardHeader>
              <CardContent><div className="space-y-1">{ticket.contextSignals.map((s: any, i: number) => (
                <div key={i} className="flex justify-between text-xs"><span className="text-muted-foreground">{s.key}</span><span className="font-medium">{s.value}</span></div>
              ))}</div></CardContent>
            </Card>
          )}
        </div>

        {/* CENTER: Conversation */}
        <div className="col-span-5">
          <Card className="card-elevated h-full">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Conversation</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {ticket.conversation.map((msg: any, i: number) => (
                  <div key={i} className={cn("flex gap-2", msg.role === 'supplier' ? 'justify-end' : '')}>
                    {msg.role === 'agent' && <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"><Bot className="w-3 h-3 text-primary" /></div>}
                    <div className={cn("max-w-[80%] rounded-xl px-3 py-2 text-sm", msg.role === 'supplier' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <p className={cn("text-[10px] mt-1", msg.role === 'supplier' ? 'text-primary-foreground/60' : 'text-muted-foreground')}>{new Date(msg.time).toLocaleTimeString()}</p>
                    </div>
                    {msg.role === 'supplier' && <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0"><User className="w-3 h-3" /></div>}
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4 pt-3 border-t border-border">
                <Button size="sm" variant="outline" className="text-xs" onClick={() => { addAuditEntry({ actor: 'Admin', event: 'Sent update', details: ticket.id }); toast.success('Update sent to supplier'); }}>
                  <Send className="w-3 h-3 mr-1" />Send Update
                </Button>
                <Button size="sm" variant="outline" className="text-xs" onClick={() => toast.success('Internal note added')}>Add Note</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Actions + Delegations */}
        <div className="col-span-4 space-y-3">
          <Card className="card-elevated">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />Actions Executed</CardTitle></CardHeader>
            <CardContent>
              {ticket.actionsExecuted.length > 0 ? (
                <div className="space-y-2">{ticket.actionsExecuted.map((a: any, i: number) => (
                  <div key={i} className="p-2 rounded-lg bg-status-success/5 border border-status-success/10">
                    <p className="text-xs font-medium">{a.actionName}</p>
                    <p className="text-[10px] text-muted-foreground">{a.evidence}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(a.time).toLocaleString()}</p>
                  </div>
                ))}</div>
              ) : <p className="text-xs text-muted-foreground">No actions yet</p>}
            </CardContent>
          </Card>
          {ticket.delegations?.length > 0 && (
            <Card className="card-elevated">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4" />Delegations</CardTitle></CardHeader>
              <CardContent>{ticket.delegations.map((d: any, i: number) => (
                <div key={i} className="p-2 rounded-lg border border-border text-xs space-y-1">
                  <div className="flex justify-between"><span className="text-muted-foreground">{d.system}</span><span className="font-medium">{d.ticketRef}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Assignee</span><span>{d.assignee}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">SLA Due</span><span>{new Date(d.slaDue).toLocaleString()}</span></div>
                  <Badge variant="outline" className="text-[10px]">{d.status}</Badge>
                </div>
              ))}</CardContent>
            </Card>
          )}
          <Card className="card-elevated">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Admin Actions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {['Assign to team', 'Escalate to IT', 'Close ticket', 'Add internal note'].map(action => (
                <Button key={action} size="sm" variant="outline" className="w-full text-xs justify-start" onClick={() => { addAuditEntry({ actor: 'Admin', event: action, details: ticket.id }); toast.success(action); }}>
                  {action}
                </Button>
              ))}
            </CardContent>
          </Card>
          {ticket.resolution && (
            <Card className="card-elevated border-status-success/20">
              <CardHeader className="pb-2"><CardTitle className="text-sm text-status-success">Resolution</CardTitle></CardHeader>
              <CardContent className="text-xs space-y-1">
                <p>{ticket.resolution.notes}</p>
                <p className="text-muted-foreground">Confirmed: {ticket.resolution.confirmedBySupplier ? '✅ Yes' : '⏳ Pending'}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
