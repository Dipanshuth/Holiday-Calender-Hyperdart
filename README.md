# Holiday Calendar

A HyperDart component that understands natural-language holiday questions
("Holidays in Japan July 2026", "Is December 25 a holiday in the UK?") and
answers them using the [Nager.Date](https://date.nager.at/api) public
holiday API.

## Overview

Holiday Calendar is a reusable React component built for the HyperDart
platform. HyperDart resolves the **country** from a user's query and hands
it to the component as `searchData`; the component itself is responsible
for parsing the year, month, and exact date out of the raw query text,
fetching the right data from Nager.Date, and presenting a focused,
polished answer.

## Features

- Understands year, month, and specific-date holiday questions
- Resolves relative time expressions ("this year", "next year", "next month")
  from the system clock — nothing is ever hardcoded
- Groups a full year's holidays by month for easy scanning
- Focused YES/NO card for "is `<date>` a holiday" questions
- Safe against missing/malformed `searchData`, invalid years, and API/network
  failures — never crashes, always shows a friendly message
- Lightweight in-memory caching to avoid duplicate requests for the same
  country/year in a session
- Responsive, accessible, MUI-based UI with a loading skeleton, empty state,
  and error state

## How It Works

```
User query
  ↓
HyperDart searchData (resolves the country)
  ↓
Country extraction (searchDataParser.js)
  ↓
Query parsing — year / month / date / intent (queryParser.js)
  ↓
Nager.Date API (holidayApi.js)
  ↓
Filtering (by month or by exact date, done locally)
  ↓
UI (HolidayCalendar and its child components)
```

## Supported Queries

- Holidays in USA 2026
- Public holidays in UK 2026
- Holidays in Japan July 2026
- Is July 4 a holiday in USA 2026
- Is December 25 a holiday in UK 2026
- Show holidays in Canada August
- Holidays in India 2026
- Public holidays in India this year
- Holidays in France next year
- Is 15 August a holiday in India 2026
- Holidays in the US next month
- List of holidays in Japan for July

## Architecture

```
src/
  frontend/
    index.jsx                  # withHD(NewComponent) — HyperDart entry point
    NewComponent.jsx            # thin wrapper passing searchData through
    components/
      HolidayCalendar.jsx       # top-level container: orchestrates everything
      HolidayHeader.jsx         # country flag/name + year (or month + year)
      HolidayStats.jsx          # total / national / public holiday counts
      HolidayList.jsx           # month-grouped or flat holiday list
      HolidayCard.jsx           # a single holiday's card
      DateAnswer.jsx            # YES/NO focused view for date queries
      LoadingState.jsx          # skeleton loading UI
      ErrorState.jsx            # friendly error message
      EmptyState.jsx            # "no holidays found" state
  services/
    holidayApi.js               # Nager.Date client: fetch, validate, cache
  utils/
    queryParser.js              # parseHolidayQuery(query) → {year, month, date, intent}
    searchDataParser.js         # getCountryFromSearchData(searchData), flag emoji
    dateUtils.js                # month names, relative-date resolution, parsing helpers
  sandbox/
    main.jsx                    # local HyperDart sandbox entry (uses searchData.json)
hyperdart.config.js             # keywords + trigger regex patterns
searchData.json                 # default mock searchData used by the sandbox
```

## API

**Nager.Date Holiday API**

```
GET https://date.nager.at/api/v4/Holidays/{CountryCode}/{Year}
```

Example: `https://date.nager.at/api/v4/Holidays/US/2026`

No API key is required. `CountryCode` is ISO 3166-1 alpha-2 (e.g. `US`,
`GB`, `IN`). The endpoint only accepts a full year — there is no month or
date parameter, which is why month/date filtering happens locally (see
below).

## searchData

HyperDart resolves the location entity for a query and passes it to the
component as `searchData`. The component looks for the entity whose
`entityType` is `"LOCATION"` (rather than assuming `entities[0]`) and reads
`entityInfo.geo.country` and `entityInfo.geo.countryCode` from it. The raw
query text is read from `searchData.query`.

HyperDart does **not** resolve the year, month, or exact date — those are
parsed by this component from the raw query.

## Query Parsing

`parseHolidayQuery(query)` in `utils/queryParser.js` extracts:

- **year** — an explicit 4-digit year, or resolved from "this year" /
  "next year" / "last year", defaulting to the current year (from
  `new Date()`, never hardcoded)
- **month** — an explicit month name/abbreviation, or resolved from "this
  month" / "next month" / "last month"
- **date** — an exact day found next to a month name (either "December 25"
  or "25 December" ordering, with optional ordinal suffixes), or a numeric
  `MM/DD` date
- **intent** — `"date"`, `"month"`, or `"year"`, depending on how much
  specificity was found

## Month Filtering

Nager.Date only returns a full year's holidays per request. For a month
query, the component fetches the entire year once and filters the results
locally to the requested month (`services/holidayApi.js#filterByMonth`),
rather than making per-month API calls.

## Date Checking

For a date question, the component fetches the relevant year and looks for
a holiday whose `date` field exactly matches the requested `YYYY-MM-DD`
(`services/holidayApi.js#findByDate`). If found, it shows **YES** with the
holiday's name and type; if not, it shows **NO**.

## Error Handling

The component handles, without crashing:

- Missing `searchData`, missing country entity, or missing country code
- Missing or unparseable query text
- Invalid or out-of-range years
- API failures (non-2xx responses) and network failures
- Empty API responses
- A requested date that isn't a holiday
- An unsupported/invalid country code (Nager.Date 404s)

Every failure surfaces as a plain-language message in `ErrorState`, never a
stack trace or blank screen.

## Installation

```bash
npm install
```

## Development

```bash
npm start
```

This runs the Vite dev server with the HyperDart sandbox
(`src/sandbox/main.jsx`), using the mock query in `searchData.json`. Edit
that file's `query` field to try different queries locally.

## Build

```bash
npm run build
```

Produces the production bundle at `dist/frontend/index.modern.js`, per the
`module` field in `package.json`.

## HyperDart Configuration

`hyperdart.config.js` registers the trigger keywords and regex patterns
required by the hackathon spec:

**Keywords:** `holiday`, `holidays`, `holiday calendar`, `public holiday`,
`public holidays`

**Regex patterns:**
```
holidays?\s+(in|of)\s+HD_LOCATION.*
public\s+holidays?\s+(in|of)\s+HD_LOCATION.*
is\s+.*\s+(a\s+)?holiday\s+(in|of)\s+HD_LOCATION.*
(list|show)\s+holidays?\s+(in|of)\s+HD_LOCATION.*
```

## Component Usage

The component is mounted by HyperDart via `withHD(NewComponent)` in
`src/frontend/index.jsx`. It expects two props, both supplied by the
HyperDart runtime:

- `searchData` — the resolved query payload described above
- `messageHandlers.componentLoaded()` — called once on mount to signal
  HyperDart that rendering is complete

No manual country input is ever required from the user.

## Testing

Query cases exercised during development:

1. Holidays in USA 2026
2. Public holidays in UK 2026
3. Holidays in Japan July 2026
4. Is July 4 a holiday in USA 2026
5. Is December 25 a holiday in UK 2026
6. Show holidays in Canada August
7. Holidays in India 2026
8. Public holidays in India this year
9. Holidays in France next year
10. Invalid/missing country
11. Invalid year
12. A holiday date that does not exist
13. A valid date that is not a holiday
14. API/network failure
15. Empty API response

## Demo

_Add your demo video URL here._

## Hackathon Submission

This submission includes the full component source
(`src/frontend`, `src/services`, `src/utils`), the HyperDart configuration
(`hyperdart.config.js`), a mock `searchData.json` for local sandbox
testing, and this README.

## License

MIT
