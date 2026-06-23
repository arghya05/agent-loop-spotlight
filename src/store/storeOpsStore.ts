import { create } from 'zustand';

export type StoreOpsRole = 'store_manager' | 'regional_ops' | 'loss_prevention' | 'workforce_planner';

interface StoreOpsAuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  event: string;
  details: string;
}

interface StoreOpsState {
  currentRole: StoreOpsRole;
  signalOverrides: Record<string, { status?: string; owner?: string }>;
  auditTrail: StoreOpsAuditEntry[];
  setCurrentRole: (role: StoreOpsRole) => void;
  updateSignal: (signalId: string, updates: { status?: string; owner?: string }) => void;
  addAuditEntry: (entry: Omit<StoreOpsAuditEntry, 'id' | 'timestamp'> & { timestamp?: string }) => void;
}

export const useStoreOpsStore = create<StoreOpsState>((set) => ({
  currentRole: 'store_manager',
  signalOverrides: {},
  auditTrail: [],
  setCurrentRole: (role) => set({ currentRole: role }),
  updateSignal: (signalId, updates) => set((state) => ({
    signalOverrides: {
      ...state.signalOverrides,
      [signalId]: {
        ...state.signalOverrides[signalId],
        ...updates,
      },
    },
  })),
  addAuditEntry: (entry) => set((state) => ({
    auditTrail: [
      ...state.auditTrail,
      {
        id: `store-audit-${Date.now()}-${Math.random()}`,
        timestamp: entry.timestamp || new Date().toISOString(),
        actor: entry.actor,
        event: entry.event,
        details: entry.details,
      },
    ],
  })),
}));
