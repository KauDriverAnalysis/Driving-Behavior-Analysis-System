'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import GlobalStyles from '@mui/material/GlobalStyles';
import { SideNav } from '@/components/dashboard-customer/layout/side-nav';
import { MainNav } from '@/components/dashboard-customer/layout/main-nav';
import { MobileNav } from '@/components/dashboard-customer/layout/mobile-nav';
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
              '--MainNav-height': '64px',
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
          <SideNav />
          <MobileNav open={openNav} onClose={(): void => setOpenNav(false)} />
          <Box sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column', pl: { lg: 'var(--SideNav-width)' } }}>
            <MainNav onNavOpen={(): void => setOpenNav(true)} />
            <main>
              <Container 
                maxWidth="xl" 
                sx={{ 
                  pt: 'calc(var(--MainNav-height) + 16px)', // Increased top padding to account for TopNav
                  pb: 4, // Reduced bottom padding to 32px (4*8px)
                  px: { xs: 2, sm: 3 },
                  position: 'relative', // Ensure proper stacking context
                  zIndex: 1 // Lower than TopNav z-index
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