import React, { useRef, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

const MovingObject = ({ data, followCamera = true, resetTrigger, crashMode = false, simulationMode = false, allTrailData = [] }) => {
  const meshRef = useRef()
  const trailRef = useRef([])
  const maxTrailLength = 200
  const { camera } = useThree()
  
  // Vehicle physics state
  const vehicleStateRef = useRef({
    position: { x: 0, y: 1, z: 0 },
    velocity: { x: 0, z: 0 },
    heading: 0,
    speed: 0,
    acceleration: 0,
    angularVelocity: 0,
    initialized: false // Track if we've set initial state
  })
  
  // GPS calibration state
  const yawOffsetRef = useRef(null)
  const gpsCalibrationRef = useRef({ firstGPS: null, secondGPS: null, calculated: false })
  
  // Vehicle parameters
  const vehicleParams = {
    maxSpeed: 50, // m/s
    maxAcceleration: 5, // m/s²
    maxDeceleration: 8, // m/s²
    frictionCoeff: 0.1, // Friction coefficient
    turnRadius: 5, // Minimum turning radius in meters
    wheelbase: 2.5, // Distance between front and rear axles
    mass: 1500, // kg
    dragCoeff: 0.02 // Air resistance
  }

  // Calculate bearing between two GPS coordinates
  const calculateBearing = (lat1, lon1, lat2, lon2) => {
    const dLon = (lon2 - lon1) * Math.PI / 180
    const lat1Rad = lat1 * Math.PI / 180
    const lat2Rad = lat2 * Math.PI / 180
    
    const y = Math.sin(dLon) * Math.cos(lat2Rad)
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - 
              Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon)
    
    let bearing = Math.atan2(y, x) * 180 / Math.PI
    bearing = (bearing + 360) % 360
    
    return bearing
  }

  // Reset function
  const resetVehicleState = () => {
    vehicleStateRef.current = {
      position: { x: 0, y: 1, z: 0 },
      velocity: { x: 0, z: 0 },
      heading: 0,
      speed: 0,
      acceleration: 0,
      angularVelocity: 0
    }
    trailRef.current = []
    
    // Reset GPS calibration
    yawOffsetRef.current = null
    gpsCalibrationRef.current = { firstGPS: null, secondGPS: null, calculated: false }
    
    if (meshRef.current) {
      meshRef.current.position.set(0, 1, 0)
      meshRef.current.rotation.set(0, 0, 0)
    }
    
    console.log('Vehicle state reset')
  }

  // Reset when resetTrigger changes
  useEffect(() => {
    if (resetTrigger > 0) {
      resetVehicleState()
    }
  }, [resetTrigger])

  useEffect(() => {
    if (data && meshRef.current && data.ax !== undefined && data.ay !== undefined && data.az !== undefined) {
      
      // GPS Calibration (same as before)
      if (data.latitude && data.longitude && !gpsCalibrationRef.current.calculated) {
        if (!gpsCalibrationRef.current.firstGPS) {
          gpsCalibrationRef.current.firstGPS = {
            lat: data.latitude,
            lon: data.longitude,
            yaw: data.yaw
          }
          console.log('First GPS position stored for calibration')
        } else if (!gpsCalibrationRef.current.secondGPS) {
          const latDiff = Math.abs(data.latitude - gpsCalibrationRef.current.firstGPS.lat)
          const lonDiff = Math.abs(data.longitude - gpsCalibrationRef.current.firstGPS.lon)
          
          if (latDiff > 0.00001 || lonDiff > 0.00001) {
            gpsCalibrationRef.current.secondGPS = {
              lat: data.latitude,
              lon: data.longitude,
              yaw: data.yaw
            }
            
            const gpsBearing = calculateBearing(
              gpsCalibrationRef.current.firstGPS.lat,
              gpsCalibrationRef.current.firstGPS.lon,
              data.latitude,
              data.longitude
            )
            
            const avgIMUYaw = (gpsCalibrationRef.current.firstGPS.yaw + data.yaw) / 2
            let offset = gpsBearing - avgIMUYaw
            
            while (offset > 180) offset -= 360
            while (offset < -180) offset += 360
            
            yawOffsetRef.current = offset
            gpsCalibrationRef.current.calculated = true
            
            console.log(`GPS Calibration Complete: Offset ${offset.toFixed(2)}°`)
          }
        }
      }
      
      // Calculate corrected yaw
      let correctedYaw = data.yaw || 0
      if (yawOffsetRef.current !== null) {
        correctedYaw = (data.yaw + yawOffsetRef.current + 360) % 360
      }
      
      const targetHeading = correctedYaw * Math.PI / 180
      const deltaTime = 0.05
      const vehicle = vehicleStateRef.current
      
      // Initialize vehicle state from actual data if in simulation mode
      if (simulationMode && !vehicle.initialized && data.speed !== undefined) {
        vehicle.speed = data.speed / 3.6 // Convert km/h to m/s
        vehicle.heading = targetHeading
        vehicle.initialized = true
        console.log('Initialized vehicle speed from data:', data.speed, 'km/h')
      }
      
      // In simulation mode, use more realistic physics
      if (simulationMode) {
        // Use actual speed from data if available, otherwise simulate
        if (data.speed !== undefined) {
          vehicle.speed = data.speed / 3.6 // Convert km/h to m/s
        } else {
          // Apply physics-based speed calculation
          const ax = data.ax * 9.81
          const longitudinalAccel = -ax
          const clampedAccel = Math.max(-vehicleParams.maxDeceleration, 
                              Math.min(vehicleParams.maxAcceleration, longitudinalAccel))
          vehicle.speed += clampedAccel * deltaTime
          
          // Apply resistance
          const frictionForce = vehicle.speed * vehicleParams.frictionCoeff
          const dragForce = vehicle.speed * vehicle.speed * vehicleParams.dragCoeff
          const totalResistance = frictionForce + dragForce
          
          if (vehicle.speed > 0) {
            vehicle.speed = Math.max(0, vehicle.speed - totalResistance * deltaTime)
          } else if (vehicle.speed < 0) {
            vehicle.speed = Math.min(0, vehicle.speed + totalResistance * deltaTime)
          }
        }
        
        // Smooth heading transition
        let headingDiff = targetHeading - vehicle.heading
        while (headingDiff > Math.PI) headingDiff -= 2 * Math.PI
        while (headingDiff < -Math.PI) headingDiff += 2 * Math.PI
        
        vehicle.heading += headingDiff * 0.1 // Smooth interpolation
        
        // Calculate turning from lateral acceleration
        if (Math.abs(vehicle.speed) > 0.1) {
          const lateralAccel = data.ay * 9.81
          const turnRate = lateralAccel / Math.max(0.5, Math.abs(vehicle.speed))
          vehicle.angularVelocity = turnRate * 0.3
        }
        
        vehicle.heading += vehicle.angularVelocity * deltaTime
      } else {
        // Existing physics code for normal mode
        // Extract acceleration components (convert from G to m/s²)
        const ax = data.ax * 9.81  // Forward/backward acceleration
        const ay = data.ay * 9.81  // Lateral acceleration (for turning)
        
        // Calculate longitudinal acceleration (forward/backward)
        // Use negative ax because of coordinate system
        const longitudinalAccel = -ax
        
        // Apply acceleration limits
        const clampedAccel = Math.max(-vehicleParams.maxDeceleration, 
                            Math.min(vehicleParams.maxAcceleration, longitudinalAccel))
        
        // Update speed based on acceleration
        vehicle.speed += clampedAccel * deltaTime
        
        // Apply friction and drag
        const frictionForce = vehicle.speed * vehicleParams.frictionCoeff
        const dragForce = vehicle.speed * vehicle.speed * vehicleParams.dragCoeff
        const totalResistance = frictionForce + dragForce
        
        if (vehicle.speed > 0) {
          vehicle.speed = Math.max(0, vehicle.speed - totalResistance * deltaTime)
        } else if (vehicle.speed < 0) {
          vehicle.speed = Math.min(0, vehicle.speed + totalResistance * deltaTime)
        }
        
        // Limit maximum speed
        vehicle.speed = Math.max(-vehicleParams.maxSpeed, Math.min(vehicleParams.maxSpeed, vehicle.speed))
        
        // Calculate turning based on lateral acceleration and speed
        if (Math.abs(vehicle.speed) > 0.1) { // Only turn if moving
          // Use lateral acceleration to estimate turning
          const lateralAccel = ay
          const turnRate = lateralAccel / Math.max(0.5, Math.abs(vehicle.speed))
          vehicle.angularVelocity = turnRate * 0.5 // Scale factor for realistic turning
          
          // Apply turn rate limits based on speed (faster = less turning)
          const maxTurnRate = 2.0 / (1 + Math.abs(vehicle.speed) * 0.1)
          vehicle.angularVelocity = Math.max(-maxTurnRate, Math.min(maxTurnRate, vehicle.angularVelocity))
        } else {
          vehicle.angularVelocity *= 0.9 // Decay angular velocity when stopped
        }
        
        // Smooth heading interpolation towards target
        let headingDiff = targetHeading - vehicle.heading
        while (headingDiff > Math.PI) headingDiff -= 2 * Math.PI
        while (headingDiff < -Math.PI) headingDiff += 2 * Math.PI
        
        // Blend IMU heading with vehicle dynamics
        const headingBlendFactor = 0.3 // How much to trust IMU vs dynamics
        vehicle.heading += headingDiff * headingBlendFactor * deltaTime
        vehicle.heading += vehicle.angularVelocity * deltaTime
        
        // Normalize heading
        while (vehicle.heading > Math.PI) vehicle.heading -= 2 * Math.PI
        while (vehicle.heading < -Math.PI) vehicle.heading += 2 * Math.PI
      }
      
      // Update velocity and position
      vehicle.velocity.x = vehicle.speed * Math.sin(vehicle.heading)
      vehicle.velocity.z = vehicle.speed * Math.cos(vehicle.heading)
      
      vehicle.position.x += vehicle.velocity.x * deltaTime
      vehicle.position.z += vehicle.velocity.z * deltaTime
      
      // Update visual position
      const scale = 1.0
      const visualX = vehicle.position.x * scale
      const visualZ = vehicle.position.z * scale
      const visualY = 1.0
      
      // Update mesh position and rotation
      meshRef.current.position.set(visualX, visualY, visualZ)
      meshRef.current.rotation.y = vehicle.heading
      
      // Add banking/leaning effect based on turning
      const bankAngle = vehicle.angularVelocity * 0.3
      meshRef.current.rotation.z = bankAngle
      
      // Camera follow with smooth interpolation
      if (followCamera) {
        const cameraDistance = 12 + Math.abs(vehicle.speed) * 0.3
        const cameraHeight = 8 + Math.abs(vehicle.speed) * 0.2
        
        // Position camera behind and above the vehicle
        const cameraX = visualX - Math.sin(vehicle.heading) * cameraDistance
        const cameraZ = visualZ - Math.cos(vehicle.heading) * cameraDistance
        
        camera.position.set(cameraX, cameraHeight, cameraZ)
        camera.lookAt(visualX, visualY, visualZ)
      }
      
      // Handle trail data
      if (simulationMode && allTrailData.length > 0) {
        // Use provided trail data instead of generating our own
        trailRef.current = allTrailData.map(d => ({
          x: d.position?.x || 0,
          y: 1.0,
          z: d.position?.z || 0
        }))
      } else {
        // Normal trail generation
        if (trailRef.current.length === 0 || 
            Math.abs(visualX - trailRef.current[trailRef.current.length - 1].x) > 0.3 ||
            Math.abs(visualZ - trailRef.current[trailRef.current.length - 1].z) > 0.3) {
          trailRef.current.push({ x: visualX, y: visualY, z: visualZ })
          if (trailRef.current.length > maxTrailLength) {
            trailRef.current.shift()
          }
        }
      }
    }
  }, [data, camera, followCamera, simulationMode, allTrailData])

  // Create enhanced car geometry with better visuals
  const carGeometry = new THREE.Group()
  
  // Car body with crash mode coloring
  const bodyGeometry = new THREE.BoxGeometry(0.8, 0.3, 2.0)
  const carColor = crashMode ? '#ff0000' : '#ff6b6b'
  const bodyMesh = new THREE.Mesh(bodyGeometry, new THREE.MeshPhongMaterial({ color: carColor }))
  bodyMesh.position.y = 0.15
  carGeometry.add(bodyMesh)
  
  // Car roof
  const roofGeometry = new THREE.BoxGeometry(0.6, 0.2, 1.2)
  const roofColor = crashMode ? '#cc0000' : '#cc5555'
  const roofMesh = new THREE.Mesh(roofGeometry, new THREE.MeshPhongMaterial({ color: roofColor }))
  roofMesh.position.y = 0.35
  carGeometry.add(roofMesh)
  
  // Wheels
  const wheelGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 8)
  wheelGeometry.rotateZ(Math.PI / 2)
  const wheelMaterial = new THREE.MeshPhongMaterial({ color: '#333' })
  
  // Add all four wheels
  const positions = [
    [-0.5, 0, 0.7],   // Front left
    [0.5, 0, 0.7],    // Front right
    [-0.5, 0, -0.7],  // Rear left
    [0.5, 0, -0.7]    // Rear right
  ]
  
  positions.forEach(pos => {
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial)
    wheel.position.set(...pos)
    carGeometry.add(wheel)
  })

  return (
    <group>
      {/* Enhanced car model */}
      <primitive ref={meshRef} object={carGeometry} position={[0, 1, 0]} />

      {/* Enhanced trail with speed-based coloring */}
      {trailRef.current.length > 1 && (
        <>
          {/* Main trail line */}
          <line>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={trailRef.current.length}
                array={new Float32Array(
                  trailRef.current.flatMap(point => [point.x, point.y, point.z])
                )}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial 
              color={crashMode ? "#ff0000" : "#4ecdc4"} 
              opacity={0.8} 
              transparent 
              linewidth={3} 
            />
          </line>
          
          {/* Direction markers along the trail */}
          {trailRef.current.filter((_, index) => index % 10 === 0).map((point, index) => (
            <mesh key={index} position={[point.x, point.y + 0.1, point.z]}>
              <sphereGeometry args={[0.05]} />
              <meshBasicMaterial color={crashMode ? "#ff6666" : "#66cccc"} />
            </mesh>
          ))}
        </>
      )}
      
      {/* Speed indicator */}
      {vehicleStateRef.current.speed > 1 && (
        <mesh position={[
          vehicleStateRef.current.position.x, 
          vehicleStateRef.current.position.y + 2.5, 
          vehicleStateRef.current.position.z
        ]}>
          <sphereGeometry args={[0.08]} />
          <meshBasicMaterial color={crashMode ? "#ff0000" : "#ffff00"} />
        </mesh>
      )}
    </group>
  )
}

export default MovingObject
