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

// Company schema
const companySchema = zod.object({
  companyName: zod.string().min(1, { message: 'Company name is required' }),
  contactNumber: zod.string()
    .min(1, { message: 'Contact number is required' })
    .regex(/^(?:\+966|05)\d{8}$/, { message: 'Invalid phone number format for Saudi Arabia' }),
  email: zod.string().min(1, { message: 'Email is required' }).email(),
  location: zod.string().min(1, { message: 'Location is required' }),
  password: zod.string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
  confirmPassword: zod.string().min(1, { message: 'Confirm password is required' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type CompanyValues = zod.infer<typeof companySchema>;

const defaultCompanyValues = {
  companyName: '',
  contactNumber: '',
  email: '',
  location: '',
  password: '',
  confirmPassword: '',
};

export function CompanySignUpForm(): React.JSX.Element {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [companyShowPassword, setCompanyShowPassword] = React.useState<boolean>(false);
  const [companyShowConfirmPassword, setCompanyShowConfirmPassword] = React.useState<boolean>(false);

  const companyForm = useForm<CompanyValues>({
    defaultValues: defaultCompanyValues,
    resolver: zodResolver(companySchema),
  });

  const onSubmitCompany = React.useCallback(
    async (values: CompanyValues): Promise<void> => {
      setIsPending(true);
  
      try {
        const response = await fetch('http://localhost:8000/api/create_company/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            Company_name: values.companyName,
            Contact_number: values.contactNumber,
            Email: values.email,
            location: values.location,
            Password: values.password,
          }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          // Handle validation errors more specifically
          if (data.errors) {
            // Display specific field errors if available
            const errorMessage = Object.entries(data.errors)
              .map(([field, errors]) => `${field}: ${errors}`)
              .join('\n');
            throw new Error(errorMessage || 'Validation failed');
          }
          throw new Error(data.error || 'Failed to register');
        }

        // Add success message before redirect
        console.log('Registration successful:', data.message);
        router.push(paths.auth.signIn);
      } catch (error) {
        companyForm.setError('root', { 
          message: error instanceof Error ? error.message : 'Registration failed' 
        });
        setIsPending(false);
      }
    },
    [router, companyForm]
  );

  return (
    <Box sx={{ width: '100%', maxWidth: '450px' }}>
      <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>Create Company Account</Typography>
      
      <form onSubmit={companyForm.handleSubmit(onSubmitCompany)}>
        <Stack spacing={2.5}>
          <Controller
            control={companyForm.control}
            name="companyName"
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(companyForm.formState.errors.companyName)}>
                <InputLabel>Company Name</InputLabel>
                <OutlinedInput {...field} label="Company Name" />
                {companyForm.formState.errors.companyName ? (
                  <FormHelperText>{companyForm.formState.errors.companyName.message}</FormHelperText>
                ) : null}
              </FormControl>
            )}
          />

          <Controller
            control={companyForm.control}
            name="contactNumber"
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(companyForm.formState.errors.contactNumber)}>
                <InputLabel>Contact Number</InputLabel>
                <OutlinedInput {...field} label="Contact Number" placeholder="+966XXXXXXXX or 05XXXXXXXX" />
                {companyForm.formState.errors.contactNumber ? (
                  <FormHelperText>{companyForm.formState.errors.contactNumber.message}</FormHelperText>
                ) : null}
              </FormControl>
            )}
          />

          <Controller
            control={companyForm.control}
            name="email"
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(companyForm.formState.errors.email)}>
                <InputLabel>Email Address</InputLabel>
                <OutlinedInput {...field} label="Email Address" type="email" />
                {companyForm.formState.errors.email ? (
                  <FormHelperText>{companyForm.formState.errors.email.message}</FormHelperText>
                ) : null}
              </FormControl>
            )}
          />

          <Controller
            control={companyForm.control}
            name="location"
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(companyForm.formState.errors.location)}>
                <InputLabel>Location</InputLabel>
                <OutlinedInput {...field} label="Location" />
                {companyForm.formState.errors.location ? (
                  <FormHelperText>{companyForm.formState.errors.location.message}</FormHelperText>
                ) : null}
              </FormControl>
            )}
          />

          <Controller
            control={companyForm.control}
            name="password"
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(companyForm.formState.errors.password)}>
                <InputLabel>Password</InputLabel>
                <OutlinedInput
                  {...field}
                  endAdornment={
                    companyShowPassword ? (
                      <EyeIcon
                        cursor="pointer"
                        fontSize="var(--icon-fontSize-md)"
                        onClick={(): void => setCompanyShowPassword(false)}
                      />
                    ) : (
                      <EyeSlashIcon
                        cursor="pointer"
                        fontSize="var(--icon-fontSize-md)"
                        onClick={(): void => setCompanyShowPassword(true)}
                      />
                    )
                  }
                  label="Password"
                  type={companyShowPassword ? 'text' : 'password'}
                />
                {companyForm.formState.errors.password ? (
                  <FormHelperText>{companyForm.formState.errors.password.message}</FormHelperText>
                ) : null}
              </FormControl>
            )}
          />

          <Controller
            control={companyForm.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(companyForm.formState.errors.confirmPassword)}>
                <InputLabel>Confirm Password</InputLabel>
                <OutlinedInput
                  {...field}
                  endAdornment={
                    companyShowConfirmPassword ? (
                      <EyeIcon
                        cursor="pointer"
                        fontSize="var(--icon-fontSize-md)"
                        onClick={(): void => setCompanyShowConfirmPassword(false)}
                      />
                    ) : (
                      <EyeSlashIcon
                        cursor="pointer"
                        fontSize="var(--icon-fontSize-md)"
                        onClick={(): void => setCompanyShowConfirmPassword(true)}
                      />
                    )
                  }
                  label="Confirm Password"
                  type={companyShowConfirmPassword ? 'text' : 'password'}
                />
                {companyForm.formState.errors.confirmPassword ? (
                  <FormHelperText>{companyForm.formState.errors.confirmPassword.message}</FormHelperText>
                ) : null}
              </FormControl>
            )}
          />

          {companyForm.formState.errors.root ? (
            <Alert severity="error">{companyForm.formState.errors.root.message}</Alert>
          ) : null}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link component={RouterLink} href={paths.auth.signIn} underline="hover" fontWeight="medium">
                Sign in
              </Link>
            </Typography>
          </Box>

          <Button 
            disabled={isPending} 
            type="submit" 
            variant="contained" 
            fullWidth
            size="large"
            sx={{ py: 1.2, mt: 1 }}
          >
            {isPending ? 'Creating Account...' : 'Sign Up'}
          </Button>

          
        </Stack>
      </form>
    </Box>
  );
}