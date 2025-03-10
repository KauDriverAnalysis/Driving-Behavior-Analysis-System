export const paths = {
  home: '/',
  auth: {
    signIn: '/auth/sign-in',
    signUp: '/auth/sign-up',
    resetPassword: '/auth/reset-password',
  },
  dashboardCustomer: {
    overview: '/dashboard-customer',
    parentalControl: '/dashboard-customer/parental-control', // Match the path name
    carCustomers: '/dashboard-customer/car-customers',
    account: '/dashboard-customer/account',

  },
  dashboardAdmin: {
    overview: '/dashboard-admin',
    tracking: '/dashboard-admin/tracking',
    employees: '/dashboard-admin/employees',
    drivers: '/dashboard-admin/drivers',
    cars: '/dashboard-admin/cars',
  },
  errors: { 
    notFound: '/errors/not-found' 
  },
} as const;