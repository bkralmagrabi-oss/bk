"use client";

import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/translations";
import { Reveal } from "./Reveal";

const projects: {
  titleKey: TranslationKey;
  tagKey: TranslationKey;
  thumbClass: string;
  index: string;
}[] = [
  { titleKey: "project1_title", tagKey: "project1_tag", thumbClass: "thumb-1", index: "01" },
  { titleKey: "project2_title", tagKey: "project2_tag", thumbClass: "thumb-2", index: "02" },
  { titleKey: "project3_title", tagKey: "project3_tag", thumbClass: "thumb-3", index: "03" },
  { titleKey: "project4_title", tagKey: "project4_tag", thumbClass: "thumb-4", index: "04" },
];

export function Portfolio() {
  const { t } = useLanguage();

  return (
    <section className="portfolio" id="portfolio">
      <div className="container">
        <Reveal className="section-head">
          <p className="eyebrow">{t("portfolio_eyebrow")}</p>
          <h2>{t("portfolio_title")}</h2>
          <p className="section-subtitle">{t("portfolio_subtitle")}</p>
        </Reveal>

        <div className="portfolio-grid">
          {projects.map((project, i) => (
            <Reveal delay={i * 70} key={project.titleKey}>
              <article className="project-card">
                <div className={`project-thumb ${project.thumbClass}`} aria-hidden="true">
                  <span>{project.index}</span>
                </div>
                <h3>{t(project.titleKey)}</h3>
                <p>{t(project.tagKey)}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
