"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Bilingual, ServiceIcon, SiteContent } from "@/lib/content-types";
import { makeId } from "@/lib/id";

const ICON_OPTIONS: ServiceIcon[] = ["website", "landing", "portfolio", "responsive", "support"];

function emptyBilingual(): Bilingual {
  return { en: "", ar: "" };
}

function BilingualInput({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: Bilingual;
  onChange: (next: Bilingual) => void;
  multiline?: boolean;
}) {
  return (
    <div className="admin-field-pair">
      <div className="admin-field">
        <label>{label} (EN)</label>
        {multiline ? (
          <textarea
            rows={3}
            value={value.en}
            onChange={(e) => onChange({ ...value, en: e.target.value })}
          />
        ) : (
          <input value={value.en} onChange={(e) => onChange({ ...value, en: e.target.value })} />
        )}
      </div>
      <div className="admin-field" dir="rtl">
        <label>{label} (AR)</label>
        {multiline ? (
          <textarea
            rows={3}
            value={value.ar}
            onChange={(e) => onChange({ ...value, ar: e.target.value })}
          />
        ) : (
          <input value={value.ar} onChange={(e) => onChange({ ...value, ar: e.target.value })} />
        )}
      </div>
    </div>
  );
}

export function AdminEditor({ initialContent }: { initialContent: SiteContent }) {
  const router = useRouter();
  const [content, setContent] = useState<SiteContent>(initialContent);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  async function handleSave() {
    setSaving(true);
    setStatus(null);
    const res = await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content),
    });
    setSaving(false);
    setStatus(res.ok ? "Saved." : "Failed to save.");
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  async function uploadImage(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
    if (!res.ok) return null;
    const data = await res.json();
    return data.url as string;
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>Site Content</h1>
        <div className="admin-header-actions">
          {status && <span className="admin-status">{status}</span>}
          <Link href="/admin/crm" className="admin-nav-link">
            Leads &amp; clients
          </Link>
          <Link href="/admin/social" className="admin-nav-link">
            Social
          </Link>
          <Link href="/admin/audits" className="admin-nav-link">
            Audits
          </Link>
          <button type="button" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </button>
          <button type="button" className="admin-logout" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>

      <section className="admin-section">
        <h2>Hero</h2>
        <BilingualInput
          label="Eyebrow"
          value={content.hero.eyebrow}
          onChange={(v) => setContent({ ...content, hero: { ...content.hero, eyebrow: v } })}
        />
        <BilingualInput
          label="Title"
          value={content.hero.title}
          onChange={(v) => setContent({ ...content, hero: { ...content.hero, title: v } })}
          multiline
        />
        <BilingualInput
          label="Subtitle"
          value={content.hero.subtitle}
          onChange={(v) => setContent({ ...content, hero: { ...content.hero, subtitle: v } })}
          multiline
        />
      </section>

      <section className="admin-section">
        <h2>Services</h2>
        {content.services.map((service, i) => (
          <div className="admin-item" key={service.id}>
            <div className="admin-item-head">
              <select
                value={service.icon}
                onChange={(e) => {
                  const services = [...content.services];
                  services[i] = { ...service, icon: e.target.value as ServiceIcon };
                  setContent({ ...content, services });
                }}
              >
                {ICON_OPTIONS.map((icon) => (
                  <option key={icon} value={icon}>
                    {icon}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="admin-remove"
                onClick={() =>
                  setContent({
                    ...content,
                    services: content.services.filter((s) => s.id !== service.id),
                  })
                }
              >
                Remove
              </button>
            </div>
            <BilingualInput
              label="Title"
              value={service.title}
              onChange={(v) => {
                const services = [...content.services];
                services[i] = { ...service, title: v };
                setContent({ ...content, services });
              }}
            />
            <BilingualInput
              label="Description"
              value={service.description}
              onChange={(v) => {
                const services = [...content.services];
                services[i] = { ...service, description: v };
                setContent({ ...content, services });
              }}
              multiline
            />
          </div>
        ))}
        <button
          type="button"
          className="admin-add"
          onClick={() =>
            setContent({
              ...content,
              services: [
                ...content.services,
                {
                  id: makeId("service"),
                  icon: "website",
                  title: emptyBilingual(),
                  description: emptyBilingual(),
                },
              ],
            })
          }
        >
          + Add service
        </button>
      </section>

      <section className="admin-section">
        <h2>Portfolio</h2>
        {content.portfolio.map((item, i) => (
          <div className="admin-item" key={item.id}>
            <div className="admin-item-head">
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.imageUrl} alt="" className="admin-thumb-preview" />
              ) : (
                <span className="admin-thumb-placeholder">No image</span>
              )}
              <input
                ref={(el) => {
                  fileInputs.current[item.id] = el;
                }}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  setUploadingId(item.id);
                  const url = await uploadImage(file);
                  setUploadingId(null);
                  if (!url) {
                    setStatus("Image upload failed.");
                    return;
                  }
                  const portfolio = [...content.portfolio];
                  portfolio[i] = { ...item, imageUrl: url };
                  setContent({ ...content, portfolio });
                }}
              />
              <button
                type="button"
                onClick={() => fileInputs.current[item.id]?.click()}
                disabled={uploadingId === item.id}
              >
                {uploadingId === item.id ? "Uploading..." : "Upload image"}
              </button>
              <button
                type="button"
                className="admin-remove"
                onClick={() =>
                  setContent({
                    ...content,
                    portfolio: content.portfolio.filter((p) => p.id !== item.id),
                  })
                }
              >
                Remove
              </button>
            </div>
            <BilingualInput
              label="Title"
              value={item.title}
              onChange={(v) => {
                const portfolio = [...content.portfolio];
                portfolio[i] = { ...item, title: v };
                setContent({ ...content, portfolio });
              }}
            />
            <BilingualInput
              label="Tag"
              value={item.tag}
              onChange={(v) => {
                const portfolio = [...content.portfolio];
                portfolio[i] = { ...item, tag: v };
                setContent({ ...content, portfolio });
              }}
            />
            <div className="admin-field">
              <label>Website link (https://...)</label>
              <input
                value={item.link ?? ""}
                onChange={(e) => {
                  const portfolio = [...content.portfolio];
                  portfolio[i] = { ...item, link: e.target.value || null };
                  setContent({ ...content, portfolio });
                }}
              />
            </div>
          </div>
        ))}
        <button
          type="button"
          className="admin-add"
          onClick={() =>
            setContent({
              ...content,
              portfolio: [
                ...content.portfolio,
                {
                  id: makeId("project"),
                  title: emptyBilingual(),
                  tag: emptyBilingual(),
                  imageUrl: null,
                  link: null,
                },
              ],
            })
          }
        >
          + Add project
        </button>
      </section>

      <section className="admin-section">
        <h2>About</h2>
        <BilingualInput
          label="Text"
          value={content.about.text}
          onChange={(v) => setContent({ ...content, about: { ...content.about, text: v } })}
          multiline
        />
        {content.about.pillars.map((pillar, i) => (
          <div className="admin-item" key={pillar.id}>
            <div className="admin-item-head">
              <span>Pillar {i + 1}</span>
              <button
                type="button"
                className="admin-remove"
                onClick={() =>
                  setContent({
                    ...content,
                    about: {
                      ...content.about,
                      pillars: content.about.pillars.filter((p) => p.id !== pillar.id),
                    },
                  })
                }
              >
                Remove
              </button>
            </div>
            <BilingualInput
              label="Title"
              value={pillar.title}
              onChange={(v) => {
                const pillars = [...content.about.pillars];
                pillars[i] = { ...pillar, title: v };
                setContent({ ...content, about: { ...content.about, pillars } });
              }}
            />
            <BilingualInput
              label="Description"
              value={pillar.description}
              onChange={(v) => {
                const pillars = [...content.about.pillars];
                pillars[i] = { ...pillar, description: v };
                setContent({ ...content, about: { ...content.about, pillars } });
              }}
              multiline
            />
          </div>
        ))}
        <button
          type="button"
          className="admin-add"
          onClick={() =>
            setContent({
              ...content,
              about: {
                ...content.about,
                pillars: [
                  ...content.about.pillars,
                  { id: makeId("pillar"), title: emptyBilingual(), description: emptyBilingual() },
                ],
              },
            })
          }
        >
          + Add pillar
        </button>
      </section>

      <section className="admin-section">
        <h2>Contact</h2>
        <div className="admin-field">
          <label>Email</label>
          <input
            value={content.contact.email}
            onChange={(e) =>
              setContent({ ...content, contact: { ...content.contact, email: e.target.value } })
            }
          />
        </div>
        <div className="admin-field">
          <label>WhatsApp link (https://wa.me/...)</label>
          <input
            value={content.contact.whatsapp}
            onChange={(e) =>
              setContent({ ...content, contact: { ...content.contact, whatsapp: e.target.value } })
            }
          />
        </div>
        <div className="admin-field">
          <label>Instagram link</label>
          <input
            value={content.contact.instagram}
            onChange={(e) =>
              setContent({ ...content, contact: { ...content.contact, instagram: e.target.value } })
            }
          />
        </div>
        <div className="admin-field">
          <label>Instagram handle (display text)</label>
          <input
            value={content.contact.instagramHandle}
            onChange={(e) =>
              setContent({
                ...content,
                contact: { ...content.contact, instagramHandle: e.target.value },
              })
            }
          />
        </div>
        <div className="admin-field">
          <label>TikTok link</label>
          <input
            value={content.contact.tiktok}
            onChange={(e) =>
              setContent({ ...content, contact: { ...content.contact, tiktok: e.target.value } })
            }
          />
        </div>
        <div className="admin-field">
          <label>TikTok handle (display text)</label>
          <input
            value={content.contact.tiktokHandle}
            onChange={(e) =>
              setContent({
                ...content,
                contact: { ...content.contact, tiktokHandle: e.target.value },
              })
            }
          />
        </div>
      </section>

      <section className="admin-section">
        <h2>Footer</h2>
        <BilingualInput
          label="Tagline"
          value={content.footer.tagline}
          onChange={(v) => setContent({ ...content, footer: { ...content.footer, tagline: v } })}
        />
      </section>

      <div className="admin-footer-actions">
        <button type="button" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  );
}
