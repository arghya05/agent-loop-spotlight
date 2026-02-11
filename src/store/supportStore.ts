import { create } from 'zustand';

export type SupportRole = 'Supplier User' | 'Support Admin' | 'Ops Manager' | 'Admin';
export type SupportMode = 'portal' | 'console';

interface AuditEntry {
  time: string;
  actor: string;
  event: string;
  details: string;
}

interface SupportState {
  currentRole: SupportRole;
  mode: SupportMode;
  setRole: (role: SupportRole) => void;
  setMode: (mode: SupportMode) => void;
  auditTrail: AuditEntry[];
  addAuditEntry: (entry: Omit<AuditEntry, 'time'>) => void;
}

export const useSupportStore = create<SupportState>((set) => ({
  currentRole: 'Supplier User',
  mode: 'portal',
  setRole: (role) => set({ currentRole: role }),
  setMode: (mode) => set({ mode }),
  auditTrail: [
    { time: '2025-02-10T09:15:00Z', actor: 'Agent', event: 'Account unlocked', details: 'priya@globaltextiles.com unlocked after MFA lockout' },
    { time: '2025-02-10T09:00:00Z', actor: 'Agent', event: 'Invoice diagnosis', details: 'INV-8842 rejection explained to PrecisionParts Co' },
    { time: '2025-02-09T14:01:00Z', actor: 'Agent', event: 'IT escalation', details: 'INC-4421 created for FreshFoods upload bug' },
    { time: '2025-02-10T07:01:00Z', actor: 'Agent', event: 'Report generated', details: 'PO Summary Jan 2025 for Acme Industrial' },
  ],
  addAuditEntry: (entry) =>
    set((state) => ({
      auditTrail: [{ ...entry, time: new Date().toISOString() }, ...state.auditTrail],
    })),
}));
