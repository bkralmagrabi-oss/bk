import Image from "next/image";

export type BilingualDocumentPageProps = {
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

export function BilingualDocumentPage({
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
  return (
    <div className="doc-page">
      <div className="doc-sheet">
        <header className="doc-logo-header">
          <Image src="/logo-lockup-ink.png" alt="BK Web Design" width={140} height={111} priority />
        </header>

        <div className="doc-doclabel-row">
          <span className="doc-doclabel" dir="ltr">
            {docLabelEn}
          </span>
          <span className="doc-doclabel" dir="rtl">
            {docLabelAr}
          </span>
        </div>

        <div className="doc-columns">
          <section className="doc-col doc-col-en" dir="ltr">
            <dl className="doc-meta">
              <div>
                <dt>Client</dt>
                <dd>
                  {clientName}
                  {clientCompany ? ` (${clientCompany})` : ""}
                </dd>
              </div>
              <div>
                <dt>Project</dt>
                <dd>{projectTitle}</dd>
              </div>
              <div>
                <dt>Price</dt>
                <dd>{priceSar.toLocaleString("en-US")} SAR</dd>
              </div>
              <div>
                <dt>Date</dt>
                <dd>{date}</dd>
              </div>
            </dl>

            <h2>Scope of Work</h2>
            <p className="doc-body-text">{scopeOfWorkEn || "Not yet translated."}</p>

            <h2>Terms</h2>
            <p className="doc-body-text">{termsEn}</p>

            {showSignature && (
              <div className="doc-signature">
                <div>
                  <span className="doc-sig-line" />
                  <span>
                    {SIGNER_NAME_EN}, {SIGNER_TITLE_EN} (BK Web Design)
                  </span>
                </div>
                <div>
                  <span className="doc-sig-line" />
                  <span>{clientName} (Client)</span>
                </div>
              </div>
            )}
          </section>

          <section className="doc-col doc-col-ar" dir="rtl">
            <dl className="doc-meta">
              <div>
                <dt>العميل</dt>
                <dd>
                  {clientName}
                  {clientCompany ? ` (${clientCompany})` : ""}
                </dd>
              </div>
              <div>
                <dt>المشروع</dt>
                <dd>{projectTitle}</dd>
              </div>
              <div>
                <dt>السعر</dt>
                <dd>{priceSar.toLocaleString("en-US")} ر.س</dd>
              </div>
              <div>
                <dt>التاريخ</dt>
                <dd>{date}</dd>
              </div>
            </dl>

            <h2>نطاق العمل</h2>
            <p className="doc-body-text">{scopeOfWorkAr || "لم تتم الترجمة بعد."}</p>

            <h2>الشروط</h2>
            <p className="doc-body-text">{termsAr}</p>

            {showSignature && (
              <div className="doc-signature">
                <div>
                  <span className="doc-sig-line" />
                  <span>
                    {SIGNER_NAME_AR}، {SIGNER_TITLE_AR} (BK Web Design)
                  </span>
                </div>
                <div>
                  <span className="doc-sig-line" />
                  <span>{clientName} (العميل)</span>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
