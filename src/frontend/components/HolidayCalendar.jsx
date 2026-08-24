import React, { useEffect, useMemo, useState } from 'react';
import { Box, Paper } from '@mui/material';

import { getCountryFromSearchData } from '../../utils/searchDataParser';
import { parseHolidayQuery } from '../../utils/queryParser';
import { fetchHolidays, filterByMonth, findByDate } from '../../services/holidayApi';

import HolidayHeader from './HolidayHeader';
import HolidayStats from './HolidayStats';
import HolidayList from './HolidayList';
import DateAnswer from './DateAnswer';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';

function HolidayCalendar({ searchData, messageHandlers }) {
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [holidays, setHolidays] = useState([]);

  const { country, countryCode, rawQuery, isValid } = useMemo(
    () => getCountryFromSearchData(searchData),
    [searchData]
  );

  const parsed = useMemo(() => parseHolidayQuery(rawQuery), [rawQuery]);

  // Signal to HyperDart that the component has finished mounting.
  useEffect(() => {
    messageHandlers?.componentLoaded?.();
  }, [messageHandlers]);

  useEffect(() => {
    let cancelled = false;

    if (!searchData) {
      setStatus('error');
      setErrorMessage('No search data was received. Try a query like "Holidays in India 2026".');
      return;
    }
    if (!isValid) {
      setStatus('error');
      setErrorMessage('Could not identify a country from your query. Try including a country name, e.g. "Holidays in Japan 2026".');
      return;
    }

    setStatus('loading');
    fetchHolidays(countryCode, parsed.year)
      .then((data) => {
        if (cancelled) return;
        setHolidays(data);
        setStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        setErrorMessage(err.message || 'Something went wrong while fetching holiday data.');
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [searchData, isValid, countryCode, parsed.year]);

  const renderContent = () => {
    if (status === 'loading') return <LoadingState />;
    if (status === 'error') return <ErrorState message={errorMessage} />;

    if (parsed.intent === 'date') {
      const match = findByDate(holidays, parsed.date);
      return (
        <>
          <HolidayHeader
            country={country}
            countryCode={countryCode}
            year={parsed.year}
            month={parsed.month}
            intent={parsed.intent}
          />
          <DateAnswer
            isoDate={parsed.date}
            holiday={match}
            country={country}
            countryCode={countryCode}
          />
        </>
      );
    }

    const displayedHolidays =
      parsed.intent === 'month' ? filterByMonth(holidays, parsed.month) : holidays;

    return (
      <>
        <HolidayHeader
          country={country}
          countryCode={countryCode}
          year={parsed.year}
          month={parsed.month}
          intent={parsed.intent}
        />
        <HolidayStats holidays={displayedHolidays} />
        <HolidayList holidays={displayedHolidays} groupByMonthEnabled={parsed.intent === 'year'} />
      </>
    );
  };

  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        borderRadius: 3,
        p: { xs: 2, sm: 3 },
        maxWidth: 640,
        width: '100%',
      }}
    >
      <Box>{renderContent()}</Box>
    </Paper>
  );
}

export default HolidayCalendar;
