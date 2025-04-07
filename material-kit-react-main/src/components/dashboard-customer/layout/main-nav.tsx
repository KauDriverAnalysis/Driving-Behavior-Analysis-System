'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import SignOutIcon from '@mui/icons-material/LogoutOutlined';
import ListIcon from '@mui/icons-material/FormatListBulleted';
import { useRouter } from 'next/navigation';
import { NavItems } from './nav-items';
import { paths } from '@/paths';
import { navItems } from './config';
import { NotificationsPopover } from '../notifications/notifications-popover';

const MainNavDesktop = styled(Box)(({ theme }) => ({
  display: 'none',
  [theme.breakpoints.up('lg')]: {
    display: 'flex',
    flex: '1 1 auto',
    marginLeft: 'auto'
  }
}));

const MainNavMobile = styled(Drawer)(({ theme }) => ({
  [theme.breakpoints.up('lg')]: {
    display: 'none'
  }
}));

export function MainNav(): React.JSX.Element {
  const router = useRouter();
  const [openNav, setOpenNav] = useState(false);
  
  const handleSignOut = (): void => {
    // Clear all user data from localStorage
    localStorage.clear();
    // Redirect to login page
    router.push(paths.auth.login);
  };

  return (
    <>
      <MainNavDesktop>
        <NavItems items={navItems} />
      </MainNavDesktop>

      <MainNavMobile
        anchor="right"
        onClose={(): void => { setOpenNav(false); }}
        open={openNav}
        variant="temporary"
        PaperProps={{ sx: { width: 256 } }}
      >
        <Box sx={{ p: 2 }}>
          <NavItems items={navItems} />
        </Box>
      </MainNavMobile>

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
        <IconButton
          onClick={(): void => {
            setOpenNav(true);
          }}
          sx={{ display: { lg: 'none' } }}
        >
          <ListIcon />
        </IconButton>

        <Stack
          direction="row"
          spacing={2}
          sx={{
            ml: 'auto',
            alignItems: 'center'
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
    </>
  );
}