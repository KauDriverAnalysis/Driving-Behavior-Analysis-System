export const paths = {
  home: '/',
  auth: {
    signIn: '/auth/sign-in',
    signUp: '/auth/sign-up',
    resetPassword: '/auth/reset-password',
    homepage: '/auth/homepage' 
  },
  dashboardCustomer: {
    overview: '/dashboard-customer',
    parentalControl: '/dashboard-customer/parental-control',
    carCustomers: '/dashboard-customer/car-customers',
    account: '/dashboard-customer/account',
    geofencing: '/dashboard-customer/geofencing', // Added new geofencing path
  },
  dashboardAdmin: {
    overview: '/dashboard-admin',
    tracking: '/dashboard-admin/tracking',
    geofencing: '/dashboard-admin/geofencing',
    pattrenScore: '/dashboard-admin/pattren-score',
    cars: '/dashboard-admin/cars',
    employees: '/dashboard-admin/employees',
    drivers: '/dashboard-admin/drivers ',
    account: '/dashboard-admin/account',
    simulation: '/dashboard-admin/simulation',
  },
  errors: { 
    notFound: '/errors/not-found' 
  },
} as const;