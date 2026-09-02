const GRAPH_API_VERSION = "v21.0";

function getConfig(): { token: string; phoneNumberId: string } {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token) throw new Error("WHATSAPP_ACCESS_TOKEN is not configured");
  if (!phoneNumberId) throw new Error("WHATSAPP_PHONE_NUMBER_ID is not configured");
  return { token, phoneNumberId };
}

export async function sendTextMessage(to: string, text: string): Promise<void> {
  const { token, phoneNumberId } = getConfig();

  const res = await fetch(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text },
      }),
    },
  );

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`WhatsApp sendMessage failed (status ${res.status})${detail ? `: ${detail}` : ""}`);
  }
}

export async function markAsRead(messageId: string): Promise<void> {
  const { token, phoneNumberId } = getConfig();

  await fetch(`https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      status: "read",
      message_id: messageId,
    }),
  });
}
