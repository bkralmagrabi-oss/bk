"use client";

import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { Reveal } from "./Reveal";

export function Hero() {
  const { t } = useLanguage();

  return (
    <section className="hero">
      <div className="container hero-inner">
        <div className="hero-copy">
          <Reveal>
            <p className="eyebrow">{t("hero_eyebrow")}</p>
          </Reveal>
          <Reveal delay={80}>
            <h1>{t("hero_title")}</h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="hero-subtitle">{t("hero_subtitle")}</p>
          </Reveal>
          <Reveal delay={240}>
            <div className="hero-actions">
              <a href="#contact" className="btn btn-primary">
                {t("hero_cta")}
              </a>
              <a href="#portfolio" className="btn btn-ghost">
                {t("hero_cta_secondary")}
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal delay={120} className="hero-visual">
          <Image
            className="hero-logo-img"
            src="/logo-lockup-ink.png"
            alt="BK Web Design"
            width={747}
            height={594}
            priority
          />
        </Reveal>
      </div>
    </section>
  );
}
