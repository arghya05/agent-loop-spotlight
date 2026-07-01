export type StoreAgentId =
  | 'store-command'
  | 'category-intelligence'
  | 'margin-shrinkage'
  | 'checkout'
  | 'store-replenishment'
  | 'planogram'
  | 'customer-engagement'
  | 'workforce'
  | 'freshness-waste'
  | 'promo-execution'
  | 'omnichannel-fulfilment'
  | 'associate-copilot'
  | 'local-demand';

export type StoreBucketId = 'breached' | 'at-risk' | 'optimized';

export interface StoreOpsAgent {
  id: StoreAgentId;
  label: string;
  shortLabel: string;
  icon: string;
  mission: string;
  description: string;
  primaryKpi: string;
  workflow: string[];
}

export interface StoreOpsSignal {
  id: string;
  agentId: StoreAgentId;
  bucket: StoreBucketId;
  storeId: string;
  storeName: string;
  country: string;
  category: 'Grocery' | 'Fashion' | 'Jewellery' | 'Cosmetics' | 'Toys';
  department: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'investigating' | 'fixed' | 'monitoring';
  metricLabel: string;
  metricValue: string;
  threshold: string;
  confidence: number;
  estimatedImpact: number;
  recommendedOwner: string;
  dueIn: string;
  recommendedAction: string;
  reason: string;
  evidence: string[];
  sources: string[];
  actionTrace: string[];
}

export const storeBucketMeta: Record<StoreBucketId, { label: string; description: string; badgeClass: string; panelClass: string }> = {
  breached: {
    label: 'Breached',
    description: 'Policy, SLA, coverage, compliance, or margin threshold already crossed',
    badgeClass: 'bg-status-danger-bg text-status-danger border-status-danger/30',
    panelClass: 'border-status-danger/30 bg-status-danger-bg/40',
  },
  'at-risk': {
    label: 'At Risk',
    description: 'Agent predicts a threshold breach unless store action is taken',
    badgeClass: 'bg-status-warning-bg text-status-warning border-status-warning/30',
    panelClass: 'border-status-warning/30 bg-status-warning-bg/40',
  },
  optimized: {
    label: 'Optimized',
    description: 'Store is within guardrails and agent continues monitoring',
    badgeClass: 'bg-status-success-bg text-status-success border-status-success/30',
    panelClass: 'border-status-success/30 bg-status-success-bg/40',
  },
};

export const storeOpsAgents: StoreOpsAgent[] = [
  {
    id: 'store-command',
    label: 'Store Command Agent',
    shortLabel: 'Command',
    icon: 'Store',
    mission: 'Unifies store health, exceptions, nudges, and escalation governance.',
    description: 'Sense store signals, prioritize breached / at-risk exceptions, assign owners, and notify the field team.',
    primaryKpi: 'Store Health',
    workflow: ['Sense', 'Prioritize', 'Diagnose', 'Assign', 'Notify'],
  },
  {
    id: 'category-intelligence',
    label: 'Category Intelligence Agent',
    shortLabel: 'Category',
    icon: 'Layers',
    mission: 'Applies category-specific operating rules across Grocery, Fashion, Jewellery, Cosmetics, and Toys.',
    description: 'Adjusts thresholds by retail category, promotion calendar, appointment mix, expiry risk, and seasonal peaks.',
    primaryKpi: 'Category Compliance',
    workflow: ['Read Category Context', 'Compare Thresholds', 'Explain Variance', 'Recommend Action', 'Monitor'],
  },
  {
    id: 'margin-shrinkage',
    label: 'Margin & Shrinkage Agent',
    shortLabel: 'Margin/Shrink',
    icon: 'ShieldAlert',
    mission: 'Detects margin leakage, shrink anomalies, refund abuse, and high-value inventory exposure.',
    description: 'Combines POS, stock count, CCTV exception metadata, refund logs, and price override patterns.',
    primaryKpi: 'Leakage Prevented',
    workflow: ['Detect Leakage', 'Correlate Evidence', 'Rank Risk', 'Freeze Exposure', 'Notify LP'],
  },
  {
    id: 'checkout',
    label: 'Checkout Experience Agent',
    shortLabel: 'Checkout',
    icon: 'ShoppingCart',
    mission: 'Maintains queue SLA, POS uptime, payment reliability, and assisted checkout coverage.',
    description: 'Uses footfall, POS lane status, basket mix, and queue cameras to trigger lane and staff actions.',
    primaryKpi: 'Queue SLA',
    workflow: ['Sense Footfall', 'Predict Queue', 'Open Capacity', 'Resolve POS', 'Notify Duty Manager'],
  },
  {
    id: 'store-replenishment',
    label: 'Store Replenishment Agent',
    shortLabel: 'Replenishment',
    icon: 'PackageSearch',
    mission: 'Owns intra-store execution — closes shelf gaps from backroom stock and requests a neighbour-store transfer when backroom is empty.',
    description: 'Works with what is already inside the four walls of the store (shelf + backroom). Escalates to Autonomous Inventory when a new supplier PO is needed, and to Rebalancing when the transfer must cross regions.',
    primaryKpi: 'On-Shelf Availability',
    workflow: ['Forecast Demand', 'Check Shelf', 'Check Backroom', 'Recommend Pick/Transfer', 'Confirm Fill'],
  },
  {
    id: 'planogram',
    label: 'Planogram Compliance Agent',
    shortLabel: 'Planogram',
    icon: 'Map',
    mission: 'Keeps shelf layouts, promotional ends, adjacencies, and brand blocks compliant.',
    description: 'Compares shelf images and task photos against approved planograms and campaign fixtures.',
    primaryKpi: 'Planogram Score',
    workflow: ['Capture Shelf', 'Compare Layout', 'Detect Gap', 'Create Task', 'Verify Photo'],
  },
  {
    id: 'customer-engagement',
    label: 'Customer Engagement Agent',
    shortLabel: 'Engagement',
    icon: 'HeartHandshake',
    mission: 'Improves conversion through appointment, consultation, loyalty, and campaign execution signals.',
    description: 'Links loyalty journeys, appointment bookings, brand events, consultation density, and conversion drops.',
    primaryKpi: 'Conversion Lift',
    workflow: ['Segment Demand', 'Match Campaign', 'Allocate Advisor', 'Send Nudge', 'Measure Conversion'],
  },
  {
    id: 'workforce',
    label: 'Workforce Optimization Agent',
    shortLabel: 'Workforce',
    icon: 'CalendarClock',
    mission: 'Aligns staffing with footfall, skill requirements, security coverage, events, and seasonal hiring peaks.',
    description: 'Optimizes rosters using WFM, attendance, booking density, category skill rules, and holiday surge models.',
    primaryKpi: 'Coverage Fit',
    workflow: ['Forecast Demand', 'Check Skills', 'Detect Gap', 'Recommend Roster', 'Notify Manager'],
  },
  {
    id: 'freshness-waste',
    label: 'Freshness, Waste & Markdown Agent',
    shortLabel: 'Freshness',
    icon: 'Leaf',
    mission: 'Protects margin by acting on expiry risk, sell-through, and food waste in real time.',
    description: 'Identifies products nearing expiry, predicts sell-through, and recommends markdowns, transfers, or donations before waste occurs.',
    primaryKpi: 'Waste %',
    workflow: ['Scan Expiry Dates', 'Predict Sell-Through', 'Recommend Markdown/Transfer', 'Trigger Donation', 'Track Waste'],
  },
  {
    id: 'promo-execution',
    label: 'Promotion Execution Agent',
    shortLabel: 'Promo Exec',
    icon: 'Megaphone',
    mission: 'Ensures every live promo has correct price, signage, display stock, and staff briefing.',
    description: 'Checks that promotions are live in the right stores with correct price, signage, display quantity, replenishment, and staff awareness. Flags promos losing money to execution failure.',
    primaryKpi: 'Promo Compliance',
    workflow: ['Read Promo Calendar', 'Verify Price/Signage', 'Check Display Stock', 'Brief Staff', 'Measure Uplift'],
  },
  {
    id: 'omnichannel-fulfilment',
    label: 'Omnichannel Fulfilment Agent',
    shortLabel: 'Fulfilment',
    icon: 'Truck',
    mission: 'Owns the in-store execution of online orders — pick, pack, substitute, stage, and handover to customer or carrier.',
    description: 'Picks up where the supply-chain Order Fulfilment agent leaves off (sourcing decision made). Runs picker routes, substitutions, ageing, staging, and courier handover for click-and-collect and ship-from-store inside the store.',
    primaryKpi: 'Fulfilment SLA',
    workflow: ['Ingest Orders', 'Optimize Picker Route', 'Recommend Substitutions', 'Notify Customer', 'Track SLA'],
  },
  {
    id: 'associate-copilot',
    label: 'Store Associate Copilot',
    shortLabel: 'Copilot',
    icon: 'Headset',
    mission: 'Puts instant product, policy, and selling answers in every associate\'s hand.',
    description: 'Gives frontline staff instant answers on product location, availability, substitutions, policies, customer queries, and selling prompts through a chat/voice interface.',
    primaryKpi: 'Query Resolution',
    workflow: ['Receive Query', 'Ground in Store Data', 'Suggest Answer/Action', 'Log Outcome', 'Improve Model'],
  },
  {
    id: 'local-demand',
    label: 'Local Demand & Event Intelligence Agent',
    shortLabel: 'Local Demand',
    icon: 'CloudSun',
    mission: 'Turns external local signals into per-store execution moves — display, staffing tweak, micro-promo, endcap change.',
    description: 'Consumes the network forecast from Demand Sensing and layers store-specific weather, holidays, school calendars, nearby events, and competitor activity on top. Does NOT rebuild the base forecast — it activates it locally.',
    primaryKpi: 'Local Sales Lift',
    workflow: ['Ingest External Signals', 'Correlate to Store', 'Activate Local Play', 'Brief Store Manager', 'Measure Lift'],
  },
];

export const storeOpsSignals: StoreOpsSignal[] = [
  // ───────── STORE COMMAND ─────────
  {
    id: 'SC-001', agentId: 'store-command', bucket: 'breached', storeId: 'DXB-014', storeName: 'Dubai Mall Flagship', country: 'UAE', category: 'Fashion', department: 'Storewide', severity: 'critical', status: 'open',
    metricLabel: 'Composite Store Health', metricValue: '62 / 100', threshold: '≥ 80', confidence: 0.92, estimatedImpact: 118000,
    recommendedOwner: 'Faisal A. — Regional Ops Manager, GCC South', dueIn: '2h',
    recommendedAction: 'Open Sev-2 incident room (Teams: DXB-014-WAR-ROOM), assign Checkout + Denim Replenishment owners, and push hourly recovery pulse to RM at :15.',
    reason: 'Composite health fell after 3 sub-KPIs failed in the same 18:30–20:00 footfall spike: queue wait 11.4 min, denim wall OSA 86%, fitting-room conversion −9.8 pts vs 4-wk avg.',
    evidence: ['Queue wait 11.4 min @19:12 (SLA 6 min)', 'Denim Wall OSA dropped 96% → 86% in 70 min', 'Fitting-room conversion 22.1% vs 31.9% L4W', 'SCO Cluster B offline 23 min (incident SCO-DXB-2207)'],
    sources: ['POS Live', 'Footfall Counter (Xovis)', 'Shelf Camera (Trax)', 'Task Manager (Reflexis)'],
    actionTrace: ['Sense: 14 sub-KPIs polled at 5-min cadence', 'Diagnose: 3 independent failures converged in evening peak', 'Recommend: split exception by domain owner', 'Act: war-room checklist + hourly pulse', 'Notify: Faisal A. + Store Manager Reem K. via Teams + SMS'],
  },
  {
    id: 'SC-002', agentId: 'store-command', bucket: 'at-risk', storeId: 'RUH-022', storeName: 'Riyadh Park', country: 'KSA', category: 'Cosmetics', department: 'Storewide', severity: 'high', status: 'monitoring',
    metricLabel: '3-Hour Health Forecast', metricValue: '79 / 100 by 20:00', threshold: '≥ 80', confidence: 0.87, estimatedImpact: 64000,
    recommendedOwner: 'Noura S. — Store Manager', dueIn: '4h',
    recommendedAction: 'Pre-stage 2 beauty advisors from Floor 2 and open Mobile POS #3 & #4 before the Charlotte Tilbury launch at 18:00.',
    reason: 'Charlotte Tilbury launch bookings exceed advisor coverage and payment lanes already at 74% utilization — projected breach by 19:30.',
    evidence: ['CT launch bookings 142 vs roster cap 96 (+48%)', 'Advisor roster −2 specialists vs SOP', 'Payment lane util 74% pre-peak', 'Last similar launch (Dior J\'adore Apr-24) breached at 73% util'],
    sources: ['Booking Calendar (Mindbody)', 'WFM (UKG)', 'POS Lane Telemetry'],
    actionTrace: ['Sense: rising booking + lane util', 'Diagnose: specialist coverage gap matched historical precedent', 'Recommend: pre-stage advisors + mobile POS', 'Act: WFM shift adjust submitted', 'Monitor: 30-min conversion pulse'],
  },
  {
    id: 'SC-003', agentId: 'store-command', bucket: 'optimized', storeId: 'KWT-008', storeName: 'The Avenues — Phase IV', country: 'Kuwait', category: 'Toys', department: 'Storewide', severity: 'low', status: 'monitoring',
    metricLabel: 'Store Health', metricValue: '91 / 100', threshold: '≥ 80', confidence: 0.9, estimatedImpact: 12000,
    recommendedOwner: 'Ahmad R. — Store Manager', dueIn: '24h',
    recommendedAction: 'Continue weekend demo-station monitoring; daily digest at 08:00.',
    reason: 'All 14 sub-KPIs within guardrails; weekend ramp-up plan from last Friday held.',
    evidence: ['Queue avg 4.2 min', 'Demo-station 4/4 staffed', 'LEGO + Hot Wheels above safety stock', 'Refund rate 1.1% (target ≤ 2%)'],
    sources: ['POS', 'WFM', 'Inventory'],
    actionTrace: ['Sense: all healthy', 'Diagnose: no breach pattern', 'Recommend: monitor only', 'Act: none', 'Notify: morning digest'],
  },
  {
    id: 'SC-004', agentId: 'store-command', bucket: 'breached', storeId: 'JED-027', storeName: 'Mall of Arabia — Jeddah', country: 'KSA', category: 'Grocery', department: 'Storewide', severity: 'high', status: 'investigating',
    metricLabel: 'Composite Store Health', metricValue: '71 / 100', threshold: '≥ 80', confidence: 0.88, estimatedImpact: 54000,
    recommendedOwner: 'Tariq H. — Duty Manager', dueIn: '3h',
    recommendedAction: 'Resolve chiller alarm in Aisle 7 (Carrier unit CRT-04), redeploy 2 associates to bagging, and clear 18-min checkout backlog.',
    reason: 'Chiller temperature alarm at 06:42 forced freshness team to pull 11 SKUs; simultaneously, school-run footfall created bagging backlog.',
    evidence: ['Chiller CRT-04 at 8.2°C for 41 min (limit 4°C)', '11 fresh SKUs pulled (incl. labneh 500g)', 'Checkout wait 9.6 min', 'Tickets routed to facilities at 06:55'],
    sources: ['IoT Refrigeration (Emerson)', 'POS', 'Footfall', 'Facilities Helpdesk'],
    actionTrace: ['Sense: temperature breach + queue spike', 'Diagnose: chiller fault cascaded into staffing reallocation', 'Recommend: facilities + bagging redeploy', 'Act: dispatched to Tariq H.', 'Notify: Cat. Lead + Facilities'],
  },

  // ───────── CATEGORY INTELLIGENCE ─────────
  {
    id: 'CI-001', agentId: 'category-intelligence', bucket: 'breached', storeId: 'DXB-031', storeName: 'Mirdif City Centre', country: 'UAE', category: 'Grocery', department: 'Fresh Produce', severity: 'critical', status: 'open',
    metricLabel: 'Expiry Waste Risk (Berries)', metricValue: '14.6%', threshold: '≤ 6%', confidence: 0.91, estimatedImpact: 46000,
    recommendedOwner: 'Hala M. — Fresh Category Lead', dueIn: '3h',
    recommendedAction: 'Move 26 punnets of strawberries + 18 of blueberries to 30% markdown zone; cut tomorrow\'s Bakkavor inbound by 18 crates.',
    reason: 'Promo-driven inbound stayed at peak volume after Eid Al Adha campaign ended — sell-through fell 31% but PO had already shipped.',
    evidence: ['Strawberry sell-through 31% below F\'cast (last 48h)', '26 crates expire ≤36h (SKU 7842-STR-250)', 'Eid promo flag expired 2024-06-18 23:59', 'Bakkavor PO 4421 still scheduled for 06:00 delivery'],
    sources: ['POS', 'Freshness Tracker (Wasteless)', 'Promo Calendar (RPM)', 'Vendor EDI'],
    actionTrace: ['Read Category Context: Grocery expiry guardrails', 'Compare: waste risk 14.6% > 6%', 'Explain: lagging PO after promo end', 'Recommend: markdown + inbound cut', 'Monitor: hourly spoilage f\'cast'],
  },
  {
    id: 'CI-002', agentId: 'category-intelligence', bucket: 'at-risk', storeId: 'JED-011', storeName: 'Red Sea Mall — Jeddah', country: 'KSA', category: 'Jewellery', department: 'Fine Jewellery (Damas)', severity: 'high', status: 'monitoring',
    metricLabel: 'Cleared Specialist Coverage', metricValue: '1 advisor on floor', threshold: '≥ 2 cleared advisors', confidence: 0.89, estimatedImpact: 83000,
    recommendedOwner: 'Mohammed Q. — Jewellery Floor Manager', dueIn: '5h',
    recommendedAction: 'Pull cleared specialist Rania B. from Watch Counter for 18:00–21:00 appointment block; backfill watch with assistant.',
    reason: 'Jewellery SOP requires 2 security-cleared advisors during VIP appointment hours; 1 called in sick (Khaled M.) — 9 bookings already confirmed.',
    evidence: ['9 VIP appointments confirmed 18:00–21:00', 'Only 1 cleared advisor scheduled (Rania B.)', 'Avg ticket on cleared-only nights drops 34%', 'Khaled M. flagged sick at 13:11'],
    sources: ['Appointment Book (Salesforce)', 'WFM Skills Matrix', 'Security Clearance Roster'],
    actionTrace: ['Read Category Context: Jewellery SOP A-4', 'Compare: 1 < 2 cleared', 'Explain: sick call + booking surge', 'Recommend: temporary reassignment', 'Monitor: appointment wait'],
  },
  {
    id: 'CI-003', agentId: 'category-intelligence', bucket: 'breached', storeId: 'DOH-012', storeName: 'Villaggio Mall — Doha', country: 'Qatar', category: 'Fashion', department: 'Women\'s Denim', severity: 'high', status: 'open',
    metricLabel: 'Size-Curve Availability (M/L)', metricValue: '78%', threshold: '≥ 95%', confidence: 0.9, estimatedImpact: 39000,
    recommendedOwner: 'Layla F. — Fashion Cat. Lead', dueIn: '4h',
    recommendedAction: 'Trigger emergency size-curve replen of 84 units (M+L slim straight) from RDC Doha; reserve walk-in fitting-room slot.',
    reason: 'Mid-summer denim refresh shifted demand to M/L; auto-replen still tuned to S/XS ratio from spring planogram.',
    evidence: ['M+L sell-through 142% of plan', 'S+XS sell-through 71%', 'Auto-replen ratio: 35/35/20/10 (XS/S/M/L) — outdated', 'Fitting-room abandonment +12 pts'],
    sources: ['POS by Size', 'Auto-Replen Engine', 'Fitting-Room Sensor'],
    actionTrace: ['Read Category Context: size-curve drift rule', 'Compare: 78% < 95%', 'Explain: ratio config stale', 'Recommend: emergency pack + ratio update', 'Monitor: 24h sell-through'],
  },
  {
    id: 'CI-004', agentId: 'category-intelligence', bucket: 'optimized', storeId: 'AUH-006', storeName: 'Yas Mall', country: 'UAE', category: 'Toys', department: 'Hot Wheels Endcap', severity: 'low', status: 'monitoring',
    metricLabel: 'Promo Compliance', metricValue: '97%', threshold: '≥ 92%', confidence: 0.93, estimatedImpact: 8000,
    recommendedOwner: 'Saif K. — Toys Cat. Lead', dueIn: '24h',
    recommendedAction: 'Maintain; rotate stock 09:00 daily during school holiday.',
    reason: 'Endcap aligned to campaign; sell-through tracking 8% above forecast.',
    evidence: ['Endcap photo match 97%', 'Sell-through +8% vs F\'cast', 'No stock-outs in last 72h'],
    sources: ['Shelf Camera', 'POS', 'Campaign Calendar'],
    actionTrace: ['Read Category Context', 'Compare: above threshold', 'Explain: aligned execution', 'Recommend: maintain', 'Monitor: daily'],
  },

  // ───────── MARGIN & SHRINKAGE ─────────
  {
    id: 'MS-001', agentId: 'margin-shrinkage', bucket: 'breached', storeId: 'DOH-004', storeName: 'Doha Festival City', country: 'Qatar', category: 'Jewellery', department: 'Gold Counter (Joyalukkas)', severity: 'critical', status: 'open',
    metricLabel: 'Cycle-Count Variance', metricValue: '−$72,400', threshold: '≤ ±$10K', confidence: 0.94, estimatedImpact: 72400,
    recommendedOwner: 'Anil V. — Regional Loss Prevention', dueIn: '1h',
    recommendedAction: 'Freeze all gold counter transfers (RFID gate G-04), initiate 100% cycle count, pull CCTV between 14:20–17:45 for SKUs JK-22K-117 to JK-22K-121.',
    reason: 'POS sales, RFID safe-transfer log, and cycle count do not reconcile for 5 high-value SKUs; 2 manual price overrides recorded by cashier ID 8814 in same shift.',
    evidence: ['5 SKUs unaccounted (combined $72.4K)', 'No RFID exit scan for JK-22K-119', 'Manual override −18% on JK-22K-117 (cashier 8814)', 'CCTV exception flag at 16:42 (counter unattended)'],
    sources: ['POS', 'RFID Safe Log (Impinj)', 'Cycle Count', 'CCTV Events (Avigilon)', 'Cashier Audit Log'],
    actionTrace: ['Detect: variance > guardrail', 'Correlate: missing RFID + override pattern', 'Rank: critical, single shift', 'Freeze: gate G-04 closed', 'Notify: Anil V. + Store GM + Compliance'],
  },
  {
    id: 'MS-002', agentId: 'margin-shrinkage', bucket: 'at-risk', storeId: 'DXB-014', storeName: 'Dubai Mall Flagship', country: 'UAE', category: 'Fashion', department: 'Footwear', severity: 'medium', status: 'monitoring',
    metricLabel: 'Refund Override Rate (Lane 7)', metricValue: '7.8%', threshold: '≤ 4%', confidence: 0.82, estimatedImpact: 28000,
    recommendedOwner: 'Reem K. — Store Manager', dueIn: '8h',
    recommendedAction: 'Enforce manager-PIN for all footwear refunds > AED 200 on Lane 7 for next 7 days; review cashier 4421 with HR.',
    reason: 'Cashier 4421 involved in 62% of overrides this week; 78% tied to discounted footwear during End-of-Season sale.',
    evidence: ['Lane 7 override rate 7.8% (peer avg 3.1%)', 'Cashier 4421 in 13/21 overrides', '78% of returns: footwear marked >40% off', 'Pattern absent in pre-sale period'],
    sources: ['POS Returns', 'Cashier Audit Log', 'Promo Rules Engine'],
    actionTrace: ['Detect: rate rising 3 days', 'Correlate: cashier + SKU cluster', 'Rank: medium', 'Guardrail: PIN enforce', 'Notify: Reem K. + HR business partner'],
  },
  {
    id: 'MS-003', agentId: 'margin-shrinkage', bucket: 'breached', storeId: 'RUH-019', storeName: 'Granada Mall — Riyadh', country: 'KSA', category: 'Cosmetics', department: 'Fragrance', severity: 'high', status: 'open',
    metricLabel: 'Tester-to-Sales Conversion', metricValue: '1 sale per 38 tester sprays', threshold: '≥ 1 per 18', confidence: 0.86, estimatedImpact: 21500,
    recommendedOwner: 'Sara T. — Beauty Floor Lead', dueIn: '6h',
    recommendedAction: 'Lock-cap 6 hero testers (Dior Sauvage 100ml, Bleu de Chanel 100ml +4) and switch to advisor-only spray during peak; investigate sample diversion.',
    reason: 'Tester depletion outpacing sales by 2.1× — historical pattern for diversion to grey-market resellers around the Hajj travel period.',
    evidence: ['Tester refills 14 vs sales 6 (Dior Sauvage)', 'Same pattern detected June-23 (resolved by lock-cap)', '2 staff offboarded last week from this counter', 'Mystery shopper noted no advisor present 14:00–15:30'],
    sources: ['Tester Refill Log', 'POS', 'Mystery Shopper Report', 'HR Offboarding'],
    actionTrace: ['Detect: depletion ratio breach', 'Correlate: historical pattern + staffing gap', 'Rank: high', 'Mitigate: lock-cap + advisor-only', 'Notify: Sara T. + LP'],
  },
  {
    id: 'MS-004', agentId: 'margin-shrinkage', bucket: 'optimized', storeId: 'MCT-003', storeName: 'Muscat Grand Mall', country: 'Oman', category: 'Grocery', department: 'Alcohol-Free Wine Aisle', severity: 'low', status: 'monitoring',
    metricLabel: 'Shrink %', metricValue: '0.42%', threshold: '≤ 1.0%', confidence: 0.91, estimatedImpact: 4000,
    recommendedOwner: 'Yusuf B. — Store Manager', dueIn: '24h',
    recommendedAction: 'Maintain RFID gate + weekly cycle count.',
    reason: 'Within guardrails; no override anomalies.',
    evidence: ['Shrink 0.42% (trailing 30d)', 'No override flags', 'Cycle count variance ±$340'],
    sources: ['POS', 'RFID', 'Cycle Count'],
    actionTrace: ['Detect: within threshold', 'Correlate: clean', 'Rank: low', 'Maintain', 'Notify: weekly digest'],
  },

  // ───────── CHECKOUT EXPERIENCE ─────────
  {
    id: 'CO-001', agentId: 'checkout', bucket: 'breached', storeId: 'AUH-006', storeName: 'Yas Mall', country: 'UAE', category: 'Grocery', department: 'Front End (Lanes 1–14 + SCO A/B)', severity: 'critical', status: 'open',
    metricLabel: 'Avg Queue Wait', metricValue: '12.2 min', threshold: '≤ 6 min', confidence: 0.93, estimatedImpact: 57000,
    recommendedOwner: 'Khalid N. — Duty Manager', dueIn: '30m',
    recommendedAction: 'Open Lanes 11, 12, 13 (assisted); pull bagging support from Aisle 4; reboot SCO Cluster B (incident SCO-AUH-1188); push "skip-the-queue" nudge to 240 loyalty app users in store.',
    reason: 'Footfall 41% above forecast (school dismissal + bus arrival) coincided with SCO Cluster B failure at 17:14; only 4 of 9 assisted lanes were open.',
    evidence: ['Queue camera estimate 12.2 min', 'SCO Cluster B offline 23 min', 'Footfall 1,840/hr vs F\'cast 1,305', 'Cart abandonment at door +18%'],
    sources: ['Queue Camera (Xovis)', 'POS Lane Status', 'Footfall', 'Loyalty App Push'],
    actionTrace: ['Sense: queue + lane', 'Predict: abandonment risk', 'Open Capacity: 3 assisted lanes', 'Resolve POS: SCO reboot dispatched', 'Notify: Khalid N. via radio + Teams'],
  },
  {
    id: 'CO-002', agentId: 'checkout', bucket: 'optimized', storeId: 'MCT-003', storeName: 'Muscat Grand Mall', country: 'Oman', category: 'Cosmetics', department: 'Beauty Checkout', severity: 'low', status: 'monitoring',
    metricLabel: 'Checkout SLA', metricValue: '3.8 min', threshold: '≤ 6 min', confidence: 0.88, estimatedImpact: 9000,
    recommendedOwner: 'Mariam J. — Beauty Lead', dueIn: '24h',
    recommendedAction: 'Keep 2 Mobile POS assigned to consultation desks during Estée Lauder event.',
    reason: 'Mobile POS capacity matched consultation density; payment success rate 99.6%.',
    evidence: ['Avg wait 3.8 min', 'Mobile POS util 52%', '0 payment failures last 2h'],
    sources: ['POS', 'Booking Calendar'],
    actionTrace: ['Sense: stable', 'Predict: stable', 'Maintain capacity', 'Monitor', 'Notify: digest'],
  },
  {
    id: 'CO-003', agentId: 'checkout', bucket: 'at-risk', storeId: 'KWT-008', storeName: 'The Avenues — Phase IV', country: 'Kuwait', category: 'Toys', department: 'Front End', severity: 'high', status: 'monitoring',
    metricLabel: 'Tap-to-Pay Decline Rate (KNET)', metricValue: '6.4%', threshold: '≤ 2%', confidence: 0.84, estimatedImpact: 17000,
    recommendedOwner: 'Hussain A. — IT Site Lead', dueIn: '2h',
    recommendedAction: 'Failover Lane 3 & 5 to backup KNET acquirer (Burgan); ticket merchant services; offer Apple Pay as primary on customer-facing screen.',
    reason: 'KNET acquirer (NBK) intermittent timeouts started 11:48; affecting 2 lanes; weekend gift-buying peak begins 16:00.',
    evidence: ['KNET decline 6.4% (peer avg 1.7%)', 'NBK acquirer status page: degraded', 'Lane 3 & 5 affected (Verifone P400)', 'Customer complaints in app: 4 in 30 min'],
    sources: ['Payment Gateway Logs', 'Acquirer Status API', 'POS Telemetry', 'Customer Feedback'],
    actionTrace: ['Sense: decline spike', 'Predict: weekend peak load', 'Open Capacity: backup acquirer', 'Resolve POS: failover routing', 'Notify: Hussain A. + Finance'],
  },

  // ───────── STORE REPLENISHMENT ─────────
  {
    id: 'SR-001', agentId: 'store-replenishment', bucket: 'breached', storeId: 'DXB-014', storeName: 'Dubai Mall Flagship', country: 'UAE', category: 'Fashion', department: 'Denim Wall (Levi\'s + Tommy)', severity: 'high', status: 'open',
    metricLabel: 'On-Shelf Availability', metricValue: '86%', threshold: '≥ 96%', confidence: 0.9, estimatedImpact: 68000,
    recommendedOwner: 'Omar L. — Replenishment Lead', dueIn: '2h',
    recommendedAction: 'Pick 164 units (Levi\'s 501 M/L, Tommy Slim 32/32) from backroom Zone B; transfer 48 units of Levi\'s 511 size 30/32 from MOE flagship via 18:00 inter-store van.',
    reason: 'Evening sell-through outpaced replen task SLA; 3 backroom tasks aged > 90 min after associate reassigned to fitting room.',
    evidence: ['Denim Wall OSA 86%', '164 units in backroom Zone B', '3 replen tasks aged 96/118/134 min', 'MOE has +48 units same SKU'],
    sources: ['POS Velocity', 'Backroom Stock (RFID)', 'Shelf Camera (Trax)', 'Task Manager (Reflexis)'],
    actionTrace: ['Forecast: evening demand', 'Check Shelf: gaps confirmed', 'Check Backroom: stock present', 'Recommend: pick + IST', 'Confirm: photo verification @ 19:30'],
  },
  {
    id: 'SR-002', agentId: 'store-replenishment', bucket: 'at-risk', storeId: 'KWT-008', storeName: 'The Avenues — Phase IV', country: 'Kuwait', category: 'Toys', department: 'Demo Hero SKUs', severity: 'high', status: 'monitoring',
    metricLabel: 'Weekend Days-of-Cover', metricValue: '1.3 days', threshold: '≥ 2.5 days', confidence: 0.86, estimatedImpact: 39000,
    recommendedOwner: 'Ahmad R. — Store Manager', dueIn: '6h',
    recommendedAction: 'Approve IST of 96 units (LEGO Technic 42143, Hot Wheels Track Builder 6-pk) from KWT-002 Salhiya before Thursday close.',
    reason: 'School-holiday traffic forecast +34%; current cover for 2 hero SKUs below safety; nearby store has excess.',
    evidence: ['School holiday f\'cast +34%', 'LEGO 42143 cover 1.1 days', 'Hot Wheels 6-pk cover 1.4 days', 'KWT-002 has +142 units combined'],
    sources: ['POS Forecast', 'Inventory', 'School Calendar (MoE Kuwait)'],
    actionTrace: ['Forecast: holiday spike', 'Check Shelf: cover low', 'Check Network: excess found', 'Recommend: IST', 'Monitor: Fri AM cover'],
  },
  {
    id: 'SR-003', agentId: 'store-replenishment', bucket: 'breached', storeId: 'JED-027', storeName: 'Mall of Arabia — Jeddah', country: 'KSA', category: 'Grocery', department: 'Dairy (Almarai + Al Safi)', severity: 'critical', status: 'open',
    metricLabel: 'Phantom Stock Gap', metricValue: '12 SKUs showing on hand but shelf-empty', threshold: '0', confidence: 0.92, estimatedImpact: 23000,
    recommendedOwner: 'Tariq H. — Duty Manager', dueIn: '1h',
    recommendedAction: 'Walk Aisle 4 & 5 with handheld; reconcile RF count for 12 SKUs (Almarai Full Cream 2L lead); push immediate pick from cold backroom.',
    reason: 'System shows stock but shelf camera + RF picks confirm gaps; likely cold-backroom misplacement after early-morning delivery.',
    evidence: ['12 SKUs: system 240+ units, shelf <10', 'Shelf cam confirms gap for 9/12', 'Delivery received 05:40 (Almarai truck 4421)', 'Backroom temp log: door opened 11×'],
    sources: ['ERP On-Hand', 'Shelf Camera', 'Backroom RFID', 'Receiving Log'],
    actionTrace: ['Forecast: AM demand', 'Check Shelf: gaps', 'Check Backroom: likely misplaced', 'Recommend: walk + reconcile', 'Confirm: 30-min re-scan'],
  },

  // ───────── PLANOGRAM COMPLIANCE ─────────
  {
    id: 'PG-001', agentId: 'planogram', bucket: 'breached', storeId: 'RUH-022', storeName: 'Riyadh Park', country: 'KSA', category: 'Cosmetics', department: 'Brand Event Bay (Charlotte Tilbury)', severity: 'high', status: 'open',
    metricLabel: 'Planogram Match Score', metricValue: '71%', threshold: '≥ 92%', confidence: 0.88, estimatedImpact: 51000,
    recommendedOwner: 'Layla M. — Visual Merchandising Lead', dueIn: '3h',
    recommendedAction: 'Reset hero bay to approved CT-launch planogram v3.2: re-add Pillow Talk lipstick block (12 facings), reorder testers L→R by shade family, upload verification photo to VM app.',
    reason: 'Pillow Talk hero block missing; testers in random sequence; campaign launch in 4h with brand auditor visiting tomorrow.',
    evidence: ['Photo match 71% (TraxRetail score)', 'Pillow Talk block 0/12 facings', 'Tester order: shade chaos', 'Brand auditor visit confirmed Wed 11:00'],
    sources: ['Shelf Camera (Trax)', 'DAM Planogram (Adobe)', 'Campaign Calendar', 'Auditor Schedule'],
    actionTrace: ['Capture: 09:14 shelf photo', 'Compare: −21 pts vs approved', 'Detect: missing hero + tester sequence', 'Create Task: VM reset (Reflexis #PG-RUH-8842)', 'Verify: photo upload by 17:00'],
  },
  {
    id: 'PG-002', agentId: 'planogram', bucket: 'optimized', storeId: 'JED-011', storeName: 'Red Sea Mall — Jeddah', country: 'KSA', category: 'Jewellery', department: 'Watch Wall (Rolex + Tudor)', severity: 'low', status: 'monitoring',
    metricLabel: 'Planogram Match Score', metricValue: '96%', threshold: '≥ 92%', confidence: 0.91, estimatedImpact: 15000,
    recommendedOwner: 'Mohammed Q. — VM Lead', dueIn: '24h',
    recommendedAction: 'Maintain verified layout during weekend VIP appointments.',
    reason: 'High-value adjacency, lighting (4000K confirmed), and security-case sequence all match guidance.',
    evidence: ['Match 96%', 'VIP fixture verified', 'No blocked sightlines (CCTV scan)'],
    sources: ['Shelf Camera', 'VM App', 'CCTV'],
    actionTrace: ['Capture: verified photo', 'Compare: above threshold', 'Detect: no gap', 'Maintain', 'Monitor: daily'],
  },
  {
    id: 'PG-003', agentId: 'planogram', bucket: 'at-risk', storeId: 'DXB-031', storeName: 'Mirdif City Centre', country: 'UAE', category: 'Grocery', department: 'Cereal Aisle (Kellogg\'s Endcap)', severity: 'medium', status: 'monitoring',
    metricLabel: 'Endcap Adjacency Compliance', metricValue: '83%', threshold: '≥ 90%', confidence: 0.83, estimatedImpact: 11000,
    recommendedOwner: 'Hala M. — Cat. Lead', dueIn: '8h',
    recommendedAction: 'Move Coco Pops 375g to eye-level shelf (currently bottom); restore Nesquik adjacency removed during overnight stock.',
    reason: 'Overnight stocker shifted SKUs to fill gaps; broke brand block + kid-eye-level rule.',
    evidence: ['Adjacency score 83%', 'Coco Pops at 0.4m (should be 1.2m)', 'Nesquik missing from co-merch bay', 'Photo timestamp 03:42 (stocker shift)'],
    sources: ['Shelf Camera', 'DAM Planogram', 'Stocker Log'],
    actionTrace: ['Capture: AM shelf photo', 'Compare: −7 pts', 'Detect: SKU displaced', 'Create Task: floor reset', 'Verify: 14:00 photo'],
  },

  // ───────── CUSTOMER ENGAGEMENT ─────────
  {
    id: 'CE-001', agentId: 'customer-engagement', bucket: 'breached', storeId: 'RUH-022', storeName: 'Riyadh Park', country: 'KSA', category: 'Cosmetics', department: 'Beauty Studio (CT Launch)', severity: 'high', status: 'open',
    metricLabel: 'Event Conversion', metricValue: '18.4%', threshold: '≥ 28%', confidence: 0.85, estimatedImpact: 74000,
    recommendedOwner: 'Noura S. — Beauty Advisor Lead', dueIn: '2h',
    recommendedAction: 'Trigger 24h appointment reminder via WhatsApp Business to 88 unconfirmed bookings; reassign 2 advisors from Aisle 12 to consultation desk; offer 15-min express makeover to walk-ins.',
    reason: 'Bookings high but reminder completion only 54% and advisor coverage short by 2 — drop-offs cluster between 19:00–20:30.',
    evidence: ['Conversion −9.6 pts vs target', 'Reminder send 88/162 (54%)', '2 advisors absent vs roster', 'Drop-off heatmap: 19:00–20:30'],
    sources: ['Loyalty CRM (Salesforce)', 'Booking Calendar (Mindbody)', 'WhatsApp Business API', 'WFM'],
    actionTrace: ['Segment: booked + intent', 'Match: CT launch journey', 'Allocate: advisors short', 'Send Nudge: 88 WhatsApp reminders', 'Measure: 30-min conversion'],
  },
  {
    id: 'CE-002', agentId: 'customer-engagement', bucket: 'at-risk', storeId: 'MCT-003', storeName: 'Muscat Grand Mall', country: 'Oman', category: 'Fashion', department: 'Women Occasionwear', severity: 'medium', status: 'monitoring',
    metricLabel: 'High-Intent Loyalty Churn Risk', metricValue: '22%', threshold: '≤ 15%', confidence: 0.81, estimatedImpact: 34000,
    recommendedOwner: 'Fatima R. — CRM Manager', dueIn: '12h',
    recommendedAction: 'Send personalized 15% offer + free stylist booking to 420 high-intent loyalty members who viewed Eid occasionwear ≥3× without purchase in 14d.',
    reason: 'Repeat browse without purchase after recent price uplift on Eid collection; segment matches last Ramadan\'s churn cohort.',
    evidence: ['Wishlist abandonment +18%', '420 members viewed ≥3× post-price-change', 'Repeat store visits w/o purchase: 134', 'Cohort match: Ramadan-24 churners (78%)'],
    sources: ['Loyalty CRM', 'Digital Browse (Adobe Analytics)', 'POS', 'Pricing Engine'],
    actionTrace: ['Segment: 420 high-intent', 'Match: Eid occasionwear journey', 'Allocate: stylist slots', 'Send Nudge: offer email + app push', 'Measure: 7-day conversion'],
  },
  {
    id: 'CE-003', agentId: 'customer-engagement', bucket: 'breached', storeId: 'DXB-014', storeName: 'Dubai Mall Flagship', country: 'UAE', category: 'Jewellery', department: 'VIP Salon', severity: 'high', status: 'investigating',
    metricLabel: 'VIP Appointment Show Rate', metricValue: '61%', threshold: '≥ 85%', confidence: 0.87, estimatedImpact: 92000,
    recommendedOwner: 'Reem K. — VIP Relations', dueIn: '4h',
    recommendedAction: 'Personal call from VIP Relations to 14 no-shows in last 5 days; offer chauffeur pickup; reconfirm tomorrow\'s 9 appointments by 19:00.',
    reason: 'VIP show rate dropped after move to digital-only reminders; high-value clientele prefers personal confirmation calls.',
    evidence: ['Show rate 61% (was 87% pre-Apr)', '14 no-shows in 5d', 'Auto-reminder open rate 38%', 'Top 5 VIPs unreachable via email'],
    sources: ['Appointment Book', 'VIP CRM', 'Email Engagement', 'Loyalty Tier Data'],
    actionTrace: ['Segment: VIP tier', 'Match: appointment journey', 'Allocate: VIP Relations', 'Send Nudge: personal call', 'Measure: show rate'],
  },

  // ───────── WORKFORCE OPTIMIZATION ─────────
  {
    id: 'WF-001', agentId: 'workforce', bucket: 'breached', storeId: 'JED-011', storeName: 'Red Sea Mall — Jeddah', country: 'KSA', category: 'Jewellery', department: 'Fine Jewellery', severity: 'critical', status: 'open',
    metricLabel: 'Security-Cleared Coverage', metricValue: '1 of 2 required', threshold: '100% during VIP block', confidence: 0.93, estimatedImpact: 92000,
    recommendedOwner: 'Khalid F. — Workforce Planner', dueIn: '1h',
    recommendedAction: 'Call in cleared associate Yasser N. (off-day, paid OT @1.5×); shift Rania B. lunch from 13:30 → 12:30; notify VIP Relations to brief incoming clients on advisor handoff.',
    reason: 'SOP A-4 requires 2 cleared staff during VIP block; Khaled M. sick call at 13:11 leaves 1 cleared associate for 6 confirmed appointments.',
    evidence: ['Cleared on floor: 1 (Rania B.)', '6 VIP appointments 14:00–17:00', 'Khaled M. sick (Bradford 12)', 'Lunch overlap 13:30–14:30'],
    sources: ['WFM (UKG)', 'Attendance (Kronos)', 'Appointment Book', 'Security Clearance Roster'],
    actionTrace: ['Forecast: VIP demand', 'Check Skills: cleared gap', 'Detect Gap: peak breach', 'Recommend Roster: call-in + break shift', 'Notify: Khalid F. + Store GM'],
  },
  {
    id: 'WF-002', agentId: 'workforce', bucket: 'at-risk', storeId: 'KWT-008', storeName: 'The Avenues — Phase IV', country: 'Kuwait', category: 'Toys', department: 'Demo Station', severity: 'high', status: 'monitoring',
    metricLabel: 'Demo-Trained Coverage', metricValue: '2 of 4 required', threshold: '≥ 4 during holiday peak', confidence: 0.87, estimatedImpact: 44000,
    recommendedOwner: 'Mariam H. — HR Planner', dueIn: '10h',
    recommendedAction: 'Activate seasonal hire pool (3 candidates pre-screened, JBT certified); schedule 2 for Fri-Sat 14:00–22:00; backfill onboarding video tomorrow 09:00.',
    reason: 'School holiday +39% traffic forecast; demo conversion drops 28% when coverage <4.',
    evidence: ['Holiday f\'cast +39%', 'Demo-trained scheduled: 2', 'Conversion @2 staff: 11% (vs 39% @4)', '3 seasonal candidates ready'],
    sources: ['WFM', 'School Calendar', 'POS Demo Conversion', 'Seasonal Hire Pool (Mercer)'],
    actionTrace: ['Forecast: holiday demand', 'Check Skills: trained gap', 'Detect Gap: weekend short', 'Recommend Roster: activate pool', 'Notify: Mariam H. + Store Mgr'],
  },
  {
    id: 'WF-003', agentId: 'workforce', bucket: 'breached', storeId: 'AUH-006', storeName: 'Yas Mall', country: 'UAE', category: 'Grocery', department: 'Front End', severity: 'high', status: 'open',
    metricLabel: 'Cashier-to-Footfall Ratio', metricValue: '1 : 142', threshold: '≤ 1 : 90 at peak', confidence: 0.9, estimatedImpact: 38000,
    recommendedOwner: 'Khalid N. — Duty Manager', dueIn: '1h',
    recommendedAction: 'Pull 3 floor associates with cashier certification (Aya M., Jamal R., Sana P.) to lanes 11–13 for 17:00–20:00; defer Aisle 4 reset to overnight.',
    reason: 'Footfall surge + scheduled break window collision; only 5 cashiers on for 710/hr footfall.',
    evidence: ['Cashiers on: 5', 'Footfall: 710/hr (peak)', '3 certified floor associates available', 'Reset task SLA flexible'],
    sources: ['WFM', 'Footfall', 'Skills Matrix', 'Task Manager'],
    actionTrace: ['Forecast: peak surge', 'Check Skills: certified floor pool', 'Detect Gap: ratio breach', 'Recommend Roster: redeploy', 'Notify: Khalid N. via radio'],
  },
  {
    id: 'WF-004', agentId: 'workforce', bucket: 'optimized', storeId: 'DOH-012', storeName: 'Villaggio Mall — Doha', country: 'Qatar', category: 'Fashion', department: 'Storewide', severity: 'low', status: 'monitoring',
    metricLabel: 'Schedule Adherence', metricValue: '97.2%', threshold: '≥ 95%', confidence: 0.92, estimatedImpact: 6000,
    recommendedOwner: 'Layla F. — Store Manager', dueIn: '24h',
    recommendedAction: 'Maintain; weekly skills refresh Sunday 10:00.',
    reason: 'Schedule adherence + skill coverage within target.',
    evidence: ['Adherence 97.2%', 'No-shows: 0 this week', 'Skill coverage 100%'],
    sources: ['WFM', 'Attendance'],
    actionTrace: ['Forecast: stable', 'Check: clean', 'Detect: no gap', 'Maintain', 'Notify: weekly digest'],
  },

  // ───────── FRESHNESS, WASTE & MARKDOWN ─────────
  {
    id: 'FW-001', agentId: 'freshness-waste', bucket: 'breached', storeId: 'DXB-031', storeName: 'Mirdif City Centre', country: 'UAE', category: 'Grocery', department: 'Bakery & Dairy', severity: 'critical', status: 'open',
    metricLabel: 'Waste %', metricValue: '9.4%', threshold: '≤ 4%', confidence: 0.92, estimatedImpact: 38000,
    recommendedOwner: 'Hala M. — Fresh Category Lead', dueIn: '2h',
    recommendedAction: 'Apply auto-markdown: 30% off 42 bakery units expiring ≤24h; transfer 18 laban 1L to DXB-014 (higher velocity); dispatch 26 units to Emirates Red Crescent donation partner before 21:00 cut-off.',
    reason: 'Ramadan iftar demand plan overstated bakery + short-shelf dairy by 22%; sell-through fell as Eid weekend dropped footfall 18%.',
    evidence: ['42 bakery SKUs expire ≤24h', 'Laban 1L cover 3.1d vs 1.2 avg', 'Sell-through −22% vs plan', 'Donation slot open 20:00–21:00'],
    sources: ['Freshness Tracker (Wasteless)', 'POS Velocity', 'Donation Portal (ERC)', 'Category Forecast'],
    actionTrace: ['Scan Expiry: 42 SKUs flagged', 'Predict: sell-through insufficient', 'Recommend: markdown + IST + donation', 'Trigger: ESL price push + donation slot', 'Track: 22:00 spoilage reconciliation'],
  },
  {
    id: 'FW-002', agentId: 'freshness-waste', bucket: 'at-risk', storeId: 'JED-027', storeName: 'Mall of Arabia — Jeddah', country: 'KSA', category: 'Grocery', department: 'Fresh Meat & Poultry', severity: 'high', status: 'monitoring',
    metricLabel: 'Predicted Waste Value (48h)', metricValue: 'SAR 14,200', threshold: '≤ SAR 6,000', confidence: 0.85, estimatedImpact: 14200,
    recommendedOwner: 'Rakan A. — Meat Counter Lead', dueIn: '6h',
    recommendedAction: 'Stage 15% markdown starting 18:00 on 34 tray-packs (chicken breast, lamb kofta); brief butcher to promote grill-ready cuts at counter.',
    reason: 'Cool-chain delivery arrived 3h late — usable shelf life shortened; weekday demand insufficient to clear without price nudge.',
    evidence: ['34 tray-packs shelf-life 36h', 'Truck ARR 09:15 vs 06:00 SLA', 'Weekday velocity 62% of weekend', 'Similar action Mar-11 cleared 88%'],
    sources: ['Cold Chain (Emerson)', 'POS', 'ESL (Pricer)', 'Counter Task App'],
    actionTrace: ['Scan Expiry: shelf-life reduced', 'Predict: 48h waste risk', 'Recommend: staged markdown + push', 'Trigger: ESL schedule', 'Track: hourly sell-through'],
  },
  {
    id: 'FW-003', agentId: 'freshness-waste', bucket: 'optimized', storeId: 'MCT-003', storeName: 'Muscat Grand Mall', country: 'Oman', category: 'Grocery', department: 'Produce', severity: 'low', status: 'monitoring',
    metricLabel: 'Waste %', metricValue: '2.8%', threshold: '≤ 4%', confidence: 0.9, estimatedImpact: 3000,
    recommendedOwner: 'Yusuf B. — Store Manager', dueIn: '24h',
    recommendedAction: 'Maintain evening cull-and-donate routine; continue Wasteless dynamic pricing on tomatoes + cucumbers.',
    reason: 'Dynamic pricing loop stable; donation partner pickup on schedule.',
    evidence: ['Waste 2.8% trailing 14d', 'Donation pickups 7/7 on time', 'No spoilage escalations'],
    sources: ['Freshness Tracker', 'Donation Portal', 'POS'],
    actionTrace: ['Scan: healthy', 'Predict: stable', 'Maintain', 'Track', 'Notify: weekly digest'],
  },

  // ───────── PROMOTION EXECUTION ─────────
  {
    id: 'PE-001', agentId: 'promo-execution', bucket: 'breached', storeId: 'RUH-022', storeName: 'Riyadh Park', country: 'KSA', category: 'Cosmetics', department: 'Fragrance Endcap', severity: 'high', status: 'open',
    metricLabel: 'Promo Execution Score', metricValue: '48%', threshold: '≥ 90%', confidence: 0.89, estimatedImpact: 46000,
    recommendedOwner: 'Sara T. — Beauty Floor Lead', dueIn: '3h',
    recommendedAction: 'Push corrected ESL price for Dior Sauvage 100ml (SAR 545, not SAR 620); print + install "Buy 1 Get Sample" shelf talker; brief 3 advisors on offer terms; refill endcap to 24 facings.',
    reason: 'Promo went live at 00:01 but ESL price sync failed; shelf-talker missing; 2 associates unaware of offer — losing conversion on inbound traffic.',
    evidence: ['ESL price mismatch (620 vs 545)', 'Shelf-talker absent (photo audit)', '2/5 associates failed knowledge check', 'Endcap 14/24 facings'],
    sources: ['Promo Calendar (RPM)', 'ESL (SES-imagotag)', 'Shelf Camera (Trax)', 'Reflexis Knowledge Quiz'],
    actionTrace: ['Read Promo Calendar: live SKU', 'Verify Price/Signage: 3 failures', 'Check Display Stock: short', 'Brief Staff: quiz + huddle', 'Measure Uplift: 4h re-audit'],
  },
  {
    id: 'PE-002', agentId: 'promo-execution', bucket: 'at-risk', storeId: 'AUH-006', storeName: 'Yas Mall', country: 'UAE', category: 'Toys', department: 'LEGO Endcap', severity: 'medium', status: 'monitoring',
    metricLabel: 'Weekend Promo Readiness', metricValue: '76%', threshold: '≥ 90% by Fri 12:00', confidence: 0.83, estimatedImpact: 18000,
    recommendedOwner: 'Ahmad K. — Toys Cat. Lead', dueIn: '18h',
    recommendedAction: 'Schedule overnight reset for LEGO Technic weekend promo: print A2 signage, pre-pick 96 units to floor cage, assign VM associate 06:00 Fri.',
    reason: 'Two upcoming SKUs still in backroom; signage not yet printed; historically weekend LEGO promos underperform 22% without Fri-AM setup.',
    evidence: ['Signage queue: not printed', '96 units backroom, 0 on floor', 'Historical -22% when late setup', 'VM associate available 06:00 Fri'],
    sources: ['Promo Calendar', 'Print Queue', 'Backroom RFID', 'WFM'],
    actionTrace: ['Read Promo Calendar', 'Verify Signage: pending', 'Check Display Stock: 0 on floor', 'Brief Staff: assign VM', 'Measure Uplift: Sat AM audit'],
  },
  {
    id: 'PE-003', agentId: 'promo-execution', bucket: 'optimized', storeId: 'KWT-008', storeName: 'The Avenues — Phase IV', country: 'Kuwait', category: 'Fashion', department: 'Denim Wall', severity: 'low', status: 'monitoring',
    metricLabel: 'Promo Execution Score', metricValue: '96%', threshold: '≥ 90%', confidence: 0.91, estimatedImpact: 5000,
    recommendedOwner: 'Ahmad R. — Store Manager', dueIn: '24h',
    recommendedAction: 'Maintain; refresh shelf-talkers Sunday.',
    reason: 'All 6 promo SKUs priced, signed, staffed, and stocked; conversion +14% vs baseline.',
    evidence: ['6/6 SKUs price-verified', 'All shelf-talkers present', 'Staff quiz 5/5', 'Uplift +14%'],
    sources: ['ESL', 'Shelf Camera', 'Reflexis'],
    actionTrace: ['Read', 'Verify', 'Check', 'Brief', 'Measure'],
  },

  // ───────── OMNICHANNEL FULFILMENT ─────────
  {
    id: 'OF-001', agentId: 'omnichannel-fulfilment', bucket: 'breached', storeId: 'DXB-014', storeName: 'Dubai Mall Flagship', country: 'UAE', category: 'Fashion', department: 'Ship-from-Store', severity: 'critical', status: 'open',
    metricLabel: 'Order Ageing > 4h', metricValue: '38 orders', threshold: '≤ 5 orders', confidence: 0.94, estimatedImpact: 62000,
    recommendedOwner: 'Omar L. — Fulfilment Lead', dueIn: '1h',
    recommendedAction: 'Reassign 2 pickers from floor to backroom SFS wave; auto-substitute 11 out-of-stock lines with matched SKUs (customer opt-in); push 90-min ETA SMS to 38 customers; escalate 6 next-day orders to MOE store.',
    reason: 'Morning picker attendance short 3 vs plan; SFS orders backed up while walk-in returns absorbed capacity.',
    evidence: ['38 orders aged 4–7h', 'Pickers on: 4 vs plan 7', 'Returns queue +140% AM', '11 lines OOS with clean substitutions'],
    sources: ['OMS (Manhattan)', 'WFM', 'Inventory', 'Twilio SMS'],
    actionTrace: ['Ingest Orders: SFS queue', 'Optimize Route: batch by zone', 'Recommend Substitutions: 11 lines', 'Notify Customer: ETA SMS', 'Track SLA: hourly'],
  },
  {
    id: 'OF-002', agentId: 'omnichannel-fulfilment', bucket: 'at-risk', storeId: 'JED-027', storeName: 'Mall of Arabia — Jeddah', country: 'KSA', category: 'Grocery', department: 'Click & Collect', severity: 'high', status: 'monitoring',
    metricLabel: 'C&C Pick-to-Ready SLA', metricValue: '48 min avg', threshold: '≤ 30 min', confidence: 0.86, estimatedImpact: 21000,
    recommendedOwner: 'Tariq H. — Duty Manager', dueIn: '4h',
    recommendedAction: 'Batch 22 open C&C orders by aisle zone; assign 2 dedicated pickers 15:00–19:00; pre-stage cold items in insulated locker T-5 min before customer arrival.',
    reason: 'Single-order picking used instead of zone batching; cold items sitting too long in staging.',
    evidence: ['22 orders pending', 'Avg walk-distance 380m/order (batchable 140m)', 'Cold staging temp drift 2°C', 'SLA breach in 90 min if unchanged'],
    sources: ['OMS', 'Picker App', 'Cold Locker IoT', 'Inventory'],
    actionTrace: ['Ingest Orders', 'Optimize Route: zone batch', 'Recommend Substitutions: 0 needed', 'Notify Customer: on-time', 'Track SLA'],
  },
  {
    id: 'OF-003', agentId: 'omnichannel-fulfilment', bucket: 'optimized', storeId: 'MCT-003', storeName: 'Muscat Grand Mall', country: 'Oman', category: 'Cosmetics', department: 'Ship-from-Store', severity: 'low', status: 'monitoring',
    metricLabel: 'Fulfilment SLA', metricValue: '98.4%', threshold: '≥ 95%', confidence: 0.92, estimatedImpact: 4000,
    recommendedOwner: 'Mariam J. — Beauty Lead', dueIn: '24h',
    recommendedAction: 'Maintain 2-picker morning wave; keep Aramex 14:00 handover.',
    reason: 'On-time pick + handover consistent for 21 days.',
    evidence: ['SLA 98.4% (30d)', '0 substitutions this week', 'Aramex handover on time 21/21'],
    sources: ['OMS', 'Carrier API', 'Inventory'],
    actionTrace: ['Ingest', 'Optimize', 'Substitute: none', 'Notify', 'Track'],
  },

  // ───────── ASSOCIATE COPILOT ─────────
  {
    id: 'AC-001', agentId: 'associate-copilot', bucket: 'breached', storeId: 'DXB-031', storeName: 'Mirdif City Centre', country: 'UAE', category: 'Grocery', department: 'Floor', severity: 'medium', status: 'open',
    metricLabel: 'Unresolved Associate Queries (24h)', metricValue: '31', threshold: '≤ 8', confidence: 0.88, estimatedImpact: 12000,
    recommendedOwner: 'Hala M. — Category Lead', dueIn: '6h',
    recommendedAction: 'Publish 4 new grounded answers to Copilot KB (chilled-yoghurt aisle location post-reset, halal beef substitute SKUs, Ramadan return policy, ESL price-check flow); push forced-refresh to 42 associate handhelds.',
    reason: 'Fresh-aisle planogram reset last week + Ramadan return policy update — Copilot returning "unsure" on 31 queries; associates escalating to floor lead instead.',
    evidence: ['31 unresolved (was 6 pre-reset)', '18/31 tied to Aisle 4 reset', '7/31 return-policy questions', 'Handhelds on Copilot v2.3.1'],
    sources: ['Copilot Query Log', 'KB CMS', 'Planogram DAM', 'Policy Repository'],
    actionTrace: ['Receive Query: clustered', 'Ground in Store Data: gaps found', 'Suggest Answer: 4 new articles drafted', 'Log Outcome: escalation reduction', 'Improve Model: nightly retrain'],
  },
  {
    id: 'AC-002', agentId: 'associate-copilot', bucket: 'at-risk', storeId: 'RUH-022', storeName: 'Riyadh Park', country: 'KSA', category: 'Cosmetics', department: 'Beauty Floor', severity: 'medium', status: 'monitoring',
    metricLabel: 'New-Hire Query Volume', metricValue: '4.2 queries/hr/associate', threshold: '≤ 2.5', confidence: 0.82, estimatedImpact: 8000,
    recommendedOwner: 'Noura S. — Store Manager', dueIn: '10h',
    recommendedAction: 'Assign 2 seasonal hires to CT launch onboarding module (30 min video + Copilot guided tour); enable "buddy answer" review by senior advisor for 48h.',
    reason: 'Two Charlotte Tilbury launch-week hires driving 60% of query volume — brand knowledge gap slowing service.',
    evidence: ['CT hires query rate 4.2 vs 1.8 avg', '60% of queries: shade matching', 'Seniors interrupted 22×/shift', 'Onboarding module completion 40%'],
    sources: ['Copilot Query Log', 'LMS', 'WFM Tenure'],
    actionTrace: ['Receive Query', 'Ground in Store Data', 'Suggest Answer: enable buddy mode', 'Log Outcome', 'Improve Model'],
  },
  {
    id: 'AC-003', agentId: 'associate-copilot', bucket: 'optimized', storeId: 'KWT-008', storeName: 'The Avenues — Phase IV', country: 'Kuwait', category: 'Toys', department: 'Floor', severity: 'low', status: 'monitoring',
    metricLabel: 'Query Resolution Rate', metricValue: '94%', threshold: '≥ 85%', confidence: 0.9, estimatedImpact: 2000,
    recommendedOwner: 'Ahmad R. — Store Manager', dueIn: '24h',
    recommendedAction: 'Maintain; nightly KB retrain.',
    reason: 'Copilot grounded in current planogram, promo, and policy; associate CSAT 4.6/5.',
    evidence: ['Resolution 94%', 'CSAT 4.6', 'Avg response 1.4s'],
    sources: ['Copilot', 'Associate CSAT'],
    actionTrace: ['Receive', 'Ground', 'Suggest', 'Log', 'Improve'],
  },

  // ───────── LOCAL DEMAND & EVENT ─────────
  {
    id: 'LD-001', agentId: 'local-demand', bucket: 'breached', storeId: 'DOH-012', storeName: 'Villaggio Mall — Doha', country: 'Qatar', category: 'Grocery', department: 'Beverages + Snacks', severity: 'high', status: 'open',
    metricLabel: 'Forecast Deviation', metricValue: '+41% vs baseline', threshold: '±15%', confidence: 0.9, estimatedImpact: 34000,
    recommendedOwner: 'Layla F. — Store Manager', dueIn: '3h',
    recommendedAction: 'Uplift replen for water 1.5L (+180 units), Gatorade 500ml (+96), chips (+240) ahead of Al Rayyan vs Al Sadd match at Khalifa Stadium tonight; add 2 associates to Aisle 6 restock cadence.',
    reason: 'Baseline forecast missed local football fixture 2km from store; historical match-day uplift +38% on these SKUs.',
    evidence: ['QSL match Al Rayyan-Al Sadd 20:00 (Khalifa Stadium)', 'Historical match-day uplift +38%', 'Weather 41°C (thirst driver)', 'Current cover 0.9d water 1.5L'],
    sources: ['Sports Fixture API', 'Weather (OpenWeather)', 'POS History', 'Inventory'],
    actionTrace: ['Ingest External: fixture + weather', 'Correlate to Store: 2km radius', 'Adjust Forecast: +41%', 'Recommend Ops Change: replen + staff', 'Measure Lift: T+24h'],
  },
  {
    id: 'LD-002', agentId: 'local-demand', bucket: 'at-risk', storeId: 'JED-011', storeName: 'Red Sea Mall — Jeddah', country: 'KSA', category: 'Fashion', department: 'Kids & Uniform', severity: 'medium', status: 'monitoring',
    metricLabel: 'Back-to-School Readiness', metricValue: '68%', threshold: '≥ 90% by T-14d', confidence: 0.84, estimatedImpact: 22000,
    recommendedOwner: 'Mohammed Q. — Kids Cat. Lead', dueIn: '48h',
    recommendedAction: 'Accelerate school-uniform IST from RDC (350 units, sizes 6–12); brief kids-floor team on 5 nearby school start dates (Aug 25–Sep 1); set up "School Ready" endcap by Aug 20.',
    reason: 'MoE calendar shows Jeddah private schools starting Aug 25 (7 days earlier than public); current stock + display not aligned.',
    evidence: ['5 schools starting Aug 25–Sep 1', 'Uniform cover 8d vs need 14d', 'No endcap set', 'Competitor Panda Kids ran 20% promo yesterday'],
    sources: ['MoE Calendar (KSA)', 'Competitor Monitor', 'Inventory', 'Planogram'],
    actionTrace: ['Ingest External: school calendar + competitor', 'Correlate: catchment overlap', 'Adjust Forecast: pull-forward', 'Recommend: IST + endcap', 'Measure Lift'],
  },
  {
    id: 'LD-003', agentId: 'local-demand', bucket: 'optimized', storeId: 'AUH-006', storeName: 'Yas Mall', country: 'UAE', category: 'Toys', department: 'Storewide', severity: 'low', status: 'monitoring',
    metricLabel: 'Forecast Accuracy (7d)', metricValue: '93%', threshold: '≥ 85%', confidence: 0.9, estimatedImpact: 4000,
    recommendedOwner: 'Saif K. — Toys Cat. Lead', dueIn: '24h',
    recommendedAction: 'Maintain; refresh model post Yas Marina F1 weekend.',
    reason: 'Model captured Formula 1 weekend + school holiday overlap correctly.',
    evidence: ['Forecast accuracy 93%', 'F1 weekend uplift matched (+27%)', 'No stock-outs'],
    sources: ['Event Calendar', 'Weather', 'POS'],
    actionTrace: ['Ingest', 'Correlate', 'Adjust', 'Recommend', 'Measure'],
  },
];

export const storeOpsConnectors = [
  { id: 'pos', name: 'POS Live', description: 'Sales, returns, cashier, and lane telemetry', status: 'connected', endpoint: 'pos-live://stores/events', lastSync: '2024-01-20T10:20:00Z' },
  { id: 'footfall', name: 'Footfall & Queue Cameras', description: 'Store traffic, queue wait, and conversion funnel signals', status: 'connected', endpoint: 'vision://store-ops/footfall', lastSync: '2024-01-20T10:18:00Z' },
  { id: 'wfm', name: 'Workforce Management', description: 'Schedules, attendance, skills, and break plans', status: 'connected', endpoint: 'wfm://rosters/v3', lastSync: '2024-01-20T09:55:00Z' },
  { id: 'inventory', name: 'Store Inventory', description: 'Shelf, backroom, RFID, and inter-store transfer stock', status: 'connected', endpoint: 'inventory://store-stock', lastSync: '2024-01-20T10:05:00Z' },
  { id: 'planogram', name: 'Planogram & DAM', description: 'Approved shelf layouts, campaign assets, and fixture photos', status: 'configured', endpoint: 'dam://planograms/current', lastSync: null },
  { id: 'crm', name: 'Loyalty CRM', description: 'Segments, journeys, appointment nudges, and campaign responses', status: 'connected', endpoint: 'crm://loyalty/journeys', lastSync: '2024-01-20T09:40:00Z' },
];

export const storeOpsSettings = {
  categoryRules: [
    { category: 'Grocery', rule: 'Freshness and expiry risk override standard availability thresholds', threshold: 'Waste risk ≤ 6%' },
    { category: 'Fashion', rule: 'Size-curve availability and fitting-room conversion drive recovery priority', threshold: 'OSA ≥ 96%' },
    { category: 'Jewellery', rule: 'Security-cleared staff minimum coverage is mandatory for high-value counters', threshold: '2 cleared staff minimum' },
    { category: 'Cosmetics', rule: 'Advisor shifts must align to brand events and consultation density', threshold: 'Advisor utilization ≤ 85%' },
    { category: 'Toys', rule: 'Demo-station staffing scales for weekends, school holidays, and holiday-quarter surge', threshold: '4 demo-trained staff at peak' },
  ],
  guardrails: {
    queueSlaMinutes: 6,
    planogramMinimumScore: 92,
    onShelfAvailabilityTarget: 96,
    storeHealthMinimum: 80,
    shrinkVarianceApproval: 10000,
  },
  automation: {
    autoCreateTasks: true,
    autoNotifyStoreManagers: true,
    freezeHighValueTransfers: true,
    requirePhotoVerification: true,
  },
};

export const getStoreAgent = (agentId?: string) => storeOpsAgents.find((agent) => agent.id === agentId) || storeOpsAgents[0];
