export type SupplyBucketId = 'breached' | 'at-risk' | 'optimized';

export interface SupplyChainSignal {
  id: string;
  agentId: string;
  bucket: SupplyBucketId;
  entity: string;          // e.g. SKU, PO, Shipment, Lane, Node
  location: string;        // node / lane / region
  severity: 'critical' | 'high' | 'medium' | 'low';
  metricLabel: string;
  metricValue: string;
  threshold: string;
  confidence: number;
  estimatedImpact: number; // USD
  recommendedOwner: string;
  dueIn: string;
  recommendedAction: string;
  reason: string;
  evidence: string[];
  sources: string[];
  actionTrace: string[];
}

export const supplyBucketMeta: Record<SupplyBucketId, { label: string; description: string; badgeClass: string; panelClass: string }> = {
  breached: {
    label: 'Breached',
    description: 'SLA, cover, cost, or compliance threshold already crossed',
    badgeClass: 'bg-status-danger-bg text-status-danger border-status-danger/30',
    panelClass: 'border-status-danger/30 bg-status-danger-bg/40',
  },
  'at-risk': {
    label: 'At Risk',
    description: 'Agent predicts a breach unless action is taken',
    badgeClass: 'bg-status-warning-bg text-status-warning border-status-warning/30',
    panelClass: 'border-status-warning/30 bg-status-warning-bg/40',
  },
  optimized: {
    label: 'Optimized',
    description: 'Within guardrails; agent continues monitoring',
    badgeClass: 'bg-status-success-bg text-status-success border-status-success/30',
    panelClass: 'border-status-success/30 bg-status-success-bg/40',
  },
};

const mk = (s: SupplyChainSignal): SupplyChainSignal => s;

export const supplyChainSignals: SupplyChainSignal[] = [
  // ── Demand Sensing ────────────────────────────────────────────────
  mk({
    id: 'ds-01', agentId: 'demand-sensing', bucket: 'breached',
    entity: 'SKU 4411 · Almarai Full Cream 2L', location: 'UAE · North Region',
    severity: 'critical', metricLabel: 'Forecast MAPE (last 7d)', metricValue: '34%', threshold: '≤ 15%',
    confidence: 0.94, estimatedImpact: 128000, recommendedOwner: 'Demand Planner · Dairy',
    dueIn: '4h', recommendedAction: 'Re-forecast +22% for next 5 days; notify Replenishment to lift safety stock.',
    reason: 'Heatwave (46°C forecast) + Ramadan iftar prep pulled dairy demand well above baseline.',
    evidence: ['POS velocity +38% WoW at 41 stores', 'NCM weather alert issued 06:00', 'Ramadan calendar week 2'],
    sources: ['POS Data Lake', 'NCM Weather API', 'Promo Calendar'],
    actionTrace: ['06:14 anomaly detected', '06:18 driver isolated (weather+event)', '06:22 forecast updated', '06:23 Replenishment notified'],
  }),
  mk({
    id: 'ds-02', agentId: 'demand-sensing', bucket: 'at-risk',
    entity: 'Category · Ice Cream', location: 'KSA · Riyadh cluster',
    severity: 'high', metricLabel: 'Forecast confidence', metricValue: '68%', threshold: '≥ 85%',
    confidence: 0.81, estimatedImpact: 54000, recommendedOwner: 'Category Planner · Frozen',
    dueIn: '1d', recommendedAction: 'Blend competitor promo signal into next re-forecast run.',
    reason: 'Competitor 30% off ice-cream promo detected; elasticity model shows -12% risk to our baseline.',
    evidence: ['Competitor price scrape 22:10', 'Historical cross-elasticity -0.4'],
    sources: ['Competitor Scrape', 'Elasticity Model'],
    actionTrace: ['22:10 competitor promo detected', '22:14 elasticity applied', '22:16 flagged to planner'],
  }),
  mk({
    id: 'ds-03', agentId: 'demand-sensing', bucket: 'optimized',
    entity: 'Ecom · Electronics', location: 'GCC network',
    severity: 'low', metricLabel: 'Forecast MAPE', metricValue: '9%', threshold: '≤ 15%',
    confidence: 0.97, estimatedImpact: 0, recommendedOwner: 'Ecom Planner',
    dueIn: '—', recommendedAction: 'Continue monitoring; no action.',
    reason: 'Signals stable across POS, ecom, and traffic feeds.',
    evidence: ['7-day MAPE trend flat', 'No competitor deviation'],
    sources: ['POS', 'Ecom Analytics'], actionTrace: ['Monitoring'],
  }),

  // ── Inventory Rebalancing ─────────────────────────────────────────
  mk({
    id: 'ir-01', agentId: 'inventory-rebalancing', bucket: 'breached',
    entity: 'SKU 8821 · Nescafé Gold 200g', location: 'DC-Dubai ↔ DC-Riyadh',
    severity: 'high', metricLabel: 'Cover variance', metricValue: '+42d / -6d', threshold: '±10d',
    confidence: 0.9, estimatedImpact: 78000, recommendedOwner: 'Network Planner',
    dueIn: '12h', recommendedAction: 'Transfer 480 cases DC-Dubai → DC-Riyadh via ground, ETA 36h.',
    reason: 'Dubai overstock post-promo; Riyadh short after unexpected pull-through.',
    evidence: ['DC-Dubai on-hand 42d cover', 'DC-Riyadh cover 6d', 'No open PO to Riyadh'],
    sources: ['WMS', 'Forecast Feed'],
    actionTrace: ['Surplus/shortage matched', 'Transport quote priced', 'Awaiting planner approval'],
  }),
  mk({
    id: 'ir-02', agentId: 'inventory-rebalancing', bucket: 'at-risk',
    entity: 'SKU 5540 · Kids Backpack', location: 'Store 118 ↔ Store 205',
    severity: 'medium', metricLabel: 'Store cover gap', metricValue: '+3w / -0.5w', threshold: '±1w',
    confidence: 0.83, estimatedImpact: 12000, recommendedOwner: 'Regional Ops',
    dueIn: '2d', recommendedAction: 'Store-to-store transfer 40 units via existing van route.',
    reason: 'Back-to-school peak in Riyadh; Dubai store carrying surplus.',
    evidence: ['POS trend', 'Van route schedule available'], sources: ['POS', 'TMS'],
    actionTrace: ['Pair matched', 'Van slot found'],
  }),
  mk({
    id: 'ir-03', agentId: 'inventory-rebalancing', bucket: 'optimized',
    entity: 'Category · Cereals', location: 'Network', severity: 'low',
    metricLabel: 'Cover variance', metricValue: '±4d', threshold: '±10d', confidence: 0.95,
    estimatedImpact: 0, recommendedOwner: 'Network Planner', dueIn: '—',
    recommendedAction: 'No transfers needed.', reason: 'Cover balanced across all nodes.',
    evidence: ['All DCs within band'], sources: ['WMS'], actionTrace: ['Monitoring'],
  }),

  // ── Warehouse Ops ─────────────────────────────────────────────────
  mk({
    id: 'wo-01', agentId: 'warehouse-ops', bucket: 'breached',
    entity: 'Wave W-4471 · Ecom pick', location: 'DC-Dubai · Zone C',
    severity: 'critical', metricLabel: 'Lines/hour', metricValue: '38', threshold: '≥ 65',
    confidence: 0.92, estimatedImpact: 44000, recommendedOwner: 'Floor Supervisor',
    dueIn: '2h', recommendedAction: 'Redeploy 4 pickers from Zone A; delay Wave W-4472 by 30 min.',
    reason: 'Zone C staffed at 60% vs plan; two pickers on break simultaneously.',
    evidence: ['LMS labour roster', 'WMS wave progress -42%', 'Cut-off 18:00'],
    sources: ['WMS', 'LMS'], actionTrace: ['Bottleneck detected 15:04', 'Reallocation drafted'],
  }),
  mk({
    id: 'wo-02', agentId: 'warehouse-ops', bucket: 'at-risk',
    entity: 'Dock D-7 inbound', location: 'DC-Riyadh',
    severity: 'medium', metricLabel: 'Dock utilization', metricValue: '92%', threshold: '≤ 85%',
    confidence: 0.86, estimatedImpact: 9000, recommendedOwner: 'Dock Master',
    dueIn: '3h', recommendedAction: 'Divert 2 inbound trucks to Dock D-9.',
    reason: 'Three carriers arriving in same 30-min window.', evidence: ['Carrier ASN'],
    sources: ['Dock Scheduler'], actionTrace: ['Congestion predicted'],
  }),
  mk({
    id: 'wo-03', agentId: 'warehouse-ops', bucket: 'optimized',
    entity: 'DC-Kuwait overall', location: 'DC-Kuwait', severity: 'low',
    metricLabel: 'Dispatch SLA', metricValue: '99.1%', threshold: '≥ 97%', confidence: 0.98,
    estimatedImpact: 0, recommendedOwner: 'DC Manager', dueIn: '—',
    recommendedAction: 'Maintain.', reason: 'All zones running above plan.',
    evidence: ['SLA trend green 14d'], sources: ['WMS'], actionTrace: ['Monitoring'],
  }),

  // ── Transport Control Tower ───────────────────────────────────────
  mk({
    id: 'tct-01', agentId: 'transport-control-tower', bucket: 'breached',
    entity: 'Shipment SH-88214', location: 'Lane: Jebel Ali → Riyadh',
    severity: 'critical', metricLabel: 'ETA vs promise', metricValue: '+9h late', threshold: '±2h',
    confidence: 0.93, estimatedImpact: 62000, recommendedOwner: 'Transport Planner',
    dueIn: '6h', recommendedAction: 'Switch to Carrier Aramex Express; expedite AED 2.4K, saves AED 62K penalty.',
    reason: 'Sandstorm on E11; primary carrier held at Ghweifat border.',
    evidence: ['Telematics idle 4h', 'Weather alert', 'Border camera feed'],
    sources: ['TMS', 'Telematics', 'NCM'], actionTrace: ['Delay detected', 'Alternatives simulated'],
  }),
  mk({
    id: 'tct-02', agentId: 'transport-control-tower', bucket: 'at-risk',
    entity: 'Consolidation window · Northbound', location: 'DC-Dubai → KSA',
    severity: 'medium', metricLabel: 'Load fill', metricValue: '68%', threshold: '≥ 85%',
    confidence: 0.87, estimatedImpact: 8500, recommendedOwner: 'Transport Planner',
    dueIn: '4h', recommendedAction: 'Consolidate with tomorrow AM wave; saves 1 truck.',
    reason: 'Volume below fill target; extra truck avoidable.',
    evidence: ['TMS load plan'], sources: ['TMS'], actionTrace: ['Fill gap detected'],
  }),
  mk({
    id: 'tct-03', agentId: 'transport-control-tower', bucket: 'optimized',
    entity: 'Lane · Muscat → Dubai', location: 'GCC South', severity: 'low',
    metricLabel: 'OTIF', metricValue: '98.6%', threshold: '≥ 96%', confidence: 0.97,
    estimatedImpact: 0, recommendedOwner: 'Transport Planner', dueIn: '—',
    recommendedAction: 'Maintain.', reason: 'Lane running steady.',
    evidence: ['30d OTIF trend'], sources: ['TMS'], actionTrace: ['Monitoring'],
  }),

  // ── Order Fulfilment ──────────────────────────────────────────────
  mk({
    id: 'of-01', agentId: 'order-fulfilment', bucket: 'breached',
    entity: 'Order #E-2201884', location: 'Ecom · Dubai',
    severity: 'high', metricLabel: 'Promise date', metricValue: '-1d', threshold: '0d',
    confidence: 0.9, estimatedImpact: 340, recommendedOwner: 'OMS Ops',
    dueIn: '2h', recommendedAction: 'Re-source from Store 118 (dark-store) for same-day delivery.',
    reason: 'Primary DC out of stock at cut-off; alternate node has 6 units, 3km from customer.',
    evidence: ['OMS reservation failed', 'Store 118 on-hand 6', 'Carrier slot open'],
    sources: ['OMS', 'Store Inventory'], actionTrace: ['Promise at risk', 'Node re-selected'],
  }),
  mk({
    id: 'of-02', agentId: 'order-fulfilment', bucket: 'at-risk',
    entity: 'Order #E-2201911', location: 'Ecom · Doha',
    severity: 'medium', metricLabel: 'Substitution needed', metricValue: '1 of 4 lines', threshold: '0',
    confidence: 0.78, estimatedImpact: 120, recommendedOwner: 'OMS Ops',
    dueIn: '4h', recommendedAction: 'Offer approved substitute (same brand, larger pack).',
    reason: 'Original SKU stock-out; approved substitute available.',
    evidence: ['OMS stock check', 'Sub-matrix'], sources: ['OMS'],
    actionTrace: ['Sub identified'],
  }),
  mk({
    id: 'of-03', agentId: 'order-fulfilment', bucket: 'optimized',
    entity: 'Ecom · GCC last 24h', location: 'Network', severity: 'low',
    metricLabel: 'Promise kept %', metricValue: '98.4%', threshold: '≥ 97%', confidence: 0.98,
    estimatedImpact: 0, recommendedOwner: 'OMS Ops', dueIn: '—',
    recommendedAction: 'Maintain.', reason: 'Sourcing engine tracking within target.',
    evidence: ['SLA trend'], sources: ['OMS'], actionTrace: ['Monitoring'],
  }),

  // ── Exception Management ──────────────────────────────────────────
  mk({
    id: 'em-01', agentId: 'exception-management', bucket: 'breached',
    entity: 'Exception #EX-9921', location: 'Cross-agent: Supplier + Transport',
    severity: 'critical', metricLabel: 'SLA countdown', metricValue: '01:12:00', threshold: '≥ 04:00',
    confidence: 0.95, estimatedImpact: 155000, recommendedOwner: 'Category Head · Beverages',
    dueIn: '1h', recommendedAction: 'Escalate to VP Supply; approve air-freight override.',
    reason: 'Supplier missed dispatch AND primary carrier delayed — compound breach on top-10 SKU.',
    evidence: ['Dispatch agent alert', 'Transport agent alert', 'Revenue impact model'],
    sources: ['All agents'], actionTrace: ['Deduped 4 alerts → 1', 'Ranked #1 by revenue'],
  }),
  mk({
    id: 'em-02', agentId: 'exception-management', bucket: 'at-risk',
    entity: 'Exception #EX-9928', location: 'Invoice + Contract',
    severity: 'medium', metricLabel: 'SLA countdown', metricValue: '18:00:00', threshold: '≥ 08:00',
    confidence: 0.82, estimatedImpact: 22000, recommendedOwner: 'AP Manager',
    dueIn: '18h', recommendedAction: 'Route to AP with pre-populated dispute pack.',
    reason: 'Invoice variance linked to contract rebate clause.',
    evidence: ['Invoice agent flag', 'Contract clause reference'], sources: ['AP', 'CLM'],
    actionTrace: ['Deduped', 'Assigned'],
  }),
  mk({
    id: 'em-03', agentId: 'exception-management', bucket: 'optimized',
    entity: 'Queue overview', location: 'All domains', severity: 'low',
    metricLabel: 'MTTR', metricValue: '3.2h', threshold: '≤ 6h', confidence: 0.96,
    estimatedImpact: 0, recommendedOwner: 'Ops Manager', dueIn: '—',
    recommendedAction: 'Maintain.', reason: 'Queue within SLA.',
    evidence: ['MTTR trend'], sources: ['All'], actionTrace: ['Monitoring'],
  }),

  // ── Cost-to-Serve ─────────────────────────────────────────────────
  mk({
    id: 'cts-01', agentId: 'cost-to-serve', bucket: 'breached',
    entity: 'Customer · Ecom Tier-3', location: 'Northern Emirates',
    severity: 'high', metricLabel: 'CTS % of revenue', metricValue: '31%', threshold: '≤ 18%',
    confidence: 0.89, estimatedImpact: 96000, recommendedOwner: 'Ecom Ops',
    dueIn: '3d', recommendedAction: 'Raise free-ship threshold from AED 99 → AED 149 for this cluster.',
    reason: 'Small-basket orders driving repeated last-mile trips.',
    evidence: ['Order density map', 'Last-mile cost lane'], sources: ['OMS', 'TMS'],
    actionTrace: ['Attributed', 'Simulated', 'Recommended'],
  }),
  mk({
    id: 'cts-02', agentId: 'cost-to-serve', bucket: 'at-risk',
    entity: 'Lane · DC-Dubai → Northern stores', location: 'UAE North',
    severity: 'medium', metricLabel: 'Load fill', metricValue: '61%', threshold: '≥ 80%',
    confidence: 0.85, estimatedImpact: 14000, recommendedOwner: 'Transport Planner',
    dueIn: '2d', recommendedAction: 'Move from daily to alt-day cadence + consolidation.',
    reason: 'Chronic low-fill causing margin drag.', evidence: ['12-wk fill trend'], sources: ['TMS'],
    actionTrace: ['Pattern detected'],
  }),
  mk({
    id: 'cts-03', agentId: 'cost-to-serve', bucket: 'optimized',
    entity: 'Wholesale channel', location: 'GCC', severity: 'low',
    metricLabel: 'CTS %', metricValue: '11%', threshold: '≤ 15%', confidence: 0.97,
    estimatedImpact: 0, recommendedOwner: 'Sales Ops', dueIn: '—',
    recommendedAction: 'Maintain.', reason: 'Full-truck loads keep CTS low.',
    evidence: ['CTS trend'], sources: ['Finance'], actionTrace: ['Monitoring'],
  }),

  // ── Planner Copilot ───────────────────────────────────────────────
  mk({
    id: 'pc-01', agentId: 'planner-copilot', bucket: 'breached',
    entity: 'Query · "Why did OTIF drop for Almarai last week?"', location: 'Planner: R. Al Zaabi',
    severity: 'medium', metricLabel: 'Explanation ready', metricValue: 'Yes', threshold: '—',
    confidence: 0.91, estimatedImpact: 0, recommendedOwner: 'Planner',
    dueIn: 'Now', recommendedAction: 'Open explanation with linked evidence from 3 agents.',
    reason: 'Root cause spans Supplier Performance, Transport, and Warehouse — Copilot fused all three.',
    evidence: ['Supplier late-dispatch chart', 'Carrier delay log', 'DC dock congestion'],
    sources: ['All agents'], actionTrace: ['NL parsed', 'Grounded', 'Explanation drafted'],
  }),
  mk({
    id: 'pc-02', agentId: 'planner-copilot', bucket: 'at-risk',
    entity: 'What-if · "Move Riyadh safety stock +15%"', location: 'Planner: F. Al Qahtani',
    severity: 'low', metricLabel: 'Simulation ready', metricValue: 'Yes', threshold: '—',
    confidence: 0.88, estimatedImpact: 0, recommendedOwner: 'Planner', dueIn: 'Now',
    recommendedAction: 'Review simulation: +AED 240K WC, +2.1pt in-stock.',
    reason: 'Planner requested tradeoff simulation.', evidence: ['Simulation output'],
    sources: ['Forecast', 'Inventory'], actionTrace: ['Simulated'],
  }),
  mk({
    id: 'pc-03', agentId: 'planner-copilot', bucket: 'optimized',
    entity: 'Planner productivity', location: 'All planners', severity: 'low',
    metricLabel: 'Decisions / planner-day', metricValue: '14', threshold: '≥ 10', confidence: 0.94,
    estimatedImpact: 0, recommendedOwner: 'Ops Manager', dueIn: '—',
    recommendedAction: 'Maintain.', reason: 'Copilot lifting throughput.',
    evidence: ['Usage log'], sources: ['Copilot'], actionTrace: ['Monitoring'],
  }),
];

export const getSignalsForAgent = (agentId: string) =>
  supplyChainSignals.filter((s) => s.agentId === agentId);
