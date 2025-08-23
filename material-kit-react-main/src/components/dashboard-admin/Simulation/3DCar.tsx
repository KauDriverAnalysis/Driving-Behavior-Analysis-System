'use client';

import * as React from 'react';

interface CarProps {
  position: { x: number; y: number };
  rotation?: number;
  color?: string;
  scale?: number;
  hasEvent?: boolean;
  eventColor?: string;
}

export function Car3D({ 
  position, 
  rotation = 0, 
  color = '#ff6b6b', 
  scale = 1,
  hasEvent = false,
  eventColor = '#f44336'
}: CarProps) {
  const carColor = hasEvent ? eventColor : color;
  const roofColor = hasEvent ? eventColor : '#cc5555';

  return (
    <div
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`,
        transition: 'all 0.1s ease-in-out',
        transformOrigin: 'center center',
        width: '32px',
        height: '16px',
        zIndex: 10
      }}
    >
      {/* Enhanced 3D-style car using CSS transforms */}
      <div
        style={{
          width: '32px',
          height: '16px',
          position: 'relative',
          transform: 'rotateX(15deg) rotateY(2deg)',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Car Body - Main chassis with 3D effect */}
        <div
          style={{
            width: '32px',
            height: '16px',
            background: `linear-gradient(145deg, ${carColor}, ${carColor}aa)`,
            borderRadius: '4px',
            position: 'relative',
            boxShadow: `
              0 4px 8px rgba(0,0,0,0.4),
              inset 0 1px 2px rgba(255,255,255,0.3),
              0 0 0 1px rgba(255,255,255,0.2)
            `,
            border: '1px solid rgba(255,255,255,0.3)',
            overflow: 'visible',
            animation: hasEvent ? 'carPulse 0.5s infinite alternate' : 'none'
          }}
        >
          {/* Car roof with 3D depth */}
          <div
            style={{
              width: '22px',
              height: '10px',
              background: `linear-gradient(145deg, ${roofColor}, ${roofColor}bb)`,
              borderRadius: '3px',
              position: 'absolute',
              top: '-3px',
              left: '5px',
              border: '1px solid rgba(255,255,255,0.4)',
              boxShadow: `
                0 2px 4px rgba(0,0,0,0.3),
                inset 0 1px 1px rgba(255,255,255,0.4)
              `,
              transform: 'translateZ(2px)'
            }}
          />

          {/* Front windshield with 3D perspective */}
          <div
            style={{
              width: '18px',
              height: '2px',
              background: 'linear-gradient(90deg, rgba(173, 216, 230, 0.9), rgba(135, 206, 235, 0.7))',
              position: 'absolute',
              top: '1px',
              left: '7px',
              borderRadius: '1px',
              transform: 'translateZ(1px)',
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.6)'
            }}
          />

          {/* Side windows */}
          <div
            style={{
              width: '3px',
              height: '6px',
              background: 'rgba(173, 216, 230, 0.6)',
              position: 'absolute',
              top: '3px',
              left: '2px',
              borderRadius: '1px',
              transform: 'translateZ(1px)'
            }}
          />
          <div
            style={{
              width: '3px',
              height: '6px',
              background: 'rgba(173, 216, 230, 0.6)',
              position: 'absolute',
              top: '3px',
              right: '2px',
              borderRadius: '1px',
              transform: 'translateZ(1px)'
            }}
          />

          {/* Headlights with glow effect */}
          <div
            style={{
              width: '3px',
              height: '2px',
              background: 'radial-gradient(circle, #ffff99, #ffff66)',
              position: 'absolute',
              top: '7px',
              left: '2px',
              borderRadius: '50%',
              boxShadow: '0 0 4px #ffff99, inset 0 1px 1px rgba(255,255,255,0.8)',
              transform: 'translateZ(2px)'
            }}
          />
          <div
            style={{
              width: '3px',
              height: '2px',
              background: 'radial-gradient(circle, #ffff99, #ffff66)',
              position: 'absolute',
              top: '7px',
              right: '2px',
              borderRadius: '50%',
              boxShadow: '0 0 4px #ffff99, inset 0 1px 1px rgba(255,255,255,0.8)',
              transform: 'translateZ(2px)'
            }}
          />

          {/* Rear lights */}
          <div
            style={{
              width: '2px',
              height: '2px',
              background: hasEvent ? '#ff0000' : '#ff4444',
              position: 'absolute',
              bottom: '2px',
              left: '2px',
              borderRadius: '50%',
              boxShadow: hasEvent ? '0 0 6px #ff0000' : '0 0 3px #ff4444',
              transform: 'translateZ(1px)'
            }}
          />
          <div
            style={{
              width: '2px',
              height: '2px',
              background: hasEvent ? '#ff0000' : '#ff4444',
              position: 'absolute',
              bottom: '2px',
              right: '2px',
              borderRadius: '50%',
              boxShadow: hasEvent ? '0 0 6px #ff0000' : '0 0 3px #ff4444',
              transform: 'translateZ(1px)'
            }}
          />

          {/* Wheels with 3D effect */}
          {[-6, 6].map((leftOffset, i) => (
            <React.Fragment key={i}>
              <div
                style={{
                  width: '4px',
                  height: '4px',
                  background: 'radial-gradient(circle, #444, #222)',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: '-2px',
                  left: `${14 + leftOffset}px`,
                  border: '1px solid #555',
                  boxShadow: '0 2px 3px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.2)',
                  transform: 'translateZ(-1px)'
                }}
              />
              <div
                style={{
                  width: '4px',
                  height: '4px',
                  background: 'radial-gradient(circle, #444, #222)',
                  borderRadius: '50%',
                  position: 'absolute',
                  bottom: '-2px',
                  left: `${14 + leftOffset}px`,
                  border: '1px solid #555',
                  boxShadow: '0 2px 3px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.2)',
                  transform: 'translateZ(-1px)'
                }}
              />
            </React.Fragment>
          ))}

          {/* Speed indicator for events */}
          {hasEvent && (
            <div
              style={{
                position: 'absolute',
                top: '-15px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '8px',
                height: '8px',
                background: 'radial-gradient(circle, #ff0000, #cc0000)',
                borderRadius: '50%',
                boxShadow: '0 0 10px #ff0000',
                animation: 'eventPulse 0.3s infinite alternate'
              }}
            />
          )}
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes carPulse {
          from { 
            opacity: 0.7; 
          }
          to { 
            opacity: 1; 
          }
        }
        
        @keyframes eventPulse {
          from { 
            transform: translateX(-50%) scale(0.8);
            opacity: 0.7;
          }
          to { 
            transform: translateX(-50%) scale(1.2);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}