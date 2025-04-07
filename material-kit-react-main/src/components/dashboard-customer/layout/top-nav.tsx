'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import { NotificationsPopover } from '../notifications/notifications-popover';
import Button from '@mui/material/Button';
import SignOutIcon from '@mui/icons-material/LogoutOutlined';
import { useRouter } from 'next/navigation';

// Styled component definition
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
  color: theme.palette.text.primary,
  [theme.breakpoints.up('lg')]: {
    width: 'calc(100% - 280px)',
    marginLeft: 280,
  },
  zIndex: theme.zIndex.drawer - 1 // Ensure SideNav appears above TopNav
}));

// Interface definition
export interface TopNavProps {
  onNavOpen?: () => void;
}

export function TopNav({ onNavOpen }: TopNavProps): React.JSX.Element {
  // Updated sign-out handler to match the working implementation
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
    <StyledAppBar position="fixed">
      <Toolbar
        sx={{
          minHeight: 64,
          px: { xs: 2, sm: 3 },
          justifyContent: 'flex-end' // Align items to the right
        }}
      >
        <IconButton
          onClick={onNavOpen}
          sx={{ display: { lg: 'none' }, mr: 'auto' }}
        >
          <MenuIcon />
        </IconButton>
        
        {/* Only show the logo on mobile when side nav is hidden */}
        <Box
          component="img"
          src="/assets/logos/logo.svg"
          sx={{
            height: 40,
            display: { xs: 'block', lg: 'none' },
            mr: 'auto'
          }}
        />

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <NotificationsPopover />
          <Button 
            variant="contained"
            startIcon={<SignOutIcon />}
            onClick={handleSignOut}
            sx={{ 
              ml: 2,
              bgcolor: 'primary.main',
              fontWeight: 600,
              boxShadow: 'none',
              '&:hover': {
                bgcolor: 'primary.dark',
                boxShadow: 'none'
              }
            }}
          >
            Sign Out
          </Button>
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
}