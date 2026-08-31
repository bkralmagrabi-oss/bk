export type LeadStatus = "new" | "contacted" | "converted" | "lost";

export type Lead = {
  id: string;
  name: string;
  email: string;
  message: string;
  source: string;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
  clientId: string | null;
  notes: string | null;
  suggestedReply: string | null;
};

export type Client = {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  leadId: string | null;
};

export type PricingTier = "basic" | "standard" | "premium" | "custom";
export type ProjectStatus = "proposed" | "in_progress" | "delivered" | "cancelled";

export type Project = {
  id: string;
  clientId: string;
  title: string;
  tier: PricingTier;
  priceSar: number;
  features: string[];
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  notes: string | null;
};

export type ContractStatus = "draft" | "sent" | "signed" | "cancelled";

export type Contract = {
  id: string;
  projectId: string;
  clientId: string;
  scopeOfWork: string;
  terms: string;
  priceSar: number;
  status: ContractStatus;
  signedFileUrl: string | null;
  createdAt: string;
  updatedAt: string;
  sentAt: string | null;
  signedAt: string | null;
  notes: string | null;
};

export type CrmData = {
  leads: Lead[];
  clients: Client[];
  projects: Project[];
  contracts: Contract[];
};

export const emptyCrmData: CrmData = { leads: [], clients: [], projects: [], contracts: [] };

export function isValidCrmData(value: unknown): value is CrmData {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    Array.isArray(v.leads) &&
    Array.isArray(v.clients) &&
    Array.isArray(v.projects) &&
    Array.isArray(v.contracts)
  );
}

export const LEAD_STATUSES: LeadStatus[] = ["new", "contacted", "converted", "lost"];
export const PRICING_TIERS: PricingTier[] = ["basic", "standard", "premium", "custom"];
export const PROJECT_STATUSES: ProjectStatus[] = [
  "proposed",
  "in_progress",
  "delivered",
  "cancelled",
];
export const CONTRACT_STATUSES: ContractStatus[] = ["draft", "sent", "signed", "cancelled"];
