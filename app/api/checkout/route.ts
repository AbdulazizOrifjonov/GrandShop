import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const admin1 = process.env.TELEGRAM_ADMIN_ID;
    const admin2 = "615329280";

    if (!token) return NextResponse.json({ success: false });

    const formatPrice = (p: number) => p.toLocaleString("en-US");

    const text = `🛍 **YANGI BUYURTMA!**\n\n` +
      `👤 **Mijoz:** ${data.fullName}\n` +
      `📞 **Telefon:** ${data.phone}\n` +
      `📍 **Manzil:** ${data.address}\n` +
      `${data.note ? `📝 **Izoh:** ${data.note}\n` : ""}` +
      `${data.promoCode ? `🎟 **Promokod:** \`${data.promoCode}\` (-${formatPrice(data.discount || 0)} UZS)\n` : ""}\n` +
      `📦 **Mahsulotlar:**\n` +
      data.items.map((i: any) => `- ${i.name} (${i.quantity} dona) - ${formatPrice(i.price)} UZS`).join("\n") +
      `\n\n💵 **Jami summa:** ${formatPrice(data.total)} UZS\n` +
      `🚚 **Yetkazish:** ${data.deliveryFee ? formatPrice(data.deliveryFee) + " UZS" : "Bepul"}`;

    const admins = [admin1, admin2].filter(Boolean);
    
    for (const admin of admins) {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: admin,
          text: text,
          parse_mode: "Markdown"
        })
      }).catch(e => console.error(e));
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

