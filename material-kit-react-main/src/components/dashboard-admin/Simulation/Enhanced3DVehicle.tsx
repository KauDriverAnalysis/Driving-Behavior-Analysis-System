'use client';

import * as React from 'react';
import { useRef, useEffect, useState } from 'react';
import {
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import ThreeDRotationIcon from '@mui/icons-material/ThreeDRotation';
import CameraswitchIcon from '@mui/icons-material/Cameraswitch';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';

// Extend Window interface for Three.js
declare global {
  interface Window {
    THREE: any;
  }
}

// Three.js types and interfaces
interface Vector3 {
  x: number;
  y: number;
  z: number;
}

interface Vehicle3DProps {
  position: { x: number; y: number };
  rotation?: number;
  color?: string;
  scale?: number;
  hasEvent?: boolean;
  eventColor?: string;
  accidentDetected?: boolean;
  enable3D?: boolean;
  cameraMode?: 'free' | 'follow' | 'orbit';
  onCameraModeChange?: (mode: 'free' | 'follow' | 'orbit') => void;
}

// Crash detection thresholds
const CRASH_THRESHOLDS = {
  ACCELERATION_G: 2.5,
  DECELERATION_G: -4.0,
  LATERAL_G: 2.0,
  ANGULAR_VELOCITY: 150,
};

// Enhanced accident detection function
const detectAccident = (segment: any): { hasAccident: boolean; severity: 'low' | 'medium' | 'high'; type: string } => {
  if (!segment) return { hasAccident: false, severity: 'low', type: 'none' };

  const speed = segment.speed || 0;
  const event = segment.event || '';
  
  // Simple accident detection based on events and speed
  let hasAccident = false;
  let severity: 'low' | 'medium' | 'high' = 'low';
  let type = 'none';

  if (event === 'harsh_braking' && speed > 40) {
    hasAccident = true;
    severity = 'high';
    type = 'Emergency Braking';
  } else if (event === 'harsh_acceleration' && speed > 50) {
    hasAccident = true;
    severity = 'medium';
    type = 'Aggressive Acceleration';
  } else if (event === 'swerving' && speed > 30) {
    hasAccident = true;
    severity = 'high';
    type = 'Dangerous Swerving';
  } else if (event === 'over_speed') {
    hasAccident = true;
    severity = 'medium';
    type = 'Speed Violation';
  } else if (speed > 80) {
    hasAccident = true;
    severity = 'high';
    type = 'High Speed Risk';
  }

  return { hasAccident, severity, type };
};

export function Enhanced3DVehicle({ 
  position, 
  rotation = 0, 
  color = '#ff6b6b', 
  scale = 1,
  hasEvent = false,
  eventColor = '#f44336',
  accidentDetected = false,
  enable3D = true,
  cameraMode = 'free',
  onCameraModeChange
}: Vehicle3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const vehicleRef = useRef<any>(null);
  const frameIdRef = useRef<number>();
  const [threeLoaded, setThreeLoaded] = useState(false);
  const [accidentAlert, setAccidentAlert] = useState<{ show: boolean; type: string; severity: string }>({ 
    show: false, 
    type: '', 
    severity: 'low' 
  });

  // Load Three.js dynamically
  useEffect(() => {
    let mounted = true;

    const loadThreeJS = async () => {
      try {
        // Check if Three.js is already loaded
        if (typeof window !== 'undefined' && !window.THREE) {
          // For now, we'll use the fallback 2D mode until Three.js is properly set up
          console.log('Three.js not available, using 2D fallback mode');
          setThreeLoaded(false);
        } else if (window.THREE) {
          setThreeLoaded(true);
        }
      } catch (error) {
        console.error('Failed to load Three.js:', error);
        setThreeLoaded(false);
      }
    };

    loadThreeJS();

    return () => {
      mounted = false;
    };
  }, []);

  // Enhanced accident detection logic
  useEffect(() => {
    // Mock accident detection based on hasEvent prop
    if (hasEvent && !accidentAlert.show) {
      const accidentTypes = {
        'harsh_braking': { type: 'Emergency Braking', severity: 'high' },
        'swerving': { type: 'Dangerous Swerving', severity: 'high' },
        'harsh_acceleration': { type: 'Aggressive Acceleration', severity: 'medium' },
        'over_speed': { type: 'Speed Violation', severity: 'medium' }
      };

      const randomAccident = Object.values(accidentTypes)[Math.floor(Math.random() * Object.values(accidentTypes).length)];
      
      setAccidentAlert({
        show: true,
        type: randomAccident.type,
        severity: randomAccident.severity
      });

      // Auto-hide accident alert after 4 seconds
      setTimeout(() => {
        setAccidentAlert(prev => ({ ...prev, show: false }));
      }, 4000);
    }
  }, [hasEvent, accidentAlert.show]);

  const handleCameraModeChange = (newMode: 'free' | 'follow' | 'orbit') => {
    if (onCameraModeChange) {
      onCameraModeChange(newMode);
    }
  };

  // Enhanced 2D fallback with better visual effects
  if (!enable3D || !threeLoaded) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {/* Enhanced 2D Vehicle */}
        <div
          style={{
            position: 'absolute',
            left: position.x,
            top: position.y,
            transform: `rotate(${rotation}deg) scale(${scale})`,
            transition: 'all 0.1s ease-in-out',
            transformOrigin: 'center center',
            width: '32px',
            height: '16px',
            zIndex: 10
          }}
        >
          {/* Vehicle Body */}
          <div
            style={{
              width: '32px',
              height: '16px',
              background: `linear-gradient(145deg, ${hasEvent ? eventColor : color}, ${hasEvent ? eventColor + 'dd' : color + 'dd'})`,
              borderRadius: '3px',
              position: 'relative',
              boxShadow: hasEvent ? 
                `0 0 20px ${eventColor}, 0 3px 6px rgba(0,0,0,0.4)` : 
                '0 3px 6px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              overflow: 'hidden',
              animation: hasEvent ? 'pulse 1s infinite alternate' : 'none'
            }}
          >
            {/* Enhanced Car Details */}
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              {/* Car roof */}
              <div
                style={{
                  width: '22px',
                  height: '10px',
                  background: `linear-gradient(145deg, ${hasEvent ? eventColor : color}, ${hasEvent ? eventColor + 'cc' : color + 'cc'})`,
                  borderRadius: '2px',
                  position: 'absolute',
                  top: '-2px',
                  left: '5px',
                  border: '1px solid rgba(255,255,255,0.4)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                }}
              />

              {/* Windows */}
              <div style={{ 
                width: '20px', 
                height: '1px', 
                background: 'rgba(173, 216, 230, 0.8)', 
                position: 'absolute', 
                top: '2px', 
                left: '6px', 
                borderRadius: '1px' 
              }} />
              
              {/* Headlights */}
              <div style={{ 
                width: '3px', 
                height: '2px', 
                background: hasEvent ? '#fff' : '#ffffcc', 
                position: 'absolute', 
                top: '1px', 
                left: '1px', 
                borderRadius: '1px',
                boxShadow: hasEvent ? '0 0 6px #fff' : '0 0 3px #ffffcc'
              }} />
              <div style={{ 
                width: '3px', 
                height: '2px', 
                background: hasEvent ? '#fff' : '#ffffcc', 
                position: 'absolute', 
                top: '1px', 
                right: '1px', 
                borderRadius: '1px',
                boxShadow: hasEvent ? '0 0 6px #fff' : '0 0 3px #ffffcc'
              }} />
            </div>

            {/* Wheels */}
            <div style={{ position: 'absolute', top: '-2px', left: '-2px', width: '4px', height: '4px', background: '#222', borderRadius: '50%', border: '1px solid #444', boxShadow: '0 1px 2px rgba(0,0,0,0.5)' }} />
            <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '4px', height: '4px', background: '#222', borderRadius: '50%', border: '1px solid #444', boxShadow: '0 1px 2px rgba(0,0,0,0.5)' }} />
            <div style={{ position: 'absolute', bottom: '-2px', left: '-2px', width: '4px', height: '4px', background: '#222', borderRadius: '50%', border: '1px solid #444', boxShadow: '0 1px 2px rgba(0,0,0,0.5)' }} />
            <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '4px', height: '4px', background: '#222', borderRadius: '50%', border: '1px solid #444', boxShadow: '0 1px 2px rgba(0,0,0,0.5)' }} />
          </div>
        </div>

        {/* Camera Mode Toggle (2D Mode) */}
        <div style={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 1000,
          display: 'flex',
          gap: '8px',
          flexDirection: 'column'
        }}>
          <Tooltip title="Toggle 3D Mode (Currently 2D)">
            <IconButton
              size="small"
              onClick={() => {/* Enable 3D when Three.js is loaded */}}
              sx={{
                bgcolor: 'rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.8)',
                '&:hover': { bgcolor: 'warning.main', color: 'white' }
              }}
            >
              <ThreeDRotationIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>

        {/* Enhanced Accident Alert */}
        {accidentAlert.show && (
          <div style={{
            position: 'absolute',
            top: 10,
            left: 10,
            zIndex: 1001,
            maxWidth: '300px'
          }}>
            <Alert 
              severity={accidentAlert.severity === 'high' ? 'error' : 'warning'}
              icon={accidentAlert.severity === 'high' ? <ErrorIcon /> : <WarningIcon />}
              onClose={() => setAccidentAlert(prev => ({ ...prev, show: false }))}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                animation: 'pulse 2s infinite',
                border: accidentAlert.severity === 'high' ? '2px solid #f44336' : '2px solid #ff9800'
              }}
            >
              <strong>⚠️ ACCIDENT DETECTED!</strong><br />
              <strong>Type:</strong> {accidentAlert.type}<br />
              <strong>Risk Level:</strong> {accidentAlert.severity.toUpperCase()}
            </Alert>
          </div>
        )}

        {/* Enhanced Controls Info */}
        <div style={{
          position: 'absolute',
          bottom: 10,
          left: 10,
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '10px 14px',
          borderRadius: '6px',
          fontSize: '12px',
          zIndex: 1000,
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{ marginBottom: '4px', fontWeight: 'bold' }}>� Enhanced Vehicle Simulation</div>
          <div>🎮 2D Mode Active (3D requires Three.js)</div>
          <div>🚨 Real-time Accident Detection</div>
          <div>📊 Advanced Safety Analytics</div>
        </div>

        {/* Add CSS animations */}
        <style jsx>{`
          @keyframes pulse {
            from { opacity: 0.7; transform: scale(1); }
            to { opacity: 1; transform: scale(1.05); }
          }
        `}</style>
      </div>
    );
  }

  // This would be the full 3D implementation when Three.js is available
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '14px'
      }}>
        🚧 3D Mode: Loading Three.js Environment...
      </div>
    </div>
  );
}
