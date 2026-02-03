import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAgentContext } from '@/hooks/useAgentContext';
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
  Warehouse
} from 'lucide-react';
import { cn } from '@/lib/utils';
import dispatchConnectors from '@/data/dispatch/connectors.json';

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
const supplierConnectors = [
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
        <Button>
          <Plug className="w-4 h-4 mr-2" />
          Add Connector
        </Button>
      </div>

      {/* Connector Cards */}
      <div className="grid grid-cols-2 gap-6">
        {dispatchConnectors.map((connector) => {
          const Icon = iconMap[connector.icon] || Database;
          const isConnected = connector.status === 'connected';

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
                      <Button size="sm" variant="outline" className="flex-1">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Sync Now
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Settings className="w-4 h-4 mr-2" />
                        Configure
                      </Button>
                      <Button size="sm" variant="ghost" className="text-status-danger">
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" className="flex-1">
                      Connect
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
        <Button>
          <Plug className="w-4 h-4 mr-2" />
          Add Connector
        </Button>
      </div>

      {/* Connector Cards */}
      <div className="grid grid-cols-2 gap-6">
        {supplierConnectors.map((connector) => {
          const Icon = connector.icon;
          const isConnected = connector.status === 'connected';

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
                      <Button size="sm" variant="outline" className="flex-1">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Sync Now
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Settings className="w-4 h-4 mr-2" />
                        Configure
                      </Button>
                      <Button size="sm" variant="ghost" className="text-status-danger">
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" className="flex-1">
                      Connect
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

// Main Connectors Page that switches based on context
export const ConnectorsPage = () => {
  const agentContext = useAgentContext();
  
  if (agentContext === 'dispatch-readiness') {
    return <DispatchConnectorsPage />;
  }
  
  return <SupplierPerformanceConnectorsPage />;
};
