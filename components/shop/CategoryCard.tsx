import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Category } from "@/types/database";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group relative flex h-[150px] items-end overflow-hidden rounded-xl bg-navy-900"
    >
      {category.image_url && (
        <Image
          src={category.image_url}
          alt={category.name}
          fill
          sizes="220px"
          className="object-cover opacity-70 transition-transform duration-300 group-hover:scale-110"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
      <div className="relative z-10 flex w-full items-center justify-between p-4 text-white">
        <span className="font-semibold">{category.name}</span>
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
          <ArrowRight size={14} />
        </span>
      </div>
    </Link>
  );
}
