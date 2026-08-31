"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type {
  Client,
  Contract,
  ContractStatus,
  CrmData,
  Lead,
  LeadStatus,
  PricingTier,
  Project,
  ProjectStatus,
} from "@/lib/crm-types";
import {
  CONTRACT_STATUSES,
  LEAD_STATUSES,
  PRICING_TIERS,
  PROJECT_STATUSES,
} from "@/lib/crm-types";

function emptyClientDraft() {
  return { name: "", company: "", email: "", phone: "", notes: "" };
}

function emptyProjectDraft() {
  return {
    clientId: "",
    title: "",
    tier: "basic" as PricingTier,
    priceSar: "",
    features: "",
    notes: "",
  };
}

export function CrmDashboard({ initialData }: { initialData: CrmData }) {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>(initialData.leads);
  const [clients, setClients] = useState<Client[]>(initialData.clients);
  const [projects, setProjects] = useState<Project[]>(initialData.projects);
  const [contracts, setContracts] = useState<Contract[]>(initialData.contracts);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [clientDraft, setClientDraft] = useState(emptyClientDraft());
  const [projectDraft, setProjectDraft] = useState(emptyProjectDraft());
  const [contractProjectId, setContractProjectId] = useState("");
  const [generatingContract, setGeneratingContract] = useState(false);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  async function api(path: string, options?: RequestInit) {
    const res = await fetch(path, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      setError(json?.error || "Request failed");
      return null;
    }
    setError(null);
    return json;
  }

  async function updateLeadStatus(id: string, status: LeadStatus) {
    const updated = await api(`/api/admin/crm/leads/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    if (updated) setLeads((prev) => prev.map((l) => (l.id === id ? updated : l)));
  }

  async function deleteLead(id: string) {
    const res = await api(`/api/admin/crm/leads/${id}`, { method: "DELETE" });
    if (res) setLeads((prev) => prev.filter((l) => l.id !== id));
  }

  async function promoteLead(lead: Lead) {
    const client = await api("/api/admin/crm/clients", {
      method: "POST",
      body: JSON.stringify({ name: lead.name, email: lead.email, leadId: lead.id }),
    });
    if (client) {
      setClients((prev) => [...prev, client]);
      setLeads((prev) =>
        prev.map((l) => (l.id === lead.id ? { ...l, clientId: client.id, status: "converted" } : l)),
      );
    }
  }

  async function addClient() {
    if (!clientDraft.name.trim() || !clientDraft.email.trim()) return;
    const client = await api("/api/admin/crm/clients", {
      method: "POST",
      body: JSON.stringify(clientDraft),
    });
    if (client) {
      setClients((prev) => [...prev, client]);
      setClientDraft(emptyClientDraft());
    }
  }

  async function deleteClient(id: string) {
    const res = await api(`/api/admin/crm/clients/${id}`, { method: "DELETE" });
    if (res) {
      setClients((prev) => prev.filter((c) => c.id !== id));
      setProjects((prev) => prev.filter((p) => p.clientId !== id));
    }
  }

  async function addProject() {
    const price = Number(projectDraft.priceSar);
    if (!projectDraft.clientId || !projectDraft.title.trim() || !Number.isFinite(price)) return;
    const project = await api("/api/admin/crm/projects", {
      method: "POST",
      body: JSON.stringify({
        clientId: projectDraft.clientId,
        title: projectDraft.title,
        tier: projectDraft.tier,
        priceSar: price,
        features: projectDraft.features
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean),
        notes: projectDraft.notes,
      }),
    });
    if (project) {
      setProjects((prev) => [...prev, project]);
      setProjectDraft(emptyProjectDraft());
    }
  }

  async function updateProjectStatus(id: string, status: ProjectStatus) {
    const updated = await api(`/api/admin/crm/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    if (updated) setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
  }

  async function deleteProject(id: string) {
    const res = await api(`/api/admin/crm/projects/${id}`, { method: "DELETE" });
    if (res) setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  async function generateContract() {
    if (!contractProjectId) return;
    setGeneratingContract(true);
    const contract = await api("/api/admin/crm/contracts", {
      method: "POST",
      body: JSON.stringify({ projectId: contractProjectId }),
    });
    setGeneratingContract(false);
    if (contract) {
      setContracts((prev) => [...prev, contract]);
      setContractProjectId("");
    }
  }

  function updateContractLocal(id: string, patch: Partial<Contract>) {
    setContracts((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  async function saveContract(contract: Contract) {
    const updated = await api(`/api/admin/crm/contracts/${contract.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        scopeOfWork: contract.scopeOfWork,
        terms: contract.terms,
        priceSar: contract.priceSar,
      }),
    });
    if (updated) setContracts((prev) => prev.map((c) => (c.id === contract.id ? updated : c)));
  }

  async function updateContractStatus(id: string, status: ContractStatus) {
    const updated = await api(`/api/admin/crm/contracts/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    if (updated) setContracts((prev) => prev.map((c) => (c.id === id ? updated : c)));
  }

  async function deleteContract(id: string) {
    const res = await api(`/api/admin/crm/contracts/${id}`, { method: "DELETE" });
    if (res) setContracts((prev) => prev.filter((c) => c.id !== id));
  }

  async function uploadSignedFile(contractId: string, file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
    if (!res.ok) {
      setError("Upload failed");
      return;
    }
    const { url } = await res.json();
    const updated = await api(`/api/admin/crm/contracts/${contractId}`, {
      method: "PATCH",
      body: JSON.stringify({ signedFileUrl: url }),
    });
    if (updated) setContracts((prev) => prev.map((c) => (c.id === contractId ? updated : c)));
  }

  async function copyContractLink(id: string) {
    const url = `${window.location.origin}/contract/${id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 2000);
    } catch {
      setError("Could not copy link");
    }
  }

  function whatsappLink(contract: Contract): string | null {
    const client = clients.find((c) => c.id === contract.clientId);
    if (!client?.phone) return null;
    const digits = client.phone.replace(/[^0-9]/g, "");
    if (!digits) return null;
    const url = `${window.location.origin}/contract/${contract.id}`;
    const text = `Hi ${client.name}, here's your contract from BK Web Design: ${url}`;
    return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
  }

  function projectTitle(projectId: string) {
    return projects.find((p) => p.id === projectId)?.title ?? "—";
  }

  const pipelineValue = projects
    .filter((p) => p.status !== "cancelled")
    .reduce((sum, p) => sum + p.priceSar, 0);

  const leadCounts = LEAD_STATUSES.reduce<Record<string, number>>((acc, status) => {
    acc[status] = leads.filter((l) => l.status === status).length;
    return acc;
  }, {});

  function clientName(clientId: string) {
    return clients.find((c) => c.id === clientId)?.name ?? "—";
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>Leads &amp; Clients</h1>
        <div className="admin-header-actions">
          {error && <span className="admin-status">{error}</span>}
          <Link href="/admin" className="admin-nav-link">
            Site content
          </Link>
          <Link href="/admin/social" className="admin-nav-link">
            Social
          </Link>
          <Link href="/admin/audits" className="admin-nav-link">
            Audits
          </Link>
          <button type="button" className="admin-logout" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>

      <section className="crm-stats">
        <div className="crm-stat-tile">
          <span className="crm-stat-value">{leadCounts.new ?? 0}</span>
          <span className="crm-stat-label">New leads</span>
        </div>
        <div className="crm-stat-tile">
          <span className="crm-stat-value">{leadCounts.contacted ?? 0}</span>
          <span className="crm-stat-label">Contacted</span>
        </div>
        <div className="crm-stat-tile">
          <span className="crm-stat-value">{clients.length}</span>
          <span className="crm-stat-label">Clients</span>
        </div>
        <div className="crm-stat-tile">
          <span className="crm-stat-value">{pipelineValue.toLocaleString("en-US")} SAR</span>
          <span className="crm-stat-label">Pipeline value</span>
        </div>
      </section>

      <section className="admin-section">
        <h2>Leads</h2>
        {leads.length === 0 && <p className="admin-status">No leads yet.</p>}
        {leads.map((lead) => (
          <div className="admin-item" key={lead.id}>
            <div className="admin-item-head">
              <strong>{lead.name}</strong>
              <span className="admin-status">{lead.email}</span>
              <select
                value={lead.status}
                onChange={(e) => updateLeadStatus(lead.id, e.target.value as LeadStatus)}
              >
                {LEAD_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {!lead.clientId && (
                <button type="button" onClick={() => promoteLead(lead)}>
                  Promote to client
                </button>
              )}
              <button type="button" className="admin-remove" onClick={() => deleteLead(lead.id)}>
                Delete
              </button>
            </div>
            {lead.message && <p>{lead.message}</p>}
            {lead.suggestedReply && (
              <p className="admin-status">Suggested reply: {lead.suggestedReply}</p>
            )}
          </div>
        ))}
      </section>

      <section className="admin-section">
        <h2>Clients</h2>
        {clients.length === 0 && <p className="admin-status">No clients yet.</p>}
        {clients.map((client) => (
          <div className="admin-item" key={client.id}>
            <div className="admin-item-head">
              <strong>{client.name}</strong>
              <span className="admin-status">{client.email}</span>
              {client.company && <span className="admin-status">{client.company}</span>}
              <button type="button" className="admin-remove" onClick={() => deleteClient(client.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}

        <div className="admin-field-pair">
          <div className="admin-field">
            <label>Name</label>
            <input
              value={clientDraft.name}
              onChange={(e) => setClientDraft({ ...clientDraft, name: e.target.value })}
            />
          </div>
          <div className="admin-field">
            <label>Email</label>
            <input
              value={clientDraft.email}
              onChange={(e) => setClientDraft({ ...clientDraft, email: e.target.value })}
            />
          </div>
          <div className="admin-field">
            <label>Company</label>
            <input
              value={clientDraft.company}
              onChange={(e) => setClientDraft({ ...clientDraft, company: e.target.value })}
            />
          </div>
          <div className="admin-field">
            <label>Phone</label>
            <input
              value={clientDraft.phone}
              onChange={(e) => setClientDraft({ ...clientDraft, phone: e.target.value })}
            />
          </div>
        </div>
        <button type="button" className="admin-add" onClick={addClient}>
          + Add client
        </button>
      </section>

      <section className="admin-section">
        <h2>Projects</h2>
        {projects.length === 0 && <p className="admin-status">No projects yet.</p>}
        {projects.map((project) => (
          <div className="admin-item" key={project.id}>
            <div className="admin-item-head">
              <strong>{project.title}</strong>
              <span className="admin-status">{clientName(project.clientId)}</span>
              <span className="admin-status">
                {project.tier} — {project.priceSar.toLocaleString("en-US")} SAR
              </span>
              <select
                value={project.status}
                onChange={(e) => updateProjectStatus(project.id, e.target.value as ProjectStatus)}
              >
                {PROJECT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <button type="button" className="admin-remove" onClick={() => deleteProject(project.id)}>
                Delete
              </button>
            </div>
            {project.features.length > 0 && (
              <p className="admin-status">{project.features.join(", ")}</p>
            )}
          </div>
        ))}

        <div className="admin-field-pair">
          <div className="admin-field">
            <label>Client</label>
            <select
              value={projectDraft.clientId}
              onChange={(e) => setProjectDraft({ ...projectDraft, clientId: e.target.value })}
            >
              <option value="">Select a client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-field">
            <label>Title</label>
            <input
              value={projectDraft.title}
              onChange={(e) => setProjectDraft({ ...projectDraft, title: e.target.value })}
            />
          </div>
          <div className="admin-field">
            <label>Tier</label>
            <select
              value={projectDraft.tier}
              onChange={(e) =>
                setProjectDraft({ ...projectDraft, tier: e.target.value as PricingTier })
              }
            >
              {PRICING_TIERS.map((tier) => (
                <option key={tier} value={tier}>
                  {tier}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-field">
            <label>Price (SAR)</label>
            <input
              type="text"
              inputMode="decimal"
              lang="en"
              value={projectDraft.priceSar}
              onChange={(e) => setProjectDraft({ ...projectDraft, priceSar: e.target.value })}
            />
          </div>
          <div className="admin-field">
            <label>Features (comma-separated)</label>
            <input
              value={projectDraft.features}
              onChange={(e) => setProjectDraft({ ...projectDraft, features: e.target.value })}
            />
          </div>
        </div>
        <button type="button" className="admin-add" onClick={addProject}>
          + Add project
        </button>
      </section>

      <section className="admin-section">
        <h2>Contracts</h2>
        {contracts.length === 0 && <p className="admin-status">No contracts yet.</p>}
        {contracts.map((contract) => {
          const wa = whatsappLink(contract);
          return (
            <div className="admin-item" key={contract.id}>
              <div className="admin-item-head">
                <strong>{projectTitle(contract.projectId)}</strong>
                <span className="admin-status">{clientName(contract.clientId)}</span>
                <select
                  value={contract.status}
                  onChange={(e) =>
                    updateContractStatus(contract.id, e.target.value as ContractStatus)
                  }
                >
                  {CONTRACT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button type="button" className="admin-remove" onClick={() => deleteContract(contract.id)}>
                  Delete
                </button>
              </div>

              <div className="admin-field">
                <label>Price (SAR)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  lang="en"
                  value={contract.priceSar}
                  onChange={(e) => {
                    const num = Number(e.target.value);
                    if (!Number.isNaN(num)) updateContractLocal(contract.id, { priceSar: num });
                  }}
                />
              </div>
              <div className="admin-field">
                <label>Scope of work</label>
                <textarea
                  rows={5}
                  value={contract.scopeOfWork}
                  onChange={(e) => updateContractLocal(contract.id, { scopeOfWork: e.target.value })}
                />
              </div>
              <div className="admin-field">
                <label>Terms</label>
                <textarea
                  rows={5}
                  value={contract.terms}
                  onChange={(e) => updateContractLocal(contract.id, { terms: e.target.value })}
                />
              </div>

              <div className="admin-item-head">
                <button type="button" onClick={() => saveContract(contract)}>
                  Save changes
                </button>
                <button type="button" onClick={() => copyContractLink(contract.id)}>
                  {copiedId === contract.id ? "Copied!" : "Copy link"}
                </button>
                {wa && (
                  <a href={wa} target="_blank" rel="noopener" className="btn btn-ghost">
                    Send via WhatsApp
                  </a>
                )}
                {!wa && <span className="admin-status">Add a client phone to enable WhatsApp</span>}
                <label className="admin-status">
                  Signed proof:{" "}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadSignedFile(contract.id, file);
                    }}
                  />
                </label>
                {contract.signedFileUrl && (
                  <a href={contract.signedFileUrl} target="_blank" rel="noopener">
                    View proof
                  </a>
                )}
              </div>
            </div>
          );
        })}

        <div className="admin-field-pair">
          <div className="admin-field">
            <label>Project</label>
            <select
              value={contractProjectId}
              onChange={(e) => setContractProjectId(e.target.value)}
            >
              <option value="">Select a project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} — {clientName(p.clientId)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button type="button" className="admin-add" onClick={generateContract} disabled={generatingContract}>
          {generatingContract ? "Generating..." : "+ Generate contract"}
        </button>
      </section>
    </div>
  );
}
