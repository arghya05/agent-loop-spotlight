import { create } from 'zustand';

export type PricingRole = 'Pricing Manager' | 'Merchandiser' | 'Finance Controller' | 'Admin';

interface AuditEntry {
  time: string;
  actor: string;
  event: string;
  details: string;
}

interface PricingState {
  currentRole: PricingRole;
  setRole: (role: PricingRole) => void;
  auditTrail: AuditEntry[];
  addAuditEntry: (entry: Omit<AuditEntry, 'time'>) => void;
  signalOverrides: Record<string, { status?: string; approvedPrice?: number }>;
  updateSignal: (id: string, patch: { status?: string; approvedPrice?: number }) => void;
}

export const usePricingStore = create<PricingState>((set) => ({
  currentRole: 'Pricing Manager',
  setRole: (role) => set({ currentRole: role }),
  auditTrail: [
    { time: '2026-06-18T08:42:00Z', actor: 'Executor Agent', event: 'Price published', details: 'SKU-30087 Halo Smart Bulb 4-Pack → $44.99 on web/app/POS' },
    { time: '2026-06-18T08:38:00Z', actor: 'Margin Supervisor', event: 'Markdown approved', details: 'SKU-90004 Bayside Tote → $29.00 (clearance, above floor)' },
    { time: '2026-06-18T08:32:00Z', actor: 'Classifier Agent', event: 'Signals classified', details: '142 SKUs classified: 64 reprice / 41 promote / 37 markdown' },
    { time: '2026-06-18T08:30:00Z', actor: 'Signal Retriever', event: 'External data pulled', details: 'DataWeave + Price2Spy + Google Trends + POS feeds refreshed' },
  ],
  addAuditEntry: (entry) =>
    set((state) => ({
      auditTrail: [{ ...entry, time: new Date().toISOString() }, ...state.auditTrail],
    })),
  signalOverrides: {},
  updateSignal: (id, patch) =>
    set((state) => ({
      signalOverrides: { ...state.signalOverrides, [id]: { ...state.signalOverrides[id], ...patch } },
    })),
}));
