import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySessionToken } from "@/lib/admin-auth";
import { getSocialData, saveSocialData } from "@/lib/social-store";
import { getSiteContent } from "@/lib/content-store";
import { fetchInstagramSnapshot } from "@/lib/apify/instagram";

export async function POST() {
  const cookieStore = await cookies();
  const authed = await verifySessionToken(cookieStore.get(COOKIE_NAME)?.value);
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const content = await getSiteContent();
  const username = content.contact.instagramHandle.replace(/^@/, "").trim();
  if (!username) {
    return NextResponse.json(
      { error: "No Instagram handle configured in site content" },
      { status: 400 },
    );
  }

  let snapshot;
  try {
    snapshot = await fetchInstagramSnapshot(username);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Apify request failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  try {
    const data = await getSocialData();
    data.snapshots.push(snapshot);
    await saveSocialData(data);
    return NextResponse.json(snapshot);
  } catch {
    return NextResponse.json(
      { error: "Storage is not configured (missing BLOB_READ_WRITE_TOKEN)" },
      { status: 500 },
    );
  }
}
