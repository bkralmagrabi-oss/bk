import { head, put } from "@vercel/blob";
import { emptyAuditData, isValidAuditData, type AuditData } from "./audit-types";

const AUDIT_PATHNAME = "content/audit-data.json";

// Same Blob read-after-write lag as crm-store.ts — see the comment there.
const CACHE_TTL_MS = 30_000;
type CacheEntry = { data: AuditData; savedAt: number };
const globalCache = globalThis as typeof globalThis & { __bkAuditCache?: CacheEntry | null };
function getCache(): CacheEntry | null {
  return globalCache.__bkAuditCache ?? null;
}
function setCache(entry: CacheEntry): void {
  globalCache.__bkAuditCache = entry;
}

async function fetchFromBlob(): Promise<AuditData> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return emptyAuditData;

  try {
    const blob = await head(AUDIT_PATHNAME, { token }).catch(() => null);
    if (!blob) return emptyAuditData;

    const res = await fetch(`${blob.url}?v=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return emptyAuditData;

    const data = await res.json();
    const result = isValidAuditData(data) ? data : emptyAuditData;
    setCache({ data: result, savedAt: Date.now() });
    return result;
  } catch {
    return emptyAuditData;
  }
}

export async function getAuditData(): Promise<AuditData> {
  const cached = getCache();
  if (cached && Date.now() - cached.savedAt < CACHE_TTL_MS) return cached.data;
  return fetchFromBlob();
}

export async function getAuditDataUntil(
  predicate: (data: AuditData) => boolean,
  attempts = 5,
  delayMs = 400,
): Promise<AuditData> {
  let data = await getAuditData();
  for (let i = 1; i < attempts && !predicate(data); i++) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    data = await fetchFromBlob();
  }
  return data;
}

export async function saveAuditData(data: AuditData): Promise<void> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error("BLOB_READ_WRITE_TOKEN is not configured");

  await put(AUDIT_PATHNAME, JSON.stringify(data, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    token,
  });
  setCache({ data, savedAt: Date.now() });
}
