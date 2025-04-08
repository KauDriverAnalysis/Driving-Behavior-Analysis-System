'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { paths } from '@/paths';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import MenuIcon from '@mui/icons-material/Menu';
import SignOutIcon from '@mui/icons-material/LogoutOutlined';
import { NotificationsPopover } from '../notifications/notifications-popover';

interface MainNavProps {
  onNavOpen?: () => void;
}

export function MainNav({ onNavOpen }: MainNavProps): React.JSX.Element {
  const router = useRouter();
  
  const handleSignOut = async () => {
    try {
      console.log('Starting sign out...');
      localStorage.clear();
      sessionStorage.clear();
      console.log('Storage cleared');
      
      // Use window.location.href instead of router.push for a full page refresh
      window.location.href = '/auth/sign-in';
    } catch (error) {
      console.error('Sign out failed:', error);
      window.location.href = '/auth/sign-in';
    }
  };
  
  return (
    <Box
      component="header"
      sx={{
        borderBottom: '1px solid var(--mui-palette-divider)',
        backgroundColor: 'var(--mui-palette-background-paper)',
        position: 'sticky',
        top: 0,
        zIndex: 'var(--mui-zIndex-appBar)',
      }}
    >
      <Stack
        direction="row"
        spacing={2}
        sx={{ 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          minHeight: '64px', 
          px: 2 
        }}
      >
        {/* Left side menu icon (for mobile nav) */}
        <IconButton
          onClick={onNavOpen}
          sx={{ display: { lg: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        
        <Stack
          direction="row"
          spacing={2}
          sx={{
            alignItems: 'center',
            ml: 'auto' // Push everything to the right
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NotificationsPopover />
          </Box>

          <Button 
            variant="contained"
            startIcon={<SignOutIcon />}
            onClick={handleSignOut}
            sx={{ 
              bgcolor: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.dark',
              }
            }}
          >
            Sign Out
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}