// Import the icons you need from Phosphor
import { ChartPie } from '@phosphor-icons/react/dist/ssr/ChartPie';
import { MapPin } from '@phosphor-icons/react/dist/ssr/MapPin';
import { User } from '@phosphor-icons/react/dist/ssr/User';
import { Users } from '@phosphor-icons/react/dist/ssr/Users';
import { CarSimple } from '@phosphor-icons/react/dist/ssr/CarSimple';
import { GearSix } from '@phosphor-icons/react/dist/ssr/GearSix';
import { XSquare } from '@phosphor-icons/react/dist/ssr/XSquare';
import { Polygon } from '@phosphor-icons/react/dist/ssr/Polygon';
import { IdentificationBadge } from '@phosphor-icons/react/dist/ssr/IdentificationBadge';
import { UserCircle } from '@phosphor-icons/react/dist/ssr/UserCircle';
import { ChartLine } from '@phosphor-icons/react/dist/ssr/ChartLine';
import { Shield } from '@phosphor-icons/react/dist/ssr/Shield'; // Add this import

// Create a mapping of icon names to components
export const navIcons = {
  'chart-pie': ChartPie,
  'chart-line': ChartLine,
  'shield': Shield,      // Add shield icon for Pattern Score
  'map': MapPin,
  'map-pin': MapPin,
  'user': User,
  'users': Users,
  'car': CarSimple,
  'car-simple': CarSimple,
  'driver': IdentificationBadge,
  'user-focus': IdentificationBadge,
  'gear-six': GearSix,
  'x-square': XSquare,
  'draw-polygon': Polygon,
  'user-circle': UserCircle,
};
