// Per-agent analytics config — KPIs, primary trend chart, distribution chart, and highlights.
// Values are illustrative but realistic for a GCC retail supply-chain demo.

export interface AgentKpi {
  label: string;
  value: string;
  delta: string;
  positive: boolean;
}

export interface AgentAnalyticsConfig {
  headline: string;
  kpis: AgentKpi[];
  trend: {
    title: string;
    subtitle: string;
    xKey: string;
    series: { key: string; label: string; color: string }[];
    data: Record<string, string | number>[];
  };
  distribution: {
    title: string;
    subtitle: string;
    type: 'bar' | 'pie';
    data: { name: string; value: number; color?: string }[];
  };
  highlights: { label: string; value: string; hint: string }[];
}

const COLORS = {
  primary: 'hsl(var(--primary))',
  success: 'hsl(var(--status-success))',
  warning: 'hsl(var(--status-warning))',
  danger: 'hsl(var(--status-danger))',
  muted: 'hsl(var(--muted-foreground))',
};

export const supplyChainAgentAnalytics: Record<string, AgentAnalyticsConfig> = {
  'demand-sensing': {
    headline: 'Forecast accuracy and bias across banners and channels',
    kpis: [
      { label: 'Weekly MAPE', value: '14.2%', delta: '−2.8 pts', positive: true },
      { label: 'Forecast Bias', value: '+3.1%', delta: 'Under target ±5%', positive: true },
      { label: 'Sensed Lift Captured', value: 'AED 1.42M', delta: '+18% vs LW', positive: true },
      { label: 'SKUs on Watch', value: '87', delta: '−12 WoW', positive: true },
    ],
    trend: {
      title: 'MAPE vs Bias — last 8 weeks',
      subtitle: 'Rolling 8-week accuracy and bias for GCC total network',
      xKey: 'week',
      series: [
        { key: 'mape', label: 'MAPE %', color: COLORS.primary },
        { key: 'bias', label: 'Bias %', color: COLORS.warning },
      ],
      data: [
        { week: 'W-7', mape: 21, bias: 8 },
        { week: 'W-6', mape: 19, bias: 6 },
        { week: 'W-5', mape: 18, bias: 5 },
        { week: 'W-4', mape: 17, bias: 4 },
        { week: 'W-3', mape: 16, bias: 4 },
        { week: 'W-2', mape: 15, bias: 3 },
        { week: 'W-1', mape: 14.5, bias: 3 },
        { week: 'This', mape: 14.2, bias: 3.1 },
      ],
    },
    distribution: {
      title: 'MAPE by category',
      subtitle: 'Where the model is strongest vs where planner attention is needed',
      type: 'bar',
      data: [
        { name: 'Grocery', value: 9 },
        { name: 'Fresh', value: 22 },
        { name: 'Beauty', value: 12 },
        { name: 'Apparel', value: 18 },
        { name: 'Home', value: 15 },
        { name: 'Electronics', value: 20 },
      ],
    },
    highlights: [
      { label: 'Ramadan uplift', value: '+34%', hint: 'Sensed grocery lift vs baseline' },
      { label: 'Weather sensitivity', value: '0.72 R²', hint: 'Chilled beverage vs temp' },
      { label: 'Planner overrides', value: '9%', hint: 'Down from 17% last quarter' },
    ],
  },
  'inventory-rebalancing': {
    headline: 'Days-of-cover balance across DCs and stores',
    kpis: [
      { label: 'Network DOS', value: '38 days', delta: '−4 days', positive: true },
      { label: 'Stock-out Risk SKUs', value: '124', delta: '−41 vs LW', positive: true },
      { label: 'Overstock Value', value: 'AED 8.7M', delta: '−AED 1.2M', positive: true },
      { label: 'Moves Executed', value: '312', delta: '96% completion', positive: true },
    ],
    trend: {
      title: 'DOS variance across 6 DCs — 8 weeks',
      subtitle: 'Spread between highest and lowest DOS in the network',
      xKey: 'week',
      series: [
        { key: 'high', label: 'Highest DOS', color: COLORS.danger },
        { key: 'low', label: 'Lowest DOS', color: COLORS.warning },
        { key: 'target', label: 'Target', color: COLORS.success },
      ],
      data: [
        { week: 'W-7', high: 78, low: 9, target: 35 },
        { week: 'W-6', high: 74, low: 11, target: 35 },
        { week: 'W-5', high: 68, low: 12, target: 35 },
        { week: 'W-4', high: 63, low: 15, target: 35 },
        { week: 'W-3', high: 58, low: 18, target: 35 },
        { week: 'W-2', high: 54, low: 22, target: 35 },
        { week: 'W-1', high: 49, low: 26, target: 35 },
        { week: 'This', high: 45, low: 29, target: 35 },
      ],
    },
    distribution: {
      title: 'DOS by DC',
      subtitle: 'Cover position per Distribution Center',
      type: 'bar',
      data: [
        { name: 'Jebel Ali', value: 42 },
        { name: 'Riyadh', value: 45 },
        { name: 'Dammam', value: 29 },
        { name: 'Jeddah', value: 38 },
        { name: 'Doha', value: 33 },
        { name: 'Kuwait', value: 40 },
      ],
    },
    highlights: [
      { label: 'Cross-border moves', value: '38', hint: 'UAE ↔ KSA lanes this week' },
      { label: 'Avoided stock-outs', value: 'AED 2.1M', hint: 'Sales protected' },
      { label: 'Aged stock cleared', value: '4,120 units', hint: 'Slow movers redistributed' },
    ],
  },
  'warehouse-ops': {
    headline: 'DC throughput, labor productivity, and dock flow',
    kpis: [
      { label: 'Wave Punctuality', value: '96.1%', delta: '+1.4 pts', positive: true },
      { label: 'UPH', value: '78 units/hr', delta: '+6 vs plan', positive: true },
      { label: 'Dock Dwell', value: '38 min', delta: '−7 min', positive: true },
      { label: 'Cost / Unit', value: 'AED 0.42', delta: '−AED 0.04', positive: true },
    ],
    trend: {
      title: 'Throughput vs plan — last 14 days',
      subtitle: 'Actual units shipped vs planned by day, Jebel Ali DC',
      xKey: 'day',
      series: [
        { key: 'plan', label: 'Plan', color: COLORS.muted },
        { key: 'actual', label: 'Actual', color: COLORS.primary },
      ],
      data: Array.from({ length: 14 }, (_, index) => ({
        day: `D-${13 - index}`,
        plan: 42000 + (index % 3) * 1500,
        actual: 40000 + index * 400 + ((index * 7) % 3000),
      })),
    },
    distribution: {
      title: 'Time lost by zone',
      subtitle: 'Where minutes are burnt on the floor today',
      type: 'bar',
      data: [
        { name: 'Receiving', value: 22 },
        { name: 'Putaway', value: 14 },
        { name: 'Picking', value: 41 },
        { name: 'Packing', value: 18 },
        { name: 'Dispatch', value: 27 },
      ],
    },
    highlights: [
      { label: 'Waves re-sequenced', value: '17', hint: 'Auto-optimized this shift' },
      { label: 'ASRS uptime', value: '99.4%', hint: 'Dematic iQ telemetry' },
      { label: 'Cold chain waves', value: '48', hint: 'All within temp SLA' },
    ],
  },
  'transport-control-tower': {
    headline: 'Live shipment health, ETA accuracy, and lane performance',
    kpis: [
      { label: 'Loads In-Transit', value: '412', delta: '128 GCC lanes', positive: true },
      { label: 'ETA Accuracy', value: '91.3%', delta: '+2.1 pts', positive: true },
      { label: 'On-Time %', value: '93.8%', delta: 'Above 92% floor', positive: true },
      { label: 'Border Dwell (avg)', value: '3h 12m', delta: '−48 min', positive: true },
    ],
    trend: {
      title: 'On-time % by lane cluster — 8 weeks',
      subtitle: 'GCC intra-country vs cross-border performance',
      xKey: 'week',
      series: [
        { key: 'intra', label: 'Intra-country', color: COLORS.success },
        { key: 'cross', label: 'Cross-border', color: COLORS.warning },
      ],
      data: [
        { week: 'W-7', intra: 94, cross: 82 },
        { week: 'W-6', intra: 95, cross: 84 },
        { week: 'W-5', intra: 95, cross: 85 },
        { week: 'W-4', intra: 96, cross: 87 },
        { week: 'W-3', intra: 96, cross: 88 },
        { week: 'W-2', intra: 97, cross: 90 },
        { week: 'W-1', intra: 97, cross: 91 },
        { week: 'This', intra: 97.5, cross: 92 },
      ],
    },
    distribution: {
      title: 'Delay reason mix',
      subtitle: 'Root causes for late loads this week',
      type: 'pie',
      data: [
        { name: 'Customs / border', value: 34, color: COLORS.danger },
        { name: 'Carrier capacity', value: 22, color: COLORS.warning },
        { name: 'Weather / sandstorm', value: 14, color: COLORS.primary },
        { name: 'Loading delay', value: 18, color: COLORS.success },
        { name: 'Other', value: 12, color: COLORS.muted },
      ],
    },
    highlights: [
      { label: 'Batha dwell', value: '2h 40m', hint: 'UAE → KSA today' },
      { label: 'Reroutes proposed', value: '9', hint: 'To protect Tier-A OTIF' },
      { label: 'Cold-chain breach', value: '0', hint: 'Frozen + chilled lanes' },
    ],
  },
  'order-fulfilment': {
    headline: 'Order promise, split rate, and perfect-order health',
    kpis: [
      { label: 'Perfect Order %', value: '89.4%', delta: '+1.6 pts', positive: true },
      { label: 'Promise Accuracy', value: '94.7%', delta: '+0.9 pts', positive: true },
      { label: 'Split Rate', value: '11.2%', delta: '−1.4 pts', positive: true },
      { label: 'Tier-A OTIF', value: '98.6%', delta: 'Above 98% floor', positive: true },
    ],
    trend: {
      title: 'Promise accuracy vs split rate — 8 weeks',
      subtitle: 'Trade-off between promising fast and splitting orders',
      xKey: 'week',
      series: [
        { key: 'promise', label: 'Promise accuracy %', color: COLORS.success },
        { key: 'split', label: 'Split rate %', color: COLORS.warning },
      ],
      data: [
        { week: 'W-7', promise: 91, split: 14 },
        { week: 'W-6', promise: 92, split: 13 },
        { week: 'W-5', promise: 92, split: 13 },
        { week: 'W-4', promise: 93, split: 13 },
        { week: 'W-3', promise: 93, split: 12 },
        { week: 'W-2', promise: 94, split: 12 },
        { week: 'W-1', promise: 94.5, split: 11.5 },
        { week: 'This', promise: 94.7, split: 11.2 },
      ],
    },
    distribution: {
      title: 'Orders by customer tier',
      subtitle: 'At-risk orders by tier today',
      type: 'bar',
      data: [
        { name: 'Tier A', value: 12 },
        { name: 'Tier B', value: 41 },
        { name: 'Tier C', value: 68 },
        { name: 'eCom', value: 214 },
      ],
    },
    highlights: [
      { label: 'Promises re-run', value: '6,412', hint: 'Last 24h' },
      { label: 'Backorders opened', value: '38', hint: 'Awaiting inbound cover' },
      { label: 'SLA penalties avoided', value: 'AED 128K', hint: 'Tier-A save' },
    ],
  },
  'exception-management': {
    headline: 'End-to-end exception flow: acknowledge, resolve, prevent recurrence',
    kpis: [
      { label: 'MTTA', value: '4m 12s', delta: '−41s WoW', positive: true },
      { label: 'MTTR', value: '38 min', delta: '−9 min', positive: true },
      { label: 'Auto-resolved %', value: '61%', delta: '+7 pts', positive: true },
      { label: 'Repeat-rate', value: '14%', delta: '−3 pts', positive: true },
    ],
    trend: {
      title: 'Exception volume by day — last 14 days',
      subtitle: 'New vs auto-resolved vs human-resolved',
      xKey: 'day',
      series: [
        { key: 'opened', label: 'Opened', color: COLORS.danger },
        { key: 'auto', label: 'Auto-resolved', color: COLORS.success },
        { key: 'human', label: 'Human-resolved', color: COLORS.warning },
      ],
      data: Array.from({ length: 14 }, (_, index) => ({
        day: `D-${13 - index}`,
        opened: 180 + ((index * 11) % 45),
        auto: 100 + ((index * 7) % 30),
        human: 60 + ((index * 5) % 20),
      })),
    },
    distribution: {
      title: 'Top exception classes',
      subtitle: 'Pareto of open exceptions today',
      type: 'pie',
      data: [
        { name: 'Late shipment', value: 32, color: COLORS.danger },
        { name: 'Short-pick', value: 21, color: COLORS.warning },
        { name: 'Quality reject', value: 14, color: COLORS.primary },
        { name: 'Customs hold', value: 18, color: COLORS.success },
        { name: 'System error', value: 15, color: COLORS.muted },
      ],
    },
    highlights: [
      { label: 'P1 open', value: '3', hint: 'All within 15-min SLA' },
      { label: 'Playbook fires', value: '241', hint: 'This week' },
      { label: 'Recurring top-3', value: 'Customs · Short-pick · ETA', hint: 'Targeted for RCA' },
    ],
  },
  'cost-to-serve': {
    headline: 'Margin health per order, customer, and lane',
    kpis: [
      { label: 'Cost / Order', value: 'AED 24.10', delta: '−AED 1.30', positive: true },
      { label: 'Net Margin %', value: '11.6%', delta: '+40 bps', positive: true },
      { label: 'Accessorial Share', value: '9.4%', delta: '−1.1 pts', positive: true },
      { label: 'Unprofitable Orders', value: '184', delta: '−62 WoW', positive: true },
    ],
    trend: {
      title: 'Cost per order — 8 weeks',
      subtitle: 'Blended freight + handling + storage per order',
      xKey: 'week',
      series: [
        { key: 'cost', label: 'AED / order', color: COLORS.primary },
        { key: 'target', label: 'Target', color: COLORS.success },
      ],
      data: [
        { week: 'W-7', cost: 28.1, target: 24 },
        { week: 'W-6', cost: 27.4, target: 24 },
        { week: 'W-5', cost: 26.8, target: 24 },
        { week: 'W-4', cost: 26.1, target: 24 },
        { week: 'W-3', cost: 25.6, target: 24 },
        { week: 'W-2', cost: 25.0, target: 24 },
        { week: 'W-1', cost: 24.5, target: 24 },
        { week: 'This', cost: 24.1, target: 24 },
      ],
    },
    distribution: {
      title: 'Cost driver mix',
      subtitle: 'Where the AED goes per order',
      type: 'pie',
      data: [
        { name: 'Line-haul freight', value: 42, color: COLORS.primary },
        { name: 'Last-mile', value: 21, color: COLORS.warning },
        { name: 'Warehousing', value: 18, color: COLORS.success },
        { name: 'Accessorials', value: 9, color: COLORS.danger },
        { name: 'Returns', value: 10, color: COLORS.muted },
      ],
    },
    highlights: [
      { label: 'Margin-negative SKUs', value: '46', hint: 'Flagged for pricing review' },
      { label: 'Detention fees', value: 'AED 62K', hint: 'This month, −18% MoM' },
      { label: 'Lane renegotiated', value: '3', hint: 'JBA→RUH, DXB→KWI, DMM→DOH' },
    ],
  },
  'planner-copilot': {
    headline: 'Copilot adoption, answer quality, and time saved for planners',
    kpis: [
      { label: 'Active Planners', value: '38 / 42', delta: '90% adoption', positive: true },
      { label: 'Suggestion Accept %', value: '72%', delta: '+8 pts', positive: true },
      { label: 'Avg Answer Confidence', value: '0.87', delta: 'Above 0.75 floor', positive: true },
      { label: 'Time Saved / Planner', value: '6.4 hrs/wk', delta: '+1.2 hrs', positive: true },
    ],
    trend: {
      title: 'Sessions & acceptance — 8 weeks',
      subtitle: 'Copilot sessions and share of suggestions committed to IBP',
      xKey: 'week',
      series: [
        { key: 'sessions', label: 'Sessions', color: COLORS.primary },
        { key: 'accepted', label: 'Accepted suggestions', color: COLORS.success },
      ],
      data: [
        { week: 'W-7', sessions: 210, accepted: 118 },
        { week: 'W-6', sessions: 245, accepted: 141 },
        { week: 'W-5', sessions: 278, accepted: 172 },
        { week: 'W-4', sessions: 302, accepted: 198 },
        { week: 'W-3', sessions: 331, accepted: 224 },
        { week: 'W-2', sessions: 356, accepted: 248 },
        { week: 'W-1', sessions: 384, accepted: 271 },
        { week: 'This', sessions: 412, accepted: 297 },
      ],
    },
    distribution: {
      title: 'Question mix',
      subtitle: 'What planners ask the copilot',
      type: 'pie',
      data: [
        { name: 'Explain a signal', value: 32, color: COLORS.primary },
        { name: 'Draft S&OP note', value: 22, color: COLORS.success },
        { name: 'Simulate scenario', value: 18, color: COLORS.warning },
        { name: 'Policy lookup', value: 14, color: COLORS.danger },
        { name: 'Data pull', value: 14, color: COLORS.muted },
      ],
    },
    highlights: [
      { label: 'Cited sources / answer', value: '4.2 avg', hint: 'Every quant claim cited' },
      { label: '"I don\'t know" rate', value: '6%', hint: 'Below 10% target' },
      { label: 'S&OP packs drafted', value: '14', hint: 'This week' },
    ],
  },
};

export const getAgentAnalytics = (agentId: string): AgentAnalyticsConfig | undefined =>
  supplyChainAgentAnalytics[agentId];
