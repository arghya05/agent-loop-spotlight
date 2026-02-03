import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { 
  Package, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ChevronRight, 
  DollarSign,
  Users,
  TrendingUp,
  Calendar,
  Send,
  Zap,
  Factory
} from 'lucide-react';
import { cn } from '@/lib/utils';
import dispatchVendorsData from '@/data/dispatch/vendors.json';
import dispatchSettingsData from '@/data/dispatch/settings.json';

type BucketTag = 'Flow' | 'AW' | 'SS';

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
  commsTrail: any[];
}

const bucketConfig: Record<BucketTag, { label: string; fullLabel: string; color: string; bgColor: string; icon: React.ReactNode; description: string }> = {
  Flow: { 
    label: 'Flow', 
    fullLabel: 'Flow (On Track)',
    color: 'text-status-success', 
    bgColor: 'bg-status-success-bg border-status-success/20',
    icon: <CheckCircle2 className="w-5 h-5" />,
    description: 'Low risk, all milestones on schedule'
  },
  AW: { 
    label: 'AW', 
    fullLabel: 'Attention / Watchlist',
    color: 'text-status-warning', 
    bgColor: 'bg-status-warning-bg border-status-warning/20',
    icon: <AlertTriangle className="w-5 h-5" />,
    description: 'Early warning, risk rising but recoverable'
  },
  SS: { 
    label: 'SS', 
    fullLabel: 'Slipping Schedule',
    color: 'text-status-danger', 
    bgColor: 'bg-status-danger-bg border-status-danger/20',
    icon: <XCircle className="w-5 h-5" />,
    description: 'High probability of missing ex-factory date'
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

export const DispatchLandingPage = () => {
  const navigate = useNavigate();
  const vendors = dispatchVendorsData.vendors as DispatchVendor[];
  const settings = dispatchSettingsData;

  // Calculate bucket stats
  const getBucketStats = () => {
    const stats: Record<BucketTag, { count: number; pos: number; volume: number; atRisk: number; drivers: string[] }> = {
      Flow: { count: 0, pos: 0, volume: 0, atRisk: 0, drivers: [] },
      AW: { count: 0, pos: 0, volume: 0, atRisk: 0, drivers: [] },
      SS: { count: 0, pos: 0, volume: 0, atRisk: 0, drivers: [] }
    };

    vendors.forEach(v => {
      const bucket = v.bucketTag as BucketTag;
      if (stats[bucket]) {
        stats[bucket].count++;
        stats[bucket].pos += v.openPOCount;
        stats[bucket].volume += v.totalVolumeUnits;
        stats[bucket].atRisk += v.atRiskDollar;
        v.riskDrivers.forEach(d => {
          if (!stats[bucket].drivers.includes(d)) stats[bucket].drivers.push(d);
        });
      }
    });

    // Keep only top 2 drivers
    Object.keys(stats).forEach(key => {
      stats[key as BucketTag].drivers = stats[key as BucketTag].drivers.slice(0, 2);
    });

    return stats;
  };

  const bucketStats = getBucketStats();
  const totalPOs = vendors.reduce((sum, v) => sum + v.openPOCount, 0);
  const totalVolume = vendors.reduce((sum, v) => sum + v.totalVolumeUnits, 0);
  const totalAtRisk = vendors.reduce((sum, v) => sum + v.atRiskDollar, 0);
  const onTimePerformance = Math.round((bucketStats.Flow.pos / totalPOs) * 100);

  // Attention queue: SS and AW vendors sorted by risk
  const attentionQueue = vendors
    .filter(v => v.bucketTag === 'SS' || v.bucketTag === 'AW')
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 10);

  // Early warning signals
  const earlyWarnings = [
    { type: 'Fabric Delay', count: 3, severity: 'critical' },
    { type: 'QC Hold', count: 2, severity: 'warning' },
    { type: 'Sewing Behind', count: 4, severity: 'warning' },
    { type: 'Capacity Issue', count: 1, severity: 'info' },
    { type: 'Inspection Backlog', count: 2, severity: 'critical' }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dispatch Readiness Home</h1>
          <p className="text-sm text-muted-foreground">Portfolio-level manufacturing & dispatch readiness</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span>Last refresh: {formatDate(settings.lastRefresh)}</span>
        </div>
      </div>

      {/* Portfolio KPIs */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="card-elevated">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">On-Time Rate</p>
                <p className="text-3xl font-bold text-status-success">{onTimePerformance}%</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-status-success/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-status-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">POs In Flight</p>
                <p className="text-3xl font-bold text-foreground">{totalPOs}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Volume</p>
                <p className="text-3xl font-bold text-foreground">{(totalVolume / 1000).toFixed(0)}K</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-status-info/10 flex items-center justify-center">
                <Factory className="w-6 h-6 text-status-info" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated border-status-danger/30">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">$ At Risk</p>
                <p className="text-3xl font-bold text-status-danger">{formatCurrency(totalAtRisk)}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-status-danger/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-status-danger" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Vendors</p>
                <p className="text-3xl font-bold text-foreground">{vendors.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                <Users className="w-6 h-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bucket Cards */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Readiness Buckets</h2>
        <div className="grid grid-cols-3 gap-4">
          {(['SS', 'AW', 'Flow'] as BucketTag[]).map((bucket) => {
            const config = bucketConfig[bucket];
            const stats = bucketStats[bucket];

            return (
              <Card 
                key={bucket}
                className={cn(
                  "card-elevated cursor-pointer hover:shadow-md transition-all border",
                  config.bgColor
                )}
                onClick={() => navigate(`/dispatch/bucket/${bucket.toLowerCase()}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className={cn("flex items-center gap-2", config.color)}>
                      {config.icon}
                      <div>
                        <CardTitle className="text-sm font-semibold">{config.fullLabel}</CardTitle>
                        <p className="text-[10px] text-muted-foreground font-normal">{config.description}</p>
                      </div>
                    </div>
                    <ChevronRight className={cn("w-4 h-4", config.color)} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stats.count}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">Vendors</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stats.pos}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">POs</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{(stats.volume / 1000).toFixed(0)}K</p>
                      <p className="text-[10px] text-muted-foreground uppercase">Units</p>
                    </div>
                    <div>
                      <p className={cn("text-2xl font-bold", bucket !== 'Flow' ? 'text-status-danger' : 'text-foreground')}>
                        {formatCurrency(stats.atRisk)}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase">At Risk</p>
                    </div>
                  </div>
                  {stats.drivers.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {stats.drivers.map((driver, i) => (
                        <Badge key={i} variant="secondary" className="text-[9px] px-1.5 py-0">
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

      <div className="grid grid-cols-3 gap-6">
        {/* Attention Queue */}
        <div className="col-span-2">
          <Card className="card-elevated">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-status-danger" />
                <CardTitle className="text-lg">Today's Attention Queue</CardTitle>
                <Badge variant="destructive" className="text-xs">{attentionQueue.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[160px]">Vendor</TableHead>
                    <TableHead className="w-[60px]">Bucket</TableHead>
                    <TableHead className="w-[60px] text-right">Risk</TableHead>
                    <TableHead className="w-[50px] text-right">POs</TableHead>
                    <TableHead className="w-[80px] text-right">$ At Risk</TableHead>
                    <TableHead>Top Risk Driver</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attentionQueue.map((vendor) => (
                    <TableRow key={vendor.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{vendor.name}</p>
                          <p className="text-[10px] text-muted-foreground">{vendor.factoryLocation}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={cn(
                            "text-[10px]",
                            vendor.bucketTag === 'SS' ? "bg-status-danger text-white" : "bg-status-warning text-white"
                          )}
                        >
                          {vendor.bucketTag}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={cn(
                          "font-mono font-semibold text-sm",
                          vendor.riskScore >= 70 ? "text-status-danger" : "text-status-warning"
                        )}>
                          {vendor.riskScore}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">{vendor.openPOCount}</TableCell>
                      <TableCell className="text-right font-mono text-sm text-status-danger">
                        {formatCurrency(vendor.atRiskDollar)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {vendor.riskDrivers[0] || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          className="h-7 text-xs"
                          onClick={() => navigate(`/dispatch/vendor/${vendor.id}`)}
                        >
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Early Warning Signals */}
        <div>
          <Card className="card-elevated">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-status-warning" />
                <CardTitle className="text-lg">Early Warning Signals</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {earlyWarnings.map((warning, i) => (
                <div 
                  key={i}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors",
                    warning.severity === 'critical' && "bg-status-danger/5 border-status-danger/20",
                    warning.severity === 'warning' && "bg-status-warning/5 border-status-warning/20",
                    warning.severity === 'info' && "bg-muted/50 border-border"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      warning.severity === 'critical' && "bg-status-danger/10",
                      warning.severity === 'warning' && "bg-status-warning/10",
                      warning.severity === 'info' && "bg-muted"
                    )}>
                      {warning.severity === 'critical' ? (
                        <XCircle className="w-4 h-4 text-status-danger" />
                      ) : warning.severity === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-status-warning" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <span className="text-sm font-medium">{warning.type}</span>
                  </div>
                  <Badge 
                    className={cn(
                      "text-xs",
                      warning.severity === 'critical' && "bg-status-danger",
                      warning.severity === 'warning' && "bg-status-warning",
                      warning.severity === 'info' && "bg-muted text-muted-foreground"
                    )}
                  >
                    {warning.count} POs
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
