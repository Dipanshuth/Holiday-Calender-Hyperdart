// Month name constants and flexible date-parsing helpers.
// No dates or years are ever hardcoded here — everything is derived
// from `new Date()` at call time or from the text being parsed.

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Maps every full name and common abbreviation to a 1-12 month number.
const MONTH_LOOKUP = MONTH_NAMES.reduce((acc, name, idx) => {
  const monthNumber = idx + 1;
  acc[name.toLowerCase()] = monthNumber;
  acc[name.slice(0, 3).toLowerCase()] = monthNumber;
  return acc;
}, {});
// A couple of non-standard-but-common abbreviations.
MONTH_LOOKUP['sept'] = 9;

const MONTH_PATTERN = Object.keys(MONTH_LOOKUP)
  .sort((a, b) => b.length - a.length) // longest first so "september" wins over "sep"
  .join('|');

/**
 * Returns the current year/month (1-12)/day using the runtime clock.
 * Centralised so nothing else in the codebase calls `new Date()` directly.
 */
export function getCurrentDateParts() {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
}

/** Resolves "next month"/"last month" relative to the current date. */
export function resolveRelativeMonth(direction, baseYear, baseMonth) {
  let month = baseMonth;
  let year = baseYear;
  if (direction === 'next') {
    month += 1;
    if (month > 12) { month = 1; year += 1; }
  } else if (direction === 'last') {
    month -= 1;
    if (month < 1) { month = 12; year -= 1; }
  }
  return { year, month };
}

/** Finds the first month name/abbreviation mentioned in the text. Returns 1-12 or null. */
export function findMonthInText(text) {
  const re = new RegExp(`\\b(${MONTH_PATTERN})\\b`, 'i');
  const match = text.match(re);
  if (!match) return null;
  return MONTH_LOOKUP[match[1].toLowerCase()] ?? null;
}

/**
 * Tries to find an explicit day-of-month next to the mentioned month name,
 * supporting both "December 25" and "25 December" orderings, with optional
 * ordinal suffixes (1st, 2nd, 3rd, 4th...).
 * Returns a number 1-31, or null if no confident match is found.
 */
export function findDayNearMonth(text) {
  const ordinal = '(?:st|nd|rd|th)?';
  const monthFirst = new RegExp(
    `\\b(${MONTH_PATTERN})\\s+(\\d{1,2})${ordinal}\\b`, 'i'
  );
  const dayFirst = new RegExp(
    `\\b(\\d{1,2})${ordinal}\\s+(?:of\\s+)?(${MONTH_PATTERN})\\b`, 'i'
  );

  let match = text.match(monthFirst);
  if (match) {
    const day = parseInt(match[2], 10);
    if (day >= 1 && day <= 31) return day;
  }

  match = text.match(dayFirst);
  if (match) {
    const day = parseInt(match[1], 10);
    if (day >= 1 && day <= 31) return day;
  }

  return null;
}

/**
 * Best-effort parse of a numeric MM/DD/YYYY (or MM/DD) date.
 * If the first number can't be a month (>12) but the second can, the two
 * are swapped rather than guessed at silently in a way that could mislead.
 * Returns { month, day, year } or null.
 */
export function parseNumericDate(text) {
  const match = text.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/);
  if (!match) return null;

  let [, a, b, y] = match;
  a = parseInt(a, 10);
  b = parseInt(b, 10);

  let month = a;
  let day = b;
  if (month > 12 && day <= 12) {
    // First number can't be a month — assume DD/MM ordering instead.
    month = b;
    day = a;
  }
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  let year = null;
  if (y) {
    year = y.length === 2 ? 2000 + parseInt(y, 10) : parseInt(y, 10);
  }

  return { month, day, year };
}

export function pad2(n) {
  return String(n).padStart(2, '0');
}
