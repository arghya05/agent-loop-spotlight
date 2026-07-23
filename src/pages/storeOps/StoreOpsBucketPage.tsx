import { useState, Fragment } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { getStoreAgent, storeBucketMeta, storeOpsSignals, StoreBucketId } from '@/data/storeOps';
import { getStoreAgentContext } from '@/data/storeOpsAgentContext';
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpDown,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Filter,
  Search,
  Wrench,
  XCircle,
  Zap,
} from 'lucide-react';

const bucketIcon: Record<StoreBucketId, React.ReactNode> = {
  breached: <XCircle className="w-5 h-5" />,
  'at-risk': <AlertCircle className="w-5 h-5" />,
  optimized: <CheckCircle2 className="w-5 h-5" />,
};

const formatToday = () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export const StoreOpsBucketPage = () => {
  const navigate = useNavigate();
  const { agentId, bucketId } = useParams();
  const agent = getStoreAgent(agentId);
  const bucket = (bucketId || 'breached') as StoreBucketId;
  const meta = storeBucketMeta[bucket] || storeBucketMeta.breached;
  const narrative = getStoreAgentContext(agent.id).buckets[bucket];

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('impact');

  let signals = storeOpsSignals.filter((s) => s.agentId === agent.id && s.bucket === bucket);
  if (filterCategory !== 'all') signals = signals.filter((s) => s.category === filterCategory);
  if (search.trim()) {
    const q = search.toLowerCase();
    signals = signals.filter(
      (s) =>
        s.storeName.toLowerCase().includes(q) ||
        s.storeId.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q),
    );
  }
  signals = [...signals].sort((a, b) => {
    switch (sortBy) {
      case 'impact':
        return b.estimatedImpact - a.estimatedImpact;
      case 'confidence':
        return b.confidence - a.confidence;
      case 'store':
        return a.storeName.localeCompare(b.storeName);
      case 'due':
        return a.dueIn.localeCompare(b.dueIn);
      default:
        return 0;
    }
  });

  const impact = signals.reduce((sum, s) => sum + s.estimatedImpact, 0);
  const uniqueCategories = [...new Set(storeOpsSignals.filter((s) => s.agentId === agent.id).map((s) => s.category))];
  const showReasons = bucket === 'breached' || bucket === 'at-risk';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/store-ops/${agent.id}/landing`)} className="text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg border', meta.panelClass)}>
              <span
                className={cn(
                  bucket === 'breached' && 'text-status-danger',
                  bucket === 'at-risk' && 'text-status-warning',
                  bucket === 'optimized' && 'text-status-success',
                )}
              >
                {bucketIcon[bucket]}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{agent.label} · {meta.label}</h1>
              <p className="text-sm text-muted-foreground">{meta.description}</p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Value at stake</p>
          <p className="text-xl font-bold">${(impact / 1000).toFixed(0)}K</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span>Last refresh: {formatToday()}</span>
        </div>
      </div>

      {/* Filters & Sort */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search stores, departments..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Retail category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {uniqueCategories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <ArrowUpDown className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="impact">Value at Stake</SelectItem>
            <SelectItem value="confidence">Agent Confidence</SelectItem>
            <SelectItem value="due">Due In</SelectItem>
            <SelectItem value="store">Store Name</SelectItem>
          </SelectContent>
        </Select>

        <Badge variant="secondary" className="text-sm">{signals.length} exceptions</Badge>
      </div>

      {/* Signals Table */}
      <Card className="card-elevated">
        <CardContent className="pt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Store</TableHead>
                <TableHead className="w-[110px]">Category</TableHead>
                <TableHead className="w-[140px]">Metric</TableHead>
                <TableHead className="w-[100px] text-right">vs Target</TableHead>
                <TableHead className="w-[90px] text-right">Confidence</TableHead>
                <TableHead className="w-[100px] text-right">$ Impact</TableHead>
                <TableHead className="w-[80px]">Due In</TableHead>
                <TableHead className="w-[140px]">Owner</TableHead>
                <TableHead className="w-[180px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {signals.map((signal) => (
                <Fragment key={signal.id}>
                  <TableRow className="hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <p className="font-medium">{signal.storeName}</p>
                        <p className="text-xs text-muted-foreground">{signal.storeId} · {signal.country} · {signal.department}</p>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{signal.category}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{signal.metricLabel}</TableCell>
                    <TableCell className="text-right">
                      <span className="font-mono font-semibold text-sm">{signal.metricValue}</span>
                      <p className="text-[10px] text-muted-foreground">target {signal.threshold}</p>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">{Math.round(signal.confidence * 100)}%</TableCell>
                    <TableCell className="text-right font-mono text-sm">${(signal.estimatedImpact / 1000).toFixed(0)}K</TableCell>
                    <TableCell className="text-xs">{signal.dueIn}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{signal.recommendedOwner}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          className="h-7 text-xs bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                          onClick={() => navigate(`/store-ops/${agent.id}/signal/${signal.id}`)}
                        >
                          <Wrench className="w-3 h-3 mr-1" />
                          Fix Now
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => navigate(`/store-ops/${agent.id}/signal/${signal.id}`)}>
                          Investigate
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {showReasons && (
                    <TableRow className="bg-muted/20 hover:bg-muted/30">
                      <TableCell colSpan={9} className="py-2">
                        <div className="flex items-start gap-2 flex-wrap">
                          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground pt-0.5">
                            Why {bucket === 'breached' ? 'breached' : 'at risk'}:
                          </span>
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-[11px] font-normal max-w-3xl whitespace-normal text-left',
                              bucket === 'breached'
                                ? 'border-status-danger/40 bg-status-danger-bg text-status-danger'
                                : 'border-status-warning/40 bg-status-warning-bg text-status-warning',
                            )}
                          >
                            {signal.reason}
                          </Badge>
                          {signal.evidence.slice(0, 2).map((e, i) => (
                            <Badge key={i} variant="outline" className="text-[11px] font-normal border-border text-muted-foreground">
                              <Zap className="w-3 h-3 mr-1" />
                              {e}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))}
              {signals.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-sm text-muted-foreground py-10">
                    No exceptions match the current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
