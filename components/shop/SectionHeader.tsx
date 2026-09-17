import Link from "next/link";

export function SectionHeader({
  title,
  href,
  extra,
}: {
  title: string;
  href?: string;
  extra?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-center justify-between border-b border-navy-100 pb-3">
      <h2 className="text-xl font-bold text-navy-900">{title}</h2>
      <div className="flex items-center gap-4">
        {extra}
        {href && (
          <Link href={href} className="text-sm font-medium text-navy-900/70 hover:text-gold-500">
            Barchasini ko'rish →
          </Link>
        )}
      </div>
    </div>
  );
}
