"use client";

import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/translations";
import { Reveal } from "./Reveal";

const pillars: { titleKey: TranslationKey; descKey: TranslationKey; index: string }[] = [
  { titleKey: "about_pillar1_title", descKey: "about_pillar1_desc", index: "01" },
  { titleKey: "about_pillar2_title", descKey: "about_pillar2_desc", index: "02" },
  { titleKey: "about_pillar3_title", descKey: "about_pillar3_desc", index: "03" },
];

export function About() {
  const { t } = useLanguage();

  return (
    <section className="about" id="about">
      <div className="container">
        <Reveal className="section-head">
          <p className="eyebrow">{t("about_eyebrow")}</p>
          <h2>{t("about_title")}</h2>
          <p className="section-subtitle about-text">{t("about_text")}</p>
        </Reveal>

        <div className="pillars">
          {pillars.map((pillar, i) => (
            <Reveal delay={i * 70} key={pillar.titleKey}>
              <div className="pillar">
                <span className="pillar-index">{pillar.index}</span>
                <h3>{t(pillar.titleKey)}</h3>
                <p>{t(pillar.descKey)}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
