import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySessionToken } from "@/lib/admin-auth";
import { getSocialData } from "@/lib/social-store";
import { SocialDashboard } from "@/components/admin/SocialDashboard";

export const dynamic = "force-dynamic";

export default async function AdminSocialPage() {
  const cookieStore = await cookies();
  const authed = await verifySessionToken(cookieStore.get(COOKIE_NAME)?.value);

  if (!authed) {
    redirect("/admin/login");
  }

  const data = await getSocialData();

  return <SocialDashboard initialData={data} />;
}
