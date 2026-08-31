type PageSpeedScores = {
  performanceScore: number;
  accessibilityScore: number;
  bestPracticesScore: number;
  seoScore: number;
  largestContentfulPaint: string | null;
  cumulativeLayoutShift: string | null;
  totalBlockingTime: string | null;
};

function scoreOf(categories: Record<string, unknown> | undefined, key: string): number {
  const category = categories?.[key] as Record<string, unknown> | undefined;
  const score = Number(category?.score);
  return Number.isFinite(score) ? Math.round(score * 100) : 0;
}

function displayValueOf(audits: Record<string, unknown> | undefined, key: string): string | null {
  const audit = audits?.[key] as Record<string, unknown> | undefined;
  const value = audit?.displayValue;
  return typeof value === "string" ? value : null;
}

export async function fetchPageSpeedReport(url: string): Promise<PageSpeedScores> {
  const endpoint = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  endpoint.searchParams.set("url", url);
  endpoint.searchParams.set("strategy", "mobile");
  for (const category of ["performance", "accessibility", "best-practices", "seo"]) {
    endpoint.searchParams.append("category", category);
  }
  const apiKey = process.env.PAGESPEED_API_KEY;
  if (apiKey) endpoint.searchParams.set("key", apiKey);

  const res = await fetch(endpoint.toString());
  if (!res.ok) {
    if (res.status === 429) {
      throw new Error(
        "PageSpeed Insights rate limit hit. The keyless tier is heavily shared — add a free PAGESPEED_API_KEY (Google Cloud Console) to fix this.",
      );
    }
    throw new Error(`PageSpeed Insights request failed (status ${res.status})`);
  }

  const data = await res.json();
  const categories = data?.lighthouseResult?.categories as Record<string, unknown> | undefined;
  const audits = data?.lighthouseResult?.audits as Record<string, unknown> | undefined;

  return {
    performanceScore: scoreOf(categories, "performance"),
    accessibilityScore: scoreOf(categories, "accessibility"),
    bestPracticesScore: scoreOf(categories, "best-practices"),
    seoScore: scoreOf(categories, "seo"),
    largestContentfulPaint: displayValueOf(audits, "largest-contentful-paint"),
    cumulativeLayoutShift: displayValueOf(audits, "cumulative-layout-shift"),
    totalBlockingTime: displayValueOf(audits, "total-blocking-time"),
  };
}
