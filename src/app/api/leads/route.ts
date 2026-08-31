import { NextRequest, NextResponse } from "next/server";
import { getCrmData, saveCrmData } from "@/lib/crm-store";
import { getSiteContent } from "@/lib/content-store";
import { makeId } from "@/lib/id";
import type { Lead } from "@/lib/crm-types";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { draftLeadReply } from "@/lib/ai/lead-agent";
import { sendMessage } from "@/lib/telegram/client";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_MESSAGE_LENGTH = 5000;
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  const rateLimitKey = getClientIp(request);
  if (!checkRateLimit(rateLimitKey, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: "Message too long" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const lead: Lead = {
    id: makeId("lead"),
    name,
    email,
    message,
    source: "contact_form",
    status: "new",
    createdAt: now,
    updatedAt: now,
    clientId: null,
    notes: null,
    suggestedReply: null,
  };

  // Best-effort: draft a suggested reply before saving, so it's persisted in
  // the same write. Never let this block or fail lead capture.
  try {
    const content = await getSiteContent();
    lead.suggestedReply = await draftLeadReply(lead, content);
  } catch {
    // AI drafting unavailable/failed — lead is still saved without a draft.
  }

  try {
    const data = await getCrmData();
    data.leads.push(lead);
    await saveCrmData(data);
  } catch {
    return NextResponse.json({ ok: true, persisted: false });
  }

  // Best-effort: notify the owner on Telegram. Never let this affect the response.
  try {
    const ownerChatId = process.env.TELEGRAM_OWNER_CHAT_ID;
    if (ownerChatId) {
      const lines = [
        `New lead: ${lead.name} (${lead.email})`,
        lead.message,
      ];
      if (lead.suggestedReply) {
        lines.push("", "Suggested reply:", lead.suggestedReply);
      }
      await sendMessage(Number(ownerChatId), lines.join("\n"));
    }
  } catch {
    // Telegram notification failed — lead is still saved.
  }

  return NextResponse.json({ ok: true, persisted: true });
}
