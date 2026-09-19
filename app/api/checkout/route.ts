import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function escapeHtml(str: string | number | undefined | null) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatPrice(p: number) {
  return Math.round(p || 0)
    .toLocaleString("en-US")
    .replace(/,/g, " ");
}

// Global navbat zanjiri: bir vaqtda bir nechta mijoz buyurtma berganda
// xabarlar va rasmlar Telegram'ga ketma-ket, bir-biriga aralashmasdan tushishini ta'minlaydi
let globalTelegramQueue: Promise<void> = Promise.resolve();

function enqueueTelegramTask(task: () => Promise<void>): Promise<void> {
  const next = globalTelegramQueue.then(async () => {
    try {
      await task();
      // Har bir buyurtma jo'natilgandan so'ng 250ms tanaffus (Telegram tartibi va API limiti uchun)
      await new Promise((r) => setTimeout(r, 250));
    } catch (e) {
      console.error("Telegram queue execution error:", e);
    }
  });
  globalTelegramQueue = next;
  return next;
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const token =
      process.env.TELEGRAM_BOT_TOKEN ||
      "8304513002:AAHuB-J12OGOK4iMiefk-P-EKDh2S-tkKk4";
    const channelId = process.env.TELEGRAM_CHANNEL_ID || "-1004325588064";
    const admin1 = process.env.TELEGRAM_ADMIN_ID || "1594150529";
    const admin2 = "615329280";

    const orderId =
      data.orderId ||
      (typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `o_${Date.now()}`);
    const orderNumber =
      data.orderNumber || `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    const items = data.items || [];

    // Har bir buyurtmaga unikal rangli nishon (badge)
    const BADGES = ["🟢", "🔵", "🟣", "🟠", "💎", "⭐", "🔶"];
    const badgeIndex = Math.abs(
      orderNumber.split("").reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0)
    ) % BADGES.length;
    const badge = BADGES[badgeIndex];

    // 1. Supabase-ga server-side buyurtmani saqlash (zaxira va kafolat)
    try {
      const itemsToSave = items.map((it: any) => ({
        id: it.id || it.product_id || "",
        product_id: it.id || it.product_id || "",
        name: it.name || it.product_name || "Mahsulot",
        product_name: it.name || it.product_name || "Mahsulot",
        price: Number(it.price || 0),
        quantity: Number(it.quantity || 1),
        image: it.image || it.product_image || null,
        product_image: it.image || it.product_image || null,
        user_id: data.userId || null,
        note: data.note || null,
      }));

      const { error: dbError } = await supabase.from("orders").upsert({
        id: orderId,
        order_number: orderNumber,
        customer_name: data.fullName || "Mijoz",
        phone: data.phone || "",
        address: data.address || "",
        total_amount: Number(data.total || 0),
        status: "new",
        items: itemsToSave,
        created_at: new Date().toISOString(),
      });

      if (dbError) {
        console.error("Supabase upsert error in checkout route:", dbError);
      }
    } catch (dbErr) {
      console.error("Supabase database exception in checkout route:", dbErr);
    }

    if (!token) {
      console.warn("TELEGRAM_BOT_TOKEN not configured.");
      return NextResponse.json({ success: false, message: "Token not found" });
    }

    let rawOrigin =
      req.headers.get("origin") ||
      req.headers.get("referer") ||
      "https://grand-watch-shop.vercel.app";

    try {
      const parsed = new URL(rawOrigin);
      if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
        rawOrigin = "https://grand-watch-shop.vercel.app";
      } else {
        rawOrigin = parsed.origin;
      }
    } catch {
      rawOrigin = "https://grand-watch-shop.vercel.app";
    }

    const cleanOrigin = rawOrigin.replace(/\/$/, "");

    function getAbsoluteImageUrl(img: string | null | undefined): string | null {
      if (!img) return null;
      const trimmed = img.trim();
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        return trimmed;
      }
      const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
      return `${cleanOrigin}${cleanPath}`;
    }

    // Har bir mahsulot qatori: nomi, soni, narxi, summasi va "Havola" linki
    const numEmojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
    const orderLines = items
      .map((item: any, idx: number) => {
        const qty = Number(item.quantity) || 1;
        const price = Number(item.price) || 0;
        const itemTotal = price * qty;

        let link = item.productUrl;
        if (!link && item.slug) {
          link = `${cleanOrigin}/products/${encodeURIComponent(item.slug)}`;
        } else if (!link && item.id) {
          link = `${cleanOrigin}/products/${encodeURIComponent(item.id)}`;
        }
        if (!link) {
          link = cleanOrigin;
        }

        const numLabel = numEmojis[idx] || `🔹 ${idx + 1}.`;

        return (
          `${numLabel} <b>${escapeHtml(item.name || item.product_name)}</b>\n` +
          `   ▫️ Xarid soni: <b>${qty} dona</b>\n` +
          `   ▫️ Donasi: <b>${formatPrice(price)} so'm</b>\n` +
          `   ▫️ Jami: <b>${formatPrice(itemTotal)} so'm</b>\n` +
          `   ▫️ Saytdagi sahifasi: <a href="${link}">🔗 Havola</a>`
        );
      })
      .join("\n\n");

    const text =
      `╔══════════════════════════════════╗\n` +
      `  ${badge} <b>YANGI BUYURTMA: #${escapeHtml(orderNumber)}</b>\n` +
      `╚══════════════════════════════════╝\n\n` +
      `👤 <b>Mijoz:</b> ${escapeHtml(data.fullName)}\n` +
      `📞 <b>Telefon:</b> ${escapeHtml(data.phone)}\n` +
      `📍 <b>Manzil:</b> ${escapeHtml(data.address)}\n` +
      (data.note ? `📝 <b>Izoh:</b> ${escapeHtml(data.note)}\n` : "") +
      (data.promoCode
        ? `🎟 <b>Promokod:</b> <code>${escapeHtml(data.promoCode)}</code> (-${formatPrice(data.discount || 0)} so'm)\n`
        : "") +
      `\n📦 <b>XARID QILINGAN MAHSULOTLAR (${items.length} xil):</b>\n` +
      `────────────────────────────────────\n` +
      `${orderLines}\n` +
      `────────────────────────────────────\n` +
      (data.subtotal ? `💰 <b>Oraliq summa:</b> ${formatPrice(data.subtotal)} so'm\n` : "") +
      (data.discount ? `🎟 <b>Chegirma:</b> -${formatPrice(data.discount)} so'm\n` : "") +
      `🚚 <b>Yetkazib berish:</b> ${data.deliveryFee ? formatPrice(data.deliveryFee) + " so'm" : "Bepul"}\n` +
      `💳 <b>JAMI TO'LOV:</b> <b>${formatPrice(data.total)} so'm</b>\n\n` +
      `════════════════════════════════════\n` +
      `🏁 ${badge} <b>#${escapeHtml(orderNumber)} — Buyurtma yakunlandi</b>\n` +
      `🌐 <i>Grand Watch Shop | Rasmiy veb-sayt</i>`;

    // Har bir mahsulotdan 1 tadan 3 tagacha rasm yig'ish (Telegram mediaGroup max: 10 ta rasm)
    const allImages: string[] = [];
    for (const item of items) {
      const itemImgs: string[] = [];
      if (Array.isArray(item.images) && item.images.length > 0) {
        for (const im of item.images) {
          const abs = getAbsoluteImageUrl(im);
          if (abs && !itemImgs.includes(abs)) itemImgs.push(abs);
        }
      }
      if (itemImgs.length === 0 && (item.image || item.product_image)) {
        const abs = getAbsoluteImageUrl(item.image || item.product_image);
        if (abs && !itemImgs.includes(abs)) itemImgs.push(abs);
      }
      // Har bir mahsulotdan 3 tagacha rasm:
      const top3 = itemImgs.slice(0, 3);
      for (const u of top3) {
        if (!allImages.includes(u)) {
          allImages.push(u);
        }
      }
    }

    const validImages = allImages.slice(0, 10);

    // Barcha yuboriladigan manzillar: kanal va adminlar
    const recipients = Array.from(new Set([channelId, admin1, admin2].filter(Boolean)));

    async function sendToChat(chatId: string) {
      // 1. Agar bir nechta rasm bo'lsa (albom / sendMediaGroup)
      if (validImages.length > 1) {
        try {
          const media = validImages.map((url, index) => ({
            type: "photo",
            media: url,
            ...(index === 0 && text.length <= 1024
              ? { caption: text, parse_mode: "HTML" }
              : {}),
          }));

          const res = await fetch(`https://api.telegram.org/bot${token}/sendMediaGroup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              media,
            }),
          });
          const resJson = await res.json();
          if (resJson.ok) {
            if (text.length > 1024) {
              await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  chat_id: chatId,
                  text,
                  parse_mode: "HTML",
                }),
              });
            }
            return true;
          } else {
            console.warn(`sendMediaGroup failed for ${chatId}:`, resJson.description);
          }
        } catch (e) {
          console.error(`sendMediaGroup error for ${chatId}:`, e);
        }
      }

      // 2. Agar 1 ta rasm bo'lsa (yoki mediaGroup o'xshamasa) -> sendPhoto
      if (validImages.length >= 1) {
        try {
          const photoRes = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              photo: validImages[0],
              caption: text.length <= 1024 ? text : text.slice(0, 1020) + "...",
              parse_mode: "HTML",
            }),
          });
          const photoJson = await photoRes.json();
          if (photoJson.ok) {
            if (text.length > 1024) {
              await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  chat_id: chatId,
                  text,
                  parse_mode: "HTML",
                }),
              });
            }
            return true;
          } else {
            console.warn(`sendPhoto failed for ${chatId}:`, photoJson.description);
          }
        } catch (e) {
          console.error(`sendPhoto error for ${chatId}:`, e);
        }
      }

      // 3. Rasm bo'lmasa yoki rasm yuklash muvaffaqiyatsiz bo'lsa -> sendMessage
      try {
        const msgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: "HTML",
          }),
        });
        const msgJson = await msgRes.json();
        return msgJson.ok;
      } catch (e) {
        console.error(`sendMessage error for ${chatId}:`, e);
        return false;
      }
    }

    // Navbat orqali ketma-ket yuborish: buyurtmalar aralashib ketmasligi kafolatlanadi
    await enqueueTelegramTask(async () => {
      await Promise.allSettled(recipients.map((chatId) => sendToChat(chatId as string)));
    });

    return NextResponse.json({ success: true, orderId, orderNumber });
  } catch (err) {
    console.error("Checkout route error:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
