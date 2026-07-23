// Per-agent contextualization for Store Ops: bucket narratives, analytics KPIs,
// connectors, and settings. Mirrors the supply chain pattern so every Store Ops
// utility surface (Buckets, Analytics, Connectors, Settings, Admin) is unique.

import type { StoreAgentId, StoreBucketId } from './storeOps';

const C = {
  primary: 'hsl(var(--primary))',
  success: 'hsl(var(--status-success))',
  warning: 'hsl(var(--status-warning))',
  danger: 'hsl(var(--status-danger))',
};

export interface BucketNarrative {
  title: string;
  meaning: string;
  playbook: string;
  primaryMetric: string;
  slaWindow: string;
}

export interface AgentConnector {
  id: string;
  name: string;
  description: string;
  status: 'connected' | 'configured';
  endpoint: string;
  lastSync: string | null;
}

export interface AgentSettingGroup {
  title: string;
  fields: { key: string; label: string; value: string | number | boolean; kind: 'number' | 'text' | 'toggle' }[];
}

export interface AgentAnalytics {
  headline: string;
  kpis: { label: string; value: string; delta: string; positive: boolean }[];
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
    data: { name: string; value: number; color?: string }[];
  };
  highlights: { label: string; value: string; hint: string }[];
}

export interface StoreAgentContext {
  buckets: Record<StoreBucketId, BucketNarrative>;
  analytics: AgentAnalytics;
  connectors: AgentConnector[];
  settings: AgentSettingGroup[];
}

const wk = (a: number, b: number, c: number, d: number, e: number, f: number, aKey: string, bKey: string) => [
  { week: 'W-5', [aKey]: a, [bKey]: b },
  { week: 'W-4', [aKey]: b, [bKey]: c },
  { week: 'W-3', [aKey]: c, [bKey]: d },
  { week: 'W-2', [aKey]: d, [bKey]: e },
  { week: 'W-1', [aKey]: e, [bKey]: f },
  { week: 'This', [aKey]: f, [bKey]: f - 1 },
];

export const storeOpsAgentContext: Record<StoreAgentId, StoreAgentContext> = {
  'store-command': {
    buckets: {
      breached: { title: 'Store Health Red', meaning: 'One or more critical KPIs (queue, OSA, planogram) already outside SLA at this store.', playbook: 'Notify Store Manager, assign owner, and open Fix-Now workflow.', primaryMetric: 'Store Health Score', slaWindow: 'Recover within 2h' },
      'at-risk': { title: 'Slipping', meaning: 'Composite score trending down but still inside guardrails.', playbook: 'Send in-app nudge to Duty Manager and monitor next hourly poll.', primaryMetric: 'Composite Score Δ', slaWindow: 'Act within 4h' },
      optimized: { title: 'Store Green', meaning: 'All monitored KPIs inside guardrails; audit clean.', playbook: 'Maintain; publish shift-close digest.', primaryMetric: 'Health Score %', slaWindow: 'Monitor only' },
    },
    analytics: {
      headline: 'Cross-store health, exception aging, and manager response',
      kpis: [
        { label: 'Store Health Score', value: '88%', delta: '+3 pts WoW', positive: true },
        { label: 'Aging Exceptions', value: '12', delta: '−4 WoW', positive: true },
        { label: 'MTTR (P1)', value: '1h 42m', delta: '−28 min', positive: true },
        { label: 'Manager Response', value: '92%', delta: '+5 pts', positive: true },
      ],
      trend: { title: 'Health vs Aging Exceptions', subtitle: 'Rolling 6-week composite', xKey: 'week',
        series: [{ key: 'health', label: 'Health', color: C.primary }, { key: 'aging', label: 'Aging', color: C.warning }],
        data: wk(78, 80, 82, 84, 86, 88, 'health', 'aging') },
      distribution: { title: 'Exceptions by Store Cluster', subtitle: 'Where health is worst', data: [
        { name: 'Dubai', value: 4 }, { name: 'Riyadh', value: 3 }, { name: 'Jeddah', value: 2 }, { name: 'Kuwait', value: 1 }, { name: 'Doha', value: 2 },
      ]},
      highlights: [
        { label: 'Fastest recovery', value: 'KWT-008', hint: 'Green for 21 days' },
        { label: 'Slowest recovery', value: 'JED-027', hint: '3 open P1s' },
        { label: 'Nudges sent', value: '148', hint: 'Last 7 days' },
      ],
    },
    connectors: [
      { id: 'pos', name: 'POS Live', description: 'Lane, tender, and basket telemetry', status: 'connected', endpoint: 'pos-live://stores/events', lastSync: '2026-06-18T10:20:00Z' },
      { id: 'wfm', name: 'UKG Pro WFM', description: 'Rosters, punches, break plans', status: 'connected', endpoint: 'ukg://wfm/rosters', lastSync: '2026-06-18T09:55:00Z' },
      { id: 'exception-bus', name: 'Exception Bus', description: 'Cross-agent P1/P2 aggregation', status: 'connected', endpoint: 'events://exceptions', lastSync: '2026-06-18T10:22:00Z' },
      { id: 'notify', name: 'Store Notify (Push)', description: 'Manager and associate device push', status: 'connected', endpoint: 'notify://store-app/push', lastSync: '2026-06-18T10:19:00Z' },
    ],
    settings: [
      { title: 'Health Score', fields: [
        { key: 'healthMin', label: 'Minimum store health', value: 80, kind: 'number' },
        { key: 'mttrTarget', label: 'MTTR target (minutes, P1)', value: 90, kind: 'number' },
        { key: 'nudgeCadence', label: 'Nudge cadence (minutes)', value: 15, kind: 'number' },
      ]},
      { title: 'Escalation', fields: [
        { key: 'autoEscalate', label: 'Auto-escalate P1 after 30 min', value: true, kind: 'toggle' },
        { key: 'notifyRM', label: 'Notify Regional Manager on P1', value: true, kind: 'toggle' },
      ]},
    ],
  },

  'category-intelligence': {
    buckets: {
      breached: { title: 'Category Rule Violated', meaning: 'A category-specific rule (fresh waste, jewellery cover, cosmetics advisor mix) crossed threshold.', playbook: 'Route to Category Head with rule + variance and pre-filled corrective task.', primaryMetric: 'Rule Compliance %', slaWindow: 'Act within 3h' },
      'at-risk': { title: 'Category Drift', meaning: 'KPI trending against category norms for peak/promo/event context.', playbook: 'Recalibrate threshold for context and stage store nudge.', primaryMetric: 'Δ vs category norm', slaWindow: 'Act within 6h' },
      optimized: { title: 'Rules Aligned', meaning: 'All category rules honored across banner.', playbook: 'Maintain; refresh calendar weekly.', primaryMetric: 'Compliance %', slaWindow: 'Monitor only' },
    },
    analytics: {
      headline: 'Category rule compliance across Grocery, Fashion, Jewellery, Cosmetics, Toys',
      kpis: [
        { label: 'Rule Compliance', value: '94%', delta: '+2 pts', positive: true },
        { label: 'Threshold Overrides', value: '7', delta: '−3 WoW', positive: true },
        { label: 'Category Drift Flags', value: '11', delta: '−5', positive: true },
        { label: 'Peak-context Adjustments', value: '42', delta: 'Ramadan +18', positive: true },
      ],
      trend: { title: 'Compliance by Week', subtitle: 'All 5 categories blended', xKey: 'week',
        series: [{ key: 'comp', label: 'Compliance %', color: C.primary }, { key: 'drift', label: 'Drift Flags', color: C.warning }],
        data: wk(88, 90, 91, 92, 93, 94, 'comp', 'drift') },
      distribution: { title: 'Breaches by Category', subtitle: 'Where category logic fires most', data: [
        { name: 'Grocery', value: 8 }, { name: 'Fashion', value: 4 }, { name: 'Jewellery', value: 3 }, { name: 'Cosmetics', value: 5 }, { name: 'Toys', value: 2 },
      ]},
      highlights: [
        { label: 'Top drift', value: 'Fresh Produce', hint: 'Waste risk index up 12%' },
        { label: 'Peak effect', value: 'Cosmetics', hint: 'Advisor mix +20% for brand event' },
        { label: 'Override rate', value: '3.1%', hint: 'Category Head approvals' },
      ],
    },
    connectors: [
      { id: 'category-master', name: 'Category Master', description: 'Approved category attributes and elasticities', status: 'connected', endpoint: 'category://master/v4', lastSync: '2026-06-18T08:00:00Z' },
      { id: 'promo-calendar', name: 'Promotion Calendar', description: 'Brand events, endcaps, feature blocks', status: 'connected', endpoint: 'promo://calendar', lastSync: '2026-06-18T09:00:00Z' },
      { id: 'expiry-feed', name: 'Expiry Feed', description: 'Fresh + short-life date telemetry', status: 'connected', endpoint: 'inventory://expiry', lastSync: '2026-06-18T10:00:00Z' },
    ],
    settings: [
      { title: 'Grocery', fields: [
        { key: 'wasteMax', label: 'Fresh waste ceiling (%)', value: 6, kind: 'number' },
        { key: 'expiryLookahead', label: 'Expiry lookahead (days)', value: 3, kind: 'number' },
      ]},
      { title: 'Fashion', fields: [
        { key: 'osaMin', label: 'Size-curve OSA min (%)', value: 96, kind: 'number' },
      ]},
      { title: 'Jewellery', fields: [
        { key: 'clearedStaffMin', label: 'Security-cleared staff min', value: 2, kind: 'number' },
      ]},
    ],
  },

  'margin-shrinkage': {
    buckets: {
      breached: { title: 'Shrink / Margin Breach', meaning: 'Loss variance or margin leakage above ceiling on this store or department.', playbook: 'Freeze suspect flows, open LP case, notify Finance.', primaryMetric: 'Shrink %', slaWindow: 'Investigate within 24h' },
      'at-risk': { title: 'Leakage Building', meaning: 'Void spikes, refund clustering, or discount stacking outside band.', playbook: 'Route CCTV clip and cashier-audit task to Duty Manager.', primaryMetric: 'Void / refund index', slaWindow: 'Act within 12h' },
      optimized: { title: 'Loss Controls Holding', meaning: 'Shrink within budgeted variance; controls green.', playbook: 'Maintain; monthly LP review.', primaryMetric: 'Shrink %', slaWindow: 'Monitor only' },
    },
    analytics: {
      headline: 'Shrink variance, void / refund clustering, and discount leakage',
      kpis: [
        { label: 'Shrink %', value: '1.4%', delta: '−0.2 pts', positive: true },
        { label: 'Void Index', value: '108', delta: '+8 vs LM', positive: false },
        { label: 'Refunds > AED 500', value: '24', delta: '−6', positive: true },
        { label: 'Discount Leakage', value: 'AED 42K', delta: '−18%', positive: true },
      ],
      trend: { title: 'Shrink vs Void Index', subtitle: '6-week banner view', xKey: 'week',
        series: [{ key: 'shrink', label: 'Shrink %', color: C.danger }, { key: 'voids', label: 'Void Idx', color: C.warning }],
        data: [
          { week: 'W-5', shrink: 1.9, voids: 118 }, { week: 'W-4', shrink: 1.8, voids: 114 },
          { week: 'W-3', shrink: 1.7, voids: 112 }, { week: 'W-2', shrink: 1.6, voids: 110 },
          { week: 'W-1', shrink: 1.5, voids: 109 }, { week: 'This', shrink: 1.4, voids: 108 },
        ] },
      distribution: { title: 'Loss by Vector', subtitle: 'Where value leaks', data: [
        { name: 'External Theft', value: 38 }, { name: 'Internal', value: 22 }, { name: 'Refund Fraud', value: 18 }, { name: 'Discount Leakage', value: 14 }, { name: 'Admin Error', value: 8 },
      ]},
      highlights: [
        { label: 'Hot store', value: 'DXB-014', hint: 'Cosmetics testers + high tender-cash mix' },
        { label: 'Fraud pattern', value: 'Split refund', hint: 'Cashier ID 4021 · 6 hits/week' },
        { label: 'LP win', value: 'AED 76K', hint: 'Recovered this quarter' },
      ],
    },
    connectors: [
      { id: 'lp-cctv', name: 'LP CCTV Search', description: 'Frame + basket-linked video retrieval', status: 'connected', endpoint: 'cctv://lp/search', lastSync: '2026-06-18T10:12:00Z' },
      { id: 'pos-voids', name: 'POS Void / Refund Stream', description: 'Cashier-level void/refund events', status: 'connected', endpoint: 'pos-live://voids', lastSync: '2026-06-18T10:20:00Z' },
      { id: 'finance', name: 'Finance GL', description: 'Shrink journal + reconciliation', status: 'connected', endpoint: 'gl://shrink/journal', lastSync: '2026-06-18T08:00:00Z' },
    ],
    settings: [
      { title: 'Shrink Guardrails', fields: [
        { key: 'shrinkCap', label: 'Shrink ceiling (%)', value: 1.5, kind: 'number' },
        { key: 'voidThreshold', label: 'Void per cashier (per shift)', value: 8, kind: 'number' },
        { key: 'refundApproval', label: 'Refund approval floor (AED)', value: 500, kind: 'number' },
      ]},
      { title: 'Controls', fields: [
        { key: 'freezeCashier', label: 'Auto-freeze cashier on 3 flagged voids', value: true, kind: 'toggle' },
        { key: 'notifyLP', label: 'Notify Loss Prevention on high-value refund', value: true, kind: 'toggle' },
      ]},
    ],
  },

  checkout: {
    buckets: {
      breached: { title: 'Queue SLA Breached', meaning: 'Wait time above 6-min SLA or checkout abandonment climbing.', playbook: 'Open lanes / redeploy cashiers, push self-checkout coupon.', primaryMetric: 'Queue wait (min)', slaWindow: 'Recover within 20 min' },
      'at-risk': { title: 'Queue Pressure', meaning: 'Basket queue length trending up in next 15-min window.', playbook: 'Pre-call floater and stage express lane.', primaryMetric: 'Predicted wait', slaWindow: 'Act within 15 min' },
      optimized: { title: 'Checkout Smooth', meaning: 'Wait under 4 min, abandonment <1%.', playbook: 'Maintain; keep floater in reserve.', primaryMetric: 'Queue wait', slaWindow: 'Monitor only' },
    },
    analytics: {
      headline: 'Queue wait, abandonment, and lane productivity',
      kpis: [
        { label: 'Avg Queue Wait', value: '3.9 min', delta: '−0.6 min', positive: true },
        { label: 'Abandonment %', value: '0.8%', delta: '−0.4 pts', positive: true },
        { label: 'Lanes Open (peak)', value: '11/14', delta: '+1', positive: true },
        { label: 'SCO Adoption', value: '38%', delta: '+6 pts', positive: true },
      ],
      trend: { title: 'Queue Wait by Week', subtitle: 'Banner blended', xKey: 'week',
        series: [{ key: 'wait', label: 'Avg wait (min)', color: C.primary }, { key: 'abandon', label: 'Abandon %', color: C.warning }],
        data: [
          { week: 'W-5', wait: 5.4, abandon: 1.6 }, { week: 'W-4', wait: 5.0, abandon: 1.4 },
          { week: 'W-3', wait: 4.6, abandon: 1.2 }, { week: 'W-2', wait: 4.2, abandon: 1.0 },
          { week: 'W-1', wait: 4.0, abandon: 0.9 }, { week: 'This', wait: 3.9, abandon: 0.8 },
        ] },
      distribution: { title: 'Wait by Store', subtitle: 'Where queues bite', data: [
        { name: 'DXB-014', value: 5.1 }, { name: 'JED-027', value: 4.6 }, { name: 'RUH-022', value: 3.8 }, { name: 'KWT-008', value: 3.2 }, { name: 'DOH-006', value: 3.0 },
      ]},
      highlights: [
        { label: 'Peak surge', value: '19:00–21:00', hint: 'Weekend evenings' },
        { label: 'SCO win', value: '+6 pts', hint: 'After coupon nudge' },
        { label: 'Floater ROI', value: 'AED 12/hr', hint: 'Saved abandonment' },
      ],
    },
    connectors: [
      { id: 'xovis', name: 'Xovis Queue Vision', description: 'Live queue length + wait telemetry', status: 'connected', endpoint: 'xovis://queue', lastSync: '2026-06-18T10:22:00Z' },
      { id: 'lane-status', name: 'Lane Status Bus', description: 'Lane open/closed and cashier session', status: 'connected', endpoint: 'lanes://status', lastSync: '2026-06-18T10:21:00Z' },
      { id: 'sco', name: 'Self-Checkout Ops', description: 'SCO uptime, exceptions, and coupon offers', status: 'connected', endpoint: 'sco://ops', lastSync: '2026-06-18T10:20:00Z' },
    ],
    settings: [
      { title: 'Queue SLA', fields: [
        { key: 'waitSla', label: 'Wait SLA (minutes)', value: 6, kind: 'number' },
        { key: 'abandonMax', label: 'Abandonment max (%)', value: 1.5, kind: 'number' },
        { key: 'floaterTrigger', label: 'Call floater at wait (min)', value: 4, kind: 'number' },
      ]},
      { title: 'Automation', fields: [
        { key: 'autoLaneCall', label: 'Auto-page floater on threshold', value: true, kind: 'toggle' },
        { key: 'scoCoupon', label: 'Push SCO coupon at surge', value: true, kind: 'toggle' },
      ]},
    ],
  },

  'store-replenishment': {
    buckets: {
      breached: { title: 'Shelf-Out', meaning: 'OSA below 96% on tracked SKUs — backroom has stock but shelf is empty.', playbook: 'Push top-up task to associate with SKU list and bay map.', primaryMetric: 'OSA %', slaWindow: 'Recover within 45 min' },
      'at-risk': { title: 'Sell-Through Ahead of Plan', meaning: 'Velocity forecast will drain shelf before next wave.', playbook: 'Schedule advance top-up before next peak hour.', primaryMetric: 'Cover hours', slaWindow: 'Act within 2h' },
      optimized: { title: 'Shelves Full', meaning: 'OSA above 97% across tracked SKUs.', playbook: 'Maintain; nightly cycle-count sample.', primaryMetric: 'OSA %', slaWindow: 'Monitor only' },
    },
    analytics: {
      headline: 'On-shelf availability, top-up latency, and backroom-to-shelf leakage',
      kpis: [
        { label: 'OSA %', value: '96.4%', delta: '+1.2 pts', positive: true },
        { label: 'Top-up Latency', value: '34 min', delta: '−11 min', positive: true },
        { label: 'Phantom Inventory', value: '2.1%', delta: '−0.6 pts', positive: true },
        { label: 'Lost Sales (7d)', value: 'AED 118K', delta: '−22%', positive: true },
      ],
      trend: { title: 'OSA vs Top-up Latency', subtitle: '6-week trend', xKey: 'week',
        series: [{ key: 'osa', label: 'OSA %', color: C.success }, { key: 'lat', label: 'Latency (min)', color: C.warning }],
        data: [
          { week: 'W-5', osa: 93, lat: 55 }, { week: 'W-4', osa: 94, lat: 50 },
          { week: 'W-3', osa: 94.5, lat: 45 }, { week: 'W-2', osa: 95.5, lat: 40 },
          { week: 'W-1', osa: 96, lat: 36 }, { week: 'This', osa: 96.4, lat: 34 },
        ] },
      distribution: { title: 'Shelf-Outs by Bay', subtitle: 'Where OSA fails most', data: [
        { name: 'Beverages', value: 12 }, { name: 'Dairy', value: 9 }, { name: 'Snacks', value: 7 }, { name: 'HBA', value: 5 }, { name: 'Frozen', value: 3 },
      ]},
      highlights: [
        { label: 'Hero SKU save', value: 'Rice 5kg', hint: 'Refill in 22 min' },
        { label: 'Phantom hotspot', value: 'Bay 14', hint: 'Cycle-count needed' },
        { label: 'Backroom cover', value: '3.2 days', hint: 'Above target' },
      ],
    },
    connectors: [
      { id: 'rfid', name: 'RFID Shelf Scan', description: 'Bay-level tag reads', status: 'connected', endpoint: 'rfid://shelf', lastSync: '2026-06-18T10:15:00Z' },
      { id: 'trax', name: 'Trax Shelf Image AI', description: 'Photo-based OSA and gap detection', status: 'connected', endpoint: 'trax://shelf/scan', lastSync: '2026-06-18T09:45:00Z' },
      { id: 'wms', name: 'Store WMS', description: 'Backroom stock and top-up tasks', status: 'connected', endpoint: 'wms://store', lastSync: '2026-06-18T10:00:00Z' },
    ],
    settings: [
      { title: 'Availability', fields: [
        { key: 'osaTarget', label: 'OSA target (%)', value: 96, kind: 'number' },
        { key: 'topupSla', label: 'Top-up SLA (min)', value: 45, kind: 'number' },
      ]},
      { title: 'Automation', fields: [
        { key: 'autoTopup', label: 'Auto-create top-up tasks', value: true, kind: 'toggle' },
        { key: 'phantomAlert', label: 'Alert on phantom > 3%', value: true, kind: 'toggle' },
      ]},
    ],
  },

  planogram: {
    buckets: {
      breached: { title: 'Planogram Fail', meaning: 'Compliance score below 92% or major adjacency violation logged.', playbook: 'Send corrected layout + photo task to VM lead.', primaryMetric: 'Compliance %', slaWindow: 'Fix within 4h' },
      'at-risk': { title: 'Drift', meaning: 'Fixture or endcap deviating from approved plan.', playbook: 'Nudge Duty Manager with side-by-side reference.', primaryMetric: 'Drift score', slaWindow: 'Act within 8h' },
      optimized: { title: 'Planogram Clean', meaning: 'All bays scored ≥ 95% with photo confirmation.', playbook: 'Maintain; weekly VM audit sample.', primaryMetric: 'Compliance %', slaWindow: 'Monitor only' },
    },
    analytics: {
      headline: 'Planogram compliance, endcap execution, and photo verification',
      kpis: [
        { label: 'Compliance Score', value: '94%', delta: '+3 pts', positive: true },
        { label: 'Endcap Execution', value: '89%', delta: '+4 pts', positive: true },
        { label: 'Photo Verified', value: '78%', delta: '+12 pts', positive: true },
        { label: 'Adjacency Fails', value: '6', delta: '−3', positive: true },
      ],
      trend: { title: 'Compliance vs Execution', subtitle: '6 weeks', xKey: 'week',
        series: [{ key: 'comp', label: 'Compliance', color: C.primary }, { key: 'exec', label: 'Endcap Exec', color: C.success }],
        data: wk(85, 87, 89, 91, 93, 94, 'comp', 'exec') },
      distribution: { title: 'Fails by Fixture Type', subtitle: 'Where VM slips', data: [
        { name: 'Endcap', value: 9 }, { name: 'Shelf', value: 6 }, { name: 'Feature', value: 4 }, { name: 'Fixture', value: 3 }, { name: 'Cross-merch', value: 2 },
      ]},
      highlights: [
        { label: 'Best exec', value: 'DXB-014', hint: '98% score, 100% photo-verified' },
        { label: 'Worst exec', value: 'JED-011', hint: 'Cosmetics endcap missing' },
        { label: 'Rework saved', value: 'AED 22K', hint: 'Avoided VM revisits' },
      ],
    },
    connectors: [
      { id: 'dam', name: 'DAM Planograms', description: 'Approved layouts + fixture specs', status: 'connected', endpoint: 'dam://planograms', lastSync: '2026-06-18T07:30:00Z' },
      { id: 'trax-pog', name: 'Trax Planogram Compare', description: 'Photo vs approved layout scoring', status: 'connected', endpoint: 'trax://pog', lastSync: '2026-06-18T09:45:00Z' },
    ],
    settings: [
      { title: 'Compliance', fields: [
        { key: 'minScore', label: 'Minimum planogram score', value: 92, kind: 'number' },
        { key: 'photoRequired', label: 'Photo verification required', value: true, kind: 'toggle' },
      ]},
    ],
  },

  'customer-engagement': {
    buckets: {
      breached: { title: 'Journey Broken', meaning: 'Loyalty appointment missed, VIP unattended, or campaign response below floor.', playbook: 'Recover with personalized offer + advisor callback.', primaryMetric: 'Journey Health', slaWindow: 'Recover within 24h' },
      'at-risk': { title: 'Response Weak', meaning: 'Segment response below target on live campaign.', playbook: 'Reshape audience, refresh creative, or shift channel mix.', primaryMetric: 'Response %', slaWindow: 'Act within 48h' },
      optimized: { title: 'Engagement Strong', meaning: 'Segment CTR and appointment attendance above target.', playbook: 'Maintain; A/B-test next drop.', primaryMetric: 'Response %', slaWindow: 'Monitor only' },
    },
    analytics: {
      headline: 'Loyalty response, appointment attendance, and VIP handling',
      kpis: [
        { label: 'Campaign CTR', value: '11.4%', delta: '+1.8 pts', positive: true },
        { label: 'Appt. Attendance', value: '84%', delta: '+3 pts', positive: true },
        { label: 'VIP NPS', value: '72', delta: '+6', positive: true },
        { label: 'Missed Appts', value: '18', delta: '−6', positive: true },
      ],
      trend: { title: 'CTR vs Attendance', subtitle: '6 weeks', xKey: 'week',
        series: [{ key: 'ctr', label: 'CTR %', color: C.primary }, { key: 'att', label: 'Attend %', color: C.success }],
        data: wk(8, 9, 9.5, 10.2, 10.8, 11.4, 'ctr', 'att') },
      distribution: { title: 'Response by Segment', subtitle: 'Who converts', data: [
        { name: 'VIP', value: 22 }, { name: 'Frequent', value: 15 }, { name: 'Lapsed', value: 6 }, { name: 'New', value: 9 }, { name: 'Prospect', value: 4 },
      ]},
      highlights: [
        { label: 'Top journey', value: 'Cosmetics VIP', hint: 'Attend 92%' },
        { label: 'Recovery win', value: '38 VIPs', hint: 'Booked after callback' },
        { label: 'Missed value', value: 'AED 46K', hint: 'From no-show appts' },
      ],
    },
    connectors: [
      { id: 'crm-loyalty', name: 'Loyalty CRM', description: 'Segments, offers, and journeys', status: 'connected', endpoint: 'crm://loyalty', lastSync: '2026-06-18T09:40:00Z' },
      { id: 'appt', name: 'Appointment Ledger', description: 'VIP + advisor booking system', status: 'connected', endpoint: 'appt://ledger', lastSync: '2026-06-18T10:05:00Z' },
    ],
    settings: [
      { title: 'Journeys', fields: [
        { key: 'noshowMax', label: 'No-show alert threshold', value: 3, kind: 'number' },
        { key: 'ctrFloor', label: 'Response floor (%)', value: 6, kind: 'number' },
        { key: 'vipRecall', label: 'Auto-recall lapsed VIP (days)', value: 30, kind: 'number' },
      ]},
    ],
  },

  workforce: {
    buckets: {
      breached: { title: 'Understaffed', meaning: 'Coverage below floor for footfall, appointments, or high-value counters.', playbook: 'Publish shift call, offer split-shift, or reassign floater.', primaryMetric: 'Coverage %', slaWindow: 'Resolve within 1h' },
      'at-risk': { title: 'Skill Gap', meaning: 'Certified-staff mix will breach at next shift.', playbook: 'Reassign or fast-track training slot.', primaryMetric: 'Skill mix %', slaWindow: 'Act within 4h' },
      optimized: { title: 'Roster Green', meaning: 'Coverage and skill mix inside all guardrails.', playbook: 'Maintain; publish weekly labor efficiency report.', primaryMetric: 'Coverage %', slaWindow: 'Monitor only' },
    },
    analytics: {
      headline: 'Coverage vs demand, skill certification, and labor productivity',
      kpis: [
        { label: 'Coverage vs Plan', value: '97%', delta: '+2 pts', positive: true },
        { label: 'Skill-Certified', value: '88%', delta: '+4 pts', positive: true },
        { label: 'Labor Hours / Sale', value: '0.42', delta: '−0.03', positive: true },
        { label: 'Overtime Rate', value: '4.1%', delta: '−0.8 pts', positive: true },
      ],
      trend: { title: 'Coverage vs Overtime', subtitle: '6 weeks', xKey: 'week',
        series: [{ key: 'cov', label: 'Coverage %', color: C.success }, { key: 'ot', label: 'Overtime %', color: C.warning }],
        data: [
          { week: 'W-5', cov: 91, ot: 6.4 }, { week: 'W-4', cov: 92, ot: 5.8 },
          { week: 'W-3', cov: 94, ot: 5.2 }, { week: 'W-2', cov: 95, ot: 4.6 },
          { week: 'W-1', cov: 96, ot: 4.3 }, { week: 'This', cov: 97, ot: 4.1 },
        ] },
      distribution: { title: 'Gaps by Role', subtitle: 'Where labor is short', data: [
        { name: 'Cashier', value: 9 }, { name: 'Advisor', value: 6 }, { name: 'Stockroom', value: 4 }, { name: 'Security', value: 3 }, { name: 'Floater', value: 2 },
      ]},
      highlights: [
        { label: 'Best productivity', value: 'KWT-008', hint: 'Sales/hr +18%' },
        { label: 'OT hotspot', value: 'JED-027', hint: 'Cashier bench thin' },
        { label: 'Auto shift-call', value: '84%', hint: 'Filled within 30 min' },
      ],
    },
    connectors: [
      { id: 'ukg', name: 'UKG Pro WFM', description: 'Rosters, punches, availability', status: 'connected', endpoint: 'ukg://rosters', lastSync: '2026-06-18T09:55:00Z' },
      { id: 'lms', name: 'Learning & Certification', description: 'Skill and compliance records', status: 'connected', endpoint: 'lms://skills', lastSync: '2026-06-18T08:00:00Z' },
      { id: 'footfall-fc', name: 'Footfall Forecast', description: 'Hourly demand curves per store', status: 'connected', endpoint: 'forecast://footfall', lastSync: '2026-06-18T09:00:00Z' },
    ],
    settings: [
      { title: 'Coverage', fields: [
        { key: 'minCoverage', label: 'Coverage floor (%)', value: 95, kind: 'number' },
        { key: 'skillMin', label: 'Skill-cert min (%)', value: 85, kind: 'number' },
        { key: 'otCap', label: 'OT cap per store (%)', value: 5, kind: 'number' },
      ]},
      { title: 'Automation', fields: [
        { key: 'autoShiftCall', label: 'Auto-publish shift call on gap', value: true, kind: 'toggle' },
      ]},
    ],
  },

  'freshness-waste': {
    buckets: {
      breached: { title: 'Waste Risk High', meaning: 'Expiry cohort will breach waste budget without markdown action.', playbook: 'Trigger tiered markdown and route to VM for signage.', primaryMetric: 'Waste %', slaWindow: 'Act within 8h' },
      'at-risk': { title: 'Cohort Aging', meaning: 'Fresh cohort within 48h of expiry; sell-through below velocity.', playbook: 'Small markdown + bundle recommendation.', primaryMetric: 'Days-to-expire', slaWindow: 'Act within 24h' },
      optimized: { title: 'Freshness Clean', meaning: 'Waste inside target; no aging cohort.', playbook: 'Maintain; refresh markdown ladder weekly.', primaryMetric: 'Waste %', slaWindow: 'Monitor only' },
    },
    analytics: {
      headline: 'Fresh waste, markdown ROI, and cohort sell-through',
      kpis: [
        { label: 'Fresh Waste %', value: '5.2%', delta: '−0.8 pts', positive: true },
        { label: 'Markdown ROI', value: '2.4x', delta: '+0.3', positive: true },
        { label: 'Aging Cohorts', value: '11', delta: '−4', positive: true },
        { label: 'Sell-through 48h', value: '78%', delta: '+6 pts', positive: true },
      ],
      trend: { title: 'Waste vs Markdown ROI', subtitle: '6 weeks', xKey: 'week',
        series: [{ key: 'waste', label: 'Waste %', color: C.danger }, { key: 'roi', label: 'ROI x', color: C.success }],
        data: [
          { week: 'W-5', waste: 7.1, roi: 1.8 }, { week: 'W-4', waste: 6.6, roi: 2.0 },
          { week: 'W-3', waste: 6.2, roi: 2.1 }, { week: 'W-2', waste: 5.8, roi: 2.2 },
          { week: 'W-1', waste: 5.5, roi: 2.3 }, { week: 'This', waste: 5.2, roi: 2.4 },
        ] },
      distribution: { title: 'Waste by Sub-Category', subtitle: 'Where fresh burns', data: [
        { name: 'Produce', value: 34 }, { name: 'Bakery', value: 22 }, { name: 'Dairy', value: 14 }, { name: 'Meat', value: 18 }, { name: 'Deli', value: 12 },
      ]},
      highlights: [
        { label: 'Best save', value: 'Bakery bundle', hint: '92% sell-through post markdown' },
        { label: 'Waste hotspot', value: 'Produce leaf', hint: 'Chill-chain flag' },
        { label: 'Cash saved', value: 'AED 62K', hint: 'Last 30 days' },
      ],
    },
    connectors: [
      { id: 'expiry', name: 'Expiry Feed', description: 'Cohort dates and quantities', status: 'connected', endpoint: 'inventory://expiry', lastSync: '2026-06-18T10:00:00Z' },
      { id: 'markdown', name: 'Markdown Engine', description: 'Tiered price ladders', status: 'connected', endpoint: 'pricing://markdown', lastSync: '2026-06-18T09:30:00Z' },
      { id: 'coldchain', name: 'Cold-Chain Telemetry', description: 'Chiller temp + door open events', status: 'connected', endpoint: 'iot://coldchain', lastSync: '2026-06-18T10:20:00Z' },
    ],
    settings: [
      { title: 'Waste', fields: [
        { key: 'wasteBudget', label: 'Fresh waste budget (%)', value: 6, kind: 'number' },
        { key: 'markdownLead', label: 'Markdown lead time (hrs)', value: 48, kind: 'number' },
      ]},
      { title: 'Automation', fields: [
        { key: 'autoMarkdown', label: 'Auto-trigger markdown ladder', value: true, kind: 'toggle' },
      ]},
    ],
  },

  'promo-execution': {
    buckets: {
      breached: { title: 'Promo Not Live', meaning: 'Approved promo missing at fixture / POS / digital shelf at start time.', playbook: 'Push corrective task with fixture photo, PLU, and VM checklist.', primaryMetric: 'Live-at-store %', slaWindow: 'Fix within 2h' },
      'at-risk': { title: 'Execution Lag', meaning: 'Endcap live but signage, PLU, or feature price mismatched.', playbook: 'Route micro-task with side-by-side vs approved asset.', primaryMetric: 'Signage match %', slaWindow: 'Act within 4h' },
      optimized: { title: 'Promo Clean', meaning: 'All active promos live and matching approved plan.', playbook: 'Maintain; publish exec scorecard to Category.', primaryMetric: 'Live-at-store %', slaWindow: 'Monitor only' },
    },
    analytics: {
      headline: 'Promo live-at-store, signage match, and lift capture',
      kpis: [
        { label: 'Live-at-Store %', value: '96%', delta: '+3 pts', positive: true },
        { label: 'Signage Match', value: '92%', delta: '+4 pts', positive: true },
        { label: 'Lift Captured', value: 'AED 1.1M', delta: '+18%', positive: true },
        { label: 'PLU Mismatch', value: '9', delta: '−6', positive: true },
      ],
      trend: { title: 'Live vs Signage Match', subtitle: '6 weeks', xKey: 'week',
        series: [{ key: 'live', label: 'Live %', color: C.success }, { key: 'sign', label: 'Signage %', color: C.primary }],
        data: wk(88, 90, 92, 94, 95, 96, 'live', 'sign') },
      distribution: { title: 'Fails by Vector', subtitle: 'Where promo breaks', data: [
        { name: 'Endcap missing', value: 7 }, { name: 'Wrong PLU', value: 5 }, { name: 'Signage', value: 4 }, { name: 'Digital shelf', value: 3 }, { name: 'Coupon', value: 2 },
      ]},
      highlights: [
        { label: 'Perfect exec', value: 'DXB-014', hint: '100% live across 42 promos' },
        { label: 'Miss hotspot', value: 'JED-027', hint: '3 missing endcaps' },
        { label: 'Recovered lift', value: 'AED 88K', hint: 'From 4h-turn fixes' },
      ],
    },
    connectors: [
      { id: 'campaign', name: 'Campaign Manager', description: 'Approved offers and assets', status: 'connected', endpoint: 'promo://campaigns', lastSync: '2026-06-18T08:30:00Z' },
      { id: 'digital-shelf', name: 'Digital Shelf Feed', description: 'App + web price and badge state', status: 'connected', endpoint: 'digital://shelf', lastSync: '2026-06-18T10:10:00Z' },
      { id: 'store-photo', name: 'Store Photo Verify', description: 'Associate-uploaded fixture photos', status: 'connected', endpoint: 'photos://store-verify', lastSync: '2026-06-18T09:50:00Z' },
    ],
    settings: [
      { title: 'Execution', fields: [
        { key: 'liveTarget', label: 'Live-at-store target (%)', value: 95, kind: 'number' },
        { key: 'photoWindow', label: 'Photo verify window (hrs)', value: 4, kind: 'number' },
      ]},
      { title: 'Automation', fields: [
        { key: 'autoTask', label: 'Auto-create corrective task on miss', value: true, kind: 'toggle' },
      ]},
    ],
  },

  'omnichannel-fulfilment': {
    buckets: {
      breached: { title: 'BOPIS/Ship Late', meaning: 'Pick-pack SLA missed or order at risk of promise slip.', playbook: 'Re-source to nearest dark-store / DC or offer approved substitute.', primaryMetric: 'Pick SLA %', slaWindow: 'Recover within 2h' },
      'at-risk': { title: 'Pick Bench Thin', meaning: 'Wave will run beyond SLA at current picker count.', playbook: 'Redeploy from backroom or trigger cross-store fulfilment.', primaryMetric: 'Bench vs demand', slaWindow: 'Act within 1h' },
      optimized: { title: 'Omnichannel Clean', meaning: 'BOPIS + ship-from-store SLAs green.', playbook: 'Maintain; keep dark-store slots warm.', primaryMetric: 'Pick SLA %', slaWindow: 'Monitor only' },
    },
    analytics: {
      headline: 'Pick SLA, substitution rate, and ship-from-store economics',
      kpis: [
        { label: 'Pick SLA %', value: '95%', delta: '+2 pts', positive: true },
        { label: 'Substitution %', value: '3.4%', delta: '−0.6 pts', positive: true },
        { label: 'BOPIS Cycle', value: '38 min', delta: '−7 min', positive: true },
        { label: 'SFS Margin', value: '14%', delta: '+1.2 pts', positive: true },
      ],
      trend: { title: 'Pick SLA vs BOPIS Cycle', subtitle: '6 weeks', xKey: 'week',
        series: [{ key: 'sla', label: 'SLA %', color: C.success }, { key: 'cycle', label: 'Cycle (min)', color: C.warning }],
        data: [
          { week: 'W-5', sla: 88, cycle: 52 }, { week: 'W-4', sla: 90, cycle: 48 },
          { week: 'W-3', sla: 92, cycle: 44 }, { week: 'W-2', sla: 93, cycle: 42 },
          { week: 'W-1', sla: 94, cycle: 40 }, { week: 'This', sla: 95, cycle: 38 },
        ] },
      distribution: { title: 'Order Volume by Node', subtitle: 'Fulfilment mix', data: [
        { name: 'Store Pick', value: 42 }, { name: 'Dark Store', value: 28 }, { name: 'DC Ship', value: 22 }, { name: 'Locker', value: 8 },
      ]},
      highlights: [
        { label: 'Best node', value: 'DXB Dark-01', hint: '99% SLA' },
        { label: 'Sub hotspot', value: 'Fresh Produce', hint: 'Bundle sub offered' },
        { label: 'SFS win', value: 'AED 44K', hint: 'Recovered from DC ship' },
      ],
    },
    connectors: [
      { id: 'oms', name: 'OMS', description: 'Sourcing decisions + promise', status: 'connected', endpoint: 'oms://source', lastSync: '2026-06-18T10:18:00Z' },
      { id: 'picker-app', name: 'Picker App', description: 'Wave, pick, and hand-off events', status: 'connected', endpoint: 'picker://events', lastSync: '2026-06-18T10:20:00Z' },
      { id: 'darkstore', name: 'Dark-Store Bus', description: 'Dark-store inventory + capacity', status: 'connected', endpoint: 'darkstore://bus', lastSync: '2026-06-18T10:12:00Z' },
    ],
    settings: [
      { title: 'Fulfilment', fields: [
        { key: 'pickSla', label: 'Pick SLA target (%)', value: 95, kind: 'number' },
        { key: 'subCap', label: 'Substitution cap (%)', value: 5, kind: 'number' },
        { key: 'promiseGuard', label: 'Promise guard (min)', value: 15, kind: 'number' },
      ]},
      { title: 'Automation', fields: [
        { key: 'autoResource', label: 'Auto re-source on breach risk', value: true, kind: 'toggle' },
      ]},
    ],
  },

  'associate-copilot': {
    buckets: {
      breached: { title: 'Blocking Question', meaning: 'Associate needs an answer they cannot self-serve (returns, policy, high-value refund).', playbook: 'Push grounded answer with policy citation + supervisor CC.', primaryMetric: 'Answer TTL', slaWindow: 'Serve inside 60s' },
      'at-risk': { title: 'Next-Best Action Pending', meaning: 'NBA generated for associate — awaiting acknowledgement.', playbook: 'Push to associate device with WHAT/WHY/WHEN/WHO.', primaryMetric: 'NBA ack rate', slaWindow: 'Serve in shift' },
      optimized: { title: 'Copilot Helping', meaning: 'Ack rate high; associates closing tasks with copilot.', playbook: 'Maintain; keep KB fresh.', primaryMetric: 'Ack rate %', slaWindow: 'Monitor only' },
    },
    analytics: {
      headline: 'Copilot usage, next-best-action acceptance, and associate throughput',
      kpis: [
        { label: 'Copilot Queries / day', value: '1,240', delta: '+18%', positive: true },
        { label: 'NBA Ack Rate', value: '82%', delta: '+6 pts', positive: true },
        { label: 'Deflection', value: '64%', delta: '+9 pts', positive: true },
        { label: 'Avg Answer TTL', value: '38s', delta: '−12s', positive: true },
      ],
      trend: { title: 'Ack Rate vs Deflection', subtitle: '6 weeks', xKey: 'week',
        series: [{ key: 'ack', label: 'Ack %', color: C.success }, { key: 'defl', label: 'Deflect %', color: C.primary }],
        data: wk(70, 72, 74, 77, 80, 82, 'ack', 'defl') },
      distribution: { title: 'Query Mix', subtitle: 'What associates ask', data: [
        { name: 'Product / Policy', value: 32 }, { name: 'Returns', value: 22 }, { name: 'Loyalty', value: 18 }, { name: 'Inventory', value: 16 }, { name: 'Escalation', value: 12 },
      ]},
      highlights: [
        { label: 'Top NBA', value: 'Refill Bay 14', hint: '96 accepts today' },
        { label: 'Best banner', value: 'UAE', hint: '89% ack' },
        { label: 'Hours saved', value: '312', hint: 'This week' },
      ],
    },
    connectors: [
      { id: 'kb', name: 'Policy KB', description: 'Grounded policy, returns, loyalty rules', status: 'connected', endpoint: 'kb://policies', lastSync: '2026-06-18T08:00:00Z' },
      { id: 'device', name: 'Associate Devices', description: 'Handheld + apron device push', status: 'connected', endpoint: 'device://associate', lastSync: '2026-06-18T10:15:00Z' },
      { id: 'gateway', name: 'Lovable AI Gateway', description: 'Copilot inference and RAG', status: 'connected', endpoint: 'ai://gateway', lastSync: '2026-06-18T10:22:00Z' },
    ],
    settings: [
      { title: 'Copilot', fields: [
        { key: 'ttl', label: 'Answer TTL target (s)', value: 60, kind: 'number' },
        { key: 'kbRefresh', label: 'KB refresh (hrs)', value: 12, kind: 'number' },
      ]},
      { title: 'Guardrails', fields: [
        { key: 'noPii', label: 'Redact PII in traces', value: true, kind: 'toggle' },
        { key: 'requireCitation', label: 'Require policy citation', value: true, kind: 'toggle' },
      ]},
    ],
  },

  'local-demand': {
    buckets: {
      breached: { title: 'Event Missed', meaning: 'Local event / weather / competitor spike impacting store — no forecast override active.', playbook: 'Publish local uplift + push to Replenishment + Workforce.', primaryMetric: 'Local Δ vs base', slaWindow: 'Act within 6h' },
      'at-risk': { title: 'Signal Emerging', meaning: 'Anomaly detected in local footfall / social / weather feed.', playbook: 'Stage override with cited signals and simulate impact.', primaryMetric: 'Anomaly score', slaWindow: 'Act within 24h' },
      optimized: { title: 'Local Steady', meaning: 'No local anomaly; baseline holding.', playbook: 'Maintain; keep signal streams warm.', primaryMetric: 'Anomaly score', slaWindow: 'Monitor only' },
    },
    analytics: {
      headline: 'Local anomaly detection, event uplift capture, and override quality',
      kpis: [
        { label: 'Anomalies Detected', value: '34', delta: '+8 WoW', positive: true },
        { label: 'Override Acceptance', value: '78%', delta: '+6 pts', positive: true },
        { label: 'Local Lift Captured', value: 'AED 380K', delta: '+22%', positive: true },
        { label: 'False-Positive Rate', value: '9%', delta: '−3 pts', positive: true },
      ],
      trend: { title: 'Anomalies vs Override Accept', subtitle: '6 weeks', xKey: 'week',
        series: [{ key: 'anom', label: 'Anomalies', color: C.warning }, { key: 'acc', label: 'Accept %', color: C.success }],
        data: [
          { week: 'W-5', anom: 22, acc: 65 }, { week: 'W-4', anom: 25, acc: 68 },
          { week: 'W-3', anom: 27, acc: 72 }, { week: 'W-2', anom: 30, acc: 74 },
          { week: 'W-1', anom: 32, acc: 76 }, { week: 'This', anom: 34, acc: 78 },
        ] },
      distribution: { title: 'Signal Sources', subtitle: 'Where local intel comes from', data: [
        { name: 'Weather', value: 28 }, { name: 'Social', value: 22 }, { name: 'Events', value: 18 }, { name: 'Competitor', value: 20 }, { name: 'Traffic', value: 12 },
      ]},
      highlights: [
        { label: 'Best override', value: 'Marathon DXB', hint: '+38% grocery uplift' },
        { label: 'False positive', value: 'Sandstorm alert', hint: 'Filtered by playbook' },
        { label: 'Time to override', value: '42 min', hint: 'Median' },
      ],
    },
    connectors: [
      { id: 'weather', name: 'Weather Feed', description: 'Hyperlocal weather + wind + dust', status: 'connected', endpoint: 'weather://gcc', lastSync: '2026-06-18T10:00:00Z' },
      { id: 'events', name: 'Events Feed', description: 'Local events + holidays + traffic', status: 'connected', endpoint: 'events://calendar', lastSync: '2026-06-18T09:30:00Z' },
      { id: 'social', name: 'Social Listening', description: 'Store-radius social sentiment', status: 'connected', endpoint: 'social://listen', lastSync: '2026-06-18T10:15:00Z' },
    ],
    settings: [
      { title: 'Signals', fields: [
        { key: 'anomFloor', label: 'Anomaly score floor', value: 65, kind: 'number' },
        { key: 'overrideCap', label: 'Override cap (% baseline)', value: 40, kind: 'number' },
      ]},
      { title: 'Automation', fields: [
        { key: 'autoNotify', label: 'Auto-notify replenishment + workforce', value: true, kind: 'toggle' },
      ]},
    ],
  },

  'store-transfer': {
    buckets: {
      breached: { title: 'Cluster Imbalance', meaning: 'One store starves while a sibling holds surplus — no IST staged.', playbook: 'Recommend donor + recipient with lane cost + chain-of-custody.', primaryMetric: 'Cluster cover Δ', slaWindow: 'Move within 12h' },
      'at-risk': { title: 'Divergence Building', meaning: 'Cluster cover gap widening but still within band.', playbook: 'Stage optional IST with courier slot.', primaryMetric: 'Cover gap (days)', slaWindow: 'Act within 24h' },
      optimized: { title: 'Cluster Balanced', meaning: 'All stores in cluster within ±3 days cover.', playbook: 'Maintain; weekly balance review.', primaryMetric: 'Cover gap', slaWindow: 'Monitor only' },
    },
    analytics: {
      headline: 'Inter-store transfer volume, fill, and chain-of-custody',
      kpis: [
        { label: 'IST Fill Rate', value: '96%', delta: '+2 pts', positive: true },
        { label: 'Cluster Cover Gap', value: '2.4 d', delta: '−0.9 d', positive: true },
        { label: 'Custody Exceptions', value: '2', delta: '−4', positive: true },
        { label: 'Cost / Line', value: 'AED 3.20', delta: '−0.40', positive: true },
      ],
      trend: { title: 'Fill vs Cover Gap', subtitle: '6 weeks', xKey: 'week',
        series: [{ key: 'fill', label: 'Fill %', color: C.success }, { key: 'gap', label: 'Gap (days)', color: C.warning }],
        data: [
          { week: 'W-5', fill: 88, gap: 4.6 }, { week: 'W-4', fill: 90, gap: 4.2 },
          { week: 'W-3', fill: 92, gap: 3.6 }, { week: 'W-2', fill: 94, gap: 3.0 },
          { week: 'W-1', fill: 95, gap: 2.7 }, { week: 'This', fill: 96, gap: 2.4 },
        ] },
      distribution: { title: 'IST Volume by Cluster', subtitle: 'Where transfers happen', data: [
        { name: 'Dubai', value: 42 }, { name: 'Riyadh', value: 28 }, { name: 'Jeddah', value: 18 }, { name: 'Kuwait', value: 10 }, { name: 'Doha', value: 6 },
      ]},
      highlights: [
        { label: 'Best cluster', value: 'Dubai', hint: 'Fill 98%' },
        { label: 'Worst gap', value: 'Riyadh Cluster', hint: '4-store variance' },
        { label: 'Value moved', value: 'AED 1.4M', hint: 'Last 30d' },
      ],
    },
    connectors: [
      { id: 'ist-ledger', name: 'IST Ledger', description: 'Inter-store transfer orders and status', status: 'connected', endpoint: 'ist://ledger', lastSync: '2026-06-18T10:10:00Z' },
      { id: 'courier', name: 'Courier & Armoured Bookings', description: 'Slot booking + chain-of-custody manifests', status: 'connected', endpoint: 'courier://bookings', lastSync: '2026-06-18T09:50:00Z' },
      { id: 'cluster-cover', name: 'Cluster Cover Engine', description: 'Cluster-level DOS calculator', status: 'connected', endpoint: 'inventory://cluster-cover', lastSync: '2026-06-18T10:00:00Z' },
    ],
    settings: [
      { title: 'Transfers', fields: [
        { key: 'gapCeiling', label: 'Cluster cover gap ceiling (days)', value: 3, kind: 'number' },
        { key: 'minTransferQty', label: 'Min transfer qty', value: 12, kind: 'number' },
      ]},
      { title: 'Controls', fields: [
        { key: 'highValueDualSign', label: 'Dual-sign high-value transfers', value: true, kind: 'toggle' },
        { key: 'autoBookCourier', label: 'Auto-book courier slot', value: true, kind: 'toggle' },
      ]},
    ],
  },
};

export const getStoreAgentContext = (agentId?: string): StoreAgentContext =>
  storeOpsAgentContext[agentId as StoreAgentId] || storeOpsAgentContext['store-command'];
