"use client";

import type { FormEvent } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Reveal } from "./Reveal";

export function Contact() {
  const { t } = useLanguage();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value.trim();
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    const message = (form.elements.namedItem("message") as HTMLTextAreaElement).value.trim();

    const subject = `New project inquiry from ${name}`;
    const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;

    window.location.href =
      "mailto:B.60@msn.com" +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;
  }

  return (
    <section className="contact" id="contact">
      <div className="container contact-inner">
        <Reveal className="contact-copy">
          <p className="eyebrow">{t("contact_eyebrow")}</p>
          <h2>{t("contact_title")}</h2>
          <p className="section-subtitle">{t("contact_subtitle")}</p>

          <p className="contact-or">{t("contact_or")}</p>
          <div className="contact-direct">
            <a
              className="direct-link whatsapp"
              href="https://wa.me/966535094964"
              target="_blank"
              rel="noopener"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12.02 2C6.5 2 2 6.48 2 12c0 1.85.5 3.58 1.36 5.08L2 22l5.06-1.33A9.94 9.94 0 0 0 12.02 22C17.5 22 22 17.52 22 12S17.5 2 12.02 2zm0 18.1c-1.62 0-3.13-.46-4.42-1.24l-.32-.19-3 .79.8-2.92-.2-.3A8.07 8.07 0 0 1 3.9 12c0-4.48 3.65-8.1 8.12-8.1 4.47 0 8.12 3.62 8.12 8.1 0 4.48-3.65 8.1-8.12 8.1zm4.44-6.06c-.24-.12-1.43-.7-1.65-.78-.22-.08-.38-.12-.55.12-.16.24-.63.78-.77.94-.14.16-.28.18-.52.06-.24-.12-1.02-.37-1.94-1.19-.72-.63-1.2-1.42-1.34-1.66-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.32-.75-1.8-.2-.48-.4-.42-.55-.42-.14 0-.3-.02-.46-.02-.16 0-.42.06-.64.3-.22.24-.85.83-.85 2.02s.87 2.35 1 2.51c.12.16 1.72 2.62 4.16 3.68.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.43-.58 1.63-1.15.2-.56.2-1.04.14-1.15-.06-.1-.22-.16-.46-.28z" />
              </svg>
              <span>{t("whatsapp_label")}</span>
            </a>
            <a className="direct-link email" href="mailto:B.60@msn.com">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} aria-hidden="true">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m3 6 9 7 9-7" />
              </svg>
              <span>B.60@msn.com</span>
            </a>
            <a
              className="direct-link instagram"
              href="https://instagram.com/bk.webs"
              target="_blank"
              rel="noopener"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4.2" />
                <circle cx="17.4" cy="6.6" r="1" />
              </svg>
              <span>@bk.webs</span>
            </a>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <form className="contact-form" onSubmit={handleSubmit}>
            <label htmlFor="cf-name">{t("form_name")}</label>
            <input type="text" id="cf-name" name="name" required placeholder={t("form_name_ph")} />

            <label htmlFor="cf-email">{t("form_email")}</label>
            <input type="email" id="cf-email" name="email" required placeholder={t("form_email_ph")} />

            <label htmlFor="cf-message">{t("form_message")}</label>
            <textarea id="cf-message" name="message" rows={5} required placeholder={t("form_message_ph")} />

            <button type="submit" className="btn btn-primary">
              {t("form_submit")}
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
