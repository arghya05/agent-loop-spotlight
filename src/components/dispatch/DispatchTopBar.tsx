import { useDispatchStore, DispatchRole } from '@/store/dispatchStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, Play, Users, Building2, Globe, Truck
} from 'lucide-react';

const ROLES: { value: DispatchRole; label: string }[] = [
  { value: 'viewer', label: 'Viewer' },
  { value: 'supplier_manager', label: 'Supplier Manager' },
  { value: 'sourcing_manager', label: 'Sourcing Manager' },
  { value: 'logistics_lead', label: 'Logistics Lead' },
  { value: 'category_head', label: 'Category Head' }
];

const BRANDS = ['All', 'MAX', 'Home Centre', 'Centrepoint'];
const COUNTRIES = ['All', 'UAE', 'KSA', 'Kuwait', 'Oman', 'Bahrain', 'Qatar'];
const DCS = ['All', 'DXB-JAFZA DC', 'DXB-AL QUOZ DC', 'RUH-RDC'];

export const DispatchTopBar = () => {
  const { 
    currentRole, 
    currentDay,
    selectedBrand,
    selectedCountry,
    selectedDC,
    setCurrentRole,
    setFilter,
    simulateNextDay
  } = useDispatchStore();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-header text-header-foreground">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight">Landmark Group (Dubai)</span>
            <span className="text-xs text-header-foreground/70">Supplier Dispatch Readiness Agent</span>
          </div>
          <Badge variant="outline" className="text-[10px] border-header-foreground/30 text-header-foreground/80">
            BUC5
          </Badge>
        </div>

        {/* Center Filters */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-header-foreground/60" />
            <Select value={selectedBrand} onValueChange={(v) => setFilter('selectedBrand', v)}>
              <SelectTrigger className="h-7 w-28 text-xs bg-transparent border-header-foreground/30 text-header-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BRANDS.map(b => <SelectItem key={b} value={b === 'All' ? 'all' : b}>{b}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-header-foreground/60" />
            <Select value={selectedCountry} onValueChange={(v) => setFilter('selectedCountry', v)}>
              <SelectTrigger className="h-7 w-24 text-xs bg-transparent border-header-foreground/30 text-header-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map(c => <SelectItem key={c} value={c === 'All' ? 'all' : c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-header-foreground/60" />
            <Select value={selectedDC} onValueChange={(v) => setFilter('selectedDC', v)}>
              <SelectTrigger className="h-7 w-32 text-xs bg-transparent border-header-foreground/30 text-header-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DCS.map(d => <SelectItem key={d} value={d === 'All' ? 'all' : d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Current Date */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-header-foreground/10">
            <Calendar className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Jan {currentDay}, 2024</span>
          </div>
          
          {/* Simulate Next Day */}
          <Button 
            variant="secondary" 
            size="sm" 
            className="h-7 text-xs"
            onClick={simulateNextDay}
          >
            <Play className="w-3 h-3 mr-1" />
            Simulate Next Day
          </Button>
          
          {/* Role Switcher */}
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-header-foreground/60" />
            <Select value={currentRole} onValueChange={(v) => setCurrentRole(v as DispatchRole)}>
              <SelectTrigger className="h-7 w-36 text-xs bg-transparent border-header-foreground/30 text-header-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </header>
  );
};
