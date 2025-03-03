// src/lib/userRole.ts

type UserRole = 'admin' | 'customer' | 'employee' | null;

export const setUserRole = (role: UserRole): void => {
  if (typeof window !== 'undefined') {
    // Ensure we're in the browser environment
    localStorage.setItem('userRole', role || '');
  }
};

export const getUserRole = (): UserRole => {
  if (typeof window !== 'undefined') {
    const role = localStorage.getItem('userRole');
    if (role === 'admin' || role === 'customer' || role === 'employee') {
      return role;
    }
  }
  return null;
};

export const clearUserRole = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('userRole');
  }
};