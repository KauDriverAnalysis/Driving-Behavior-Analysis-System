'use client';

import * as React from 'react';
import { useEffect, useState, useCallback } from 'react';

import type { User } from '@/types/user';
import { authClient } from '@/lib/auth/client';
import { logger } from '@/lib/default-logger';

export interface UserContextValue {
  user: User | null;
  userType: string | null;
  setUserType: (userType: string | null) => void;
  error: string | null;
  isLoading: boolean;
  checkSession?: () => Promise<void>;
}

export const UserContext = React.createContext<UserContextValue | undefined>(undefined);

export interface UserProviderProps {
  children: React.ReactNode;
}

export function UserProvider({ children }: UserProviderProps): React.JSX.Element {
  const [state, setState] = useState<{ user: User | null; error: string | null; isLoading: boolean }>({
    user: null,
    error: null,
    isLoading: true,
  });
  const [userType, setUserTypeState] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted flag on client side
  useEffect(() => {
    setIsMounted(true);
    
    // Try to restore authentication from localStorage on first load
    if (typeof window !== 'undefined') {
      const storedUserType = localStorage.getItem('userType');
      if (storedUserType) {
        setUserTypeState(storedUserType);
      }
    }
  }, []);

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
    
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const { data, error: sessionError } = await authClient.getUser();
      
      if (sessionError) {
        logger.error(sessionError);
        setState(prev => ({ ...prev, user: null, error: 'Session expired', isLoading: false }));
        
        // Clear localStorage on session error
        localStorage.removeItem('userType');
        localStorage.removeItem('userId');
        setUserTypeState(null);
      } else {
        setState(prev => ({ ...prev, user: data ?? null, error: null, isLoading: false }));
        
        // If we have a user but no userType in localStorage, try to get it from the user data
        if (data && !localStorage.getItem('userType') && data.role) {
          setUserType(data.role as string);
        }
      }
    } catch (err) {
      logger.error(err);
      setState(prev => ({ ...prev, user: null, error: 'Something went wrong', isLoading: false }));
    }
  }, [setUserType]);

  useEffect(() => {
    if (isMounted) {
      checkSession().catch(err => {
        logger.error(err);
      });
    }
  }, [checkSession, isMounted]);

  return (
    <UserContext.Provider value={{ ...state, userType, setUserType, checkSession }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = (): UserContextValue => {
  const context = React.useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};