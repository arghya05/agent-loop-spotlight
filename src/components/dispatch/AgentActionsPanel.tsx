import { useState } from 'react';
import { useDispatchStore } from '@/store/dispatchStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, Lock, Truck, Factory, Wrench, 
  ShoppingCart, Plane, ArrowRight, Clock, Send,
  AlertTriangle, TrendingUp, DollarSign
} from 'lucide-react';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Logistics': <Truck className="w-4 h-4" />,
  'Supplier': <Factory className="w-4 h-4" />,
  'Quality': <Wrench className="w-4 h-4" />,
  'Sourcing': <ShoppingCart className="w-4 h-4" />,
  'Commercial': <DollarSign className="w-4 h-4" />,
  'Air-freight': <Plane className="w-4 h-4" />
};

const ROLE_PERMISSIONS: Record<string, string[]> = {
  'viewer': [],
  'supplier_manager': ['Logistics', 'Supplier', 'Quality'],
  'sourcing_manager': ['Logistics', 'Supplier', 'Quality', 'Sourcing'],
  'logistics_lead': ['Logistics'],
  'category_head': ['Logistics', 'Supplier', 'Quality', 'Sourcing', 'Commercial', 'Air-freight']
};

export const AgentActionsPanel = () => {
  const { 
    selectedPOId,
    agentCompleted,
    currentRole,
    interventions,
    contingency,
    planApproved,
    tasks,
    probabilityOnTime,
    toggleIntervention,
    setContingency,
    approvePlan,
    approveWithEdits,
    rejectPlan,
    executePlan,
    updateTaskStatus,
    calculateContingencyImpact
  } = useDispatchStore();
  
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  
  const canApprove = (category: string) => {
    return ROLE_PERMISSIONS[currentRole]?.includes(category) || false;
  };
  
  const contingencyImpact = calculateContingencyImpact();
  
  const handleSendSupplierMessage = () => {
    setIsSendingMessage(true);
    setTimeout(() => {
      setIsSendingMessage(false);
      setMessageSent(true);
    }, 1500);
  };
  
  if (!selectedPOId) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Factory className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Select a PO and run agent check to see actions</p>
        </div>
      </div>
    );
  }
  
  if (!agentCompleted) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-30 animate-pulse" />
          <p className="text-sm">Waiting for agent analysis to complete...</p>
        </div>
      </div>
    );
  }
  
  const groupedInterventions = interventions.reduce((acc, intervention) => {
    if (!acc[intervention.category]) acc[intervention.category] = [];
    acc[intervention.category].push(intervention);
    return acc;
  }, {} as Record<string, typeof interventions>);
  
  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 pr-2">
        {/* Recommended Interventions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              Recommended Interventions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(groupedInterventions).map(([category, actions]) => (
              <div key={category}>
                <div className="flex items-center gap-2 mb-2">
                  {CATEGORY_ICONS[category]}
                  <span className="text-xs font-semibold uppercase text-muted-foreground">{category}</span>
                </div>
                {actions.map(action => (
                  <div 
                    key={action.id}
                    className={`p-3 rounded-lg border mb-2 ${
                      action.enabled ? 'bg-card' : 'bg-muted/30 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Switch 
                        checked={action.enabled}
                        onCheckedChange={() => toggleIntervention(action.id)}
                        disabled={!canApprove(action.category)}
                      />
                      <div className="flex-1">
                        <p className="text-xs font-medium leading-snug">{action.title}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <Badge variant="outline" className="text-[9px]">{action.owner}</Badge>
                          <Badge variant="outline" className="text-[9px]">Due: {new Date(action.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</Badge>
                          <Badge 
                            variant="secondary" 
                            className="text-[9px] bg-status-success-bg text-status-success"
                          >
                            -{(action.expectedRiskReduction * 100).toFixed(0)}% risk
                          </Badge>
                          <span className="text-[9px] text-muted-foreground">
                            {(action.confidence * 100).toFixed(0)}% conf.
                          </span>
                        </div>
                        {action.requiresApproval && !canApprove(action.category) && (
                          <div className="flex items-center gap-1 mt-1.5 text-[10px] text-status-warning">
                            <Lock className="w-3 h-3" />
                            Requires {action.requiresApproval.replace('_', ' ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </CardContent>
        </Card>
        
        {/* Approvals & Controls */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Approvals & Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground mb-3">
              Current role: <Badge variant="secondary" className="ml-1">{currentRole.replace('_', ' ')}</Badge>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                size="sm" 
                onClick={approvePlan}
                disabled={planApproved || currentRole === 'viewer'}
                className="text-xs"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Approve Plan
              </Button>
              <Button 
                size="sm" 
                variant="secondary"
                onClick={approveWithEdits}
                disabled={planApproved || currentRole === 'viewer'}
                className="text-xs"
              >
                Approve with Edits
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={rejectPlan}
                disabled={planApproved || currentRole === 'viewer'}
                className="text-xs"
              >
                Reject
              </Button>
            </div>
            
            {planApproved && (
              <div className="mt-3 space-y-2">
                <Button 
                  className="w-full text-xs" 
                  onClick={executePlan}
                  disabled={tasks.length > 0}
                >
                  <ArrowRight className="w-3 h-3 mr-1" />
                  Execute Now
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full text-xs"
                  onClick={handleSendSupplierMessage}
                  disabled={isSendingMessage || messageSent}
                >
                  {isSendingMessage ? (
                    <>
                      <Clock className="w-3 h-3 mr-1 animate-spin" />
                      Sending...
                    </>
                  ) : messageSent ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1 text-status-success" />
                      Message Sent
                    </>
                  ) : (
                    <>
                      <Send className="w-3 h-3 mr-1" />
                      Send Supplier Message
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Task Board */}
        {tasks.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Task Board</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {['todo', 'in_progress', 'done'].map(status => (
                  <div key={status} className="space-y-2">
                    <div className="text-[10px] font-semibold uppercase text-muted-foreground text-center py-1 bg-muted/50 rounded">
                      {status === 'todo' ? 'To Do' : status === 'in_progress' ? 'In Progress' : 'Done'}
                    </div>
                    {tasks.filter(t => t.status === status).map(task => (
                      <div 
                        key={task.id}
                        className={`p-2 rounded border text-[10px] cursor-pointer hover:bg-muted/50 ${
                          task.priority === 'critical' ? 'border-status-danger/50' : ''
                        }`}
                        onClick={() => {
                          const nextStatus = task.status === 'todo' ? 'in_progress' : 
                                           task.status === 'in_progress' ? 'done' : 'todo';
                          updateTaskStatus(task.id, nextStatus);
                        }}
                      >
                        <p className="font-medium line-clamp-2">{task.title}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Badge variant="outline" className="text-[8px] px-1">{task.category}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <div className="mt-3 p-2 bg-muted/30 rounded text-[10px]">
                <strong>Accountability Score:</strong> {tasks.filter(t => t.status === 'done').length}/{tasks.length} tasks completed
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Contingency Simulator */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Contingency Simulator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Split Shipment</Label>
                <Switch 
                  checked={contingency.splitShipment}
                  onCheckedChange={(v) => setContingency('splitShipment', v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Backup Factory</Label>
                <Select 
                  value={contingency.backupFactory || 'none'}
                  onValueChange={(v) => setContingency('backupFactory', v === 'none' ? null : v)}
                >
                  <SelectTrigger className="w-32 h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="FAC002">Tiruppur Unit-2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Overtime</Label>
                <Switch 
                  checked={contingency.overtime}
                  onCheckedChange={(v) => setContingency('overtime', v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Partial Air-freight</Label>
                <Switch 
                  checked={contingency.partialAirFreight}
                  onCheckedChange={(v) => setContingency('partialAirFreight', v)}
                  disabled={currentRole !== 'category_head'}
                />
                {currentRole !== 'category_head' && (
                  <Lock className="w-3 h-3 text-muted-foreground" />
                )}
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2 bg-status-success-bg/50 rounded">
                <div className="text-lg font-bold text-status-success">
                  {(contingencyImpact.probability * 100).toFixed(0)}%
                </div>
                <div className="text-[9px] text-muted-foreground">New On-Time %</div>
              </div>
              <div className="p-2 bg-muted/50 rounded">
                <div className="text-lg font-bold">{contingencyImpact.slipDays}d</div>
                <div className="text-[9px] text-muted-foreground">Expected Slip</div>
              </div>
              <div className="p-2 bg-status-warning-bg/50 rounded">
                <div className="text-lg font-bold text-status-warning">
                  ${(contingencyImpact.cost / 1000).toFixed(0)}K
                </div>
                <div className="text-[9px] text-muted-foreground">Added Cost</div>
              </div>
              <div className="p-2 bg-status-success-bg/50 rounded">
                <div className="text-lg font-bold text-status-success">
                  ${(contingencyImpact.lostSalesAvoided / 1000).toFixed(0)}K
                </div>
                <div className="text-[9px] text-muted-foreground">Lost Sales Avoided</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
};
