import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySessionToken } from "@/lib/admin-auth";
import { getAuditData } from "@/lib/audit-store";
import { AuditsDashboard } from "@/components/admin/AuditsDashboard";

export const dynamic = "force-dynamic";

export default async function AdminAuditsPage() {
  const cookieStore = await cookies();
  const authed = await verifySessionToken(cookieStore.get(COOKIE_NAME)?.value);

  if (!authed) {
    redirect("/admin/login");
  }

  const data = await getAuditData();

  return <AuditsDashboard initialData={data} />;
}
