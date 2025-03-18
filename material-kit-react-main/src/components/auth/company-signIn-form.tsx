'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Eye as EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlash as EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { paths } from '@/paths';
import { authClient } from '@/lib/auth/client';
import { useUser } from '@/hooks/use-user';

const schema = zod.object({
  email: zod.string().min(1, { message: 'Email is required' }).email(),
  password: zod.string().min(1, { message: 'Password is required' }),
});

type Values = zod.infer<typeof schema>;

const defaultValues = { email: '', password: '' } satisfies Values;

export function CompanySignInForm(): React.JSX.Element {
  const router = useRouter();
  const { checkSession, setUserType } = useUser();

  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [isPending, setIsPending] = React.useState<boolean>(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      setIsPending(true);

      try {
        console.log('Attempting company login with:', values.email);
        
        const response = await fetch('http://localhost:8000/api/company_login/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            Email: values.email,
            Password: values.password
          }),
        });
        
        const data = await response.json();
        console.log('Login response:', response.status, data);
        
        if (!response.ok) {
          throw new Error(data.error || 'Invalid credentials');
        }
        
        // Store authentication token if provided
        if (data.token) {
          localStorage.setItem('auth-token', data.token);
        }
        
        // Check if this is an admin/employee account or company account
        const userRole = data.role || 'company';
        localStorage.setItem('user-type', userRole);
        localStorage.setItem('company-id', data.id.toString());
        localStorage.setItem('company-name', data.Company_name || '');
        
        await checkSession?.();
        setUserType(userRole);
        
        // Debugging information
        console.log("Paths object:", paths);
        console.log("Admin overview path:", paths.dashboardAdmin?.overview);
        console.log("Company overview path:", paths.dashboardCompany?.overview);
        
        // Direct user to appropriate dashboard based on role with fallbacks
        if (userRole === 'admin' || userRole === 'employee') {
          // Try the path, or use hardcoded fallback
          const adminPath = paths.dashboardAdmin?.overview || '/dashboard-admin';
          console.log("Navigating to admin path:", adminPath);
          router.push(adminPath);
        } else {
          // Try the path, or use hardcoded fallback
          const companyPath = paths.dashboardCompany?.overview || '/dashboard-admin';
          console.log("Navigating to company path:", companyPath);
          router.push(companyPath);
        }
      } catch (error) {
        console.error('Login error:', error);
        
        // Display error to user
        setError('root', { 
          type: 'server', 
          message: error instanceof Error ? error.message : 'Authentication failed' 
        });
        setIsPending(false);
        
        // REMOVE THE FALLBACK MOCK AUTHENTICATION CODE
      }
    },
    [checkSession, router, setError, setUserType]
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
        Company Sign In
      </Typography>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(errors.email)}>
                <InputLabel>Email address</InputLabel>
                <OutlinedInput 
                  {...field} 
                  label="Email address" 
                  type="email" 
                  placeholder="company@example.com"
                />
                {errors.email ? <FormHelperText>{errors.email.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(errors.password)}>
                <InputLabel>Password</InputLabel>
                <OutlinedInput
                  {...field}
                  endAdornment={
                    showPassword ? (
                      <EyeIcon
                        cursor="pointer"
                        fontSize="var(--icon-fontSize-md)"
                        onClick={(): void => {
                          setShowPassword(false);
                        }}
                      />
                    ) : (
                      <EyeSlashIcon
                        cursor="pointer"
                        fontSize="var(--icon-fontSize-md)"
                        onClick={(): void => {
                          setShowPassword(true);
                        }}
                      />
                    )
                  }
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                />
                {errors.password ? <FormHelperText>{errors.password.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don&apos;t have an account?{' '}
              <Link component={RouterLink} href={paths.auth.signUp} underline="hover" fontWeight="medium">
                Sign up
              </Link>
            </Typography>
            <Link component={RouterLink} href={paths.auth.resetPassword} variant="body2" fontWeight="medium">
              Forgot password?
            </Link>
          </Box>
          {errors.root ? <Alert severity="error">{errors.root.message}</Alert> : null}
          <Button 
            disabled={isPending} 
            type="submit" 
            variant="contained" 
            fullWidth
            size="large"
            sx={{ py: 1.2 }}
          >
            {isPending ? 'Signing In...' : 'Sign In'}
          </Button>
        </Stack>
      </form>

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Alert severity="info" sx={{ display: 'inline-flex', textAlign: 'left' }}>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Demo Account:</Typography>
            <Box component="div" sx={{ m: 0 }}>
              <b>Email:</b> company@example.com<br />
              <b>Password:</b> CompanySecret
            </Box>
          </Box>
        </Alert>
      </Box>
    </Box>
  );
}