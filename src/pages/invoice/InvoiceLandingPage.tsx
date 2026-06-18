import { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  CheckCircle2, AlertTriangle, XCircle, Ban, DollarSign,
  TrendingUp, Clock, FileText, ArrowRight, Zap, RefreshCw
} from 'lucide-react';
import invoicesData from '@/data/invoice/invoices.json';
import cashData from '@/data/invoice/cashOpportunities.json';
import { useInvoiceStore } from '@/store/invoiceStore';
import { AutopilotPanel, AutopilotStep } from '@/components/AutopilotPanel';

const buckets = [
  { id: 'matched', label: 'Matched / AutoPay', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { id: 'needs_review', label: 'Needs Review', icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  { id: 'dispute', label: 'Dispute', icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  { id: 'hold', label: 'Hold / Blocked', icon: Ban, color: 'text-foreground', bg: 'bg-muted', border: 'border-border' },
  { id: 'cash_opportunity', label: 'Cash Opportunity', icon: DollarSign, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
];

export const InvoiceLandingPage = () => {
  const navigate = useNavigate();
  const { role, setRole } = useInvoiceStore();
  const invoices = invoicesData as any[];
  const cashOpps = cashData as any[];

  const getBucketInvoices = (bucketId: string) => invoices.filter(i => i.bucketTag === bucketId);
  const getBucketTotal = (bucketId: string) => getBucketInvoices(bucketId).reduce((s, i) => s + i.total, 0);

  const totalInvoices = invoices.length;
  const autoMatchedPct = Math.round((getBucketInvoices('matched').length / totalInvoices) * 100);
  const exceptionsAmount = getBucketTotal('needs_review') + getBucketTotal('dispute') + getBucketTotal('hold');
  const recoveredAmount = 11360 + 7387;
  const cashSavings = cashOpps.reduce((s, c) => s + c.decision.expectedSavings, 0);

  const exceptionInvoices = invoices.filter(i => i.bucketTag !== 'matched');

  const topDrivers: Record<string, string[]> = {
    matched: ['3-way match within tolerance'],
    needs_review: ['Price variance >5%', 'Missing GRN'],
    dispute: ['Price mismatch', 'Qty overbilling'],
    hold: ['Suspected duplicate', 'Sanctioned supplier'],
    cash_opportunity: ['2/10 net 30', '1.5/15 net 45'],
  };

  const autopilotSteps: AutopilotStep[] = [
    { id: 'scan', label: 'Scanning AP queue', duration: 1400,
      activities: () => [{ message: `Found ${invoices.length} invoices (${exceptionInvoices.length} exceptions)`, type: 'info' }] },
    { id: 'match', label: '3-way matching', duration: 1800,
      activities: () => invoices.slice(0, 6).map(i => ({ message: `Matching ${i.invoiceNumber} · ${i.supplierName} → PO/GRN`, type: 'action' as const })) },
    { id: 'detect', label: 'Detecting anomalies', duration: 1600,
      activities: () => exceptionInvoices.slice(0, 5).map(i => ({ message: `${i.invoiceNumber}: ${i.anomalyFlags[0]?.type?.replace(/_/g, ' ') || 'flagged'} (${i.confidenceScore}% conf)`, type: 'info' as const })) },
    { id: 'cash', label: 'Cash opportunity scan', duration: 1500,
      activities: () => cashOpps.map(c => ({ message: `${c.supplierName}: ${c.discountTerms.discountPct}/${c.discountTerms.days} → $${c.decision.expectedSavings.toLocaleString()} savings`, type: 'success' as const })) },
    { id: 'execute', label: 'Auto-resolving', duration: 1800,
      activities: () => getBucketInvoices('matched').slice(0, 6).map(i => ({ message: `Auto-approved ${i.invoiceNumber} for payment`, type: 'success' as const })) },
    { id: 'complete', label: 'Complete', duration: 400 },
  ];



  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AP Command Center</h1>
          <p className="text-sm text-muted-foreground">Invoice matching, disputes & cash optimization</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
            className="text-xs border border-border rounded-md px-2 py-1.5 bg-background text-foreground"
          >
            <option>AP Analyst</option>
            <option>Finance Manager</option>
            <option>Controller</option>
            <option>Admin</option>
          </select>
          <Badge variant="outline" className="text-[10px] gap-1">
            <RefreshCw className="w-3 h-3" /> Updated 15 min ago
          </Badge>
        </div>
      </div>

      <AutopilotPanel
        steps={autopilotSteps}
        queueCount={exceptionInvoices.length}
        itemLabel="invoices"
        title="AP Autopilot"
        onComplete={(n) => toast.success(`Autopilot complete · ${n} invoices reviewed`)}
      />



      {/* KPI Cards */}
      <div className="grid grid-cols-6 gap-3">
        {[
          { label: 'Total Invoices', value: totalInvoices, icon: FileText },
          { label: 'Auto-Matched', value: `${autoMatchedPct}%`, icon: CheckCircle2 },
          { label: '$ in Exceptions', value: `$${(exceptionsAmount / 1000).toFixed(0)}K`, icon: AlertTriangle },
          { label: 'Avg Days to Clear', value: '4.2d', icon: Clock },
          { label: '$ Recovered', value: `$${(recoveredAmount / 1000).toFixed(1)}K`, icon: TrendingUp },
          { label: 'Cash Savings', value: `$${(cashSavings / 1000).toFixed(1)}K`, icon: DollarSign },
        ].map((kpi) => (
          <Card key={kpi.label} className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <kpi.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground">{kpi.label}</span>
              </div>
              <p className="text-xl font-bold text-foreground">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bucket Cards */}
      <div className="grid grid-cols-5 gap-3">
        {buckets.map((bucket) => {
          const items = getBucketInvoices(bucket.id);
          const total = items.reduce((s, i) => s + i.total, 0);
          const Icon = bucket.icon;
          return (
            <Card
              key={bucket.id}
              className={`cursor-pointer hover:shadow-md transition-shadow border ${bucket.border}`}
              onClick={() => navigate(`/invoice/bucket/${bucket.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded-md ${bucket.bg}`}>
                    <Icon className={`w-4 h-4 ${bucket.color}`} />
                  </div>
                  <span className="text-xs font-medium text-foreground">{bucket.label}</span>
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-2xl font-bold text-foreground">{items.length}</span>
                  <span className="text-xs text-muted-foreground">invoices</span>
                </div>
                <p className="text-sm font-medium text-foreground mb-2">${(total / 1000).toFixed(0)}K</p>
                <div className="flex flex-wrap gap-1">
                  {(topDrivers[bucket.id] || []).map((d) => (
                    <Badge key={d} variant="outline" className="text-[9px] px-1 py-0 font-normal">{d}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Exceptions Queue */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            Today's Exceptions Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Invoice</TableHead>
                <TableHead className="text-xs">Supplier</TableHead>
                <TableHead className="text-xs">Bucket</TableHead>
                <TableHead className="text-xs text-right">Amount</TableHead>
                <TableHead className="text-xs text-center">Confidence</TableHead>
                <TableHead className="text-xs">Main Issue</TableHead>
                <TableHead className="text-xs text-right">Recovery</TableHead>
                <TableHead className="text-xs">Owner</TableHead>
                <TableHead className="text-xs"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exceptionInvoices.map((inv) => {
                const bucket = buckets.find(b => b.id === inv.bucketTag);
                return (
                  <TableRow key={inv.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/invoice/invoice/${inv.id}`)}>
                    <TableCell className="text-xs font-medium">{inv.invoiceNumber}</TableCell>
                    <TableCell className="text-xs">{inv.supplierName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] ${bucket?.color || ''}`}>{bucket?.label}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-right font-medium">${inv.total.toLocaleString()}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={inv.confidenceScore > 70 ? 'default' : inv.confidenceScore > 40 ? 'secondary' : 'destructive'} className="text-[10px]">
                        {inv.confidenceScore}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{inv.anomalyFlags[0]?.type?.replace(/_/g, ' ') || '—'}</TableCell>
                    <TableCell className="text-xs text-right font-medium text-emerald-600">
                      {inv.recommendedAction.expectedRecovery > 0 ? `$${inv.recommendedAction.expectedRecovery.toLocaleString()}` : '—'}
                    </TableCell>
                    <TableCell className="text-xs">{inv.owner}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Cash Optimization Spotlight */}
      <Card className="border-blue-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-blue-500" />
            Cash Optimization Spotlight
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Supplier</TableHead>
                <TableHead className="text-xs">Terms</TableHead>
                <TableHead className="text-xs text-right">Eligible</TableHead>
                <TableHead className="text-xs text-right">Savings</TableHead>
                <TableHead className="text-xs">Pay Date</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cashOpps.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="text-xs font-medium">{c.supplierName}</TableCell>
                  <TableCell className="text-xs">{c.discountTerms.discountPct}/{c.discountTerms.days} net {c.discountTerms.netDays}</TableCell>
                  <TableCell className="text-xs text-right">${c.totalEligible.toLocaleString()}</TableCell>
                  <TableCell className="text-xs text-right font-medium text-emerald-600">${c.decision.expectedSavings.toLocaleString()}</TableCell>
                  <TableCell className="text-xs">{c.decision.payDate}</TableCell>
                  <TableCell>
                    <Badge variant={c.status === 'approved' ? 'default' : 'secondary'} className="text-[10px]">
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {c.status === 'pending' && (
                      <Button size="sm" className="h-6 px-2 text-xs" onClick={() => toast.success(`Cash opportunity ${c.id} approved`)}>Approve</Button>
                    )}
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
