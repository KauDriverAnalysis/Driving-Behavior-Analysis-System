'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import GlobalStyles from '@mui/material/GlobalStyles';
import { SideNav } from '@/components/dashboard-customer/layout/side-nav';
import { TopNav } from '@/components/dashboard-customer/layout/top-nav';
import { AuthGuard } from '@/components/auth/auth-guard';
import { NotificationsProvider } from '@/contexts/notifications-context';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps): React.JSX.Element {
  const [openNav, setOpenNav] = React.useState(false);

  return (
    <AuthGuard>
      <NotificationsProvider>
        {/* Add GlobalStyles to match admin dashboard */}
        <GlobalStyles
          styles={{
            body: {
              '--MainNav-height': '56px',
              '--MainNav-zIndex': 1000,
              '--SideNav-width': '280px',
              '--SideNav-zIndex': 1100,
              '--MobileNav-width': '320px',
              '--MobileNav-zIndex': 1100,
            },
          }}
        />
        <Box
          sx={{
            bgcolor: 'var(--mui-palette-background-default)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            minHeight: '100%',
          }}
        >
          <SideNav onClose={(): void => setOpenNav(false)} open={openNav} />
          <Box sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column', pl: { lg: 'var(--SideNav-width)' } }}>
            <TopNav onNavOpen={(): void => setOpenNav(true)} />
            <main>
              <Container 
                maxWidth="xl" 
                sx={{ 
                  py: '64px',
                  px: { xs: 2, sm: 3 }
                }}
              >
                {children}
              </Container>
            </main>
          </Box>
        </Box>
      </NotificationsProvider>
    </AuthGuard>
  );
}
