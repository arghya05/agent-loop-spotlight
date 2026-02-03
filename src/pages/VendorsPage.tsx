import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGovernanceStore, BucketTag } from '@/store/governanceStore';
import { 
  Search,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const bucketConfig: Record<BucketTag, { label: string; color: string; icon: React.ReactNode }> = {
  good: { label: 'Good', color: 'text-status-success', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  average: { label: 'Average', color: 'text-status-warning', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  needs_review: { label: 'Review', color: 'text-orange-600', icon: <AlertCircle className="w-3.5 h-3.5" /> },
  critical: { label: 'Critical', color: 'text-status-danger', icon: <XCircle className="w-3.5 h-3.5" /> }
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

export const VendorsPage = () => {
  const navigate = useNavigate();
  const { vendors, searchQuery, setSearchQuery } = useGovernanceStore();
  const [sortBy, setSortBy] = useState<string>('name');
  const [filterBucket, setFilterBucket] = useState<string>('all');
  const [filterDC, setFilterDC] = useState<string>('all');

  // Filter and sort vendors
  let filteredVendors = vendors.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filterBucket !== 'all') {
    filteredVendors = filteredVendors.filter(v => v.bucketTag === filterBucket);
  }

  if (filterDC !== 'all') {
    filteredVendors = filteredVendors.filter(v => v.dc === filterDC);
  }

  filteredVendors = [...filteredVendors].sort((a, b) => {
    switch (sortBy) {
      case 'name': return a.name.localeCompare(b.name);
      case 'score': return a.compositeScore - b.compositeScore;
      case 'spend': return b.totals.tradedDollar - a.totals.tradedDollar;
      default: return 0;
    }
  });

  const uniqueDCs = [...new Set(vendors.map(v => v.dc))];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Vendor Directory</h1>
        <p className="text-sm text-muted-foreground">Complete list of monitored vendors</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search vendors..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Select value={filterBucket} onValueChange={setFilterBucket}>
          <SelectTrigger className="w-[160px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Bucket" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Buckets</SelectItem>
            <SelectItem value="good">Good Performers</SelectItem>
            <SelectItem value="average">Average</SelectItem>
            <SelectItem value="needs_review">Needs Review</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterDC} onValueChange={setFilterDC}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="DC" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All DCs</SelectItem>
            {uniqueDCs.map(dc => (
              <SelectItem key={dc} value={dc}>{dc}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[140px]">
            <ArrowUpDown className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="score">Score</SelectItem>
            <SelectItem value="spend">Spend</SelectItem>
          </SelectContent>
        </Select>

        <Badge variant="secondary">{filteredVendors.length} vendors</Badge>
      </div>

      {/* Vendors Table */}
      <Card className="card-elevated">
        <CardContent className="pt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>DC</TableHead>
                <TableHead className="text-center">Bucket</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead className="text-right">OTIF</TableHead>
                <TableHead className="text-right">$ Traded</TableHead>
                <TableHead>Last Review</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVendors.map((vendor) => (
                <TableRow key={vendor.id} className="hover:bg-muted/50">
                  <TableCell>
                    <p className="font-medium">{vendor.name}</p>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{vendor.country}</TableCell>
                  <TableCell className="text-muted-foreground">{vendor.dc}</TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs", bucketConfig[vendor.bucketTag].color)}
                      >
                        {bucketConfig[vendor.bucketTag].icon}
                        <span className="ml-1">{bucketConfig[vendor.bucketTag].label}</span>
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={cn(
                      "font-mono font-semibold",
                      vendor.compositeScore < 60 ? "text-status-danger" : 
                      vendor.compositeScore < 75 ? "text-orange-600" : 
                      vendor.compositeScore < 90 ? "text-status-warning" : "text-status-success"
                    )}>
                      {vendor.compositeScore.toFixed(1)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={cn(
                      "font-mono",
                      vendor.metrics.otif.current < 80 ? "text-status-danger" : 
                      vendor.metrics.otif.current < 90 ? "text-status-warning" : "text-status-success"
                    )}>
                      {vendor.metrics.otif.current}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(vendor.totals.tradedDollar)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(vendor.lastReviewDate)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {vendor.owner}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-7 text-xs"
                        onClick={() => navigate(`/vendor/${vendor.id}`)}
                      >
                        Review
                      </Button>
                      <Button 
                        size="sm" 
                        className="h-7 text-xs"
                        onClick={() => navigate(`/investigate/${vendor.id}`)}
                      >
                        Investigate
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
