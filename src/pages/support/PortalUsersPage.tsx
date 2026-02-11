import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Shield, Clock, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const mockUsers = [
  { id: 'SU-001', name: 'Priya Sharma', email: 'priya@globaltextiles.com', role: 'Admin', lastLogin: '2025-02-10T08:30:00Z', locked: false, mfaStatus: 'enabled' },
  { id: 'SU-010', name: 'Ravi Kumar', email: 'ravi@globaltextiles.com', role: 'Finance', lastLogin: '2025-02-09T16:00:00Z', locked: false, mfaStatus: 'enabled' },
  { id: 'SU-011', name: 'Meera Patel', email: 'meera@globaltextiles.com', role: 'Viewer', lastLogin: '2025-02-08T12:00:00Z', locked: false, mfaStatus: 'disabled' },
  { id: 'SU-012', name: 'Amit Singh', email: 'amit@globaltextiles.com', role: 'Finance', lastLogin: '2025-01-28T09:00:00Z', locked: true, mfaStatus: 'enabled' },
];

export const PortalUsersPage = () => {
  const [users] = useState(mockUsers);

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Portal Users</h1>
          <p className="text-sm text-muted-foreground">Manage users for Global Textiles Ltd</p>
        </div>
        <Button onClick={() => toast.success('User creation request sent to support agent')}>
          <User className="w-4 h-4 mr-2" />Request New User
        </Button>
      </div>

      <Card className="card-elevated">
        <CardContent className="pt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">User</th>
                <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Role</th>
                <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">MFA</th>
                <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Last Login</th>
                <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b border-border/50">
                  <td className="py-3 px-3">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-3"><Badge variant="outline">{user.role}</Badge></td>
                  <td className="py-3 px-3">
                    <Badge variant={user.mfaStatus === 'enabled' ? 'default' : 'secondary'} className="text-[10px]">
                      {user.mfaStatus}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-muted-foreground text-xs">{new Date(user.lastLogin).toLocaleDateString()}</td>
                  <td className="py-3 px-3">
                    {user.locked ? (
                      <Badge variant="destructive" className="text-[10px]">Locked</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px] bg-status-success/10 text-status-success">Active</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};
