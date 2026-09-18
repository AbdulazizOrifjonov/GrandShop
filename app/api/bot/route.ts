import { Telegraf, Context } from "telegraf";
import { message } from "telegraf/filters";
import { parseProductText, ParsedProduct } from "../../../telegram-bot/aiParser";
import { insertProduct, uploadImageToSupabase, createNewCategory } from "../../../telegram-bot/supabaseClient";

const token = process.env.TELEGRAM_BOT_TOKEN;
const adminId = process.env.TELEGRAM_ADMIN_ID;

const bot = new Telegraf(token || "");

interface PendingProduct {
  mediaGroupId: string;
  messageId: number;
  text: string;
  photoIds: string[];
  parsed: ParsedProduct | null;
  timer?: any;
}

// Global cache for warm lambda reuse
declare global {
  var pendingGroups: Map<string, PendingProduct>;
  var approvedProducts: Map<number, PendingProduct>;
  var awaitingInput: Map<number, { type: string, categoryId?: string, messageId: number }>;
}

if (!global.pendingGroups) global.pendingGroups = new Map();
if (!global.approvedProducts) global.approvedProducts = new Map();
if (!global.awaitingInput) global.awaitingInput = new Map();

bot.use(async (ctx, next) => {
  if (ctx.from) {
    const allowedAdmins = [adminId, "615329280"];
    if (!allowedAdmins.includes(ctx.from.id.toString())) {
      if (ctx.message) {
        await ctx.reply(`Access denied. Faqat ruxsat etilgan adminlar ushbu botdan foydalanishi mumkin.`);
      }
      return;
    }
  }
  return next();
});

bot.start((ctx) => ctx.reply("Salom! Menga mahsulot postini yuboring (rasmlar va matn bilan)."));

bot.on(message("photo"), async (ctx) => {
  const mediaGroupId = ctx.message.media_group_id || `single_${ctx.message.message_id}`;
  const photos = ctx.message.photo;
  const bestPhoto = photos[photos.length - 1];
  const text = ctx.message.caption || "";

  if (global.pendingGroups.has(mediaGroupId)) {
    const group = global.pendingGroups.get(mediaGroupId)!;
    group.photoIds.push(bestPhoto.file_id);
    if (text && !group.text) group.text = text;
    clearTimeout(group.timer);
    group.timer = setTimeout(() => processMediaGroup(ctx, mediaGroupId), 2000);
  } else {
    const group: PendingProduct = {
      mediaGroupId,
      messageId: ctx.message.message_id,
      text: text,
      photoIds: [bestPhoto.file_id],
      parsed: null,
    };
    global.pendingGroups.set(mediaGroupId, group);
    group.timer = setTimeout(() => processMediaGroup(ctx, mediaGroupId), 2000);
  }
});

bot.on(message("text"), async (ctx) => {
  if (global.awaitingInput.has(ctx.from.id)) {
    const state = global.awaitingInput.get(ctx.from.id)!;
    global.awaitingInput.delete(ctx.from.id);
    
    if (state.type === 'category') {
      const catId = await createNewCategory(ctx.message.text);
      await ctx.reply(`✅ Yangi kategoriya yaratildi.`);
      await ctx.reply("👇 **Qaysi brendga tegishli?**", {
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: getBrandKeyboard(catId, state.messageId.toString()) }
      });
      return;
    }
  }
  
  const mediaGroupId = `text_${ctx.message.message_id}`;
  const group: PendingProduct = {
    mediaGroupId,
    messageId: ctx.message.message_id,
    text: ctx.message.text,
    photoIds: [],
    parsed: null,
  };
  
  global.pendingGroups.set(mediaGroupId, group);
  await processMediaGroup(ctx, mediaGroupId);
});

async function processMediaGroup(ctx: Context, mediaGroupId: string) {
  const group = global.pendingGroups.get(mediaGroupId);
  if (!group) return;
  global.pendingGroups.delete(mediaGroupId);
  
  if (!group.text.trim()) {
    await ctx.reply("❌ Xatolik: Mahsulot matni topilmadi.");
    return;
  }

  const statusMsg = await ctx.reply("🔄 Mahsulot tahlil qilinmoqda (AI)...");
  try {
    const parsed = await parseProductText(group.text);
    if (!parsed) throw new Error("AI parser failed");
    group.parsed = parsed;

    const preview = `📦 **Product:** ${parsed.name || "Noma'lum"}\n💰 **Price:** ${parsed.price ? parsed.price : "Topilmadi"}\n\n🖼 **Images:** ${group.photoIds.length}`;
    await ctx.replyWithMarkdown(preview + "\n\n👇 **Qaysi kategoriyaga qo'shilsin?**", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Erkaklar uchun", callback_data: `cat_c1_${group.messageId}` }, { text: "Ayollar uchun", callback_data: `cat_c2_${group.messageId}` }],
          [{ text: "❌ Bekor qilish", callback_data: `cancel_${group.messageId}` }]
        ]
      }
    });

    global.approvedProducts.set(group.messageId, group);
    await ctx.telegram.deleteMessage(ctx.chat?.id!, statusMsg.message_id).catch(() => {});
  } catch (err) {
    await ctx.telegram.editMessageText(ctx.chat?.id, statusMsg.message_id, undefined, "❌ Xatolik yuz berdi.");
  }
}

function getBrandKeyboard(categoryId: string, messageId: string) {
  return [
    [{ text: "Rolex", callback_data: `brand_Rolex_${categoryId}_${messageId}` }, { text: "Casio", callback_data: `brand_Casio_${categoryId}_${messageId}` }],
    [{ text: "Boshqa / Noma'lum", callback_data: `brand_Boshqa_${categoryId}_${messageId}` }, { text: "❌ Bekor qilish", callback_data: `cancel_${messageId}` }]
  ];
}

bot.on("callback_query", async (ctx) => {
  const data = (ctx.callbackQuery as any).data;
  if (!data) return;

  const parts = data.split("_");
  const origMsgIdStr = parts[parts.length - 1];
  const origMsgId = parseInt(origMsgIdStr, 10);
  
  if (!origMsgId || !global.approvedProducts.has(origMsgId)) {
    await ctx.answerCbQuery("Eski yoki topilmagan so'rov.");
    return;
  }

  const group = global.approvedProducts.get(origMsgId)!;

  if (data.startsWith("cancel_")) {
    global.approvedProducts.delete(origMsgId);
    await ctx.editMessageText("❌ Bekor qilindi.").catch(() => {});
    return;
  }

  if (data?.startsWith("cat_")) {
    const categoryId = data.split("_")[1];
    await ctx.editMessageText("👇 **Qaysi brendga tegishli?**", {
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: getBrandKeyboard(categoryId, origMsgIdStr) }
    });
    return;
  }
  
  if (data?.startsWith("brand_")) {
    const brandStr = parts[1];
    const categoryId = parts[2];
    await ctx.editMessageText(`✅ Qo'shishni tasdiqlaysizmi?`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "✅ Tasdiqlash va Qo'shish", callback_data: `create_${categoryId}_${brandStr}_${origMsgIdStr}` }],
          [{ text: "❌ Bekor qilish", callback_data: `cancel_${origMsgIdStr}` }]
        ]
      }
    });
    return;
  }

  if (data?.startsWith("create_")) {
    const categoryId = parts[1];
    const brandStr = parts[2];
    const finalBrand = brandStr === "Boshqa" ? null : brandStr;
    
    await ctx.editMessageText("🔄 Bazaga qo'shilmoqda... Rasmlar yuklanyapti.");

    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < group.photoIds.length; i++) {
        const fileLink = await ctx.telegram.getFileLink(group.photoIds[i]);
        const filename = `${Date.now()}_${i}.jpg`;
        const publicUrl = await uploadImageToSupabase(fileLink.toString(), filename);
        if (publicUrl) uploadedUrls.push(publicUrl);
      }

      if (!group.parsed) throw new Error("Parsed data missing");
      
      const productId = await insertProduct(
        group.parsed.name || "Nomsiz Mahsulot",
        group.parsed.description,
        group.parsed.price || 0,
        group.parsed.characteristics,
        uploadedUrls,
        group.messageId.toString(),
        categoryId,
        finalBrand
      );

      await ctx.editMessageText(`✅ **Muvaffaqiyatli!** Mahsulot do'konga qo'shildi.\nID: ${productId}`, { parse_mode: "Markdown" });
      global.approvedProducts.delete(origMsgId);
    } catch (err: any) {
      await ctx.editMessageText(`❌ Xatolik yuz berdi: ${err.message}`);
    }
  }
});

export async function POST(req: Request) {
  if (!token) return new Response("No token", { status: 500 });
  const body = await req.json();
  await bot.handleUpdate(body);
  return new Response("OK");
}
