/**
 * Curated IANA timezones for selects; extended with Intl when available.
 */
export const COMMON_TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Madrid",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
  "Pacific/Auckland",
] as const;

export function getTimezoneOptions(): string[] {
  try {
    const supported = Intl.supportedValuesOf?.("timeZone");
    if (supported && supported.length > 0) {
      const set = new Set([...COMMON_TIMEZONES, ...supported]);
      return Array.from(set).sort((a, b) => a.localeCompare(b));
    }
  } catch {
    // ignore
  }
  return [...COMMON_TIMEZONES];
}
