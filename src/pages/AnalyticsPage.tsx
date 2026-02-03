import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGovernanceStore } from '@/store/governanceStore';
import { 
  BarChart3,
  Download,
  Filter,
  PieChart,
  TrendingUp
} from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const COLORS = ['#16a34a', '#eab308', '#f97316', '#dc2626'];

export const AnalyticsPage = () => {
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
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
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
