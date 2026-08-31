import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySessionToken } from "@/lib/admin-auth";
import { saveSiteContent } from "@/lib/content-store";
import { isValidSiteContent } from "@/lib/content-types";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const authed = await verifySessionToken(cookieStore.get(COOKIE_NAME)?.value);
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const content = await request.json().catch(() => null);
  if (!isValidSiteContent(content)) {
    return NextResponse.json({ error: "Invalid content" }, { status: 400 });
  }

  try {
    await saveSiteContent(content);
  } catch {
    return NextResponse.json({ error: "Failed to save content" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
