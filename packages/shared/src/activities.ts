import type { RecurrenceInterval } from "./types/database";

/** Given a YYYY-MM-DD due_date, returns the next occurrence's due_date for
 * the given recurrence interval, or null if the interval is 'none' or the
 * next occurrence would fall after recurrence_until. */
export function nextRecurrenceDate(
  dueDate: string,
  interval: RecurrenceInterval,
  recurrenceUntil: string | null,
): string | null {
  if (interval === "none") return null;

  const date = new Date(`${dueDate}T00:00:00Z`);
  if (interval === "daily") date.setUTCDate(date.getUTCDate() + 1);
  if (interval === "weekly") date.setUTCDate(date.getUTCDate() + 7);
  if (interval === "monthly") date.setUTCMonth(date.getUTCMonth() + 1);

  const next = date.toISOString().slice(0, 10);
  if (recurrenceUntil && next > recurrenceUntil) return null;
  return next;
}

export function isActivityOverdue(dueDate: string, isDone: boolean): boolean {
  if (isDone) return false;
  const today = new Date().toISOString().slice(0, 10);
  return dueDate < today;
}
