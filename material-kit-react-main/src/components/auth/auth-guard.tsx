'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { CircularProgress, Box } from '@mui/material';
import { useUser } from '@/contexts/user-context';
import { paths } from '@/paths';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, userType, setUserType, isLoading } = useUser();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Skip authentication check for these public routes
    const publicPaths = [
      paths.auth.signIn,
      paths.auth.signUp,
      paths.auth.resetPassword,
      paths.auth.homepage,
      '/',
      ''
    ];
    
    if (publicPaths.includes(pathname)) {
      setIsChecking(false);
      return;
    }

    // Check if user is authenticated from localStorage
    const storedUserType = localStorage.getItem('userType');
    const storedUserId = localStorage.getItem('userId');
    
    if (storedUserType && storedUserId) {
      // Restore user session from localStorage
      setUserType(storedUserType);
      setIsChecking(false);
    } else {
      // No stored authentication, redirect to login
      console.log('No authentication found, redirecting to login');
      router.push(paths.auth.signIn);
    }
  }, [pathname, router, setUserType]);

  // Show loading while checking authentication
  if (isLoading || isChecking) {
    return (
      <Box
        sx={{
          display: 'flex',
          height: '100vh',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
}
