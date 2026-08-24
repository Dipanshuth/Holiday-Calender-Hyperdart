import React from 'react';
import { Alert, AlertTitle, Box } from '@mui/material';

function ErrorState({ title = 'Something went wrong', message }) {
  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Alert severity="error" variant="outlined" sx={{ borderRadius: 2 }}>
        <AlertTitle sx={{ fontWeight: 600 }}>{title}</AlertTitle>
        {message}
      </Alert>
    </Box>
  );
}

export default ErrorState;
