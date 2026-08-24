import React, { useState } from 'react';
import { Box, Chip, Paper, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PublicIcon from '@mui/icons-material/Public';
import { getFlagImageUrl } from '../../utils/searchDataParser';

function formatDate(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

function InlineFlag({ country, countryCode }) {
  const [imageFailed, setImageFailed] = useState(false);
  const flagUrl = getFlagImageUrl(countryCode);

  if (!flagUrl || imageFailed) {
    return <PublicIcon sx={{ fontSize: 16, verticalAlign: 'text-bottom' }} aria-hidden="true" />;
  }

  return (
    <Box
      component="img"
      src={flagUrl}
      alt={`${country || countryCode} flag`}
      onError={() => setImageFailed(true)}
      sx={{
        width: 18,
        height: 13,
        objectFit: 'cover',
        borderRadius: 0.25,
        boxShadow: '0 0 0 1px rgba(0,0,0,0.12)',
        verticalAlign: 'middle',
        mr: 0.5,
      }}
    />
  );
}

function DateAnswer({ isoDate, holiday, country, countryCode }) {
  const isHoliday = Boolean(holiday);
  const formattedDate = formatDate(isoDate);

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 3, sm: 4 },
        borderRadius: 3,
        textAlign: 'center',
        borderColor: isHoliday ? 'success.main' : 'divider',
      }}
    >
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1,
          color: isHoliday ? 'success.main' : 'text.secondary',
          mb: 2,
        }}
      >
        {isHoliday ? <CheckCircleIcon sx={{ fontSize: 32 }} /> : <CancelIcon sx={{ fontSize: 32 }} />}
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {isHoliday ? 'YES' : 'NO'}
        </Typography>
      </Box>

      <Typography variant="h6" sx={{ fontWeight: 600, mb: isHoliday ? 0.5 : 1 }}>
        {formattedDate}
      </Typography>

      {isHoliday ? (
        <>
          <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
            {holiday.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', flexWrap: 'wrap', mb: 1.5 }}>
            {holiday.nationalHoliday && <Chip label="National" size="small" />}
            {Array.isArray(holiday.holidayTypes) &&
              holiday.holidayTypes.map((t) => <Chip key={t} label={t} size="small" variant="outlined" />)}
          </Box>
        </>
      ) : (
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
          is not listed as a public holiday{country ? ` in ${country}` : ''}.
        </Typography>
      )}

      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        <InlineFlag country={country} countryCode={countryCode} />
        {country || countryCode}
      </Typography>
    </Paper>
  );
}

export default DateAnswer;
