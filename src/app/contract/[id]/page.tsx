import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCrmData } from "@/lib/crm-store";
import { BilingualDocumentPage } from "@/components/BilingualDocumentPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contract — BK Web Design",
  robots: { index: false, follow: false },
};

export default async function ContractPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getCrmData();
  const contract = data.contracts.find((c) => c.id === id);
  if (!contract) notFound();

  const project = data.projects.find((p) => p.id === contract.projectId);
  const client = data.clients.find((c) => c.id === contract.clientId);

  return (
    <BilingualDocumentPage
      docLabelEn="Contract"
      docLabelAr="عقد"
      clientName={client?.name ?? "—"}
      clientCompany={client?.company ?? null}
      projectTitle={project?.title ?? "—"}
      priceSar={contract.priceSar}
      date={new Date(contract.createdAt).toLocaleDateString("en-US")}
      scopeOfWorkEn={contract.scopeOfWorkEn}
      scopeOfWorkAr={contract.scopeOfWorkAr}
      termsEn={contract.termsEn}
      termsAr={contract.termsAr}
      showSignature
    />
  );
}
