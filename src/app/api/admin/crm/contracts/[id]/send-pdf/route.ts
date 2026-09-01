import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySessionToken } from "@/lib/admin-auth";
import { getCrmDataUntil } from "@/lib/crm-store";
import { generateAndSendPdf } from "@/lib/pdf/send-document-pdf";

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

  const data = await getCrmDataUntil((d) => d.contracts.some((c) => c.id === id));
  const contract = data.contracts.find((c) => c.id === id);
  if (!contract) {
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  }
  const project = data.projects.find((p) => p.id === contract.projectId);
  const client = data.clients.find((c) => c.id === contract.clientId);

  const url = `${request.nextUrl.origin}/contract/${id}`;
  const filename = `Contract-${project?.title ?? "project"}.pdf`.replace(/\s+/g, "-");
  const caption = `Contract: ${project?.title ?? "—"} — ${client?.name ?? "—"}`;

  try {
    await generateAndSendPdf(url, filename, caption);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate/send PDF";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
