import { NextRequest, NextResponse } from "next/server";
import { getSiteContent, saveSiteContent } from "@/lib/content-store";
import { processUpdate, type TelegramUpdate } from "@/lib/telegram/bot";
import { sendMessage } from "@/lib/telegram/client";

export async function POST(request: NextRequest) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const incomingSecret = request.headers.get("x-telegram-bot-api-secret-token");
  if (!secret || incomingSecret !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const update = (await request.json().catch(() => null)) as TelegramUpdate | null;
  const chatId = update?.message?.chat.id;
  if (!update || chatId === undefined) {
    return NextResponse.json({ ok: true });
  }

  const ownerChatId = process.env.TELEGRAM_OWNER_CHAT_ID;
  if (!ownerChatId || String(chatId) !== ownerChatId) {
    return NextResponse.json({ ok: true });
  }

  try {
    const content = await getSiteContent();
    const result = await processUpdate(update, content);

    if (result.nextContent) {
      await saveSiteContent(result.nextContent);
    }
    if (result.reply) {
      await sendMessage(chatId, result.reply, { forceReply: result.forceReply });
    }
  } catch (err) {
    console.error("telegram webhook error", err);
    await sendMessage(chatId, "Something went wrong on the server, please try again.").catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
