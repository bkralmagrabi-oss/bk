export type SiteAudit = {
  id: string;
  url: string;
  fetchedAt: string;
  performanceScore: number;
  accessibilityScore: number;
  bestPracticesScore: number;
  seoScore: number;
  largestContentfulPaint: string | null;
  cumulativeLayoutShift: string | null;
  totalBlockingTime: string | null;
  hasMetaPixel: boolean;
  hasGoogleAnalytics: boolean;
  hasTikTokPixel: boolean;
  findings: string | null;
};

export type AuditData = {
  audits: SiteAudit[];
};

export const emptyAuditData: AuditData = { audits: [] };

export function isValidAuditData(value: unknown): value is AuditData {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return Array.isArray(v.audits);
}
