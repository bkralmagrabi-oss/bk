import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySessionToken } from "@/lib/admin-auth";
import { getCrmData } from "@/lib/crm-store";
import { CrmDashboard } from "@/components/admin/CrmDashboard";

export const dynamic = "force-dynamic";

export default async function AdminCrmPage() {
  const cookieStore = await cookies();
  const authed = await verifySessionToken(cookieStore.get(COOKIE_NAME)?.value);

  if (!authed) {
    redirect("/admin/login");
  }

  const data = await getCrmData();

  return <CrmDashboard initialData={data} />;
}
