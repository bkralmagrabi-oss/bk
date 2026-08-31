import { head, put } from "@vercel/blob";
import { defaultContent } from "./default-content";
import type { SiteContent } from "./content-types";

const CONTENT_PATHNAME = "content/site-content.json";

export async function getSiteContent(): Promise<SiteContent> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return defaultContent;

  try {
    const blob = await head(CONTENT_PATHNAME, { token }).catch(() => null);
    if (!blob) return defaultContent;

    const res = await fetch(`${blob.url}?v=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return defaultContent;

    return (await res.json()) as SiteContent;
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
