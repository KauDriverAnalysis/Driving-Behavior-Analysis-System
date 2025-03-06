export const paths = {
  home: '/',
  auth: { signIn: '/auth/sign-in', signUp: '/auth/sign-up', resetPassword: '/auth/reset-password' },
  dashboardAdmin: {
    overview: '/dashboard-admin',
    account: '/dashboard-admin/account',
    tracking: '/dashboard-admin/tracking',
    employees: '/dashboard-admin/employees',
    drivers: '/dashboard-admin/drivers',
    cars: '/dashboard-admin/cars',
    settings: '/dashboard-admin/settings',
    // other admin paths
  },
  dashboardCustomer: {
    overview: '/dashboard-customer',
    page1: '/dashboard-customer/page1',
    ParentalControl: '/dashboard-customer/Parental-Control',
    carCustomers: '/dashboard-customer/car-customers',
  },
  errors: { notFound: '/errors/not-found' },
} as const;