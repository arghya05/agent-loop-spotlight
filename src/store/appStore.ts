import { create } from 'zustand';

export type Role = 'viewer' | 'ops_manager' | 'category_head';
export type InvestigationStatus = 'idle' | 'running' | 'completed' | 'revising';
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type AgentDecision = 'continue' | 'escalate' | 'rollback' | 'resolved';

export interface PolicyRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  threshold: number;
  currentValue: number;
  consecutiveDays: number;
  requiredDays: number;
  isTriggered: boolean;
  isActive: boolean;
  lastChecked: string;
}

export interface ToolTraceEntry {
  id: string;
  timestamp: string;
  toolName: string;
  action: string;
  dataSources: string[];
  duration: number;
  isRevision?: boolean;
}

export interface AuditTrailEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: Role;
  decision: string;
  toolsUsed: string[];
  details: string;
  isAutopilot?: boolean;
}

export interface Task {
  id: string;
  planId: string;
  actionId: string;
  title: string;
  assignee: string;
  status: TaskStatus;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface DailyKPI {
  day: number;
  otif: number;
  fillRate: number;
  compliance: number;
  asnAccuracy: number;
  leadTime: number;
  decision?: AgentDecision;
}

interface AppState {
  // Global filters
  selectedBrand: string;
  selectedDC: string;
  selectedCountry: string;
  
  // Role & Demo
  currentRole: Role;
  demoMode: boolean;
  currentDay: number;
  
  // Autopilot
  autopilotEnabled: boolean;
  agentDecisionHistory: { day: number; decision: AgentDecision; reason: string }[];
  
  // Policy Controls
  policyRules: PolicyRule[];
  
  // Counterexample / Revision
  isRevising: boolean;
  revisionStep: number;
  originalHypothesis: string;
  revisedHypothesis: string;
  hasShownRevision: boolean;
  
  // Selected supplier
  selectedSupplierId: string | null;
  
  // Investigation state
  investigationStatus: InvestigationStatus;
  currentAgentStep: number;
  agentSteps: string[];
  confidenceScore: number;
  
  // Plan state
  planApproved: boolean;
  planStatus: 'draft' | 'pending_approval' | 'approved' | 'executing' | 'completed';
  enabledActions: string[];
  
  // Tasks
  tasks: Task[];
  
  // Traces
  toolTraces: ToolTraceEntry[];
  auditTrail: AuditTrailEntry[];
  
  // Drawer
  isDrawerOpen: boolean;
  drawerTab: 'trace' | 'audit';
  
  // KPI History for simulation
  kpiHistory: DailyKPI[];
  
  // Actions
  setSelectedBrand: (brand: string) => void;
  setSelectedDC: (dc: string) => void;
  setSelectedCountry: (country: string) => void;
  setCurrentRole: (role: Role) => void;
  setDemoMode: (enabled: boolean) => void;
  setAutopilotEnabled: (enabled: boolean) => void;
  simulateNextDay: () => void;
  selectSupplier: (supplierId: string | null) => void;
  startInvestigation: () => void;
  advanceAgentStep: () => void;
  completeInvestigation: () => void;
  startRevision: () => void;
  advanceRevision: () => void;
  completeRevision: () => void;
  addToolTrace: (trace: Omit<ToolTraceEntry, 'id'>) => void;
  addAuditEntry: (entry: Omit<AuditTrailEntry, 'id'>) => void;
  toggleAction: (actionId: string) => void;
  togglePolicyRule: (ruleId: string) => void;
  approvePlan: (isAutopilot?: boolean) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  setDrawerOpen: (open: boolean) => void;
  setDrawerTab: (tab: 'trace' | 'audit') => void;
  resetInvestigation: () => void;
  checkPoliciesAndEnforce: () => void;
}

const AGENT_STEPS = [
  'KPI Monitor',
  'Shipment Analyzer',
  'Compliance Checker',
  'ASN Validator',
  'Root Cause Builder',
  'Plan Drafting'
];

const REVISION_STEPS = [
  'Counter-Evidence Detected',
  'Hypothesis Validation',
  'Cause Re-ranking',
  'Plan Adjustment'
];

const INITIAL_POLICY_RULES: PolicyRule[] = [
  {
    id: 'POL001',
    name: 'Compliance Failure Auto-Freeze',
    condition: 'compliance_fail > 2%',
    action: 'Freeze new PO release',
    threshold: 2,
    currentValue: 6.2,
    consecutiveDays: 5,
    requiredDays: 3,
    isTriggered: true,
    isActive: true,
    lastChecked: '2024-01-20T10:00:00Z'
  },
  {
    id: 'POL002',
    name: 'ASN Quality Gate',
    condition: 'ASN accuracy < 95%',
    action: 'Enforce ASN validation gate',
    threshold: 95,
    currentValue: 91.1,
    consecutiveDays: 4,
    requiredDays: 2,
    isTriggered: true,
    isActive: true,
    lastChecked: '2024-01-20T10:00:00Z'
  },
  {
    id: 'POL003',
    name: 'Lead Time Alert',
    condition: 'lead_time > 12 days',
    action: 'Escalate to Category Head',
    threshold: 12,
    currentValue: 13.5,
    consecutiveDays: 3,
    requiredDays: 2,
    isTriggered: true,
    isActive: true,
    lastChecked: '2024-01-20T10:00:00Z'
  },
  {
    id: 'POL004',
    name: 'OTIF Recovery Check',
    condition: 'OTIF < 80%',
    action: 'Trigger forwarder review',
    threshold: 80,
    currentValue: 76,
    consecutiveDays: 6,
    requiredDays: 3,
    isTriggered: true,
    isActive: false,
    lastChecked: '2024-01-20T10:00:00Z'
  }
];

const INITIAL_KPI_HISTORY: DailyKPI[] = [
  { day: 14, otif: 88, fillRate: 93, compliance: 2.1, asnAccuracy: 96.2, leadTime: 12.0 },
  { day: 15, otif: 84, fillRate: 91, compliance: 3.5, asnAccuracy: 94.8, leadTime: 12.5 },
  { day: 16, otif: 81, fillRate: 90, compliance: 4.2, asnAccuracy: 93.5, leadTime: 12.8 },
  { day: 17, otif: 79, fillRate: 89, compliance: 5.1, asnAccuracy: 92.3, leadTime: 13.0 },
  { day: 18, otif: 78, fillRate: 88, compliance: 5.8, asnAccuracy: 91.8, leadTime: 13.2 },
  { day: 19, otif: 77, fillRate: 88, compliance: 6.0, asnAccuracy: 91.3, leadTime: 13.4 },
  { day: 20, otif: 76, fillRate: 88, compliance: 6.2, asnAccuracy: 91.1, leadTime: 13.5 }
];

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  selectedBrand: 'all',
  selectedDC: 'all',
  selectedCountry: 'all',
  currentRole: 'ops_manager',
  demoMode: true,
  currentDay: 20,
  
  // Autopilot
  autopilotEnabled: false,
  agentDecisionHistory: [],
  
  // Policy Controls
  policyRules: INITIAL_POLICY_RULES,
  
  // Counterexample
  isRevising: false,
  revisionStep: -1,
  originalHypothesis: 'Primary cause: Port dwell increase (+2.3 days) from forwarder switch',
  revisedHypothesis: 'Revised cause: ASN mapping errors (primary) → Port dwell normal; forwarder transition completed successfully',
  hasShownRevision: false,
  
  selectedSupplierId: null,
  investigationStatus: 'idle',
  currentAgentStep: -1,
  agentSteps: AGENT_STEPS,
  confidenceScore: 0,
  planApproved: false,
  planStatus: 'draft',
  enabledActions: ['ACT001', 'ACT002', 'ACT003', 'ACT004', 'ACT005', 'ACT006', 'ACT007'],
  tasks: [],
  toolTraces: [],
  auditTrail: [],
  isDrawerOpen: false,
  drawerTab: 'trace',
  kpiHistory: INITIAL_KPI_HISTORY,
  
  // Actions
  setSelectedBrand: (brand) => set({ selectedBrand: brand }),
  setSelectedDC: (dc) => set({ selectedDC: dc }),
  setSelectedCountry: (country) => set({ selectedCountry: country }),
  
  setCurrentRole: (role) => {
    set({ currentRole: role });
    get().addAuditEntry({
      timestamp: new Date().toISOString(),
      actor: role === 'viewer' ? 'Viewer' : role === 'ops_manager' ? 'Ops Manager' : 'Category Head',
      role: role,
      decision: 'Role switched',
      toolsUsed: [],
      details: `User switched to ${role} role`
    });
  },
  
  setDemoMode: (enabled) => set({ demoMode: enabled }),
  
  setAutopilotEnabled: (enabled) => {
    set({ autopilotEnabled: enabled });
    get().addAuditEntry({
      timestamp: new Date().toISOString(),
      actor: 'System',
      role: get().currentRole,
      decision: enabled ? 'Autopilot enabled' : 'Autopilot disabled',
      toolsUsed: ['autopilot_controller'],
      details: enabled 
        ? 'Agent will automatically investigate drift, approve plans, and enforce policies'
        : 'Manual mode activated - user approval required for all actions',
      isAutopilot: true
    });
  },
  
  simulateNextDay: () => {
    const { currentDay, autopilotEnabled, planApproved, kpiHistory, policyRules } = get();
    const newDay = currentDay + 1;
    
    // Simulate KPI changes based on whether plan is approved
    let newKPI: DailyKPI;
    let decision: AgentDecision = 'continue';
    let reason = '';
    
    if (planApproved && newDay > 21) {
      // Recovery trajectory
      const recoveryRate = (newDay - 21) * 2.5;
      newKPI = {
        day: newDay,
        otif: Math.min(76 + recoveryRate, 94),
        fillRate: Math.min(88 + recoveryRate * 0.5, 97),
        compliance: Math.max(6.2 - recoveryRate * 0.4, 0.8),
        asnAccuracy: Math.min(91.1 + recoveryRate * 0.6, 98.6),
        leadTime: Math.max(13.5 - recoveryRate * 0.15, 11.0)
      };
      
      if (newKPI.otif >= 90) {
        decision = 'resolved';
        reason = `OTIF recovered to ${newKPI.otif.toFixed(1)}%. Corrective actions successful.`;
      } else {
        decision = 'continue';
        reason = `OTIF at ${newKPI.otif.toFixed(1)}%. Recovery on track, continuing monitoring.`;
      }
    } else if (!planApproved) {
      // Continued degradation
      newKPI = {
        day: newDay,
        otif: Math.max(76 - (newDay - 20) * 1.5, 68),
        fillRate: Math.max(88 - (newDay - 20) * 0.8, 82),
        compliance: Math.min(6.2 + (newDay - 20) * 0.5, 9),
        asnAccuracy: Math.max(91.1 - (newDay - 20) * 0.4, 88),
        leadTime: Math.min(13.5 + (newDay - 20) * 0.3, 15)
      };
      
      if (newKPI.otif < 72) {
        decision = 'escalate';
        reason = `OTIF dropped to ${newKPI.otif.toFixed(1)}%. Escalating to Category Head for immediate action.`;
      } else {
        decision = 'continue';
        reason = `OTIF at ${newKPI.otif.toFixed(1)}%. Awaiting plan approval.`;
      }
    } else {
      // Plan approved but too early to see recovery
      newKPI = {
        day: newDay,
        otif: 76 + Math.random() * 2,
        fillRate: 88 + Math.random(),
        compliance: 6.0 - Math.random() * 0.5,
        asnAccuracy: 91.5 + Math.random(),
        leadTime: 13.3 - Math.random() * 0.2
      };
      decision = 'continue';
      reason = 'Plan executed. Monitoring for early recovery signals.';
    }
    
    // Update policy values
    const updatedPolicies = policyRules.map(p => ({
      ...p,
      currentValue: p.id === 'POL001' ? newKPI.compliance :
                    p.id === 'POL002' ? newKPI.asnAccuracy :
                    p.id === 'POL003' ? newKPI.leadTime :
                    newKPI.otif,
      lastChecked: new Date().toISOString()
    }));
    
    set({ 
      currentDay: newDay,
      kpiHistory: [...kpiHistory, newKPI],
      policyRules: updatedPolicies,
      agentDecisionHistory: [...get().agentDecisionHistory, { day: newDay, decision, reason }]
    });
    
    // Add audit entry
    get().addAuditEntry({
      timestamp: new Date().toISOString(),
      actor: autopilotEnabled ? 'Autopilot Agent' : 'User',
      role: get().currentRole,
      decision: `Day ${newDay}: ${decision.toUpperCase()}`,
      toolsUsed: ['kpi_monitor', 'decision_engine'],
      details: reason,
      isAutopilot: autopilotEnabled
    });
    
    // Check and enforce policies
    get().checkPoliciesAndEnforce();
  },
  
  selectSupplier: (supplierId) => set({ selectedSupplierId: supplierId }),
  
  startInvestigation: () => {
    set({ 
      investigationStatus: 'running', 
      currentAgentStep: 0,
      toolTraces: [],
      isDrawerOpen: true,
      drawerTab: 'trace'
    });
  },
  
  advanceAgentStep: () => {
    const { currentAgentStep, agentSteps } = get();
    const newStep = currentAgentStep + 1;
    
    if (newStep < agentSteps.length) {
      const toolName = agentSteps[newStep];
      const dataSourcesMap: Record<string, string[]> = {
        'KPI Monitor': ['kpi_daily_supplier', 'supplier_master'],
        'Shipment Analyzer': ['shipments', 'forwarder_performance', 'jebel_ali_port_data'],
        'Compliance Checker': ['compliance_events', 'dc_holds', 'uae_label_regulations'],
        'ASN Validator': ['asn_records', 'receiving_grn', 'sscc_barcode_log'],
        'Root Cause Builder': ['correlation_engine', 'change_detection', 'bayesian_inference'],
        'Plan Drafting': ['playbook_templates', 'action_library', 'landmark_sop']
      };
      
      get().addToolTrace({
        timestamp: new Date().toISOString(),
        toolName,
        action: `Analyzing ${toolName.toLowerCase()} data for DXB-JAFZA DC...`,
        dataSources: dataSourcesMap[toolName] || [],
        duration: Math.random() * 500 + 200
      });
      
      set({ currentAgentStep: newStep });
    }
  },
  
  completeInvestigation: () => {
    const { autopilotEnabled, currentRole } = get();
    
    set({ 
      investigationStatus: 'completed',
      confidenceScore: 0.82,
      planStatus: 'pending_approval'
    });
    
    get().addAuditEntry({
      timestamp: new Date().toISOString(),
      actor: 'Agent',
      role: currentRole,
      decision: 'Investigation completed',
      toolsUsed: AGENT_STEPS,
      details: 'Root cause analysis completed with 82% confidence. Plan generated for SuratHomeTex.',
      isAutopilot: autopilotEnabled
    });
    
    // Auto-approve if autopilot is enabled and role has permission
    if (autopilotEnabled && (currentRole === 'ops_manager' || currentRole === 'category_head')) {
      setTimeout(() => {
        get().approvePlan(true);
      }, 1500);
    }
  },
  
  startRevision: () => {
    set({
      isRevising: true,
      investigationStatus: 'revising',
      revisionStep: 0
    });
    
    get().addToolTrace({
      timestamp: new Date().toISOString(),
      toolName: 'Counter-Evidence Detector',
      action: 'New evidence contradicts initial hypothesis: Port dwell returned to normal (1.9 days)',
      dataSources: ['jebel_ali_port_data', 'forwarder_performance_v2'],
      duration: 180,
      isRevision: true
    });
  },
  
  advanceRevision: () => {
    const { revisionStep } = get();
    const newStep = revisionStep + 1;
    
    const revisionTraces: Record<number, { toolName: string; action: string; dataSources: string[] }> = {
      1: {
        toolName: 'Hypothesis Validator',
        action: 'Validating: Port dwell now 1.9 days (was 4.2 days). Forwarder QuickFreight stabilized operations.',
        dataSources: ['shipments_latest', 'port_dwell_timeseries']
      },
      2: {
        toolName: 'Cause Re-ranker',
        action: 'Re-ranking causes: ASN mapping errors → PRIMARY (confidence 0.91). Port dwell → SECONDARY (resolved).',
        dataSources: ['asn_error_correlation', 'bayesian_update']
      },
      3: {
        toolName: 'Plan Adjuster',
        action: 'Adjusting plan: Deprioritize forwarder switch, prioritize ASN quality gate enforcement.',
        dataSources: ['action_library', 'landmark_sop_v2']
      }
    };
    
    if (newStep <= 3) {
      const trace = revisionTraces[newStep];
      get().addToolTrace({
        timestamp: new Date().toISOString(),
        toolName: trace.toolName,
        action: trace.action,
        dataSources: trace.dataSources,
        duration: Math.random() * 300 + 150,
        isRevision: true
      });
      
      set({ revisionStep: newStep });
    }
  },
  
  completeRevision: () => {
    set({
      isRevising: false,
      investigationStatus: 'completed',
      revisionStep: -1,
      hasShownRevision: true,
      confidenceScore: 0.91 // Higher confidence after revision
    });
    
    get().addAuditEntry({
      timestamp: new Date().toISOString(),
      actor: 'Agent',
      role: get().currentRole,
      decision: 'Hypothesis revised based on new evidence',
      toolsUsed: ['counter_evidence_detector', 'hypothesis_validator', 'cause_reranker', 'plan_adjuster'],
      details: 'Original hypothesis (port dwell) invalidated. ASN mapping now primary cause (91% confidence). Plan adjusted.',
      isAutopilot: get().autopilotEnabled
    });
  },
  
  addToolTrace: (trace) => set((state) => ({
    toolTraces: [...state.toolTraces, { ...trace, id: `trace-${Date.now()}-${Math.random()}` }]
  })),
  
  addAuditEntry: (entry) => set((state) => ({
    auditTrail: [...state.auditTrail, { ...entry, id: `audit-${Date.now()}-${Math.random()}` }]
  })),
  
  toggleAction: (actionId) => set((state) => ({
    enabledActions: state.enabledActions.includes(actionId)
      ? state.enabledActions.filter(id => id !== actionId)
      : [...state.enabledActions, actionId]
  })),
  
  togglePolicyRule: (ruleId) => set((state) => ({
    policyRules: state.policyRules.map(p => 
      p.id === ruleId ? { ...p, isActive: !p.isActive } : p
    )
  })),
  
  approvePlan: (isAutopilot = false) => {
    const { currentRole } = get();
    set({ 
      planApproved: true, 
      planStatus: 'approved',
      tasks: [
        { id: 'TSK001', planId: 'PLAN-2024-0042', actionId: 'ACT001', title: 'Contact MaerskLine for expedited booking', assignee: 'Logistics Coordinator', status: 'todo', dueDate: '2024-01-21', priority: 'high' },
        { id: 'TSK002', planId: 'PLAN-2024-0042', actionId: 'ACT001', title: 'Cancel QuickFreight booking for next 2 POs', assignee: 'Logistics Coordinator', status: 'todo', dueDate: '2024-01-21', priority: 'high' },
        { id: 'TSK003', planId: 'PLAN-2024-0042', actionId: 'ACT002', title: 'Send label rollback notice to SuratHomeTex', assignee: 'Supplier Manager', status: 'todo', dueDate: '2024-01-21', priority: 'critical' },
        { id: 'TSK004', planId: 'PLAN-2024-0042', actionId: 'ACT002', title: 'Share approved V2.1 template files', assignee: 'Compliance Team', status: 'todo', dueDate: '2024-01-21', priority: 'high' },
        { id: 'TSK005', planId: 'PLAN-2024-0042', actionId: 'ACT003', title: 'Schedule video QC call with supplier', assignee: 'QC Manager', status: 'todo', dueDate: '2024-01-22', priority: 'medium' },
        { id: 'TSK006', planId: 'PLAN-2024-0042', actionId: 'ACT004', title: 'Enable carton count validation in ASN portal', assignee: 'IT Systems', status: 'todo', dueDate: '2024-01-22', priority: 'high' },
        { id: 'TSK007', planId: 'PLAN-2024-0042', actionId: 'ACT005', title: 'Configure SSCC mandatory field in ASN form', assignee: 'IT Systems', status: 'todo', dueDate: '2024-01-22', priority: 'medium' },
        { id: 'TSK008', planId: 'PLAN-2024-0042', actionId: 'ACT006', title: 'Update DC priority queue for SuratHomeTex SKUs', assignee: 'DC Supervisor', status: 'todo', dueDate: '2024-01-21', priority: 'medium' },
        { id: 'TSK009', planId: 'PLAN-2024-0042', actionId: 'ACT006', title: 'Allocate dedicated receiving bay', assignee: 'DC Supervisor', status: 'todo', dueDate: '2024-01-21', priority: 'medium' },
        { id: 'TSK010', planId: 'PLAN-2024-0042', actionId: 'ACT007', title: 'Configure escalation alert rules', assignee: 'IT Systems', status: 'todo', dueDate: '2024-01-21', priority: 'medium' },
        { id: 'TSK011', planId: 'PLAN-2024-0042', actionId: 'ACT002', title: 'Notify Category Head of label issue', assignee: 'Ops Manager', status: 'in_progress', dueDate: '2024-01-21', priority: 'high' },
        { id: 'TSK012', planId: 'PLAN-2024-0042', actionId: 'ACT001', title: 'Update supplier portal with new forwarder details', assignee: 'Supplier Manager', status: 'todo', dueDate: '2024-01-22', priority: 'medium' }
      ]
    });
    
    get().addAuditEntry({
      timestamp: new Date().toISOString(),
      actor: isAutopilot ? 'Autopilot Agent' : (currentRole === 'ops_manager' ? 'Ops Manager' : 'Category Head'),
      role: currentRole,
      decision: isAutopilot ? 'Plan auto-approved (Autopilot)' : 'Plan approved',
      toolsUsed: ['approval_workflow', 'task_generator'],
      details: isAutopilot 
        ? 'Autopilot automatically approved improvement plan. 12 tasks created for execution.'
        : 'Improvement plan approved. 12 tasks created for execution.',
      isAutopilot
    });
  },
  
  updateTaskStatus: (taskId, status) => set((state) => ({
    tasks: state.tasks.map(t => t.id === taskId ? { ...t, status } : t)
  })),
  
  setDrawerOpen: (open) => set({ isDrawerOpen: open }),
  setDrawerTab: (tab) => set({ drawerTab: tab }),
  
  checkPoliciesAndEnforce: () => {
    const { policyRules, autopilotEnabled } = get();
    
    policyRules.forEach(policy => {
      if (policy.isActive && policy.isTriggered) {
        get().addAuditEntry({
          timestamp: new Date().toISOString(),
          actor: 'Policy Engine',
          role: get().currentRole,
          decision: `Policy enforced: ${policy.name}`,
          toolsUsed: ['policy_engine', 'enforcement_module'],
          details: `${policy.condition} for ${policy.consecutiveDays} days. Action: ${policy.action}`,
          isAutopilot: autopilotEnabled
        });
      }
    });
  },
  
  resetInvestigation: () => set({
    investigationStatus: 'idle',
    currentAgentStep: -1,
    confidenceScore: 0,
    planApproved: false,
    planStatus: 'draft',
    tasks: [],
    toolTraces: [],
    isRevising: false,
    revisionStep: -1
  })
}));
