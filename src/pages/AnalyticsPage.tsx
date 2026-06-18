import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGovernanceStore } from '@/store/governanceStore';
import { useAgentContext } from '@/hooks/useAgentContext';
import { 
  BarChart3,
  Download,
  Filter,
  PieChart,
  TrendingUp,
  Truck,
  AlertTriangle,
  DollarSign,
  Clock,
  Package
} from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, CartesianGrid } from 'recharts';

const COLORS = ['#16a34a', '#eab308', '#f97316', '#dc2626'];
const DISPATCH_COLORS = ['#dc2626', '#eab308', '#16a34a']; // SS, AW, Flow

// Dispatch Analytics
const DispatchAnalyticsPage = () => {
  const dispatchPieData = [
    { name: 'Slipping', value: 18, color: '#dc2626' },
    { name: 'Watchlist', value: 45, color: '#eab308' },
    { name: 'On Track', value: 279, color: '#16a34a' }
  ];

  const riskByCategory = [
    { name: 'Apparel', atRisk: 2.4, onTrack: 8.2 },
    { name: 'Home', atRisk: 1.8, onTrack: 5.4 },
    { name: 'Footwear', atRisk: 0.9, onTrack: 3.1 },
    { name: 'Accessories', atRisk: 0.4, onTrack: 2.8 }
  ];

  const onTimePerformanceTrend = [
    { week: 'W1', rate: 78 },
    { week: 'W2', rate: 82 },
    { week: 'W3', rate: 79 },
    { week: 'W4', rate: 85 },
    { week: 'W5', rate: 88 },
    { week: 'W6', rate: 84 },
    { week: 'W7', rate: 87 },
    { week: 'W8', rate: 91 }
  ];

  const topRiskVendors = [
    { name: 'SuratHomeTex', bucket: 'SS', riskScore: 78, posAtRisk: 5, dollarAtRisk: 2.4 },
    { name: 'TirupurKnits', bucket: 'SS', riskScore: 72, posAtRisk: 3, dollarAtRisk: 1.8 },
    { name: 'DelhiTextiles', bucket: 'AW', riskScore: 58, posAtRisk: 4, dollarAtRisk: 1.2 },
    { name: 'MumbaiWeaves', bucket: 'AW', riskScore: 52, posAtRisk: 2, dollarAtRisk: 0.9 },
    { name: 'KolkataFabrics', bucket: 'AW', riskScore: 48, posAtRisk: 2, dollarAtRisk: 0.7 }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Truck className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Dispatch Analytics</h1>
          </div>
          <p className="text-sm text-muted-foreground">Readiness reporting and performance insights</p>
        </div>
        <Button variant="outline" onClick={() => toast.success('Dispatch analytics report exported')}>
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select defaultValue="all">
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Product Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="apparel">Apparel</SelectItem>
            <SelectItem value="home">Home Textiles</SelectItem>
            <SelectItem value="footwear">Footwear</SelectItem>
            <SelectItem value="accessories">Accessories</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="all">
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Factory Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            <SelectItem value="india">India</SelectItem>
            <SelectItem value="bangladesh">Bangladesh</SelectItem>
            <SelectItem value="vietnam">Vietnam</SelectItem>
            <SelectItem value="china">China</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="all">
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Bucket" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Buckets</SelectItem>
            <SelectItem value="ss">Slipping</SelectItem>
            <SelectItem value="aw">Watchlist</SelectItem>
            <SelectItem value="flow">On Track</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="card-elevated">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-status-success/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-status-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">87%</p>
                <p className="text-xs text-muted-foreground">On-Time Rate (MTD)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-status-danger/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-status-danger" />
              </div>
              <div>
                <p className="text-2xl font-bold">$5.2M</p>
                <p className="text-xs text-muted-foreground">$ At Risk</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-status-warning/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-status-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">63</p>
                <p className="text-xs text-muted-foreground">POs At Risk</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">4.2</p>
                <p className="text-xs text-muted-foreground">Avg Delay (days)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Bucket Distribution */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              PO Distribution by Bucket
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={dispatchPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {dispatchPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* On-Time Performance Trend */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              On-Time Performance Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={onTimePerformanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                  <YAxis domain={[70, 100]} tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip formatter={(value: number) => `${value}%`} />
                  <Line 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk by Category */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            $ At Risk by Category ($M)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskByCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => `$${value.toFixed(1)}M`} />
                <Legend />
                <Bar dataKey="atRisk" name="At Risk" fill="#dc2626" radius={[4, 4, 0, 0]} />
                <Bar dataKey="onTrack" name="On Track" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Risk Vendors */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Chronic Underperformers (Highest Risk)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topRiskVendors.map((vendor, i) => (
              <div 
                key={vendor.name}
                className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
              >
                <span className="text-lg font-bold text-muted-foreground w-8">
                  #{i + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium">{vendor.name}</p>
                  <p className="text-xs text-muted-foreground">{vendor.posAtRisk} POs at risk</p>
                </div>
                <Badge 
                  variant={vendor.bucket === 'SS' ? 'destructive' : 'outline'}
                  className="text-xs"
                >
                  {vendor.bucket}
                </Badge>
                <div className="text-right">
                  <p className="font-mono font-semibold text-status-danger">
                    ${vendor.dollarAtRisk}M
                  </p>
                  <p className="text-xs text-muted-foreground">at risk</p>
                </div>
                <div className="text-right">
                  <p className={`font-mono font-semibold ${
                    vendor.riskScore >= 60 ? 'text-status-danger' : 'text-status-warning'
                  }`}>
                    {vendor.riskScore}
                  </p>
                  <p className="text-xs text-muted-foreground">risk score</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Supplier Performance Analytics (original)
const SupplierPerformanceAnalyticsPage = () => {
  const { vendors, getBucketStats } = useGovernanceStore();
  const bucketStats = getBucketStats();

  const pieData = [
    { name: 'Good', value: bucketStats.good.count, color: '#16a34a' },
    { name: 'Average', value: bucketStats.average.count, color: '#eab308' },
    { name: 'Needs Review', value: bucketStats.needs_review.count, color: '#f97316' },
    { name: 'Critical', value: bucketStats.critical.count, color: '#dc2626' }
  ];

  const spendData = [
    { name: 'Good', spend: bucketStats.good.spend / 1000000 },
    { name: 'Average', spend: bucketStats.average.spend / 1000000 },
    { name: 'Needs Review', spend: bucketStats.needs_review.spend / 1000000 },
    { name: 'Critical', spend: bucketStats.critical.spend / 1000000 }
  ];

  const topOffenders = [...vendors]
    .filter(v => v.bucketTag === 'critical' || v.bucketTag === 'needs_review')
    .sort((a, b) => b.totals.tradedDollar - a.totals.tradedDollar)
    .slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Performance Analytics</h1>
          </div>
          <p className="text-sm text-muted-foreground">Reporting and performance insights</p>
        </div>
        <Button variant="outline" onClick={() => toast.success('Performance analytics report exported')}>
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select defaultValue="all">
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Product Hierarchy" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="apparel">Apparel</SelectItem>
            <SelectItem value="home">Home Textiles</SelectItem>
            <SelectItem value="accessories">Accessories</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="all">
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sales Contribution" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Bands</SelectItem>
            <SelectItem value="high">High (&gt;$2M)</SelectItem>
            <SelectItem value="medium">Medium ($500K-$2M)</SelectItem>
            <SelectItem value="low">Low (&lt;$500K)</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="all">
          <SelectTrigger className="w-48">
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
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Bucket Distribution */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Vendor Distribution by Bucket
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Spend by Bucket */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Spend by Bucket ($M)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={spendData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => `$${value.toFixed(2)}M`} />
                  <Bar dataKey="spend" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Offenders by Spend */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Top At-Risk Vendors by Spend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topOffenders.map((vendor, i) => (
              <div 
                key={vendor.id}
                className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
              >
                <span className="text-lg font-bold text-muted-foreground w-8">
                  #{i + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium">{vendor.name}</p>
                  <p className="text-xs text-muted-foreground">{vendor.dc}</p>
                </div>
                <Badge 
                  variant={vendor.bucketTag === 'critical' ? 'destructive' : 'outline'}
                  className="text-xs"
                >
                  {vendor.bucketTag === 'critical' ? 'Critical' : 'Needs Review'}
                </Badge>
                <div className="text-right">
                  <p className="font-mono font-semibold">
                    ${(vendor.totals.tradedDollar / 1000000).toFixed(2)}M
                  </p>
                  <p className="text-xs text-muted-foreground">traded</p>
                </div>
                <div className="text-right">
                  <p className={`font-mono font-semibold ${
                    vendor.compositeScore < 60 ? 'text-status-danger' : 'text-orange-600'
                  }`}>
                    {vendor.compositeScore.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">score</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Onboarding Analytics
const OnboardingAnalyticsPage = () => {
  const funnelData = [
    { stage: 'Request', count: 42 },
    { stage: 'Doc Collection', count: 38 },
    { stage: 'Extraction', count: 35 },
    { stage: 'Validation', count: 30 },
    { stage: 'Screening', count: 28 },
    { stage: 'Risk Scoring', count: 25 },
    { stage: 'Approval', count: 20 },
    { stage: 'Activated', count: 18 },
  ];

  const riskDistribution = [
    { name: 'Fast Track', value: 18, color: '#16a34a' },
    { name: 'Needs Review', value: 15, color: '#eab308' },
    { name: 'Blocked', value: 9, color: '#dc2626' },
  ];

  const avgTimeByCountry = [
    { country: 'India', days: 12 },
    { country: 'China', days: 18 },
    { country: 'Vietnam', days: 14 },
    { country: 'Bangladesh', days: 16 },
    { country: 'Turkey', days: 10 },
  ];

  const blockedReasons = [
    { reason: 'Missing MSME Cert', count: 4 },
    { reason: 'Sanctions Hit', count: 2 },
    { reason: 'Adverse Media', count: 2 },
    { reason: 'Invalid Factory License', count: 1 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Onboarding Analytics</h1>
          </div>
          <p className="text-sm text-muted-foreground">Funnel conversion, risk distribution, and blocked reasons</p>
        </div>
        <Button variant="outline" onClick={() => toast.success('Onboarding analytics report exported')}><Download className="w-4 h-4 mr-2" />Export Report</Button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="card-elevated">
          <CardHeader><CardTitle className="text-sm font-semibold">Onboarding Funnel</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="stage" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader><CardTitle className="text-sm font-semibold">Risk Distribution</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie data={riskDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {riskDistribution.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader><CardTitle className="text-sm font-semibold">Avg Onboarding Time by Country (days)</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={avgTimeByCountry}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="country" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: number) => `${v} days`} />
                  <Bar dataKey="days" fill="#eab308" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader><CardTitle className="text-sm font-semibold">Blocked Suppliers by Reason</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {blockedReasons.map((r) => (
                <div key={r.reason} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm">{r.reason}</span>
                  <Badge variant="destructive" className="text-xs">{r.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Invoice Analytics
const InvoiceAnalyticsPage = () => {
  const stpTrend = [
    { week: 'W1', rate: 72 },
    { week: 'W2', rate: 75 },
    { week: 'W3', rate: 78 },
    { week: 'W4', rate: 74 },
    { week: 'W5', rate: 80 },
    { week: 'W6', rate: 82 },
    { week: 'W7', rate: 79 },
    { week: 'W8', rate: 85 },
  ];

  const bucketDistribution = [
    { name: 'Matched', value: 4, color: '#16a34a' },
    { name: 'Needs Review', value: 2, color: '#eab308' },
    { name: 'Dispute', value: 2, color: '#dc2626' },
    { name: 'Hold', value: 2, color: '#6b7280' },
    { name: 'Cash Opp', value: 2, color: '#3b82f6' },
  ];

  const topDisputeReasons = [
    { reason: 'Price Mismatch', count: 5, amount: 42000 },
    { reason: 'Qty Overbilling', count: 3, amount: 28000 },
    { reason: 'Missing GRN', count: 2, amount: 15000 },
    { reason: 'Duplicate Invoice', count: 2, amount: 72000 },
    { reason: 'Freight Variance', count: 1, amount: 800 },
  ];

  const cycleTimeData = [
    { bucket: 'Matched', days: 0.5 },
    { bucket: 'Needs Review', days: 3.2 },
    { bucket: 'Dispute', days: 7.5 },
    { bucket: 'Hold', days: 12 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Invoice & Cash Analytics</h1>
          </div>
          <p className="text-sm text-muted-foreground">STP rates, leakage recovery, cycle times, and cash savings</p>
        </div>
        <Button variant="outline" onClick={() => toast.success('Invoice & Cash analytics report exported')}><Download className="w-4 h-4 mr-2" />Export Report</Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'STP Rate', value: '85%', icon: TrendingUp },
          { label: '$ Leakage Prevented', value: '$18.7K', icon: DollarSign },
          { label: 'Avg Days to Clear', value: '4.2d', icon: Clock },
          { label: 'Cash Savings (YTD)', value: '$8.3K', icon: DollarSign },
        ].map((kpi) => (
          <Card key={kpi.label} className="card-elevated">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <kpi.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="card-elevated">
          <CardHeader><CardTitle className="text-sm font-semibold">Straight-Through Processing Rate</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stpTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                  <YAxis domain={[60, 100]} tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip formatter={(v: number) => `${v}%`} />
                  <Line type="monotone" dataKey="rate" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader><CardTitle className="text-sm font-semibold">Invoice Distribution by Bucket</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie data={bucketDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {bucketDistribution.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader><CardTitle className="text-sm font-semibold">Cycle Time by Bucket (days)</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cycleTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="bucket" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: number) => `${v} days`} />
                  <Bar dataKey="days" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader><CardTitle className="text-sm font-semibold">Top Dispute Reasons</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topDisputeReasons.map((r) => (
                <div key={r.reason} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <span className="text-sm font-medium">{r.reason}</span>
                    <p className="text-xs text-muted-foreground">{r.count} occurrences</p>
                  </div>
                  <span className="text-sm font-mono font-semibold text-status-danger">${r.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Main Analytics Page that switches based on context
export const AnalyticsPage = () => {
  const agentContext = useAgentContext();
  
  if (agentContext === 'dispatch-readiness') {
    return <DispatchAnalyticsPage />;
  }
  if (agentContext === 'supplier-onboarding') {
    return <OnboardingAnalyticsPage />;
  }
  if (agentContext === 'invoice-cash-ops') {
    return <InvoiceAnalyticsPage />;
  }
  if (agentContext === 'contract-lifecycle') {
    return <ContractAnalyticsPage />;
  }
  if (agentContext === 'pricing-intelligence') {
    return <PricingAnalyticsPage />;
  }
  if (agentContext === 'autonomous-inventory') {
    return <InventoryAnalyticsPage />;
  }
  
  return <SupplierPerformanceAnalyticsPage />;
};

// Pricing Analytics
const PricingAnalyticsPage = () => {
  const revenueData = [
    { month: 'Jan', baseline: 1200000, lift: 124000 },
    { month: 'Feb', baseline: 1280000, lift: 158000 },
    { month: 'Mar', baseline: 1310000, lift: 174000 },
    { month: 'Apr', baseline: 1340000, lift: 196000 },
    { month: 'May', baseline: 1390000, lift: 214000 },
    { month: 'Jun', baseline: 1420000, lift: 238000 },
  ];

  const modeMix = [
    { name: 'Reprice', value: 64, color: '#3b82f6' },
    { name: 'Promote', value: 41, color: '#a855f7' },
    { name: 'Markdown', value: 37, color: '#f59e0b' },
  ];

  const elasticityData = [
    { month: 'Jan', units: 8200, margin: 38.2 },
    { month: 'Feb', units: 8650, margin: 37.8 },
    { month: 'Mar', units: 9100, margin: 38.5 },
    { month: 'Apr', units: 9420, margin: 39.1 },
    { month: 'May', units: 9810, margin: 39.4 },
    { month: 'Jun', units: 10240, margin: 39.8 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Pricing Intelligence Analytics</h1>
          </div>
          <p className="text-sm text-muted-foreground">Revenue lift, mode mix, and price elasticity outcomes</p>
        </div>
        <Button variant="outline" onClick={() => toast.success('Pricing analytics report exported')}><Download className="w-4 h-4 mr-2" />Export Report</Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Revenue Lift (YTD)', value: '$1.10M', icon: DollarSign },
          { label: 'Avg Reprice Cycle', value: '8 min', icon: Clock },
          { label: 'Promo ROAS', value: '4.6x', icon: TrendingUp },
          { label: 'Markdown Recovery', value: '82%', icon: Package },
        ].map((kpi) => (
          <Card key={kpi.label} className="card-elevated">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <kpi.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <p className="text-xl font-bold">{kpi.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="card-elevated col-span-2">
          <CardHeader><CardTitle className="text-sm">Baseline Revenue vs Pricing Lift</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="baseline" fill="#94a3b8" name="Baseline" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="lift" fill="#16a34a" name="Pricing Lift" radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader><CardTitle className="text-sm">Action Mix (Last 24h)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPie>
                <Pie data={modeMix} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {modeMix.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RechartsPie>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader><CardTitle className="text-sm">Units vs Margin (Elasticity)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={elasticityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="units" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Units" />
                <Line yAxisId="right" type="monotone" dataKey="margin" stroke="#16a34a" strokeWidth={2} dot={{ r: 4 }} name="Margin %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Contract Analytics
const ContractAnalyticsPage = () => {
  const coverageData = [
    { month: 'Sep', score: 72 },
    { month: 'Oct', score: 76 },
    { month: 'Nov', score: 80 },
    { month: 'Dec', score: 83 },
    { month: 'Jan', score: 85 },
    { month: 'Feb', score: 88 },
  ];

  const leakageData = [
    { month: 'Sep', detected: 45000, recovered: 32000 },
    { month: 'Oct', detected: 52000, recovered: 41000 },
    { month: 'Nov', detected: 38000, recovered: 35000 },
    { month: 'Dec', detected: 61000, recovered: 48000 },
    { month: 'Jan', detected: 87600, recovered: 52000 },
    { month: 'Feb', detected: 42000, recovered: 38000 },
  ];

  const violationsByType = [
    { name: 'Price', value: 42, color: '#dc2626' },
    { name: 'Rebate', value: 28, color: '#eab308' },
    { name: 'SLA', value: 18, color: '#f97316' },
    { name: 'Promo', value: 12, color: '#3b82f6' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Contract Lifecycle Analytics</h1>
          </div>
          <p className="text-sm text-muted-foreground">Coverage trends, leakage recovery, and violation analysis</p>
        </div>
        <Button variant="outline" onClick={() => toast.success('Contract analytics report exported')}><Download className="w-4 h-4 mr-2" />Export Report</Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Avg Coverage', value: '88%', icon: TrendingUp },
          { label: '$ Leakage Detected', value: '$325.6K', icon: DollarSign },
          { label: '$ Recovered', value: '$246K', icon: DollarSign },
          { label: 'Violation Rate', value: '8.2%', icon: AlertTriangle },
        ].map((kpi) => (
          <Card key={kpi.label} className="card-elevated">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <kpi.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <p className="text-xl font-bold">{kpi.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="card-elevated">
          <CardHeader><CardTitle className="text-sm">Coverage Score Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={coverageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={[60, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader><CardTitle className="text-sm">Violations by Term Type</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPie>
                <Pie data={violationsByType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {violationsByType.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RechartsPie>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="card-elevated col-span-2">
          <CardHeader><CardTitle className="text-sm">Leakage Detected vs Recovered ($)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={leakageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="detected" fill="#dc2626" name="Detected" radius={[4, 4, 0, 0]} />
                <Bar dataKey="recovered" fill="#16a34a" name="Recovered" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
