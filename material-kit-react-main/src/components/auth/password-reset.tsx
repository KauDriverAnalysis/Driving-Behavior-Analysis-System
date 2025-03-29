'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Eye as EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlash as EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { paths } from '@/paths';
import { authClient } from '@/lib/auth/client';
import { Layout } from '@/components/auth/layout';

// Define our schema for password reset
const schema = zod
  .object({
    password: zod.string().min(8, { message: 'Password must be at least 8 characters' }),
    passwordConfirm: zod.string().min(8, { message: 'Password must be at least 8 characters' }),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Passwords do not match',
    path: ['passwordConfirm'],
  });

type Values = zod.infer<typeof schema>;

const defaultValues = {
  password: '',
  passwordConfirm: '',
};

export default function ResetPasswordConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  
  const [isPending, setIsPending] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({ 
    defaultValues, 
    resolver: zodResolver(schema) 
  });

  React.useEffect(() => {
    if (!token || !email) {
      router.push(paths.auth.resetPassword);
    }
  }, [token, email, router]);

  const onSubmit = React.useCallback(
    async (values: Values) => {
      if (!token || !email) {
        return;
      }

      setIsPending(true);

      try {
        console.log('Attempting to update password with token:', token.substring(0, 6) + '...');
        
        const response = await fetch('https://driving-behavior-analysis-system.onrender.com/api/update_password/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            token,
            new_password: values.password,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to reset password');
        }

        setSuccess(true);
        setTimeout(() => {
          router.push(paths.auth.signIn);
        }, 3000);
      } catch (error) {
        console.error('Password reset error:', error);
        setError('root', {
          type: 'server',
          message: error instanceof Error ? error.message : 'Something went wrong',
        });
        setIsPending(false);
      }
    },
    [email, token, router, setError]
  );

  if (success) {
    return (
      <Layout>
        <Box sx={{ width: '100%', maxWidth: '450px' }}>
          <Alert severity="success" sx={{ mb: 3 }}>
            Your password has been reset successfully! You will be redirected to the sign in page.
          </Alert>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ width: '100%', maxWidth: '450px' }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Reset password
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            <Controller
              control={control}
              name="password"
              render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.password)}>
                  <InputLabel>New Password</InputLabel>
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
                    label="New Password"
                    type={showPassword ? 'text' : 'password'}
                  />
                  {errors.password ? <FormHelperText>{errors.password.message}</FormHelperText> : null}
                </FormControl>
              )}
            />
            <Controller
              control={control}
              name="passwordConfirm"
              render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.passwordConfirm)}>
                  <InputLabel>Confirm Password</InputLabel>
                  <OutlinedInput
                    {...field}
                    endAdornment={
                      showPasswordConfirm ? (
                        <EyeIcon
                          cursor="pointer"
                          fontSize="var(--icon-fontSize-md)"
                          onClick={(): void => {
                            setShowPasswordConfirm(false);
                          }}
                        />
                      ) : (
                        <EyeSlashIcon
                          cursor="pointer"
                          fontSize="var(--icon-fontSize-md)"
                          onClick={(): void => {
                            setShowPasswordConfirm(true);
                          }}
                        />
                      )
                    }
                    label="Confirm Password"
                    type={showPasswordConfirm ? 'text' : 'password'}
                  />
                  {errors.passwordConfirm ? <FormHelperText>{errors.passwordConfirm.message}</FormHelperText> : null}
                </FormControl>
              )}
            />
            {errors.root ? <Alert severity="error">{errors.root.message}</Alert> : null}
            <Button disabled={isPending} type="submit" variant="contained" fullWidth>
              {isPending ? 'Updating...' : 'Reset Password'}
            </Button>
          </Stack>
        </form>
      </Box>
    </Layout>
  );
}