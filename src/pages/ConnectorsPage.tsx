import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAgentContext } from '@/hooks/useAgentContext';
import { toast } from 'sonner';
import { 
  Mail,
  Link,
  Database,
  Box,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Settings,
  Plug,
  Factory,
  Ship,
  ClipboardCheck,
  TrendingUp,
  Truck,
  Warehouse,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import dispatchConnectors from '@/data/dispatch/connectors.json';
import onboardingConnectorsData from '@/data/onboarding/connectors.json';
import invoiceConnectorsData from '@/data/invoice/connectors.json';
import contractConnectorsData from '@/data/contract/connectors.json';

// Icon mapping for dispatch connectors
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Database,
  Factory,
  Warehouse,
  Ship,
  ClipboardCheck,
  Mail,
  TrendingUp,
  Box,
  Link
};

// Supplier Performance connectors (original)
const initialSupplierConnectors = [
  {
    id: 'email',
    name: 'Retailer Email Integration',
    description: 'Send automated communications to vendors',
    icon: Mail,
    status: 'connected',
    lastSync: '2024-01-20T10:00:00Z',
    config: {
      provider: 'Microsoft Exchange',
      sender: 'supplier-ops@landmark.ae'
    }
  },
  {
    id: 'vendor_portal',
    name: 'Vendor Portal Link',
    description: 'Self-service portal for vendor responses',
    icon: Link,
    status: 'connected',
    lastSync: '2024-01-20T09:30:00Z',
    config: {
      endpoint: 'https://vendors.landmark.ae/api',
      version: 'v2.1'
    }
  },
  {
    id: 'erp',
    name: 'ERP System (SAP)',
    description: 'PO and shipment data synchronization',
    icon: Database,
    status: 'connected',
    lastSync: '2024-01-20T08:00:00Z',
    config: {
      system: 'SAP S/4HANA',
      syncInterval: '4 hours'
    }
  },
  {
    id: 'wms',
    name: 'WMS Integration',
    description: 'Warehouse receiving and hold data',
    icon: Box,
    status: 'disconnected',
    lastSync: null,
    config: {
      system: 'Manhattan WMS',
      status: 'Pending configuration'
    }
  }
];

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return 'Never';
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

// Dispatch Readiness Connectors Page
const DispatchConnectorsPage = () => {
  const [connectors, setConnectors] = useState(dispatchConnectors);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [configuringId, setConfiguringId] = useState<string | null>(null);

  const handleSyncNow = async (connector: typeof connectors[0]) => {
    setSyncingId(connector.id);
    
    // Simulate sync
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setConnectors(prev => prev.map(c => 
      c.id === connector.id 
        ? { ...c, lastSync: new Date().toISOString() }
        : c
    ));
    
    setSyncingId(null);
    toast.success(`${connector.name} synced successfully`, {
      description: `Data refreshed at ${new Date().toLocaleTimeString()}`
    });
  };

  const handleConfigure = async (connector: typeof connectors[0]) => {
    setConfiguringId(connector.id);
    
    // Simulate config opening
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setConfiguringId(null);
    toast.success(`${connector.name} configuration opened`, {
      description: 'Settings panel ready for changes'
    });
  };

  const handleDisconnect = (connector: typeof connectors[0]) => {
    setConnectors(prev => prev.map(c => 
      c.id === connector.id 
        ? { ...c, status: 'disconnected', lastSync: null }
        : c
    ));
    toast.success(`${connector.name} disconnected`, {
      description: 'Integration has been removed'
    });
  };

  const handleConnect = async (connector: typeof connectors[0]) => {
    setSyncingId(connector.id);
    
    // Simulate connection
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setConnectors(prev => prev.map(c => 
      c.id === connector.id 
        ? { ...c, status: 'connected', lastSync: new Date().toISOString() }
        : c
    ));
    
    setSyncingId(null);
    toast.success(`${connector.name} connected successfully`, {
      description: 'Integration is now active'
    });
  };

  const handleAddConnector = () => {
    toast.success('Add Connector', {
      description: 'Connector marketplace opening...'
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Truck className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Dispatch Connectors</h1>
          </div>
          <p className="text-sm text-muted-foreground">System integrations for dispatch readiness tracking</p>
        </div>
        <Button onClick={handleAddConnector}>
          <Plug className="w-4 h-4 mr-2" />
          Add Connector
        </Button>
      </div>

      {/* Connector Cards */}
      <div className="grid grid-cols-2 gap-6">
        {connectors.map((connector) => {
          const Icon = iconMap[connector.icon] || Database;
          const isConnected = connector.status === 'connected';
          const isSyncing = syncingId === connector.id;
          const isConfiguring = configuringId === connector.id;

          return (
            <Card key={connector.id} className="card-elevated">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      isConnected ? "bg-status-success/10" : "bg-muted"
                    )}>
                      <Icon className={cn(
                        "w-5 h-5",
                        isConnected ? "text-status-success" : "text-muted-foreground"
                      )} />
                    </div>
                    <div>
                      <CardTitle className="text-base">{connector.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">{connector.description}</p>
                    </div>
                  </div>
                  <Badge 
                    variant={isConnected ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {isConnected ? (
                      <><CheckCircle2 className="w-3 h-3 mr-1" /> Connected</>
                    ) : (
                      <><XCircle className="w-3 h-3 mr-1" /> Disconnected</>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Config Details */}
                <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                  {Object.entries(connector.config).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>

                {/* Last Sync */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last Sync</span>
                  <span className={cn(
                    "font-medium",
                    !connector.lastSync && "text-muted-foreground"
                  )}>
                    {formatDate(connector.lastSync)}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  {isConnected ? (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleSyncNow(connector)}
                        disabled={isSyncing}
                      >
                        {isSyncing ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4 mr-2" />
                        )}
                        {isSyncing ? 'Syncing...' : 'Sync Now'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleConfigure(connector)}
                        disabled={isConfiguring}
                      >
                        {isConfiguring ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Settings className="w-4 h-4 mr-2" />
                        )}
                        Configure
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-status-danger"
                        onClick={() => handleDisconnect(connector)}
                      >
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleConnect(connector)}
                      disabled={isSyncing}
                    >
                      {isSyncing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        'Connect'
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// Supplier Performance Connectors Page (original)
const SupplierPerformanceConnectorsPage = () => {
  const [connectors, setConnectors] = useState(initialSupplierConnectors);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [configuringId, setConfiguringId] = useState<string | null>(null);

  const handleSyncNow = async (connector: typeof connectors[0]) => {
    setSyncingId(connector.id);
    
    // Simulate sync
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setConnectors(prev => prev.map(c => 
      c.id === connector.id 
        ? { ...c, lastSync: new Date().toISOString() }
        : c
    ));
    
    setSyncingId(null);
    toast.success(`${connector.name} synced successfully`, {
      description: `Data refreshed at ${new Date().toLocaleTimeString()}`
    });
  };

  const handleConfigure = async (connector: typeof connectors[0]) => {
    setConfiguringId(connector.id);
    
    // Simulate config opening
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setConfiguringId(null);
    toast.success(`${connector.name} configuration opened`, {
      description: 'Settings panel ready for changes'
    });
  };

  const handleDisconnect = (connector: typeof connectors[0]) => {
    setConnectors(prev => prev.map(c => 
      c.id === connector.id 
        ? { ...c, status: 'disconnected', lastSync: null }
        : c
    ));
    toast.success(`${connector.name} disconnected`, {
      description: 'Integration has been removed'
    });
  };

  const handleConnect = async (connector: typeof connectors[0]) => {
    setSyncingId(connector.id);
    
    // Simulate connection
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setConnectors(prev => prev.map(c => 
      c.id === connector.id 
        ? { ...c, status: 'connected', lastSync: new Date().toISOString() }
        : c
    ));
    
    setSyncingId(null);
    toast.success(`${connector.name} connected successfully`, {
      description: 'Integration is now active'
    });
  };

  const handleAddConnector = () => {
    toast.success('Add Connector', {
      description: 'Connector marketplace opening...'
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Performance Connectors</h1>
          </div>
          <p className="text-sm text-muted-foreground">System integrations for supplier performance tracking</p>
        </div>
        <Button onClick={handleAddConnector}>
          <Plug className="w-4 h-4 mr-2" />
          Add Connector
        </Button>
      </div>

      {/* Connector Cards */}
      <div className="grid grid-cols-2 gap-6">
        {connectors.map((connector) => {
          const Icon = connector.icon;
          const isConnected = connector.status === 'connected';
          const isSyncing = syncingId === connector.id;
          const isConfiguring = configuringId === connector.id;

          return (
            <Card key={connector.id} className="card-elevated">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      isConnected ? "bg-status-success/10" : "bg-muted"
                    )}>
                      <Icon className={cn(
                        "w-5 h-5",
                        isConnected ? "text-status-success" : "text-muted-foreground"
                      )} />
                    </div>
                    <div>
                      <CardTitle className="text-base">{connector.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">{connector.description}</p>
                    </div>
                  </div>
                  <Badge 
                    variant={isConnected ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {isConnected ? (
                      <><CheckCircle2 className="w-3 h-3 mr-1" /> Connected</>
                    ) : (
                      <><XCircle className="w-3 h-3 mr-1" /> Disconnected</>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Config Details */}
                <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                  {Object.entries(connector.config).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>

                {/* Last Sync */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last Sync</span>
                  <span className={cn(
                    "font-medium",
                    !connector.lastSync && "text-muted-foreground"
                  )}>
                    {formatDate(connector.lastSync)}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  {isConnected ? (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleSyncNow(connector)}
                        disabled={isSyncing}
                      >
                        {isSyncing ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4 mr-2" />
                        )}
                        {isSyncing ? 'Syncing...' : 'Sync Now'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleConfigure(connector)}
                        disabled={isConfiguring}
                      >
                        {isConfiguring ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Settings className="w-4 h-4 mr-2" />
                        )}
                        Configure
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-status-danger"
                        onClick={() => handleDisconnect(connector)}
                      >
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleConnect(connector)}
                      disabled={isSyncing}
                    >
                      {isSyncing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        'Connect'
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// Onboarding Connectors
const OnboardingConnectorsPage = () => {
  const [connectors, setConnectors] = useState(onboardingConnectorsData.connectors);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const handleSync = async (c: any) => {
    setSyncingId(c.id);
    await new Promise(r => setTimeout(r, 1500));
    setConnectors(prev => prev.map(x => x.id === c.id ? { ...x, lastSync: new Date().toISOString() } : x));
    setSyncingId(null);
    toast.success(`${c.name} synced`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Factory className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Onboarding Connectors</h1>
          </div>
          <p className="text-sm text-muted-foreground">Integrations for supplier onboarding & compliance</p>
        </div>
        <Button><Plug className="w-4 h-4 mr-2" />Add Connector</Button>
      </div>
      <div className="grid grid-cols-2 gap-6">
        {connectors.map((c) => (
          <Card key={c.id} className="card-elevated">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", c.status === 'connected' ? "bg-status-success/10" : "bg-muted")}>
                    <Database className={cn("w-5 h-5", c.status === 'connected' ? "text-status-success" : "text-muted-foreground")} />
                  </div>
                  <div>
                    <CardTitle className="text-base">{c.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{c.description}</p>
                  </div>
                </div>
                <Badge variant={c.status === 'connected' ? 'default' : 'destructive'} className="text-xs">
                  {c.status === 'connected' ? <><CheckCircle2 className="w-3 h-3 mr-1" />Connected</> : <><XCircle className="w-3 h-3 mr-1" />Disconnected</>}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="font-medium text-xs">{c.type}</span></div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last Sync</span>
                <span className="font-medium">{c.lastSync ? formatDate(c.lastSync) : 'Never'}</span>
              </div>
              <div className="flex gap-2 pt-2">
                {c.status === 'connected' ? (
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => handleSync(c)} disabled={syncingId === c.id}>
                    {syncingId === c.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                    {syncingId === c.id ? 'Syncing...' : 'Sync Now'}
                  </Button>
                ) : (
                  <Button size="sm" className="flex-1" onClick={() => { toast.success(`${c.name} connected`); }}>Connect</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Invoice Connectors
const InvoiceConnectorsPage = () => {
  const [connectors, setConnectors] = useState(invoiceConnectorsData);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const handleSync = async (c: any) => {
    setSyncingId(c.id);
    await new Promise(r => setTimeout(r, 1500));
    setConnectors(prev => prev.map(x => x.id === c.id ? { ...x, lastSync: new Date().toISOString() } : x));
    setSyncingId(null);
    toast.success(`${c.name} synced`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Plug className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Invoice & AP Connectors</h1>
          </div>
          <p className="text-sm text-muted-foreground">ERP, PO, GRN, contract, and supplier portal integrations</p>
        </div>
        <Button><Plug className="w-4 h-4 mr-2" />Add Connector</Button>
      </div>
      <div className="grid grid-cols-2 gap-6">
        {connectors.map((c) => (
          <Card key={c.id} className="card-elevated">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", c.status === 'connected' ? "bg-status-success/10" : "bg-muted")}>
                    <Database className={cn("w-5 h-5", c.status === 'connected' ? "text-status-success" : "text-muted-foreground")} />
                  </div>
                  <div>
                    <CardTitle className="text-base">{c.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{c.description}</p>
                  </div>
                </div>
                <Badge variant={c.status === 'connected' ? 'default' : 'destructive'} className="text-xs">
                  {c.status === 'connected' ? <><CheckCircle2 className="w-3 h-3 mr-1" />Connected</> : <><XCircle className="w-3 h-3 mr-1" />Disconnected</>}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Endpoint</span><span className="font-medium text-xs">{c.endpoint}</span></div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last Sync</span>
                <span className="font-medium">{c.lastSync ? formatDate(c.lastSync) : 'Never'}</span>
              </div>
              <div className="flex gap-2 pt-2">
                {c.status === 'connected' ? (
                  <>
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => handleSync(c)} disabled={syncingId === c.id}>
                      {syncingId === c.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                      {syncingId === c.id ? 'Syncing...' : 'Sync Now'}
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => toast.success(`${c.name} configuration opened`)}><Settings className="w-4 h-4 mr-2" />Configure</Button>
                  </>
                ) : (
                  <Button size="sm" className="flex-1" onClick={() => toast.success(`${c.name} connected`)}>Connect</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Main Connectors Page that switches based on context
export const ConnectorsPage = () => {
  const agentContext = useAgentContext();
  
  if (agentContext === 'dispatch-readiness') {
    return <DispatchConnectorsPage />;
  }
  if (agentContext === 'supplier-onboarding') {
    return <OnboardingConnectorsPage />;
  }
  if (agentContext === 'invoice-cash-ops') {
    return <InvoiceConnectorsPage />;
  }
  if (agentContext === 'contract-lifecycle') {
    return <ContractConnectorsPage />;
  }
  
  return <SupplierPerformanceConnectorsPage />;
};

// Contract Connectors
const ContractConnectorsPage = () => {
  const [connectors, setConnectors] = useState(contractConnectorsData as any[]);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const handleSync = async (c: any) => {
    setSyncingId(c.id);
    await new Promise(r => setTimeout(r, 1500));
    setConnectors(prev => prev.map(x => x.id === c.id ? { ...x, lastSync: new Date().toISOString() } : x));
    setSyncingId(null);
    toast.success(`${c.name} synced`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Plug className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Contract Lifecycle Connectors</h1>
          </div>
          <p className="text-sm text-muted-foreground">Contract repo, ERP, AP, promo, and supplier portal integrations</p>
        </div>
        <Button><Plug className="w-4 h-4 mr-2" />Add Connector</Button>
      </div>
      <div className="grid grid-cols-2 gap-6">
        {connectors.map((c) => (
          <Card key={c.id} className="card-elevated">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", c.status === 'connected' ? "bg-status-success/10" : "bg-muted")}>
                    <Database className={cn("w-5 h-5", c.status === 'connected' ? "text-status-success" : "text-muted-foreground")} />
                  </div>
                  <div>
                    <CardTitle className="text-base">{c.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{c.description}</p>
                  </div>
                </div>
                <Badge variant={c.status === 'connected' ? 'default' : 'destructive'} className="text-xs">
                  {c.status === 'connected' ? <><CheckCircle2 className="w-3 h-3 mr-1" />Connected</> : <><XCircle className="w-3 h-3 mr-1" />Configured</>}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Endpoint</span><span className="font-medium text-xs">{c.endpoint}</span></div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last Sync</span>
                <span className="font-medium">{c.lastSync ? formatDate(c.lastSync) : 'Never'}</span>
              </div>
              <div className="flex gap-2 pt-2">
                {c.status === 'connected' ? (
                  <>
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => handleSync(c)} disabled={syncingId === c.id}>
                      {syncingId === c.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                      {syncingId === c.id ? 'Syncing...' : 'Sync Now'}
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => toast.success(`${c.name} configuration opened`)}><Settings className="w-4 h-4 mr-2" />Configure</Button>
                  </>
                ) : (
                  <Button size="sm" className="flex-1" onClick={() => toast.success(`${c.name} connected`)}>Connect</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};