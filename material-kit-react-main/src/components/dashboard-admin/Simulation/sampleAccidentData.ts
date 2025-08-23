// Enhanced sample data with accident information for the 3D simulation

interface AccidentSegment {
  time: string;
  lat: number;
  lng: number;
  speed: number;
  event?: string;
  score: number;
  // Enhanced accident data
  accidentType?: 'collision' | 'rollover' | 'near_miss' | 'impact';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  accidentScore?: number; // 0-100 scale for accident severity
  damageEstimate?: string;
  emergencyRequired?: boolean;
}

export const sampleAccidentData: AccidentSegment[] = [
  // Normal driving start
  { time: "2024-01-15T08:00:00", lat: 31.9686, lng: 35.8965, speed: 45, event: undefined, score: 95 },
  { time: "2024-01-15T08:00:05", lat: 31.9688, lng: 35.8967, speed: 48, event: undefined, score: 95 },
  { time: "2024-01-15T08:00:10", lat: 31.9690, lng: 35.8969, speed: 52, event: undefined, score: 95 },
  { time: "2024-01-15T08:00:15", lat: 31.9692, lng: 35.8971, speed: 55, event: undefined, score: 95 },
  
  // Over speed event
  { time: "2024-01-15T08:00:20", lat: 31.9694, lng: 35.8973, speed: 85, event: "over_speed", score: 88, severity: "medium" },
  { time: "2024-01-15T08:00:25", lat: 31.9696, lng: 35.8975, speed: 92, event: "over_speed", score: 85, severity: "high" },
  { time: "2024-01-15T08:00:30", lat: 31.9698, lng: 35.8977, speed: 78, event: undefined, score: 87 },
  
  // Normal driving
  { time: "2024-01-15T08:00:35", lat: 31.9700, lng: 35.8979, speed: 65, event: undefined, score: 89 },
  { time: "2024-01-15T08:00:40", lat: 31.9702, lng: 35.8981, speed: 58, event: undefined, score: 90 },
  
  // Harsh braking event
  { time: "2024-01-15T08:00:45", lat: 31.9704, lng: 35.8983, speed: 62, event: "harsh_braking", score: 82, severity: "medium" },
  { time: "2024-01-15T08:00:50", lat: 31.9705, lng: 35.8984, speed: 35, event: "harsh_braking", score: 78, severity: "high" },
  { time: "2024-01-15T08:00:55", lat: 31.9706, lng: 35.8985, speed: 25, event: undefined, score: 80 },
  
  // Normal driving
  { time: "2024-01-15T08:01:00", lat: 31.9708, lng: 35.8987, speed: 45, event: undefined, score: 82 },
  { time: "2024-01-15T08:01:05", lat: 31.9710, lng: 35.8989, speed: 52, event: undefined, score: 84 },
  
  // CRITICAL ACCIDENT - Near Miss
  { 
    time: "2024-01-15T08:01:10", 
    lat: 31.9712, 
    lng: 35.8991, 
    speed: 68, 
    event: "swerving", 
    score: 45,
    accidentType: "near_miss",
    severity: "high",
    accidentScore: 75,
    damageEstimate: "No physical damage - avoided collision",
    emergencyRequired: false
  },
  { 
    time: "2024-01-15T08:01:15", 
    lat: 31.9713, 
    lng: 35.8993, 
    speed: 42, 
    event: "harsh_braking", 
    score: 42,
    accidentType: "near_miss",
    severity: "high",
    accidentScore: 78,
    damageEstimate: "No physical damage - avoided collision",
    emergencyRequired: false
  },
  
  // Recovery from near miss
  { time: "2024-01-15T08:01:20", lat: 31.9714, lng: 35.8994, speed: 35, event: undefined, score: 50 },
  { time: "2024-01-15T08:01:25", lat: 31.9715, lng: 35.8995, speed: 42, event: undefined, score: 55 },
  
  // Normal driving continues
  { time: "2024-01-15T08:01:30", lat: 31.9717, lng: 35.8997, speed: 48, event: undefined, score: 60 },
  { time: "2024-01-15T08:01:35", lat: 31.9719, lng: 35.8999, speed: 52, event: undefined, score: 65 },
  { time: "2024-01-15T08:01:40", lat: 31.9721, lng: 35.9001, speed: 55, event: undefined, score: 68 },
  
  // Harsh acceleration
  { time: "2024-01-15T08:01:45", lat: 31.9723, lng: 35.9003, speed: 58, event: "harsh_acceleration", score: 65, severity: "medium" },
  { time: "2024-01-15T08:01:50", lat: 31.9725, lng: 35.9005, speed: 72, event: "harsh_acceleration", score: 62, severity: "medium" },
  { time: "2024-01-15T08:01:55", lat: 31.9727, lng: 35.9007, speed: 65, event: undefined, score: 64 },
  
  // Normal driving
  { time: "2024-01-15T08:02:00", lat: 31.9729, lng: 35.9009, speed: 58, event: undefined, score: 66 },
  { time: "2024-01-15T08:02:05", lat: 31.9731, lng: 35.9011, speed: 62, event: undefined, score: 68 },
  { time: "2024-01-15T08:02:10", lat: 31.9733, lng: 35.9013, speed: 65, event: undefined, score: 70 },
  
  // MAJOR ACCIDENT - Collision
  { 
    time: "2024-01-15T08:02:15", 
    lat: 31.9735, 
    lng: 35.9015, 
    speed: 58, 
    event: "swerving", 
    score: 25,
    accidentType: "collision",
    severity: "critical",
    accidentScore: 95,
    damageEstimate: "Severe front-end damage, airbag deployment",
    emergencyRequired: true
  },
  { 
    time: "2024-01-15T08:02:20", 
    lat: 31.9736, 
    lng: 35.9016, 
    speed: 12, 
    event: "harsh_braking", 
    score: 20,
    accidentType: "collision",
    severity: "critical",
    accidentScore: 98,
    damageEstimate: "Severe front-end damage, airbag deployment",
    emergencyRequired: true
  },
  { 
    time: "2024-01-15T08:02:25", 
    lat: 31.9736, 
    lng: 35.9016, 
    speed: 0, 
    event: undefined, 
    score: 15,
    accidentType: "collision",
    severity: "critical",
    accidentScore: 100,
    damageEstimate: "Vehicle immobilized, major structural damage",
    emergencyRequired: true
  },
  
  // Post-accident (vehicle stopped)
  { 
    time: "2024-01-15T08:02:30", 
    lat: 31.9736, 
    lng: 35.9016, 
    speed: 0, 
    event: undefined, 
    score: 15,
    accidentType: "collision",
    severity: "critical",
    accidentScore: 100,
    damageEstimate: "Vehicle immobilized, emergency services contacted",
    emergencyRequired: true
  },
  { 
    time: "2024-01-15T08:02:35", 
    lat: 31.9736, 
    lng: 35.9016, 
    speed: 0, 
    event: undefined, 
    score: 15,
    accidentType: "collision",
    severity: "critical",
    accidentScore: 100,
    damageEstimate: "Vehicle immobilized, emergency services contacted",
    emergencyRequired: true
  },
  
  // Earlier in route - Rollover incident (separate incident)
  { 
    time: "2024-01-15T07:45:00", 
    lat: 31.9650, 
    lng: 35.8920, 
    speed: 75, 
    event: "over_speed", 
    score: 35,
    accidentType: "rollover",
    severity: "high",
    accidentScore: 85,
    damageEstimate: "Vehicle partially rolled, side damage",
    emergencyRequired: true
  },
  { 
    time: "2024-01-15T07:45:05", 
    lat: 31.9651, 
    lng: 35.8921, 
    speed: 45, 
    event: "swerving", 
    score: 30,
    accidentType: "rollover",
    severity: "high",
    accidentScore: 88,
    damageEstimate: "Vehicle stabilized, but requires towing",
    emergencyRequired: true
  },
  
  // Add more normal driving points to show the complete journey
  { time: "2024-01-15T08:03:00", lat: 31.9738, lng: 35.9018, speed: 25, event: undefined, score: 20 },
  { time: "2024-01-15T08:03:05", lat: 31.9740, lng: 35.9020, speed: 35, event: undefined, score: 25 },
  { time: "2024-01-15T08:03:10", lat: 31.9742, lng: 35.9022, speed: 42, event: undefined, score: 30 },
  { time: "2024-01-15T08:03:15", lat: 31.9744, lng: 35.9024, speed: 48, event: undefined, score: 35 },
  { time: "2024-01-15T08:03:20", lat: 31.9746, lng: 35.9026, speed: 52, event: undefined, score: 40 },
  { time: "2024-01-15T08:03:25", lat: 31.9748, lng: 35.9028, speed: 55, event: undefined, score: 42 },
  { time: "2024-01-15T08:03:30", lat: 31.9750, lng: 35.9030, speed: 58, event: undefined, score: 45 }
];

// Statistics for the sample data
export const accidentStatistics = {
  totalIncidents: 6,
  criticalAccidents: 2,
  emergencyRequired: 2,
  severityBreakdown: {
    critical: 2,
    high: 3,
    medium: 4,
    low: 0
  },
  accidentTypes: {
    collision: 1,
    rollover: 1,
    near_miss: 1,
    harsh_braking: 2,
    harsh_acceleration: 1,
    over_speed: 2,
    swerving: 2
  },
  timeRange: {
    start: "2024-01-15T07:45:00",
    end: "2024-01-15T08:03:30"
  }
};

export default sampleAccidentData;
