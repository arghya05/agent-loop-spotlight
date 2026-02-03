import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { useGovernanceStore, BucketTag } from '@/store/governanceStore';
import { 
  Users, 
  DollarSign, 
  Package, 
  AlertCircle,
  TrendingDown,
  ShieldAlert,
  Clock,
  ChevronRight,
  Search,
  CalendarClock,
  CheckCircle2,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

const bucketConfig: Record<BucketTag, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  good: { 
    label: 'Good Performers', 
    color: 'text-status-success', 
    bgColor: 'bg-status-success-bg border-status-success/20',
    icon: <CheckCircle2 className="w-5 h-5" />
  },
  average: { 
    label: 'Average Performance', 
    color: 'text-status-warning', 
    bgColor: 'bg-status-warning-bg border-status-warning/20',
    icon: <AlertTriangle className="w-5 h-5" />
  },
  needs_review: { 
    label: 'Needs Review', 
    color: 'text-orange-600', 
    bgColor: 'bg-orange-50 border-orange-200',
    icon: <AlertCircle className="w-5 h-5" />
  },
  critical: { 
    label: 'Critical Misses', 
    color: 'text-status-danger', 
    bgColor: 'bg-status-danger-bg border-status-danger/20',
    icon: <XCircle className="w-5 h-5" />
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

export const LandingPage = () => {
  const navigate = useNavigate();
  const { vendors, getBucketStats, getAttentionQueue, policyControls, lastRefresh } = useGovernanceStore();
  
  const bucketStats = getBucketStats();
  const attentionQueue = getAttentionQueue();
  const totalSpend = vendors.reduce((sum, v) => sum + v.totals.tradedDollar, 0);
  const totalPOs = vendors.reduce((sum, v) => sum + v.totals.totalPOs, 0);
  const needsAttention = attentionQueue.length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Supplier Governance Home</h1>
          <p className="text-sm text-muted-foreground">Portfolio overview and exception management</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span>Last refresh: {formatDate(lastRefresh)}</span>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="card-elevated">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Vendors</p>
                <p className="text-3xl font-bold text-foreground">{vendors.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Spend</p>
                <p className="text-3xl font-bold text-foreground">{formatCurrency(totalSpend)}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-status-success/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-status-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total POs</p>
                <p className="text-3xl font-bold text-foreground">{totalPOs}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-status-info/10 flex items-center justify-center">
                <Package className="w-6 h-6 text-status-info" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated border-status-danger/30">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Needs Attention</p>
                <p className="text-3xl font-bold text-status-danger">{needsAttention}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-status-danger/10 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-status-danger" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bucket Cards */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Performance Buckets</h2>
        <div className="grid grid-cols-4 gap-4">
          {(['good', 'average', 'needs_review', 'critical'] as BucketTag[]).map((bucket) => {
            const config = bucketConfig[bucket];
            const stats = bucketStats[bucket];
            const spendShare = totalSpend > 0 ? ((stats.spend / totalSpend) * 100).toFixed(1) : '0';

            return (
              <Card 
                key={bucket}
                className={cn(
                  "card-elevated cursor-pointer hover:shadow-md transition-all border",
                  config.bgColor
                )}
                onClick={() => navigate(`/bucket/${bucket}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className={cn("flex items-center gap-2", config.color)}>
                      {config.icon}
                      <CardTitle className="text-sm font-semibold">{config.label}</CardTitle>
                    </div>
                    <ChevronRight className={cn("w-4 h-4", config.color)} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stats.count}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">Vendors</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{spendShare}%</p>
                      <p className="text-[10px] text-muted-foreground uppercase">Spend</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stats.pos}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">POs</p>
                    </div>
                  </div>
                  {stats.drivers.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {stats.drivers.map((driver, i) => (
                        <Badge 
                          key={i} 
                          variant="secondary" 
                          className="text-[9px] px-1.5 py-0"
                        >
                          {driver}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Attention Queue */}
      <Card className="card-elevated">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-status-danger" />
              <CardTitle className="text-lg">Attention Queue</CardTitle>
              <Badge variant="destructive" className="text-xs">{attentionQueue.length}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Vendor</TableHead>
                <TableHead className="w-[100px]">Bucket</TableHead>
                <TableHead className="w-[80px] text-right">Score</TableHead>
                <TableHead>Issues</TableHead>
                <TableHead className="w-[100px] text-right">$ Traded</TableHead>
                <TableHead className="w-[90px]">Last Review</TableHead>
                <TableHead className="w-[90px]">Next Due</TableHead>
                <TableHead className="w-[160px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attentionQueue.map((vendor) => (
                <TableRow key={vendor.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{vendor.name}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs", bucketConfig[vendor.bucketTag].color)}
                    >
                      {bucketConfig[vendor.bucketTag].label.split(' ')[0]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    <span className={cn(
                      "font-semibold",
                      vendor.compositeScore < 60 ? "text-status-danger" : 
                      vendor.compositeScore < 75 ? "text-orange-600" : "text-status-warning"
                    )}>
                      {vendor.compositeScore.toFixed(1)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {vendor.riskDrivers.slice(0, 3).map((driver, i) => (
                        <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0">
                          {driver}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatCurrency(vendor.totals.tradedDollar)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(vendor.lastReviewDate)}
                  </TableCell>
                  <TableCell className="text-xs">
                    <span className={cn(
                      new Date(vendor.nextReviewDue) < new Date() ? "text-status-danger font-medium" : "text-muted-foreground"
                    )}>
                      {formatDate(vendor.nextReviewDue)}
                    </span>
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
                        <Search className="w-3 h-3 mr-1" />
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

      {/* Policy Controls Snapshot */}
      <Card className="card-elevated">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Policy Controls Snapshot</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {policyControls.map((policy) => (
              <div 
                key={policy.id}
                className="p-4 rounded-lg bg-muted/50 border border-border"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{policy.name}</span>
                  <Switch checked={policy.enabled} disabled />
                </div>
                <p className="text-xs text-muted-foreground mb-2">{policy.description}</p>
                <div className="flex items-center justify-between">
                  <Badge 
                    variant={policy.triggeredCount > 0 ? "destructive" : "secondary"}
                    className="text-xs"
                  >
                    {policy.triggeredCount} triggered this week
                  </Badge>
                  <Button variant="ghost" size="sm" className="h-6 text-xs text-primary">
                    View vendors
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
