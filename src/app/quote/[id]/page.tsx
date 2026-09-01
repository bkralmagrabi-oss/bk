import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCrmData } from "@/lib/crm-store";
import { BilingualDocumentPage } from "@/components/BilingualDocumentPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Quote — BK Web Design",
  robots: { index: false, follow: false },
};

export default async function QuotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getCrmData();
  const quote = data.quotes.find((q) => q.id === id);
  if (!quote) notFound();

  const project = data.projects.find((p) => p.id === quote.projectId);
  const client = data.clients.find((c) => c.id === quote.clientId);

  return (
    <BilingualDocumentPage
      docLabelEn="Quote"
      docLabelAr="عرض سعر"
      clientName={client?.name ?? "—"}
      clientCompany={client?.company ?? null}
      projectTitle={project?.title ?? "—"}
      priceSar={quote.priceSar}
      date={new Date(quote.createdAt).toLocaleDateString("en-US")}
      scopeOfWorkEn={quote.scopeOfWorkEn}
      scopeOfWorkAr={quote.scopeOfWorkAr}
      termsEn={quote.termsEn}
      termsAr={quote.termsAr}
      showSignature={false}
    />
  );
}
