// Per-agent, per-bucket narrative — what "breached / at-risk / optimized" means for THIS agent.

import type { SupplyBucketId } from './supplyChainSignals';

export interface AgentBucketNarrative {
  title: string;       // e.g. "Forecast Miss — Breached"
  meaning: string;     // what this bucket represents in the agent's world
  playbook: string;    // primary agent action for this bucket
  primaryMetric: string;
  slaWindow: string;
}

type AgentBucketMap = Record<SupplyBucketId, AgentBucketNarrative>;

export const supplyChainAgentBuckets: Record<string, AgentBucketMap> = {
  'demand-sensing': {
    breached: { title: 'Forecast Miss', meaning: 'MAPE has crossed the 15% ceiling — planners are flying blind on these SKUs.', playbook: 'Re-forecast with sensed drivers (weather, promo, competitor) and notify Replenishment.', primaryMetric: 'MAPE %', slaWindow: 'Fix within 4h' },
    'at-risk': { title: 'Confidence Slipping', meaning: 'Model confidence < 85% or bias trending outside ±5% — a breach is likely in 24–48h.', playbook: 'Blend fresh signals (competitor scrape, elasticity) and stage a corrective override.', primaryMetric: 'Forecast confidence', slaWindow: 'Act within 1d' },
    optimized: { title: 'Signals Stable', meaning: 'Sensed vs baseline drift is within band; no planner intervention needed.', playbook: 'Continue passive monitoring on POS + weather + promo streams.', primaryMetric: 'MAPE %', slaWindow: 'Monitor only' },
  },
  'inventory-rebalancing': {
    breached: { title: 'Cover Imbalance', meaning: 'DOS gap between two nodes has exceeded ±10 days — real risk of stock-out on one side and dead stock on the other.', playbook: 'Recommend an inter-DC move with lane cost, ETA, and margin protection.', primaryMetric: 'Cover variance (days)', slaWindow: 'Move within 12h' },
    'at-risk': { title: 'Divergence Building', meaning: 'DOS variance widening but still within band; move is optional.', playbook: 'Pair donor + recipient nodes and propose low-cost transfer via existing lanes.', primaryMetric: 'Store / DC cover gap', slaWindow: 'Act within 2d' },
    optimized: { title: 'Network Balanced', meaning: 'All nodes tracking within ±10 days cover; no transfers required.', playbook: 'Hold; keep monitoring DOS every 2h.', primaryMetric: 'Cover variance', slaWindow: 'Monitor only' },
  },
  'warehouse-ops': {
    breached: { title: 'Wave / Dock Bottleneck', meaning: 'Wave punctuality below 95% or dock dwell above 45 min — dispatch cut-off at risk.', playbook: 'Re-sequence waves, redeploy labor, or divert docks.', primaryMetric: 'Lines/hour · Dock dwell', slaWindow: 'Recover within 2h' },
    'at-risk': { title: 'Congestion Building', meaning: 'Zone or dock utilization creeping above 85% — likely bottleneck in 3h.', playbook: 'Pre-emptively divert inbound trucks or shift labor.', primaryMetric: 'Zone / dock utilization', slaWindow: 'Act within 3h' },
    optimized: { title: 'Floor Running Clean', meaning: 'All zones above plan, dispatch SLA green for 14 days.', playbook: 'Maintain; publish shift-close report.', primaryMetric: 'Dispatch SLA %', slaWindow: 'Monitor only' },
  },
  'transport-control-tower': {
    breached: { title: 'Shipment Late', meaning: 'Live ETA has slipped more than 2h past customer promise on an in-transit load.', playbook: 'Simulate alternate carrier / lane and cost the switch vs SLA penalty.', primaryMetric: 'ETA vs promise', slaWindow: 'Resolve within 6h' },
    'at-risk': { title: 'Load / Fill Weakness', meaning: 'Load fill below 85% or lane OTIF trending down — extra trucks or penalties incoming.', playbook: 'Consolidate loads or renegotiate carrier slot for next wave.', primaryMetric: 'Load fill % · Lane OTIF', slaWindow: 'Act within 4h' },
    optimized: { title: 'Lanes Running Steady', meaning: 'OTIF above 96%, ETA accuracy stable across the lane cluster.', playbook: 'Maintain; refresh carrier scorecard weekly.', primaryMetric: 'OTIF %', slaWindow: 'Monitor only' },
  },
  'order-fulfilment': {
    breached: { title: 'Promise Missed', meaning: 'Order will miss customer promise date at current sourcing plan.', playbook: 'Re-source from dark-store / alternate DC or offer approved substitute.', primaryMetric: 'Promise variance', slaWindow: 'Save within 2h' },
    'at-risk': { title: 'Substitution / Split Needed', meaning: 'Original SKU short; substitution or split-ship required to keep promise.', playbook: 'Offer substitute or split with smallest penalty.', primaryMetric: 'Substitution / split rate', slaWindow: 'Act within 4h' },
    optimized: { title: 'Sourcing on Target', meaning: 'Promise-kept % above 97% across GCC ecom + B2B.', playbook: 'Maintain; keep sourcing engine warm.', primaryMetric: 'Promise-kept %', slaWindow: 'Monitor only' },
  },
  'exception-management': {
    breached: { title: 'SLA Burning', meaning: 'Exception acknowledgement or resolution SLA already crossed; compound breach likely spans multiple agents.', playbook: 'Escalate to owner + VP, deduplicate related alerts, run playbook.', primaryMetric: 'SLA countdown', slaWindow: 'Escalate within 1h' },
    'at-risk': { title: 'Aging Exception', meaning: 'Exception open beyond half-life; resolution needed before SLA burn.', playbook: 'Route to owner with pre-populated dispute / resolution pack.', primaryMetric: 'Age in queue', slaWindow: 'Resolve within 18h' },
    optimized: { title: 'Queue Under Control', meaning: 'MTTR under 6h, no aging P1s.', playbook: 'Maintain; run weekly Pareto review.', primaryMetric: 'MTTR', slaWindow: 'Monitor only' },
  },
  'cost-to-serve': {
    breached: { title: 'Margin Erosion', meaning: 'CTS above 18% of revenue on a customer / lane — the business is losing money serving them.', playbook: 'Recommend threshold change, consolidation, or renegotiation.', primaryMetric: 'CTS % of revenue', slaWindow: 'Action within 3d' },
    'at-risk': { title: 'Fill / Density Weak', meaning: 'Chronic low load-fill or thin order density — margin drag building.', playbook: 'Move to alt-day cadence or consolidate lanes.', primaryMetric: 'Load fill % · Density', slaWindow: 'Act within 2d' },
    optimized: { title: 'Channel Healthy', meaning: 'CTS within 15% target; full-truck economics preserved.', playbook: 'Maintain; refresh ABC model daily.', primaryMetric: 'CTS %', slaWindow: 'Monitor only' },
  },
  'planner-copilot': {
    breached: { title: 'Planner Needs Answer', meaning: 'Planner opened a high-priority question; Copilot has grounded an answer ready to review.', playbook: 'Open the explanation with cited evidence from every contributing agent.', primaryMetric: 'Explanation ready', slaWindow: 'Serve now' },
    'at-risk': { title: 'Simulation Pending', meaning: 'Planner requested a what-if; Copilot has drafted the tradeoff for review.', playbook: 'Present simulation with WC + service tradeoff and cite assumptions.', primaryMetric: 'Simulation ready', slaWindow: 'Serve now' },
    optimized: { title: 'Copilot Lifting Throughput', meaning: 'Planner productivity above 10 decisions/day; suggestion acceptance high.', playbook: 'Maintain; keep memory + KB fresh.', primaryMetric: 'Decisions / planner-day', slaWindow: 'Monitor only' },
  },
};

export const getAgentBucketNarrative = (agentId: string, bucketId: SupplyBucketId): AgentBucketNarrative | undefined =>
  supplyChainAgentBuckets[agentId]?.[bucketId];
