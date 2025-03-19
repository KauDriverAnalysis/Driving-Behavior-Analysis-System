import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

const baseNavItems: NavItemConfig[] = [
  {
    title: 'Overview',
    href: paths.dashboardAdmin.index,
    icon: 'chart-pie',
  },
  {
    title: 'Tracking',
    href: paths.dashboardAdmin.tracking,
    icon: 'map',
  },
  {
    title: 'Geofencing',
    href: paths.dashboardAdmin.geofencing,
    icon: 'map-pin',
  },
  {
    title: 'Cars',
    href: paths.dashboardAdmin.cars,
    icon: 'car',
  },
  
];

export const getNavItems = (userType?: string): NavItemConfig[] => {
  const navItems = [...baseNavItems];
  
  if (userType === 'admin') {
    // Insert employees after tracking but before geofencing
    const trackingIndex = navItems.findIndex(item => item.href === paths.dashboardAdmin.tracking);
    navItems.splice(trackingIndex + 1, 0, {
      key: 'employees',
      title: 'Employees',
      href: paths.dashboardAdmin.employees,
      icon: 'users',
    });
  }

  return navItems;
};

export const navItems = getNavItems();