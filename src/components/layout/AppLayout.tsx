import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { AppSidebar } from './AppSidebar';
import { AppTopBar } from './AppTopBar';
import { BottomDrawer } from '@/components/BottomDrawer';

export const AppLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <AppTopBar />
      <AppSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      <main 
        className={cn(
          "pt-14 pb-16 min-h-screen transition-all duration-300",
          sidebarCollapsed ? "pl-16" : "pl-56"
        )}
      >
        <Outlet />
      </main>
      <BottomDrawer />
    </div>
  );
};
