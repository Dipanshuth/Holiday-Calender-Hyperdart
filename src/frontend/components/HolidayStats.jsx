import React, { useMemo } from 'react';
import { Box, Paper, Typography } from '@mui/material';

function computeStats(holidays) {
  const total = holidays.length;
  const national = holidays.filter((h) => h.nationalHoliday).length;
  const publicCount = holidays.filter(
    (h) => Array.isArray(h.holidayTypes) && h.holidayTypes.includes('Public')
  ).length;
  return { total, national, publicCount };
}

function StatBlock({ label, value }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        flex: 1,
        minWidth: 100,
        py: 1.5,
        px: 2,
        textAlign: 'center',
        borderRadius: 2,
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
        {value}
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
    </Paper>
  );
}

function HolidayStats({ holidays }) {
  const { total, national, publicCount } = useMemo(() => computeStats(holidays), [holidays]);

  return (
    <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
      <StatBlock label="Total Holidays" value={total} />
      <StatBlock label="National Holidays" value={national} />
      <StatBlock label="Public Holidays" value={publicCount} />
    </Box>
  );
}

export default HolidayStats;
