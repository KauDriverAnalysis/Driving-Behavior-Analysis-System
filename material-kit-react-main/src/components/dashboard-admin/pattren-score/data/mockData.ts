interface Alert {
  id: string;
  type: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  time: string;
}

export const recentAlerts: Alert[] = [
  {
    id: '1',
    type: 'Harsh Braking',
    message: 'Vehicle ABC123 detected harsh braking event on Main Street',
    severity: 'error',
    time: '2 minutes ago'
  },
  {
    id: '2',
    type: 'Over Speed',
    message: 'Vehicle XYZ789 exceeded speed limit by 15 km/h',
    severity: 'warning',
    time: '15 minutes ago'
  },
  {
    id: '3',
    type: 'Swerving',
    message: 'Vehicle DEF456 detected unusual swerving pattern',
    severity: 'warning',
    time: '1 hour ago'
  },
  {
    id: '4',
    type: 'Hard Acceleration',
    message: 'Vehicle GHI789 showed aggressive acceleration',
    severity: 'info',
    time: '2 hours ago'
  }
];