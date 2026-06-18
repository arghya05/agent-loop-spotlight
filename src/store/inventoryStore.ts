import { create } from 'zustand';

export type InventoryRole = 'Inventory Planner' | 'Demand Planner' | 'Ops Director' | 'Admin';

interface AuditEntry {
  time: string;
  actor: string;
  event: string;
  details: string;
}

interface InventoryState {
  currentRole: InventoryRole;
  setRole: (role: InventoryRole) => void;
  auditTrail: AuditEntry[];
  addAuditEntry: (entry: Omit<AuditEntry, 'time'>) => void;
  signalOverrides: Record<string, { status?: string; approvedQty?: number }>;
  updateSignal: (id: string, patch: { status?: string; approvedQty?: number }) => void;
}

export const useInventoryStore = create<InventoryState>((set) => ({
  currentRole: 'Inventory Planner',
  setRole: (role) => set({ currentRole: role }),
  auditTrail: [
    { time: '2026-06-18T08:42:00Z', actor: 'OrderAgent', event: 'PO placed', details: 'PO-238711 → Nova Audio Ltd · 1,500 units · DC-Dubai-01' },
    { time: '2026-06-18T08:38:00Z', actor: 'InventoryAgent', event: 'STO created', details: 'STO-118842 · DC-Jeddah → DC-Riyadh · 320 units Aurora Air Fryer' },
    { time: '2026-06-18T08:32:00Z', actor: 'ForecastAgent', event: 'Forecast revised', details: '142 SKUs re-forecasted: +12 trending up, -8 trending down' },
    { time: '2026-06-18T08:30:00Z', actor: 'ForecastAgent', event: 'Demand signals pulled', details: 'POS + WMS + SupplierEDI + Google Trends refreshed' },
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
