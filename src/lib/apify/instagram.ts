import { getApifyClient } from "./client";
import type { InstagramPost, InstagramSnapshot } from "../social-types";

const ACTOR_ID = "apify/instagram-profile-scraper";

function pick(obj: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null) return obj[key];
  }
  return undefined;
}

function toNumber(value: unknown): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function toStr(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function mapPost(raw: unknown): InstagramPost {
  const p = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    url: toStr(pick(p, ["url", "postUrl", "displayUrl"])),
    caption: toStr(pick(p, ["caption", "text"])),
    likesCount: toNumber(pick(p, ["likesCount", "likes"])),
    commentsCount: toNumber(pick(p, ["commentsCount", "comments"])),
    timestamp: toStr(pick(p, ["timestamp", "takenAt", "takenAtTimestamp"])),
  };
}

export async function fetchInstagramSnapshot(username: string): Promise<InstagramSnapshot> {
  const client = getApifyClient();

  const run = await client.actor(ACTOR_ID).call({
    usernames: [username],
    includeAboutSection: false,
  });

  if (run.status !== "SUCCEEDED") {
    throw new Error(`Apify run did not succeed (status: ${run.status})`);
  }

  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  const profile = items[0] as Record<string, unknown> | undefined;
  if (!profile) {
    throw new Error("Apify run returned no profile data");
  }

  const latestPostsRaw = Array.isArray(profile.latestPosts) ? profile.latestPosts : [];

  return {
    id: crypto.randomUUID(),
    username: toStr(pick(profile, ["username"])) || username,
    followersCount: toNumber(pick(profile, ["followersCount"])),
    followsCount: toNumber(pick(profile, ["followsCount", "followingCount"])),
    postsCount: toNumber(pick(profile, ["postsCount"])),
    biography: toStr(pick(profile, ["biography", "bio"])),
    latestPosts: latestPostsRaw.map(mapPost),
    fetchedAt: new Date().toISOString(),
    insights: null,
  };
}
