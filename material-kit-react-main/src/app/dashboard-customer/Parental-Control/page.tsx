
'use client';

import * as React from 'react';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

import ParentalControlDashboard from '@/components/dashboard-customer/Parental-Control/ClientComponent';

export default function ParentalControlPage(): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4">Parental Control</Typography>
      </div>
      <ParentalControlDashboard />
    </Stack>
  );
}
