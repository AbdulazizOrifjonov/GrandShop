export function formatSom(value: number): string {
  if (value < 100000) {
    return "$" + new Intl.NumberFormat("ru-RU").format(Math.round(value));
  }
  return new Intl.NumberFormat("ru-RU").format(Math.round(value)) + " so'm";
}

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function calcDiscount(price: number, oldPrice?: number | null) {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}
