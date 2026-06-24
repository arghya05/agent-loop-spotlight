export interface SupplyChainAgent {
  id: string;
  label: string;
  shortLabel: string;
  path: string;
  icon: string; // lucide name
  mission: string;
  description: string;
  primaryKpi: string;
  workflow: string[];
}

export const supplyChainAgents: SupplyChainAgent[] = [
  {
    id: 'supplier-performance',
    label: 'Supplier Performance Agent',
    shortLabel: 'Performance',
    path: '/landing',
    icon: 'Users',
    mission: 'Continuously scores supplier health and explains why a vendor is breaching or at risk.',
    description: 'Senses KPI drift across OTIF, fill-rate, lead-time, quality, and compliance; explains the root cause with evidence; and recommends a remediation plan owner and SLA.',
    primaryKpi: 'Composite Vendor Score',
    workflow: [
      'Sense · ingest KPI feeds and detect drift vs thresholds',
      'Diagnose · build root cause with evidence',
      'Govern · classify into On Track / Watchlist / At Risk / Breached',
      'Recommend · generate Maintain / Quick Fix / Recovery / Contain plan',
      'Notify · route to category head and supplier with audit trail',
    ],
  },
  {
    id: 'dispatch-readiness',
    label: 'Dispatch Readiness Agent',
    shortLabel: 'Dispatch',
    path: '/dispatch/landing',
    icon: 'Truck',
    mission: 'Predicts PO dispatch slippage and orchestrates upstream fixes before the ship-by date.',
    description: 'Reads PO milestones, material readiness, capacity, QA, and logistics windows. Flags Slipping / Watchlist / On Track and dispatches tasks to the right owner.',
    primaryKpi: 'On-Time Dispatch %',
    workflow: [
      'Sense · pull PO milestones, materials, capacity, QA, logistics',
      'Predict · score slippage risk per PO',
      'Diagnose · pinpoint blocking milestone and owner',
      'Recommend · expedite, re-balance, or split-ship action',
      'Notify · open task in supplier portal and log to audit',
    ],
  },
  {
    id: 'supplier-onboarding',
    label: 'Supplier Onboarding Agent',
    shortLabel: 'Onboarding',
    path: '/onboarding/landing',
    icon: 'Rocket',
    mission: 'Triages new supplier applications into Fast Track, Needs Review, and Blocked buckets.',
    description: 'Extracts data from KYC / tax / banking / compliance documents, validates against policy, and gates human review only where the agent is not confident.',
    primaryKpi: 'Time to Onboard',
    workflow: [
      'Ingest · parse KYC, tax, banking, compliance documents',
      'Validate · run policy and sanctions checks',
      'Score · confidence-rate fields and flag exceptions',
      'Route · Fast Track auto-approve, Needs Review to ops, Blocked to compliance',
      'Audit · log every extraction and decision',
    ],
  },
  {
    id: 'invoice-cash-ops',
    label: 'Invoice & Cash Ops Agent',
    shortLabel: 'Invoice',
    path: '/invoice/landing',
    icon: 'DollarSign',
    mission: 'Auto-matches invoices to PO + GRN, surfaces disputes, and protects early-pay discount opportunities.',
    description: 'Performs 3-way match, classifies variance, suggests dispute or release, and recommends pay-date to capture discounts without breaking working-capital limits.',
    primaryKpi: 'Auto-Match Rate',
    workflow: [
      'Match · 3-way match invoice ↔ PO ↔ GRN',
      'Classify · Matched, Needs Review, Dispute, or Hold',
      'Explain · variance reason with evidence trail',
      'Recommend · release, dispute, or capture early-pay discount',
      'Notify · supplier portal + AP team with action card',
    ],
  },
  {
    id: 'contract-lifecycle',
    label: 'Contract Lifecycle Agent',
    shortLabel: 'Contract',
    path: '/contract/landing',
    icon: 'Gavel',
    mission: 'Monitors contractual obligations and flags benefits at risk, violations, and renewals.',
    description: 'Tracks rebates, SLA credits, exclusivity, MOQ, and expiry clauses; ties violations to invoices and POs; and triggers renegotiation when terms are no longer competitive.',
    primaryKpi: 'Obligations Met %',
    workflow: [
      'Sense · monitor obligations vs actuals',
      'Classify · Compliant, At Risk, Violation, Expiring, Renegotiate',
      'Diagnose · link breach to specific PO / invoice evidence',
      'Recommend · claim credit, dispute, renew, or renegotiate',
      'Notify · legal, category, and supplier with audit log',
    ],
  },
  {
    id: 'pricing-intelligence',
    label: 'Pricing Intelligence Agent',
    shortLabel: 'Pricing',
    path: '/pricing/landing',
    icon: 'Tag',
    mission: 'Decides between Reprice, Promote, and Markdown for each SKU based on demand, competition, and stock cover.',
    description: 'Blends competitor price signals, elasticity, stock-on-hand, and margin guardrails to recommend the right price move and expected impact.',
    primaryKpi: 'Margin $ Protected',
    workflow: [
      'Sense · competitor scrape, demand, stock cover, margin',
      'Classify · Reprice / Promote / Markdown candidate',
      'Simulate · expected lift vs margin impact',
      'Recommend · price move within guardrails',
      'Notify · merchant approval and store execution',
    ],
  },
  {
    id: 'autonomous-inventory',
    label: 'Autonomous Inventory Agent',
    shortLabel: 'Inventory',
    path: '/inventory/landing',
    icon: 'Package',
    mission: 'Decides between Replenish, Transfer, and Monitor across the store and DC network.',
    description: 'Reads POS sell-through, WMS stock, in-transit, and supplier EDI to keep cover within target without overstocking.',
    primaryKpi: 'In-Stock %',
    workflow: [
      'Sense · POS sell-through, WMS stock, in-transit',
      'Project · forward cover vs target',
      'Decide · Replenish from supplier, Transfer across network, or Monitor',
      'Recommend · order or transfer with quantity and ETA',
      'Notify · supplier EDI, DC, or store with task',
    ],
  },
  {
    id: 'product-onboarding',
    label: 'Product Onboarding Agent',
    shortLabel: 'Product',
    path: '/product/landing',
    icon: 'PackageOpen',
    mission: 'Enriches, validates, and activates new SKUs across channels.',
    description: 'Fills catalog gaps with AI copy and taxonomy, runs policy and compliance gates, then publishes the SKU to PIM / DAM / channels.',
    primaryKpi: 'Time to Activate',
    workflow: [
      'Enrich · fill copy, attributes, taxonomy via Copy AI',
      'Validate · policy, compliance, and image quality gates',
      'Score · confidence and exceptions',
      'Activate · publish to PIM, DAM, and channels',
      'Audit · log every enrichment and approval',
    ],
  },
];
