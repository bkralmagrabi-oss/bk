import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySessionToken } from "@/lib/admin-auth";
import { getAuditData, saveAuditData } from "@/lib/audit-store";
import { fetchPageSpeedReport } from "@/lib/audit/pagespeed";
import { checkTrackingPixels } from "@/lib/audit/pixel-check";
import type { SiteAudit } from "@/lib/audit-types";

// A real Lighthouse run can take 60-90s+ on heavy sites — request the longest
// execution window available (Vercel Hobby plan caps at 60s without Fluid Compute).
export const maxDuration = 60;

export async function GET() {
  const cookieStore = await cookies();
  const authed = await verifySessionToken(cookieStore.get(COOKIE_NAME)?.value);
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getAuditData();
  return NextResponse.json(data.audits);
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const authed = await verifySessionToken(cookieStore.get(COOKIE_NAME)?.value);
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const rawUrl = typeof body?.url === "string" ? body.url.trim() : "";
  if (!rawUrl) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  let url: string;
  try {
    url = new URL(rawUrl).toString();
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  let pageSpeed;
  let pixels;
  try {
    [pageSpeed, pixels] = await Promise.all([
      fetchPageSpeedReport(url),
      checkTrackingPixels(url),
    ]);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Audit request failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const audit: SiteAudit = {
    id: crypto.randomUUID(),
    url,
    fetchedAt: new Date().toISOString(),
    ...pageSpeed,
    ...pixels,
    findings: null,
  };

  try {
    const data = await getAuditData();
    data.audits.push(audit);
    await saveAuditData(data);
    return NextResponse.json(audit);
  } catch {
    return NextResponse.json(
      { error: "Storage is not configured (missing BLOB_READ_WRITE_TOKEN)" },
      { status: 500 },
    );
  }
}
