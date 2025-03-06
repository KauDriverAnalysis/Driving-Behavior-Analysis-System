// Mock data for visualizations
export const drivingHistoryData = [
    { date: 'Mon', speed: 65, hardBrakes: 2, suddenAccelerations: 1, score: 87 },
    { date: 'Tue', speed: 58, hardBrakes: 1, suddenAccelerations: 0, score: 92 },
    { date: 'Wed', speed: 72, hardBrakes: 3, suddenAccelerations: 2, score: 78 },
    { date: 'Thu', speed: 63, hardBrakes: 0, suddenAccelerations: 1, score: 89 },
    { date: 'Fri', speed: 67, hardBrakes: 2, suddenAccelerations: 2, score: 82 },
    { date: 'Sat', speed: 61, hardBrakes: 1, suddenAccelerations: 0, score: 90 },
    { date: 'Sun', speed: 70, hardBrakes: 4, suddenAccelerations: 3, score: 75 },
  ];
  
  export const recentAlerts = [
    { id: 1, type: 'Speeding', message: 'Exceeded speed limit by 15mph on Main Street', time: '2 hours ago', severity: 'error' },
    { id: 2, type: 'Hard Brake', message: 'Sudden braking detected on Highway 101', time: '5 hours ago', severity: 'warning' },
    { id: 3, type: 'Late Night', message: 'Driving detected after curfew at 11:30 PM', time: 'Yesterday', severity: 'warning' },
    { id: 4, type: 'Geofence', message: 'Vehicle left designated safe area', time: 'Yesterday', severity: 'info' },
  ];