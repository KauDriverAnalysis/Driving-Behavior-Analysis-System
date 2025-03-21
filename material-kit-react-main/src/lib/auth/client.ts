'use client';
import type { User } from '@/types/user';

function generateToken(): string {
  const arr = new Uint8Array(12);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, (v) => v.toString(16).padStart(2, '0')).join('');
}

const user = {
  id: 'USR-000',
  avatar: '/assets/avatar.png',
  firstName: 'Sofia',
  lastName: 'Rivers',
  email: 'sofia@devias.io',
} satisfies User;

export interface SignUpParams {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface SignInWithOAuthParams {
  provider: 'google' | 'discord';
}

export interface SignInWithPasswordParams {
  email: string;
  password: string;
  accountType?: string;
}

export interface ResetPasswordParams {
  email: string;
}

class AuthClient {
  async signUp(_: SignUpParams): Promise<{ error?: string }> {
    const token = generateToken();
    localStorage.setItem('custom-auth-token', token);
    return {};
  }

  async signInWithOAuth(_: SignInWithOAuthParams): Promise<{ error?: string }> {
    return { error: 'Social authentication not implemented' };
  }

  async signInWithPassword(params: SignInWithPasswordParams): Promise<{ userId?: string; userType?: string; error?: string }> {
    const { email, password, accountType = 'customer' } = params;

    try {
      // Determine which API endpoint to use based on accountType
      let endpoint = 'http://localhost:8000/api/';
      
      if (accountType === 'company') {
        endpoint += 'company_login/';
      } else if (accountType === 'customer') {
        endpoint += 'customer_login/'; 
      } else if (accountType === 'admin') {
        endpoint += 'admin_login/';
      } else if (accountType === 'employee') {
        endpoint += 'employee_login/';
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Email: email,
          Password: password
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { error: data.error || 'Authentication failed' };
      }
      
      // Store authentication token
      if (data.token) {
        localStorage.setItem('auth-token', data.token);
      }
      
      // Determine user role from response
      const userRole = data.role || accountType;
      const userId = data.id?.toString() || '';
      
      localStorage.setItem('user-type', userRole);
      localStorage.setItem('user-id', userId);
      
      // Store additional info based on account type
      if (accountType === 'company') {
        localStorage.setItem('company-id', userId);
        localStorage.setItem('company-name', data.Company_name || '');
      } else if (accountType === 'customer') {
        localStorage.setItem('customer-id', userId);
        localStorage.setItem('customer-name', data.Name || '');
      }
      
      console.log(`User logged in - ID: ${userId}, Type: ${userRole}`);
      
      return { 
        userId: userId,
        userType: userRole, 
        error: null 
      };
    } catch (error) {
      console.error('Authentication error:', error);
      return { error: 'Connection error. Please try again later.' };
    }
  }

 
  async resetPassword(params: ResetPasswordParams): Promise<{ error?: string; success?: boolean }> {
    const { email } = params;
    
    try {
      const response = await fetch('http://localhost:8000/api/reset_password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Change from 'email' to 'email' to match what the backend expects
        body: JSON.stringify({ email }),
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        return { error: data.error || 'Password reset request failed' };
      }
      
      return { 
        success: true
      };
    } catch (error) {
      console.error('Password reset error:', error);
      return { error: 'Connection error. Please try again later.' };
    }
  }

  
  async updatePassword(params: UpdatePasswordParams): Promise<{ error?: string; success?: boolean }> {
    const { email, token, newPassword } = params;
    
    try {
      console.log(`Attempting to reset password for ${email} with token ${token.substring(0, 6)}...`);
      
      const response = await fetch('http://localhost:8000/api/update_password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          token,
          new_password: newPassword
        }),
      });
  
      const data = await response.json();
      
      console.log('Password reset response:', response.status, data);
      
      if (!response.ok) {
        return { error: data.error || 'Password update failed' };
      }
      
      return { 
        success: true
      };
    } catch (error) {
      console.error('Password update error:', error);
      return { error: 'Connection error. Please try again later.' };
    }
  }

  async getUser(): Promise<{ data?: User | null; error?: string }> {
    // Change this line to check for auth-token instead of custom-auth-token
    const token = localStorage.getItem('auth-token');
    if (!token) {
      return { data: null };
    }
    
    // Get user information from localStorage
    const userType = localStorage.getItem('user-type');
    const userId = localStorage.getItem('user-id');
    
    // Create a user object with data from localStorage
    const userData = {
      id: userId || 'USR-000',
      userType: userType || 'guest',
      // Include other user fields as needed
      ...user // Keep the default avatar, etc.
    };
    
    return { data: userData };
  }

  async signOut(): Promise<{ error?: string }> {
    // Make sure to clear all auth related items
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user-type');
    localStorage.removeItem('user-id');
    localStorage.removeItem('company-id');
    localStorage.removeItem('company-name');
    localStorage.removeItem('customer-id');
    localStorage.removeItem('customer-name');
    return {};
  }
}

export const authClient = new AuthClient();