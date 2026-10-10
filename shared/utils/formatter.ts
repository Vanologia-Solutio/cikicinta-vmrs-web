export function formatTag(snakeCaseString?: string): string {
  if (!snakeCaseString) return "-";
  return snakeCaseString
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

export function formatCurrency(amount: string | number): string {
  const value = Number(amount ?? 0);

  const formatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 2,
  });

  if (value < 0) {
    const formatted = formatter.format(Math.abs(value));
    return `(${formatted})`;
  }

  return formatter.format(value);
}

export function formatSeparator(amount: string | number): string {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
  }).format(Number(amount ?? 0));
}

const LOCALE_DECIMAL_SEPARATOR = (1.1).toLocaleString("id-ID").charAt(1);

export function sanitizeLocaleNumberInput(raw: string): string {
  const allowedChars = new RegExp(`[^\\d${LOCALE_DECIMAL_SEPARATOR}]`, "g");
  const [whole, ...rest] = raw
    .replace(allowedChars, "")
    .split(LOCALE_DECIMAL_SEPARATOR);
  return rest.length > 0
    ? `${whole}${LOCALE_DECIMAL_SEPARATOR}${rest.join("")}`
    : whole;
}

export function localeStringToNumber(value: string | number): number {
  if (typeof value === "number") return value;
  return Number(value.split(LOCALE_DECIMAL_SEPARATOR).join("."));
}

/**
 * Formats a sanitized input string for display while typing: groups the
 * whole part with thousand separators but preserves a trailing decimal
 * separator/digits as-is, so an in-progress "11," isn't collapsed to "11".
 */
export function formatLocaleNumberInput(raw: string): string {
  const [whole, decimal] = raw.split(LOCALE_DECIMAL_SEPARATOR);
  const groupedWhole = whole
    ? new Intl.NumberFormat("id-ID").format(Number(whole))
    : whole;
  return decimal !== undefined
    ? `${groupedWhole}${LOCALE_DECIMAL_SEPARATOR}${decimal}`
    : groupedWhole;
}
