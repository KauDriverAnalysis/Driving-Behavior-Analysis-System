// src/contexts/UserContext.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type UserType = 'admin' | 'customer' | 'employee' | null;

interface UserContextType {
  userType: UserType;
  setUserType: (type: UserType) => void;
  isEmployee: boolean;
  setIsEmployee: (value: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userType, setUserType] = useState<UserType>(null);
  const [isEmployee, setIsEmployee] = useState<boolean>(false);

  return (
    <UserContext.Provider value={{ userType, setUserType, isEmployee, setIsEmployee }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
}