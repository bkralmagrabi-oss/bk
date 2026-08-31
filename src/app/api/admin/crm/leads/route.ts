import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySessionToken } from "@/lib/admin-auth";
import { getCrmData, saveCrmData } from "@/lib/crm-store";
import { makeId } from "@/lib/id";
import { LEAD_STATUSES, type Lead } from "@/lib/crm-types";

export async function GET() {
  const cookieStore = await cookies();
  const authed = await verifySessionToken(cookieStore.get(COOKIE_NAME)?.value);
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getCrmData();
  return NextResponse.json(data.leads);
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const authed = await verifySessionToken(cookieStore.get(COOKIE_NAME)?.value);
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const status = LEAD_STATUSES.includes(body?.status) ? body.status : "new";

  if (!name || !email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const lead: Lead = {
    id: makeId("lead"),
    name,
    email,
    message,
    source: "manual",
    status,
    createdAt: now,
    updatedAt: now,
    clientId: null,
    notes: typeof body?.notes === "string" ? body.notes : null,
    suggestedReply: null,
  };

  try {
    const data = await getCrmData();
    data.leads.push(lead);
    await saveCrmData(data);
    return NextResponse.json(lead);
  } catch {
    return NextResponse.json(
      { error: "Storage is not configured (missing BLOB_READ_WRITE_TOKEN)" },
      { status: 500 },
    );
  }
}
