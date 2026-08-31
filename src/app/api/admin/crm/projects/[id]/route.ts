import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySessionToken } from "@/lib/admin-auth";
import { getCrmData, getCrmDataUntil, saveCrmData } from "@/lib/crm-store";
import { PRICING_TIERS, PROJECT_STATUSES } from "@/lib/crm-types";

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
    const data = await getCrmDataUntil((d) => d.projects.some((p) => p.id === id));
    const project = data.projects.find((p) => p.id === id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (body.title !== undefined) project.title = String(body.title).trim();
    if (body.tier !== undefined) {
      if (!PRICING_TIERS.includes(body.tier)) {
        return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
      }
      project.tier = body.tier;
    }
    if (body.priceSar !== undefined) {
      const price = Number(body.priceSar);
      if (!Number.isFinite(price)) {
        return NextResponse.json({ error: "Invalid price" }, { status: 400 });
      }
      project.priceSar = price;
    }
    if (body.features !== undefined) {
      project.features = Array.isArray(body.features)
        ? body.features.filter((f: unknown) => typeof f === "string")
        : [];
    }
    if (body.status !== undefined) {
      if (!PROJECT_STATUSES.includes(body.status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      project.status = body.status;
    }
    if (body.notes !== undefined) {
      project.notes = body.notes ? String(body.notes) : null;
    }
    project.updatedAt = new Date().toISOString();

    await saveCrmData(data);
    return NextResponse.json(project);
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
    data.projects = data.projects.filter((p) => p.id !== id);
    data.contracts = data.contracts.filter((c) => c.projectId !== id);
    await saveCrmData(data);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Storage is not configured (missing BLOB_READ_WRITE_TOKEN)" },
      { status: 500 },
    );
  }
}
