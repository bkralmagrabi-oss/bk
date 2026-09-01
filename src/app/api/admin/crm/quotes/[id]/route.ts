import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySessionToken } from "@/lib/admin-auth";
import { getCrmDataUntil, saveCrmData } from "@/lib/crm-store";
import { QUOTE_STATUSES } from "@/lib/crm-types";

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
    const data = await getCrmDataUntil((d) => d.quotes.some((q) => q.id === id));
    const quote = data.quotes.find((q) => q.id === id);
    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    if (body.scopeOfWorkEn !== undefined) quote.scopeOfWorkEn = String(body.scopeOfWorkEn);
    if (body.scopeOfWorkAr !== undefined) quote.scopeOfWorkAr = String(body.scopeOfWorkAr);
    if (body.termsEn !== undefined) quote.termsEn = String(body.termsEn);
    if (body.termsAr !== undefined) quote.termsAr = String(body.termsAr);
    if (body.priceSar !== undefined) {
      const price = Number(body.priceSar);
      if (!Number.isFinite(price)) {
        return NextResponse.json({ error: "Invalid price" }, { status: 400 });
      }
      quote.priceSar = price;
    }
    if (body.notes !== undefined) quote.notes = body.notes ? String(body.notes) : null;

    if (body.status !== undefined) {
      if (!QUOTE_STATUSES.includes(body.status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      const now = new Date().toISOString();
      if (body.status === "sent" && quote.status !== "sent") quote.sentAt = now;
      quote.status = body.status;
    }
    quote.updatedAt = new Date().toISOString();

    await saveCrmData(data);
    return NextResponse.json(quote);
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
    const data = await getCrmDataUntil((d) => d.quotes.some((q) => q.id === id));
    data.quotes = data.quotes.filter((q) => q.id !== id);
    await saveCrmData(data);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Storage is not configured (missing BLOB_READ_WRITE_TOKEN)" },
      { status: 500 },
    );
  }
}
