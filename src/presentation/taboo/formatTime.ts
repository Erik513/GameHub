/** Formats milliseconds as seconds with one decimal, using the locale's decimal separator. */
export function formatSeconds(milliseconds: number, language: string): string {
  return new Intl.NumberFormat(language, {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  }).format(Math.max(0, milliseconds) / 1000);
}
