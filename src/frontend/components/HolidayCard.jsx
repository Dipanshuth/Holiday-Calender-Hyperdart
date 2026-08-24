import React from 'react';
import { Box, Chip, Paper, Typography } from '@mui/material';

const MONTH_ABBR = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
];

function HolidayCard({ holiday }) {
  const [, monthStr, dayStr] = String(holiday.date).split('-');
  const monthLabel = MONTH_ABBR[Number(monthStr) - 1] || '';
  const day = dayStr || '';

  const badges = [];
  if (holiday.nationalHoliday) badges.push('National');
  if (Array.isArray(holiday.holidayTypes)) {
    holiday.holidayTypes.forEach((t) => {
      if (!badges.includes(t)) badges.push(t);
    });
  }

  const hasSubdivisions = Array.isArray(holiday.subdivisionCodes) && holiday.subdivisionCodes.length > 0;

  return (
    <Paper
      variant="outlined"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 1.75,
        borderRadius: 2,
        transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
        '&:hover': {
          boxShadow: 2,
          borderColor: 'primary.main',
        },
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          width: 56,
          height: 56,
          borderRadius: 1.5,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-hidden="true"
      >
        <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.1 }}>{day}</Typography>
        <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: 0.5 }}>{monthLabel}</Typography>
      </Box>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography sx={{ fontWeight: 600 }} noWrap>
          {holiday.name}
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
          {badges.map((b) => (
            <Chip key={b} label={b} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
          ))}
          {hasSubdivisions && (
            <Chip
              label={`${holiday.subdivisionCodes.length} region${holiday.subdivisionCodes.length > 1 ? 's' : ''}`}
              size="small"
              variant="outlined"
              sx={{ height: 20, fontSize: '0.7rem' }}
            />
          )}
        </Box>
      </Box>
    </Paper>
  );
}

export default HolidayCard;
