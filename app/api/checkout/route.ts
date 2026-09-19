import { NextResponse } from "next/server";

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

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const channelId = process.env.TELEGRAM_CHANNEL_ID || "-1004325588064";
    const admin1 = process.env.TELEGRAM_ADMIN_ID;
    const admin2 = "615329280";

    if (!token) {
      console.warn("TELEGRAM_BOT_TOKEN not configured.");
      return NextResponse.json({ success: false, message: "Token not found" });
    }

    const origin =
      req.headers.get("origin") ||
      req.headers.get("referer") ||
      "https://grand-watch-shop.vercel.app";

    function getAbsoluteImageUrl(img: string | null | undefined): string | null {
      if (!img) return null;
      const trimmed = img.trim();
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        return trimmed;
      }
      const cleanOrigin = origin.replace(/\/$/, "");
      const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
      return `${cleanOrigin}${cleanPath}`;
    }

    // Har bir mahsulot qatori: nomi, soni, narxi, summasi
    const items = data.items || [];
    const orderLines = items
      .map((item: any, idx: number) => {
        const qty = Number(item.quantity) || 1;
        const price = Number(item.price) || 0;
        const itemTotal = price * qty;
        return (
          `<b>${idx + 1}. ${escapeHtml(item.name)}</b>\n` +
          `   ▫️ Soni: <b>${qty} dona</b>\n` +
          `   ▫️ Donasi: <b>${formatPrice(price)} so'm</b>\n` +
          `   ▫️ Summasi: <b>${formatPrice(itemTotal)} so'm</b>`
        );
      })
      .join("\n\n");

    const text =
      `🛍 <b>YANGI BUYURTMA!</b>\n\n` +
      `👤 <b>Mijoz:</b> ${escapeHtml(data.fullName)}\n` +
      `📞 <b>Telefon:</b> ${escapeHtml(data.phone)}\n` +
      `📍 <b>Manzil:</b> ${escapeHtml(data.address)}\n` +
      (data.note ? `📝 <b>Izoh:</b> ${escapeHtml(data.note)}\n` : "") +
      (data.promoCode
        ? `🎟 <b>Promokod:</b> <code>${escapeHtml(data.promoCode)}</code> (-${formatPrice(data.discount || 0)} so'm)\n`
        : "") +
      `\n📦 <b>Buyurtma qilingan mahsulotlar:</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `${orderLines}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      (data.subtotal ? `💰 <b>Oraliq summa:</b> ${formatPrice(data.subtotal)} so'm\n` : "") +
      (data.discount ? `🎟 <b>Chegirma:</b> -${formatPrice(data.discount)} so'm\n` : "") +
      `🚚 <b>Yetkazib berish:</b> ${data.deliveryFee ? formatPrice(data.deliveryFee) + " so'm" : "Bepul"}\n` +
      `💳 <b>JAMI TO'LOV:</b> <b>${formatPrice(data.total)} so'm</b>\n\n` +
      `🌐 <i>Grand Watch Shop | Veb-saytdan xarid</i>`;

    // Haqiqiy rasm havolalarini yig'ish
    const validImages: string[] = items
      .map((i: any) => getAbsoluteImageUrl(i.image))
      .filter((url: string | null): url is string => Boolean(url && url.startsWith("http")));

    // Barcha yuboriladigan manzillar: kanal va adminlar
    const recipients = Array.from(new Set([channelId, admin1, admin2].filter(Boolean)));

    async function sendToChat(chatId: string) {
      // 1. Agar bir nechta rasm bo'lsa (albom / sendMediaGroup)
      if (validImages.length > 1) {
        try {
          const media = validImages.slice(0, 10).map((url, index) => ({
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

    // Barcha qabul qiluvchilarga (kanal va adminlarga) yuborish
    await Promise.allSettled(recipients.map((chatId) => sendToChat(chatId as string)));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Checkout route error:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
