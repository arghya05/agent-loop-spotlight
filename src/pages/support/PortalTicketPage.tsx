import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ticketsData from '@/data/support/tickets.json';
import { useSupportStore } from '@/store/supportStore';
import { toast } from 'sonner';
import {
  ArrowLeft, Send, CheckCircle2, Clock, AlertTriangle, Bot, User,
  Shield, FileText, Loader2, ThumbsUp, ThumbsDown, Zap
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

export const PortalTicketPage = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addAuditEntry } = useSupportStore();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const isNew = ticketId === 'new';
  const intentState = location.state as any;
  const existingTicket = !isNew ? (ticketsData as any[]).find(t => t.id === ticketId) : null;

  const [messages, setMessages] = useState<any[]>(
    existingTicket?.conversation || (intentState?.label ? [
      { role: 'supplier', content: intentState.label, time: new Date().toISOString() }
    ] : [])
  );
  const [ticketStatus, setTicketStatus] = useState(existingTicket?.status || 'new');
  const [actions, setActions] = useState<any[]>(existingTicket?.actionsExecuted || []);
  const [showResolution, setShowResolution] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate agent response
  useEffect(() => {
    if (isNew && intentState?.label && messages.length === 1) {
      simulateAgentResponse(intentState.label);
    }
  }, []);

  const simulateAgentResponse = async (userMsg: string) => {
    setIsTyping(true);
    await new Promise(r => setTimeout(r, 1500));

    const lowerMsg = userMsg.toLowerCase();
    let response = '';
    let action: any = null;

    if (lowerMsg.includes('login') || lowerMsg.includes('locked') || lowerMsg.includes('password')) {
      response = "I understand you're having trouble accessing your account. Let me check your account status...\n\n🔍 I found your account. It appears to be active with no lockouts. Would you like me to:\n1. Send a password reset link\n2. Check your MFA status\n3. Unlock your account";
      setTicketStatus('in_progress');
    } else if (lowerMsg.includes('invoice') || lowerMsg.includes('rejected') || lowerMsg.includes('payment')) {
      response = "I'll look into your invoice issue right away. Could you provide the invoice number? In the meantime, I'm pulling up your recent invoice activity.";
      setTicketStatus('in_progress');
    } else if (lowerMsg.includes('create user') || lowerMsg.includes('new user')) {
      response = "I can help create a new portal user. I'll need:\n• Full name\n• Email address\n• Role (Admin/Finance/Viewer)\n\nAs this requires admin approval, I'll prepare the request for you.";
      setTicketStatus('in_progress');
    } else if (lowerMsg.includes('report')) {
      response = "I can generate reports for you! What type of report do you need?\n• PO Summary\n• Invoice Status\n• Payment History\n\nAlso, please specify the date range and preferred format (PDF/Excel).";
      setTicketStatus('in_progress');
    } else if (lowerMsg.includes('error') || lowerMsg.includes('bug') || lowerMsg.includes('crash')) {
      response = "I'm sorry you're experiencing technical issues. Let me check the recent error logs for your account...\n\n🔍 Checking portal events and error logs now.";
      setTicketStatus('in_progress');
    } else {
      response = "I understand your request. Let me look into this for you. Could you provide more details about what you need help with?";
      setTicketStatus('in_progress');
    }

    setMessages(prev => [...prev, { role: 'agent', content: response, time: new Date().toISOString() }]);
    setIsTyping(false);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'supplier', content: userMsg, time: new Date().toISOString() }]);
    await simulateAgentResponse(userMsg);
  };

  const handleExecuteAction = (actionName: string) => {
    const newAction = { actionName, status: 'success', time: new Date().toISOString(), evidence: `${actionName} completed successfully` };
    setActions(prev => [...prev, newAction]);
    setMessages(prev => [...prev, { role: 'agent', content: `✅ **${actionName}** executed successfully. Is there anything else I can help with?`, time: new Date().toISOString() }]);
    addAuditEntry({ actor: 'Agent', event: actionName, details: `Executed for ticket ${ticketId}` });
    toast.success(`${actionName} completed`);
    setShowResolution(true);
  };

  const handleConfirmResolution = (confirmed: boolean) => {
    if (confirmed) {
      setTicketStatus('closed');
      setMessages(prev => [...prev, { role: 'agent', content: '🎉 Great! I\'m glad we could resolve your issue. This ticket is now closed. Don\'t hesitate to reach out if you need anything else!', time: new Date().toISOString() }]);
      addAuditEntry({ actor: 'Supplier', event: 'Resolution confirmed', details: `Ticket ${ticketId} closed` });
      toast.success('Ticket closed — issue resolved');
    } else {
      setMessages(prev => [...prev, { role: 'agent', content: 'I\'m sorry the issue isn\'t resolved yet. Could you tell me what\'s still not working? I\'ll investigate further.', time: new Date().toISOString() }]);
      setTicketStatus('in_progress');
      setShowResolution(false);
    }
  };

  const ticket = existingTicket || { id: ticketId === 'new' ? 'TKT-NEW' : ticketId, summary: intentState?.label || 'New Support Request', priority: 'med', intentCategory: intentState?.intent || 'unknown', contextSignals: [], delegations: [] };

  return (
    <div className="p-4 h-[calc(100vh-120px)]">
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/support/portal')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-lg font-bold text-foreground">{ticket.summary}</h1>
          <p className="text-xs text-muted-foreground">{ticket.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 h-[calc(100%-60px)]">
        {/* Chat Panel */}
        <div className="col-span-7 flex flex-col border border-border rounded-xl overflow-hidden bg-background">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex gap-3", msg.role === 'supplier' ? 'justify-end' : 'justify-start')}>
                {msg.role === 'agent' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
                  msg.role === 'supplier'
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-muted rounded-bl-md'
                )}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p className={cn("text-[10px] mt-1", msg.role === 'supplier' ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                    {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {msg.role === 'supplier' && (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            {/* Resolution Confirmation */}
            {showResolution && ticketStatus !== 'closed' && (
              <div className="bg-status-success/5 border border-status-success/20 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-status-success" />
                  <p className="font-medium text-sm">Is your issue resolved?</p>
                </div>
                <p className="text-xs text-muted-foreground">Actions taken: {actions.map(a => a.actionName).join(', ')}</p>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-status-success hover:bg-status-success/90" onClick={() => handleConfirmResolution(true)}>
                    <ThumbsUp className="w-3 h-3 mr-1" />Yes, resolved!
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleConfirmResolution(false)}>
                    <ThumbsDown className="w-3 h-3 mr-1" />Not yet
                  </Button>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border p-3">
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={ticketStatus === 'closed'}
              />
              <Button onClick={handleSend} disabled={!input.trim() || ticketStatus === 'closed'}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Case Sidebar */}
        <div className="col-span-5 space-y-4 overflow-y-auto">
          {/* Status */}
          <Card className="card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Ticket Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span>
                <Badge className={cn("text-[10px]", statusColors[ticketStatus])}>{ticketStatus.replace(/_/g, ' ')}</Badge>
              </div>
              <div className="flex justify-between"><span className="text-muted-foreground">Priority</span>
                <Badge variant={ticket.priority === 'critical' ? 'destructive' : 'outline'}>{ticket.priority}</Badge>
              </div>
              <div className="flex justify-between"><span className="text-muted-foreground">Category</span>
                <Badge variant="secondary" className="text-[10px]">{ticket.intentCategory?.replace(/_/g, ' ')}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          {ticketStatus !== 'closed' && (
            <Card className="card-elevated">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4" />Available Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { name: 'Unlock Account', icon: Shield, gate: false },
                  { name: 'Reset Password', icon: Shield, gate: false },
                  { name: 'Create User', icon: User, gate: true },
                  { name: 'Generate Report', icon: FileText, gate: false },
                ].map(action => (
                  <div key={action.name} className="flex items-center justify-between p-2 rounded-lg border border-border">
                    <div className="flex items-center gap-2">
                      <action.icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs">{action.name}</span>
                      {action.gate && <Badge variant="outline" className="text-[8px]">Approval needed</Badge>}
                    </div>
                    <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => handleExecuteAction(action.name)}>
                      Execute
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Actions Taken */}
          {actions.length > 0 && (
            <Card className="card-elevated">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-success" />Actions Taken
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {actions.map((a, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-status-success/5">
                      <CheckCircle2 className="w-3 h-3 text-status-success" />
                      <div>
                        <p className="text-xs font-medium">{a.actionName}</p>
                        <p className="text-[10px] text-muted-foreground">{a.evidence}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Context Signals */}
          {existingTicket?.contextSignals?.length > 0 && (
            <Card className="card-elevated">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Context Signals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {existingTicket.contextSignals.map((sig: any, i: number) => (
                    <div key={i} className="flex justify-between text-xs p-1.5">
                      <span className="text-muted-foreground">{sig.source}: {sig.key}</span>
                      <span className="font-medium">{sig.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Delegations */}
          {existingTicket?.delegations?.length > 0 && (
            <Card className="card-elevated">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-status-warning" />Escalations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {existingTicket.delegations.map((d: any, i: number) => (
                  <div key={i} className="p-2 rounded-lg border border-border text-xs space-y-1">
                    <div className="flex justify-between"><span className="text-muted-foreground">System</span><span>{d.system}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Ref</span><span className="font-medium">{d.ticketRef}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge variant="outline" className="text-[10px]">{d.status}</Badge></div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
