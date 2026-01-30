import { create } from 'zustand';

export type DispatchRole = 'viewer' | 'supplier_manager' | 'sourcing_manager' | 'category_head' | 'logistics_lead';
export type POStatus = 'green' | 'amber' | 'red';
export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface PO {
  po_id: string;
  brand: string;
  category: string;
  sku_count: number;
  qty: number;
  supplier_id: string;
  factory_id: string;
  committed_ex_factory_date: string;
  committed_port_gatein_date: string;
  country_allocation: Record<string, number>;
  readiness_pct: number;
  risk_score: number;
  eta_slip_days: number;
  status: POStatus;
  priority: string;
}

export interface Milestone {
  stage: string;
  planned_date: string;
  actual_date: string | null;
  status: 'completed' | 'in_progress' | 'pending';
  delay_days: number;
}

export interface DispatchToolTrace {
  id: string;
  timestamp: string;
  toolName: string;
  action: string;
  dataSources: string[];
  duration: number;
}

export interface DispatchAuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: DispatchRole;
  decision: string;
  details: string;
  beforeRisk?: number;
  afterRisk?: number;
}

export interface DispatchTask {
  id: string;
  po_id: string;
  title: string;
  category: string;
  assignee: string;
  status: TaskStatus;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  slaHours: number;
  escalationRule: string;
}

export interface ContingencySettings {
  splitShipment: boolean;
  backupFactory: string | null;
  overtime: boolean;
  partialAirFreight: boolean;
}

export interface InterventionAction {
  id: string;
  category: string;
  title: string;
  owner: string;
  dueDate: string;
  expectedRiskReduction: number;
  confidence: number;
  enabled: boolean;
  requiresApproval?: DispatchRole;
}

interface DispatchState {
  // Filters
  selectedBrand: string;
  selectedCategory: string;
  selectedSupplier: string;
  selectedFactory: string;
  selectedCountry: string;
  selectedDC: string;
  dueWindow: number;
  
  // Role
  currentRole: DispatchRole;
  currentDay: number;
  
  // Selected PO
  selectedPOId: string | null;
  
  // Agent state
  agentRunning: boolean;
  agentCompleted: boolean;
  currentAgentStep: number;
  agentSteps: string[];
  
  // Plan state
  planApproved: boolean;
  interventions: InterventionAction[];
  contingency: ContingencySettings;
  
  // Tasks
  tasks: DispatchTask[];
  
  // Traces
  toolTraces: DispatchToolTrace[];
  auditTrail: DispatchAuditEntry[];
  
  // Drawer
  isDrawerOpen: boolean;
  drawerTab: 'trace' | 'audit' | 'learning';
  
  // Computed metrics
  probabilityOnTime: number;
  expectedSlipDays: number;
  
  // Actions
  setFilter: (key: string, value: string | number) => void;
  setCurrentRole: (role: DispatchRole) => void;
  selectPO: (poId: string | null) => void;
  runAgentCheck: () => void;
  advanceAgentStep: () => void;
  completeAgentRun: () => void;
  toggleIntervention: (actionId: string) => void;
  setContingency: (key: keyof ContingencySettings, value: boolean | string | null) => void;
  approvePlan: () => void;
  approveWithEdits: () => void;
  rejectPlan: () => void;
  executePlan: () => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  simulateNextDay: () => void;
  addToolTrace: (trace: Omit<DispatchToolTrace, 'id'>) => void;
  addAuditEntry: (entry: Omit<DispatchAuditEntry, 'id'>) => void;
  setDrawerOpen: (open: boolean) => void;
  setDrawerTab: (tab: 'trace' | 'audit' | 'learning') => void;
  calculateContingencyImpact: () => { probability: number; slipDays: number; cost: number; lostSalesAvoided: number };
}

const AGENT_STEPS = [
  'Readiness Monitor',
  'Milestone Validator', 
  'Material ETA Checker',
  'Quality Analyzer',
  'Capacity Forecaster',
  'Delay Predictor',
  'Plan Generator',
  'Task Executor'
];

const DEFAULT_INTERVENTIONS: InterventionAction[] = [
  {
    id: 'INT001',
    category: 'Logistics',
    title: 'Pre-book forwarder slot for Jebel Ali gate-in',
    owner: 'Logistics Lead',
    dueDate: '2024-02-02',
    expectedRiskReduction: 0.08,
    confidence: 0.85,
    enabled: true
  },
  {
    id: 'INT002',
    category: 'Supplier',
    title: 'Expedite fabric via alternate mill; confirm receipt within 48h',
    owner: 'Supplier Manager',
    dueDate: '2024-02-01',
    expectedRiskReduction: 0.15,
    confidence: 0.72,
    enabled: true
  },
  {
    id: 'INT003',
    category: 'Quality',
    title: 'Raise inspection cadence + fix rework root cause; reduce hold rate below 3%',
    owner: 'Supplier Manager',
    dueDate: '2024-02-03',
    expectedRiskReduction: 0.12,
    confidence: 0.78,
    enabled: true
  },
  {
    id: 'INT004',
    category: 'Sourcing',
    title: 'Shift 30% qty to backup factory Tiruppur Unit-2',
    owner: 'Sourcing Manager',
    dueDate: '2024-02-02',
    expectedRiskReduction: 0.18,
    confidence: 0.82,
    enabled: true,
    requiresApproval: 'sourcing_manager'
  },
  {
    id: 'INT005',
    category: 'Commercial',
    title: 'De-risk UAE promo: reduce launch qty, stagger KSA allocation',
    owner: 'Category Head',
    dueDate: '2024-02-04',
    expectedRiskReduction: 0.10,
    confidence: 0.68,
    enabled: false,
    requiresApproval: 'category_head'
  },
  {
    id: 'INT006',
    category: 'Air-freight',
    title: 'If risk >0.65 at T-7, trigger partial air-freight for top 10 SKUs',
    owner: 'Category Head',
    dueDate: '2024-02-05',
    expectedRiskReduction: 0.25,
    confidence: 0.92,
    enabled: false,
    requiresApproval: 'category_head'
  }
];

export const useDispatchStore = create<DispatchState>((set, get) => ({
  // Initial state
  selectedBrand: 'all',
  selectedCategory: 'all',
  selectedSupplier: 'all',
  selectedFactory: 'all',
  selectedCountry: 'all',
  selectedDC: 'all',
  dueWindow: 21,
  
  currentRole: 'supplier_manager',
  currentDay: 30, // Jan 30
  
  selectedPOId: null,
  
  agentRunning: false,
  agentCompleted: false,
  currentAgentStep: -1,
  agentSteps: AGENT_STEPS,
  
  planApproved: false,
  interventions: DEFAULT_INTERVENTIONS,
  contingency: {
    splitShipment: false,
    backupFactory: null,
    overtime: false,
    partialAirFreight: false
  },
  
  tasks: [],
  toolTraces: [],
  auditTrail: [],
  
  isDrawerOpen: false,
  drawerTab: 'trace',
  
  probabilityOnTime: 0,
  expectedSlipDays: 0,
  
  // Actions
  setFilter: (key, value) => set({ [key]: value } as any),
  
  setCurrentRole: (role) => {
    set({ currentRole: role });
    get().addAuditEntry({
      timestamp: new Date().toISOString(),
      actor: role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      role,
      decision: 'Role switched',
      details: `User switched to ${role.replace('_', ' ')} role`
    });
  },
  
  selectPO: (poId) => {
    set({
      selectedPOId: poId,
      agentRunning: false,
      agentCompleted: false,
      currentAgentStep: -1,
      planApproved: false,
      tasks: [],
      interventions: DEFAULT_INTERVENTIONS.map(i => ({ ...i })),
      contingency: {
        splitShipment: false,
        backupFactory: null,
        overtime: false,
        partialAirFreight: false
      }
    });
  },
  
  runAgentCheck: () => {
    set({
      agentRunning: true,
      agentCompleted: false,
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
        'Readiness Monitor': ['pos', 'milestones', 'supplier_master'],
        'Milestone Validator': ['milestones', 'factory_calendar'],
        'Material ETA Checker': ['materials', 'supplier_shipments'],
        'Quality Analyzer': ['quality', 'inspection_reports', 'rework_log'],
        'Capacity Forecaster': ['capacity', 'absenteeism', 'overtime_schedule'],
        'Delay Predictor': ['all_risk_signals', 'learning_memory'],
        'Plan Generator': ['intervention_library', 'cost_model'],
        'Task Executor': ['task_templates', 'assignment_rules']
      };
      
      get().addToolTrace({
        timestamp: new Date().toISOString(),
        toolName,
        action: `Analyzing ${toolName.toLowerCase()} for selected PO...`,
        dataSources: dataSourcesMap[toolName] || [],
        duration: Math.random() * 400 + 150
      });
      
      set({ currentAgentStep: newStep });
    }
  },
  
  completeAgentRun: () => {
    const { selectedPOId } = get();
    
    // Calculate probability based on PO data
    const probability = selectedPOId?.includes('10421') ? 0.29 : 
                       selectedPOId?.includes('10425') ? 0.24 :
                       selectedPOId?.includes('10423') ? 0.32 : 0.65;
    const slipDays = selectedPOId?.includes('10421') ? 7 :
                     selectedPOId?.includes('10425') ? 8 :
                     selectedPOId?.includes('10423') ? 6 : 2;
    
    set({
      agentRunning: false,
      agentCompleted: true,
      probabilityOnTime: probability,
      expectedSlipDays: slipDays
    });
    
    get().addAuditEntry({
      timestamp: new Date().toISOString(),
      actor: 'Agent',
      role: get().currentRole,
      decision: 'Risk assessment completed',
      details: `PO ${selectedPOId}: ${(probability * 100).toFixed(0)}% on-time probability, ${slipDays} days expected slip`
    });
  },
  
  toggleIntervention: (actionId) => {
    set(state => ({
      interventions: state.interventions.map(i => 
        i.id === actionId ? { ...i, enabled: !i.enabled } : i
      )
    }));
  },
  
  setContingency: (key, value) => {
    set(state => ({
      contingency: { ...state.contingency, [key]: value }
    }));
  },
  
  approvePlan: () => {
    set({ planApproved: true });
    get().addAuditEntry({
      timestamp: new Date().toISOString(),
      actor: get().currentRole.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      role: get().currentRole,
      decision: 'Plan approved',
      details: 'All recommended interventions approved for execution',
      beforeRisk: get().probabilityOnTime,
      afterRisk: Math.min(get().probabilityOnTime + 0.25, 0.92)
    });
  },
  
  approveWithEdits: () => {
    set({ planApproved: true });
    get().addAuditEntry({
      timestamp: new Date().toISOString(),
      actor: get().currentRole.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      role: get().currentRole,
      decision: 'Plan approved with edits',
      details: 'Selected interventions approved for execution'
    });
  },
  
  rejectPlan: () => {
    set({ planApproved: false });
    get().addAuditEntry({
      timestamp: new Date().toISOString(),
      actor: get().currentRole.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      role: get().currentRole,
      decision: 'Plan rejected',
      details: 'Recommended plan rejected - manual intervention required'
    });
  },
  
  executePlan: () => {
    const { selectedPOId, interventions, currentRole } = get();
    
    const newTasks: DispatchTask[] = interventions
      .filter(i => i.enabled)
      .flatMap((intervention, idx) => [
        {
          id: `DTSK${String(idx * 2 + 1).padStart(3, '0')}`,
          po_id: selectedPOId || '',
          title: intervention.title,
          category: intervention.category,
          assignee: intervention.owner,
          status: 'todo' as TaskStatus,
          dueDate: intervention.dueDate,
          priority: idx < 2 ? 'critical' : 'high' as any,
          slaHours: 24,
          escalationRule: `Escalate to ${intervention.requiresApproval || 'Supplier Manager'} if no response in 24h`
        }
      ]);
    
    set({ tasks: newTasks });
    
    get().addAuditEntry({
      timestamp: new Date().toISOString(),
      actor: currentRole.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      role: currentRole,
      decision: 'Plan executed',
      details: `${newTasks.length} tasks created and assigned`
    });
  },
  
  updateTaskStatus: (taskId, status) => {
    set(state => ({
      tasks: state.tasks.map(t => 
        t.id === taskId ? { ...t, status } : t
      )
    }));
  },
  
  simulateNextDay: () => {
    const { currentDay, tasks, probabilityOnTime } = get();
    
    // Auto-complete some tasks
    const updatedTasks = tasks.map(t => {
      if (t.status === 'todo' && Math.random() > 0.5) {
        return { ...t, status: 'in_progress' as TaskStatus };
      }
      if (t.status === 'in_progress' && Math.random() > 0.6) {
        return { ...t, status: 'done' as TaskStatus };
      }
      return t;
    });
    
    // Improve probability if tasks are being completed
    const completedTasks = updatedTasks.filter(t => t.status === 'done').length;
    const newProbability = Math.min(probabilityOnTime + (completedTasks * 0.05), 0.95);
    
    set({
      currentDay: currentDay + 1,
      tasks: updatedTasks,
      probabilityOnTime: newProbability
    });
    
    get().addAuditEntry({
      timestamp: new Date().toISOString(),
      actor: 'System',
      role: get().currentRole,
      decision: `Day ${currentDay + 1} simulation`,
      details: `${completedTasks} tasks completed. On-time probability: ${(newProbability * 100).toFixed(0)}%`
    });
  },
  
  addToolTrace: (trace) => {
    set(state => ({
      toolTraces: [...state.toolTraces, { ...trace, id: `TT${Date.now()}` }]
    }));
  },
  
  addAuditEntry: (entry) => {
    set(state => ({
      auditTrail: [...state.auditTrail, { ...entry, id: `AU${Date.now()}` }]
    }));
  },
  
  setDrawerOpen: (open) => set({ isDrawerOpen: open }),
  setDrawerTab: (tab) => set({ drawerTab: tab }),
  
  calculateContingencyImpact: () => {
    const { contingency, probabilityOnTime, expectedSlipDays } = get();
    
    let probability = probabilityOnTime;
    let slipDays = expectedSlipDays;
    let cost = 0;
    let lostSalesAvoided = 0;
    
    if (contingency.splitShipment) {
      probability += 0.08;
      slipDays -= 1;
      cost += 2500;
      lostSalesAvoided += 15000;
    }
    
    if (contingency.backupFactory) {
      probability += 0.15;
      slipDays -= 2;
      cost += 5000;
      lostSalesAvoided += 35000;
    }
    
    if (contingency.overtime) {
      probability += 0.10;
      slipDays -= 1;
      cost += 8000;
      lostSalesAvoided += 20000;
    }
    
    if (contingency.partialAirFreight) {
      probability += 0.20;
      slipDays -= 3;
      cost += 25000;
      lostSalesAvoided += 85000;
    }
    
    return {
      probability: Math.min(probability, 0.98),
      slipDays: Math.max(slipDays, 0),
      cost,
      lostSalesAvoided
    };
  }
}));
