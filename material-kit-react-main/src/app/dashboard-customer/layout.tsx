'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { SideNav } from '@/components/dashboard-customer/layout/side-nav';
import { TopNav } from '@/components/dashboard-customer/layout/top-nav.tsx';
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
        <Box component="main" sx={{ display: 'flex' }}>
          <SideNav onClose={(): void => setOpenNav(false)} open={openNav} />
          <Box
            sx={{
              flexGrow: 1,
              paddingLeft: { xs: 0, lg: '280px' }, // Add padding equal to SideNav width on large screens
              width: { xs: '100%', lg: 'calc(100% - 280px)' }, // Adjust width to account for SideNav
              ml: { xs: 0, lg: 'auto' }, // Auto margin on large screens
              minHeight: '100vh'
            }}
          >
            <TopNav onNavOpen={(): void => setOpenNav(true)} />
            <Box
              sx={{
                pt: 8, // Padding to account for the TopNav height
                pb: 8,
                overflow: 'hidden' // Prevent horizontal scrolling
              }}
            >
              <Container 
                maxWidth="xl" 
                sx={{ 
                  pt: 3,
                  px: { xs: 2, sm: 3 } // Responsive horizontal padding
                }}
              >
                {children}
              </Container>
            </Box>
          </Box>
        </Box>
      </NotificationsProvider>
    </AuthGuard>
  );
}
