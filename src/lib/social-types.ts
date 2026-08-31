export type InstagramPost = {
  url: string;
  caption: string;
  likesCount: number;
  commentsCount: number;
  timestamp: string;
};

export type InstagramSnapshot = {
  id: string;
  username: string;
  followersCount: number;
  followsCount: number;
  postsCount: number;
  biography: string;
  latestPosts: InstagramPost[];
  fetchedAt: string;
  insights: string | null;
};

export type SocialData = {
  snapshots: InstagramSnapshot[];
};

export const emptySocialData: SocialData = { snapshots: [] };

export function isValidSocialData(value: unknown): value is SocialData {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return Array.isArray(v.snapshots);
}
