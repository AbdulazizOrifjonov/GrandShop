import { Telegraf, Context } from "telegraf";
import { message } from "telegraf/filters";
import dotenv from "dotenv";
import { parseProductText, ParsedProduct } from "./aiParser";
import { insertProduct, uploadImageToSupabase, createNewCategory } from "./supabaseClient";

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const adminId = process.env.TELEGRAM_ADMIN_ID;

if (!token) {
  console.error("TELEGRAM_BOT_TOKEN is missing in .env");
  process.exit(1);
}

const bot = new Telegraf(token);

// Store pending media groups and parsed products waiting for approval
interface PendingProduct {
  mediaGroupId: string;
  messageId: number;
  text: string;
  photoIds: string[];
  parsed: ParsedProduct | null;
  timer?: NodeJS.Timeout;
}

const pendingGroups = new Map<string, PendingProduct>();
const approvedProducts = new Map<number, PendingProduct>(); // Keyed by approval message ID

// Middleware to check admin
bot.use(async (ctx, next) => {
  if (ctx.from) {
    const allowedAdmins = [adminId, "615329280"];
    
    if (!adminId) {
      console.log(`\n\n!!! DIQQAT !!!\nSizning Telegram ID raqamingiz: ${ctx.from.id}\nBuni .env dagi TELEGRAM_ADMIN_ID ga yozib qo'ying!\n\n`);
    } else if (!allowedAdmins.includes(ctx.from.id.toString())) {
      if (ctx.message) {
        await ctx.reply(`Access denied. Faqat ruxsat etilgan adminlar ushbu botdan foydalanishi mumkin.\nSizning ID: ${ctx.from.id}`);
      }
      return;
    }
  }
  return next();
});

bot.start((ctx) => ctx.reply("Salom! Menga mahsulot postini yuboring (rasmlar va matn bilan). Men uni do'konga qo'shishga tayyorlayman."));
bot.help((ctx) => ctx.reply("Mahsulot rasmlari va ma'lumotlarini bitta qilib forward qiling yoki yuboring."));
bot.command("cancel", (ctx) => {
  pendingGroups.clear();
  approvedProducts.clear();
  ctx.reply("Barcha kutilayotgan amaliyotlar bekor qilindi.");
});

// Handle photo messages (including media groups)
bot.on(message("photo"), async (ctx) => {
  const mediaGroupId = ctx.message.media_group_id || `single_${ctx.message.message_id}`;
  
  // Get the highest resolution photo
  const photos = ctx.message.photo;
  const bestPhoto = photos[photos.length - 1];
  
  const text = ctx.message.caption || "";

  if (pendingGroups.has(mediaGroupId)) {
    const group = pendingGroups.get(mediaGroupId)!;
    group.photoIds.push(bestPhoto.file_id);
    if (text && !group.text) group.text = text;
    
    // Reset timer
    clearTimeout(group.timer);
    group.timer = setTimeout(() => processMediaGroup(ctx, mediaGroupId), 2500);
  } else {
    // New group
    const group: PendingProduct = {
      mediaGroupId,
      messageId: ctx.message.message_id,
      text: text,
      photoIds: [bestPhoto.file_id],
      parsed: null,
    };
    
    group.timer = setTimeout(() => processMediaGroup(ctx, mediaGroupId), 2500);
    pendingGroups.set(mediaGroupId, group);
  }
});

const awaitingInput = new Map<number, { type: 'category', messageId: number } | { type: 'brand', categoryId: string, messageId: number }>();

// Handle text-only messages (or inputs for category/brand)
bot.on(message("text"), async (ctx) => {
  if (ctx.message.text.startsWith("/")) return; // Ignore commands

  const userId = ctx.from.id;
  const inputState = awaitingInput.get(userId);

  if (inputState) {
    // We are waiting for a category or brand name
    const text = ctx.message.text.trim();
    awaitingInput.delete(userId); // Clear state

    if (inputState.type === 'category') {
      // The admin typed a new category name
      // We need to create it and move to brand selection
      // Save it to database/file
      const newCatId = await createNewCategory(text);
      
      await ctx.reply(`✅ Yangi kategoriya yaratildi: ${text}\nEndi, bu mahsulot qaysi brendga tegishli?`, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: getBrandKeyboard(newCatId, inputState.messageId.toString())
        }
      });
      return;
    } else if (inputState.type === 'brand') {
      // The admin typed a new brand name
      const brandStr = text.replace(/_/g, " ").substring(0, 30);
      const categoryId = inputState.categoryId;
      const messageIdStr = inputState.messageId.toString();

      await ctx.reply(`✅ **Kategoriya:** ${categoryId}\n✅ **Yangi Brend:** ${brandStr}\n\nQo'shishni tasdiqlaysizmi?`, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              { text: "✅ Tasdiqlash va Qo'shish", callback_data: `create_${categoryId}_${brandStr}_${messageIdStr}` },
              { text: "❌ Bekor qilish", callback_data: `cancel_${messageIdStr}` }
            ]
          ]
        }
      });
      return;
    }
  }
  
  // Normal product post without images
  const mediaGroupId = `text_${ctx.message.message_id}`;
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
  
  // Remove from pending
  pendingGroups.delete(mediaGroupId);
  
  if (!group.text.trim()) {
    await ctx.reply("❌ Xatolik: Mahsulot matni (caption) topilmadi.");
    return;
  }

  const statusMsg = await ctx.reply("🔄 Mahsulot tahlil qilinmoqda (AI)...");

  try {
    const parsed = await parseProductText(group.text);
    if (!parsed) {
      await ctx.telegram.editMessageText(ctx.chat?.id, statusMsg.message_id, undefined, "❌ AI matnni tahlil qila olmadi.");
      return;
    }

    group.parsed = parsed;

    const preview = `📦 **Product:** ${parsed.name || "Noma'lum"}
💰 **Price:** ${parsed.price ? (parsed.price < 100000 ? "$" + parsed.price.toLocaleString("en-US") : parsed.price.toLocaleString("en-US") + " UZS") : "Topilmadi (Kiritish kerak)"}

📋 **Characteristics:**
${parsed.characteristics.length > 0 ? parsed.characteristics.map(c => `- ${c}`).join("\n") : "Topilmadi"}

🖼 **Images:** ${group.photoIds.length}`;

    const previewMsg = await ctx.replyWithMarkdown(preview + "\n\n👇 **Qaysi kategoriyaga qo'shilsin?**", {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "Erkaklar uchun", callback_data: `cat_c1_${group.messageId}` },
            { text: "Ayollar uchun", callback_data: `cat_c2_${group.messageId}` }
          ],
          [
            { text: "Bolalar (Premium)", callback_data: `cat_c3_${group.messageId}` },
            { text: "Aksessuarlar", callback_data: `cat_c7_${group.messageId}` }
          ],
          [
            { text: "Smart soatlar", callback_data: `cat_c5_${group.messageId}` },
            { text: "➕ Yangi qo'shish", callback_data: `addcat_${group.messageId}` }
          ],
          [
            { text: "❌ Bekor qilish", callback_data: `cancel_${group.messageId}` }
          ]
        ]
      }
    });

    // Save to approved pool keyed by the original messageId so callback query can find it across new messages
    approvedProducts.set(group.messageId, group);
    
    // Delete the "analyzing" message
    await ctx.telegram.deleteMessage(ctx.chat?.id!, statusMsg.message_id).catch(() => {});

  } catch (err) {
    console.error(err);
    await ctx.telegram.editMessageText(ctx.chat?.id, statusMsg.message_id, undefined, "❌ Xatolik yuz berdi.");
  }
}

function getBrandKeyboard(categoryId: string, messageId: string) {
  return [
    [
      { text: "Rolex", callback_data: `brand_Rolex_${categoryId}_${messageId}` },
      { text: "Casio", callback_data: `brand_Casio_${categoryId}_${messageId}` },
      { text: "Tissot", callback_data: `brand_Tissot_${categoryId}_${messageId}` }
    ],
    [
      { text: "Seiko", callback_data: `brand_Seiko_${categoryId}_${messageId}` },
      { text: "Orient", callback_data: `brand_Orient_${categoryId}_${messageId}` },
      { text: "Hublot", callback_data: `brand_Hublot_${categoryId}_${messageId}` }
    ],
    [
      { text: "Boshqa / Noma'lum", callback_data: `brand_Boshqa_${categoryId}_${messageId}` },
      { text: "➕ Yangi qo'shish", callback_data: `addbrand_${categoryId}_${messageId}` }
    ],
    [
      { text: "❌ Bekor qilish", callback_data: `cancel_${messageId}` }
    ]
  ];
}

// Handle callback queries
bot.on("callback_query", async (ctx) => {
  // @ts-ignore - telegraf types for callback_query data are tricky
  const data = ctx.callbackQuery.data;
  
  if (!data) return;

  const parts = data.split("_");
  const origMsgIdStr = parts[parts.length - 1];
  const origMsgId = parseInt(origMsgIdStr, 10);
  
  if (!origMsgId || !approvedProducts.has(origMsgId)) {
    await ctx.answerCbQuery("Eski yoki topilmagan so'rov.");
    return;
  }

  const group = approvedProducts.get(origMsgId)!;

  if (data.startsWith("cancel_")) {
    approvedProducts.delete(origMsgId);
    await ctx.editMessageText("❌ Bekor qilindi.").catch(() => {});
    await ctx.answerCbQuery();
    return;
  }

  if (data?.startsWith("cat_")) {
    const categoryId = data.split("_")[1]; // e.g., "c1"
    
    await ctx.editMessageText("👇 **Qaysi brendga tegishli?**", {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: getBrandKeyboard(categoryId, origMsgIdStr)
      }
    });
    await ctx.answerCbQuery();
    return;
  }
  
  if (data?.startsWith("addcat_")) {
    awaitingInput.set(ctx.from.id, { type: 'category', messageId: origMsgId });
    await ctx.editMessageText("✏️ Yangi kategoriya nomini yozib yuboring:\n(Masalan: Erkaklar soatlari)");
    await ctx.answerCbQuery();
    return;
  }

  if (data?.startsWith("addbrand_")) {
    const categoryId = data.split("_")[1];
    awaitingInput.set(ctx.from.id, { type: 'brand', categoryId, messageId: origMsgId });
    await ctx.editMessageText("✏️ Yangi brend nomini yozib yuboring:\n(Masalan: Patek Philippe)");
    await ctx.answerCbQuery();
    return;
  }

  if (data?.startsWith("brand_")) {
    // data format: brand_Rolex_c1_12345
    const parts = data.split("_");
    const brandStr = parts[1];
    const categoryId = parts[2];
    
    await ctx.editMessageText(`✅ **Kategoriya:** ${categoryId}\n✅ **Brend:** ${brandStr}\n\nQo'shishni tasdiqlaysizmi?`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "✅ Tasdiqlash va Qo'shish", callback_data: `create_${categoryId}_${brandStr}_${origMsgIdStr}` },
            { text: "❌ Bekor qilish", callback_data: `cancel_${origMsgIdStr}` }
          ]
        ]
      }
    });
    await ctx.answerCbQuery();
    return;
  }

  if (data?.startsWith("create_")) {
    const parts = data.split("_");
    const categoryId = parts[1];
    const brandStr = parts[2];
    const finalBrand = brandStr === "Boshqa" ? null : brandStr;
    
    await ctx.answerCbQuery("Yaratilmoqda, kuting...");
    await ctx.editMessageText("🔄 Bazaga qo'shilmoqda... Rasmlar yuklanyapti.");

    try {
      // 1. Download and Upload Images
      const uploadedUrls: string[] = [];
      for (let i = 0; i < group.photoIds.length; i++) {
        const fileId = group.photoIds[i];
        const fileLink = await ctx.telegram.getFileLink(fileId);
        
        // Generate a filename
        const filename = `${Date.now()}_${i}.jpg`;
        const publicUrl = await uploadImageToSupabase(fileLink.toString(), filename);
        
        if (publicUrl) {
          uploadedUrls.push(publicUrl);
        }
      }

      // 2. Create in Database
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
      approvedProducts.delete(origMsgId);

    } catch (err: any) {
      console.error(err);
      await ctx.editMessageText(`❌ Xatolik yuz berdi: ${err.message}`);
    }
  }
});

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

bot.launch().then(() => {
  console.log("Telegram Bot is running!");
});
