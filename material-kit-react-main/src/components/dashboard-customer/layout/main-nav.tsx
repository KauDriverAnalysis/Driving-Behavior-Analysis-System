'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import SignOutIcon from '@mui/icons-material/LogoutOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import { useRouter } from 'next/navigation';
import { paths } from '@/paths';
import { NotificationsPopover } from '../notifications/notifications-popover';

interface MainNavProps {
  onNavOpen?: () => void;
}

export function MainNav({ onNavOpen }: MainNavProps): React.JSX.Element {
  const router = useRouter();
  
  const handleSignOut = (): void => {
    // Clear all user data from localStorage
    localStorage.clear();
    // Redirect to login page
    router.push(paths.auth.login);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flex: '1 1 auto',
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
          ml: 'auto' // Push to the right
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
            fontWeight: 600,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none'
            }
          }}
        >
          Sign Out
        </Button>
      </Stack>
    </Box>
  );
}