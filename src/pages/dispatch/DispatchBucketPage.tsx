import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  ChevronLeft, 
  Search, 
  Filter, 
  ArrowUpDown, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock,
  Calendar,
  Send
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import dispatchVendorsData from '@/data/dispatch/vendors.json';
import dispatchSettingsData from '@/data/dispatch/settings.json';

type BucketTag = 'flow' | 'aw' | 'ss';

interface DispatchVendor {
  id: string;
  name: string;
  factoryLocation: string;
  route: string;
  dc: string;
  categoryTags: string[];
  owner: string;
  bucketTag: string;
  riskScore: number;
  openPOCount: number;
  totalVolumeUnits: number;
  tradedDollar: number;
  atRiskDollar: number;
  lastReviewDate: string;
  nextReviewDue: string;
  riskDrivers: string[];
}

const bucketConfig: Record<string, { label: string; fullLabel: string; color: string; bgColor: string; icon: React.ReactNode; description: string }> = {
  flow: { 
    label: 'Flow', 
    fullLabel: 'Flow (On Track)',
    color: 'text-status-success', 
    bgColor: 'bg-status-success-bg',
    icon: <CheckCircle2 className="w-5 h-5" />,
    description: 'Low risk, all milestones on schedule. Risk score ≤ 25.'
  },
  aw: { 
    label: 'AW', 
    fullLabel: 'Attention / Watchlist',
    color: 'text-status-warning', 
    bgColor: 'bg-status-warning-bg',
    icon: <AlertTriangle className="w-5 h-5" />,
    description: 'Early warning, risk rising but recoverable. Risk score 26-60.'
  },
  ss: { 
    label: 'SS', 
    fullLabel: 'Slipping Schedule',
    color: 'text-status-danger', 
    bgColor: 'bg-status-danger-bg',
    icon: <XCircle className="w-5 h-5" />,
    description: 'High probability of missing ex-factory date. Risk score > 60.'
  }
};

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const DispatchBucketPage = () => {
  const { bucketId } = useParams<{ bucketId: string }>();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<string>('risk');
  const [filterDC, setFilterDC] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const bucket = (bucketId || 'ss') as BucketTag;
  const config = bucketConfig[bucket];
  const settings = dispatchSettingsData;

  // Map bucket IDs to vendor bucketTag values
  const bucketTagMap: Record<string, string> = {
    flow: 'Flow',
    aw: 'AW',
    ss: 'SS'
  };

  // Filter vendors by bucket
  let filteredVendors = (dispatchVendorsData.vendors as DispatchVendor[])
    .filter(v => v.bucketTag === bucketTagMap[bucket]);
  
  // Apply search filter
  if (searchQuery) {
    filteredVendors = filteredVendors.filter(v => 
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.factoryLocation.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Apply DC filter
  if (filterDC !== 'all') {
    filteredVendors = filteredVendors.filter(v => v.dc === filterDC);
  }

  // Sort vendors
  filteredVendors = [...filteredVendors].sort((a, b) => {
    switch (sortBy) {
      case 'risk': return b.riskScore - a.riskScore;
      case 'atRisk': return b.atRiskDollar - a.atRiskDollar;
      case 'pos': return b.openPOCount - a.openPOCount;
      case 'name': return a.name.localeCompare(b.name);
      default: return 0;
    }
  });

  const uniqueDCs = [...new Set((dispatchVendorsData.vendors as DispatchVendor[]).map(v => v.dc))];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/dispatch/landing')}
          className="text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", config.bgColor)}>
              <span className={config.color}>{config.icon}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{config.fullLabel}</h1>
              <p className="text-sm text-muted-foreground">{config.description}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span>Last refresh: {formatDate(settings.lastRefresh)}</span>
        </div>
      </div>

      {/* Filters & Sort */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search vendors..." 
            className="pl-9" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Select value={filterDC} onValueChange={setFilterDC}>
          <SelectTrigger className="w-[160px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by DC" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All DCs</SelectItem>
            {uniqueDCs.map(dc => (
              <SelectItem key={dc} value={dc}>{dc}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[160px]">
            <ArrowUpDown className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="risk">Risk Score</SelectItem>
            <SelectItem value="atRisk">$ At Risk</SelectItem>
            <SelectItem value="pos"># POs</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>

        <Badge variant="secondary" className="text-sm">
          {filteredVendors.length} vendors
        </Badge>
      </div>

      {/* Vendors Table */}
      <Card className="card-elevated">
        <CardContent className="pt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Vendor</TableHead>
                <TableHead className="w-[80px] text-right">Risk</TableHead>
                <TableHead className="w-[60px] text-right">POs</TableHead>
                <TableHead className="w-[80px] text-right">Volume</TableHead>
                <TableHead className="w-[100px] text-right">$ At Risk</TableHead>
                <TableHead>Risk Drivers</TableHead>
                <TableHead className="w-[90px]">Next Review</TableHead>
                <TableHead className="w-[100px]">Owner</TableHead>
                <TableHead className="w-[180px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVendors.map((vendor) => (
                <TableRow key={vendor.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div>
                      <p className="font-medium">{vendor.name}</p>
                      <p className="text-xs text-muted-foreground">{vendor.factoryLocation}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={cn(
                      "font-mono font-semibold",
                      vendor.riskScore >= 70 ? "text-status-danger" : 
                      vendor.riskScore >= 40 ? "text-status-warning" : "text-status-success"
                    )}>
                      {vendor.riskScore}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {vendor.openPOCount}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {(vendor.totalVolumeUnits / 1000).toFixed(1)}K
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    <span className={vendor.atRiskDollar > 0 ? "text-status-danger" : ""}>
                      {formatCurrency(vendor.atRiskDollar)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {vendor.riskDrivers.slice(0, 2).map((driver, i) => (
                        <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0">
                          {driver}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">
                    <span className={cn(
                      new Date(vendor.nextReviewDue) < new Date() ? "text-status-danger font-medium" : "text-muted-foreground"
                    )}>
                      {formatDate(vendor.nextReviewDue)}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {vendor.owner}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button 
                        size="sm" 
                        className="h-7 text-xs"
                        onClick={() => navigate(`/dispatch/vendor/${vendor.id}`)}
                      >
                        Open 360
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => {}}
                      >
                        <Send className="w-3 h-3 mr-1" />
                        Nudge
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
