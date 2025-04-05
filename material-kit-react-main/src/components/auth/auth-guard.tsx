'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { CircularProgress, Box } from '@mui/material';
import { useUser } from '@/hooks/use-user';
import { paths } from '@/paths';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { userType, setUserType, isLoading } = useUser();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Define truly public paths that don't require authentication
    const publicPaths = [
      paths.auth.signIn,
      paths.auth.signUp, 
      paths.auth.resetPassword,
      paths.auth.homepage, // Make sure homepage is here
      '/',
      '',
    ];
    
    // Special case for the homepage path
    if (pathname === paths.auth.homepage || pathname === '/auth/homepage') {
      setIsChecking(false);
      return;
    }
    
    // Skip authentication check for public routes
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
      // Check if we're on a dashboard path but not authenticated
      if (pathname.includes('/dashboard-')) {
        // Redirect to login only if trying to access a protected dashboard
        console.log('No authentication found, redirecting to login');
        router.push(paths.auth.signIn);
      } else {
        // For other paths, don't redirect
        setIsChecking(false);
      }
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
