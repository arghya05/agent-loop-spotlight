import { create } from 'zustand';

export type OnboardingRole = 'compliance_analyst' | 'procurement' | 'admin';
export type BucketTag = 'fast-track' | 'needs-review' | 'blocked';

export interface OnboardingToolTrace {
  id: string;
  timestamp: string;
  toolName: string;
  action: string;
  dataSources: string[];
  duration: number;
}

export interface OnboardingAuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: OnboardingRole;
  decision: string;
  details: string;
}

interface OnboardingState {
  currentRole: OnboardingRole;
  toolTraces: OnboardingToolTrace[];
  auditTrail: OnboardingAuditEntry[];
  isDrawerOpen: boolean;
  drawerTab: 'trace' | 'audit';

  setCurrentRole: (role: OnboardingRole) => void;
  addToolTrace: (trace: Omit<OnboardingToolTrace, 'id'>) => void;
  addAuditEntry: (entry: Omit<OnboardingAuditEntry, 'id'>) => void;
  setDrawerOpen: (open: boolean) => void;
  setDrawerTab: (tab: 'trace' | 'audit') => void;
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  currentRole: 'compliance_analyst',
  toolTraces: [],
  auditTrail: [],
  isDrawerOpen: false,
  drawerTab: 'trace',

  setCurrentRole: (role) => set({ currentRole: role }),

  addToolTrace: (trace) => {
    set(state => ({
      toolTraces: [...state.toolTraces, { ...trace, id: `OTT${Date.now()}` }]
    }));
  },

  addAuditEntry: (entry) => {
    set(state => ({
      auditTrail: [...state.auditTrail, { ...entry, id: `OAU${Date.now()}` }]
    }));
  },

  setDrawerOpen: (open) => set({ isDrawerOpen: open }),
  setDrawerTab: (tab) => set({ drawerTab: tab }),
}));
