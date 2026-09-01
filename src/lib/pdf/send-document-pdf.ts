import { generatePdfFromUrl } from "./pdfshift";
import { sendDocument } from "../telegram/client";

export type DocumentLanguage = "ar" | "en";
export type LanguageChoice = DocumentLanguage | "both";

export async function generateAndSendPdf(
  url: string,
  filename: string,
  caption: string,
): Promise<void> {
  const ownerChatId = process.env.TELEGRAM_OWNER_CHAT_ID;
  if (!ownerChatId) throw new Error("TELEGRAM_OWNER_CHAT_ID is not configured");

  const buffer = await generatePdfFromUrl(url);
  await sendDocument(Number(ownerChatId), buffer, filename, caption);
}

function languagesFor(choice: LanguageChoice): DocumentLanguage[] {
  return choice === "both" ? ["ar", "en"] : [choice];
}

/**
 * Sends one PDF per requested language (two separate files/messages for
 * "both", never a combined document). Each language is attempted
 * independently — a failure on one doesn't stop the other from being sent.
 */
export async function sendDocumentPdfs(
  baseUrl: string,
  choice: LanguageChoice,
  filenameBase: string,
  captionBase: string,
): Promise<{ sent: DocumentLanguage[]; failed: { lang: DocumentLanguage; error: string }[] }> {
  const languages = languagesFor(choice);
  const sent: DocumentLanguage[] = [];
  const failed: { lang: DocumentLanguage; error: string }[] = [];

  for (const lang of languages) {
    const url = `${baseUrl}?lang=${lang}`;
    const filename = `${filenameBase}-${lang.toUpperCase()}.pdf`;
    const caption = `${captionBase} (${lang === "ar" ? "Arabic" : "English"})`;
    try {
      await generateAndSendPdf(url, filename, caption);
      sent.push(lang);
    } catch (err) {
      failed.push({ lang, error: err instanceof Error ? err.message : "Unknown error" });
    }
  }

  return { sent, failed };
}
