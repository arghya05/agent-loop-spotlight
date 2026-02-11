import { create } from 'zustand';

export type ContractRole = 'Category Manager' | 'Procurement' | 'Finance Controller' | 'Admin';

interface AuditEntry {
  time: string;
  actor: string;
  event: string;
  details: string;
}

interface ContractState {
  currentRole: ContractRole;
  setRole: (role: ContractRole) => void;
  auditTrail: AuditEntry[];
  addAuditEntry: (entry: Omit<AuditEntry, 'time'>) => void;
}

export const useContractStore = create<ContractState>((set) => ({
  currentRole: 'Category Manager',
  setRole: (role) => set({ currentRole: role }),
  auditTrail: [
    { time: '2025-02-01T14:00:00Z', actor: 'Agent', event: 'Penalty notice sent', details: 'PrecisionParts Co: $28.6K late delivery penalty notice dispatched' },
    { time: '2025-02-01T12:15:00Z', actor: 'Agent', event: 'Violation detected', details: 'CTR-003: Price variance $42K on IC-2200; penalty $28.6K for late deliveries' },
    { time: '2025-02-01T12:00:00Z', actor: 'Agent', event: 'Transaction linking complete', details: 'Linked 342 POs, 289 GRNs, 156 invoices to 47 obligations' },
    { time: '2025-01-27T08:00:00Z', actor: 'Agent', event: 'Renegotiation opportunity', details: 'CTR-005 MegaLogistics: freight rates 13.5% above market; $124K savings potential' },
  ],
  addAuditEntry: (entry) =>
    set((state) => ({
      auditTrail: [{ ...entry, time: new Date().toISOString() }, ...state.auditTrail],
    })),
}));
