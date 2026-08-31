import type Anthropic from "@anthropic-ai/sdk";
import { getAnthropicClient } from "./client";
import type { SiteAudit } from "../audit-types";

function buildSystemPrompt(): string {
  return [
    "You are a web performance and conversion consultant for BK Web Design, writing findings about a prospective client's website as part of a sales pitch for a redesign.",
    "Based on the Lighthouse scores, Core Web Vitals, and tracking-pixel presence provided, write 2-4 specific, prioritized issues and what to do about them. Ground every point in the actual numbers given — do not give generic web performance advice. Be honest, not exaggerated; if scores are genuinely good, say so briefly rather than inventing problems.",
    "Keep it concise (under 150 words). Output only the findings, no preamble or headers. Plain text only — no markdown formatting (no **bold**, no #headers, no bullet-point markup); this text is inserted directly into a report page as-is.",
  ].join("\n\n");
}

export async function draftAuditFindings(audit: SiteAudit): Promise<string> {
  const anthropic = getAnthropicClient();

  const summary = [
    `URL: ${audit.url}`,
    `Performance: ${audit.performanceScore}/100, Accessibility: ${audit.accessibilityScore}/100, Best Practices: ${audit.bestPracticesScore}/100, SEO: ${audit.seoScore}/100`,
    `Largest Contentful Paint: ${audit.largestContentfulPaint ?? "unknown"}`,
    `Cumulative Layout Shift: ${audit.cumulativeLayoutShift ?? "unknown"}`,
    `Total Blocking Time: ${audit.totalBlockingTime ?? "unknown"}`,
    `Meta Pixel installed: ${audit.hasMetaPixel ? "yes" : "no"}`,
    `Google Analytics installed: ${audit.hasGoogleAnalytics ? "yes" : "no"}`,
    `TikTok Pixel installed: ${audit.hasTikTokPixel ? "yes" : "no"}`,
  ].join("\n");

  const response = await anthropic.messages.create({
    model: "claude-opus-5",
    max_tokens: 500,
    output_config: { effort: "low" },
    system: buildSystemPrompt(),
    messages: [{ role: "user", content: summary }],
  });

  const textBlock = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === "text",
  );
  if (!textBlock) throw new Error("No text in AI response");
  return textBlock.text;
}
