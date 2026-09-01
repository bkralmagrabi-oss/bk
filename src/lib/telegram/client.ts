function getToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  return token;
}

export async function sendMessage(
  chatId: number,
  text: string,
  options?: { forceReply?: boolean },
): Promise<void> {
  const token = getToken();
  const body: Record<string, unknown> = { chat_id: chatId, text };
  if (options?.forceReply) {
    body.reply_markup = { force_reply: true, selective: true };
  }

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function sendDocument(
  chatId: number,
  buffer: Buffer,
  filename: string,
  caption?: string,
): Promise<void> {
  const token = getToken();
  const formData = new FormData();
  formData.append("chat_id", String(chatId));
  if (caption) formData.append("caption", caption);
  formData.append(
    "document",
    new Blob([new Uint8Array(buffer)], { type: "application/pdf" }),
    filename,
  );

  const res = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Telegram sendDocument failed (status ${res.status})${detail ? `: ${detail}` : ""}`);
  }
}

export async function getFileDownloadUrl(fileId: string): Promise<string | null> {
  const token = getToken();
  const res = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`);
  if (!res.ok) return null;

  const data = await res.json();
  const filePath = data?.result?.file_path;
  if (!filePath) return null;

  return `https://api.telegram.org/file/bot${token}/${filePath}`;
}

export async function downloadFile(url: string): Promise<ArrayBuffer | null> {
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.arrayBuffer();
}
