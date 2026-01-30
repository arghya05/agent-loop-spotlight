import { useState, useEffect } from 'react';
import { useDispatchStore } from '@/store/dispatchStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, CheckCircle, Clock, Filter, Play, TrendingDown } from 'lucide-react';

import posData from '@/data/dispatch/pos.json';
import suppliersData from '@/data/dispatch/suppliers.json';

interface POData {
  po_id: string;
  brand: string;
  category: string;
  sku_count: number;
  qty: number;
  supplier_id: string;
  factory_id: string;
  committed_ex_factory_date: string;
  committed_port_gatein_date: string;
  readiness_pct: number;
  risk_score: number;
  eta_slip_days: number;
  status: 'green' | 'amber' | 'red';
  priority: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'red': return 'bg-status-danger text-white';
    case 'amber': return 'bg-status-warning text-white';
    case 'green': return 'bg-status-success text-white';
    default: return 'bg-muted text-muted-foreground';
  }
};

const getStatusDot = (status: string) => {
  switch (status) {
    case 'red': return 'bg-status-danger';
    case 'amber': return 'bg-status-warning';
    case 'green': return 'bg-status-success';
    default: return 'bg-muted';
  }
};

const getSupplierName = (supplierId: string) => {
  const supplier = suppliersData.suppliers.find(s => s.supplier_id === supplierId);
  return supplier?.name || supplierId;
};

const getFactoryName = (supplierId: string, factoryId: string) => {
  const supplier = suppliersData.suppliers.find(s => s.supplier_id === supplierId);
  const factory = supplier?.factories.find(f => f.factory_id === factoryId);
  return factory?.name || factoryId;
};

export const POReadinessRadar = () => {
  const { 
    selectedBrand, 
    selectedCategory,
    dueWindow,
    selectedPOId,
    setFilter,
    selectPO,
    runAgentCheck,
    agentRunning
  } = useDispatchStore();

  const [filteredPOs, setFilteredPOs] = useState<POData[]>([]);

  useEffect(() => {
    let pos = posData.pos as POData[];
    
    if (selectedBrand !== 'all') {
      pos = pos.filter(p => p.brand === selectedBrand);
    }
    if (selectedCategory !== 'all') {
      pos = pos.filter(p => p.category === selectedCategory);
    }
    
    setFilteredPOs(pos);
  }, [selectedBrand, selectedCategory, dueWindow]);

  const atRiskPOs = filteredPOs.filter(p => p.status === 'red' || p.status === 'amber').slice(0, 5);
  const brands = [...new Set(posData.pos.map(p => p.brand))];
  const categories = [...new Set(posData.pos.map(p => p.category))];

  const handlePOSelect = (poId: string) => {
    selectPO(poId);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Alert Panel */}
      <div className="bg-status-danger-bg border border-status-danger/30 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-status-danger" />
          <span className="text-sm font-semibold text-status-danger">At-Risk POs Needing Action</span>
          <Badge variant="destructive" className="text-[10px] ml-auto">{atRiskPOs.length}</Badge>
        </div>
        <div className="space-y-1.5">
          {atRiskPOs.map(po => (
            <div 
              key={po.po_id}
              onClick={() => handlePOSelect(po.po_id)}
              className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                selectedPOId === po.po_id ? 'bg-status-danger/20' : 'hover:bg-status-danger/10'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getStatusDot(po.status)}`} />
                <span className="text-xs font-medium">{po.po_id}</span>
                <span className="text-[10px] text-muted-foreground">{po.brand}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-status-danger font-medium">
                  -{po.eta_slip_days}d slip
                </span>
                <Badge variant="outline" className="text-[9px]">
                  {po.readiness_pct}%
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-3">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <Select value={selectedBrand} onValueChange={(v) => setFilter('selectedBrand', v)}>
          <SelectTrigger className="h-8 text-xs flex-1">
            <SelectValue placeholder="Brand" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {brands.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={selectedCategory} onValueChange={(v) => setFilter('selectedCategory', v)}>
          <SelectTrigger className="h-8 text-xs flex-1">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={String(dueWindow)} onValueChange={(v) => setFilter('dueWindow', parseInt(v))}>
          <SelectTrigger className="h-8 text-xs w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 days</SelectItem>
            <SelectItem value="14">14 days</SelectItem>
            <SelectItem value="21">21 days</SelectItem>
            <SelectItem value="30">30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* PO Table */}
      <div className="flex-1 border rounded-lg overflow-hidden bg-card">
        <div className="grid grid-cols-12 gap-1 p-2 bg-muted/50 text-[10px] font-semibold uppercase text-muted-foreground border-b">
          <div className="col-span-2">PO</div>
          <div className="col-span-2">Brand</div>
          <div className="col-span-2">Supplier</div>
          <div className="col-span-2">Ex-Factory</div>
          <div className="col-span-1 text-center">Ready</div>
          <div className="col-span-1 text-center">Risk</div>
          <div className="col-span-1 text-center">Slip</div>
          <div className="col-span-1 text-center">Status</div>
        </div>
        <ScrollArea className="h-[calc(100%-36px)]">
          {filteredPOs.map(po => (
            <div 
              key={po.po_id}
              onClick={() => handlePOSelect(po.po_id)}
              className={`grid grid-cols-12 gap-1 p-2 text-xs border-b cursor-pointer transition-colors ${
                selectedPOId === po.po_id 
                  ? 'bg-primary/10 border-l-2 border-l-primary' 
                  : 'hover:bg-muted/50'
              }`}
            >
              <div className="col-span-2 font-medium truncate">{po.po_id}</div>
              <div className="col-span-2 text-muted-foreground truncate">{po.brand}</div>
              <div className="col-span-2 text-muted-foreground truncate" title={getSupplierName(po.supplier_id)}>
                {getFactoryName(po.supplier_id, po.factory_id)}
              </div>
              <div className="col-span-2 text-muted-foreground">
                {new Date(po.committed_ex_factory_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
              </div>
              <div className="col-span-1 text-center">
                <span className={po.readiness_pct < 50 ? 'text-status-danger font-medium' : ''}>
                  {po.readiness_pct}%
                </span>
              </div>
              <div className="col-span-1 text-center">
                <span className={po.risk_score > 0.5 ? 'text-status-danger font-medium' : 'text-muted-foreground'}>
                  {(po.risk_score * 100).toFixed(0)}
                </span>
              </div>
              <div className="col-span-1 text-center">
                {po.eta_slip_days > 0 ? (
                  <span className="text-status-danger flex items-center justify-center gap-0.5">
                    <TrendingDown className="w-3 h-3" />
                    {po.eta_slip_days}d
                  </span>
                ) : (
                  <span className="text-status-success">0d</span>
                )}
              </div>
              <div className="col-span-1 flex justify-center">
                <Badge className={`text-[9px] px-1.5 ${getStatusColor(po.status)}`}>
                  {po.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Run Agent Button */}
      {selectedPOId && (
        <Button 
          className="mt-3 w-full" 
          onClick={runAgentCheck}
          disabled={agentRunning}
        >
          {agentRunning ? (
            <>
              <Clock className="w-4 h-4 mr-2 animate-spin" />
              Running Agent Check...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Run Agent Check
            </>
          )}
        </Button>
      )}
    </div>
  );
};
