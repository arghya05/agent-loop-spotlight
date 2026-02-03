import { useAppStore, Role } from '@/store/appStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Globe, Plus, ChevronRight, Zap, Bot, Play } from 'lucide-react';

const GCCMapIcon = () => (
  <svg viewBox="0 0 32 32" className="w-6 h-6 text-header-foreground/60">
    <path
      fill="currentColor"
      d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2zm0 2c6.627 0 12 5.373 12 12s-5.373 12-12 12S4 22.627 4 16 9.373 4 16 4z"
    />
    <circle fill="currentColor" cx="20" cy="14" r="2" />
    <circle fill="currentColor" cx="18" cy="18" r="1.5" />
    <circle fill="currentColor" cx="22" cy="17" r="1" />
    <circle fill="currentColor" cx="15" cy="16" r="1.5" />
    <circle fill="currentColor" cx="12" cy="14" r="1" />
  </svg>
);

export const GlobalTopBar = () => {
  const {
    selectedBrand,
    selectedDC,
    selectedCountry,
    currentRole,
    demoMode,
    autopilotEnabled,
    setSelectedBrand,
    setSelectedDC,
    setSelectedCountry,
    setCurrentRole,
    setDemoMode,
    setAutopilotEnabled,
    simulateNextDay,
    currentDay,
    investigationStatus,
    selectedSupplierId,
    selectSupplier,
    startInvestigation
  } = useAppStore();

  const roleLabels: Record<Role, string> = {
    viewer: 'Viewer',
    ops_manager: 'Ops Manager',
    category_head: 'Category Head'
  };

  // Auto-start investigation when autopilot enabled and drift detected
  const handleAutopilotToggle = (enabled: boolean) => {
    setAutopilotEnabled(enabled);
    
    // If autopilot just enabled and there's an alert supplier, auto-select and investigate
    if (enabled && !selectedSupplierId && investigationStatus === 'idle') {
      // Auto-select the supplier with alert
      selectSupplier('SUP001');
      setTimeout(() => {
        startInvestigation();
      }, 500);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-header text-header-foreground border-b border-border/10">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left: Title only (no logo - logo is in main tab bar) */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div>
              <h1 className="text-sm font-semibold leading-tight">Supplier Performance Agent</h1>
              <p className="text-[10px] text-header-foreground/60 leading-tight">Dubai / GCC Region</p>
            </div>
          </div>
          <GCCMapIcon />
        </div>

        {/* Center: Filters */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-header-foreground/60" />
            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
              <SelectTrigger className="w-[140px] h-8 bg-header-foreground/10 border-header-foreground/20 text-header-foreground text-xs">
                <SelectValue placeholder="Brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                <SelectItem value="home_centre">Home Centre</SelectItem>
                <SelectItem value="max">Max</SelectItem>
                <SelectItem value="centrepoint">Centrepoint</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-header-foreground/60" />
            <Select value={selectedDC} onValueChange={setSelectedDC}>
              <SelectTrigger className="w-[140px] h-8 bg-header-foreground/10 border-header-foreground/20 text-header-foreground text-xs">
                <SelectValue placeholder="DC" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All DCs</SelectItem>
                <SelectItem value="dxb_jafza">DXB-JAFZA</SelectItem>
                <SelectItem value="dxb_alquoz">DXB-AL QUOZ</SelectItem>
                <SelectItem value="ruh_rdc">RUH-RDC</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-header-foreground/60" />
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-[120px] h-8 bg-header-foreground/10 border-header-foreground/20 text-header-foreground text-xs">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                <SelectItem value="uae">UAE</SelectItem>
                <SelectItem value="ksa">KSA</SelectItem>
                <SelectItem value="kuwait">Kuwait</SelectItem>
                <SelectItem value="oman">Oman</SelectItem>
                <SelectItem value="bahrain">Bahrain</SelectItem>
                <SelectItem value="qatar">Qatar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-3">
          {/* Autopilot Toggle - Prominent */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
            autopilotEnabled 
              ? 'bg-status-success/20 border border-status-success/40' 
              : 'bg-header-foreground/5 border border-header-foreground/10'
          }`}>
            <Bot className={`w-4 h-4 ${autopilotEnabled ? 'text-status-success' : 'text-header-foreground/60'}`} />
            <Label htmlFor="autopilot" className={`text-xs font-medium ${autopilotEnabled ? 'text-status-success' : 'text-header-foreground/60'}`}>
              Autopilot
            </Label>
            <Switch
              id="autopilot"
              checked={autopilotEnabled}
              onCheckedChange={handleAutopilotToggle}
              className="data-[state=checked]:bg-status-success"
            />
            {autopilotEnabled && (
              <Badge className="bg-status-success text-white text-[9px] px-1.5 animate-pulse">
                ON
              </Badge>
            )}
          </div>

          <div className="h-6 w-px bg-header-foreground/20" />

          <div className="flex items-center gap-2">
            <Label htmlFor="demo-mode" className="text-xs text-header-foreground/60">Demo</Label>
            <Switch
              id="demo-mode"
              checked={demoMode}
              onCheckedChange={setDemoMode}
              className="data-[state=checked]:bg-status-info scale-90"
            />
          </div>

          <Select value={currentRole} onValueChange={(v) => setCurrentRole(v as Role)}>
            <SelectTrigger className="w-[120px] h-8 bg-header-foreground/10 border-header-foreground/20 text-header-foreground text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="viewer">Viewer</SelectItem>
              <SelectItem value="ops_manager">Ops Manager</SelectItem>
              <SelectItem value="category_head">Category Head</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" className="h-8 text-xs bg-transparent border-header-foreground/20 text-header-foreground hover:bg-header-foreground/10">
            <Plus className="w-3.5 h-3.5 mr-1" />
            New Vendor
          </Button>

          <Button 
            size="sm" 
            className="h-8 text-xs bg-primary hover:bg-primary/90"
            onClick={simulateNextDay}
          >
            <Play className="w-3.5 h-3.5 mr-1" />
            Day {currentDay + 1}
          </Button>
        </div>
      </div>
    </header>
  );
};
