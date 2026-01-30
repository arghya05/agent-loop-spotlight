import { useState, useEffect } from 'react';
import { useDispatchStore } from '@/store/dispatchStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, Clock, Filter, Play, TrendingDown, ChevronRight } from 'lucide-react';

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
    case 'red': return 'bg-status-danger';
    case 'amber': return 'bg-status-warning';
    case 'green': return 'bg-status-success';
    default: return 'bg-muted';
  }
};

const getFactoryName = (supplierId: string, factoryId: string) => {
  const supplier = suppliersData.suppliers.find(s => s.supplier_id === supplierId);
  const factory = supplier?.factories.find(f => f.factory_id === factoryId);
  return factory?.name?.split(' ')[0] || factoryId;
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
          <span className="text-sm font-semibold text-status-danger">At-Risk POs</span>
          <Badge variant="destructive" className="text-[10px] ml-auto">{atRiskPOs.length}</Badge>
        </div>
        <div className="space-y-1">
          {atRiskPOs.map(po => (
            <div 
              key={po.po_id}
              onClick={() => handlePOSelect(po.po_id)}
              className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                selectedPOId === po.po_id ? 'bg-status-danger/20 ring-1 ring-status-danger/50' : 'hover:bg-status-danger/10'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className={`w-2 h-2 rounded-full shrink-0 ${getStatusColor(po.status)}`} />
                <span className="text-xs font-medium truncate">{po.po_id}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-status-danger font-medium">
                  {po.eta_slip_days}d slip
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {po.readiness_pct}%
                </span>
                <ChevronRight className="w-3 h-3 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-3">
        <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
        <Select value={selectedBrand} onValueChange={(v) => setFilter('selectedBrand', v)}>
          <SelectTrigger className="h-7 text-[11px] flex-1 min-w-0">
            <SelectValue placeholder="Brand" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {brands.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={selectedCategory} onValueChange={(v) => setFilter('selectedCategory', v)}>
          <SelectTrigger className="h-7 text-[11px] flex-1 min-w-0">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={String(dueWindow)} onValueChange={(v) => setFilter('dueWindow', parseInt(v))}>
          <SelectTrigger className="h-7 text-[11px] w-16 shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7d</SelectItem>
            <SelectItem value="14">14d</SelectItem>
            <SelectItem value="21">21d</SelectItem>
            <SelectItem value="30">30d</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* PO Cards List - More readable than table */}
      <div className="flex-1 border rounded-lg overflow-hidden bg-card">
        <div className="p-2 bg-muted/50 text-[10px] font-semibold uppercase text-muted-foreground border-b">
          Active Purchase Orders
        </div>
        <ScrollArea className="h-[calc(100%-32px)]">
          <div className="p-2 space-y-1.5">
            {filteredPOs.map(po => (
              <div 
                key={po.po_id}
                onClick={() => handlePOSelect(po.po_id)}
                className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                  selectedPOId === po.po_id 
                    ? 'bg-primary/10 border-primary shadow-sm' 
                    : 'hover:bg-muted/50 border-transparent hover:border-border'
                }`}
              >
                {/* Row 1: PO ID and Status */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(po.status)}`} />
                    <span className="text-xs font-semibold">{po.po_id}</span>
                    <Badge variant="outline" className="text-[9px] px-1.5">{po.brand}</Badge>
                  </div>
                  <Badge className={`text-[9px] px-1.5 text-white ${getStatusColor(po.status)}`}>
                    {po.status.toUpperCase()}
                  </Badge>
                </div>
                
                {/* Row 2: Factory and Date */}
                <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1.5">
                  <span>{getFactoryName(po.supplier_id, po.factory_id)} • {po.category}</span>
                  <span>Ex-Factory: {new Date(po.committed_ex_factory_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                </div>
                
                {/* Row 3: Metrics */}
                <div className="flex items-center gap-3 text-[10px]">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Ready:</span>
                    <span className={po.readiness_pct < 50 ? 'text-status-danger font-semibold' : 'font-medium'}>
                      {po.readiness_pct}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Risk:</span>
                    <span className={po.risk_score > 0.5 ? 'text-status-danger font-semibold' : 'font-medium'}>
                      {(po.risk_score * 100).toFixed(0)}%
                    </span>
                  </div>
                  {po.eta_slip_days > 0 && (
                    <div className="flex items-center gap-0.5 text-status-danger font-semibold">
                      <TrendingDown className="w-3 h-3" />
                      {po.eta_slip_days}d slip
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
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
