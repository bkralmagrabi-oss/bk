import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAuditData } from "@/lib/audit-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Website Audit — BK Web Design",
  robots: { index: false, follow: false },
};

function scoreClass(score: number): string {
  if (score >= 90) return "audit-score-good";
  if (score >= 50) return "audit-score-ok";
  return "audit-score-bad";
}

export default async function AuditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getAuditData();
  const audit = data.audits.find((a) => a.id === id);
  if (!audit) notFound();

  const scores = [
    { label: "Performance", value: audit.performanceScore },
    { label: "Accessibility", value: audit.accessibilityScore },
    { label: "Best Practices", value: audit.bestPracticesScore },
    { label: "SEO", value: audit.seoScore },
  ];

  return (
    <div className="contract-page">
      <div className="contract-doc">
        <header className="contract-header">
          <span className="contract-brand">BK Web Design</span>
          <span className="contract-doc-label">Website Audit</span>
        </header>

        <dl className="contract-meta">
          <div>
            <dt>Site</dt>
            <dd>{audit.url}</dd>
          </div>
          <div>
            <dt>Date</dt>
            <dd>{new Date(audit.fetchedAt).toLocaleDateString("en-US")}</dd>
          </div>
        </dl>

        <section className="contract-section">
          <h2>Lighthouse Scores</h2>
          <div className="audit-scores">
            {scores.map((s) => (
              <div className={`audit-score-tile ${scoreClass(s.value)}`} key={s.label}>
                <span className="audit-score-value">{s.value}</span>
                <span className="audit-score-label">{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="contract-section">
          <h2>Core Web Vitals</h2>
          <p className="contract-body-text">
            Largest Contentful Paint: {audit.largestContentfulPaint ?? "—"}
            {"\n"}Cumulative Layout Shift: {audit.cumulativeLayoutShift ?? "—"}
            {"\n"}Total Blocking Time: {audit.totalBlockingTime ?? "—"}
          </p>
        </section>

        <section className="contract-section">
          <h2>Tracking</h2>
          <p className="contract-body-text">
            Meta Pixel: {audit.hasMetaPixel ? "Installed" : "Not detected"}
            {"\n"}Google Analytics: {audit.hasGoogleAnalytics ? "Installed" : "Not detected"}
            {"\n"}TikTok Pixel: {audit.hasTikTokPixel ? "Installed" : "Not detected"}
          </p>
        </section>

        {audit.findings && (
          <section className="contract-section">
            <h2>Findings &amp; Recommendations</h2>
            <p className="contract-body-text">{audit.findings}</p>
          </section>
        )}
      </div>
    </div>
  );
}
