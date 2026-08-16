"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/translations";
import { Logo } from "./Logo";

const navItems: { key: TranslationKey; href: string }[] = [
  { key: "nav_home", href: "#top" },
  { key: "nav_services", href: "#services" },
  { key: "nav_portfolio", href: "#portfolio" },
  { key: "nav_about", href: "#about" },
  { key: "nav_contact", href: "#contact" },
];

export function Header() {
  const { t, toggleLang } = useLanguage();
  const [navOpen, setNavOpen] = useState(false);

  return (
    <header className="site-header" id="top">
      <div className="container header-inner">
        <Logo variant="full" theme="ink" />

        <nav className={navOpen ? "site-nav open" : "site-nav"} id="site-nav">
          <ul>
            {navItems.map((item) => (
              <li key={item.key}>
                <a href={item.href} onClick={() => setNavOpen(false)}>
                  {t(item.key)}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-actions">
          <button
            className="lang-toggle"
            type="button"
            aria-label="Switch language"
            onClick={toggleLang}
          >
            <span className="lang-en">EN</span>
            <span className="lang-sep">/</span>
            <span className="lang-ar">عربي</span>
          </button>
          <button
            className={navOpen ? "nav-toggle open" : "nav-toggle"}
            type="button"
            aria-label="Open menu"
            aria-expanded={navOpen}
            aria-controls="site-nav"
            onClick={() => setNavOpen((open) => !open)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
}
