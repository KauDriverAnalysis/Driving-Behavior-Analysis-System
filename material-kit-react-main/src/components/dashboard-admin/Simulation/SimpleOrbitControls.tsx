'use client';

import { useRef, useEffect } from 'react';
import { useThree, extend, useFrame } from '@react-three/fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

extend({ OrbitControls });

interface OrbitControlsProps {
  enablePan?: boolean;
  enableZoom?: boolean;
  enableRotate?: boolean;
  maxDistance?: number;
  minDistance?: number;
}

export function SimpleOrbitControls({
  enablePan = true,
  enableZoom = true,
  enableRotate = true,
  maxDistance = 100,
  minDistance = 5
}: OrbitControlsProps) {
  const { camera, gl } = useThree();
  const controlsRef = useRef<OrbitControls>();

  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement);
    controls.enablePan = enablePan;
    controls.enableZoom = enableZoom;
    controls.enableRotate = enableRotate;
    controls.maxDistance = maxDistance;
    controls.minDistance = minDistance;
    controlsRef.current = controls;

    return () => {
      controls.dispose();
    };
  }, [camera, gl, enablePan, enableZoom, enableRotate, maxDistance, minDistance]);

  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.update();
    }
  });

  return null;
}
