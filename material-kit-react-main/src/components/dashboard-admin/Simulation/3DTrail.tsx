'use client';

import * as React from 'react';

interface TrailProps {
  points: Array<{ x: number; y: number; z?: number; event?: string; speed: number }>;
  currentIndex: number;
  containerWidth: number;
  containerHeight: number;
}

export function Trail3D({ points, currentIndex, containerWidth, containerHeight }: TrailProps) {
  React.useEffect(() => {
    if (!document.getElementById('trail3d-styles')) {
      const style = document.createElement('style');
      style.id = 'trail3d-styles';
      style.textContent = `
        .trail-segment {
          position: absolute;
          transform-origin: center;
          pointer-events: none;
        }
        
        .trail-dot {
          position: absolute;
          border-radius: 50%;
          transform-origin: center;
          animation: pulse 2s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% { 
            opacity: 0.6; 
            transform: scale(1);
          }
          50% { 
            opacity: 1; 
            transform: scale(1.2);
          }
        }
        
        @keyframes trailFade {
          from { opacity: 1; }
          to { opacity: 0.3; }
        }
        
        .trail-glow {
          filter: drop-shadow(0 0 6px currentColor);
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const getEventColor = (event?: string) => {
    switch (event) {
      case 'harsh_braking': return '#f44336';
      case 'harsh_acceleration': return '#ff9800';
      case 'swerving': return '#2196f3';
      case 'over_speed': return '#4caf50';
      default: return '#00ff88';
    }
  };

  const getSpeedIntensity = (speed: number) => {
    // Normalize speed to 0-1 range (assuming max speed ~100 km/h)
    return Math.min(speed / 100, 1);
  };

  const visiblePoints = points.slice(Math.max(0, currentIndex - 50), currentIndex + 1);

  return (
    <div style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}>
      {/* Trail lines */}
      <svg 
        width="100%" 
        height="100%" 
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <defs>
          <linearGradient id="trailGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00ff88" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#2196f3" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ff6b6b" stopOpacity="0.4" />
          </linearGradient>
          
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/> 
            </feMerge>
          </filter>
        </defs>
        
        {visiblePoints.map((point, index) => {
          if (index === 0) return null;
          const prevPoint = visiblePoints[index - 1];
          
          const opacity = Math.max(0.2, (index / visiblePoints.length) * 0.8);
          const strokeWidth = 2 + getSpeedIntensity(point.speed) * 3;
          
          return (
            <line
              key={index}
              x1={prevPoint.x}
              y1={prevPoint.y}
              x2={point.x}
              y2={point.y}
              stroke={point.event ? getEventColor(point.event) : "url(#trailGradient)"}
              strokeWidth={strokeWidth}
              opacity={opacity}
              filter="url(#glow)"
              strokeLinecap="round"
            />
          );
        })}
      </svg>

      {/* Trail dots for events */}
      {visiblePoints.map((point, index) => {
        if (!point.event) return null;
        
        const absoluteIndex = Math.max(0, currentIndex - 50) + index;
        const age = currentIndex - absoluteIndex;
        const opacity = Math.max(0.3, 1 - (age / 50));
        
        return (
          <div
            key={`dot-${absoluteIndex}`}
            className="trail-dot trail-glow"
            style={{
              left: point.x - 4,
              top: point.y - 4,
              width: 8,
              height: 8,
              backgroundColor: getEventColor(point.event),
              opacity,
              transform: `translateZ(${10 + getSpeedIntensity(point.speed) * 20}px)`,
              zIndex: 5
            }}
          />
        );
      })}

      {/* Current position highlight */}
      {currentIndex < points.length && (
        <div
          className="trail-dot"
          style={{
            left: points[currentIndex].x - 6,
            top: points[currentIndex].y - 6,
            width: 12,
            height: 12,
            backgroundColor: '#ffffff',
            opacity: 1,
            transform: 'translateZ(20px)',
            zIndex: 10,
            boxShadow: '0 0 15px rgba(255, 255, 255, 0.8)'
          }}
        />
      )}

      {/* Speed visualization particles */}
      {currentIndex < points.length && points[currentIndex].speed > 30 && (
        <>
          {Array.from({ length: Math.floor(getSpeedIntensity(points[currentIndex].speed) * 5) }, (_, i) => (
            <div
              key={`particle-${i}`}
              style={{
                position: 'absolute',
                left: points[currentIndex].x + (Math.random() - 0.5) * 30,
                top: points[currentIndex].y + (Math.random() - 0.5) * 30,
                width: 2,
                height: 2,
                backgroundColor: '#ffffff',
                borderRadius: '50%',
                opacity: 0.6,
                transform: `translateZ(${5 + Math.random() * 15}px)`,
                animation: `trailFade ${1 + Math.random()}s ease-out forwards`
              }}
            />
          ))}
        </>
      )}
    </div>
  );
}
