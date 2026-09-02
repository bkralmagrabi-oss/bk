import { head, put } from "@vercel/blob";

export type ConversationRole = "user" | "assistant";
export type ConversationMessage = { role: ConversationRole; content: string };

export type LeadState = {
  leadId: string | null;
  name: string | null;
  need: string | null;
};

export type ConversationStage = "new" | "qualifying" | "booked" | "escalated";

export type Conversation = {
  phone: string;
  messages: ConversationMessage[];
  lead: LeadState;
  stage: ConversationStage;
  updatedAt: string;
};

type ConversationStoreData = Record<string, Conversation>;

const STORE_PATHNAME = "content/whatsapp-conversations.json";
// Bounds token usage per turn — only the most recent exchanges are kept, not
// the whole conversation history.
const MAX_MESSAGES = 20;

// Same warm-process-cache-over-Blob pattern as crm-store.ts: Vercel Blob has
// read-after-write lag, so a save from one request isn't always visible to a
// read from the very next request on the same warm instance.
const CACHE_TTL_MS = 30_000;
type CacheEntry = { data: ConversationStoreData; savedAt: number };
const globalCache = globalThis as typeof globalThis & { __bkWhatsappCache?: CacheEntry | null };
function getCache(): CacheEntry | null {
  return globalCache.__bkWhatsappCache ?? null;
}
function setCache(entry: CacheEntry): void {
  globalCache.__bkWhatsappCache = entry;
}

function emptyConversation(phone: string): Conversation {
  return {
    phone,
    messages: [],
    lead: { leadId: null, name: null, need: null },
    stage: "new",
    updatedAt: new Date().toISOString(),
  };
}

async function fetchAllFromBlob(): Promise<ConversationStoreData> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return {};

  try {
    const blob = await head(STORE_PATHNAME, { token }).catch(() => null);
    if (!blob) return {};

    const res = await fetch(`${blob.url}?v=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return {};

    const data = (await res.json()) as ConversationStoreData;
    setCache({ data, savedAt: Date.now() });
    return data;
  } catch {
    return {};
  }
}

async function getAllConversations(): Promise<ConversationStoreData> {
  const cached = getCache();
  if (cached && Date.now() - cached.savedAt < CACHE_TTL_MS) return cached.data;
  return fetchAllFromBlob();
}

export async function getConversation(phone: string): Promise<Conversation> {
  const all = await getAllConversations();
  return all[phone] ?? emptyConversation(phone);
}

// Best-effort: a customer-facing reply should never fail just because
// conversation memory couldn't be persisted (e.g. Blob not configured yet).
export async function saveConversation(phone: string, conversation: Conversation): Promise<void> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return;

  const trimmed: Conversation = {
    ...conversation,
    messages: conversation.messages.slice(-MAX_MESSAGES),
    updatedAt: new Date().toISOString(),
  };

  const all = await getAllConversations();
  all[phone] = trimmed;

  await put(STORE_PATHNAME, JSON.stringify(all, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    token,
  });
  setCache({ data: all, savedAt: Date.now() });
}
