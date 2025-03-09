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
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { Eye as EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlash as EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import { Buildings as CompanyIcon } from '@phosphor-icons/react/dist/ssr/Buildings';
import { User as CustomerIcon } from '@phosphor-icons/react/dist/ssr/User';

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

// Company schema
const companySchema = zod.object({
  company_name: zod.string().min(1, { message: 'Company name is required' }),
  contact_number: zod.string()
    .min(1, { message: 'Contact number is required' })
    .regex(/^(?:\+966|05)\d{8}$/, { message: 'Invalid phone number format for Saudi Arabia' }),
  email: zod.string().min(1, { message: 'Email is required' }).email(),
  location: zod.string().min(1, { message: 'Location is required' }),
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

type CompanyValues = zod.infer<typeof companySchema>;

const defaultCustomerValues = {
  name: '',
  gender: 'male' as const,
  phone_number: '',
  address: '',
  email: '',
  password: '',
  confirm_password: '',
};

const defaultCompanyValues = {
  company_name: '',
  contact_number: '',
  email: '',
  location: '',
  password: '',
  confirm_password: '',
};

export function SignUpForm(): React.JSX.Element {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState<boolean>(false);
  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [accountType, setAccountType] = React.useState<'customer' | 'company'>('customer');

  const customerForm = useForm<CustomerValues>({
    defaultValues: defaultCustomerValues,
    resolver: zodResolver(customerSchema),
  });

  const companyForm = useForm<CompanyValues>({
    defaultValues: defaultCompanyValues,
    resolver: zodResolver(companySchema),
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: 'customer' | 'company') => {
    setAccountType(newValue);
  };

  const onSubmitCustomer = React.useCallback(
    async (values: CustomerValues): Promise<void> => {
      setIsPending(true);

      try {
        const response = await fetch('http://localhost:8000/api/create_customer/', {
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

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.errors || 'Failed to register');
        }

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
            Company_name: values.company_name,
            Contact_number: values.contact_number,
            Email: values.email,
            location: values.location,
            Password: values.password,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.errors || 'Failed to register');
        }

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
      <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>Create Account</Typography>
      
      <Tabs
        value={accountType}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{ mb: 3 }}
      >
        <Tab 
          value="customer" 
          label="Customer" 
          icon={<CustomerIcon size={20} />} 
          iconPosition="start"
        />
        <Tab 
          value="company" 
          label="Company" 
          icon={<CompanyIcon size={20} />} 
          iconPosition="start"
        />
      </Tabs>
      
      {accountType === 'customer' ? (
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
                      showPassword ? (
                        <EyeIcon
                          cursor="pointer"
                          fontSize="var(--icon-fontSize-md)"
                          onClick={(): void => setShowPassword(false)}
                        />
                      ) : (
                        <EyeSlashIcon
                          cursor="pointer"
                          fontSize="var(--icon-fontSize-md)"
                          onClick={(): void => setShowPassword(true)}
                        />
                      )
                    }
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
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
                      showConfirmPassword ? (
                        <EyeIcon
                          cursor="pointer"
                          fontSize="var(--icon-fontSize-md)"
                          onClick={(): void => setShowConfirmPassword(false)}
                        />
                      ) : (
                        <EyeSlashIcon
                          cursor="pointer"
                          fontSize="var(--icon-fontSize-md)"
                          onClick={(): void => setShowConfirmPassword(true)}
                        />
                      )
                    }
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
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
      ) : (
        <form onSubmit={companyForm.handleSubmit(onSubmitCompany)}>
          <Stack spacing={2.5}>
            <Controller
              control={companyForm.control}
              name="company_name"
              render={({ field }) => (
                <FormControl fullWidth error={Boolean(companyForm.formState.errors.company_name)}>
                  <InputLabel>Company Name</InputLabel>
                  <OutlinedInput {...field} label="Company Name" />
                  {companyForm.formState.errors.company_name ? (
                    <FormHelperText>{companyForm.formState.errors.company_name.message}</FormHelperText>
                  ) : null}
                </FormControl>
              )}
            />

            <Controller
              control={companyForm.control}
              name="contact_number"
              render={({ field }) => (
                <FormControl fullWidth error={Boolean(companyForm.formState.errors.contact_number)}>
                  <InputLabel>Contact Number</InputLabel>
                  <OutlinedInput {...field} label="Contact Number" placeholder="+966XXXXXXXX or 05XXXXXXXX" />
                  {companyForm.formState.errors.contact_number ? (
                    <FormHelperText>{companyForm.formState.errors.contact_number.message}</FormHelperText>
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
                      showPassword ? (
                        <EyeIcon
                          cursor="pointer"
                          fontSize="var(--icon-fontSize-md)"
                          onClick={(): void => setShowPassword(false)}
                        />
                      ) : (
                        <EyeSlashIcon
                          cursor="pointer"
                          fontSize="var(--icon-fontSize-md)"
                          onClick={(): void => setShowPassword(true)}
                        />
                      )
                    }
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                  />
                  {companyForm.formState.errors.password ? (
                    <FormHelperText>{companyForm.formState.errors.password.message}</FormHelperText>
                  ) : null}
                </FormControl>
              )}
            />

            <Controller
              control={companyForm.control}
              name="confirm_password"
              render={({ field }) => (
                <FormControl fullWidth error={Boolean(companyForm.formState.errors.confirm_password)}>
                  <InputLabel>Confirm Password</InputLabel>
                  <OutlinedInput
                    {...field}
                    endAdornment={
                      showConfirmPassword ? (
                        <EyeIcon
                          cursor="pointer"
                          fontSize="var(--icon-fontSize-md)"
                          onClick={(): void => setShowConfirmPassword(false)}
                        />
                      ) : (
                        <EyeSlashIcon
                          cursor="pointer"
                          fontSize="var(--icon-fontSize-md)"
                          onClick={(): void => setShowConfirmPassword(true)}
                        />
                      )
                    }
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                  />
                  {companyForm.formState.errors.confirm_password ? (
                    <FormHelperText>{companyForm.formState.errors.confirm_password.message}</FormHelperText>
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
      )}
    </Box>
  );
}