"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useContent } from "@/context/ContentContext";
import { Reveal } from "./Reveal";

const THUMB_CLASSES = ["thumb-1", "thumb-2", "thumb-3", "thumb-4"];

export function Portfolio() {
  const { t, lang } = useLanguage();
  const { portfolio } = useContent();

  return (
    <section className="portfolio" id="portfolio">
      <div className="container">
        <Reveal className="section-head">
          <p className="eyebrow">{t("portfolio_eyebrow")}</p>
          <h2>{t("portfolio_title")}</h2>
          <p className="section-subtitle">{t("portfolio_subtitle")}</p>
        </Reveal>

        <div className="portfolio-grid">
          {portfolio.map((project, i) => {
            const CardTag = project.link ? "a" : "article";
            const cardProps = project.link
              ? { href: project.link, target: "_blank", rel: "noopener noreferrer" }
              : {};

            return (
              <Reveal delay={i * 70} key={project.id}>
                <CardTag className="project-card" {...cardProps}>
                  {project.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className="project-thumb project-thumb-image"
                      src={project.imageUrl}
                      alt={project.title[lang]}
                    />
                  ) : (
                    <div
                      className={`project-thumb ${THUMB_CLASSES[i % THUMB_CLASSES.length]}`}
                      aria-hidden="true"
                    >
                      <span>{String(i + 1).padStart(2, "0")}</span>
                    </div>
                  )}
                  <h3>{project.title[lang]}</h3>
                  <p>{project.tag[lang]}</p>
                </CardTag>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
