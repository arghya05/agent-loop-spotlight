export type StoreAgentId =
  | 'store-command'
  | 'category-intelligence'
  | 'margin-shrinkage'
  | 'checkout'
  | 'store-replenishment'
  | 'planogram'
  | 'customer-engagement'
  | 'workforce';

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
    mission: 'Prevents shelf gaps with store-level reorder, backroom pick, and inter-store transfer recommendations.',
    description: 'Uses POS velocity, shelf cameras, backroom stock, delivery ETA, and local event demand signals.',
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
];

export const storeOpsSignals: StoreOpsSignal[] = [
  {
    id: 'SC-001', agentId: 'store-command', bucket: 'breached', storeId: 'DXB-014', storeName: 'Dubai Mall Flagship', country: 'UAE', category: 'Fashion', department: 'Storewide', severity: 'critical', status: 'open', metricLabel: 'Composite Store Health', metricValue: '62/100', threshold: '≥ 80/100', confidence: 0.92, estimatedImpact: 118000, recommendedOwner: 'Regional Ops Manager', dueIn: '2h', recommendedAction: 'Open incident room, assign checkout and replenishment owners, and start hourly recovery pulse.', reason: 'The store breached the health threshold because checkout queue SLA, fitting-room conversion, and denim shelf availability all failed in the same 90-minute window.', evidence: ['Queue wait hit 11.4 min vs 6 min SLA', 'Denim OSA dropped to 86% vs 96% target', 'Fitting-room conversion fell 9.8 pts below trailing 4-week norm'], sources: ['POS Live', 'Footfall Counter', 'Shelf Camera', 'Task Manager'], actionTrace: ['Sense: combined POS, queue, shelf, and task signals', 'Diagnose: three independent failures converged during evening footfall spike', 'Recommend: assign owners by exception type', 'Act: create recovery checklist and field nudge', 'Notify: Regional Ops Manager and Store Manager'],
  },
  {
    id: 'SC-002', agentId: 'store-command', bucket: 'at-risk', storeId: 'RUH-022', storeName: 'Riyadh Park', country: 'KSA', category: 'Cosmetics', department: 'Storewide', severity: 'high', status: 'monitoring', metricLabel: 'Health Forecast', metricValue: '79/100 in 3h', threshold: '≥ 80/100', confidence: 0.87, estimatedImpact: 64000, recommendedOwner: 'Store Manager', dueIn: '4h', recommendedAction: 'Pre-stage beauty advisors and open two mobile checkout points before the brand event starts.', reason: 'The store is at risk because brand event bookings exceed advisor coverage and payment lanes are already running at 74% utilization.', evidence: ['Consultation bookings 38% above plan', 'Advisor roster short by 2 specialists', 'Payment lane utilization 74% before peak'], sources: ['Booking Calendar', 'WFM', 'POS Lanes'], actionTrace: ['Sense: booking density and lane utilization rising', 'Diagnose: specialist coverage gap', 'Recommend: reassign advisors and mobile POS', 'Act: notify duty manager', 'Monitor: track conversion every 30 minutes'],
  },
  {
    id: 'SC-003', agentId: 'store-command', bucket: 'optimized', storeId: 'KWT-008', storeName: 'Avenues Kuwait', country: 'Kuwait', category: 'Toys', department: 'Storewide', severity: 'low', status: 'monitoring', metricLabel: 'Store Health', metricValue: '91/100', threshold: '≥ 80/100', confidence: 0.9, estimatedImpact: 12000, recommendedOwner: 'Store Manager', dueIn: '24h', recommendedAction: 'Continue weekend demo-station monitoring.', reason: 'The store remains optimized because queue, staffing, stock, and planogram signals are within configured thresholds.', evidence: ['Queue under 4.2 min', 'Demo-station staffed for weekend peak', 'Top toy SKUs above safety stock'], sources: ['POS', 'WFM', 'Inventory'], actionTrace: ['Sense: all signals healthy', 'Diagnose: no breach pattern', 'Recommend: monitor', 'Act: no escalation', 'Notify: daily digest only'],
  },
  {
    id: 'CI-001', agentId: 'category-intelligence', bucket: 'breached', storeId: 'DXB-031', storeName: 'Mirdif City Centre', country: 'UAE', category: 'Grocery', department: 'Fresh Produce', severity: 'critical', status: 'open', metricLabel: 'Expiry Waste Risk', metricValue: '14.6%', threshold: '≤ 6%', confidence: 0.91, estimatedImpact: 46000, recommendedOwner: 'Fresh Category Lead', dueIn: '3h', recommendedAction: 'Move expiring berries to markdown zone and reduce tomorrow inbound by 18 crates.', reason: 'Grocery freshness guardrail breached because sell-through slowed after a local event ended while inbound replenishment stayed at promotion volume.', evidence: ['Berry sell-through 31% below forecast', '26 crates expire within 36 hours', 'Promotion uplift flag expired yesterday'], sources: ['POS', 'Freshness Tracker', 'Promotion Calendar'], actionTrace: ['Read Category Context: Grocery expiry rules applied', 'Compare Thresholds: waste risk above 6%', 'Explain: event demand ended', 'Recommend: markdown + inbound reduction', 'Monitor: hourly spoilage forecast'],
  },
  {
    id: 'CI-002', agentId: 'category-intelligence', bucket: 'at-risk', storeId: 'JED-011', storeName: 'Jeddah Red Sea Mall', country: 'KSA', category: 'Jewellery', department: 'Fine Jewellery', severity: 'high', status: 'monitoring', metricLabel: 'Specialist Coverage', metricValue: '1 cleared advisor', threshold: '≥ 2 cleared advisors', confidence: 0.89, estimatedImpact: 83000, recommendedOwner: 'Jewellery Floor Manager', dueIn: '5h', recommendedAction: 'Pull a security-cleared specialist from watch counter for appointment blocks 6–9 PM.', reason: 'Jewellery coverage is at risk because appointment bookings require two security-cleared advisors, but the roster has only one during peak.', evidence: ['9 high-value appointments booked', 'Only 1 security-cleared advisor scheduled', 'VIP conversion drops when coverage < 2'], sources: ['Appointment Book', 'WFM Skills', 'Security Roster'], actionTrace: ['Read Category Context: jewellery security rule applied', 'Compare: minimum specialist coverage below threshold', 'Explain: appointment surge', 'Recommend: temporary specialist reassignment', 'Monitor: appointment wait time'],
  },
  {
    id: 'MS-001', agentId: 'margin-shrinkage', bucket: 'breached', storeId: 'DOH-004', storeName: 'Doha Festival City', country: 'Qatar', category: 'Jewellery', department: 'Gold Counter', severity: 'critical', status: 'open', metricLabel: 'Inventory Variance', metricValue: '$72.4K', threshold: '≤ $10K', confidence: 0.94, estimatedImpact: 72400, recommendedOwner: 'Loss Prevention Lead', dueIn: '1h', recommendedAction: 'Freeze gold counter transfers, start cycle count, and review CCTV exception timestamps.', reason: 'Shrinkage threshold breached because POS sales, safe transfer log, and cycle-count snapshot do not reconcile for five high-value SKUs.', evidence: ['5 SKUs missing from safe transfer log', 'Cycle count variance $72.4K', 'Two manual price overrides in same shift'], sources: ['POS', 'RFID Safe Log', 'Cycle Count', 'CCTV Events'], actionTrace: ['Detect Leakage: high-value variance found', 'Correlate: transfer log missing', 'Rank: critical impact', 'Freeze: hold transfers', 'Notify: Loss Prevention'],
  },
  {
    id: 'MS-002', agentId: 'margin-shrinkage', bucket: 'at-risk', storeId: 'DXB-014', storeName: 'Dubai Mall Flagship', country: 'UAE', category: 'Fashion', department: 'Footwear', severity: 'medium', status: 'monitoring', metricLabel: 'Refund Override Rate', metricValue: '7.8%', threshold: '≤ 4%', confidence: 0.82, estimatedImpact: 28000, recommendedOwner: 'Store Manager', dueIn: '8h', recommendedAction: 'Require manager PIN for footwear refunds until pattern normalizes.', reason: 'Refund leakage is at risk because one lane shows a refund override rate almost double threshold during a sale period.', evidence: ['Lane 7 refund overrides 7.8%', 'Same cashier involved in 62% of overrides', 'Basket returns skew to discounted footwear'], sources: ['POS Returns', 'Cashier Log', 'Promotion Rules'], actionTrace: ['Detect: override rate rising', 'Correlate: cashier + sale items', 'Rank: medium risk', 'Guardrail: manager PIN', 'Notify: store manager'],
  },
  {
    id: 'CO-001', agentId: 'checkout', bucket: 'breached', storeId: 'AUH-006', storeName: 'Yas Mall', country: 'UAE', category: 'Grocery', department: 'Front End', severity: 'critical', status: 'open', metricLabel: 'Avg Queue Wait', metricValue: '12.2 min', threshold: '≤ 6 min', confidence: 0.93, estimatedImpact: 57000, recommendedOwner: 'Duty Manager', dueIn: '30m', recommendedAction: 'Open three assisted lanes, move two floor associates to bagging, and reboot SCO cluster B.', reason: 'Checkout SLA breached because footfall rose 41% while self-checkout cluster B was offline and only four assisted lanes were open.', evidence: ['Queue camera estimates 12.2 min wait', 'SCO cluster B down for 23 min', 'Footfall 41% above forecast'], sources: ['Queue Camera', 'POS Lane Status', 'Footfall Counter'], actionTrace: ['Sense: queue and lane health', 'Predict: abandonment risk rising', 'Open Capacity: three assisted lanes', 'Resolve POS: reboot SCO', 'Notify: duty manager'],
  },
  {
    id: 'CO-002', agentId: 'checkout', bucket: 'optimized', storeId: 'MCT-003', storeName: 'Muscat Grand Mall', country: 'Oman', category: 'Cosmetics', department: 'Beauty Checkout', severity: 'low', status: 'monitoring', metricLabel: 'Checkout SLA', metricValue: '3.8 min', threshold: '≤ 6 min', confidence: 0.88, estimatedImpact: 9000, recommendedOwner: 'Beauty Lead', dueIn: '24h', recommendedAction: 'Keep mobile POS assigned to consultation desks during event.', reason: 'Checkout is optimized because mobile POS capacity matches consultation checkout density.', evidence: ['Average wait 3.8 min', 'Mobile POS utilization 52%', 'No payment failures in last 2h'], sources: ['POS', 'Booking Calendar'], actionTrace: ['Sense: wait under SLA', 'Predict: stable', 'Open Capacity: no extra lane', 'Monitor: event checkout', 'Notify: digest'],
  },
  {
    id: 'SR-001', agentId: 'store-replenishment', bucket: 'breached', storeId: 'DXB-014', storeName: 'Dubai Mall Flagship', country: 'UAE', category: 'Fashion', department: 'Denim Wall', severity: 'high', status: 'open', metricLabel: 'On-Shelf Availability', metricValue: '86%', threshold: '≥ 96%', confidence: 0.9, estimatedImpact: 68000, recommendedOwner: 'Replenishment Lead', dueIn: '2h', recommendedAction: 'Pick 164 units from backroom and transfer missing sizes from Mall of Emirates before close.', reason: 'Shelf availability breached because size M/L denim depleted faster than forecast while backroom replenishment tasks aged past SLA.', evidence: ['Size M/L sell-through 29% above forecast', '164 units available in backroom', '3 replenishment tasks aged > 90 minutes'], sources: ['POS', 'Backroom Stock', 'Shelf Camera', 'Task Manager'], actionTrace: ['Forecast: evening denim demand high', 'Check Shelf: gaps detected', 'Check Backroom: stock exists', 'Recommend: pick + transfer', 'Confirm: photo verification'],
  },
  {
    id: 'SR-002', agentId: 'store-replenishment', bucket: 'at-risk', storeId: 'KWT-008', storeName: 'Avenues Kuwait', country: 'Kuwait', category: 'Toys', department: 'Demo Toys', severity: 'high', status: 'monitoring', metricLabel: 'Weekend Cover', metricValue: '1.3 days', threshold: '≥ 2.5 days', confidence: 0.86, estimatedImpact: 39000, recommendedOwner: 'Toy Category Lead', dueIn: '6h', recommendedAction: 'Approve inter-store transfer of 96 demo toy units before weekend school-holiday peak.', reason: 'Toy replenishment is at risk because school-holiday footfall forecast outpaces current cover for demo-station hero SKUs.', evidence: ['School-holiday uplift forecast +34%', 'Hero toy cover 1.3 days', 'Nearby store has 142 excess units'], sources: ['POS Forecast', 'Inventory', 'Holiday Calendar'], actionTrace: ['Forecast: holiday spike', 'Check Shelf: cover low', 'Check Network: excess nearby', 'Recommend: transfer', 'Monitor: weekend sell-through'],
  },
  {
    id: 'PG-001', agentId: 'planogram', bucket: 'breached', storeId: 'RUH-022', storeName: 'Riyadh Park', country: 'KSA', category: 'Cosmetics', department: 'Brand Event Bay', severity: 'high', status: 'open', metricLabel: 'Planogram Match', metricValue: '71%', threshold: '≥ 92%', confidence: 0.88, estimatedImpact: 51000, recommendedOwner: 'Visual Merchandising Lead', dueIn: '3h', recommendedAction: 'Reset hero bay to approved brand-event planogram and upload verification photo.', reason: 'Planogram compliance breached because the launch bay is missing the hero serum block and has testers in the wrong sequence.', evidence: ['Shelf image match 71%', 'Hero serum block absent', 'Tester sequence differs from campaign plan'], sources: ['Shelf Camera', 'DAM Planogram', 'Campaign Calendar'], actionTrace: ['Capture: shelf image received', 'Compare: 21% below threshold', 'Detect: missing block', 'Create Task: VM reset', 'Verify: photo required'],
  },
  {
    id: 'PG-002', agentId: 'planogram', bucket: 'optimized', storeId: 'JED-011', storeName: 'Jeddah Red Sea Mall', country: 'KSA', category: 'Jewellery', department: 'Watch Wall', severity: 'low', status: 'monitoring', metricLabel: 'Planogram Match', metricValue: '96%', threshold: '≥ 92%', confidence: 0.91, estimatedImpact: 15000, recommendedOwner: 'Visual Merchandising Lead', dueIn: '24h', recommendedAction: 'Maintain verified layout during weekend VIP appointments.', reason: 'Planogram is optimized because high-value watch adjacency, lighting, and security-case sequence all match approved guidance.', evidence: ['Shelf image match 96%', 'VIP appointment fixture verified', 'No blocked sightlines'], sources: ['Shelf Camera', 'VM App'], actionTrace: ['Capture: verified photo', 'Compare: above threshold', 'Detect: no gap', 'Create Task: none', 'Monitor: daily photo'],
  },
  {
    id: 'CE-001', agentId: 'customer-engagement', bucket: 'breached', storeId: 'RUH-022', storeName: 'Riyadh Park', country: 'KSA', category: 'Cosmetics', department: 'Beauty Studio', severity: 'high', status: 'open', metricLabel: 'Event Conversion', metricValue: '18.4%', threshold: '≥ 28%', confidence: 0.85, estimatedImpact: 74000, recommendedOwner: 'Beauty Advisor Lead', dueIn: '2h', recommendedAction: 'Trigger appointment reminder nudges and align two advisors to the consultation desk.', reason: 'Customer engagement breached because consultation bookings are high but advisor coverage and reminder completion are low, causing conversion leakage.', evidence: ['Conversion 9.6 pts below event target', 'Reminder completion only 54%', '2 advisors missing from consultation block'], sources: ['Loyalty CRM', 'Booking Calendar', 'WFM'], actionTrace: ['Segment: event customers', 'Match: beauty campaign', 'Allocate: advisors short', 'Send Nudge: reminders', 'Measure: conversion recovery'],
  },
  {
    id: 'CE-002', agentId: 'customer-engagement', bucket: 'at-risk', storeId: 'MCT-003', storeName: 'Muscat Grand Mall', country: 'Oman', category: 'Fashion', department: 'Women Occasionwear', severity: 'medium', status: 'monitoring', metricLabel: 'Loyalty Churn Risk', metricValue: '22%', threshold: '≤ 15%', confidence: 0.81, estimatedImpact: 34000, recommendedOwner: 'CRM Manager', dueIn: '12h', recommendedAction: 'Send personalized occasionwear offer to high-intent customers with abandoned wishlists.', reason: 'Engagement is at risk because high-intent loyalty customers viewed occasionwear repeatedly but did not convert after price changes.', evidence: ['Wishlist abandonment +18%', 'Price change viewed by 420 loyalty members', 'Repeat store visits without purchase'], sources: ['Loyalty CRM', 'Digital Browse', 'POS'], actionTrace: ['Segment: high-intent members', 'Match: occasionwear campaign', 'Allocate: stylist slots', 'Send Nudge: offer', 'Measure: conversion'],
  },
  {
    id: 'WF-001', agentId: 'workforce', bucket: 'breached', storeId: 'JED-011', storeName: 'Jeddah Red Sea Mall', country: 'KSA', category: 'Jewellery', department: 'Fine Jewellery', severity: 'critical', status: 'open', metricLabel: 'Skill Coverage', metricValue: '50%', threshold: '100% security-cleared coverage', confidence: 0.93, estimatedImpact: 92000, recommendedOwner: 'Workforce Planner', dueIn: '1h', recommendedAction: 'Call in one security-cleared associate and reschedule lunch breaks around VIP appointment blocks.', reason: 'Workforce coverage breached because jewellery requires minimum security-cleared coverage, and one cleared associate called out during VIP appointment hours.', evidence: ['Only 1 of 2 required cleared staff present', '6 VIP appointments in next 3h', 'Break schedule overlaps peak'], sources: ['WFM', 'Attendance', 'Appointment Book', 'Security Roster'], actionTrace: ['Forecast: appointment-driven demand', 'Check Skills: cleared coverage missing', 'Detect Gap: peak-hour breach', 'Recommend Roster: call-in + break shift', 'Notify: workforce planner'],
  },
  {
    id: 'WF-002', agentId: 'workforce', bucket: 'at-risk', storeId: 'KWT-008', storeName: 'Avenues Kuwait', country: 'Kuwait', category: 'Toys', department: 'Demo Station', severity: 'high', status: 'monitoring', metricLabel: 'Demo Coverage', metricValue: '2 staff', threshold: '≥ 4 during holiday peak', confidence: 0.87, estimatedImpact: 44000, recommendedOwner: 'HR Planner', dueIn: '10h', recommendedAction: 'Start seasonal hiring surge and add two weekend demo-station associates.', reason: 'Workforce is at risk because school-holiday traffic and weekend demo demand require four trained associates, but only two are scheduled.', evidence: ['School-holiday traffic forecast +39%', 'Only 2 demo-trained associates scheduled', 'Demo conversion drops when coverage < 4'], sources: ['WFM', 'Holiday Calendar', 'POS Demo Conversion'], actionTrace: ['Forecast: holiday demand', 'Check Skills: demo training gap', 'Detect Gap: weekend undercoverage', 'Recommend Roster: add staff', 'Notify: HR planner'],
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
