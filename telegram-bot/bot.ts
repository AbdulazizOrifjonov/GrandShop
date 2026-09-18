import { Telegraf, Context } from "telegraf";
import { message } from "telegraf/filters";
import { parseProductText, ParsedProduct } from "./aiParser";
import { insertProduct, uploadImageToSupabase } from "./supabaseClient";
import { createClient } from "@supabase/supabase-js";

const token = process.env.TELEGRAM_BOT_TOKEN;
const adminId = process.env.TELEGRAM_ADMIN_ID;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://jcxuntvtoemnhnsxjwrh.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_4zhII_zDXEp-yRK40kHyLQ_PLjaJ4dL"
);

export const bot = new Telegraf(token || "");

interface PendingProduct {
  mediaGroupId: string;
  messageId: number;
  text: string;
  photoIds: string[];
  parsed: ParsedProduct | null;
  timer?: any;
}

const pendingGroups = new Map<string, PendingProduct>();

bot.use(async (ctx, next) => {
  if (ctx.from) {
    const allowedAdmins = [adminId, "615329280"];
    if (!allowedAdmins.includes(ctx.from.id.toString())) {
      if (ctx.message) await ctx.reply("Access denied.");
      return;
    }
  }
  return next();
});

bot.start((ctx) => ctx.reply("Salom! Menga mahsulotlarni forward qiling. Men ularni avtomatik tarzda analiz qilib, dublikatlarni tekshirib, saytga joylayman!"));

bot.on(message("photo"), async (ctx) => {
  const mediaGroupId = ctx.message.media_group_id || \single_\\;
  const photos = ctx.message.photo;
  const bestPhoto = photos[photos.length - 1];
  const text = ctx.message.caption || "";

  if (pendingGroups.has(mediaGroupId)) {
    const group = pendingGroups.get(mediaGroupId)!;
    group.photoIds.push(bestPhoto.file_id);
    if (text && !group.text) group.text = text;
    clearTimeout(group.timer);
    group.timer = setTimeout(() => processMediaGroup(ctx, mediaGroupId), 3000);
  } else {
    const group: PendingProduct = {
      mediaGroupId,
      messageId: ctx.message.message_id,
      text: text,
      photoIds: [bestPhoto.file_id],
      parsed: null,
    };
    group.timer = setTimeout(() => processMediaGroup(ctx, mediaGroupId), 3000);
    pendingGroups.set(mediaGroupId, group);
  }
});

bot.on(message("text"), async (ctx) => {
  if (ctx.message.text.startsWith("/")) return;
  const mediaGroupId = \	ext_\\;
  const group: PendingProduct = {
    mediaGroupId,
    messageId: ctx.message.message_id,
    text: ctx.message.text,
    photoIds: [],
    parsed: null,
  };
  pendingGroups.set(mediaGroupId, group);
  await processMediaGroup(ctx, mediaGroupId);
});

async function processMediaGroup(ctx: Context, mediaGroupId: string) {
  const group = pendingGroups.get(mediaGroupId);
  if (!group) return;
  pendingGroups.delete(mediaGroupId);
  
  if (!group.text.trim()) {
    await ctx.reply("❌ Xatolik: Matn yo'q.");
    return;
  }

  const statusMsg = await ctx.reply("🔄 Analiz qilinmoqda...");

  try {
    const parsed = await parseProductText(group.text);
    if (!parsed || !parsed.name) {
      await ctx.telegram.editMessageText(ctx.chat?.id, statusMsg.message_id, undefined, "❌ AI matnni tushunmadi.");
      return;
    }

    // Check duplicate in Supabase
    const { data: dup } = await supabase.from('products').select('id').eq('name', parsed.name).limit(1).single();
    if (dup) {
      await ctx.telegram.editMessageText(ctx.chat?.id, statusMsg.message_id, undefined, \⚠️ **Dublikat:** \ avval qo'shilgan, o'tkazib yuborildi.\, { parse_mode: "Markdown" });
      return;
    }

    await ctx.telegram.editMessageText(ctx.chat?.id, statusMsg.message_id, undefined, \⏳ Rasmlar yuklanmoqda... (\)\, { parse_mode: "Markdown" });

    const uploadedUrls: string[] = [];
    for (let i = 0; i < group.photoIds.length; i++) {
      const fileLink = await ctx.telegram.getFileLink(group.photoIds[i]);
      const filename = \\_\.jpg\;
      const publicUrl = await uploadImageToSupabase(fileLink.toString(), filename);
      if (publicUrl) uploadedUrls.push(publicUrl);
    }

    // Auto assign category (Erkaklar = c1, Ayollar = c2)
    let catId = "c1"; 
    const lowerText = group.text.toLowerCase();
    if (lowerText.includes("ayollar") || lowerText.includes("zhenskiy")) catId = "c2";

    // Extract brand from name
    let finalBrand = null;
    const knownBrands = ["Rolex", "Casio", "Tissot", "Seiko", "Orient", "Hublot", "Patek Philippe", "Rado", "Longines", "Omega", "Cartier"];
    for (const b of knownBrands) {
      if (lowerText.includes(b.toLowerCase())) {
        finalBrand = b;
        break;
      }
    }

    const productId = await insertProduct(
      parsed.name,
      parsed.description,
      parsed.price || 0,
      parsed.characteristics,
      uploadedUrls,
      group.messageId.toString(),
      catId,
      finalBrand
    );

    await ctx.telegram.editMessageText(ctx.chat?.id, statusMsg.message_id, undefined, \✅ **Qo'shildi:** \\, { parse_mode: "Markdown" });

  } catch (err: any) {
    console.error(err);
    await ctx.telegram.editMessageText(ctx.chat?.id, statusMsg.message_id, undefined, "❌ Xatolik yuz berdi.");
  }
}
