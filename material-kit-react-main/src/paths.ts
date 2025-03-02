export const paths = {
  home: '/',
  auth: { signIn: '/auth/sign-in', signUp: '/auth/sign-up', resetPassword: '/auth/reset-password' },
  dashboard: {
    overview: '/dashboard',
    tracking: '/dashboard/tracking',
    employees: '/dashboard/employees',
    addEmployee: '/dashboard/add-employee', // Add this line
    drivers: '/dashboard/drivers',
    settings: '/dashboard/settings',
    account: '/dashboard/account',
    cars: '/dashboard/cars',

  },
  errors: { notFound: '/errors/not-found' },
} as const;
