import React, { useMemo } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import HolidayCard from './HolidayCard';
import EmptyState from './EmptyState';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function groupByMonth(holidays) {
  const groups = {};
  holidays.forEach((h) => {
    const parts = String(h.date).split('-');
    const monthNum = Number(parts[1]);
    if (!monthNum) return;
    if (!groups[monthNum]) groups[monthNum] = [];
    groups[monthNum].push(h);
  });
  return groups;
}

function HolidayList({ holidays, groupByMonthEnabled }) {
  const groups = useMemo(
    () => (groupByMonthEnabled ? groupByMonth(holidays) : null),
    [holidays, groupByMonthEnabled]
  );

  if (!holidays || holidays.length === 0) {
    return <EmptyState message="No holidays found for this selection." />;
  }

  if (!groupByMonthEnabled) {
    return (
      <Stack spacing={1.5}>
        {holidays.map((h) => (
          <HolidayCard key={`${h.date}-${h.name}`} holiday={h} />
        ))}
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      {Object.keys(groups)
        .map(Number)
        .sort((a, b) => a - b)
        .map((monthNum) => (
          <Box key={monthNum}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.25 }}>
              {MONTH_NAMES[monthNum - 1]}
            </Typography>
            <Stack spacing={1.5}>
              {groups[monthNum].map((h) => (
                <HolidayCard key={`${h.date}-${h.name}`} holiday={h} />
              ))}
            </Stack>
          </Box>
        ))}
    </Stack>
  );
}

export default HolidayList;
