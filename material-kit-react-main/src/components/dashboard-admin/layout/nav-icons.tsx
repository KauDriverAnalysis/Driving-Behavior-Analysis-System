// Import the icons you need from Phosphor
import { ChartPie } from '@phosphor-icons/react/dist/ssr/ChartPie';
import { MapPin } from '@phosphor-icons/react/dist/ssr/MapPin';
import { User } from '@phosphor-icons/react/dist/ssr/User';
import { Users } from '@phosphor-icons/react/dist/ssr/Users';
import { CarSimple } from '@phosphor-icons/react/dist/ssr/CarSimple';
import { GearSix } from '@phosphor-icons/react/dist/ssr/GearSix';
import { XSquare } from '@phosphor-icons/react/dist/ssr/XSquare';
import { Polygon } from '@phosphor-icons/react/dist/ssr/Polygon';
import { IdentificationBadge } from '@phosphor-icons/react/dist/ssr/IdentificationBadge'; // Add this import
import { UserCircle } from '@phosphor-icons/react/dist/ssr/UserCircle'; // Add this import

// Create a mapping of icon names to components
export const navIcons = {
  'chart-pie': ChartPie,
  'map': MapPin,          // This maps to your 'tracking' icon
  'map-pin': MapPin,      // Alternative option 
  'user': User,
  'users': Users,
  'car': CarSimple,       // This maps to your 'cars' icon
  'car-simple': CarSimple, // Alternative option
  'driver': IdentificationBadge, // Changed icon for 'drivers'
  'user-focus': IdentificationBadge, // Alternative option for 'drivers'
  'gear-six': GearSix,
  'x-square': XSquare,
  'draw-polygon': Polygon, // Add this line to map the key to the icon
  'user-circle': UserCircle, // Add this line to map the key to the icon for 'account'
};