import { useAppStore } from '@/store/appStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Search, ArrowDown, ArrowUp, Building } from 'lucide-react';
import suppliersData from '@/data/suppliers.json';

const TrafficLight = ({ status }: { status: 'success' | 'warning' | 'danger' }) => {
  const colorClass = {
    success: 'traffic-light-green',
    warning: 'traffic-light-amber',
    danger: 'traffic-light-red'
  }[status];
  
  return <div className={`traffic-light ${colorClass}`} />;
};

const KPICell = ({ value, previous, status, unit = '%', inverted = false }: { 
  value: number; 
  previous: number; 
  status: string;
  unit?: string;
  inverted?: boolean;
}) => {
  const isImproved = inverted ? value < previous : value > previous;
  const TrendIcon = isImproved ? ArrowUp : ArrowDown;
  const trendColor = isImproved ? 'text-status-success' : 'text-status-danger';
  
  return (
    <div className="flex items-center gap-1.5">
      <TrafficLight status={status as 'success' | 'warning' | 'danger'} />
      <span className="text-xs font-medium">{value}{unit}</span>
      <TrendIcon className={`w-3 h-3 ${trendColor}`} />
    </div>
  );
};

export const SupplierHealthRadar = () => {
  const { selectedSupplierId, selectSupplier, startInvestigation, investigationStatus } = useAppStore();
  
  const suppliers = suppliersData.suppliers;
  const alertSupplier = suppliers.find(s => s.hasActiveAlert);

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Alert Banner */}
      {alertSupplier && (
        <Card className="border-status-danger bg-status-danger-bg animate-pulse-slow">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-status-danger" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-status-danger">Drift Detected</p>
                <p className="text-xs text-foreground/70">{alertSupplier.name} • Jan 14</p>
              </div>
              <Badge variant="destructive" className="text-[10px]">CRITICAL</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Supplier Table */}
      <Card className="flex-1 card-elevated">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Building className="w-4 h-4" />
            Supplier Health Radar
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto max-h-[400px] scrollbar-thin">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-card border-b">
                <tr>
                  <th className="text-left p-2 font-medium text-muted-foreground">Supplier</th>
                  <th className="text-center p-2 font-medium text-muted-foreground">OTIF</th>
                  <th className="text-center p-2 font-medium text-muted-foreground">Fill</th>
                  <th className="text-center p-2 font-medium text-muted-foreground">Comp</th>
                  <th className="text-center p-2 font-medium text-muted-foreground">ASN</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((supplier) => (
                  <tr 
                    key={supplier.id}
                    className={`border-b cursor-pointer transition-colors ${
                      selectedSupplierId === supplier.id 
                        ? 'bg-primary/10 border-primary/30' 
                        : 'hover:bg-muted/50'
                    } ${supplier.hasActiveAlert ? 'bg-status-danger-bg/30' : ''}`}
                    onClick={() => selectSupplier(supplier.id)}
                  >
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        {supplier.hasActiveAlert && (
                          <div className="w-2 h-2 rounded-full bg-status-danger animate-pulse" />
                        )}
                        <div>
                          <p className="font-medium truncate max-w-[120px]">{supplier.name}</p>
                          <p className="text-[10px] text-muted-foreground">{supplier.brand} • {supplier.primaryDC}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-2 text-center">
                      <KPICell 
                        value={supplier.kpis.otif.current} 
                        previous={supplier.kpis.otif.previous}
                        status={supplier.kpis.otif.status}
                      />
                    </td>
                    <td className="p-2 text-center">
                      <KPICell 
                        value={supplier.kpis.fillRate.current} 
                        previous={supplier.kpis.fillRate.previous}
                        status={supplier.kpis.fillRate.status}
                      />
                    </td>
                    <td className="p-2 text-center">
                      <KPICell 
                        value={supplier.kpis.compliance.current} 
                        previous={supplier.kpis.compliance.previous}
                        status={supplier.kpis.compliance.status}
                        inverted
                      />
                    </td>
                    <td className="p-2 text-center">
                      <KPICell 
                        value={supplier.kpis.asnAccuracy.current} 
                        previous={supplier.kpis.asnAccuracy.previous}
                        status={supplier.kpis.asnAccuracy.status}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Investigate Button */}
      {selectedSupplierId && investigationStatus === 'idle' && (
        <Button 
          className="w-full bg-primary hover:bg-primary/90"
          onClick={startInvestigation}
        >
          <Search className="w-4 h-4 mr-2" />
          Investigate Now
        </Button>
      )}

      {/* Selected Supplier Info */}
      {selectedSupplierId && (
        <Card className="card-elevated">
          <CardContent className="p-3">
            {(() => {
              const supplier = suppliers.find(s => s.id === selectedSupplierId);
              if (!supplier) return null;
              return (
                <div className="space-y-2">
                  <p className="text-xs font-medium">{supplier.name}</p>
                  <p className="text-[10px] text-muted-foreground">{supplier.lane}</p>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="text-[10px]">{supplier.category}</Badge>
                    <Badge variant="secondary" className="text-[10px]">{supplier.country}</Badge>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
