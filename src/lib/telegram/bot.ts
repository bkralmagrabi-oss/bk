import type { PortfolioItem, SiteContent } from "@/lib/content-types";
import { makeId } from "@/lib/id";
import { uploadImageToBlob } from "@/lib/blob-upload";
import { downloadFile, getFileDownloadUrl } from "./client";

export type TelegramMessage = {
  chat: { id: number };
  text?: string;
  photo?: { file_id: string }[];
  reply_to_message?: { text?: string };
};

export type TelegramUpdate = {
  update_id?: number;
  message?: TelegramMessage;
};

export type ProcessResult = {
  reply: string;
  forceReply?: boolean;
  nextContent?: SiteContent;
};

// Conversation state is carried on Telegram's own reply chain (via force_reply +
// reply_to_message) instead of external storage, because writes to our Blob store
// are not immediately consistent enough for a multi-message-per-second flow: a
// message sent moments after a save can still read the previous value.
type BotState =
  | { step: "add_title_en" }
  | { step: "add_title_ar"; draft: { titleEn: string } }
  | { step: "add_tag_en"; draft: { titleEn: string; titleAr: string } }
  | { step: "add_tag_ar"; draft: { titleEn: string; titleAr: string; tagEn: string } }
  | { step: "add_link"; draft: { titleEn: string; titleAr: string; tagEn: string; tagAr: string } }
  | {
      step: "add_photo";
      draft: { titleEn: string; titleAr: string; tagEn: string; tagAr: string; link: string | null };
    }
  | { step: "delete_pick"; ids: string[] }
  | { step: "delete_confirm"; targetId: string };

const STATE_PREFIX = "⚙️STATE:";

function encodeState(state: BotState, humanText: string): string {
  return `${STATE_PREFIX}${JSON.stringify(state)}\n(سطر داخلي، تجاهله)\n\n${humanText}`;
}

function decodeState(text: string | undefined): BotState | null {
  if (!text) return null;
  const firstLine = text.split("\n")[0];
  if (!firstLine.startsWith(STATE_PREFIX)) return null;
  try {
    return JSON.parse(firstLine.slice(STATE_PREFIX.length)) as BotState;
  } catch {
    return null;
  }
}

const HELP_TEXT = [
  "الأوامر المتاحة:",
  "/add - إضافة مشروع جديد",
  "/list - عرض المشاريع الحالية",
  "/delete - حذف مشروع",
  "/cancel - إلغاء العملية الحالية",
].join("\n");

function listProjects(content: SiteContent): string {
  if (content.portfolio.length === 0) return "لا توجد مشاريع بعد.";
  return content.portfolio
    .map((p, i) => {
      const flags = [p.link ? "🔗" : null, p.imageUrl ? "🖼" : null].filter(Boolean).join(" ");
      return `${i + 1}. ${p.title.en} — ${p.tag.en}${flags ? " " + flags : ""}`;
    })
    .join("\n");
}

export async function processUpdate(update: TelegramUpdate, content: SiteContent): Promise<ProcessResult> {
  const message = update.message;
  if (!message) return { reply: "" };

  const text = message.text?.trim();
  const state = decodeState(message.reply_to_message?.text);

  if (text === "/cancel") return { reply: "تم الإلغاء." };
  if (text === "/start" || text === "/help") return { reply: HELP_TEXT };
  if (text === "/list") return { reply: listProjects(content) };
  if (text === "/add") {
    return {
      reply: encodeState({ step: "add_title_en" }, "لنضف مشروعًا جديدًا. أرسل عنوان المشروع بالإنجليزي:"),
      forceReply: true,
    };
  }
  if (text === "/delete") {
    if (content.portfolio.length === 0) return { reply: "لا توجد مشاريع لحذفها." };
    const ids = content.portfolio.map((p) => p.id);
    return {
      reply: encodeState(
        { step: "delete_pick", ids },
        `${listProjects(content)}\n\nرد برقم المشروع الذي تريد حذفه.`,
      ),
      forceReply: true,
    };
  }

  if (!state) return { reply: HELP_TEXT };

  return handleStep(state, text, message, content);
}

async function handleStep(
  state: BotState,
  text: string | undefined,
  message: TelegramMessage,
  content: SiteContent,
): Promise<ProcessResult> {
  switch (state.step) {
    case "add_title_en": {
      if (!text) return { reply: "من فضلك أرسل نص العنوان بالإنجليزي.", forceReply: true };
      return {
        reply: encodeState({ step: "add_title_ar", draft: { titleEn: text } }, "الآن أرسل العنوان بالعربي:"),
        forceReply: true,
      };
    }
    case "add_title_ar": {
      if (!text) return { reply: "من فضلك أرسل نص العنوان بالعربي.", forceReply: true };
      return {
        reply: encodeState(
          { step: "add_tag_en", draft: { ...state.draft, titleAr: text } },
          'الآن أرسل التصنيف/الوصف بالإنجليزي (مثال: "Business Website"):',
        ),
        forceReply: true,
      };
    }
    case "add_tag_en": {
      if (!text) return { reply: "من فضلك أرسل نص التصنيف بالإنجليزي.", forceReply: true };
      return {
        reply: encodeState(
          { step: "add_tag_ar", draft: { ...state.draft, tagEn: text } },
          "الآن أرسل التصنيف/الوصف بالعربي:",
        ),
        forceReply: true,
      };
    }
    case "add_tag_ar": {
      if (!text) return { reply: "من فضلك أرسل نص التصنيف بالعربي.", forceReply: true };
      return {
        reply: encodeState(
          { step: "add_link", draft: { ...state.draft, tagAr: text } },
          "أرسل رابط الموقع (https://...)، أو /skip إذا لم يكن هناك رابط بعد:",
        ),
        forceReply: true,
      };
    }
    case "add_link": {
      if (text === "/skip") {
        return {
          reply: encodeState(
            { step: "add_photo", draft: { ...state.draft, link: null } },
            "الآن أرسل صورة للصفحة الرئيسية للموقع، أو /skip:",
          ),
          forceReply: true,
        };
      }
      if (!text || !/^https?:\/\//i.test(text)) {
        return {
          reply: "هذا لا يبدو رابطًا صحيحًا. أرسل رابطًا يبدأ بـ http:// أو https://، أو /skip.",
          forceReply: true,
        };
      }
      return {
        reply: encodeState(
          { step: "add_photo", draft: { ...state.draft, link: text } },
          "الآن أرسل صورة للصفحة الرئيسية للموقع، أو /skip:",
        ),
        forceReply: true,
      };
    }
    case "add_photo": {
      const draft = state.draft;
      let imageUrl: string | null = null;

      if (text === "/skip") {
        imageUrl = null;
      } else if (message.photo && message.photo.length > 0) {
        const largest = message.photo[message.photo.length - 1];
        const fileUrl = await getFileDownloadUrl(largest.file_id);
        if (!fileUrl) return { reply: "تعذر جلب الصورة، حاول مرة أخرى أو أرسل /skip.", forceReply: true };

        const bytes = await downloadFile(fileUrl);
        if (!bytes) return { reply: "تعذر تحميل الصورة، حاول مرة أخرى أو أرسل /skip.", forceReply: true };

        try {
          imageUrl = await uploadImageToBlob(bytes, "image/jpeg", "jpg");
        } catch {
          return {
            reply: "تخزين الصور غير مُفعّل حاليًا. أرسل /skip وأضف الصورة لاحقًا من /admin.",
            forceReply: true,
          };
        }
      } else {
        return { reply: "أرسل صورة للصفحة الرئيسية للموقع، أو /skip.", forceReply: true };
      }

      const newProject: PortfolioItem = {
        id: makeId("project"),
        title: { en: draft.titleEn, ar: draft.titleAr },
        tag: { en: draft.tagEn, ar: draft.tagAr },
        imageUrl,
        link: draft.link,
      };

      return {
        reply: "✅ تمت الإضافة.",
        nextContent: { ...content, portfolio: [...content.portfolio, newProject] },
      };
    }
    case "delete_pick": {
      const index = text ? Number(text) - 1 : NaN;
      if (!Number.isInteger(index) || index < 0 || index >= state.ids.length) {
        return { reply: "من فضلك رد برقم صحيح من القائمة، أو أرسل /cancel.", forceReply: true };
      }
      const targetId = state.ids[index];
      const target = content.portfolio.find((p) => p.id === targetId);
      if (!target) return { reply: "هذا المشروع لم يعد موجودًا." };

      return {
        reply: encodeState(
          { step: "delete_confirm", targetId },
          `حذف "${target.title.en}"؟ رد بـ نعم أو لا.`,
        ),
        forceReply: true,
      };
    }
    case "delete_confirm": {
      const confirmed = text?.trim().toLowerCase() === "yes" || text?.trim() === "نعم";
      if (confirmed) {
        return {
          reply: "🗑 تم الحذف.",
          nextContent: { ...content, portfolio: content.portfolio.filter((p) => p.id !== state.targetId) },
        };
      }
      return { reply: "تم الإلغاء." };
    }
    default:
      return { reply: HELP_TEXT };
  }
}
