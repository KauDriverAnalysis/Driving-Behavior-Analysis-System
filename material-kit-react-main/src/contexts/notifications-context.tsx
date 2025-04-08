import React, { createContext, useContext, useState, useEffect } from 'react';

// Define Alert type
export interface Alert {
  id: string;
  type: string;
  message: string;
  severity: 'error' | 'warning' | 'info' | 'success';
  isRead: boolean;
  timestamp: string;
  carInfo: {
    id: string;
    model: string;
    plateNumber: string;
  }
}

interface AlertSettings {
  harshBraking: boolean;
  hardAcceleration: boolean;
  swerving: boolean;
  overSpeed: boolean;
  geofence: boolean;
}

interface NotificationsContextType {
  alerts: Alert[];
  unreadCount: number;
  loading: boolean;
  fetchAlerts: () => Promise<void>;
  markAllAsRead: () => void;
  markAsRead: (id: string) => void;
  alertSettings: AlertSettings;
  updateAlertSettings: (settings: Partial<AlertSettings>) => void;
}

const DEFAULT_ALERT_SETTINGS: AlertSettings = {
  harshBraking: true,
  hardAcceleration: true,
  swerving: true,
  overSpeed: true,
  geofence: true
};

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [alertSettings, setAlertSettings] = useState<AlertSettings>(DEFAULT_ALERT_SETTINGS);

  // Load alert settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('alertSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setAlertSettings({...DEFAULT_ALERT_SETTINGS, ...parsedSettings});
      } catch (e) {
        console.error('Failed to parse alert settings:', e);
      }
    }
  }, []);

  const updateAlertSettings = (settings: Partial<AlertSettings>) => {
    const newSettings = {...alertSettings, ...settings};
    setAlertSettings(newSettings);
    
    // Save settings to localStorage
    localStorage.setItem('alertSettings', JSON.stringify(newSettings));
  };

  const unreadCount = alerts.filter(alert => !alert.isRead).length;

  const shouldIncludeAlert = (alert: Alert): boolean => {
    // Check time-to-live (24 hours)
    const alertTime = new Date(alert.timestamp).getTime();
    const now = new Date().getTime();
    const isWithin24Hours = (now - alertTime) < 24 * 60 * 60 * 1000;
    
    if (!isWithin24Hours) {
      return false;
    }
    
    // Check alert type against settings
    switch (alert.type) {
      case 'harsh_braking':
        return alertSettings.harshBraking;
      case 'harsh_acceleration':
        return alertSettings.hardAcceleration;
      case 'swerving':
        return alertSettings.swerving;
      case 'speeding':
        return alertSettings.overSpeed;
      case 'geofence':
        return alertSettings.geofence;
      default:
        return true; // Always show other alert types
    }
  };

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const customerId = localStorage.getItem('customer-id') || 
                      localStorage.getItem('customerId') || 
                      localStorage.getItem('customer_id') ||
                      localStorage.getItem('userId');
      
      if (!customerId) {
        setAlerts([]);
        return;
      }
      
      // Fetch cars for this customer
      const carsResponse = await fetch(`https://driving-behavior-analysis-system.onrender.com/api/cars/?userType=customer&userId=${customerId}`);
      
      if (!carsResponse.ok) {
        throw new Error('Failed to fetch cars');
      }
      
      const cars = await carsResponse.json();
      
      if (!Array.isArray(cars) || cars.length === 0) {
        setAlerts([]);
        return;
      }
      
      // Collect alerts for all customer's cars
      const allAlerts: Alert[] = [];
      
      for (const car of cars) {
        try {
          const dataResponse = await fetch(`https://driving-behavior-analysis-system.onrender.com/api/car-driving-data/${car.id}/`);
          
          if (!dataResponse.ok) {
            continue;
          }
          
          const carData = await dataResponse.json();
          
          // Check if car data and current data exists
          if (!carData?.current) continue;
          
          // Process current data - contains the latest metrics
          const record = carData.current;
          // Create a synthetic record ID for alerts
          const recordId = new Date().getTime();
          
          const carModel = car.Model_of_car || car.model || 'Unknown Model';
          const carPlateNumber = car.Plate_number || car.plateNumber || 'Unknown';
          
          // Check for speeding > 120km/h
          if (record.speed > 120) {
            allAlerts.push({
              id: `speed-${car.id}-${recordId}`,
              type: 'speeding',
              message: `Vehicle exceeded speed limit: ${Math.round(record.speed)} km/h`,
              severity: 'error',
              isRead: false,
              timestamp: new Date().toISOString(),
              carInfo: {
                id: car.id,
                model: carModel,
                plateNumber: carPlateNumber
              }
            });
          }
          
          // Check for harsh braking events
          if (record.harsh_braking_events > 25) {
            allAlerts.push({
              id: `brake-${car.id}-${recordId}`,
              type: 'harsh_braking',
              message: `Excessive harsh braking detected: ${record.harsh_braking_events} events`,
              severity: 'warning',
              isRead: false,
              timestamp: new Date().toISOString(),
              carInfo: {
                id: car.id,
                model: carModel,
                plateNumber: carPlateNumber
              }
            });
          }
          
          // Check for harsh acceleration events
          if (record.harsh_acceleration_events > 25) {
            allAlerts.push({
              id: `accel-${car.id}-${recordId}`,
              type: 'harsh_acceleration',
              message: `Excessive harsh acceleration detected: ${record.harsh_acceleration_events} events`,
              severity: 'warning',
              isRead: false,
              timestamp: new Date().toISOString(),
              carInfo: {
                id: car.id,
                model: carModel,
                plateNumber: carPlateNumber
              }
            });
          }
          
          // Check for swerving events
          if (record.swerving_events > 25) {
            allAlerts.push({
              id: `swerve-${car.id}-${recordId}`,
              type: 'swerving',
              message: `Excessive swerving detected: ${record.swerving_events} events`,
              severity: 'warning',
              isRead: false,
              timestamp: new Date().toISOString(),
              carInfo: {
                id: car.id,
                model: carModel,
                plateNumber: carPlateNumber
              }
            });
          }
        } catch (error) {
          console.error('Error fetching car data:', error);
        }
      }
      
      // Sort alerts by timestamp (newest first)
      allAlerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      // Filter alerts based on settings and TTL
      const filteredAlerts = allAlerts.filter(shouldIncludeAlert);
      
      setAlerts(filteredAlerts);
    } catch (error) {
      console.error('Failed to fetch alerts', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    // Update UI immediately for better user experience
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === id ? { ...alert, isRead: true } : alert
      )
    );
    
    try {
      // Extract info from the alert ID (e.g., "speed-123-timestamp")
      const parts = id.split('-');
      if (parts.length >= 2) {
        const eventType = parts[0]; // speed, brake, accel, swerve
        const carId = parts[1];
        
        // Get user ID and type
        const userId = localStorage.getItem('customerId') || 
                       localStorage.getItem('userId');
        const userType = 'customer'; // Since this is the customer notifications context
        
        // Send request to mark as read in the backend
        await fetch('https://driving-behavior-analysis-system.onrender.com/api/mark-notification-read/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            car_id: carId,
            user_id: userId,
            user_type: userType,
            notification_type: eventType
          })
        });
      }
    } catch (error) {
      console.error('Failed to mark notification as read in backend:', error);
      // Note: We don't revert the UI since it's better UX to keep it marked as read
    }
  };

  const markAllAsRead = async () => {
    // Update UI immediately
    setAlerts(prev => prev.map(alert => ({ ...alert, isRead: true })));
    
    try {
      // Get user info
      const userId = localStorage.getItem('customerId') || 
                     localStorage.getItem('userId');
      const userType = 'customer';
      
      // Mark each alert as read in backend
      const promises = alerts.map(async (alert) => {
        const parts = alert.id.split('-');
        if (parts.length >= 2) {
          const eventType = parts[0];
          const carId = parts[1];
          
          return fetch('https://driving-behavior-analysis-system.onrender.com/api/mark-notification-read/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              car_id: carId,
              user_id: userId,
              user_type: userType,
              notification_type: eventType
            })
          });
        }
      });
      
      // Wait for all requests to complete
      await Promise.all(promises.filter(Boolean));
    } catch (error) {
      console.error('Failed to mark all notifications as read in backend:', error);
    }
  };

  // Fetch alerts on initial load
  useEffect(() => {
    fetchAlerts();
    
    // Set up polling every minute
    const intervalId = setInterval(fetchAlerts, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <NotificationsContext.Provider 
      value={{ 
        alerts, 
        unreadCount, 
        loading, 
        fetchAlerts, 
        markAllAsRead, 
        markAsRead,
        alertSettings,
        updateAlertSettings
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};