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
  externalUrl?: string;
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
    status: 'active',
    externalUrl: 'https://lifecycle-analyzer.com/',
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
  active: 'bg-emerald-500 text-white',
  beta: 'bg-orange-500 text-white',
  'coming-soon': 'bg-zinc-700 text-zinc-300',
};

const statusLabel: Record<AgentArea['status'], string> = {
  active: 'Active',
  beta: 'Beta',
  'coming-soon': 'Soon',
};

export const SuperAgentsHub = () => {
  const navigate = useNavigate();
  const user = sessionStorage.getItem('algonomy_user') || 'there';

  const handleOpen = (area: AgentArea) => {
    if (area.externalUrl) {
      window.open(area.externalUrl, '_blank', 'noopener,noreferrer');
      return;
    }
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
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/5 bg-black/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlgonomyLogo className="h-7" />
            <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-500">
              <span className="w-1 h-1 rounded-full bg-zinc-600" />
              <span>Super Agents Platform</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-500 hidden sm:inline">
              Signed in as <span className="text-white font-medium">{user}</span>
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-zinc-400 hover:text-white hover:bg-white/5">
              <LogOut className="w-4 h-4 mr-1.5" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-14 pb-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-xs font-medium mb-5">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          Algonomy Super Agents
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
          Pick an agent area to enter
        </h1>
        <p className="mt-3 text-sm sm:text-base text-zinc-500 max-w-2xl mx-auto">
          Each area is a suite of specialized agents. Enter Supply Chain or Store Ops today — more agent areas are coming online.
        </p>
      </section>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {areas.map((area) => {
            const Icon = area.icon;
            const clickable = !!area.externalUrl || (area.status !== 'coming-soon' && !!area.path);
            return (
              <button
                key={area.id}
                onClick={() => handleOpen(area)}
                disabled={!clickable}
                className={cn(
                  'group relative text-left rounded-2xl border border-white/5 bg-[#0d0d10] p-6 transition-all min-h-[260px] flex flex-col',
                  clickable
                    ? 'hover:border-white/20 hover:bg-[#131318] cursor-pointer'
                    : 'opacity-70 cursor-not-allowed',
                )}
              >
                {/* Status pill */}
                <div className="absolute top-5 right-5">
                  <span
                    className={cn(
                      'text-[11px] font-semibold px-2.5 py-0.5 rounded-full',
                      statusStyles[area.status],
                    )}
                  >
                    {statusLabel[area.status]}
                  </span>
                </div>

                {/* Icon — purple gradient tile */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-5 shadow-lg shadow-purple-900/30">
                  <Icon className="w-6 h-6 text-white" strokeWidth={2} />
                </div>

                {/* Title */}
                <h3 className={cn(
                  'text-lg font-semibold transition-colors',
                  clickable ? 'text-white group-hover:text-sky-400' : 'text-white',
                )}>
                  {area.title}
                </h3>

                {/* Description */}
                <p className="mt-2 text-sm text-zinc-500 leading-relaxed line-clamp-5">
                  {area.description}
                </p>

                {/* Footer */}
                <div className="mt-auto pt-4 flex items-center justify-between text-[11px]">
                  <span className="text-zinc-600 uppercase tracking-wide">
                    {area.agentCount ?? '—'} agents
                  </span>
                  {clickable && (
                    <span className="inline-flex items-center gap-1 font-medium text-sky-400 group-hover:gap-2 transition-all">
                      Enter <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <p className="mt-10 text-center text-xs text-zinc-600">
          More agent areas being built. Have a suggestion? Ask the team to add it to the roadmap.
        </p>
      </section>
    </div>
  );
};

export default SuperAgentsHub;

