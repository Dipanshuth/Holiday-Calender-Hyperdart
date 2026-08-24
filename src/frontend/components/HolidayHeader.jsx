import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import PublicIcon from '@mui/icons-material/Public';
import { getFlagImageUrl } from '../../utils/searchDataParser';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function FlagBadge({ country, countryCode }) {
  const [imageFailed, setImageFailed] = useState(false);
  const flagUrl = getFlagImageUrl(countryCode);

  if (!flagUrl || imageFailed) {
    return <PublicIcon sx={{ fontSize: 28, color: 'text.secondary' }} aria-hidden="true" />;
  }

  return (
    <Box
      component="img"
      src={flagUrl}
      alt={`${country || countryCode} flag`}
      onError={() => setImageFailed(true)}
      sx={{
        width: 32,
        height: 24,
        objectFit: 'cover',
        borderRadius: 0.5,
        boxShadow: '0 0 0 1px rgba(0,0,0,0.12)',
        flexShrink: 0,
      }}
    />
  );
}

function HolidayHeader({ country, countryCode, year, month, intent }) {
  const scopeLabel = intent === 'month' && month ? `${MONTH_NAMES[month - 1]} ${year}` : String(year);

  return (
    <Box sx={{ mb: 2.5 }}>
      <Typography
        variant="overline"
        sx={{ color: 'text.secondary', letterSpacing: 1.2, fontWeight: 600 }}
      >
        Holiday Calendar
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
        <FlagBadge country={country} countryCode={countryCode} />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {country || 'Unknown country'}
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          {scopeLabel}
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
        Public holidays and important dates
      </Typography>
    </Box>
  );
}

export default HolidayHeader;
