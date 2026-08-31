import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySessionToken } from "@/lib/admin-auth";
import { getCrmDataUntil, saveCrmData } from "@/lib/crm-store";
import { CONTRACT_STATUSES } from "@/lib/crm-types";

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
    const data = await getCrmDataUntil((d) => d.contracts.some((c) => c.id === id));
    const contract = data.contracts.find((c) => c.id === id);
    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    if (body.scopeOfWork !== undefined) contract.scopeOfWork = String(body.scopeOfWork);
    if (body.terms !== undefined) contract.terms = String(body.terms);
    if (body.priceSar !== undefined) {
      const price = Number(body.priceSar);
      if (!Number.isFinite(price)) {
        return NextResponse.json({ error: "Invalid price" }, { status: 400 });
      }
      contract.priceSar = price;
    }
    if (body.signedFileUrl !== undefined) {
      contract.signedFileUrl = body.signedFileUrl ? String(body.signedFileUrl) : null;
    }
    if (body.notes !== undefined) contract.notes = body.notes ? String(body.notes) : null;

    if (body.status !== undefined) {
      if (!CONTRACT_STATUSES.includes(body.status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      const now = new Date().toISOString();
      if (body.status === "sent" && contract.status !== "sent") contract.sentAt = now;
      if (body.status === "signed" && contract.status !== "signed") contract.signedAt = now;
      contract.status = body.status;
    }
    contract.updatedAt = new Date().toISOString();

    await saveCrmData(data);
    return NextResponse.json(contract);
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
    const data = await getCrmDataUntil((d) => d.contracts.some((c) => c.id === id));
    data.contracts = data.contracts.filter((c) => c.id !== id);
    await saveCrmData(data);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Storage is not configured (missing BLOB_READ_WRITE_TOKEN)" },
      { status: 500 },
    );
  }
}
