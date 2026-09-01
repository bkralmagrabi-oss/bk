import Image from "next/image";

export type DocumentLanguage = "ar" | "en";

export type BilingualDocumentPageProps = {
  lang: DocumentLanguage;
  docLabelEn: string;
  docLabelAr: string;
  clientName: string;
  clientCompany: string | null;
  projectTitle: string;
  priceSar: number;
  date: string;
  scopeOfWorkEn: string;
  scopeOfWorkAr: string;
  termsEn: string;
  termsAr: string;
  showSignature: boolean;
};

const SIGNER_NAME_EN = "Bakr Al-Maghrabi";
const SIGNER_NAME_AR = "بكر المغربي";
const SIGNER_TITLE_EN = "CEO";
const SIGNER_TITLE_AR = "المدير التنفيذي";

const LABELS = {
  en: {
    client: "Client",
    project: "Project",
    price: "Price",
    priceUnit: "SAR",
    date: "Date",
    scopeHeading: "Scope of Work",
    scopeFallback: "Not yet translated.",
    termsHeading: "Terms",
    signerLine: (n: string, t: string) => `${n}, ${t} (BK Web Design)`,
    clientLine: (n: string) => `${n} (Client)`,
  },
  ar: {
    client: "العميل",
    project: "المشروع",
    price: "السعر",
    priceUnit: "ر.س",
    date: "التاريخ",
    scopeHeading: "نطاق العمل",
    scopeFallback: "لم تتم الترجمة بعد.",
    termsHeading: "الشروط",
    signerLine: (n: string, t: string) => `${n}، ${t} (BK Web Design)`,
    clientLine: (n: string) => `${n} (العميل)`,
  },
};

export function BilingualDocumentPage({
  lang,
  docLabelEn,
  docLabelAr,
  clientName,
  clientCompany,
  projectTitle,
  priceSar,
  date,
  scopeOfWorkEn,
  scopeOfWorkAr,
  termsEn,
  termsAr,
  showSignature,
}: BilingualDocumentPageProps) {
  const t = LABELS[lang];
  const docLabel = lang === "ar" ? docLabelAr : docLabelEn;
  const scopeOfWork = lang === "ar" ? scopeOfWorkAr : scopeOfWorkEn;
  const terms = lang === "ar" ? termsAr : termsEn;
  const signerName = lang === "ar" ? SIGNER_NAME_AR : SIGNER_NAME_EN;
  const signerTitle = lang === "ar" ? SIGNER_TITLE_AR : SIGNER_TITLE_EN;

  return (
    <div className="doc-page">
      <div className="doc-sheet">
        <header className="doc-logo-header">
          <Image src="/logo-lockup-ink.png" alt="BK Web Design" width={120} height={95} priority />
        </header>

        <div className="doc-doclabel-row">
          <span className="doc-doclabel">{docLabel}</span>
        </div>

        <section className="doc-single" dir={lang === "ar" ? "rtl" : "ltr"}>
          <dl className="doc-meta">
            <div>
              <dt>{t.client}</dt>
              <dd>
                {clientName}
                {clientCompany ? ` (${clientCompany})` : ""}
              </dd>
            </div>
            <div>
              <dt>{t.project}</dt>
              <dd>{projectTitle}</dd>
            </div>
            <div>
              <dt>{t.price}</dt>
              <dd>
                {priceSar.toLocaleString("en-US")} {t.priceUnit}
              </dd>
            </div>
            <div>
              <dt>{t.date}</dt>
              <dd>{date}</dd>
            </div>
          </dl>

          <h2>{t.scopeHeading}</h2>
          <p className="doc-body-text">{scopeOfWork || t.scopeFallback}</p>

          <h2>{t.termsHeading}</h2>
          <p className="doc-body-text">{terms}</p>

          {showSignature && (
            <div className="doc-signature">
              <div>
                <span className="doc-sig-line" />
                <span>{t.signerLine(signerName, signerTitle)}</span>
              </div>
              <div>
                <span className="doc-sig-line" />
                <span>{t.clientLine(clientName)}</span>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
