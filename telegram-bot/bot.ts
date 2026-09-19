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
  const mediaGroupId = ctx.message.media_group_id || `single_${ctx.message.message_id}`;
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

async function processMediaGroup(ctx: Context, mediaGroupId: string) {
  const group = pendingGroups.get(mediaGroupId);
  if (!group) return;
  pendingGroups.delete(mediaGroupId);
  
  if (!group.text.trim() || group.photoIds.length === 0) {
    await ctx.reply("❌ Xatolik: Matn yoki rasm yetishmayapti. O'tkazib yuborildi.");
    return;
  }

    let statusMsg;
  try {
    statusMsg = await ctx.reply("🔄 Analiz qilinmoqda...");
  } catch (e) {
    console.log("Failed to send statusMsg, probably rate limited. Proceeding anyway...");
  }

  try {
    const parsed = await parseProductText(group.text);
    if (!parsed || !parsed.name) {
      if (statusMsg) await ctx.telegram.editMessageText(ctx.chat?.id, statusMsg.message_id, undefined, "❌ AI matnni tushunmadi.");
      return;
    }

    // Check duplicate in Supabase
    const { data: dup } = await supabase.from('products').select('id').eq('name', parsed.name).limit(1).single();
    if (dup) {
      if (statusMsg) await ctx.telegram.editMessageText(ctx.chat?.id, statusMsg.message_id, undefined, `⚠️ **Dublikat:** ${parsed.name} avval qo'shilgan, o'tkazib yuborildi.`, { parse_mode: "Markdown" });
      return;
    }

    if (statusMsg) await ctx.telegram.editMessageText(ctx.chat?.id, statusMsg.message_id, undefined, `⏳ Rasmlar yuklanmoqda... (${parsed.name})`, { parse_mode: "Markdown" });

    const uploadedUrls: string[] = [];
    for (let i = 0; i < group.photoIds.length; i++) {
      const fileLink = await ctx.telegram.getFileLink(group.photoIds[i]);
      const filename = `${Date.now()}_${i}.jpg`;
      const publicUrl = await uploadImageToSupabase(fileLink.toString(), filename);
      if (publicUrl) uploadedUrls.push(publicUrl);
    }

    // Auto assign category (c1: Erkaklar, c2: Ayollar, c3: Bolalar, c5: Smart, c7: Aksessuarlar)
    let catId = "c1"; 
    const lowerText = (parsed.name + " " + group.text).toLowerCase();
    
    if (lowerText.includes("smart") || lowerText.includes("смарт") || lowerText.includes("apple watch") || lowerText.includes("elektron")) {
      catId = "c5";
    } else if (lowerText.includes("bolalar") || lowerText.includes("detckiy") || lowerText.includes("detskiy") || lowerText.includes("детск")) {
      catId = "c3";
    } else if (lowerText.includes("ayollar") || lowerText.includes("zhenskiy") || lowerText.includes("женск") || lowerText.includes("lady") || lowerText.includes("damas")) {
      catId = "c2";
    } else if (lowerText.includes("kamar") || lowerText.includes("remeshok") || lowerText.includes("aksessuar") || lowerText.includes("braslet")) {
      catId = "c7";
    }

    // Extract brand from name and text
    let finalBrand: string | null = null;
    const knownBrands = [
      "Rolex", "Casio", "Tissot", "Seiko", "Orient", "Hublot", "Patek Philippe", 
      "Rado", "Longines", "Omega", "Cartier", "Audemars Piguet", "Breitling", 
      "Tag Heuer", "Citizen", "Curren", "Naviforce", "Skmei", "Fossil", 
      "Michael Kors", "Richard Mille", "Vacheron Constantin", "IWC", "Panerai", 
      "Chopard", "Franck Muller", "Diesel", "Emporio Armani", "Armani", 
      "Versace", "Gucci", "Calvin Klein", "Guess", "Bvlgari", "Bulgari",
      "Patek", "Maurice Lacroix", "Ulysse Nardin", "Montblanc", "Zenith"
    ];
    for (const b of knownBrands) {
      if (lowerText.includes(b.toLowerCase())) {
        finalBrand = b;
        break;
      }
    }

    // Ensure price is valid and not 0
    let finalPrice = parsed.price;
    if (!finalPrice || finalPrice <= 0) {
      const anyNum = group.text.match(/\b(\d{2,8})\b/);
      if (anyNum) finalPrice = parseInt(anyNum[1], 10);
      else finalPrice = 100; // safe non-zero fallback
    }

    const productId = await insertProduct(
      parsed.name,
      parsed.description,
      finalPrice,
      parsed.characteristics,
      uploadedUrls,
      group.messageId.toString(),
      catId,
      finalBrand
    );

    const formattedPrice = finalPrice < 100000 ? "$" + finalPrice.toLocaleString("ru-RU") : finalPrice.toLocaleString("ru-RU") + " so'm";
    if (statusMsg) await ctx.telegram.editMessageText(ctx.chat?.id, statusMsg.message_id, undefined, `✅ **Qo'shildi:** ${parsed.name}\n💰 **Narx:** ${formattedPrice}\n🏷 **Brend:** ${finalBrand || "Mavjud emas"}`, { parse_mode: "Markdown" });

  } catch (err: any) {
    console.error(err);
    if (statusMsg) await ctx.telegram.editMessageText(ctx.chat?.id, statusMsg.message_id, undefined, "❌ Xatolik yuz berdi.");
  }
}

