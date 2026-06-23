import { useAppStore, Role } from '@/store/appStore';
import { useGovernanceStore } from '@/store/governanceStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, MapPin, RefreshCw, LogOut } from 'lucide-react';
import AlgonomyLogo from '@/components/AlgonomyLogo';
import { useLocation, useNavigate } from 'react-router-dom';

export const AppTopBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentRole, setCurrentRole } = useAppStore();
  const { searchQuery, setSearchQuery, regionFilter, lastRefresh, refreshData } = useGovernanceStore();
  const isStoreOps = location.pathname.startsWith('/store-ops');

  const formatLastRefresh = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-header text-header-foreground border-b border-border/10">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left: Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => navigate(isStoreOps ? '/store-ops/landing' : '/landing')}
        >
          <AlgonomyLogo className="h-8" />
          <span className="text-[10px] font-medium tracking-wide text-header-foreground/60">
            Retailer-Supplier OS
          </span>
        </div>

        {/* Center: Search + Filters */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-header-foreground/50" />
            <Input
              placeholder={isStoreOps ? 'Search stores...' : 'Search vendors...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 h-8 pl-9 bg-header-foreground/10 border-header-foreground/20 text-header-foreground placeholder:text-header-foreground/40 text-sm"
            />
          </div>

          <Select defaultValue="all">
            <SelectTrigger className="w-32 h-8 bg-header-foreground/10 border-header-foreground/20 text-header-foreground text-xs">
              <Calendar className="w-3.5 h-3.5 mr-1.5 text-header-foreground/60" />
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all">
            <SelectTrigger className="w-32 h-8 bg-header-foreground/10 border-header-foreground/20 text-header-foreground text-xs">
              <MapPin className="w-3.5 h-3.5 mr-1.5 text-header-foreground/60" />
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              <SelectItem value="dxb">Dubai</SelectItem>
              <SelectItem value="ksa">KSA</SelectItem>
              <SelectItem value="kuwait">Kuwait</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Right: Role + Refresh */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-header-foreground/60">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Last refresh: {formatLastRefresh(lastRefresh)}</span>
          </div>

          <Select value={currentRole} onValueChange={(v) => setCurrentRole(v as Role)}>
            <SelectTrigger className="w-32 h-8 bg-header-foreground/10 border-header-foreground/20 text-header-foreground text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="viewer">Viewer</SelectItem>
              <SelectItem value="ops_manager">Ops Manager</SelectItem>
              <SelectItem value="category_head">Category Head</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            size="sm" 
            variant="outline"
            onClick={refreshData}
            className="h-8 text-xs bg-transparent border-header-foreground/20 text-header-foreground hover:bg-header-foreground/10"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh
          </Button>

          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => {
              sessionStorage.removeItem('algonomy_logged_in');
              sessionStorage.removeItem('algonomy_user');
              sessionStorage.removeItem('algonomy_workspace');
              navigate('/login');
            }}
            className="h-8 text-xs text-header-foreground hover:bg-header-foreground/10"
          >
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};
