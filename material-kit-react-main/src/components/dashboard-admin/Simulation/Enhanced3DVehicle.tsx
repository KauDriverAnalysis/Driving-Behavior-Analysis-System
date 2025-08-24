'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Helper for Catmull-Rom spline interpolation
function getCatmullRomSpline(points: {x: number, y: number, z: number}[], segments = 200) {
  if (points.length < 2) return null;
  const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(p.x, p.y, p.z)));
  return curve.getPoints(segments);
}

interface VehicleData {
  time: string;
  lat: number;
  lng: number;
  speed: number;
  event?: string;
  score: number;
  ax?: number;
  ay?: number;
  az?: number;
  gx?: number;
  gy?: number;
  gz?: number;
  yaw?: number;
}

interface Enhanced3DVehicleProps {
  allData: VehicleData[];
  currentIndex: number;
  followCamera?: boolean;
  showTrail?: boolean;
}

export function Enhanced3DVehicle({ 
  allData, 
  currentIndex, 
  followCamera = true,
  showTrail = true 
}: Enhanced3DVehicleProps) {
  const meshRef = useRef<THREE.Group>(null);
  const trailRef = useRef<THREE.Points>(null);
  const { camera } = useThree();
  
  // Pre-calculate all positions from GPS data
  const [vehiclePath, setVehiclePath] = useState<any[]>([]);

  // Convert GPS coordinates to world positions
  const gpsToWorldPosition = (lat: number, lon: number, refLat: number, refLon: number) => {
    const earthRadius = 6371000; // meters
    const dLat = (lat - refLat) * Math.PI / 180;
    const dLon = (lon - refLon) * Math.PI / 180;
    
    const x = dLon * earthRadius * Math.cos(refLat * Math.PI / 180) * 0.1; // Scale down
    const z = dLat * earthRadius * 0.1; // Scale down
    
    return { x, z };
  };

  // Calculate bearing between two GPS coordinates
  const calculateBearing = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;
    
    const y = Math.sin(dLon) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - 
              Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
    
    let bearing = Math.atan2(y, x);
    
    return bearing;
  };

  // Pre-calculate vehicle path from GPS data
  useEffect(() => {
    if (allData.length === 0) return;

    const firstValidGPS = allData.find(d => d.lat && d.lng);
    if (!firstValidGPS) return;

    const refLat = firstValidGPS.lat;
    const refLon = firstValidGPS.lng;

    const path = allData.map((data, index) => {
      let position = { x: 0, z: 0 };
      let heading = 0;

      // Use GPS data if available
      if (data.lat && data.lng) {
        position = gpsToWorldPosition(data.lat, data.lng, refLat, refLon);

        // Calculate heading from GPS movement
        if (index > 0 && allData[index - 1].lat && allData[index - 1].lng) {
          heading = calculateBearing(
            allData[index - 1].lat, allData[index - 1].lng,
            data.lat, data.lng
          );
        }
      } else if (index > 0) {
        // Fallback: estimate position from previous position and speed/heading
        const prevPos = path[index - 1]?.position || { x: 0, z: 0 };
        const speed = (data.speed || 0) / 3.6; // Convert km/h to m/s
        const deltaTime = 0.1; // Assume 10Hz data rate

        position = {
          x: prevPos.x + speed * Math.sin(heading) * deltaTime,
          z: prevPos.z + speed * Math.cos(heading) * deltaTime
        };
      }

      const isEvent = !!data.event;
      const isCrash = data.event === 'harsh_braking' || data.event === 'harsh_acceleration';

      return {
        position,
        heading,
        speed: data.speed || 0,
        acceleration: {
          x: data.ax || 0,
          y: data.ay || 0,
          z: data.az || 0
        },
        gyro: {
          x: data.gx || 0,
          y: data.gy || 0,
          z: data.gz || 0
        },
        time: data.time,
        event: data.event,
        score: data.score,
        isEvent,
        isCrash
      };
    });

    setVehiclePath(path);
  }, [allData]);

  // Update vehicle position based on current data index
  useEffect(() => {
    if (!meshRef.current || vehiclePath.length === 0) return;
    
    const currentVehicleData = vehiclePath[currentIndex];
    if (!currentVehicleData) return;

    const { position, heading, acceleration, isCrash, isEvent } = currentVehicleData;

    // Position the vehicle
    meshRef.current.position.set(position.x, 1.0, position.z);
    meshRef.current.rotation.y = heading;

    // Add effects for events
    if (isCrash) {
      // Violent shaking based on acceleration
      const shakeIntensity = Math.sqrt(
        acceleration.x * acceleration.x + 
        acceleration.y * acceleration.y + 
        acceleration.z * acceleration.z
      ) * 0.05;

      meshRef.current.position.x += (Math.random() - 0.5) * shakeIntensity;
      meshRef.current.position.z += (Math.random() - 0.5) * shakeIntensity;
      
      // Banking/tilting during events
      meshRef.current.rotation.z = acceleration.y * 0.1;
      meshRef.current.rotation.x = -acceleration.x * 0.05;
    } else {
      // Reset rotations when not in event
      meshRef.current.rotation.z = 0;
      meshRef.current.rotation.x = 0;
    }

  }, [currentIndex, vehiclePath]);

  // Smooth camera following
  useFrame(() => {
    if (!followCamera || !meshRef.current || vehiclePath.length === 0) return;

    const currentVehicleData = vehiclePath[currentIndex];
    if (!currentVehicleData) return;

    const { position, speed, isCrash } = currentVehicleData;
    
    // Dynamic camera positioning based on situation
    let cameraDistance = 15;
    let cameraHeight = 8;
    
    if (isCrash) {
      // During events: closer view
      cameraDistance = 10;
      cameraHeight = 12;
    } else {
      // Normal: distance based on speed
      cameraDistance = 15 + (speed * 0.1);
      cameraHeight = 8 + (speed * 0.05);
    }

    // Calculate target camera position
    const targetX = position.x - Math.sin(currentVehicleData.heading) * cameraDistance;
    const targetZ = position.z - Math.cos(currentVehicleData.heading) * cameraDistance;
    const targetY = cameraHeight;

    // Smooth camera movement
    const lerpSpeed = isCrash ? 0.1 : 0.05;
    camera.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), lerpSpeed);
    
    // Look at vehicle
    const lookAtX = position.x + Math.sin(currentVehicleData.heading) * 2;
    const lookAtZ = position.z + Math.cos(currentVehicleData.heading) * 2;
    camera.lookAt(lookAtX, 1.0, lookAtZ);
  });

  // Create car model
  const createCarModel = () => {
    const currentVehicleData = vehiclePath[currentIndex] || {};
    const { isEvent, event } = currentVehicleData;

    // Color based on event
    let bodyColor = '#2e5cb8'; // Default blue
    if (event === 'harsh_braking') bodyColor = '#ff0000'; // Red
    else if (event === 'harsh_acceleration') bodyColor = '#ff8800'; // Orange
    else if (event === 'swerving') bodyColor = '#ffff00'; // Yellow
    else if (event === 'over_speed') bodyColor = '#ff00ff'; // Magenta

    return (
      <group ref={meshRef}>
        {/* Main body */}
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[1.8, 0.5, 4.2]} />
          <meshPhongMaterial args={[{ color: bodyColor, shininess: 100 }]} />
        </mesh>

        {/* Windshield */}
        <mesh position={[0, 0.6, 1.2]}>
          <boxGeometry args={[1.6, 0.3, 1.0]} />
          <meshPhongMaterial args={[{ color: "#87ceeb", transparent: true, opacity: 0.7 }]} />
        </mesh>

        {/* Wheels */}
        {[
          [-0.8, 0, 1.4] as [number, number, number],   // Front left
          [0.8, 0, 1.4] as [number, number, number],    // Front right
          [-0.8, 0, -1.4] as [number, number, number],  // Rear left
          [0.8, 0, -1.4] as [number, number, number]    // Rear right
        ].map((pos, index) => (
          <mesh key={index} position={pos} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
            <meshPhongMaterial args={[{ color: "#222" }]} />
          </mesh>
        ))}

        {/* Event indicator light */}
        {isEvent && (
          <mesh position={[0, 1.0, 0]}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshBasicMaterial args={[{ color: bodyColor }]} />
          </mesh>
        )}
      </group>
    );
  };

  // Memoized smooth trail points
  const smoothTrailPoints = useMemo(() => {
    if (!showTrail || vehiclePath.length < 2) return null;
    // Use y=1.0 for all points for a floating effect
    const points = vehiclePath.map(p => ({ x: p.position.x, y: 1.0, z: p.position.z }));
    return getCatmullRomSpline(points, Math.max(200, points.length * 2));
  }, [vehiclePath, showTrail]);

  // Memoized trail color gradient
  const trailColors = useMemo(() => {
    if (!smoothTrailPoints || !vehiclePath.length) return null;
    // Color: blue to cyan, highlight event points as red/orange/yellow
    return smoothTrailPoints.map((pt, i) => {
      // Find closest original path index
      const origIdx = Math.round(i * (vehiclePath.length - 1) / (smoothTrailPoints.length - 1));
      const event = vehiclePath[origIdx]?.event;
      if (event === 'harsh_braking') return [1, 0, 0]; // Red
      if (event === 'harsh_acceleration') return [1, 0.5, 0]; // Orange
      if (event === 'swerving') return [1, 1, 0]; // Yellow
      if (event === 'over_speed') return [1, 0, 1]; // Magenta
      // Default: blue to cyan gradient
      const t = i / (smoothTrailPoints.length - 1);
      return [0, 0.5 + 0.5 * t, 1];
    });
  }, [smoothTrailPoints, vehiclePath]);

  // Create trail geometry for the line
  const trailLineGeometry = useMemo(() => {
    if (!smoothTrailPoints) return null;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(smoothTrailPoints.length * 3);
    const colors = new Float32Array(smoothTrailPoints.length * 3);
    smoothTrailPoints.forEach((pt, i) => {
      positions[i * 3] = pt.x;
      positions[i * 3 + 1] = pt.y;
      positions[i * 3 + 2] = pt.z;
      if (trailColors) {
        colors[i * 3] = trailColors[i][0];
        colors[i * 3 + 1] = trailColors[i][1];
        colors[i * 3 + 2] = trailColors[i][2];
      }
    });
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geometry;
  }, [smoothTrailPoints, trailColors]);

  return (
    <>
      {/* Nicer Trail as a smooth line */}
      {showTrail && trailLineGeometry && (
        <line geometry={trailLineGeometry}>
          <lineBasicMaterial vertexColors transparent opacity={0.7} />
        </line>
      )}

      {/* Vehicle */}
      {createCarModel()}

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshLambertMaterial args={[{ color: "#1a4a1a" }]} />
      </mesh>

      {/* Simple grid using lines */}
      <primitive object={new THREE.GridHelper(100, 50, '#444', '#222')} />
    </>
  );
}
