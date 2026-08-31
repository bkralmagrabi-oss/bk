"use client";

import type { ReactNode } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useContent } from "@/context/ContentContext";
import type { ServiceIcon } from "@/lib/content-types";
import { Reveal } from "./Reveal";

export const SERVICE_ICONS: Record<ServiceIcon, ReactNode> = {
  website: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4}>
      <rect x="2" y="4" width="20" height="14" rx="1.5" />
      <path d="M8 21h8M12 18v3" />
    </svg>
  ),
  landing: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4}>
      <rect x="4" y="2" width="16" height="20" rx="1.5" />
      <path d="M8 7h8M8 11h8M8 15h5" />
    </svg>
  ),
  portfolio: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4}>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
    </svg>
  ),
  responsive: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4}>
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <path d="M11 18h2" />
    </svg>
  ),
  support: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4}>
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22l-4-9-9-4 20-7z" />
    </svg>
  ),
};

export function Services() {
  const { t, lang } = useLanguage();
  const { services } = useContent();

  return (
    <section className="services" id="services">
      <div className="container">
        <Reveal className="section-head">
          <p className="eyebrow">{t("services_eyebrow")}</p>
          <h2>{t("services_title")}</h2>
          <p className="section-subtitle">{t("services_subtitle")}</p>
        </Reveal>

        <div className="services-grid">
          {services.map((service, i) => (
            <Reveal delay={i * 70} key={service.id}>
              <div className="service-card">
                <span className="icon" aria-hidden="true">
                  {SERVICE_ICONS[service.icon] ?? SERVICE_ICONS.website}
                </span>
                <h3>{service.title[lang]}</h3>
                <p>{service.description[lang]}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
