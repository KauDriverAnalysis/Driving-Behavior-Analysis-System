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
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { Eye as EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlash as EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { paths } from '@/paths';

// Customer schema
const customerSchema = zod.object({
  name: zod.string().min(1, { message: 'Name is required' }),
  gender: zod.enum(['male', 'female'], { required_error: 'Gender is required' }),
  phone_number: zod.string()
    .min(1, { message: 'Phone number is required' })
    .regex(/^(?:\+966|05)\d{8}$/, { message: 'Invalid phone number format for Saudi Arabia' }),
  address: zod.string().optional(),
  email: zod.string().min(1, { message: 'Email is required' }).email(),
  password: zod.string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
  confirm_password: zod.string().min(1, { message: 'Confirm password is required' }),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
});

type CustomerValues = zod.infer<typeof customerSchema>;

const defaultCustomerValues: CustomerValues = {
  name: '',
  gender: 'male' as 'male' | 'female', // Specify a valid default value
  phone_number: '',
  address: '',
  email: '',
  password: '',
  confirm_password: '',
};

export function CustomerSignUpForm(): React.JSX.Element {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [customerShowPassword, setCustomerShowPassword] = React.useState<boolean>(false);
  const [customerShowConfirmPassword, setCustomerShowConfirmPassword] = React.useState<boolean>(false);

  const customerForm = useForm<CustomerValues>({
    defaultValues: defaultCustomerValues,
    resolver: zodResolver(customerSchema),
  });

  const onSubmitCustomer = React.useCallback(
    async (values: CustomerValues): Promise<void> => {
      setIsPending(true);

      try {
        console.log("Submitting customer data:", values);
        
        const response = await fetch('https://driving-behavior-analysis-system.onrender.com/api/create_customer/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            Name: values.name,
            gender: values.gender,
            phone_number: values.phone_number,
            address: values.address || '',
            Email: values.email,
            Password: values.password,
          }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          console.error("Registration error:", data);
          
          // Handle specific field errors if provided by the backend
          if (data.errors) {
            // Process server-side validation errors
            Object.entries(data.errors).forEach(([field, message]) => {
              // Map Django field names to React form field names
              const fieldMap: Record<string, keyof CustomerValues> = {
                'Name': 'name',
                'gender': 'gender',
                'phone_number': 'phone_number',
                'address': 'address',
                'Email': 'email',
                'Password': 'password',
              };
              
              const formField = fieldMap[field] || field.toLowerCase() as keyof CustomerValues;
              
              customerForm.setError(formField, {
                type: 'server',
                message: Array.isArray(message) ? message[0] : String(message)
              });
            });
            
            throw new Error("Validation failed. Please check the form for errors.");
          }
          
          throw new Error(data.errors || 'Failed to register');
        }

        console.log("Registration successful:", data);
        
        // Add a success message before redirect
        alert("Account created successfully! Please sign in.");
        
        // Redirect to sign in page
        router.push(paths.auth.signIn);
      } catch (error) {
        customerForm.setError('root', { 
          message: error instanceof Error ? error.message : 'Registration failed' 
        });
        setIsPending(false);
      }
    },
    [router, customerForm]
  );

  return (
    <Box sx={{ width: '100%', maxWidth: '450px' }}>
      <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>Create Customer Account</Typography>
      
      <form onSubmit={customerForm.handleSubmit(onSubmitCustomer)}>
        <Stack spacing={2.5}>
          <Controller
            control={customerForm.control}
            name="name"
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(customerForm.formState.errors.name)}>
                <InputLabel>Full Name</InputLabel>
                <OutlinedInput {...field} label="Full Name" />
                {customerForm.formState.errors.name ? (
                  <FormHelperText>{customerForm.formState.errors.name.message}</FormHelperText>
                ) : null}
              </FormControl>
            )}
          />

          <Controller
            control={customerForm.control}
            name="gender"
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(customerForm.formState.errors.gender)}>
                <InputLabel>Gender</InputLabel>
                <Select {...field} label="Gender">
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                </Select>
                {customerForm.formState.errors.gender ? (
                  <FormHelperText>{customerForm.formState.errors.gender.message}</FormHelperText>
                ) : null}
              </FormControl>
            )}
          />

          <Controller
            control={customerForm.control}
            name="phone_number"
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(customerForm.formState.errors.phone_number)}>
                <InputLabel>Phone Number</InputLabel>
                <OutlinedInput {...field} label="Phone Number" placeholder="+966XXXXXXXX or 05XXXXXXXX" />
                {customerForm.formState.errors.phone_number ? (
                  <FormHelperText>{customerForm.formState.errors.phone_number.message}</FormHelperText>
                ) : null}
              </FormControl>
            )}
          />

          <Controller
            control={customerForm.control}
            name="address"
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(customerForm.formState.errors.address)}>
                <InputLabel>Address (optional)</InputLabel>
                <OutlinedInput {...field} label="Address (optional)" />
                {customerForm.formState.errors.address ? (
                  <FormHelperText>{customerForm.formState.errors.address.message}</FormHelperText>
                ) : null}
              </FormControl>
            )}
          />

          <Controller
            control={customerForm.control}
            name="email"
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(customerForm.formState.errors.email)}>
                <InputLabel>Email Address</InputLabel>
                <OutlinedInput {...field} label="Email Address" type="email" />
                {customerForm.formState.errors.email ? (
                  <FormHelperText>{customerForm.formState.errors.email.message}</FormHelperText>
                ) : null}
              </FormControl>
            )}
          />

          <Controller
            control={customerForm.control}
            name="password"
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(customerForm.formState.errors.password)}>
                <InputLabel>Password</InputLabel>
                <OutlinedInput
                  {...field}
                  endAdornment={
                    customerShowPassword ? (
                      <EyeIcon
                        cursor="pointer"
                        fontSize="var(--icon-fontSize-md)"
                        onClick={(): void => setCustomerShowPassword(false)}
                      />
                    ) : (
                      <EyeSlashIcon
                        cursor="pointer"
                        fontSize="var(--icon-fontSize-md)"
                        onClick={(): void => setCustomerShowPassword(true)}
                      />
                    )
                  }
                  label="Password"
                  type={customerShowPassword ? 'text' : 'password'}
                />
                {customerForm.formState.errors.password ? (
                  <FormHelperText>{customerForm.formState.errors.password.message}</FormHelperText>
                ) : null}
              </FormControl>
            )}
          />

          <Controller
            control={customerForm.control}
            name="confirm_password"
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(customerForm.formState.errors.confirm_password)}>
                <InputLabel>Confirm Password</InputLabel>
                <OutlinedInput
                  {...field}
                  endAdornment={
                    customerShowConfirmPassword ? (
                      <EyeIcon
                        cursor="pointer"
                        fontSize="var(--icon-fontSize-md)"
                        onClick={(): void => setCustomerShowConfirmPassword(false)}
                      />
                    ) : (
                      <EyeSlashIcon
                        cursor="pointer"
                        fontSize="var(--icon-fontSize-md)"
                        onClick={(): void => setCustomerShowConfirmPassword(true)}
                      />
                    )
                  }
                  label="Confirm Password"
                  type={customerShowConfirmPassword ? 'text' : 'password'}
                />
                {customerForm.formState.errors.confirm_password ? (
                  <FormHelperText>{customerForm.formState.errors.confirm_password.message}</FormHelperText>
                ) : null}
              </FormControl>
            )}
          />

          {customerForm.formState.errors.root ? (
            <Alert severity="error">{customerForm.formState.errors.root.message}</Alert>
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