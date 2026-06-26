import { clsx, type ClassValue } from "clsx";

/**
 * Merge Tailwind class names with conflict resolution.
 * Simple clsx wrapper — we can add tailwind-merge later if needed.
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Format money from cents to display string.
 * @param cents - Amount in smallest currency unit
 * @param currency - ISO 4217 currency code
 */
export function formatMoney(cents: number | undefined | null, currency: string = "BRL"): string {
  if (cents === undefined || cents === null || isNaN(cents)) cents = 0;
  const amount = cents / 100;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a date string for display.
 */
export function formatDate(dateStr: string | null | undefined, style: "short" | "long" = "short"): string {
  if (!dateStr) return "";
  const date = new Date(dateStr + "T00:00:00");
  if (isNaN(date.getTime())) return "";
  if (style === "long") {
    return date.toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

/**
 * Calculate days until a date, or days since if in the past.
 */
export function daysUntil(dateStr: string | null | undefined): { days: number; isPast: boolean } {
  if (!dateStr) return { days: 0, isPast: false };
  const target = new Date(dateStr + "T00:00:00");
  if (isNaN(target.getTime())) return { days: 0, isPast: false };
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = target.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return { days: Math.abs(days), isPast: days < 0 };
}

/**
 * Get a country flag emoji from ISO 3166-1 alpha-2 code.
 */
export function countryFlag(code: string | null): string {
  if (!code || code === "XX") return "🌍";
  const codePoints = [...code.toUpperCase()].map(
    (c) => 0x1f1e6 + c.charCodeAt(0) - 65
  );
  return String.fromCodePoint(...codePoints);
}

/**
 * Calculate percentage, clamped 0-100.
 */
export function percentage(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(100, Math.max(0, Math.round((part / total) * 100)));
}
