export function formatEndDate(
  iso: string | Date | null | undefined,
  {
    withTime = false,
    timeZone = "Europe/Amsterdam",
    locale = undefined,
  }: {
    withTime?: boolean;
    timeZone?: string;
    locale?: string | string[];
  } = {}
) {
  if (!iso) return "—";
  const date = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(date.getTime())) return "Invalid date";

  const base: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "2-digit",
    timeZone,
  };

  const opts: Intl.DateTimeFormatOptions = withTime
    ? { ...base, hour: "2-digit", minute: "2-digit" }
    : base;

  return new Intl.DateTimeFormat(locale, opts).format(date);
}