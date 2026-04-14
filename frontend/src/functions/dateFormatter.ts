/**
 * Centralized date formatting utility.
 * All date displays across the frontend must use these utilities to ensure DD/MM/YYYY consistency.
 */

/**
 * Formats a date string or ISO timestamp to DD/MM/YYYY.
 * Returns "Not set" for null, undefined, or empty values.
 */
export const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "Not set";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "Not set";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/**
 * Formats a date string or ISO timestamp to DD/MM/YYYY HH:MM.
 * Returns "Not set" for null, undefined, or empty values.
 * Optional timezone can be provided, e.g. "Asia/Jakarta".
 */
export const formatDateTime = (
  dateStr: string | null | undefined,
  timeZone?: string,
): string => {
  if (!dateStr) return "Not set";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "Not set";
  const date = d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(timeZone ? { timeZone } : {}),
  });
  const time = d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    ...(timeZone ? { timeZone } : {}),
  });
  return `${date} ${time}`;
};
