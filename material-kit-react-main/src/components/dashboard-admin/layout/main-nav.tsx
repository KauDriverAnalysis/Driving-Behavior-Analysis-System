'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { paths } from '@/paths';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { List as ListIcon } from '@phosphor-icons/react/dist/ssr/List';
import { SignOut as SignOutIcon } from '@phosphor-icons/react/dist/ssr/SignOut';

import { MobileNav } from './mobile-nav';

export function MainNav(): React.JSX.Element {
  const router = useRouter();
  const [openNav, setOpenNav] = React.useState<boolean>(false);
  
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
    <React.Fragment>
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
          <IconButton
            onClick={(): void => {
              setOpenNav(true);
            }}
            sx={{ display: { lg: 'none' } }}
          >
            <ListIcon />
          </IconButton>

          <Button 
            variant="contained"
            startIcon={<SignOutIcon />}
            onClick={handleSignOut}
            sx={{ 
              ml: 'auto',
              bgcolor: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.dark',
              }
            }}
          >
            Sign Out
          </Button>
        </Stack>
      </Box>
      <MobileNav
        onClose={() => {
          setOpenNav(false);
        }}
        open={openNav}
      />
    </React.Fragment>
  );
}