import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySessionToken } from "@/lib/admin-auth";
import { getCrmData, getCrmDataUntil, saveCrmData } from "@/lib/crm-store";
import { makeId } from "@/lib/id";
import type { Client, CrmData } from "@/lib/crm-types";

export async function GET() {
  const cookieStore = await cookies();
  const authed = await verifySessionToken(cookieStore.get(COOKIE_NAME)?.value);
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getCrmData();
  return NextResponse.json(data.clients);
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
  const leadId = typeof body?.leadId === "string" ? body.leadId : null;

  if (!name || !email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const client: Client = {
    id: makeId("client"),
    name,
    company: typeof body?.company === "string" ? body.company : null,
    email,
    phone: typeof body?.phone === "string" ? body.phone : null,
    notes: typeof body?.notes === "string" ? body.notes : null,
    createdAt: now,
    updatedAt: now,
    leadId,
  };

  try {
    let data: CrmData;

    if (leadId) {
      data = await getCrmDataUntil((d) => d.leads.some((l) => l.id === leadId));
      const lead = data.leads.find((l) => l.id === leadId);
      if (!lead) {
        return NextResponse.json({ error: "Lead not found" }, { status: 404 });
      }
      lead.clientId = client.id;
      lead.status = "converted";
      lead.updatedAt = now;
    } else {
      data = await getCrmData();
    }

    data.clients.push(client);
    await saveCrmData(data);
    return NextResponse.json(client);
  } catch {
    return NextResponse.json(
      { error: "Storage is not configured (missing BLOB_READ_WRITE_TOKEN)" },
      { status: 500 },
    );
  }
}
