import type Anthropic from "@anthropic-ai/sdk";
import { getAnthropicClient } from "./client";
import type { InstagramSnapshot } from "../social-types";

function summarizeSnapshot(label: string, snapshot: InstagramSnapshot): string {
  const topPosts = snapshot.latestPosts
    .slice(0, 5)
    .map(
      (p, i) =>
        `  ${i + 1}. ${p.likesCount} likes, ${p.commentsCount} comments — "${p.caption.slice(0, 80)}"`,
    )
    .join("\n");

  return [
    `${label} (fetched ${snapshot.fetchedAt}):`,
    `Followers: ${snapshot.followersCount}, Following: ${snapshot.followsCount}, Posts: ${snapshot.postsCount}`,
    `Bio: ${snapshot.biography}`,
    topPosts ? `Recent posts:\n${topPosts}` : "No recent posts available.",
  ].join("\n");
}

function buildSystemPrompt(): string {
  return [
    "You are a social media analyst advising BK Web Design, a web design agency, on their own Instagram account.",
    "Based on the account data provided, write 2-3 concrete, specific suggestions for improving results — grounded in the actual numbers and post content given, not generic social media advice. If a previous snapshot is provided, note any notable change in follower count or engagement.",
    "Keep it concise (under 150 words). Output only the suggestions, no preamble or headers. Plain text only — no markdown formatting (no **bold**, no #headers, no bullet-point markup); this text is inserted directly into a dashboard as-is.",
  ].join("\n\n");
}

export async function draftSocialInsights(
  current: InstagramSnapshot,
  previous: InstagramSnapshot | null,
): Promise<string> {
  const anthropic = getAnthropicClient();

  const content = [summarizeSnapshot("Current snapshot", current)];
  if (previous) content.push(summarizeSnapshot("Previous snapshot", previous));

  const response = await anthropic.messages.create({
    model: "claude-opus-5",
    max_tokens: 500,
    output_config: { effort: "low" },
    system: buildSystemPrompt(),
    messages: [{ role: "user", content: content.join("\n\n") }],
  });

  const textBlock = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === "text",
  );
  if (!textBlock) throw new Error("No text in AI response");
  return textBlock.text;
}
