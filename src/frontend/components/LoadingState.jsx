import React from 'react';
import { Box, Skeleton, Stack } from '@mui/material';

function LoadingState() {
  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }} aria-busy="true" aria-label="Loading holidays">
      <Stack spacing={0.5} sx={{ mb: 3 }}>
        <Skeleton variant="text" width={180} height={40} />
        <Skeleton variant="text" width={120} height={24} />
      </Stack>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rounded" width="100%" height={72} />
        ))}
      </Stack>

      <Skeleton variant="text" width={100} height={28} sx={{ mb: 1 }} />
      <Stack spacing={1.5}>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="rounded" height={64} />
        ))}
      </Stack>
    </Box>
  );
}

export default LoadingState;
