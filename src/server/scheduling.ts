function parseTimeToMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  if (!Number.isInteger(h) || !Number.isInteger(m)) return null;
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

export function isValidTimeRange(startTime: string, endTime: string) {
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  if (start === null || end === null) return false;
  return end > start;
}

export function dayOfWeekFromDate(date: Date) {
  return date.getUTCDay();
}

const WEEKDAY_MAP: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export function dayOfWeekForDateInTimezone(
  dateString: string,
  timezone: string,
) {
  const sample = new Date(`${dateString}T12:00:00.000Z`);
  if (Number.isNaN(sample.getTime())) return null;

  const weekday = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: timezone,
  }).format(sample);

  return WEEKDAY_MAP[weekday] ?? null;
}

export function dateToDateOnlyUtc(date: Date) {
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return new Date(`${yyyy}-${mm}-${dd}T00:00:00.000Z`);
}

function minutesToHHmm(totalMinutes: number) {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function generateSlotsForRange(
  startTime: string,
  endTime: string,
  duration: number,
) {
  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = parseTimeToMinutes(endTime);
  if (startMinutes === null || endMinutes === null || duration <= 0) return [];
  if (endMinutes <= startMinutes) return [];

  const slots: string[] = [];
  for (
    let cursor = startMinutes;
    cursor + duration <= endMinutes;
    cursor += duration
  ) {
    slots.push(minutesToHHmm(cursor));
  }
  return slots;
}

