import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useGovernanceStore, BucketTag } from '@/store/governanceStore';
import { 
  ChevronLeft,
  Search,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  XCircle,
  Clock,
  CalendarClock,
  Wrench
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, Fragment as FragmentRow } from 'react';

const bucketConfig: Record<BucketTag, { label: string; planType: string; color: string; bgColor: string; icon: React.ReactNode; description: string }> = {
  good: { 
    label: 'On Track', 
    planType: 'Maintain Plan',
    color: 'text-status-success', 
    bgColor: 'bg-status-success-bg',
    icon: <CheckCircle2 className="w-5 h-5" />,
    description: 'Composite score ≥ 90 with no critical compliance breaches'
  },
  average: { 
    label: 'Watchlist', 
    planType: 'Quick Fix Plan',
    color: 'text-status-warning', 
    bgColor: 'bg-status-warning-bg',
    icon: <AlertTriangle className="w-5 h-5" />,
    description: 'Composite score 75-89 or minor compliance breaches'
  },
  needs_review: { 
    label: 'At Risk', 
    planType: 'Recovery Plan',
    color: 'text-orange-600', 
    bgColor: 'bg-orange-50',
    icon: <AlertCircle className="w-5 h-5" />,
    description: 'Composite score 60-74 or repeated metric drift'
  },
  critical: { 
    label: 'Breached', 
    planType: 'Contain + Escalate',
    color: 'text-status-danger', 
    bgColor: 'bg-status-danger-bg',
    icon: <XCircle className="w-5 h-5" />,
    description: 'Composite score < 60, OTIF < 70, or critical compliance breach'
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

export const BucketPage = () => {
  const { bucketId } = useParams<{ bucketId: string }>();
  const navigate = useNavigate();
  const { vendors, lastRefresh } = useGovernanceStore();
  const [sortBy, setSortBy] = useState<string>('score');
  const [filterDC, setFilterDC] = useState<string>('all');

  const bucket = (bucketId || 'critical') as BucketTag;
  const config = bucketConfig[bucket];

  // Filter vendors by bucket
  let filteredVendors = vendors.filter(v => v.bucketTag === bucket);
  
  // Apply DC filter
  if (filterDC !== 'all') {
    filteredVendors = filteredVendors.filter(v => v.dc === filterDC);
  }

  // Sort vendors
  filteredVendors = [...filteredVendors].sort((a, b) => {
    switch (sortBy) {
      case 'score': return a.compositeScore - b.compositeScore;
      case 'spend': return b.totals.tradedDollar - a.totals.tradedDollar;
      case 'otif': return a.metrics.otif.current - b.metrics.otif.current;
      case 'name': return a.name.localeCompare(b.name);
      default: return 0;
    }
  });

  const uniqueDCs = [...new Set(vendors.map(v => v.dc))];

  const showReasons = bucket === 'needs_review' || bucket === 'critical';

  const computeReasons = (v: any): { label: string; tone: 'danger' | 'warning' }[] => {
    const reasons: { label: string; tone: 'danger' | 'warning' }[] = [];
    const m = v.metrics;
    if (m.otif.current < m.otif.target) {
      const gap = m.otif.target - m.otif.current;
      reasons.push({
        label: `OTIF ${m.otif.current}% vs target ${m.otif.target}% (−${gap}pp, prev ${m.otif.previous}%)`,
        tone: m.otif.current < 80 ? 'danger' : 'warning',
      });
    }
    if (m.fillRate.current < m.fillRate.target) {
      reasons.push({
        label: `Fill rate ${m.fillRate.current}% below ${m.fillRate.target}% target`,
        tone: m.fillRate.current < 90 ? 'danger' : 'warning',
      });
    }
    if (m.quality.current < m.quality.target) {
      reasons.push({
        label: `Quality ${m.quality.current}% below ${m.quality.target}% target`,
        tone: m.quality.current < 95 ? 'danger' : 'warning',
      });
    }
    if (m.compliance.current > m.compliance.target) {
      reasons.push({
        label: `Compliance breach rate ${m.compliance.current}% above ${m.compliance.target}% threshold`,
        tone: m.compliance.current > 2 ? 'danger' : 'warning',
      });
    }
    (v.complianceIssues || [])
      .filter((i: any) => i.status === 'open')
      .forEach((i: any) =>
        reasons.push({
          label: `${i.type}: ${i.evidence}`,
          tone: i.severity === 'critical' ? 'danger' : 'warning',
        })
      );
    (v.riskDrivers || []).forEach((d: string) => {
      if (!reasons.some(r => r.label.toLowerCase().includes(d.toLowerCase().split(' ')[0]))) {
        reasons.push({ label: d, tone: 'warning' });
      }
    });
    if (new Date(v.nextReviewDue) < new Date()) {
      reasons.push({ label: `Review overdue (was due ${formatDate(v.nextReviewDue)})`, tone: 'warning' });
    }
    return reasons;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/landing')}
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
              <h1 className="text-2xl font-bold text-foreground">{config.label}</h1>
              <p className="text-sm text-muted-foreground">{config.description}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span>Last refresh: {formatDate(lastRefresh)}</span>
        </div>
      </div>

      {/* Filters & Sort */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search vendors..." className="pl-9" />
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
            <SelectItem value="score">Composite Score</SelectItem>
            <SelectItem value="spend">Spend</SelectItem>
            <SelectItem value="otif">OTIF</SelectItem>
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
                <TableHead className="w-[200px]">Vendor</TableHead>
                <TableHead className="w-[80px] text-right">Score</TableHead>
                <TableHead className="w-[70px] text-right">OTIF</TableHead>
                <TableHead className="w-[70px] text-right">Fill</TableHead>
                <TableHead className="w-[70px] text-right">Quality</TableHead>
                <TableHead className="w-[80px] text-right">Compliance</TableHead>
                <TableHead className="w-[70px] text-right">POs</TableHead>
                <TableHead className="w-[80px] text-right">Volume</TableHead>
                <TableHead className="w-[100px] text-right">$ Traded</TableHead>
                <TableHead className="w-[90px]">Last Review</TableHead>
                <TableHead className="w-[90px]">Next Due</TableHead>
                <TableHead className="w-[100px]">Owner</TableHead>
                <TableHead className="w-[160px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVendors.map((vendor) => {
                const reasons = showReasons ? computeReasons(vendor) : [];
                return (
                <FragmentRow key={vendor.id}>
                <TableRow key={vendor.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div>
                      <p className="font-medium">{vendor.name}</p>
                      <p className="text-xs text-muted-foreground">{vendor.dc}</p>
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
                      "font-mono text-sm",
                      vendor.metrics.otif.current < 80 ? "text-status-danger" : 
                      vendor.metrics.otif.current < 90 ? "text-status-warning" : "text-status-success"
                    )}>
                      {vendor.metrics.otif.current}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={cn(
                      "font-mono text-sm",
                      vendor.metrics.fillRate.current < 90 ? "text-status-danger" : 
                      vendor.metrics.fillRate.current < 95 ? "text-status-warning" : "text-status-success"
                    )}>
                      {vendor.metrics.fillRate.current}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-mono text-sm">
                      {vendor.metrics.quality.current.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={cn(
                      "font-mono text-sm",
                      vendor.metrics.compliance.current > 2 ? "text-status-danger" : 
                      vendor.metrics.compliance.current > 1 ? "text-status-warning" : "text-status-success"
                    )}>
                      {vendor.metrics.compliance.current}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {vendor.totals.totalPOs}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {(vendor.totals.totalVolume / 1000).toFixed(1)}K
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatCurrency(vendor.totals.tradedDollar)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(vendor.lastReviewDate)}
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "text-xs",
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
                        className="h-7 text-xs bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                        onClick={() => navigate(`/vendor/${vendor.id}`)}
                      >
                        <Wrench className="w-3 h-3 mr-1" />
                        Fix Now
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-7 text-xs"
                        onClick={() => navigate(`/investigate/${vendor.id}`)}
                      >
                        Investigate
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                {showReasons && reasons.length > 0 && (
                  <TableRow key={`${vendor.id}-why`} className="bg-muted/20 hover:bg-muted/30">
                    <TableCell colSpan={13} className="py-2">
                      <div className="flex items-start gap-2 flex-wrap">
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground pt-0.5">
                          Why {bucket === 'critical' ? 'breached' : 'at risk'}:
                        </span>
                        {reasons.map((r, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className={cn(
                              'text-[11px] font-normal',
                              r.tone === 'danger'
                                ? 'border-status-danger/40 bg-status-danger-bg text-status-danger'
                                : 'border-status-warning/40 bg-status-warning-bg text-status-warning'
                            )}
                          >
                            {r.label}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                </FragmentRow>
              );})}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
