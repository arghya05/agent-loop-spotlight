// Per-agent contextual config for Connectors, Settings, and Admin panels.
// Every value is specific to the agent's real operating surface — no generic placeholders.

export interface AgentConnector {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  system: string; // e.g. SAP IBP, Manhattan WMS
}

export interface AgentThreshold {
  key: string;
  label: string;
  value: string;
  unit?: string;
  help: string;
}

export interface AgentGuardrail {
  label: string;
  defaultOn: boolean;
  help: string;
}

export interface AgentSchedule {
  key: string;
  value: string;
  help: string;
}

export interface AgentContextConfig {
  connectors: AgentConnector[];
  thresholds: AgentThreshold[];
  guardrails: AgentGuardrail[];
  schedules: AgentSchedule[];
  admin: {
    kpiFocus: string;
    upstream: string[];
    downstream: string[];
    escalationOwner: string;
  };
}

export const supplyChainAgentContext: Record<string, AgentContextConfig> = {
  'demand-sensing': {
    connectors: [
      { id: 'pos', name: 'POS & Ecom Sales Stream', description: 'Store + digital sell-through, hourly, all GCC banners', endpoint: 'kafka://pos-gcc/sales.v3', system: 'Oracle Retail XStore + Salesforce Commerce' },
      { id: 'weather', name: 'Weather & Events Feed', description: 'Temp, humidity, sandstorm alerts + Ramadan / Eid calendar', endpoint: 'https://api.tomorrow.io/v4/gcc', system: 'Tomorrow.io + GCC events lake' },
      { id: 'promo', name: 'Promo Calendar (TPM)', description: 'Depth, duration, media weight per SKU-store', endpoint: 'https://tpm.internal/v2/plans', system: 'Blue Yonder TPM' },
      { id: 'baseline', name: 'Statistical Baseline Forecast', description: 'Weekly statistical forecast for override comparison', endpoint: 's3://forecast-lake/baseline/weekly.parquet', system: 'SAP IBP' },
    ],
    thresholds: [
      { key: 'mapeAlert', label: 'MAPE alert threshold', value: '18', unit: '%', help: 'Trigger a signal when weekly MAPE exceeds this vs baseline.' },
      { key: 'biasWindow', label: 'Bias detection window', value: '4', unit: 'weeks', help: 'Rolling window to flag persistent over/under-forecast bias.' },
      { key: 'newProductGrace', label: 'NPI grace period', value: '6', unit: 'weeks', help: 'Suppress MAPE alerts for newly launched SKUs.' },
    ],
    guardrails: [
      { label: 'Never overwrite planner manual overrides', defaultOn: true, help: 'Agent proposals stay as suggestions on locked SKU-weeks.' },
      { label: 'Require approval for forecast shifts > 25%', defaultOn: true, help: 'Large sensed corrections escalate to demand planner.' },
      { label: 'Auto-publish to IBP after 2h no objection', defaultOn: false, help: 'Silent approval publishes to SAP IBP downstream.' },
    ],
    schedules: [
      { key: 'Intraday sense', value: 'Every 30 min', help: 'POS + weather + promo re-read.' },
      { key: 'Baseline reconciliation', value: 'Daily 04:00 GST', help: 'Compare sensed vs statistical baseline.' },
      { key: 'Planner digest', value: 'Weekdays 07:30 GST', help: 'MAPE + bias summary to demand planners.' },
    ],
    admin: {
      kpiFocus: 'Forecast MAPE, Bias %, Sensed lift capture',
      upstream: ['POS/Ecom', 'Weather & events', 'Promo plans'],
      downstream: ['Inventory Rebalancing', 'Order Fulfilment', 'Planner Copilot'],
      escalationOwner: 'Head of Demand Planning',
    },
  },
  'inventory-rebalancing': {
    connectors: [
      { id: 'dc-wms', name: 'DC WMS On-Hand', description: 'Real-time on-hand + reserved across 6 GCC DCs', endpoint: 'wms://manh-active/v4/onhand', system: 'Manhattan Active WM' },
      { id: 'store-inv', name: 'Store Inventory Ledger', description: 'Perpetual inventory per store-SKU with movement log', endpoint: 'oracle-retail://sim/v2/positions', system: 'Oracle Retail SIM' },
      { id: 'transfer-cost', name: 'Inter-DC Lane Cost', description: 'AED per pallet per lane incl. cross-border duty', endpoint: 'tms://lane-rates/v1', system: 'Oracle TMS' },
      { id: 'sales-velocity', name: 'DOS & Velocity Feed', description: 'Days-of-supply and forward-cover per node', endpoint: 's3://inventory-analytics/dos/latest', system: 'Internal analytics lake' },
    ],
    thresholds: [
      { key: 'overstockDOS', label: 'Overstock DOS trigger', value: '60', unit: 'days', help: 'Node flagged as donor when cover exceeds this.' },
      { key: 'stockoutDOS', label: 'Stock-out risk DOS', value: '7', unit: 'days', help: 'Node flagged as recipient below this cover.' },
      { key: 'minMoveEconomics', label: 'Minimum move economics', value: '2500', unit: 'AED margin', help: 'Only recommend moves with margin protection above this.' },
    ],
    guardrails: [
      { label: 'Block cross-border moves without duty clearance', defaultOn: true, help: 'Never propose KSA↔UAE moves without customs pre-clearance.' },
      { label: 'Respect halal / temperature segregation', defaultOn: true, help: 'Category-aware routing on food & pharma SKUs.' },
      { label: 'Cap single-move volume at 30% of donor stock', defaultOn: true, help: 'Prevents starving the donor node.' },
    ],
    schedules: [
      { key: 'Imbalance scan', value: 'Every 2 hours', help: 'Refresh DOS map and detect imbalances.' },
      { key: 'Move-plan publish', value: 'Daily 22:00 GST', help: 'Cutoff for next-day dispatch waves.' },
      { key: 'Weekend catch-up', value: 'Friday 15:00 GST', help: 'Pre-weekend rebalance for KSA / UAE demand spikes.' },
    ],
    admin: {
      kpiFocus: 'Weeks-of-cover variance, Stock-out prevention, Move ROI',
      upstream: ['Demand Sensing', 'Warehouse Ops'],
      downstream: ['Transport Control Tower', 'Order Fulfilment'],
      escalationOwner: 'Regional Inventory Manager',
    },
  },
  'warehouse-ops': {
    connectors: [
      { id: 'wcs', name: 'WCS / Automation Layer', description: 'Conveyor, sorter, ASRS telemetry from Jebel Ali & Riyadh DCs', endpoint: 'opcua://wcs-jebel-ali:4840', system: 'Dematic iQ' },
      { id: 'labor', name: 'Labor Management (LMS)', description: 'Shift plan, standards, actuals per associate', endpoint: 'lms://manh-lms/v3/shifts', system: 'Manhattan LMS' },
      { id: 'wave', name: 'Wave & Pick Plan', description: 'Open waves, pick status, replenishment triggers', endpoint: 'wms://manh-active/v4/waves', system: 'Manhattan Active WM' },
      { id: 'dock', name: 'Yard & Dock Schedule', description: 'Inbound appointments, dock doors, trailer status', endpoint: 'yard://c3-solutions/v2/appointments', system: 'C3 Yard' },
    ],
    thresholds: [
      { key: 'wavePunctuality', label: 'Wave punctuality floor', value: '95', unit: '%', help: 'Alert when on-time wave completion drops below.' },
      { key: 'pickRate', label: 'Pick rate variance', value: '15', unit: '%', help: 'Flag zones where actual vs standard variance exceeds this.' },
      { key: 'dockDwell', label: 'Dock dwell ceiling', value: '45', unit: 'minutes', help: 'Trailer dwell time before congestion alert.' },
    ],
    guardrails: [
      { label: 'Never re-wave live picks in flight', defaultOn: true, help: 'Only re-wave unreleased work to protect associate productivity.' },
      { label: 'Enforce cold-chain SLA on chilled waves', defaultOn: true, help: 'Chilled SKUs must dispatch within cold-window.' },
      { label: 'Cap overtime auto-approval at 90 min', defaultOn: true, help: 'Above this the agent requires shift lead approval.' },
    ],
    schedules: [
      { key: 'Live floor scan', value: 'Every 5 min', help: 'Reads WCS + LMS telemetry.' },
      { key: 'Wave optimizer', value: 'Every 30 min', help: 'Suggests re-sequencing for open waves.' },
      { key: 'Shift close report', value: 'End of each shift', help: 'Standards vs actuals + tomorrow\'s plan.' },
    ],
    admin: {
      kpiFocus: 'Wave punctuality, UPH, Dock dwell, Cost per unit',
      upstream: ['Inventory Rebalancing', 'Order Fulfilment'],
      downstream: ['Transport Control Tower', 'Dispatch Readiness'],
      escalationOwner: 'DC Operations Lead',
    },
  },
  'transport-control-tower': {
    connectors: [
      { id: 'tms', name: 'TMS Order & Load', description: 'Loads, lanes, carriers, tender status', endpoint: 'tms://oracle-tms/v3/loads', system: 'Oracle TMS' },
      { id: 'gps', name: 'Carrier GPS / ELD', description: 'Live truck telemetry across GCC lanes', endpoint: 'https://project44.com/v4/gps', system: 'project44' },
      { id: 'edi', name: 'Carrier EDI 214/990', description: 'Status milestones and appointment confirmations', endpoint: 'edi://as2/gcc-carriers', system: 'IBM Sterling B2Bi' },
      { id: 'borders', name: 'GCC Border & Customs', description: 'Batha, Al Ghuwaifat, King Fahd Causeway wait times', endpoint: 'https://gcc-customs.gov/api/wait', system: 'GCC Customs Union feed' },
    ],
    thresholds: [
      { key: 'etaSlipHours', label: 'ETA slip alert', value: '2', unit: 'hours', help: 'Signal fires when predicted ETA slips beyond this vs promise.' },
      { key: 'dwellCeiling', label: 'Border dwell ceiling', value: '4', unit: 'hours', help: 'Escalate customs dwell above this.' },
      { key: 'onTimeFloor', label: 'Lane on-time floor', value: '92', unit: '%', help: 'Lane placed on watchlist when OTIF drops below.' },
    ],
    guardrails: [
      { label: 'Require carrier approval before lane switch', defaultOn: true, help: 'Agent proposes but does not auto-retender loads.' },
      { label: 'Respect driver hours-of-service rules', defaultOn: true, help: 'HOS-aware re-routing only.' },
      { label: 'Block reroutes that violate cold-chain window', defaultOn: true, help: 'Chilled + frozen shipments protected.' },
    ],
    schedules: [
      { key: 'GPS pulse', value: 'Every 2 min', help: 'Live telemetry read.' },
      { key: 'ETA recompute', value: 'Every 10 min', help: 'ML ETA model refresh with border + weather.' },
      { key: 'Carrier scorecard', value: 'Weekly, Sunday 06:00', help: 'OTIF + dwell + claim ratio by carrier.' },
    ],
    admin: {
      kpiFocus: 'OTIF, ETA accuracy, Border dwell, Cost per km',
      upstream: ['Warehouse Ops', 'Dispatch Readiness'],
      downstream: ['Order Fulfilment', 'Exception Management'],
      escalationOwner: 'Head of Logistics',
    },
  },
  'order-fulfilment': {
    connectors: [
      { id: 'oms', name: 'OMS Order Book', description: 'B2B + DTC orders with promise dates and priority', endpoint: 'oms://ibm-sterling/v2/orders', system: 'IBM Sterling OMS' },
      { id: 'atp', name: 'ATP / Available-to-Promise', description: 'Live availability across DCs + in-transit', endpoint: 'atp://sap-atp/v1/check', system: 'SAP GATP' },
      { id: 'carrier-slots', name: 'Carrier Slot Availability', description: 'Cutoffs and capacity per carrier per lane', endpoint: 'https://carrier-slots.internal/v1', system: 'project44 + internal' },
      { id: 'crm', name: 'Customer Tier & SLA', description: 'Account tier, contractual SLA, penalty schedule', endpoint: 'crm://salesforce/v58/accounts', system: 'Salesforce CRM' },
    ],
    thresholds: [
      { key: 'promiseBuffer', label: 'Promise buffer', value: '6', unit: 'hours', help: 'Buffer added to raw ATP when promising to customer.' },
      { key: 'splitPenalty', label: 'Split-ship penalty ceiling', value: '35', unit: 'AED', help: 'Only split when penalty stays under this per order.' },
      { key: 'tierAOTIF', label: 'Tier A OTIF floor', value: '98', unit: '%', help: 'Auto-escalate any Tier A order at risk of missing.' },
    ],
    guardrails: [
      { label: 'Never break Tier A customer promises', defaultOn: true, help: 'Tier A orders block rebalancing that would break their SLA.' },
      { label: 'Require approval to split parent order', defaultOn: false, help: 'Turn on for strategic B2B accounts.' },
      { label: 'Reserve safety stock for eCom flash sales', defaultOn: true, help: 'Protects online channel during ecommerce events.' },
    ],
    schedules: [
      { key: 'Promise recompute', value: 'Every 15 min', help: 'Refresh ATP + carrier slot map.' },
      { key: 'At-risk sweep', value: 'Every hour', help: 'Detect orders trending to miss promise.' },
      { key: 'SLA report', value: 'Daily 06:00 GST', help: 'Prior-day OTIF by tier + channel.' },
    ],
    admin: {
      kpiFocus: 'OTIF, Perfect Order, Promise accuracy, Split rate',
      upstream: ['Demand Sensing', 'Inventory Rebalancing', 'Transport Control Tower'],
      downstream: ['Exception Management', 'Cost-to-Serve'],
      escalationOwner: 'Customer Fulfilment Manager',
    },
  },
  'exception-management': {
    connectors: [
      { id: 'incident-bus', name: 'Supply Chain Event Bus', description: 'Union of exceptions from OMS/WMS/TMS agents', endpoint: 'kafka://scm-events/exceptions.v2', system: 'Confluent Kafka' },
      { id: 'ticketing', name: 'ServiceNow ITSM', description: 'Auto-open + track incident tickets', endpoint: 'https://sn.internal/api/now/table/incident', system: 'ServiceNow' },
      { id: 'comms', name: 'MS Teams + WhatsApp Business', description: 'Push field alerts and confirm receipt', endpoint: 'https://graph.microsoft.com/v1.0/teams', system: 'Microsoft Graph + Meta WA Cloud' },
      { id: 'playbooks', name: 'Playbook Library', description: 'Versioned SOPs per exception class', endpoint: 's3://scm-playbooks/latest', system: 'Internal SOP repo' },
    ],
    thresholds: [
      { key: 'autoTriageConf', label: 'Auto-triage confidence', value: '0.9', help: 'Above this the playbook fires without human triage.' },
      { key: 'p1SlaMinutes', label: 'P1 acknowledgement SLA', value: '15', unit: 'minutes', help: 'Escalate if P1 not acknowledged within this window.' },
      { key: 'duplicateWindow', label: 'Duplicate suppression', value: '30', unit: 'minutes', help: 'Squash identical exceptions inside this window.' },
    ],
    guardrails: [
      { label: 'Human approval required for financial credit > 5,000 AED', defaultOn: true, help: 'Prevents auto-issuing large customer credits.' },
      { label: 'Never close a safety-related exception automatically', defaultOn: true, help: 'HSE-tagged exceptions always require human sign-off.' },
      { label: 'Attach evidence bundle to every closure', defaultOn: true, help: 'Audit-grade traceability for regulators.' },
    ],
    schedules: [
      { key: 'Event stream', value: 'Continuous', help: 'Sub-second consumption from event bus.' },
      { key: 'Aging sweep', value: 'Every 15 min', help: 'Escalate exceptions crossing SLA.' },
      { key: 'Pareto review', value: 'Weekly, Monday 08:00', help: 'Top-10 recurring exception classes.' },
    ],
    admin: {
      kpiFocus: 'MTTA, MTTR, Auto-resolution %, Repeat-rate',
      upstream: ['All supply-chain agents'],
      downstream: ['Cost-to-Serve', 'Planner Copilot'],
      escalationOwner: 'Supply Chain Control Tower Lead',
    },
  },
  'cost-to-serve': {
    connectors: [
      { id: 'gl', name: 'SAP FI/CO Postings', description: 'Actual freight, handling, storage, penalty postings', endpoint: 'sap-erp://fi-co/v1/postings', system: 'SAP S/4HANA' },
      { id: 'activity', name: 'Activity-Based Costing Feed', description: 'Cost drivers per SKU-order-lane', endpoint: 's3://abc-model/latest.parquet', system: 'Internal ABC engine' },
      { id: 'margin', name: 'Net Margin Data Mart', description: 'Landed margin per customer-SKU', endpoint: 'snowflake://margin.mart.public', system: 'Snowflake' },
      { id: 'tariff', name: 'Carrier Tariff Repo', description: 'Contract rates + accessorial schedules', endpoint: 'tms://oracle-tms/v3/tariffs', system: 'Oracle TMS' },
    ],
    thresholds: [
      { key: 'marginErosion', label: 'Margin erosion alert', value: '150', unit: 'bps', help: 'Fire when net margin drops more than this vs 4-wk avg.' },
      { key: 'accessorialShare', label: 'Accessorial share ceiling', value: '12', unit: '%', help: 'Alert when accessorial > this % of freight base.' },
      { key: 'unprofitableOrderAED', label: 'Unprofitable order threshold', value: '-25', unit: 'AED', help: 'Below this the order is flagged.' },
    ],
    guardrails: [
      { label: 'Never expose customer-level margin to field ops', defaultOn: true, help: 'Only aggregate views for non-finance roles.' },
      { label: 'Require finance approval for tariff change proposals', defaultOn: true, help: 'Agent can propose but not commit rate changes.' },
      { label: 'Ignore intercompany transfer margin', defaultOn: true, help: 'Focus on external customer economics.' },
    ],
    schedules: [
      { key: 'Daily cost accrual', value: 'Daily 02:00 GST', help: 'Refresh cost drivers post-close.' },
      { key: 'Margin scan', value: 'Every 4 hours', help: 'Detect eroding customer-SKU cells.' },
      { key: 'Finance close pack', value: 'Monthly, WD+2', help: 'CTS reconciliation for finance.' },
    ],
    admin: {
      kpiFocus: 'Cost per order, Net margin %, Accessorial share',
      upstream: ['Order Fulfilment', 'Transport Control Tower', 'Warehouse Ops'],
      downstream: ['Planner Copilot', 'Pricing Intelligence'],
      escalationOwner: 'Supply Chain Finance Controller',
    },
  },
  'planner-copilot': {
    connectors: [
      { id: 'ibp', name: 'SAP IBP Planning Book', description: 'Read/write demand + supply planning views', endpoint: 'sap-ibp://api/v1/planningarea', system: 'SAP IBP' },
      { id: 'meta', name: 'Agent Memory Store', description: 'Prior recommendations + planner overrides', endpoint: 'pinecone://planner-memory/v1', system: 'Pinecone vector DB' },
      { id: 'chat', name: 'MS Teams Chat Surface', description: 'Conversational entry point for planners', endpoint: 'https://graph.microsoft.com/v1.0/teams', system: 'Microsoft Teams' },
      { id: 'kb', name: 'Planning Policy KB', description: 'Segmentation rules, safety stock policy, S&OP cadence', endpoint: 'confluence://spaces/PLAN', system: 'Confluence' },
    ],
    thresholds: [
      { key: 'ragTopK', label: 'Evidence retrieval K', value: '8', help: 'Docs / signals retrieved per planner question.' },
      { key: 'answerConf', label: 'Answer confidence floor', value: '0.75', help: 'Below this the copilot says "I don\'t know" instead of guessing.' },
      { key: 'sessionMinutes', label: 'Session memory window', value: '30', unit: 'minutes', help: 'Rolling context kept per planner session.' },
    ],
    guardrails: [
      { label: 'Never commit changes to IBP without planner click', defaultOn: true, help: 'Copilot proposes; planner commits.' },
      { label: 'Cite every quantitative claim', defaultOn: true, help: 'Numbers must link to the source signal / dataset.' },
      { label: 'Redact supplier PII from prompts', defaultOn: true, help: 'PII stripped before LLM call.' },
    ],
    schedules: [
      { key: 'Memory refresh', value: 'Every 15 min', help: 'Ingest new signals + planner actions.' },
      { key: 'Nightly briefing', value: 'Weekdays 06:15 GST', help: 'Planner-personalized "what changed" note.' },
      { key: 'S&OP prep pack', value: 'Weekly, Wednesday 14:00', help: 'Auto-drafted S&OP meeting pack.' },
    ],
    admin: {
      kpiFocus: 'Planner time saved, Suggestion acceptance rate, Answer confidence',
      upstream: ['All supply-chain agents'],
      downstream: ['SAP IBP', 'S&OP process'],
      escalationOwner: 'Head of Integrated Planning',
    },
  },
};

export const getAgentContext = (agentId: string): AgentContextConfig | undefined =>
  supplyChainAgentContext[agentId];
