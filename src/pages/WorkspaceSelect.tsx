import { useNavigate } from 'react-router-dom';
import { Truck, Store, ArrowRight, LogOut } from 'lucide-react';
import AlgonomyLogo from '@/components/AlgonomyLogo';
import { Button } from '@/components/ui/button';

const WorkspaceSelect = () => {
  const navigate = useNavigate();
  const currentUser = sessionStorage.getItem('algonomy_user') || 'User';

  const choose = (ws: 'supply-chain' | 'store-ops') => {
    sessionStorage.setItem('algonomy_workspace', ws);
    navigate(ws === 'store-ops' ? '/store-ops/landing' : '/landing');
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/login');
  };

  const modules = [
    {
      id: 'supply-chain' as const,
      title: 'Supply Chain Agents',
      subtitle: 'Retailer ↔ Supplier operating system',
      icon: Truck,
      accent: 'from-blue-500/20 via-blue-500/5 to-transparent',
      ring: 'group-hover:ring-blue-400/60',
      bullets: [
        'Supplier Performance, Dispatch Readiness, Onboarding',
        'Invoice & Cash Ops, Contract Lifecycle',
        'Pricing Intelligence, Autonomous Inventory, Product Onboarding',
        '+ Demand Sensing, Rebalancing, Warehouse, Transport, Fulfilment, Cost-to-Serve, Copilot',
      ],
      count: '16 agents',
    },
    {
      id: 'store-ops' as const,
      title: 'Store Ops Agents',
      subtitle: 'Four-walls execution across every store',
      icon: Store,
      accent: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
      ring: 'group-hover:ring-emerald-400/60',
      bullets: [
        'On-Shelf Availability, Store Replenishment, Store Transfer',
        'Planogram, Customer Engagement, Workforce, Loss Prevention',
        'Freshness & Waste, Promo Execution, Omnichannel Fulfilment',
        'Store Manager Command Centre, Associate Copilot, Local Demand',
      ],
      count: '14 agents',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <AlgonomyLogo className="h-8" />
          <div className="hidden md:flex flex-col leading-tight">
            <span className="text-xs font-medium tracking-widest text-white/50 uppercase">Retailer-Supplier OS</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/60">
            Welcome, <span className="font-medium text-white">{currentUser}</span>
          </span>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white/70 hover:text-white hover:bg-white/10 h-8 text-xs">
            <LogOut className="w-3.5 h-3.5 mr-1" />
            Sign out
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Choose your workspace</h1>
          <p className="mt-3 text-white/60 text-sm md:text-base">
            Two independent agent suites. Pick where you want to work today — you can switch anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => choose(m.id)}
                className={`group relative text-left rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] p-8 transition-all ring-1 ring-transparent ${m.ring} hover:-translate-y-0.5`}
              >
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${m.accent} opacity-70 pointer-events-none`} />
                <div className="relative">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-white/50 border border-white/10 rounded-full px-2 py-1">
                      {m.count}
                    </span>
                  </div>

                  <h2 className="text-2xl font-semibold">{m.title}</h2>
                  <p className="mt-1 text-sm text-white/60">{m.subtitle}</p>

                  <ul className="mt-6 space-y-2">
                    {m.bullets.map((b) => (
                      <li key={b} className="text-xs text-white/70 flex gap-2">
                        <span className="mt-1 w-1 h-1 rounded-full bg-white/40 flex-shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 flex items-center gap-2 text-sm font-medium text-white/90 group-hover:text-white">
                    Enter workspace
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-center text-[11px] text-white/40 mt-10">
          Switch workspaces anytime from the top bar inside the app.
        </p>
      </main>
    </div>
  );
};

export default WorkspaceSelect;
