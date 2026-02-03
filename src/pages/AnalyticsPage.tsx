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
    { name: 'SS (Slipping)', value: 18, color: '#dc2626' },
    { name: 'AW (Watchlist)', value: 45, color: '#eab308' },
    { name: 'Flow (On Track)', value: 279, color: '#16a34a' }
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
        <Button variant="outline">
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
            <SelectItem value="ss">SS (Slipping Schedule)</SelectItem>
            <SelectItem value="aw">AW (Watchlist)</SelectItem>
            <SelectItem value="flow">Flow (On Track)</SelectItem>
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
        <Button variant="outline">
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

// Main Analytics Page that switches based on context
export const AnalyticsPage = () => {
  const agentContext = useAgentContext();
  
  if (agentContext === 'dispatch-readiness') {
    return <DispatchAnalyticsPage />;
  }
  
  return <SupplierPerformanceAnalyticsPage />;
};
