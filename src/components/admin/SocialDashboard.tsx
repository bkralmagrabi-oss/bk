"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { InstagramSnapshot, SocialData } from "@/lib/social-types";

export function SocialDashboard({ initialData }: { initialData: SocialData }) {
  const router = useRouter();
  const [snapshots, setSnapshots] = useState<InstagramSnapshot[]>(initialData.snapshots);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

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

  async function refresh() {
    setRefreshing(true);
    const snapshot = await api("/api/admin/social/refresh", { method: "POST" });
    setRefreshing(false);
    if (snapshot) setSnapshots((prev) => [...prev, snapshot]);
  }

  async function generateInsights(id: string) {
    setGeneratingId(id);
    const updated = await api(`/api/admin/social/insights/${id}`, { method: "POST" });
    setGeneratingId(null);
    if (updated) setSnapshots((prev) => prev.map((s) => (s.id === id ? updated : s)));
  }

  function engagementRate(snapshot: InstagramSnapshot): string {
    if (snapshot.latestPosts.length === 0 || snapshot.followersCount === 0) return "—";
    const totalEngagement = snapshot.latestPosts.reduce(
      (sum, p) => sum + p.likesCount + p.commentsCount,
      0,
    );
    const rate = totalEngagement / snapshot.latestPosts.length / snapshot.followersCount;
    return `${(rate * 100).toFixed(1)}%`;
  }

  const latest = snapshots[snapshots.length - 1] as InstagramSnapshot | undefined;
  const history = [...snapshots].reverse();

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>Social</h1>
        <div className="admin-header-actions">
          <Link href="/admin" className="admin-nav-link">
            Site content
          </Link>
          <Link href="/admin/crm" className="admin-nav-link">
            Leads &amp; clients
          </Link>
          <Link href="/admin/audits" className="admin-nav-link">
            Audits
          </Link>
          <button type="button" onClick={handleLogout} className="admin-logout">
            Log out
          </button>
        </div>
      </header>

      {error && (
        <div className="admin-error-banner" role="alert">
          {error}
        </div>
      )}

      <section className="crm-stats">
        <div className="crm-stat-tile">
          <span className="crm-stat-value">{latest ? latest.followersCount.toLocaleString("en-US") : "—"}</span>
          <span className="crm-stat-label">Followers</span>
        </div>
        <div className="crm-stat-tile">
          <span className="crm-stat-value">{latest ? latest.followsCount.toLocaleString("en-US") : "—"}</span>
          <span className="crm-stat-label">Following</span>
        </div>
        <div className="crm-stat-tile">
          <span className="crm-stat-value">{latest ? latest.postsCount.toLocaleString("en-US") : "—"}</span>
          <span className="crm-stat-label">Posts</span>
        </div>
        <div className="crm-stat-tile">
          <span className="crm-stat-value">{latest ? engagementRate(latest) : "—"}</span>
          <span className="crm-stat-label">Avg. engagement</span>
        </div>
      </section>

      <section className="admin-section">
        <h2>Instagram</h2>
        <button type="button" className="admin-add" onClick={refresh} disabled={refreshing}>
          {refreshing ? "Refreshing..." : "+ Refresh from Instagram"}
        </button>

        {snapshots.length === 0 && <p className="admin-status">No data yet — click refresh above.</p>}

        {history.map((snapshot) => (
          <div className="admin-item" key={snapshot.id}>
            <div className="admin-item-head">
              <strong>{new Date(snapshot.fetchedAt).toLocaleString("en-US")}</strong>
              <span className="admin-status">{snapshot.followersCount.toLocaleString("en-US")} followers</span>
              <span className="admin-status">Engagement: {engagementRate(snapshot)}</span>
              <button
                type="button"
                onClick={() => generateInsights(snapshot.id)}
                disabled={generatingId === snapshot.id}
              >
                {generatingId === snapshot.id
                  ? "Generating..."
                  : snapshot.insights
                    ? "Regenerate insights"
                    : "Generate insights"}
              </button>
            </div>

            {snapshot.insights && <p className="admin-status">{snapshot.insights}</p>}

            {snapshot.latestPosts.length > 0 && (
              <ul>
                {snapshot.latestPosts.slice(0, 5).map((post, i) => (
                  <li key={i} className="admin-status">
                    {post.likesCount.toLocaleString("en-US")} likes, {post.commentsCount.toLocaleString("en-US")}{" "}
                    comments — {post.caption.slice(0, 100) || "(no caption)"}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
