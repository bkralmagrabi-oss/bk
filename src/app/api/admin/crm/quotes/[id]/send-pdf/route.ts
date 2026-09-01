import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySessionToken } from "@/lib/admin-auth";
import { getCrmDataUntil } from "@/lib/crm-store";
import { sendDocumentPdfs, type LanguageChoice } from "@/lib/pdf/send-document-pdf";

export const maxDuration = 60;

export async function POST(
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
  const lang: LanguageChoice =
    body?.lang === "ar" || body?.lang === "en" ? body.lang : "both";

  const data = await getCrmDataUntil((d) => d.quotes.some((q) => q.id === id));
  const quote = data.quotes.find((q) => q.id === id);
  if (!quote) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }
  const project = data.projects.find((p) => p.id === quote.projectId);
  const client = data.clients.find((c) => c.id === quote.clientId);

  const baseUrl = `${request.nextUrl.origin}/quote/${id}`;
  const filenameBase = `Quote-${project?.title ?? "project"}`.replace(/\s+/g, "-");
  const captionBase = `Quote: ${project?.title ?? "—"} — ${client?.name ?? "—"}`;

  const { sent, failed } = await sendDocumentPdfs(baseUrl, lang, filenameBase, captionBase);

  if (sent.length === 0) {
    const message = failed.map((f) => `${f.lang}: ${f.error}`).join("; ");
    return NextResponse.json({ error: message || "Failed to generate/send PDF" }, { status: 502 });
  }

  if (failed.length > 0) {
    const message = failed.map((f) => `${f.lang}: ${f.error}`).join("; ");
    return NextResponse.json({ ok: true, sent, warning: `Partial failure — ${message}` });
  }

  return NextResponse.json({ ok: true, sent });
}
