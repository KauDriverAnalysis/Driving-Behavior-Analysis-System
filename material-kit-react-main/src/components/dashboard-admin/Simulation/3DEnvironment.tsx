'use client';

import * as React from 'react';
import { Box } from '@mui/material';

interface Environment3DProps {
  width: number;
  height: number;
  cameraPosition: { x: number; y: number; z: number };
  children: React.ReactNode;
}

export function Environment3D({ width, height, cameraPosition, children }: Environment3DProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!document.getElementById('environment3d-styles')) {
      const style = document.createElement('style');
      style.id = 'environment3d-styles';
      style.textContent = `
        .environment-3d {
          perspective: 1000px;
          perspective-origin: 50% 50%;
        }
        
        .scene-3d {
          transform-style: preserve-3d;
          transition: transform 0.3s ease-out;
        }
        
        .grid-3d {
          transform-style: preserve-3d;
        }
        
        .grid-line {
          position: absolute;
          background: rgba(255, 255, 255, 0.1);
          transform-origin: center;
        }
        
        .ground-plane {
          position: absolute;
          background: linear-gradient(45deg, 
            rgba(0, 50, 100, 0.1) 0%, 
            rgba(0, 100, 200, 0.05) 50%, 
            rgba(0, 50, 100, 0.1) 100%);
          transform-origin: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }
        
        @keyframes rotate {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const sceneTransform = `
    rotateX(${-cameraPosition.y * 0.5}deg) 
    rotateY(${cameraPosition.x * 0.3}deg) 
    translateZ(${cameraPosition.z}px)
  `;

  return (
    <Box
      ref={containerRef}
      className="environment-3d"
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(to bottom, #0d1421 0%, #1a237e 50%, #1565c0 100%)',
      }}
    >
      <div 
        className="scene-3d"
        style={{
          width: '100%',
          height: '100%',
          transform: sceneTransform,
          position: 'relative'
        }}
      >
        {/* Ground Plane Grid */}
        <div className="grid-3d">
          {/* Main ground plane */}
          <div
            className="ground-plane"
            style={{
              width: `${width * 2}px`,
              height: `${height * 2}px`,
              left: `-${width / 2}px`,
              top: `-${height / 2}px`,
              transform: 'rotateX(70deg) translateZ(-100px)'
            }}
          />
          
          {/* Grid lines - Horizontal */}
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={`h-${i}`}
              className="grid-line"
              style={{
                width: `${width * 2}px`,
                height: '1px',
                left: `-${width / 2}px`,
                top: `${(i - 10) * 50}px`,
                transform: 'rotateX(70deg) translateZ(-99px)'
              }}
            />
          ))}
          
          {/* Grid lines - Vertical */}
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={`v-${i}`}
              className="grid-line"
              style={{
                width: '1px',
                height: `${height * 2}px`,
                left: `${(i - 10) * 50}px`,
                top: `-${height / 2}px`,
                transform: 'rotateX(70deg) translateZ(-99px)'
              }}
            />
          ))}
        </div>

        {/* Ambient elements */}
        <div style={{ position: 'absolute', top: '10%', left: '10%', transform: 'translateZ(50px)' }}>
          <div
            style={{
              width: '4px',
              height: '20px',
              background: 'rgba(255, 255, 0, 0.6)',
              borderRadius: '2px',
              animation: 'float 2s ease-in-out infinite',
              boxShadow: '0 0 10px rgba(255, 255, 0, 0.4)'
            }}
          />
        </div>

        <div style={{ position: 'absolute', top: '20%', right: '15%', transform: 'translateZ(30px)' }}>
          <div
            style={{
              width: '6px',
              height: '6px',
              background: 'rgba(0, 255, 255, 0.8)',
              borderRadius: '50%',
              animation: 'float 3s ease-in-out infinite',
              boxShadow: '0 0 15px rgba(0, 255, 255, 0.6)'
            }}
          />
        </div>

        {/* Content container with proper 3D positioning */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d'
          }}
        >
          {children}
        </div>
      </div>
    </Box>
  );
}
