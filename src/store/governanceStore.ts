import { create } from 'zustand';

export type BucketTag = 'good' | 'average' | 'needs_review' | 'critical';

export interface Vendor {
  id: string;
  name: string;
  country: string;
  route: string;
  dc: string;
  categories: string[];
  owner: string;
  lastReviewDate: string;
  nextReviewDue: string;
  totals: {
    totalPOs: number;
    totalVolume: number;
    tradedDollar: number;
  };
  metrics: {
    otif: { current: number; previous: number; target: number };
    fillRate: { current: number; previous: number; target: number };
    quality: { current: number; previous: number; target: number };
    compliance: { current: number; previous: number; target: number };
  };
  trends: {
    otif: number[];
    fillRate: number[];
    quality: number[];
    compliance: number[];
  };
  complianceIssues: {
    type: string;
    severity: 'critical' | 'warning' | 'info';
    status: 'open' | 'resolved';
    firstSeen: string;
    lastSeen: string;
    evidence: string;
  }[];
  comms: {
    channel: string;
    messageType: string;
    sentAt: string;
    status: string;
    nextFollowUpAt: string;
  }[];
  bucketTag: BucketTag;
  compositeScore: number;
  riskDrivers: string[];
}

export interface Plan {
  id: string;
  vendorId: string;
  status: 'draft' | 'pending' | 'approved' | 'executing' | 'closed';
  createdAt: string;
  actions: {
    id: string;
    category: 'LOGISTICS' | 'SUPPLIER' | 'POLICY';
    title: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    owner: string;
    dueDate: string;
    expectedImpact: string;
    enabled: boolean;
  }[];
  approvals: {
    role: string;
    approverName: string;
    time: string;
    decision: 'approved' | 'rejected';
  }[];
}

export interface AgentConfig {
  id: string;
  agentName: string;
  description: string;
  active: boolean;
  schedule: string;
  lastRun: string;
  nextRun: string;
  lastOutcome: 'success' | 'warning' | 'error';
  logs: {
    time: string;
    status: string;
    duration: number;
    summary: string;
  }[];
}

export interface ScoringSettings {
  weights: {
    otif: number;
    fillRate: number;
    quality: number;
    compliance: number;
  };
  thresholds: {
    good: number;
    average: number;
    needsReview: number;
    critical: number;
  };
}

export interface PolicyControl {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  threshold: number;
  consecutiveDays: number;
  triggeredCount: number;
}

interface GovernanceState {
  // Data
  vendors: Vendor[];
  plans: Plan[];
  agentConfigs: AgentConfig[];
  
  // Settings
  scoringSettings: ScoringSettings;
  policyControls: PolicyControl[];
  
  // UI State
  selectedVendorId: string | null;
  selectedBucketFilter: BucketTag | 'all';
  searchQuery: string;
  dateRange: { start: string; end: string };
  regionFilter: string;
  
  // Timestamps
  lastRefresh: string;
  
  // Computed
  getBucketStats: () => {
    good: { count: number; spend: number; pos: number; drivers: string[] };
    average: { count: number; spend: number; pos: number; drivers: string[] };
    needs_review: { count: number; spend: number; pos: number; drivers: string[] };
    critical: { count: number; spend: number; pos: number; drivers: string[] };
  };
  getAttentionQueue: () => Vendor[];
  getVendorById: (id: string) => Vendor | undefined;
  getPlanByVendorId: (vendorId: string) => Plan | undefined;
  
  // Actions
  setVendors: (vendors: Vendor[]) => void;
  setPlans: (plans: Plan[]) => void;
  setAgentConfigs: (configs: AgentConfig[]) => void;
  selectVendor: (vendorId: string | null) => void;
  setBucketFilter: (bucket: BucketTag | 'all') => void;
  setSearchQuery: (query: string) => void;
  updateScoringSettings: (settings: ScoringSettings) => void;
  updatePolicyControl: (id: string, updates: Partial<PolicyControl>) => void;
  approvePlan: (planId: string, approverName: string, role: string) => void;
  updatePlanStatus: (planId: string, status: Plan['status']) => void;
  togglePlanAction: (planId: string, actionId: string) => void;
  addAuditEntry: (entry: { action: string; details: string; actor: string }) => void;
  refreshData: () => void;
}

// Import mock data
import vendorsData from '@/data/governance/vendors.json';
import plansData from '@/data/governance/plans.json';
import agentConfigsData from '@/data/governance/agentConfigs.json';
import settingsData from '@/data/governance/settings.json';

export const useGovernanceStore = create<GovernanceState>((set, get) => ({
  // Initial data from JSON
  vendors: vendorsData.vendors as Vendor[],
  plans: plansData.plans as Plan[],
  agentConfigs: agentConfigsData.agents as AgentConfig[],
  
  // Settings
  scoringSettings: settingsData.scoring as ScoringSettings,
  policyControls: settingsData.policyControls as PolicyControl[],
  
  // UI State
  selectedVendorId: null,
  selectedBucketFilter: 'all',
  searchQuery: '',
  dateRange: { start: '2024-01-01', end: '2024-01-20' },
  regionFilter: 'all',
  
  // Timestamps
  lastRefresh: settingsData.lastRefresh,
  
  // Computed getters
  getBucketStats: () => {
    const vendors = get().vendors;
    const buckets = {
      good: { count: 0, spend: 0, pos: 0, drivers: [] as string[] },
      average: { count: 0, spend: 0, pos: 0, drivers: [] as string[] },
      needs_review: { count: 0, spend: 0, pos: 0, drivers: [] as string[] },
      critical: { count: 0, spend: 0, pos: 0, drivers: [] as string[] }
    };
    
    vendors.forEach(v => {
      const bucket = buckets[v.bucketTag];
      bucket.count++;
      bucket.spend += v.totals.tradedDollar;
      bucket.pos += v.totals.totalPOs;
      v.riskDrivers.forEach(d => {
        if (!bucket.drivers.includes(d)) bucket.drivers.push(d);
      });
    });
    
    // Keep only top 2 drivers per bucket
    Object.keys(buckets).forEach(key => {
      buckets[key as BucketTag].drivers = buckets[key as BucketTag].drivers.slice(0, 2);
    });
    
    return buckets;
  },
  
  getAttentionQueue: () => {
    const vendors = get().vendors;
    return vendors
      .filter(v => v.bucketTag === 'critical' || v.bucketTag === 'needs_review')
      .sort((a, b) => a.compositeScore - b.compositeScore);
  },
  
  getVendorById: (id: string) => {
    return get().vendors.find(v => v.id === id);
  },
  
  getPlanByVendorId: (vendorId: string) => {
    return get().plans.find(p => p.vendorId === vendorId);
  },
  
  // Actions
  setVendors: (vendors) => set({ vendors }),
  setPlans: (plans) => set({ plans }),
  setAgentConfigs: (configs) => set({ agentConfigs: configs }),
  
  selectVendor: (vendorId) => set({ selectedVendorId: vendorId }),
  
  setBucketFilter: (bucket) => set({ selectedBucketFilter: bucket }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  updateScoringSettings: (settings) => {
    set({ scoringSettings: settings });
    // Recalculate composite scores
    const vendors = get().vendors.map(v => {
      const score = 
        v.metrics.otif.current * settings.weights.otif +
        v.metrics.fillRate.current * settings.weights.fillRate +
        v.metrics.quality.current * settings.weights.quality +
        (100 - v.metrics.compliance.current * 10) * settings.weights.compliance;
      
      let bucketTag: BucketTag = 'good';
      if (score < settings.thresholds.needsReview) bucketTag = 'critical';
      else if (score < settings.thresholds.average) bucketTag = 'needs_review';
      else if (score < settings.thresholds.good) bucketTag = 'average';
      
      return { ...v, compositeScore: score, bucketTag };
    });
    set({ vendors });
  },
  
  updatePolicyControl: (id, updates) => {
    const controls = get().policyControls.map(p => 
      p.id === id ? { ...p, ...updates } : p
    );
    set({ policyControls: controls });
  },
  
  approvePlan: (planId, approverName, role) => {
    const plans = get().plans.map(p => {
      if (p.id === planId) {
        return {
          ...p,
          status: 'approved' as const,
          approvals: [...p.approvals, {
            role,
            approverName,
            time: new Date().toISOString(),
            decision: 'approved' as const
          }]
        };
      }
      return p;
    });
    set({ plans });
  },
  
  updatePlanStatus: (planId, status) => {
    const plans = get().plans.map(p => 
      p.id === planId ? { ...p, status } : p
    );
    set({ plans });
  },
  
  togglePlanAction: (planId, actionId) => {
    const plans = get().plans.map(p => {
      if (p.id === planId) {
        return {
          ...p,
          actions: p.actions.map(a => 
            a.id === actionId ? { ...a, enabled: !a.enabled } : a
          )
        };
      }
      return p;
    });
    set({ plans });
  },
  
  addAuditEntry: (entry) => {
    // This would integrate with the main app store audit trail
    console.log('Audit entry:', entry);
  },
  
  refreshData: () => {
    set({ lastRefresh: new Date().toISOString() });
  }
}));
