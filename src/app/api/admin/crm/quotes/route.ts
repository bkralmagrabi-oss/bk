import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySessionToken } from "@/lib/admin-auth";
import { getCrmData, getCrmDataUntil, saveCrmData } from "@/lib/crm-store";
import { DEFAULT_CONTRACT_TERMS, DEFAULT_CONTRACT_TERMS_AR } from "@/lib/contract-defaults";
import { draftBilingualScopeOfWork } from "@/lib/ai/contract-agent";
import type { Quote } from "@/lib/crm-types";

export async function GET() {
  const cookieStore = await cookies();
  const authed = await verifySessionToken(cookieStore.get(COOKIE_NAME)?.value);
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getCrmData();
  return NextResponse.json(data.quotes);
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const authed = await verifySessionToken(cookieStore.get(COOKIE_NAME)?.value);
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const projectId = typeof body?.projectId === "string" ? body.projectId : "";
  if (!projectId) {
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
  }

  try {
    const data = await getCrmDataUntil((d) => d.projects.some((p) => p.id === projectId));
    const project = data.projects.find((p) => p.id === projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    const client = data.clients.find((c) => c.id === project.clientId);
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    let scopeOfWorkEn = "";
    let scopeOfWorkAr = "";
    try {
      const drafted = await draftBilingualScopeOfWork(project, client);
      scopeOfWorkEn = drafted.en;
      scopeOfWorkAr = drafted.ar;
    } catch {
      // AI drafting unavailable/failed — quote is still created, admin fills in manually.
    }

    const now = new Date().toISOString();
    const quote: Quote = {
      id: crypto.randomUUID(),
      projectId: project.id,
      clientId: client.id,
      scopeOfWorkEn,
      scopeOfWorkAr,
      termsEn: DEFAULT_CONTRACT_TERMS,
      termsAr: DEFAULT_CONTRACT_TERMS_AR,
      priceSar: project.priceSar,
      status: "draft",
      createdAt: now,
      updatedAt: now,
      sentAt: null,
      notes: null,
    };

    data.quotes.push(quote);
    await saveCrmData(data);
    return NextResponse.json(quote);
  } catch {
    return NextResponse.json(
      { error: "Storage is not configured (missing BLOB_READ_WRITE_TOKEN)" },
      { status: 500 },
    );
  }
}
