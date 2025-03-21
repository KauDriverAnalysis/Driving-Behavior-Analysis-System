import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

const baseNavItems: NavItemConfig[] = [
  {
    title: 'Overview',
    href: paths.dashboardAdmin.overview,
    icon: 'chart-pie',
  },
  {
    title: 'Tracking',
    href: paths.dashboardAdmin.tracking,
    icon: 'map',
  },
  {
    title: 'Cars',
    href: paths.dashboardAdmin.cars,
    icon: 'car',
  },
  {
    title: 'Drivers',
    href: paths.dashboardAdmin.drivers,
    icon: 'driver', // Changed icon for Drivers
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
      key: 'pattrenScore',
      title: 'Pattren Score',
      href: paths.dashboardAdmin.pattrenScore,
      icon: 'chart-pie',
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