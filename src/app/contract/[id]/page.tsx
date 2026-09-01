import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCrmData } from "@/lib/crm-store";
import { BilingualDocumentPage, type DocumentLanguage } from "@/components/BilingualDocumentPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contract — BK Web Design",
  robots: { index: false, follow: false },
};

export default async function ContractPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { id } = await params;
  const { lang: langParam } = await searchParams;
  const data = await getCrmData();
  const contract = data.contracts.find((c) => c.id === id);
  if (!contract) notFound();

  const project = data.projects.find((p) => p.id === contract.projectId);
  const client = data.clients.find((c) => c.id === contract.clientId);

  const commonProps = {
    docLabelEn: "Contract",
    docLabelAr: "عقد",
    clientName: client?.name ?? "—",
    clientCompany: client?.company ?? null,
    projectTitle: project?.title ?? "—",
    priceSar: contract.priceSar,
    date: new Date(contract.createdAt).toLocaleDateString("en-US"),
    scopeOfWorkEn: contract.scopeOfWorkEn,
    scopeOfWorkAr: contract.scopeOfWorkAr,
    termsEn: contract.termsEn,
    termsAr: contract.termsAr,
    showSignature: true,
  };

  const lang: DocumentLanguage | null =
    langParam === "ar" || langParam === "en" ? langParam : null;

  if (lang) {
    return <BilingualDocumentPage lang={lang} {...commonProps} />;
  }

  return (
    <>
      <BilingualDocumentPage lang="ar" {...commonProps} />
      <BilingualDocumentPage lang="en" {...commonProps} />
    </>
  );
}
