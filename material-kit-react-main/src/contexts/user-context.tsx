'use client';

import * as React from 'react';
import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { authClient } from '@/lib/auth/client';

export interface UserContextType {
  user: any | null;
  userType: string | null;
  setUserType: (type: string | null) => void;
  checkSession?: () => Promise<void>;
  error?: string | null;
  isLoading?: boolean;
}

// Create and export the context
export const UserContext = createContext<UserContextType | undefined>(undefined);

export interface UserProviderProps {
  children: React.ReactNode;
}

export function UserProvider({ children }: UserProviderProps): React.JSX.Element {
  const [user, setUser] = useState<any | null>(null);
  const [userType, setUserTypeState] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  const [state, setState] = useState('loading');
  const [auth, setAuth] = useState(null);

  // Use useEffect to handle localStorage operations after component mount
  useEffect(() => {
    setIsMounted(true);
    // Try to get userType from localStorage on mount
    const storedUserType = typeof window !== 'undefined' ? localStorage.getItem('userType') : null;
    if (storedUserType) {
      setUserTypeState(storedUserType);
    }
  }, []);

  // Safe localStorage wrapper function
  const setUserType = useCallback((type: string | null): void => {
    setUserTypeState(type);
    
    // Only access localStorage when in browser environment and component is mounted
    if (typeof window !== 'undefined' && isMounted) {
      if (type) {
        localStorage.setItem('userType', type);
      } else {
        localStorage.removeItem('userType');
      }
    }
  }, [isMounted]);

  const checkSession = useCallback(async (): Promise<void> => {
    if (typeof window === 'undefined') return; // Skip on server
    
    setIsLoading(true);
    try {
      const { data, error: sessionError } = await authClient.getUser();
      if (sessionError) {
        setError(sessionError);
        setUser(null);
      } else {
        setUser(data);
        if (data?.userType && typeof data.userType === 'string') {
          setUserType(data.userType);
        } else {
          setUserType(null);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [setUserType]);

  // Memoize the context value
  const value = useMemo(() => ({
    user,
    userType,
    setUserType,
    checkSession,
    error,
    isLoading
  }), [user, userType, setUserType, checkSession, error, isLoading]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

// Custom hook for accessing the user context
export function useUserContext() {
  const context = useContext(UserContext);
  
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  
  return context;
}