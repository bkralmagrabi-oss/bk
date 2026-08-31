import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySessionToken } from "@/lib/admin-auth";
import { getAuditDataUntil, saveAuditData } from "@/lib/audit-store";
import { draftAuditFindings } from "@/lib/ai/audit-agent";

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

  const data = await getAuditDataUntil((d) => d.audits.some((a) => a.id === id));
  const audit = data.audits.find((a) => a.id === id);
  if (!audit) {
    return NextResponse.json({ error: "Audit not found" }, { status: 404 });
  }

  let findings: string;
  try {
    findings = await draftAuditFindings(audit);
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI request failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  try {
    audit.findings = findings;
    await saveAuditData(data);
    return NextResponse.json(audit);
  } catch {
    return NextResponse.json(
      { error: "Storage is not configured (missing BLOB_READ_WRITE_TOKEN)" },
      { status: 500 },
    );
  }
}
