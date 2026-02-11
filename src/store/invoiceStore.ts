import { create } from 'zustand';

export type InvoiceRole = 'AP Analyst' | 'Finance Manager' | 'Controller' | 'Admin';

interface AuditEvent {
  time: string;
  actor: string;
  event: string;
  details: string;
}

interface InvoiceStoreState {
  role: InvoiceRole;
  setRole: (role: InvoiceRole) => void;
  auditTrail: AuditEvent[];
  addAuditEvent: (event: AuditEvent) => void;
}

export const useInvoiceStore = create<InvoiceStoreState>((set) => ({
  role: 'AP Analyst',
  setRole: (role) => set({ role }),
  auditTrail: [
    { time: '2025-02-01T12:16:00Z', actor: 'Matching Agent', event: 'Batch match completed', details: '10/12 invoices matched. 2 flagged.' },
    { time: '2025-02-01T12:00:00Z', actor: 'Anomaly Agent', event: 'Anomaly scan completed', details: '1 duplicate, 2 price variances, 1 missing GRN detected.' },
    { time: '2025-01-30T10:00:00Z', actor: 'Dispute Agent', event: 'Counter-offer sent', details: 'DSP-002: Revised credit note $7,387 sent to TechParts Asia.' },
    { time: '2025-01-28T09:00:00Z', actor: 'Dispute Agent', event: 'Dispute created', details: 'DSP-002 opened for INV-2024-8890 (qty + freight mismatch).' },
    { time: '2025-01-23T10:00:00Z', actor: 'Dispute Agent', event: 'Dispute created', details: 'DSP-001 opened for INV-2024-8851 (price + qty mismatch).' }
  ],
  addAuditEvent: (event) => set((state) => ({ auditTrail: [event, ...state.auditTrail] })),
}));
