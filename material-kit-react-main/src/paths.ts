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
    geofencing: '/dashboard-admin/geofencing',
    cars: '/dashboard-admin/cars',
    employees: '/dashboard-admin/employees',
  },
  errors: { 
    notFound: '/errors/not-found' 
  },
} as const;