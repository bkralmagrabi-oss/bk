import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySessionToken } from "@/lib/admin-auth";
import { getCrmData, getCrmDataUntil, saveCrmData } from "@/lib/crm-store";
import { DEFAULT_CONTRACT_TERMS } from "@/lib/contract-defaults";
import { draftScopeOfWork } from "@/lib/ai/contract-agent";
import type { Contract } from "@/lib/crm-types";

export async function GET() {
  const cookieStore = await cookies();
  const authed = await verifySessionToken(cookieStore.get(COOKIE_NAME)?.value);
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getCrmData();
  return NextResponse.json(data.contracts);
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

    let scopeOfWork = "";
    try {
      scopeOfWork = await draftScopeOfWork(project, client);
    } catch {
      // AI drafting unavailable/failed — contract is still created, admin fills in manually.
    }

    const now = new Date().toISOString();
    const contract: Contract = {
      id: crypto.randomUUID(),
      projectId: project.id,
      clientId: client.id,
      scopeOfWork,
      terms: DEFAULT_CONTRACT_TERMS,
      priceSar: project.priceSar,
      status: "draft",
      signedFileUrl: null,
      createdAt: now,
      updatedAt: now,
      sentAt: null,
      signedAt: null,
      notes: null,
    };

    data.contracts.push(contract);
    await saveCrmData(data);
    return NextResponse.json(contract);
  } catch {
    return NextResponse.json(
      { error: "Storage is not configured (missing BLOB_READ_WRITE_TOKEN)" },
      { status: 500 },
    );
  }
}
