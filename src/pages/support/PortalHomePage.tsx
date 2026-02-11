import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ticketsData from '@/data/support/tickets.json';
import { useSupportStore } from '@/store/supportStore';
import { toast } from 'sonner';
import {
  Package, FileText, DollarSign, AlertTriangle, MessageCircle,
  HelpCircle, ShoppingCart, Clock, CheckCircle2, Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const PortalHomePage = () => {
  const navigate = useNavigate();
  const [supportOpen, setSupportOpen] = useState(false);
  const tickets = (ticketsData as any[]);
  const openTickets = tickets.filter(t => !['resolved', 'closed'].includes(t.status));

  // Mock portal data
  const portalData = {
    openPOs: 12,
    pendingInvoices: 5,
    nextPayment: '$18,200 on Feb 15',
    alerts: 2
  };

  const quickActions = [
    { label: "Can't login", icon: '🔐', intent: 'login_access' },
    { label: 'Reset password', icon: '🔑', intent: 'login_access' },
    { label: 'Invoice rejected', icon: '📄', intent: 'p2p_invoice' },
    { label: 'Where is my payment?', icon: '💰', intent: 'p2p_invoice' },
    { label: 'Create user', icon: '👤', intent: 'user_mgmt' },
    { label: 'Generate report', icon: '📊', intent: 'reporting' },
    { label: 'System error', icon: '🐛', intent: 'portal_bug' },
    { label: 'Other request', icon: '❓', intent: 'admin_request' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome to Supplier Portal</h1>
        <p className="text-sm text-muted-foreground">Global Textiles Ltd · Manage your orders, invoices, and get support</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Open POs', value: portalData.openPOs, icon: ShoppingCart, color: 'text-primary' },
          { label: 'Pending Invoices', value: portalData.pendingInvoices, icon: FileText, color: 'text-status-warning' },
          { label: 'Next Payment', value: portalData.nextPayment, icon: DollarSign, color: 'text-status-success' },
          { label: 'Alerts', value: portalData.alerts, icon: Bell, color: 'text-status-danger' },
        ].map(item => (
          <Card key={item.label} className="card-elevated">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-3">
                <item.icon className={cn("w-8 h-8", item.color)} />
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-lg font-bold">{item.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Need Help Section */}
      <Card className="card-elevated border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            Need Help?
          </CardTitle>
          <p className="text-sm text-muted-foreground">Select a topic or describe your issue</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {quickActions.map(action => (
              <Button
                key={action.label}
                variant="outline"
                className="h-auto py-3 flex flex-col gap-1 text-xs hover:bg-primary/10 hover:border-primary"
                onClick={() => navigate('/support/portal/ticket/new', { state: { intent: action.intent, label: action.label } })}
              >
                <span className="text-lg">{action.icon}</span>
                <span>{action.label}</span>
              </Button>
            ))}
          </div>
          <Button className="w-full" onClick={() => navigate('/support/portal/ticket/new')}>
            <MessageCircle className="w-4 h-4 mr-2" />
            Start a Support Conversation
          </Button>
        </CardContent>
      </Card>

      {/* Recent Tickets */}
      {openTickets.length > 0 && (
        <Card className="card-elevated">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Your Recent Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tickets.slice(0, 4).map(ticket => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 cursor-pointer"
                  onClick={() => navigate(`/support/portal/ticket/${ticket.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      ticket.status === 'resolved' || ticket.status === 'closed' ? 'bg-status-success' :
                      ticket.status === 'new' ? 'bg-primary' : 'bg-status-warning'
                    )} />
                    <div>
                      <p className="text-sm font-medium">{ticket.summary}</p>
                      <p className="text-xs text-muted-foreground">{ticket.id} · {new Date(ticket.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] capitalize">{ticket.status.replace(/_/g, ' ')}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
