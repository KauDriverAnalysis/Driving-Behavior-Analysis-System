import * as React from 'react';
import type { Metadata } from 'next';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import PersonIcon from '@mui/icons-material/Person';

import { config } from '@/config';
import { AccountDetailsForm } from '@/components/dashboard-admin/account/account-details-form';

export const metadata = { title: `Account Settings | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        py: 3,
        px: { xs: 2, md: 3 }
      }}
    >
      <Stack spacing={4}>
        <Paper
          sx={{
            p: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            bgcolor: 'primary.light',
            color: 'primary.contrastText'
          }}
        >
          <PersonIcon sx={{ fontSize: 40 }} />
          <div>
            <Typography variant="h4" gutterBottom>
              Account Settings
            </Typography>
            <Typography variant="body1">
              Manage your account details and preferences
            </Typography>
          </div>
        </Paper>

        <Grid container spacing={3}>
          {/* Account Details Section */}
          <Grid xs={12} md={8}>
            <AccountDetailsForm />
          </Grid>

          {/* Account Summary Section */}
          <Grid xs={12} md={4}>
            <Stack spacing={3}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Account Summary
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Member Since
                    </Typography>
                    <Typography variant="body1">
                      January 2024
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Account Status
                    </Typography>
                    <Typography variant="body1" color="success.main">
                      Active
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Last Login
                    </Typography>
                    <Typography variant="body1">
                      {new Date().toLocaleDateString()}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
}