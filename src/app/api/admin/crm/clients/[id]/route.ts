import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySessionToken } from "@/lib/admin-auth";
import { getCrmData, getCrmDataUntil, saveCrmData } from "@/lib/crm-store";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const cookieStore = await cookies();
  const authed = await verifySessionToken(cookieStore.get(COOKIE_NAME)?.value);
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const data = await getCrmDataUntil((d) => d.clients.some((c) => c.id === id));
    const client = data.clients.find((c) => c.id === id);
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    if (body.name !== undefined) client.name = String(body.name).trim();
    if (body.company !== undefined) client.company = body.company ? String(body.company) : null;
    if (body.email !== undefined) client.email = String(body.email).trim();
    if (body.phone !== undefined) client.phone = body.phone ? String(body.phone) : null;
    if (body.notes !== undefined) client.notes = body.notes ? String(body.notes) : null;
    client.updatedAt = new Date().toISOString();

    await saveCrmData(data);
    return NextResponse.json(client);
  } catch {
    return NextResponse.json(
      { error: "Storage is not configured (missing BLOB_READ_WRITE_TOKEN)" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const cookieStore = await cookies();
  const authed = await verifySessionToken(cookieStore.get(COOKIE_NAME)?.value);
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const data = await getCrmData();
    data.clients = data.clients.filter((c) => c.id !== id);
    data.projects = data.projects.filter((p) => p.clientId !== id);
    data.contracts = data.contracts.filter((c) => c.clientId !== id);
    data.quotes = data.quotes.filter((q) => q.clientId !== id);
    await saveCrmData(data);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Storage is not configured (missing BLOB_READ_WRITE_TOKEN)" },
      { status: 500 },
    );
  }
}
