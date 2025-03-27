'use client';

import * as React from 'react';
import { createContext, useState, useEffect } from 'react';

import type { User } from '@/types/user';
import { authClient } from '@/lib/auth/client';
import { logger } from '@/lib/default-logger';

export interface UserContextType {
  user: any | null;
  userType: string | null;
  error: Error | null;
  isLoading: boolean;
  setUserType: (type: string | null) => void;
  checkSession?: () => Promise<void>;
  // Other properties your context has...
}

// Create and export the context
export const UserContext = createContext<UserContextType | undefined>(undefined);

export interface UserProviderProps {
  children: React.ReactNode;
}

export function UserProvider({ children }: UserProviderProps): React.JSX.Element {
  const [user, setUser] = useState<any | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // Initialize userType from localStorage
  const [userType, setUserTypeState] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userType');
    }
    return null;
  });

  // Function to update userType in both state and localStorage
  const setUserType = (type: string | null) => {
    setUserTypeState(type);
    if (type) {
      localStorage.setItem('userType', type);
    } else {
      localStorage.removeItem('userType');
    }
  };

  const checkSession = React.useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const { data, error: apiError } = await authClient.getUser();

      if (apiError) {
        setError(new Error(apiError));
        setUser(null);
        return;
      }

      setUser(data ?? null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession().catch((err: unknown) => {
      logger.error(err);
      // noop
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Expected
  }, []);

  return (
    <UserContext.Provider value={{ 
      user, 
      userType, 
      setUserType, 
      checkSession,
      error,
      isLoading
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const context = React.useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
}