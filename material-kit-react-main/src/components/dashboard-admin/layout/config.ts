import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const getNavItems = (userType?: string): NavItemConfig[] => {
  // Base items that are shown to all user types
  const navItems: NavItemConfig[] = [
    { key: 'overview', title: 'Overview', href: paths.dashboardAdmin.overview, icon: 'chart-pie' },
    { key: 'tracking', title: 'Tracking', href: paths.dashboardAdmin.tracking, icon: 'map' },
    { key: 'drivers', title: 'Drivers', href: paths.dashboardAdmin.drivers, icon: 'user' },  // Changed to 'user'
    { key: 'cars', title: 'Cars', href: paths.dashboardAdmin.cars, icon: 'car' },
  ];

  console.log('config type:', userType); 

  // Add the employees menu item only if the user is an admin
  if (userType === 'admin') {
    // Insert employees after tracking
    return [
      navItems[0], // Overview
      navItems[1], // Tracking
      { key: 'employees', title: 'Employees', href: paths.dashboardAdmin.employees, icon: 'users' },
      ...navItems.slice(2) // The rest of the items
    ];
  }

  return navItems;
};