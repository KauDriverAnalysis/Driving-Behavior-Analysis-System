'use client';

import * as React from 'react';
import { createContext, useState, useEffect } from 'react';

import type { User } from '@/types/user';
import { authClient } from '@/lib/auth/client';
import { logger } from '@/lib/default-logger';

interface UserContextType {
  user: any | null;
  userType: string | null;
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
    try {
      const { data, error } = await authClient.getUser();

      if (error) {
        logger.error(error);
        setUser(null);
        return;
      }

      setUser(data ?? null);
    } catch (err) {
      logger.error(err);
      setUser(null);
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
      checkSession 
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