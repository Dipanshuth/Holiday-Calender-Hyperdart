// Safely extracts what the component needs from the HyperDart `searchData`
// prop. Never assumes `entities[0]` is the location — it looks for the
// entity whose `entityType` is "LOCATION", as recommended by the docs,
// and tolerates missing/malformed data at every step.

/**
 * @param {object} searchData - the raw prop passed in by HyperDart
 * @returns {{ country: string|null, countryCode: string|null, rawQuery: string, isValid: boolean }}
 */
export function getCountryFromSearchData(searchData) {
  const empty = { country: null, countryCode: null, rawQuery: '', isValid: false };

  if (!searchData || typeof searchData !== 'object') return empty;

  const rawQuery =
    (typeof searchData.query === 'string' && searchData.query) ||
    (typeof searchData.queryTerm === 'string' && searchData.queryTerm) ||
    (typeof searchData._processedQuery === 'string' && searchData._processedQuery) ||
    '';

  const entities = Array.isArray(searchData.entities) ? searchData.entities : [];

  const locationEntity =
    entities.find((e) => e && e.entityType === 'LOCATION') ||
    entities.find((e) => e && e.entityInfo && e.entityInfo.geo);

  const geo = locationEntity?.entityInfo?.geo;
  const country = typeof geo?.country === 'string' ? geo.country : null;
  const countryCode = typeof geo?.countryCode === 'string' ? geo.countryCode.toUpperCase() : null;

  return {
    country,
    countryCode,
    rawQuery,
    isValid: Boolean(countryCode),
  };
}

/** Converts an ISO 3166-1 alpha-2 code into its regional-indicator flag emoji. */
export function countryCodeToFlag(countryCode) {
  if (!countryCode || countryCode.length !== 2) return '🌐';
  const codePoints = [...countryCode.toUpperCase()].map((c) => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

/**
 * Returns a real flag image URL for an ISO 3166-1 alpha-2 code, via flagcdn.com
 * (a free, no-key-required flag CDN). Emoji flags render inconsistently across
 * platforms — notably as plain two-letter text on Windows Chrome — so an actual
 * image is used in the UI instead, with the emoji kept only as an accessible
 * text fallback.
 */
export function getFlagImageUrl(countryCode) {
  if (!countryCode || countryCode.length !== 2) return null;
  return `https://flagcdn.com/${countryCode.toLowerCase()}.svg`;
}
