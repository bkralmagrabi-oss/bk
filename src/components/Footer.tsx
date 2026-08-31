"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useContent } from "@/context/ContentContext";
import { Logo } from "./Logo";

export function Footer() {
  const { t, lang } = useLanguage();
  const { footer } = useContent();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <Logo variant="icon" theme="white" />
        <p className="footer-tagline">{footer.tagline[lang]}</p>
        <p className="footer-rights">
          © {year} BK Web Design. {t("footer_rights")}
        </p>
      </div>
    </footer>
  );
}
