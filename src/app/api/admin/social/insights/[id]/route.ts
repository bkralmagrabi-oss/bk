import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySessionToken } from "@/lib/admin-auth";
import { getSocialDataUntil, saveSocialData } from "@/lib/social-store";
import { draftSocialInsights } from "@/lib/ai/social-agent";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const cookieStore = await cookies();
  const authed = await verifySessionToken(cookieStore.get(COOKIE_NAME)?.value);
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const data = await getSocialDataUntil((d) => d.snapshots.some((s) => s.id === id));
  const index = data.snapshots.findIndex((s) => s.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Snapshot not found" }, { status: 404 });
  }

  const current = data.snapshots[index];
  const previous = index > 0 ? data.snapshots[index - 1] : null;

  let insights: string;
  try {
    insights = await draftSocialInsights(current, previous);
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI request failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  try {
    current.insights = insights;
    await saveSocialData(data);
    return NextResponse.json(current);
  } catch {
    return NextResponse.json(
      { error: "Storage is not configured (missing BLOB_READ_WRITE_TOKEN)" },
      { status: 500 },
    );
  }
}
