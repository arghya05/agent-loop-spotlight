import { useAppStore } from '@/store/appStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Search, ArrowDown, ArrowUp, Building, Zap } from 'lucide-react';
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
    <div className="flex items-center justify-center gap-1.5">
      <TrafficLight status={status as 'success' | 'warning' | 'danger'} />
      <span className="text-xs font-semibold tabular-nums">{value}{unit}</span>
      <TrendIcon className={`w-3 h-3 ${trendColor}`} />
    </div>
  );
};

export const SupplierHealthRadar = () => {
  const { selectedSupplierId, selectSupplier, startInvestigation, investigationStatus, autopilotEnabled } = useAppStore();
  
  const suppliers = suppliersData.suppliers;
  const alertSupplier = suppliers.find(s => s.hasActiveAlert);

  return (
    <Card className="card-elevated border-t-4 border-t-status-danger">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Building className="w-4 h-4 text-primary" />
            Supplier Health Radar
          </CardTitle>
          {autopilotEnabled && (
            <Badge className="bg-status-info/20 text-status-info border-status-info/30 text-[9px]">
              <Zap className="w-3 h-3 mr-1" />
              Auto-Detect
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Alert Banner */}
        {alertSupplier && (
          <div className="p-3 rounded-lg bg-gradient-to-r from-status-danger/10 to-status-danger/5 border border-status-danger/30 animate-pulse-slow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-status-danger/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-status-danger" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-xs font-bold text-status-danger">DRIFT DETECTED</p>
                  <Badge variant="destructive" className="text-[9px] px-1.5 py-0">CRITICAL</Badge>
                </div>
                <p className="text-xs text-foreground font-medium truncate">{alertSupplier.name}</p>
                <p className="text-[10px] text-muted-foreground">Jan 14 • OTIF 94% → 76%</p>
              </div>
            </div>
          </div>
        )}

        {/* Supplier Table */}
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-2.5 font-semibold text-muted-foreground">Supplier</th>
                <th className="text-center p-2.5 font-semibold text-muted-foreground w-16">OTIF</th>
                <th className="text-center p-2.5 font-semibold text-muted-foreground w-16">Fill</th>
                <th className="text-center p-2.5 font-semibold text-muted-foreground w-16">Comp</th>
                <th className="text-center p-2.5 font-semibold text-muted-foreground w-16">ASN</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {suppliers.map((supplier) => (
                <tr 
                  key={supplier.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedSupplierId === supplier.id 
                      ? 'bg-primary/10 ring-2 ring-primary ring-inset' 
                      : 'hover:bg-muted/30'
                  } ${supplier.hasActiveAlert ? 'bg-status-danger/5' : ''}`}
                  onClick={() => selectSupplier(supplier.id)}
                >
                  <td className="p-2.5">
                    <div className="flex items-center gap-2">
                      {supplier.hasActiveAlert && (
                        <div className="w-2 h-2 rounded-full bg-status-danger animate-pulse flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold truncate text-foreground">{supplier.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{supplier.brand} • {supplier.primaryDC}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-2.5">
                    <KPICell 
                      value={supplier.kpis.otif.current} 
                      previous={supplier.kpis.otif.previous}
                      status={supplier.kpis.otif.status}
                    />
                  </td>
                  <td className="p-2.5">
                    <KPICell 
                      value={supplier.kpis.fillRate.current} 
                      previous={supplier.kpis.fillRate.previous}
                      status={supplier.kpis.fillRate.status}
                    />
                  </td>
                  <td className="p-2.5">
                    <KPICell 
                      value={supplier.kpis.compliance.current} 
                      previous={supplier.kpis.compliance.previous}
                      status={supplier.kpis.compliance.status}
                      inverted
                    />
                  </td>
                  <td className="p-2.5">
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

        {/* Investigate Button */}
        {selectedSupplierId && investigationStatus === 'idle' && (
          <Button 
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20"
            onClick={startInvestigation}
          >
            <Search className="w-4 h-4 mr-2" />
            Investigate Now
          </Button>
        )}

        {/* Selected Supplier Quick Info */}
        {selectedSupplierId && (
          <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
            {(() => {
              const supplier = suppliers.find(s => s.id === selectedSupplierId);
              if (!supplier) return null;
              return (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-foreground">{supplier.name}</p>
                    <p className="text-[10px] text-muted-foreground">{supplier.lane}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <Badge variant="secondary" className="text-[9px]">{supplier.category}</Badge>
                    <Badge variant="secondary" className="text-[9px]">{supplier.country}</Badge>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
