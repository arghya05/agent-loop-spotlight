import { create } from 'zustand';

export type ProductRole = 'Catalog Manager' | 'Buyer' | 'Compliance Officer' | 'Admin';

interface AuditEntry {
  time: string;
  actor: string;
  event: string;
  details: string;
}

interface ProductState {
  currentRole: ProductRole;
  setRole: (role: ProductRole) => void;
  auditTrail: AuditEntry[];
  addAuditEntry: (entry: Omit<AuditEntry, 'time'>) => void;
  itemOverrides: Record<string, { status?: string }>;
  updateItem: (id: string, patch: { status?: string }) => void;
}

export const useProductStore = create<ProductState>((set) => ({
  currentRole: 'Catalog Manager',
  setRole: (role) => set({ currentRole: role }),
  auditTrail: [
    { time: '2026-06-18T08:48:00Z', actor: 'Activate Agent', event: 'SKU published', details: 'NEW-SKU-88641 Orbit Yoga Mat → web, app, marketplace' },
    { time: '2026-06-18T08:44:00Z', actor: 'Compliance Agent', event: 'Certificate missing', details: 'NEW-SKU-88533 Nimbus Toddler Bath Robe escalated for OEKO-TEX upload' },
    { time: '2026-06-18T08:38:00Z', actor: 'Image & Copy Agent', event: 'Copy generated', details: 'Bullet pack for NEW-SKU-88317 Atlas Travel Mug created via Copy AI' },
    { time: '2026-06-18T08:30:00Z', actor: 'Intake Agent', event: 'Submissions pulled', details: '18 new-item packets from 6 suppliers ingested via SFTP' },
  ],
  addAuditEntry: (entry) =>
    set((state) => ({
      auditTrail: [{ ...entry, time: new Date().toISOString() }, ...state.auditTrail],
    })),
  itemOverrides: {},
  updateItem: (id, patch) =>
    set((state) => ({
      itemOverrides: { ...state.itemOverrides, [id]: { ...state.itemOverrides[id], ...patch } },
    })),
}));
