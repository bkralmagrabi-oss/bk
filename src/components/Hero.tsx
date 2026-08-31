"use client";

import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { useContent } from "@/context/ContentContext";
import { Reveal } from "./Reveal";

export function Hero() {
  const { t, lang } = useLanguage();
  const { hero } = useContent();

  return (
    <section className="hero">
      <div className="container hero-inner">
        <div className="hero-copy">
          <Reveal>
            <p className="eyebrow">{hero.eyebrow[lang]}</p>
          </Reveal>
          <Reveal delay={80}>
            <h1>{hero.title[lang]}</h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="hero-subtitle">{hero.subtitle[lang]}</p>
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
