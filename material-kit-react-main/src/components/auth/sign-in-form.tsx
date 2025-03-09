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
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { Eye as EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlash as EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import { Buildings as CompanyIcon } from '@phosphor-icons/react/dist/ssr/Buildings';
import { User as CustomerIcon } from '@phosphor-icons/react/dist/ssr/User';

import { paths } from '@/paths';
import { authClient } from '@/lib/auth/client';
import { useUser } from '@/hooks/use-user';

const schema = zod.object({
  email: zod.string().min(1, { message: 'Email is required' }).email(),
  password: zod.string().min(1, { message: 'Password is required' }),
});

type Values = zod.infer<typeof schema>;

const defaultValues = { email: '', password: '' } satisfies Values;

export function SignInForm(): React.JSX.Element {
  const router = useRouter();
  const { checkSession, setUserType } = useUser();

  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [accountType, setAccountType] = React.useState<'customer' | 'company'>('customer');

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      setIsPending(true);

      const { userType, error } = await authClient.signInWithPassword({
        ...values,
        accountType
      });

      if (error) {
        setError('root', { type: 'server', message: error });
        setIsPending(false);
        return;
      }

      await checkSession?.();
      console.log('Current user type:', userType);
      
      // Store the user type
      setUserType(userType);

      if (userType === 'admin') {
        router.push(paths.dashboardAdmin.overview);
      } else if (userType === 'customer') {
        router.push(paths.dashboardCustomer.overview);
      } else if (userType === 'company') {
        router.push(paths.dashboardCompany.overview);
      } else if (userType === 'employee') {
        router.push(paths.dashboardAdmin.overview);
      }
    },
    [checkSession, router, setError, setUserType, accountType]
  );

  return (
    <Box sx={{ width: '100%', maxWidth: '450px' }}>
      <Tabs
        value={accountType}
        onChange={(_, value) => setAccountType(value)}
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
                  placeholder={accountType === 'customer' ? "customer@example.com" : "company@example.com"}
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

      <Box sx={{ mt: 4 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Demo Accounts:</Typography>
          <Box component="ul" sx={{ m: 0, pl: 2 }}>
            <li><b>Customer:</b> customer@example.com / CustomerSecret</li>
            <li><b>Company:</b> company@example.com / CompanySecret</li>
            <li><b>Admin:</b> admin@example.com / AdminSecret</li>
          </Box>
        </Alert>
      </Box>
    </Box>
  );
}