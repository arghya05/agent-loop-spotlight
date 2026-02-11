import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, Clock } from 'lucide-react';
import { toast } from 'sonner';

const mockReports = [
  { id: 'RPT-001', name: 'PO Summary Jan 2025', type: 'Excel', generatedAt: '2025-02-10T07:01:30Z', size: '124 KB', records: 47 },
  { id: 'RPT-002', name: 'Invoice Status Q4 2024', type: 'PDF', generatedAt: '2025-01-15T14:00:00Z', size: '256 KB', records: 89 },
  { id: 'RPT-003', name: 'Payment History 2024', type: 'Excel', generatedAt: '2025-01-02T09:30:00Z', size: '198 KB', records: 156 },
];

export const PortalReportsPage = () => {
  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground">Download generated reports or request new ones</p>
        </div>
        <Button onClick={() => toast.success('Report request sent to support agent')}>
          <FileText className="w-4 h-4 mr-2" />Request New Report
        </Button>
      </div>

      <div className="space-y-3">
        {mockReports.map(report => (
          <Card key={report.id} className="card-elevated">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{report.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary" className="text-[10px]">{report.type}</Badge>
                      <span>{report.size}</span>
                      <span>·</span>
                      <span>{report.records} records</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />{new Date(report.generatedAt).toLocaleDateString()}
                  </span>
                  <Button size="sm" variant="outline" onClick={() => toast.success(`Downloading ${report.name}...`)}>
                    <Download className="w-4 h-4 mr-1" />Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
