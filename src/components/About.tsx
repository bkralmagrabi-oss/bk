"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useContent } from "@/context/ContentContext";
import { Reveal } from "./Reveal";

export function About() {
  const { t, lang } = useLanguage();
  const { about } = useContent();

  return (
    <section className="about" id="about">
      <div className="container">
        <Reveal className="section-head">
          <p className="eyebrow">{t("about_eyebrow")}</p>
          <h2>{t("about_title")}</h2>
          <p className="section-subtitle about-text">{about.text[lang]}</p>
        </Reveal>

        <div className="pillars">
          {about.pillars.map((pillar, i) => (
            <Reveal delay={i * 70} key={pillar.id}>
              <div className="pillar">
                <span className="pillar-index">{String(i + 1).padStart(2, "0")}</span>
                <h3>{pillar.title[lang]}</h3>
                <p>{pillar.description[lang]}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
