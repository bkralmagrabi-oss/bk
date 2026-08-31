import { head, put } from "@vercel/blob";
import { emptyCrmData, isValidCrmData, type CrmData } from "./crm-types";

const CRM_PATHNAME = "content/crm-data.json";

// Vercel Blob has read-after-write lag: a save from one request isn't always
// visible to a head()/fetch() from the very next request. This warm-process
// cache serves the most recent known state immediately when available. It's
// per-process, not a lock — a cold serverless instance, or a request handled
// by a different warm instance, still falls back to a real Blob read.
const CACHE_TTL_MS = 30_000;
type CacheEntry = { data: CrmData; savedAt: number };
// Next.js compiles route handlers and page server components as separate
// module graphs, so a plain module-level variable here isn't reliably shared
// between an API route's write and a page's read. globalThis is scoped to the
// actual JS realm/process instead, which does survive that boundary.
const globalCache = globalThis as typeof globalThis & { __bkCrmCache?: CacheEntry | null };
function getCache(): CacheEntry | null {
  return globalCache.__bkCrmCache ?? null;
}
function setCache(entry: CacheEntry): void {
  globalCache.__bkCrmCache = entry;
}

async function fetchFromBlob(): Promise<CrmData> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return emptyCrmData;

  try {
    const blob = await head(CRM_PATHNAME, { token }).catch(() => null);
    if (!blob) return emptyCrmData;

    const res = await fetch(`${blob.url}?v=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return emptyCrmData;

    const data = await res.json();
    const result = isValidCrmData(data) ? data : emptyCrmData;
    setCache({ data: result, savedAt: Date.now() });
    return result;
  } catch {
    return emptyCrmData;
  }
}

export async function getCrmData(): Promise<CrmData> {
  const cached = getCache();
  if (cached && Date.now() - cached.savedAt < CACHE_TTL_MS) return cached.data;
  return fetchFromBlob();
}

/**
 * Reads until `predicate` matches (e.g. "this record I just created is
 * present") or attempts run out. A cache hit won't satisfy a predicate for
 * something another process/instance just wrote, so retries beyond the first
 * always force a real Blob read rather than repeating the same cached miss.
 */
export async function getCrmDataUntil(
  predicate: (data: CrmData) => boolean,
  attempts = 5,
  delayMs = 400,
): Promise<CrmData> {
  let data = await getCrmData();
  for (let i = 1; i < attempts && !predicate(data); i++) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    data = await fetchFromBlob();
  }
  return data;
}

export async function saveCrmData(data: CrmData): Promise<void> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error("BLOB_READ_WRITE_TOKEN is not configured");

  await put(CRM_PATHNAME, JSON.stringify(data, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    token,
  });
  setCache({ data, savedAt: Date.now() });
}
