import { generatePdfFromUrl } from "./pdfshift";
import { sendDocument } from "../telegram/client";

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
