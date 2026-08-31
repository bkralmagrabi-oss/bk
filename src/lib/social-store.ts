import { head, put } from "@vercel/blob";
import { emptySocialData, isValidSocialData, type SocialData } from "./social-types";

const SOCIAL_PATHNAME = "content/social-data.json";

// Same Blob read-after-write lag as crm-store.ts — see the comment there.
const CACHE_TTL_MS = 30_000;
type CacheEntry = { data: SocialData; savedAt: number };
const globalCache = globalThis as typeof globalThis & { __bkSocialCache?: CacheEntry | null };
function getCache(): CacheEntry | null {
  return globalCache.__bkSocialCache ?? null;
}
function setCache(entry: CacheEntry): void {
  globalCache.__bkSocialCache = entry;
}

async function fetchFromBlob(): Promise<SocialData> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return emptySocialData;

  try {
    const blob = await head(SOCIAL_PATHNAME, { token }).catch(() => null);
    if (!blob) return emptySocialData;

    const res = await fetch(`${blob.url}?v=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return emptySocialData;

    const data = await res.json();
    const result = isValidSocialData(data) ? data : emptySocialData;
    setCache({ data: result, savedAt: Date.now() });
    return result;
  } catch {
    return emptySocialData;
  }
}

export async function getSocialData(): Promise<SocialData> {
  const cached = getCache();
  if (cached && Date.now() - cached.savedAt < CACHE_TTL_MS) return cached.data;
  return fetchFromBlob();
}

export async function getSocialDataUntil(
  predicate: (data: SocialData) => boolean,
  attempts = 5,
  delayMs = 400,
): Promise<SocialData> {
  let data = await getSocialData();
  for (let i = 1; i < attempts && !predicate(data); i++) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    data = await fetchFromBlob();
  }
  return data;
}

export async function saveSocialData(data: SocialData): Promise<void> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error("BLOB_READ_WRITE_TOKEN is not configured");

  await put(SOCIAL_PATHNAME, JSON.stringify(data, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    token,
  });
  setCache({ data, savedAt: Date.now() });
}
