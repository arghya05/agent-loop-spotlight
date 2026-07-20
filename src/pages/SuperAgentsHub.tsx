import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import AlgonomyLogo from '@/components/AlgonomyLogo';
import { Button } from '@/components/ui/button';
import {
  Truck,
  Store,
  Sparkles,
  Users,
  Megaphone,
  ShoppingBag,
  BarChart3,
  ShieldCheck,
  Boxes,
  Brain,
  Headset,
  Leaf,
  LogOut,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';

type AgentArea = {
  id: string;
  title: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  status: 'active' | 'beta' | 'coming-soon';
  path?: string;
  agentCount?: number;
};

const areas: AgentArea[] = [
  {
    id: 'supply-chain',
    title: 'Supply Chain Agents',
    tagline: 'Plan · Source · Move · Deliver',
    description:
      'Supplier performance, dispatch readiness, onboarding, invoice & cash, contracts, pricing, inventory, product onboarding, demand sensing, transport control tower, and more.',
    icon: Truck,
    gradient: 'from-blue-500/20 to-indigo-500/20',
    status: 'active',
    path: '/landing',
    agentCount: 16,
  },
  {
    id: 'store-ops',
    title: 'Store Ops Agents',
    tagline: 'The four walls of the store',
    description:
      'On-shelf availability, planogram compliance, workforce, freshness & waste, promo execution, omnichannel fulfilment, associate copilot, store transfer, and local demand.',
    icon: Store,
    gradient: 'from-emerald-500/20 to-teal-500/20',
    status: 'active',
    path: '/store-ops/landing',
    agentCount: 14,
  },
  {
    id: 'customer-experience',
    title: 'Customer Experience Agents',
    tagline: 'Personalize · Engage · Retain',
    description:
      'Personalization, loyalty intelligence, next-best-offer, churn prevention, journey orchestration, and CX copilot across web, app, email, and store.',
    icon: Sparkles,
    gradient: 'from-fuchsia-500/20 to-pink-500/20',
    status: 'coming-soon',
    agentCount: 8,
  },
  {
    id: 'marketing',
    title: 'Marketing & Campaign Agents',
    tagline: 'Plan · Launch · Measure',
    description:
      'Campaign planning, creative generation, media mix optimization, budget pacing, attribution, and audience discovery.',
    icon: Megaphone,
    gradient: 'from-orange-500/20 to-rose-500/20',
    status: 'coming-soon',
    agentCount: 7,
  },
  {
    id: 'merchandising',
    title: 'Merchandising Agents',
    tagline: 'Assortment · Space · Pricing',
    description:
      'Assortment planning, clustering, space & planogram optimization, category role definition, and lifecycle management.',
    icon: ShoppingBag,
    gradient: 'from-amber-500/20 to-yellow-500/20',
    status: 'coming-soon',
    agentCount: 6,
  },
  {
    id: 'analytics',
    title: 'Analytics & Insights Agents',
    tagline: 'Ask · Explore · Discover',
    description:
      'Maya-style natural-language analyst, KPI monitors, anomaly detection, executive briefings, and self-serve dashboards.',
    icon: BarChart3,
    gradient: 'from-cyan-500/20 to-sky-500/20',
    status: 'beta',
    agentCount: 5,
  },
  {
    id: 'workforce',
    title: 'Workforce & HR Agents',
    tagline: 'Hire · Schedule · Retain',
    description:
      'Talent sourcing, workforce planning, shift optimization, engagement pulse, and manager copilot for retail associates.',
    icon: Users,
    gradient: 'from-violet-500/20 to-purple-500/20',
    status: 'coming-soon',
    agentCount: 6,
  },
  {
    id: 'finance',
    title: 'Finance & Risk Agents',
    tagline: 'Close · Control · Comply',
    description:
      'Continuous close, expense audit, working capital, treasury copilot, tax & compliance monitoring, and vendor risk.',
    icon: ShieldCheck,
    gradient: 'from-lime-500/20 to-emerald-500/20',
    status: 'coming-soon',
    agentCount: 7,
  },
  {
    id: 'warehouse',
    title: 'Warehouse & DC Agents',
    tagline: 'Receive · Pick · Ship',
    description:
      'Slotting, labour planning, dock scheduling, put-away, wave optimization, and DC exception copilot.',
    icon: Boxes,
    gradient: 'from-slate-500/20 to-zinc-500/20',
    status: 'coming-soon',
    agentCount: 6,
  },
  {
    id: 'sustainability',
    title: 'Sustainability Agents',
    tagline: 'Measure · Reduce · Report',
    description:
      'Scope 1/2/3 tracking, packaging optimization, food-waste reduction, ethical sourcing, and ESG report generation.',
    icon: Leaf,
    gradient: 'from-green-500/20 to-emerald-500/20',
    status: 'coming-soon',
    agentCount: 5,
  },
  {
    id: 'support',
    title: 'Support & Service Agents',
    tagline: 'Deflect · Resolve · Learn',
    description:
      'Portal support copilot, ticket triage, agent-assist, knowledge synthesis, and customer sentiment radar.',
    icon: Headset,
    gradient: 'from-teal-500/20 to-cyan-500/20',
    status: 'coming-soon',
    agentCount: 5,
  },
  {
    id: 'copilot',
    title: 'Enterprise Copilot',
    tagline: 'One assistant across every agent',
    description:
      'A meta-agent that spans all domains — asks the right specialist agent, chains actions, and returns a single grounded answer.',
    icon: Brain,
    gradient: 'from-indigo-500/20 to-blue-500/20',
    status: 'coming-soon',
    agentCount: 1,
  },
];

const statusStyles: Record<AgentArea['status'], string> = {
  active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  beta: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  'coming-soon': 'bg-muted text-muted-foreground border-border',
};

const statusLabel: Record<AgentArea['status'], string> = {
  active: 'Active',
  beta: 'Beta',
  'coming-soon': 'Coming Soon',
};

export const SuperAgentsHub = () => {
  const navigate = useNavigate();
  const user = sessionStorage.getItem('algonomy_user') || 'there';

  const handleOpen = (area: AgentArea) => {
    if (area.status === 'coming-soon' || !area.path) return;
    if (area.id === 'supply-chain') sessionStorage.setItem('algonomy_workspace', 'supply-chain');
    if (area.id === 'store-ops') sessionStorage.setItem('algonomy_workspace', 'store-ops');
    navigate(area.path);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('algonomy_logged_in');
    sessionStorage.removeItem('algonomy_user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlgonomyLogo className="h-7" />
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
              <span>Super Agents Platform</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Signed in as <span className="text-foreground font-medium">{user}</span>
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-1.5" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          Algonomy Super Agents
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
          Pick an agent area to enter
        </h1>
        <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
          Each area is a suite of specialized agents. Enter Supply Chain or Store Ops today — more agent areas are coming online.
        </p>
      </section>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {areas.map((area) => {
            const Icon = area.icon;
            const clickable = area.status !== 'coming-soon' && !!area.path;
            return (
              <button
                key={area.id}
                onClick={() => handleOpen(area)}
                disabled={!clickable}
                className={cn(
                  'group relative text-left rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm p-5 transition-all',
                  clickable
                    ? 'hover:border-primary/50 hover:bg-card/70 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/5 cursor-pointer'
                    : 'opacity-75 cursor-not-allowed',
                )}
              >
                {/* Status pill */}
                <div className="absolute top-4 right-4">
                  <span
                    className={cn(
                      'text-[10px] font-semibold px-2 py-0.5 rounded-full border',
                      statusStyles[area.status],
                    )}
                  >
                    {statusLabel[area.status]}
                  </span>
                </div>

                {/* Icon */}
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4 border border-border/40',
                    area.gradient,
                  )}
                >
                  <Icon className="w-6 h-6 text-foreground" />
                </div>

                {/* Title + tagline */}
                <h3 className="text-base font-semibold text-foreground">{area.title}</h3>
                <p className="text-[11px] text-primary/80 mt-0.5 font-medium">{area.tagline}</p>

                {/* Description */}
                <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed line-clamp-4">
                  {area.description}
                </p>

                {/* Footer */}
                <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    {area.agentCount ?? '—'} agents
                  </span>
                  {clickable ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary group-hover:gap-2 transition-all">
                      Enter <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground">On the roadmap</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          More agent areas being built. Have a suggestion? Ask the team to add it to the roadmap.
        </p>
      </section>
    </div>
  );
};

export default SuperAgentsHub;
