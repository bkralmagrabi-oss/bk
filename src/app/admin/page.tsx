import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySessionToken } from "@/lib/admin-auth";
import { getSiteContent } from "@/lib/content-store";
import { AdminEditor } from "@/components/admin/AdminEditor";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const authed = await verifySessionToken(cookieStore.get(COOKIE_NAME)?.value);

  if (!authed) {
    redirect("/admin/login");
  }

  const content = await getSiteContent();

  return <AdminEditor initialContent={content} />;
}
