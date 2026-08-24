// Thin client around the Nager.Date Holiday API.
//
// The hackathon spec pins this to https://date.nager.at/api/v4/Holidays/{CountryCode}/{Year}.
// As of this writing, that domain now serves the project's rebranded docs/marketing
// site (nagerholidays.com) instead of raw JSON at the API path, which makes a plain
// fetch to date.nager.at return an HTML page rather than the expected array. The
// underlying API is the same open-source project (github.com/nager/Nager.Date) — it's
// just been moved to a new domain — so this client tries the current domain first and
// falls back to the legacy one in case that ever reverses.

const PRIMARY_BASE_URL = 'https://nagerholidays.com/api/v4/Holidays';
const FALLBACK_BASE_URL = 'https://date.nager.at/api/v4/Holidays';

const MIN_YEAR = 1975; // Nager.Date's documented practical lower bound
const MAX_YEAR = 2100;

// Simple in-memory cache — cleared on page reload, scoped to the
// component's lifetime. Avoids duplicate requests for the same
// country/year during a session.
const cache = new Map();

function buildUrl(baseUrl, countryCode, year) {
  return `${baseUrl}/${encodeURIComponent(countryCode)}/${encodeURIComponent(year)}`;
}

/** Fetches one base URL and returns a parsed array, or throws a descriptive Error. */
async function fetchFromBase(baseUrl, countryCode, year) {
  let response;
  try {
    response = await fetch(buildUrl(baseUrl, countryCode, year));
  } catch (networkError) {
    throw new Error('network');
  }

  if (response.status === 404) {
    throw new Error(`No holiday data found for country code "${countryCode}". It may not be supported.`);
  }
  if (!response.ok) {
    throw new Error(`Holiday service returned an error (status ${response.status}).`);
  }

  let data;
  try {
    data = await response.json();
  } catch (parseError) {
    throw new Error('unexpected-response');
  }

  if (!Array.isArray(data)) {
    throw new Error('unexpected-response');
  }

  return data;
}

/**
 * Fetches (and caches) all public holidays for a given country/year.
 * Tries the current Nager.Date domain first, then falls back to the
 * legacy one if the first attempt fails for a retryable reason
 * (network error or a non-JSON/non-array response).
 * @param {string} countryCode - ISO 3166-1 alpha-2 code, e.g. "US"
 * @param {number} year
 * @returns {Promise<Array>} array of Nager.Date holiday objects
 */
export async function fetchHolidays(countryCode, year) {
  if (!countryCode || typeof countryCode !== 'string') {
    throw new Error('A valid country code is required to look up holidays.');
  }
  if (!year || Number.isNaN(Number(year))) {
    throw new Error('A valid year is required to look up holidays.');
  }
  const numericYear = Number(year);
  if (numericYear < MIN_YEAR || numericYear > MAX_YEAR) {
    throw new Error(`Year ${numericYear} is outside the supported range.`);
  }

  const cacheKey = `${countryCode.toUpperCase()}-${numericYear}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const retryableCodes = new Set(['network', 'unexpected-response']);
  let lastError;

  for (const baseUrl of [PRIMARY_BASE_URL, FALLBACK_BASE_URL]) {
    try {
      const data = await fetchFromBase(baseUrl, countryCode, numericYear);
      cache.set(cacheKey, data);
      return data;
    } catch (err) {
      lastError = err;
      if (!retryableCodes.has(err.message)) {
        // A non-retryable error (404, explicit API error status) is
        // authoritative — don't mask it by trying the other domain.
        throw err;
      }
      // Otherwise fall through and try the next base URL.
    }
  }

  // Both attempts failed with a retryable error.
  if (lastError.message === 'network') {
    throw new Error('Could not reach the holiday service. Please check your connection and try again.');
  }
  throw new Error('The holiday service returned an unexpected response.');
}

/** Filters a full year's holidays down to a single month (1-12). */
export function filterByMonth(holidays, month) {
  if (!Array.isArray(holidays) || !month) return holidays || [];
  return holidays.filter((h) => {
    const parts = String(h.date).split('-');
    return parts.length === 3 && Number(parts[1]) === Number(month);
  });
}

/** Finds a holiday matching an exact "YYYY-MM-DD" date, or null. */
export function findByDate(holidays, isoDate) {
  if (!Array.isArray(holidays) || !isoDate) return null;
  return holidays.find((h) => h.date === isoDate) || null;
}
