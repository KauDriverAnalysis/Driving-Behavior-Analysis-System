'use client';

import * as React from 'react';
import { Simulation3D } from './3DSimulation';

// Mock data generator for demonstration
const generateMockData = (numPoints = 100) => {
  const data = [];
  const startLat = 24.7136;
  const startLng = 46.6753;
  
  for (let i = 0; i < numPoints; i++) {
    const time = new Date(Date.now() + i * 1000).toISOString();
    const angle = (i / numPoints) * Math.PI * 4; // Make several turns
    const radius = 0.01;
    
    const lat = startLat + Math.sin(angle) * radius;
    const lng = startLng + Math.cos(angle) * radius;
    const speed = 30 + Math.sin(i * 0.1) * 20 + Math.random() * 10; // Variable speed
    
    // Add some events randomly
    let event: string | undefined;
    if (Math.random() < 0.05) { // 5% chance of harsh braking
      event = 'harsh_braking';
    } else if (Math.random() < 0.03) { // 3% chance of harsh acceleration
      event = 'harsh_acceleration';
    } else if (Math.random() < 0.02) { // 2% chance of swerving
      event = 'swerving';
    } else if (speed > 70 && Math.random() < 0.04) { // 4% chance of over speed when going fast
      event = 'over_speed';
    }
    
    data.push({
      time,
      lat,
      lng,
      speed,
      event,
      score: event ? Math.max(50, 100 - Math.random() * 30) : 85 + Math.random() * 15
    });
  }
  
  return data;
};

export default function Simulation3DDemo() {
  const [mockData] = React.useState(() => generateMockData(200));
  
  return (
    <div style={{ padding: '20px', minHeight: '100vh', background: '#f5f5f5' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
        Enhanced 3D Vehicle Physics Simulation
      </h1>
      <p style={{ textAlign: 'center', marginBottom: '30px', color: '#666' }}>
        This demo showcases the same concepts from the 3D module but implemented with CSS-based 3D effects.
        <br />
        Features: Vehicle physics, trail rendering, event detection, camera following, and fullscreen mode.
      </p>
      
      <Simulation3D data={mockData} />
      
      <div style={{ marginTop: '30px', padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h3>Features Implemented:</h3>
        <ul>
          <li><strong>3D Environment:</strong> CSS-based 3D perspective with ground grid and ambient lighting effects</li>
          <li><strong>Vehicle Physics:</strong> Realistic car behavior with acceleration, braking, and turning effects</li>
          <li><strong>Trail System:</strong> Dynamic trail rendering with speed-based thickness and event highlighting</li>
          <li><strong>Enhanced Car Model:</strong> Improved 3D car with physics-based animations, working lights, and engine effects</li>
          <li><strong>Camera System:</strong> Following camera with dynamic positioning based on speed and events</li>
          <li><strong>Event Detection:</strong> Visual indicators for harsh braking, acceleration, swerving, and over-speed</li>
          <li><strong>Dual View Modes:</strong> Switch between enhanced 3D view and traditional 2D view</li>
          <li><strong>Fullscreen Support:</strong> Immersive fullscreen experience with keyboard controls</li>
        </ul>
        
        <h4>Controls:</h4>
        <ul>
          <li><strong>Space:</strong> Play/Pause simulation</li>
          <li><strong>R:</strong> Reset to beginning</li>
          <li><strong>F:</strong> Toggle fullscreen</li>
          <li><strong>Escape:</strong> Exit fullscreen</li>
        </ul>
      </div>
    </div>
  );
}
