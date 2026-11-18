/** Formats milliseconds as seconds with one decimal, using the locale's decimal separator. */
export function formatSeconds(milliseconds: number, language: string): string {
  return new Intl.NumberFormat(language, {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  }).format(Math.max(0, milliseconds) / 1000);
}

/** Formats whole seconds as minutes and seconds, for example 125 as "2:05". */
export function formatMinutes(seconds: number): string {
  const whole = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}
