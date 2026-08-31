import { ApifyClient } from "apify-client";

export function getApifyClient(): ApifyClient {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) throw new Error("APIFY_API_TOKEN is not configured");
  return new ApifyClient({ token });
}
