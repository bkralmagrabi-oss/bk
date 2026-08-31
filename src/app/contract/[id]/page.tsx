import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCrmData } from "@/lib/crm-store";

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
    <div className="contract-page">
      <div className="contract-doc">
        <header className="contract-header">
          <span className="contract-brand">BK Web Design</span>
          <span className="contract-doc-label">Contract</span>
        </header>

        <dl className="contract-meta">
          <div>
            <dt>Client</dt>
            <dd>{client?.name ?? "—"}{client?.company ? ` (${client.company})` : ""}</dd>
          </div>
          <div>
            <dt>Project</dt>
            <dd>{project?.title ?? "—"}</dd>
          </div>
          <div>
            <dt>Price</dt>
            <dd>{contract.priceSar.toLocaleString("en-US")} SAR</dd>
          </div>
          <div>
            <dt>Date</dt>
            <dd>{new Date(contract.createdAt).toLocaleDateString("en-US")}</dd>
          </div>
        </dl>

        <section className="contract-section">
          <h2>Scope of Work</h2>
          <p className="contract-body-text">{contract.scopeOfWork || "—"}</p>
        </section>

        <section className="contract-section">
          <h2>Terms</h2>
          <p className="contract-body-text">{contract.terms}</p>
        </section>

        <section className="contract-signature">
          <div>
            <span className="contract-sig-line" />
            <span>Signed</span>
          </div>
          <div>
            <span className="contract-sig-line" />
            <span>Date</span>
          </div>
        </section>
      </div>
    </div>
  );
}
