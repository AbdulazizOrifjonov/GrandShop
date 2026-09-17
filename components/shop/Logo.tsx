import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ dark = false, hideTextOnMobile = false, className }: { dark?: boolean; hideTextOnMobile?: boolean; className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center shrink-0", className)}>
      <img
        src="/logo.png"
        alt="Grand Watch Shop"
        className={cn(
          "h-[50px] w-auto object-contain transition-all",
          dark ? "brightness-0 invert" : "",
          hideTextOnMobile ? "max-w-[140px] md:max-w-none" : ""
        )}
      />
    </Link>
  );
}
