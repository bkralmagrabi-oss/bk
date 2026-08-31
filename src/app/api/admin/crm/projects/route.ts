import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySessionToken } from "@/lib/admin-auth";
import { getCrmData, saveCrmData } from "@/lib/crm-store";
import { makeId } from "@/lib/id";
import { PRICING_TIERS, type Project } from "@/lib/crm-types";

export async function GET() {
  const cookieStore = await cookies();
  const authed = await verifySessionToken(cookieStore.get(COOKIE_NAME)?.value);
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getCrmData();
  return NextResponse.json(data.projects);
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const authed = await verifySessionToken(cookieStore.get(COOKIE_NAME)?.value);
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const clientId = typeof body?.clientId === "string" ? body.clientId : "";
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const tier = PRICING_TIERS.includes(body?.tier) ? body.tier : "basic";
  const priceSar = Number(body?.priceSar);
  const features = Array.isArray(body?.features)
    ? body.features.filter((f: unknown) => typeof f === "string")
    : [];

  if (!clientId || !title || !Number.isFinite(priceSar)) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const data = await getCrmData();

    // Not cross-checked against data.clients: this store has no locking, and a
    // client created moments earlier by a previous request may not yet be visible
    // in this read (Blob read-after-write lag). The admin UI only ever offers
    // clientId values it already holds in local state, so trust it here.
    const now = new Date().toISOString();
    const project: Project = {
      id: makeId("proj"),
      clientId,
      title,
      tier,
      priceSar,
      features,
      status: "proposed",
      createdAt: now,
      updatedAt: now,
      notes: typeof body?.notes === "string" ? body.notes : null,
    };

    data.projects.push(project);
    await saveCrmData(data);
    return NextResponse.json(project);
  } catch {
    return NextResponse.json(
      { error: "Storage is not configured (missing BLOB_READ_WRITE_TOKEN)" },
      { status: 500 },
    );
  }
}
