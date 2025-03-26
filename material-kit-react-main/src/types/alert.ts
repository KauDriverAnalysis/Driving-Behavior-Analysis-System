export interface Alert {
    id: string;
    type: 'speeding' | 'harsh_braking' | 'harsh_acceleration' | 'swerving' | 'accident' | 'system';
    message: string;
    severity: 'info' | 'warning' | 'error';
    isRead: boolean;
    timestamp: string;
    carInfo: {
      id: string;
      model: string;
      plateNumber: string;
    };
    location?: {
      lat: number;
      lng: number;
    };
  }