'use client';
import type { User } from '@/types/user';

// Define interfaces for API responses
interface AuthResponse {
  token?: string;
  userType?: string;
  userId?: string | number;
  id?: string | number;
  role?: string;
  Admin?: boolean | string;
  Company_name?: string;
  Name?: string;
  name?: string;
  company_id?: string | number;
  error?: string;
}

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

export interface UpdatePasswordParams {
  email: string;
  token: string;
  newPassword: string;
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

  async signInWithPassword(params: SignInWithPasswordParams): Promise<{ userId?: string; userType?: string; error?: string | null }> {
    const { email, password, accountType = 'customer' } = params;

    try {
      // Determine which API endpoint to use based on accountType
      let endpoint = 'https://driving-behavior-analysis-system.onrender.com/api/';
      
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

      const data = await response.json() as AuthResponse;
      
      if (!response.ok) {
        return { error: data.error || 'Authentication failed' };
      }
      
      // Store authentication token
      if (data.token) {
        localStorage.setItem('auth-token', data.token);
      }
      
      // Debug the raw response data to diagnose issues
      // Remove console.log for production
      
      // Store the user type and user ID directly from the response
      if (data.userType && data.userId) {
        localStorage.setItem('userType', data.userType);
        localStorage.setItem('userId', String(data.userId));
      }
      
      // Determine user role from response
      let userRole = data.role || accountType;
      const userId = data.id ? String(data.id) : '';
      
      // Check if this is an employee with admin privileges
      const isAdmin = 
        userRole === 'admin' || 
        data.role === 'admin' || 
        data.Admin === true || 
        (typeof data.Admin === 'string' && data.Admin.toLowerCase() === 'true');
      
      // If admin, ensure role is set correctly
      if (isAdmin) {
        userRole = 'admin';
        localStorage.setItem('is-admin', 'true');
        // Remove console.log for production
      }
      
      // Store consistent role information
      localStorage.setItem('user-type', userRole);
      localStorage.setItem('userType', userRole); // Make these consistent
      localStorage.setItem('user-id', userId);
      
      // Store additional info based on account type
      if (accountType === 'company') {
        localStorage.setItem('company-id', userId);
        localStorage.setItem('company-name', data.Company_name || '');
      } else if (accountType === 'customer') {
        localStorage.setItem('customer-id', userId);
        localStorage.setItem('customer-name', data.Name || '');
      } else if (isAdmin) {
        // Add these explicit admin keys
        localStorage.setItem('admin-id', userId);
        localStorage.setItem('is-admin', 'true'); // Ensure this is set
        localStorage.setItem('admin-name', data.name || '');
        
        // Also ensure employee data is stored for admin users
        localStorage.setItem('employee-id', userId);
        // Remove console.log for production
      } else if (accountType === 'employee') {
        localStorage.setItem('employee-id', userId);
        localStorage.setItem('employee-name', data.name || '');
        
        // Store the company ID if available
        if (data.company_id) {
          localStorage.setItem('employee-company-id', String(data.company_id));
          // Remove console.log for production
        }
      }
      
      // In your login success handler:
      if (data.company_id) {
        localStorage.setItem('employee-company-id', String(data.company_id));
        // Also store it under a few alternative keys to be safe
        localStorage.setItem('companyId', String(data.company_id));
        localStorage.setItem('company_id', String(data.company_id));
        // Remove console.log for production
      }
      
      if (data.role === 'admin' || data.userType === 'admin') {
        localStorage.setItem('is-admin', 'true');
        localStorage.setItem('userType', 'admin');
        localStorage.setItem('user-type', 'admin');
      }
      
      // ...inside AuthClient.signInWithPassword, after a successful company login:
      if (accountType === 'company' || userRole === 'admin') {
        // Store company ID under all possible keys
        localStorage.setItem('company-id', userId);
        localStorage.setItem('company_id', userId);
        localStorage.setItem('companyId', userId);
        localStorage.setItem('userId', userId); // For consistency
        // Optionally, store company name if available
        if (data.Company_name) {
          localStorage.setItem('company-name', data.Company_name);
        }
      }
      
      // Remove console.log for production
      
      // Return consistent userType
      return { 
        userId,
        userType: userRole,
        error: null 
      };
    } catch (error) {
      // Remove console.error for production
      return { 
        error: 'Connection error. Please try again later.',
        userId: undefined,
        userType: undefined
      };
    }
  }
 
  async resetPassword(params: ResetPasswordParams): Promise<{ error?: string; success?: boolean }> {
    const { email } = params;
    
    try {
      const response = await fetch('https://driving-behavior-analysis-system.onrender.com/api/reset_password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Change from 'email' to 'email' to match what the backend expects
        body: JSON.stringify({ email }),
      });
  
      const data = await response.json() as { error?: string };
      
      if (!response.ok) {
        return { error: data.error || 'Password reset request failed' };
      }
      
      return { 
        success: true
      };
    } catch (error) {
      // Remove console.error for production
      return { error: 'Connection error. Please try again later.' };
    }
  }

  
  async updatePassword(params: UpdatePasswordParams): Promise<{ error?: string; success?: boolean }> {
    const { email, token, newPassword } = params;
    
    try {
      // Remove console.log for production
      
      const response = await fetch('https://driving-behavior-analysis-system.onrender.com/api/update_password/', {
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
  
      const data = await response.json() as { error?: string };
      
      // Remove console.log for production
      
      if (!response.ok) {
        return { error: data.error || 'Password update failed' };
      }
      
      return { 
        success: true
      };
    } catch (error) {
      // Remove console.error for production
      return { error: 'Connection error. Please try again later.' };
    }
  }

  async getUser(): Promise<{ data?: User | null; error?: string }> {
    // Add debug logging - Remove for production
    /* 
    console.log('Auth Debug - User information:');
    console.log('auth-token:', localStorage.getItem('auth-token'));
    console.log('user-type:', localStorage.getItem('user-type'));
    console.log('userType:', localStorage.getItem('userType'));
    console.log('role from login:', localStorage.getItem('userType'));
    console.log('is-admin flag:', localStorage.getItem('is-admin'));
    */
    
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
      ...user, // Spread default values first
      id: userId || user.id || 'USR-000', // Override with localStorage value if available
      userType: userType || 'guest',
    };
    
    return { data: userData };
  }

  async signOut(): Promise<{ error?: string }> {
    // Clear all auth related items
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user-type');
    localStorage.removeItem('user-id');
    localStorage.removeItem('userType');
    localStorage.removeItem('userId');
    localStorage.removeItem('company-id');
    localStorage.removeItem('company-name');
    localStorage.removeItem('customer-id');
    localStorage.removeItem('customer-name');
    localStorage.removeItem('employee-id');
    localStorage.removeItem('is-admin');
    return {};
  }
}

export const authClient = new AuthClient();