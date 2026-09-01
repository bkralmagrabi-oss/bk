import type Anthropic from "@anthropic-ai/sdk";
import { getAnthropicClient } from "./client";
import type { Client, Project } from "../crm-types";

function buildSystemPrompt(): string {
  return [
    "You are drafting the Scope of Work section of a contract for BK Web Design, a web design agency, based on a project's details.",
    "Write a clear, professional scope of work: one short paragraph (2-3 sentences) followed by a bullet list of concrete deliverables, grounded in the project's tier and listed features. Do not invent features that weren't listed. Do not include pricing or payment terms — those are handled separately. Keep the whole thing under 150 words.",
    "Output ONLY the scope-of-work text exactly as it should appear to the client. Do not include a title/heading, markdown formatting, the word \"DRAFT\", internal notes, review comments, or any meta-commentary about the document itself — this text is inserted directly into a contract the client will read.",
  ].join("\n\n");
}

function buildTranslationPrompt(): string {
  return [
    "You are translating a contract's Scope of Work section from English to formal, professional Arabic for BK Web Design, a web design agency, for a client-facing business contract.",
    "Preserve the meaning, structure, and bullet-point formatting exactly. Use formal Modern Standard Arabic appropriate for a legal/business document, not casual dialect.",
    "Output ONLY the Arabic translation of the body text, starting directly with the translated content. Do not add a title or heading of any kind (not even a translated one like \"نطاق العمل\") — the source text has none, so the translation must not add one either. No markdown formatting (no # headers, no **bold**), no English text, no commentary about the translation itself.",
  ].join("\n\n");
}

function extractText(response: Anthropic.Message): string {
  const textBlock = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === "text",
  );
  if (!textBlock) throw new Error("No text in AI response");
  return textBlock.text;
}

async function draftScopeOfWork(project: Project, client: Client): Promise<string> {
  const anthropic = getAnthropicClient();

  const response = await anthropic.messages.create({
    model: "claude-opus-5",
    max_tokens: 1024,
    output_config: { effort: "low" },
    system: buildSystemPrompt(),
    messages: [
      {
        role: "user",
        content: [
          `Client: ${client.name}${client.company ? ` (${client.company})` : ""}`,
          `Project: ${project.title}`,
          `Tier: ${project.tier}`,
          `Features: ${project.features.length > 0 ? project.features.join(", ") : "not specified"}`,
        ].join("\n"),
      },
    ],
  });

  return extractText(response);
}

async function translateToArabic(englishText: string): Promise<string> {
  const anthropic = getAnthropicClient();

  const response = await anthropic.messages.create({
    model: "claude-opus-5",
    max_tokens: 1024,
    output_config: { effort: "low" },
    system: buildTranslationPrompt(),
    messages: [{ role: "user", content: englishText }],
  });

  return extractText(response);
}

export async function draftBilingualScopeOfWork(
  project: Project,
  client: Client,
): Promise<{ en: string; ar: string }> {
  const en = await draftScopeOfWork(project, client);
  const ar = await translateToArabic(en);
  return { en, ar };
}
