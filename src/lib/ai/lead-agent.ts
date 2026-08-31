import type Anthropic from "@anthropic-ai/sdk";
import { getAnthropicClient } from "./client";
import type { Lead } from "../crm-types";
import type { SiteContent } from "../content-types";

function buildSystemPrompt(content: SiteContent): string {
  const services = content.services
    .map((s) => `- ${s.title.en}: ${s.description.en}`)
    .join("\n");

  return [
    "You are drafting a short, friendly reply on behalf of BK Web Design, a web design agency, to a visitor who just submitted the site's contact form.",
    `About the agency: ${content.about.text.en}`,
    "Services offered:",
    services,
    "Write a brief, warm, professional reply (2-4 sentences) that acknowledges their message, references relevant services only if genuinely relevant, and invites next steps. This is a DRAFT for the agency owner to review and personalize before sending manually — do not include a greeting salutation or sign-off, just the body text.",
  ].join("\n\n");
}

export async function draftLeadReply(lead: Lead, content: SiteContent): Promise<string> {
  const client = getAnthropicClient();

  const response = await client.messages.create({
    model: "claude-opus-5",
    max_tokens: 500,
    output_config: { effort: "low" },
    system: buildSystemPrompt(content),
    messages: [
      { role: "user", content: `Lead name: ${lead.name}\nMessage: ${lead.message}` },
    ],
  });

  const textBlock = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === "text",
  );
  if (!textBlock) throw new Error("No text in AI response");
  return textBlock.text;
}
