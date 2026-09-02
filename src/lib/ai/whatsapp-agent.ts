import type Anthropic from "@anthropic-ai/sdk";
import { getAnthropicClient } from "./client";
import { getCrmData, saveCrmData } from "../crm-store";
import type { Lead } from "../crm-types";
import { makeId } from "../id";
import { sendMessage as notifyTelegram } from "../telegram/client";
import type { SiteContent } from "../content-types";
import type { Conversation } from "../whatsapp/conversation-store";

const MODEL = "claude-opus-5";
// Bounds how many tool-call round-trips a single incoming message can trigger
// before we force a reply — the model should never need more than a couple.
const MAX_TOOL_ITERATIONS = 4;

function buildSystemPrompt(content: SiteContent, contactName?: string): string {
  const servicesEn = content.services.map((s) => `- ${s.title.en}: ${s.description.en}`).join("\n");
  const servicesAr = content.services.map((s) => `- ${s.title.ar}: ${s.description.ar}`).join("\n");

  return [
    "You are the WhatsApp assistant for BK Web Design, a bilingual (Arabic/English) web design and automation agency. You are chatting live with a customer on WhatsApp — this is a real-time conversation, not a draft for review.",
    "ALWAYS reply in the same language the customer just wrote in (Arabic or English). Keep replies short and conversational like a real WhatsApp chat — a few sentences at most, no long emails, no markdown formatting, no headers.",
    `About the agency (English): ${content.about.text.en}`,
    `About the agency (Arabic): ${content.about.text.ar}`,
    "Services (English):",
    servicesEn,
    "Services (Arabic):",
    servicesAr,
    contactName ? `The customer's WhatsApp profile name is "${contactName}".` : "",
    [
      "Your goals, in order of priority:",
      "1. Answer questions about services, process, and general pricing ranges helpfully and accurately. Never invent specific prices, timelines, or features that weren't given to you here — if asked for an exact quote, say a team member will confirm it.",
      "2. Naturally find out the customer's name and what they need (project type, goals). Once you have both, call save_lead. Don't interrogate them — let it come up in conversation.",
      "3. If the customer wants to schedule a call, ask for their preferred day/time and call request_callback.",
      "4. If you can't confidently help, or the customer explicitly asks for a human, call escalate_to_human — actually call the tool, don't just say you will.",
    ].join("\n"),
    "Only call save_lead again if meaningfully new information was added since the last time — don't repeat it every turn.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

const TOOLS: Anthropic.Tool[] = [
  {
    name: "save_lead",
    description:
      "Save or update this customer as a lead once you know their name and roughly what they need.",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Customer's name" },
        need: { type: "string", description: "Short summary of what they need (project type, goals)" },
      },
      required: ["name", "need"],
    },
  },
  {
    name: "request_callback",
    description: "Record that the customer wants to schedule a call, with their preferred time.",
    input_schema: {
      type: "object",
      properties: {
        preferred_time: {
          type: "string",
          description: "Customer's preferred day/time for a call, in their own words",
        },
      },
      required: ["preferred_time"],
    },
  },
  {
    name: "escalate_to_human",
    description:
      "Flag this conversation for the human owner to take over, because the bot can't confidently help or the customer asked for a person.",
    input_schema: {
      type: "object",
      properties: {
        reason: { type: "string", description: "Why this needs a human" },
      },
      required: ["reason"],
    },
  },
];

async function upsertLead(conversation: Conversation, phone: string, name: string, need: string): Promise<string> {
  const data = await getCrmData();
  const now = new Date().toISOString();

  if (conversation.lead.leadId) {
    const existing = data.leads.find((l) => l.id === conversation.lead.leadId);
    if (existing) {
      existing.name = name;
      existing.message = need;
      existing.updatedAt = now;
      await saveCrmData(data);
      return existing.id;
    }
  }

  const lead: Lead = {
    id: makeId("lead"),
    name,
    email: "",
    message: need,
    source: "whatsapp",
    status: "new",
    createdAt: now,
    updatedAt: now,
    clientId: null,
    notes: `WhatsApp: ${phone}`,
    suggestedReply: null,
  };
  data.leads.push(lead);
  await saveCrmData(data);
  return lead.id;
}

async function notifyOwner(lines: string[]): Promise<void> {
  const ownerChatId = process.env.TELEGRAM_OWNER_CHAT_ID;
  if (!ownerChatId) return;
  await notifyTelegram(Number(ownerChatId), lines.join("\n")).catch(() => {});
}

async function executeTool(
  toolName: string,
  input: Record<string, unknown>,
  conversation: Conversation,
  phone: string,
): Promise<string> {
  if (toolName === "save_lead") {
    const name = String(input.name ?? "").trim();
    const need = String(input.need ?? "").trim();
    if (!name || !need) return "Missing name or need — ask the customer for whichever is missing.";

    conversation.lead.name = name;
    conversation.lead.need = need;
    if (conversation.stage === "new") conversation.stage = "qualifying";

    try {
      conversation.lead.leadId = await upsertLead(conversation, phone, name, need);
      return "Lead saved.";
    } catch {
      return "Lead saving failed silently on our end — continue the conversation normally.";
    }
  }

  if (toolName === "request_callback") {
    const preferredTime = String(input.preferred_time ?? "").trim();
    conversation.stage = "booked";
    await notifyOwner(
      [
        "WhatsApp: callback requested",
        `From: ${phone}${conversation.lead.name ? ` (${conversation.lead.name})` : ""}`,
        conversation.lead.need ? `Need: ${conversation.lead.need}` : "",
        `Preferred time: ${preferredTime || "not specified"}`,
      ].filter(Boolean),
    );
    return "Callback request sent to the team.";
  }

  if (toolName === "escalate_to_human") {
    const reason = String(input.reason ?? "").trim();
    conversation.stage = "escalated";
    await notifyOwner([
      "WhatsApp: needs a human",
      `From: ${phone}${conversation.lead.name ? ` (${conversation.lead.name})` : ""}`,
      `Reason: ${reason || "not specified"}`,
    ]);
    return "Escalation sent to the team.";
  }

  return "Unknown tool.";
}

function extractText(content: Anthropic.ContentBlock[]): string {
  return content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
}

function fallbackReply(lastCustomerMessage: string): string {
  const isArabic = /[؀-ۿ]/.test(lastCustomerMessage);
  return isArabic
    ? "تم استلام رسالتك، سيتواصل معك أحد فريقنا قريبًا."
    : "Got your message — someone from our team will follow up shortly.";
}

export async function generateWhatsappReply(params: {
  conversation: Conversation;
  content: SiteContent;
  phone: string;
  contactName?: string;
}): Promise<string> {
  const { conversation, content, phone, contactName } = params;
  const anthropic = getAnthropicClient();
  const system = buildSystemPrompt(content, contactName);

  const messages: Anthropic.MessageParam[] = conversation.messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  let finalText = "";

  for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 600,
      output_config: { effort: "low" },
      system,
      tools: TOOLS,
      messages,
    });

    const toolUses = response.content.filter(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
    );

    const textSoFar = extractText(response.content);
    if (textSoFar) finalText = textSoFar;

    if (toolUses.length === 0) break;

    messages.push({ role: "assistant", content: response.content });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const toolUse of toolUses) {
      const resultText = await executeTool(
        toolUse.name,
        toolUse.input as Record<string, unknown>,
        conversation,
        phone,
      );
      toolResults.push({ type: "tool_result", tool_use_id: toolUse.id, content: resultText });
    }
    messages.push({ role: "user", content: toolResults });
  }

  const lastCustomerMessage = conversation.messages[conversation.messages.length - 1]?.content ?? "";
  return finalText || fallbackReply(lastCustomerMessage);
}
