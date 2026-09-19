import Link from "next/link";
import { MapPin, Mail, Phone, Send, Globe } from "lucide-react";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="bg-navy-900 text-white">
      <div className="container-shop grid grid-cols-1 gap-10 py-14 md:grid-cols-5">
        <div className="md:col-span-1">
          <Logo dark />
        </div>

        <div>
          <h4 className="mb-4 font-semibold">Kategoriyalar</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link href="/categories/erkaklar-uchun">Erkaklar uchun</Link></li>
            <li><Link href="/categories/ayollar-uchun">Ayollar uchun</Link></li>
            <li><Link href="/categories/premium">Premium</Link></li>
            <li><Link href="/categories/sport">Sport</Link></li>
            <li><Link href="/categories/smart-soatlar">Smart soatlar</Link></li>
            <li><Link href="/categories/vintage">Vintage</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-semibold">Foydali havolalar</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link href="/">Bosh sahifa</Link></li>
            <li><Link href="/products?sale=1">Aksiya mahsulotlar</Link></li>
            <li><Link href="/about">Biz haqimizda</Link></li>
            <li><Link href="/delivery">Yetkazib berish</Link></li>
            <li><Link href="/returns">Qaytarish</Link></li>
            <li><Link href="/privacy">Maxfiylik siyosati</Link></li>
            <li><Link href="/contact">Aloqa</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-semibold">Aloqa</h4>
          <ul className="space-y-3 text-sm text-white/70">
            <li className="flex items-center gap-2"><Phone size={15} /> +998 90 123 45 67</li>
            <li className="flex items-center gap-2"><Mail size={15} /> info@grandwatch.uz</li>
            <li className="flex items-center gap-2"><MapPin size={15} /> Toshkent, O'zbekiston</li>
            <li>
              <a
                href="https://t.me/+tX9dQIISDYFlYWVi"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sky-400 hover:text-sky-300 transition font-medium"
              >
                <Send size={15} /> Rasmiy Telegram Kanal
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-semibold">Bizni kuzatib boring</h4>
          <div className="flex gap-3">
            <a
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2AABEE] text-white hover:bg-[#2298D6] transition shadow-xs"
              href="https://t.me/+tX9dQIISDYFlYWVi"
              target="_blank"
              rel="noreferrer"
              aria-label="Telegram Kanal"
            >
              <Send size={15} />
            </a>
            <a className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition" href="#" aria-label="Instagram">
              <Globe size={15} />
            </a>
            <a className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition" href="#" aria-label="YouTube">
              <Globe size={15} />
            </a>
          </div>
          <a
            href="https://t.me/+tX9dQIISDYFlYWVi"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/15 px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#2AABEE] hover:border-[#2AABEE] transition"
          >
            <Send size={13} className="text-sky-400" />
            <span>Kanalga a'zo bo'lish</span>
          </a>
          <p className="mt-4 font-serif text-sm italic text-white/60">
            &ldquo;Vaqt — bu eng qimmatli boylik.&rdquo;
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-shop flex flex-col items-center justify-between gap-3 py-5 text-xs text-white/60 md:flex-row">
          <p>© 2025 Grand Watch Shop. Barcha huquqlar himoyalangan.</p>
          <div className="flex items-center gap-4 text-sm font-bold tracking-wide">
            <span>VISA</span>
            <span className="text-gold-400">MasterCard</span>
            <span>UZCARD</span>
            <span className="text-gold-400">HUMO</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
