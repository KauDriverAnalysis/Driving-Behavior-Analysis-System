'use client';

import * as React from 'react';

interface VehiclePhysicsProps {
  currentData: {
    speed: number;
    lat: number;
    lng: number;
    event?: string;
    score: number;
    time: string;
  };
  prevData?: {
    speed: number;
    lat: number;
    lng: number;
    event?: string;
    score: number;
    time: string;
  };
  position: { x: number; y: number };
  children: React.ReactNode;
}

export function VehiclePhysics({ currentData, prevData, position, children }: VehiclePhysicsProps) {
  const [vehicleState, setVehicleState] = React.useState({
    velocity: { x: 0, y: 0 },
    acceleration: { x: 0, y: 0 },
    heading: 0,
    angularVelocity: 0
  });

  React.useEffect(() => {
    if (!prevData) return;

    // Calculate physics-based movement
    const deltaTime = 0.1; // Assume 100ms between updates
    
    // Calculate velocity from position change
    const velocityX = (position.x - (prevData ? calculatePosition(prevData).x : position.x)) / deltaTime;
    const velocityY = (position.y - (prevData ? calculatePosition(prevData).y : position.y)) / deltaTime;
    
    // Calculate acceleration from velocity change
    const accelX = (velocityX - vehicleState.velocity.x) / deltaTime;
    const accelY = (velocityY - vehicleState.velocity.y) / deltaTime;
    
    // Calculate heading from GPS movement
    const deltaLng = currentData.lng - (prevData?.lng || currentData.lng);
    const deltaLat = currentData.lat - (prevData?.lat || currentData.lat);
    const newHeading = Math.atan2(deltaLng, deltaLat);
    
    // Calculate angular velocity
    let deltaHeading = newHeading - vehicleState.heading;
    while (deltaHeading > Math.PI) deltaHeading -= 2 * Math.PI;
    while (deltaHeading < -Math.PI) deltaHeading += 2 * Math.PI;
    const angularVel = deltaHeading / deltaTime;

    setVehicleState({
      velocity: { x: velocityX, y: velocityY },
      acceleration: { x: accelX, y: accelY },
      heading: newHeading,
      angularVelocity: angularVel
    });
  }, [currentData, prevData, position]);

  const calculatePosition = (data: typeof currentData) => {
    // This would be implemented based on your GPS to screen coordinate conversion
    return { x: 0, y: 0 };
  };

  // Calculate physics effects
  const speedIntensity = Math.min(currentData.speed / 100, 1);
  const accelerationIntensity = Math.sqrt(
    vehicleState.acceleration.x ** 2 + vehicleState.acceleration.y ** 2
  ) * 0.1;
  
  const isHarshEvent = currentData.event?.includes('harsh');
  const isSwerving = currentData.event === 'swerving';
  
  // Calculate banking/tilting effects
  const bankingAngle = Math.min(Math.abs(vehicleState.angularVelocity) * 10, 15); // Max 15 degrees
  const accelerationTilt = Math.min(accelerationIntensity * 5, 10); // Max 10 degrees

  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    left: position.x,
    top: position.y,
    transform: `
      translateZ(${speedIntensity * 10}px)
      rotateZ(${isSwerving ? Math.sin(Date.now() * 0.01) * bankingAngle : vehicleState.angularVelocity * 5}deg)
      rotateX(${isHarshEvent ? accelerationTilt : 0}deg)
    `,
    transformOrigin: 'center center',
    transition: isHarshEvent ? 'none' : 'transform 0.1s ease-out',
    zIndex: 20
  };

  // Add shake effect for harsh events
  if (isHarshEvent) {
    const shakeIntensity = accelerationIntensity * 2;
    containerStyle.animation = `shake 0.1s infinite`;
    
    // Inject shake animation if not exists
    React.useEffect(() => {
      if (!document.getElementById('vehicle-physics-styles')) {
        const style = document.createElement('style');
        style.id = 'vehicle-physics-styles';
        style.textContent = `
          @keyframes shake {
            0%, 100% { transform: translate(0px, 0px) rotateZ(0deg); }
            25% { transform: translate(1px, 1px) rotateZ(1deg); }
            50% { transform: translate(-1px, 1px) rotateZ(-1deg); }
            75% { transform: translate(1px, -1px) rotateZ(1deg); }
          }
          
          @keyframes speedBoost {
            from { 
              filter: brightness(1) drop-shadow(0 0 5px rgba(255, 255, 255, 0.5));
            }
            to { 
              filter: brightness(1.2) drop-shadow(0 0 15px rgba(0, 255, 255, 0.8));
            }
          }
          
          .high-speed {
            animation: speedBoost 0.5s ease-in-out infinite alternate;
          }
        `;
        document.head.appendChild(style);
      }
    }, []);
  }

  // Add speed boost effect for high speeds
  if (currentData.speed > 80) {
    containerStyle.filter = 'brightness(1.1) drop-shadow(0 0 10px rgba(0, 255, 255, 0.6))';
  }

  return (
    <div 
      style={containerStyle}
      className={currentData.speed > 80 ? 'high-speed' : ''}
    >
      {children}
      
      {/* Physics debug info (optional, can be toggled) */}
      {process.env.NODE_ENV === 'development' && (
        <div
          style={{
            position: 'absolute',
            top: -30,
            left: 0,
            fontSize: '8px',
            color: 'white',
            background: 'rgba(0,0,0,0.7)',
            padding: '2px 4px',
            borderRadius: '2px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none'
          }}
        >
          V: {Math.sqrt(vehicleState.velocity.x ** 2 + vehicleState.velocity.y ** 2).toFixed(1)} | 
          A: {accelerationIntensity.toFixed(2)} | 
          ω: {vehicleState.angularVelocity.toFixed(2)}
        </div>
      )}
    </div>
  );
}
