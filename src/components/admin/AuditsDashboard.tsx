"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AuditData, SiteAudit } from "@/lib/audit-types";

export function AuditsDashboard({ initialData }: { initialData: AuditData }) {
  const router = useRouter();
  const [audits, setAudits] = useState<SiteAudit[]>(initialData.audits);
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [running, setRunning] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  async function api(path: string, options?: RequestInit) {
    const res = await fetch(path, { headers: { "Content-Type": "application/json" }, ...options });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      setError(json?.error || "Request failed");
      return null;
    }
    setError(null);
    return json;
  }

  async function runAudit() {
    if (!urlInput.trim()) return;
    setRunning(true);
    const audit = await api("/api/admin/audits", {
      method: "POST",
      body: JSON.stringify({ url: urlInput.trim() }),
    });
    setRunning(false);
    if (audit) {
      setAudits((prev) => [...prev, audit]);
      setUrlInput("");
    }
  }

  async function generateFindings(id: string) {
    setGeneratingId(id);
    const updated = await api(`/api/admin/audits/${id}/findings`, { method: "POST" });
    setGeneratingId(null);
    if (updated) setAudits((prev) => prev.map((a) => (a.id === id ? updated : a)));
  }

  async function deleteAudit(id: string) {
    const res = await api(`/api/admin/audits/${id}`, { method: "DELETE" });
    if (res) setAudits((prev) => prev.filter((a) => a.id !== id));
  }

  async function copyAuditLink(id: string) {
    const url = `${window.location.origin}/audit/${id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 2000);
    } catch {
      setError("Could not copy link");
    }
  }

  const history = [...audits].reverse();

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>Audits</h1>
        <div className="admin-header-actions">
          {error && <span className="admin-status">{error}</span>}
          <Link href="/admin" className="admin-nav-link">
            Site content
          </Link>
          <Link href="/admin/crm" className="admin-nav-link">
            Leads &amp; clients
          </Link>
          <Link href="/admin/social" className="admin-nav-link">
            Social
          </Link>
          <button type="button" onClick={handleLogout} className="admin-logout">
            Log out
          </button>
        </div>
      </header>

      <section className="admin-section">
        <h2>Website Audit</h2>
        <div className="admin-field-pair">
          <div className="admin-field">
            <label>URL to audit</label>
            <input
              type="text"
              placeholder="https://example.com"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
            />
          </div>
        </div>
        <button type="button" className="admin-add" onClick={runAudit} disabled={running}>
          {running ? "Running audit..." : "+ Run audit"}
        </button>

        {audits.length === 0 && <p className="admin-status">No audits yet.</p>}

        {history.map((audit) => (
          <div className="admin-item" key={audit.id}>
            <div className="admin-item-head">
              <strong>{audit.url}</strong>
              <span className="admin-status">{new Date(audit.fetchedAt).toLocaleDateString("en-US")}</span>
              <button type="button" onClick={() => copyAuditLink(audit.id)}>
                {copiedId === audit.id ? "Copied!" : "Copy link"}
              </button>
              <button
                type="button"
                onClick={() => generateFindings(audit.id)}
                disabled={generatingId === audit.id}
              >
                {generatingId === audit.id
                  ? "Generating..."
                  : audit.findings
                    ? "Regenerate findings"
                    : "Generate findings"}
              </button>
              <button type="button" className="admin-remove" onClick={() => deleteAudit(audit.id)}>
                Delete
              </button>
            </div>

            <p className="admin-status">
              Performance: {audit.performanceScore} · Accessibility: {audit.accessibilityScore} · Best
              Practices: {audit.bestPracticesScore} · SEO: {audit.seoScore}
            </p>
            <p className="admin-status">
              Meta Pixel: {audit.hasMetaPixel ? "yes" : "no"} · Google Analytics:{" "}
              {audit.hasGoogleAnalytics ? "yes" : "no"} · TikTok Pixel: {audit.hasTikTokPixel ? "yes" : "no"}
            </p>
            {audit.findings && <p className="admin-status">{audit.findings}</p>}
          </div>
        ))}
      </section>
    </div>
  );
}
