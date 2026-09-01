import { head, put } from "@vercel/blob";
import { defaultContent } from "./default-content";
import type { SiteContent } from "./content-types";

const CONTENT_PATHNAME = "content/site-content.json";

// Defends against fields added to SiteContent after content was already saved to
// Blob: a saved document missing a newly-added field (e.g. contact.tiktok) would
// otherwise come back `undefined` instead of falling back to its default.
function mergeWithDefaults(saved: Partial<SiteContent> | null | undefined): SiteContent {
  const s = saved ?? {};
  return {
    hero: { ...defaultContent.hero, ...s.hero },
    services: Array.isArray(s.services) ? s.services : defaultContent.services,
    portfolio: Array.isArray(s.portfolio) ? s.portfolio : defaultContent.portfolio,
    about: { ...defaultContent.about, ...s.about },
    contact: { ...defaultContent.contact, ...s.contact },
    footer: { ...defaultContent.footer, ...s.footer },
  };
}

export async function getSiteContent(): Promise<SiteContent> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return defaultContent;

  try {
    const blob = await head(CONTENT_PATHNAME, { token }).catch(() => null);
    if (!blob) return defaultContent;

    const res = await fetch(`${blob.url}?v=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return defaultContent;

    return mergeWithDefaults((await res.json()) as Partial<SiteContent>);
  } catch {
    return defaultContent;
  }
}

export async function saveSiteContent(content: SiteContent): Promise<void> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error("BLOB_READ_WRITE_TOKEN is not configured");

  await put(CONTENT_PATHNAME, JSON.stringify(content, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    token,
  });
}
