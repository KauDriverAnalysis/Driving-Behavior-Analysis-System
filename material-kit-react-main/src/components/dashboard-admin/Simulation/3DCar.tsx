'use client';

import * as React from 'react';

interface CarProps {
  position: { x: number; y: number };
  rotation?: number;
  color?: string;
  scale?: number;
  hasEvent?: boolean;
  eventColor?: string;
  speed?: number;
  acceleration?: { x: number; y: number };
  engineRunning?: boolean;
}

export function Car3D({ 
  position, 
  rotation = 0, 
  color = '#ff6b6b', 
  scale = 1,
  hasEvent = false,
  eventColor = '#f44336',
  speed = 0,
  acceleration = { x: 0, y: 0 },
  engineRunning = true
}: CarProps) {
  const carRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (carRef.current) {
      // Apply smooth transition and rotation
      carRef.current.style.transform = `
        translate(${position.x}px, ${position.y}px) 
        rotate(${rotation}deg) 
        scale(${scale})
      `;
    }
  }, [position, rotation, scale]);

  // Add CSS animation styles
  React.useEffect(() => {
    if (!document.getElementById('car3d-styles')) {
      const style = document.createElement('style');
      style.id = 'car3d-styles';
      style.textContent = `
        @keyframes pulse {
          from { opacity: 0.6; }
          to { opacity: 1; }
        }
        
        @keyframes engineIdle {
          0%, 100% { transform: translate(0px, 0px); }
          50% { transform: translate(0.5px, 0px); }
        }
        
        @keyframes highSpeedGlow {
          0%, 100% { 
            filter: brightness(1) drop-shadow(0 0 5px rgba(255, 255, 255, 0.3));
          }
          50% { 
            filter: brightness(1.2) drop-shadow(0 0 15px rgba(0, 255, 255, 0.8));
          }
        }
        
        @keyframes brakeGlow {
          0%, 100% { 
            filter: brightness(1);
          }
          50% { 
            filter: brightness(1.5) drop-shadow(0 0 10px rgba(255, 0, 0, 0.8));
          }
        }
        
        @keyframes acceleration {
          0% { transform: scaleX(1); }
          50% { transform: scaleX(1.1); }
          100% { transform: scaleX(1); }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const carColor = hasEvent ? eventColor : color;
  const roofColor = hasEvent ? eventColor : '#cc5555';
  
  // Calculate physics effects
  const speedIntensity = Math.min(speed / 100, 1);
  const accelerationMagnitude = Math.sqrt(acceleration.x ** 2 + acceleration.y ** 2);
  const isHardBraking = acceleration.x < -0.3;
  const isAccelerating = acceleration.x > 0.2;
  const isHighSpeed = speed > 60;
  
  // Dynamic styling based on physics
  const carAnimation = engineRunning ? 'engineIdle 2s ease-in-out infinite' : 'none';
  const speedAnimation = isHighSpeed ? 'highSpeedGlow 1s ease-in-out infinite alternate' : 'none';
  const brakeAnimation = isHardBraking ? 'brakeGlow 0.3s ease-in-out infinite alternate' : 'none';
  const accelAnimation = isAccelerating ? 'acceleration 0.5s ease-in-out infinite' : 'none';

  return (
    <div
      ref={carRef}
      style={{
        position: 'absolute',
        transition: 'transform 0.1s ease-in-out',
        transformOrigin: 'center center',
        width: '32px',
        height: '16px',
        zIndex: 10,
        animation: `${carAnimation}${speedAnimation ? `, ${speedAnimation}` : ''}${brakeAnimation ? `, ${brakeAnimation}` : ''}`
      }}
    >
      {/* Car Body - Main chassis */}
      <div
        style={{
          width: '32px',
          height: '16px',
          background: `linear-gradient(145deg, ${carColor}, ${carColor}dd)`,
          borderRadius: '3px',
          position: 'relative',
          boxShadow: `0 3px 6px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.2)${isHighSpeed ? ', 0 0 15px rgba(0, 255, 255, 0.6)' : ''}`,
          border: '1px solid rgba(255,255,255,0.3)',
          overflow: 'hidden',
          animation: accelAnimation
        }}
      >
        {/* Car roof */}
        <div
          style={{
            width: '22px',
            height: '10px',
            background: `linear-gradient(145deg, ${roofColor}, ${roofColor}cc)`,
            borderRadius: '2px',
            position: 'absolute',
            top: '-2px',
            left: '5px',
            border: '1px solid rgba(255,255,255,0.4)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
          }}
        />

        {/* Front windshield */}
        <div
          style={{
            width: '20px',
            height: '1px',
            background: 'rgba(173, 216, 230, 0.8)',
            position: 'absolute',
            top: '2px',
            left: '6px',
            borderRadius: '1px'
          }}
        />

        {/* Rear windshield */}
        <div
          style={{
            width: '18px',
            height: '1px',
            background: 'rgba(173, 216, 230, 0.6)',
            position: 'absolute',
            bottom: '2px',
            left: '7px',
            borderRadius: '1px'
          }}
        />

        {/* Side windows */}
        <div
          style={{
            width: '1px',
            height: '6px',
            background: 'rgba(173, 216, 230, 0.7)',
            position: 'absolute',
            top: '5px',
            left: '2px'
          }}
        />
        <div
          style={{
            width: '1px',
            height: '6px',
            background: 'rgba(173, 216, 230, 0.7)',
            position: 'absolute',
            top: '5px',
            right: '2px'
          }}
        />

        {/* Headlights */}
        <div
          style={{
            width: '3px',
            height: '2px',
            background: hasEvent || isHighSpeed ? '#fff' : '#ffffcc',
            position: 'absolute',
            top: '1px',
            left: '1px',
            borderRadius: '1px',
            boxShadow: hasEvent || isHighSpeed ? '0 0 4px #fff' : '0 0 2px #ffffcc'
          }}
        />
        <div
          style={{
            width: '3px',
            height: '2px',
            background: hasEvent || isHighSpeed ? '#fff' : '#ffffcc',
            position: 'absolute',
            top: '1px',
            right: '1px',
            borderRadius: '1px',
            boxShadow: hasEvent || isHighSpeed ? '0 0 4px #fff' : '0 0 2px #ffffcc'
          }}
        />

        {/* Tail lights */}
        <div
          style={{
            width: '2px',
            height: '2px',
            background: hasEvent || isHardBraking ? '#ff6666' : '#ff4444',
            position: 'absolute',
            bottom: '1px',
            left: '2px',
            borderRadius: '1px',
            boxShadow: isHardBraking ? '0 0 6px #ff0000' : 'none'
          }}
        />
        <div
          style={{
            width: '2px',
            height: '2px',
            background: hasEvent || isHardBraking ? '#ff6666' : '#ff4444',
            position: 'absolute',
            bottom: '1px',
            right: '2px',
            borderRadius: '1px',
            boxShadow: isHardBraking ? '0 0 6px #ff0000' : 'none'
          }}
        />
      </div>

      {/* Wheels */}
      <div style={{ position: 'absolute', top: '-2px', left: '-2px', width: '4px', height: '4px', background: '#222', borderRadius: '50%', border: '1px solid #444', boxShadow: '0 1px 2px rgba(0,0,0,0.5)' }} />
      <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '4px', height: '4px', background: '#222', borderRadius: '50%', border: '1px solid #444', boxShadow: '0 1px 2px rgba(0,0,0,0.5)' }} />
      <div style={{ position: 'absolute', bottom: '-2px', left: '-2px', width: '4px', height: '4px', background: '#222', borderRadius: '50%', border: '1px solid #444', boxShadow: '0 1px 2px rgba(0,0,0,0.5)' }} />
      <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '4px', height: '4px', background: '#222', borderRadius: '50%', border: '1px solid #444', boxShadow: '0 1px 2px rgba(0,0,0,0.5)' }} />

      {/* Direction indicator arrow */}
      <div
        style={{
          position: 'absolute',
          top: '-8px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '0',
          height: '0',
          borderLeft: '4px solid transparent',
          borderRight: '4px solid transparent',
          borderBottom: hasEvent ? '8px solid #ffff00' : '8px solid #00ff88',
          filter: hasEvent ? 'drop-shadow(0 0 3px #ffff00)' : 'drop-shadow(0 0 2px #00ff88)'
        }}
      />

      {/* Speed indicator */}
      <div
        style={{
          position: 'absolute',
          top: '-14px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: `${6 + speedIntensity * 4}px`,
          height: '2px',
          background: hasEvent ? '#ff0000' : isHighSpeed ? '#00ffff' : '#00ff00',
          borderRadius: '1px',
          opacity: 0.8 + speedIntensity * 0.2,
          animation: hasEvent ? 'pulse 0.5s infinite alternate' : 'none',
          boxShadow: isHighSpeed ? '0 0 8px rgba(0, 255, 255, 0.6)' : 'none'
        }}
      />

      {/* Exhaust particles for high acceleration */}
      {isAccelerating && engineRunning && (
        <>
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={`exhaust-${i}`}
              style={{
                position: 'absolute',
                bottom: '-8px',
                left: `${14 + i * 2}px`,
                width: '1px',
                height: '1px',
                background: 'rgba(255, 255, 255, 0.6)',
                borderRadius: '50%',
                animation: `pulse ${0.5 + i * 0.2}s ease-out infinite`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </>
      )}

      {/* Event warning glow */}
      {hasEvent && (
        <div
          style={{
            position: 'absolute',
            top: '-4px',
            left: '-4px',
            right: '-4px',
            bottom: '-4px',
            borderRadius: '6px',
            boxShadow: `0 0 12px ${eventColor}`,
            opacity: 0.6,
            animation: 'pulse 1s infinite alternate',
            pointerEvents: 'none'
          }}
        />
      )}
    </div>
  );
}
