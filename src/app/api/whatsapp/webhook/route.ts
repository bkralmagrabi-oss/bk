import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getSiteContent } from "@/lib/content-store";
import { getConversation, saveConversation } from "@/lib/whatsapp/conversation-store";
import { generateWhatsappReply } from "@/lib/ai/whatsapp-agent";
import { sendTextMessage, markAsRead } from "@/lib/whatsapp/client";
import { checkRateLimit } from "@/lib/rate-limit";

const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && challenge && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

function isValidSignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret || !signatureHeader) return false;

  const expected = `sha256=${crypto.createHmac("sha256", secret).update(rawBody).digest("hex")}`;
  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(signatureHeader);
  if (expectedBuf.length !== actualBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}

type WhatsappWebhookPayload = {
  entry?: {
    changes?: {
      value?: {
        contacts?: { profile?: { name?: string } }[];
        messages?: { id: string; from: string; type: string; text?: { body?: string } }[];
      };
    }[];
  }[];
};

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  if (!isValidSignature(rawBody, request.headers.get("x-hub-signature-256"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as WhatsappWebhookPayload;
  const value = payload.entry?.[0]?.changes?.[0]?.value;
  const message = value?.messages?.[0];

  // Non-message events (delivery/read receipts, etc.) hit this same webhook —
  // there's nothing to reply to, so just acknowledge.
  if (!message || message.type !== "text" || !message.text?.body) {
    return NextResponse.json({ ok: true });
  }

  const from = message.from;
  const text = message.text.body;
  const contactName = value?.contacts?.[0]?.profile?.name;

  if (!checkRateLimit(`whatsapp:${from}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS)) {
    return NextResponse.json({ ok: true });
  }

  try {
    const [content, conversation] = await Promise.all([getSiteContent(), getConversation(from)]);
    conversation.messages.push({ role: "user", content: text });

    const reply = await generateWhatsappReply({ conversation, content, phone: from, contactName });
    conversation.messages.push({ role: "assistant", content: reply });

    // The reply is the critical path — send it first. Persisting conversation
    // memory and marking the message read are best-effort and must not block
    // or fail the customer-facing response.
    await sendTextMessage(from, reply);

    await Promise.allSettled([saveConversation(from, conversation), markAsRead(message.id)]);
  } catch (err) {
    console.error("whatsapp webhook error", err);
    await sendTextMessage(
      from,
      /[؀-ۿ]/.test(text)
        ? "عذرًا، حدث خطأ. سيتواصل معك أحد فريقنا قريبًا."
        : "Sorry, something went wrong. Someone from our team will follow up shortly.",
    ).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
