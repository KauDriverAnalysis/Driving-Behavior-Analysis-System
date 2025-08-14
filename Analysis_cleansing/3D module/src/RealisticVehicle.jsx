import React, { useRef, useEffect, useState } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const RealisticVehicle = ({ 
  allData, 
  currentIndex, 
  crashStartIndex, 
  crashEndIndex, 
  followCamera = true,
  showTrail = true 
}) => {
  const meshRef = useRef()
  const trailRef = useRef([])
  const { camera } = useThree()
  
  // Pre-calculate all positions from GPS data
  const [vehiclePath, setVehiclePath] = useState([])
  const [initialPosition, setInitialPosition] = useState({ x: 0, z: 0 })

  // Convert GPS coordinates to world positions
  const gpsToWorldPosition = (lat, lon, refLat, refLon) => {
    const earthRadius = 6371000 // meters
    const dLat = (lat - refLat) * Math.PI / 180
    const dLon = (lon - refLon) * Math.PI / 180
    
    const x = dLon * earthRadius * Math.cos(refLat * Math.PI / 180)
    const z = dLat * earthRadius
    
    return { x, z }
  }

  // Pre-calculate vehicle path from GPS data
  useEffect(() => {
    if (allData.length === 0) return

    const firstValidGPS = allData.find(d => d.latitude && d.longitude)
    if (!firstValidGPS) return

    const refLat = firstValidGPS.latitude
    const refLon = firstValidGPS.longitude
    
    const path = allData.map((data, index) => {
      let position = { x: 0, z: 0 }
      
      // Use GPS data if available
      if (data.latitude && data.longitude) {
        position = gpsToWorldPosition(data.latitude, data.longitude, refLat, refLon)
      } else if (index > 0) {
        // Fallback: estimate position from previous position and IMU data
        const prevPos = path[index - 1]?.position || { x: 0, z: 0 }
        const speed = (data.speed || 0) / 3.6 // Convert km/h to m/s
        const heading = (data.yaw || 0) * Math.PI / 180
        const deltaTime = 0.1 // Assume 10Hz data rate
        
        position = {
          x: prevPos.x + speed * Math.sin(heading) * deltaTime,
          z: prevPos.z + speed * Math.cos(heading) * deltaTime
        }
      }

      return {
        position,
        heading: (data.yaw || 0) * Math.PI / 180,
        speed: data.speed || 0,
        acceleration: {
          x: data.ax || 0,
          y: data.ay || 0,
          z: data.az || 0
        },
        time: data.time,
        isCrash: index >= crashStartIndex && index <= crashEndIndex
      }
    })

    setVehiclePath(path)
    setInitialPosition(path[0]?.position || { x: 0, z: 0 })
    
    // Pre-generate trail
    trailRef.current = path.map(p => ({
      x: p.position.x,
      y: 1.0,
      z: p.position.z,
      isCrash: p.isCrash
    }))

  }, [allData, crashStartIndex, crashEndIndex])

  // Update vehicle position based on current data index
  useEffect(() => {
    if (!meshRef.current || vehiclePath.length === 0) return
    
    const currentVehicleData = vehiclePath[currentIndex]
    if (!currentVehicleData) return

    const { position, heading, acceleration, isCrash } = currentVehicleData

    // Direct position setting - no smoothing for accurate crash visualization
    meshRef.current.position.set(position.x, 1.0, position.z)
    meshRef.current.rotation.y = heading

    // Add impact effects during crash
    if (isCrash) {
      // Violent shaking based on acceleration
      const shakeIntensity = Math.sqrt(
        acceleration.x * acceleration.x + 
        acceleration.y * acceleration.y + 
        acceleration.z * acceleration.z
      ) * 0.1

      meshRef.current.position.x += (Math.random() - 0.5) * shakeIntensity
      meshRef.current.position.z += (Math.random() - 0.5) * shakeIntensity
      
      // Banking/tilting during crash
      meshRef.current.rotation.z = acceleration.y * 0.2
      meshRef.current.rotation.x = -acceleration.x * 0.1
    } else {
      // Reset rotations when not crashing
      meshRef.current.rotation.z = 0
      meshRef.current.rotation.x = 0
    }

  }, [currentIndex, vehiclePath])

  // Smooth camera following with better crash visualization
  useFrame(() => {
    if (!followCamera || !meshRef.current || vehiclePath.length === 0) return

    const currentVehicleData = vehiclePath[currentIndex]
    if (!currentVehicleData) return

    const { position, speed, isCrash } = currentVehicleData
    
    // Dynamic camera positioning based on situation
    let cameraDistance, cameraHeight, cameraOffset
    
    if (isCrash) {
      // During crash: closer, higher angle for better view
      cameraDistance = 8
      cameraHeight = 12
      cameraOffset = { x: 2, z: -2 } // Slight side angle
    } else {
      // Normal driving: distance based on speed
      cameraDistance = 10 + (speed * 0.1)
      cameraHeight = 6 + (speed * 0.05)
      cameraOffset = { x: 0, z: 0 }
    }

    // Calculate target camera position
    const targetX = position.x - Math.sin(currentVehicleData.heading) * cameraDistance + cameraOffset.x
    const targetZ = position.z - Math.cos(currentVehicleData.heading) * cameraDistance + cameraOffset.z
    const targetY = cameraHeight

    // Smooth camera movement (faster during crash for better tracking)
    const lerpSpeed = isCrash ? 0.15 : 0.08
    camera.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), lerpSpeed)
    
    // Look at vehicle with slight prediction
    const lookAtX = position.x + Math.sin(currentVehicleData.heading) * 2
    const lookAtZ = position.z + Math.cos(currentVehicleData.heading) * 2
    camera.lookAt(lookAtX, 1.0, lookAtZ)
  })

  // Create enhanced car model with crash effects
  const createCarGeometry = () => {
    const carGroup = new THREE.Group()
    const currentVehicleData = vehiclePath[currentIndex] || {}
    const isCrash = currentVehicleData.isCrash
    
    // Main body
    const bodyGeometry = new THREE.BoxGeometry(1.8, 0.5, 4.2)
    const bodyColor = isCrash ? '#ff0000' : '#2e5cb8'
    const bodyMaterial = new THREE.MeshPhongMaterial({ 
      color: bodyColor,
      shininess: isCrash ? 30 : 100
    })
    const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial)
    bodyMesh.position.y = 0.25
    carGroup.add(bodyMesh)

    // Windshield
    const windshieldGeometry = new THREE.BoxGeometry(1.6, 0.3, 1.0)
    const windshieldMaterial = new THREE.MeshPhongMaterial({ 
      color: isCrash ? '#333' : '#87ceeb',
      transparent: true,
      opacity: isCrash ? 0.5 : 0.7
    })
    const windshieldMesh = new THREE.Mesh(windshieldGeometry, windshieldMaterial)
    windshieldMesh.position.set(0, 0.6, 1.2)
    carGroup.add(windshieldMesh)

    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16)
    wheelGeometry.rotateZ(Math.PI / 2)
    const wheelMaterial = new THREE.MeshPhongMaterial({ color: '#222' })
    
    const wheelPositions = [
      [-0.8, 0, 1.4],   // Front left
      [0.8, 0, 1.4],    // Front right
      [-0.8, 0, -1.4],  // Rear left
      [0.8, 0, -1.4]    // Rear right
    ]
    
    wheelPositions.forEach(pos => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial)
      wheel.position.set(...pos)
      carGroup.add(wheel)
    })

    // Crash effects
    if (isCrash && currentVehicleData.acceleration) {
      // Sparks/debris effect
      for (let i = 0; i < 5; i++) {
        const sparkGeometry = new THREE.SphereGeometry(0.02)
        const sparkMaterial = new THREE.MeshBasicMaterial({ 
          color: '#ffaa00',
          transparent: true,
          opacity: 0.8
        })
        const spark = new THREE.Mesh(sparkGeometry, sparkMaterial)
        spark.position.set(
          (Math.random() - 0.5) * 3,
          Math.random() * 2,
          (Math.random() - 0.5) * 3
        )
        carGroup.add(spark)
      }
    }

    return carGroup
  }

  return (
    <group>
      {/* Vehicle */}
      <primitive ref={meshRef} object={createCarGeometry()} />

      {/* Enhanced trail visualization */}
      {showTrail && trailRef.current.length > 1 && (
        <>
          {/* Pre-crash trail (blue) */}
          <line>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={Math.min(currentIndex + 1, crashStartIndex)}
                array={new Float32Array(
                  trailRef.current
                    .slice(0, Math.min(currentIndex + 1, crashStartIndex))
                    .flatMap(point => [point.x, point.y, point.z])
                )}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#4ecdc4" linewidth={3} />
          </line>

          {/* Crash trail (red) */}
          {currentIndex >= crashStartIndex && (
            <line>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={Math.min(currentIndex + 1 - crashStartIndex, crashEndIndex - crashStartIndex)}
                  array={new Float32Array(
                    trailRef.current
                      .slice(crashStartIndex, Math.min(currentIndex + 1, crashEndIndex))
                      .flatMap(point => [point.x, point.y, point.z])
                  )}
                  itemSize={3}
                />
              </bufferGeometry>
              <lineBasicMaterial color="#ff0000" linewidth={5} />
            </line>
          )}

          {/* Post-crash trail (orange) */}
          {currentIndex >= crashEndIndex && (
            <line>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={currentIndex + 1 - crashEndIndex}
                  array={new Float32Array(
                    trailRef.current
                      .slice(crashEndIndex, currentIndex + 1)
                      .flatMap(point => [point.x, point.y, point.z])
                  )}
                  itemSize={3}
                />
              </bufferGeometry>
              <lineBasicMaterial color="#ffa500" linewidth={3} />
            </line>
          )}

          {/* Position markers at key points */}
          {trailRef.current
            .filter((_, index) => index % 20 === 0 && index <= currentIndex)
            .map((point, index) => (
              <mesh key={index} position={[point.x, point.y + 0.1, point.z]}>
                <sphereGeometry args={[0.1]} />
                <meshBasicMaterial 
                  color={point.isCrash ? "#ff6666" : "#66cccc"}
                  transparent
                  opacity={0.7}
                />
              </mesh>
            ))}
        </>
      )}

      {/* Crash impact visualization */}
      {vehiclePath[currentIndex]?.isCrash && (
        <>
          {/* Impact shockwave */}
          <mesh position={[
            vehiclePath[currentIndex].position.x,
            1.0,
            vehiclePath[currentIndex].position.z
          ]}>
            <ringGeometry args={[2, 4, 32]} />
            <meshBasicMaterial 
              color="#ff0000"
              transparent
              opacity={0.3}
            />
          </mesh>
          
          {/* Warning indicator */}
          <mesh position={[
            vehiclePath[currentIndex].position.x,
            4.0,
            vehiclePath[currentIndex].position.z
          ]}>
            <sphereGeometry args={[0.2]} />
            <meshBasicMaterial color="#ff0000" />
          </mesh>
        </>
      )}
    </group>
  )
}

export default RealisticVehicle