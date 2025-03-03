'use client';

import * as React from 'react';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Layout from '@/app/dashboard-customer/layout';

export default function Page2(): React.JSX.Element {
  return (
    <Layout>
      <Stack spacing={3}>
        <Typography variant="h4">Page 2</Typography>
      </Stack>
    </Layout>
  );
}