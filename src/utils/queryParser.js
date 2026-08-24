import {
  getCurrentDateParts,
  resolveRelativeMonth,
  findMonthInText,
  findDayNearMonth,
  parseNumericDate,
  pad2,
} from './dateUtils';

const EXPLICIT_YEAR_RE = /\b(19|20)\d{2}\b/;
const NEXT_YEAR_RE = /\bnext\s+year\b/i;
const LAST_YEAR_RE = /\blast\s+year\b/i;
const THIS_YEAR_RE = /\b(this|current)\s+year\b/i;
const NEXT_MONTH_RE = /\bnext\s+month\b/i;
const LAST_MONTH_RE = /\b(last|previous)\s+month\b/i;
const THIS_MONTH_RE = /\b(this|current)\s+month\b/i;

/**
 * Extracts { year, month, date, intent } from a raw natural-language query.
 *
 * intent is one of: "date" | "month" | "year"
 * - date query:  year set, month set, date set to "YYYY-MM-DD"
 * - month query: year set, month set, date is null
 * - year query:  year set, month and date are null
 *
 * The current year/month is read from the system clock at call time —
 * nothing here is ever hardcoded.
 */
export function parseHolidayQuery(rawQuery) {
  const query = (rawQuery || '').trim();
  const lower = query.toLowerCase();
  const now = getCurrentDateParts();

  // 1. Resolve the year, explicit first, then relative phrases.
  let year = null;
  const explicitYearMatch = lower.match(EXPLICIT_YEAR_RE);
  if (explicitYearMatch) {
    year = parseInt(explicitYearMatch[0], 10);
  } else if (NEXT_YEAR_RE.test(lower)) {
    year = now.year + 1;
  } else if (LAST_YEAR_RE.test(lower)) {
    year = now.year - 1;
  } else if (THIS_YEAR_RE.test(lower)) {
    year = now.year;
  }

  // 2. Resolve an explicit month name/abbreviation, if any.
  let month = findMonthInText(lower);

  // 3. Resolve relative month phrases ("next month" etc.) only when no
  //    explicit month name was found — an explicit month always wins.
  if (!month) {
    if (NEXT_MONTH_RE.test(lower)) {
      const resolved = resolveRelativeMonth('next', now.year, now.month);
      month = resolved.month;
      if (!explicitYearMatch) year = resolved.year;
    } else if (LAST_MONTH_RE.test(lower)) {
      const resolved = resolveRelativeMonth('last', now.year, now.month);
      month = resolved.month;
      if (!explicitYearMatch) year = resolved.year;
    } else if (THIS_MONTH_RE.test(lower)) {
      month = now.month;
    }
  }

  // 4. Try to find a specific day (date-intent query), either near a named
  //    month or as a numeric MM/DD date.
  let day = null;
  if (month) {
    day = findDayNearMonth(lower);
  }
  if (!day) {
    const numeric = parseNumericDate(lower);
    if (numeric) {
      month = numeric.month;
      day = numeric.day;
      if (numeric.year && !explicitYearMatch) year = numeric.year;
    }
  }

  // 5. Default the year to "this year" (current system year) whenever the
  //    query needs a year but didn't specify or imply one.
  if (!year) year = now.year;

  if (day && month) {
    return {
      year,
      month,
      date: `${year}-${pad2(month)}-${pad2(day)}`,
      intent: 'date',
    };
  }

  if (month) {
    return { year, month, date: null, intent: 'month' };
  }

  return { year, month: null, date: null, intent: 'year' };
}
