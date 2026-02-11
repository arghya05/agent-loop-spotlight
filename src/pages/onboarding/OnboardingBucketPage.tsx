import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  ChevronLeft, Search, ArrowUpDown, CheckCircle2, AlertTriangle, Ban, Clock, Send
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import suppliersData from '@/data/onboarding/suppliers.json';
import settingsData from '@/data/onboarding/settings.json';

type Bucket = 'fast-track' | 'needs-review' | 'blocked';

const bucketConfig: Record<Bucket, { label: string; color: string; bgColor: string; icon: React.ReactNode; description: string }> = {
  'fast-track': { label: 'Fast Track', color: 'text-status-success', bgColor: 'bg-status-success-bg', icon: <CheckCircle2 className="w-5 h-5" />, description: 'Low risk, auto-approvable. Risk score ≤ 25, all docs passed.' },
  'needs-review': { label: 'Needs Review', color: 'text-status-warning', bgColor: 'bg-status-warning-bg', icon: <AlertTriangle className="w-5 h-5" />, description: 'Medium/high risk, requires human approval gate. Risk score 26-60.' },
  'blocked': { label: 'Blocked', color: 'text-status-danger', bgColor: 'bg-status-danger-bg', icon: <Ban className="w-5 h-5" />, description: 'Fails mandatory checks (sanctions/critical ESG/missing docs). Risk score > 60.' },
};

const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export const OnboardingBucketPage = () => {
  const { bucketId } = useParams<{ bucketId: string }>();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState('risk');
  const [filterCountry, setFilterCountry] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const bucket = (bucketId || 'fast-track') as Bucket;
  const config = bucketConfig[bucket];

  let filtered = suppliersData.suppliers.filter(s => s.bucketTag === bucket);
  if (searchQuery) filtered = filtered.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
  if (filterCountry !== 'all') filtered = filtered.filter(s => s.country === filterCountry);
  filtered = [...filtered].sort((a, b) => sortBy === 'risk' ? b.riskScore - a.riskScore : a.name.localeCompare(b.name));

  const countries = [...new Set(suppliersData.suppliers.map(s => s.country))];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/onboarding/landing')} className="text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
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
          <span>Last refresh: Jan 20</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search suppliers..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <Select value={filterCountry} onValueChange={setFilterCountry}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Country" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            {countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[160px]"><ArrowUpDown className="w-4 h-4 mr-2" /><SelectValue placeholder="Sort" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="risk">Risk Score</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="secondary">{filtered.length} suppliers</Badge>
      </div>

      <Card className="card-elevated">
        <CardContent className="pt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[160px]">Supplier</TableHead>
                <TableHead className="w-[70px] text-right">Risk</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Docs</TableHead>
                <TableHead>External Flags</TableHead>
                <TableHead className="w-[80px]">Owner</TableHead>
                <TableHead className="w-[180px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(supplier => {
                const docsComplete = supplier.requiredDocs.filter(d => d.status === 'verified').length;
                const docsTotal = supplier.requiredDocs.length;
                const criticalFlags = supplier.externalSignals.filter(e => e.severity === 'critical');
                return (
                  <TableRow key={supplier.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div><p className="font-medium">{supplier.name}</p><p className="text-xs text-muted-foreground">{supplier.factoryLocations.join(', ')}</p></div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={cn("font-mono font-semibold", supplier.riskScore >= 60 ? "text-status-danger" : supplier.riskScore >= 26 ? "text-status-warning" : "text-status-success")}>{supplier.riskScore}</span>
                    </TableCell>
                    <TableCell className="text-sm">{supplier.country}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">{supplier.categories.slice(0, 2).map((c, i) => <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0">{c}</Badge>)}</div>
                    </TableCell>
                    <TableCell>
                      <span className={cn("text-xs font-medium", docsComplete === docsTotal ? "text-status-success" : "text-status-warning")}>{docsComplete}/{docsTotal}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {criticalFlags.slice(0, 2).map((f, i) => <Badge key={i} variant="destructive" className="text-[10px] px-1.5 py-0">{f.type}</Badge>)}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{supplier.owner}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button size="sm" className="h-7 text-xs" onClick={() => navigate(`/onboarding/case/${supplier.onboardingCaseId}`)}>Review</Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => navigate(`/onboarding/supplier/${supplier.id}`)}>360</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
