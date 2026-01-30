import { create } from 'zustand';

export type Role = 'viewer' | 'ops_manager' | 'category_head';
export type InvestigationStatus = 'idle' | 'running' | 'completed';
export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface ToolTraceEntry {
  id: string;
  timestamp: string;
  toolName: string;
  action: string;
  dataSources: string[];
  duration: number;
}

export interface AuditTrailEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: Role;
  decision: string;
  toolsUsed: string[];
  details: string;
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

interface AppState {
  // Global filters
  selectedBrand: string;
  selectedDC: string;
  selectedCountry: string;
  
  // Role & Demo
  currentRole: Role;
  demoMode: boolean;
  currentDay: number;
  
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
  
  // Actions
  setSelectedBrand: (brand: string) => void;
  setSelectedDC: (dc: string) => void;
  setSelectedCountry: (country: string) => void;
  setCurrentRole: (role: Role) => void;
  setDemoMode: (enabled: boolean) => void;
  simulateNextDay: () => void;
  selectSupplier: (supplierId: string | null) => void;
  startInvestigation: () => void;
  advanceAgentStep: () => void;
  completeInvestigation: () => void;
  addToolTrace: (trace: Omit<ToolTraceEntry, 'id'>) => void;
  addAuditEntry: (entry: Omit<AuditTrailEntry, 'id'>) => void;
  toggleAction: (actionId: string) => void;
  approvePlan: () => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  setDrawerOpen: (open: boolean) => void;
  setDrawerTab: (tab: 'trace' | 'audit') => void;
  resetInvestigation: () => void;
}

const AGENT_STEPS = [
  'KPI Monitor',
  'Shipment Analyzer',
  'Compliance Checker',
  'ASN Validator',
  'Root Cause Builder',
  'Plan Drafting'
];

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  selectedBrand: 'all',
  selectedDC: 'all',
  selectedCountry: 'all',
  currentRole: 'ops_manager',
  demoMode: true,
  currentDay: 20,
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
  simulateNextDay: () => set((state) => ({ currentDay: state.currentDay + 1 })),
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
        'Shipment Analyzer': ['shipments', 'forwarder_performance'],
        'Compliance Checker': ['compliance_events', 'dc_holds'],
        'ASN Validator': ['asn_records', 'receiving_grn'],
        'Root Cause Builder': ['correlation_engine', 'change_detection'],
        'Plan Drafting': ['playbook_templates', 'action_library']
      };
      
      get().addToolTrace({
        timestamp: new Date().toISOString(),
        toolName,
        action: `Analyzing ${toolName.toLowerCase()} data...`,
        dataSources: dataSourcesMap[toolName] || [],
        duration: Math.random() * 500 + 200
      });
      
      set({ currentAgentStep: newStep });
    }
  },
  
  completeInvestigation: () => {
    set({ 
      investigationStatus: 'completed',
      confidenceScore: 0.82,
      planStatus: 'pending_approval'
    });
    get().addAuditEntry({
      timestamp: new Date().toISOString(),
      actor: 'Agent',
      role: get().currentRole,
      decision: 'Investigation completed',
      toolsUsed: AGENT_STEPS,
      details: 'Root cause analysis completed with 82% confidence. Plan generated.'
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
  
  approvePlan: () => {
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
      actor: currentRole === 'ops_manager' ? 'Ops Manager' : 'Category Head',
      role: currentRole,
      decision: 'Plan approved',
      toolsUsed: ['approval_workflow'],
      details: 'Improvement plan approved. 12 tasks created for execution.'
    });
  },
  
  updateTaskStatus: (taskId, status) => set((state) => ({
    tasks: state.tasks.map(t => t.id === taskId ? { ...t, status } : t)
  })),
  
  setDrawerOpen: (open) => set({ isDrawerOpen: open }),
  setDrawerTab: (tab) => set({ drawerTab: tab }),
  
  resetInvestigation: () => set({
    investigationStatus: 'idle',
    currentAgentStep: -1,
    confidenceScore: 0,
    planApproved: false,
    planStatus: 'draft',
    tasks: [],
    toolTraces: []
  })
}));
