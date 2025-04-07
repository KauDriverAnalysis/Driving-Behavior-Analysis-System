'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { SideNav } from '@/components/dashboard-customer/layout/side-nav';
import { TopNav } from '@/components/dashboard-customer/layout/top-nav';
import { AuthGuard } from '@/guards/auth-guard';
import { NotificationsProvider } from '@/contexts/notifications-context';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps): React.JSX.Element {
  const [openNav, setOpenNav] = React.useState(false);

  return (
    <AuthGuard>
      <NotificationsProvider>
        <Box component="main" sx={{ display: 'flex' }}>
          <TopNav onNavOpen={(): void => setOpenNav(true)} />
          <SideNav onClose={(): void => setOpenNav(false)} open={openNav} />
          <Box
            sx={{
              flexGrow: 1,
              pt: 8,
              pb: 8,
              overflow: 'auto'
            }}
          >
            <Container maxWidth="xl" sx={{ pt: 3 }}>
              {children}
            </Container>
          </Box>
        </Box>
      </NotificationsProvider>
    </AuthGuard>
  );
}
