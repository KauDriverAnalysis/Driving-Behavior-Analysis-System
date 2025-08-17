import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

const baseNavItems: NavItemConfig[] = [
  {
    key: 'overview',
    title: 'Overview',
    href: paths.dashboardAdmin.overview,
    icon: 'chart-pie',
  },
  {
    key: 'tracking',
    title: 'Tracking',
    href: paths.dashboardAdmin.tracking,
    icon: 'map',
  },
  {
    key: 'cars',
    title: 'Cars',
    href: paths.dashboardAdmin.cars,
    icon: 'car',
  },
  {
    key: 'drivers',
    title: 'Drivers',
    href: paths.dashboardAdmin.drivers,
    icon: 'driver',
  },
  {
    key: 'simulation',
    title: 'Simulation',
    href: paths.dashboardAdmin.simulation,
    icon: 'play', // Better simulation icon
  }
];

export const getNavItems = (userType?: string): NavItemConfig[] => {
  const navItems = [...baseNavItems];
  
  if (userType === 'admin') {
    // Insert employees after tracking
    const trackingIndex = navItems.findIndex(item => item.href === paths.dashboardAdmin.tracking);
    navItems.splice(trackingIndex + 2, 0, {
      key: 'employees',
      title: 'Employees',
      href: paths.dashboardAdmin.employees,
      icon: 'users',
    });

    // Insert geofencing after employees
    navItems.splice(trackingIndex + 1, 0, {
      key: 'geofencing',
      title: 'Geofencing',
      href: paths.dashboardAdmin.geofencing,
      icon: 'draw-polygon',
    });
    
    navItems.splice(trackingIndex + 3, 0, {
      key: 'patternScore',  // Fixed typo from 'pattrenScore'
      title: 'Pattern Score', // Fixed typo from 'Pattren Score'
      href: paths.dashboardAdmin.pattrenScore,
      icon: 'shield', // Changed from 'chart-pie' to differentiate from Overview
    });

    // Add account at the end
    navItems.push({
      key: 'account',
      title: 'Account',
      href: paths.dashboardAdmin.account,
      icon: 'user-circle', // Changed icon for Account
    });
  }

  return navItems;
};

export const navItems = getNavItems();