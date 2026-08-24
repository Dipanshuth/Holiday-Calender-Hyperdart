import React from 'react';
import { Box, Typography } from '@mui/material';
import EventBusyIcon from '@mui/icons-material/EventBusy';

function EmptyState({ message = 'No holidays found for this selection.' }) {
  return (
    <Box
      sx={{
        p: 4,
        textAlign: 'center',
        color: 'text.secondary',
      }}
    >
      <EventBusyIcon sx={{ fontSize: 40, mb: 1, opacity: 0.6 }} />
      <Typography variant="body1">{message}</Typography>
    </Box>
  );
}

export default EmptyState;
