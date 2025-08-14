// Crash detection thresholds and parameters
export const CRASH_THRESHOLDS = {
  ACCELERATION_G: 1.5, // Lowered for testing - will trigger at 1.5G
  DECELERATION_G: -3.0, // Also lowered for easier testing
  LATERAL_G: 1.2, // Lowered for easier testing
  ANGULAR_VELOCITY: 100, // Lowered for easier testing
  DURATION_MS: 50 // Much shorter duration for point detection
}

export const detectCrashes = (imuData) => {
  const crashes = []
  let crashPeakIndex = null
  let maxSeverity = 0

  for (let i = 0; i < imuData.length; i++) {
    const data = imuData[i]
    const { ax, ay, az, gx, gy, gz, time } = data

    // Calculate total acceleration magnitude
    const totalAccel = Math.sqrt(ax * ax + ay * ay + az * az)
    const lateralAccel = Math.abs(ay)
    const longitudinalAccel = ax
    const angularVel = Math.sqrt(gx * gx + gy * gy + gz * gz)

    // Calculate severity score for this point
    const severityScore = calculatePointSeverity(ax, ay, az, gx, gy, gz)

    // Check for crash conditions - simplified for testing
    const isCrashCondition = 
      totalAccel > CRASH_THRESHOLDS.ACCELERATION_G ||
      longitudinalAccel < CRASH_THRESHOLDS.DECELERATION_G ||
      lateralAccel > CRASH_THRESHOLDS.LATERAL_G ||
      angularVel > CRASH_THRESHOLDS.ANGULAR_VELOCITY

    // Log when we detect potential crashes for testing
    if (isCrashCondition) {
      console.log(`Potential crash at index ${i}: totalAccel=${totalAccel.toFixed(2)}G, severity=${severityScore.toFixed(1)}`)
    }

    if (isCrashCondition && severityScore > 30) { // Lowered severity threshold for testing
      if (severityScore > maxSeverity) {
        maxSeverity = severityScore
        crashPeakIndex = i
        console.log(`New crash peak found at index ${i}, severity: ${maxSeverity.toFixed(1)}`)
      }
    } else {
      // If we found a crash peak, analyze it
      if (crashPeakIndex !== null && maxSeverity > 30) {
        const crashEvent = analyzeCrashPoint(imuData, crashPeakIndex)
        crashes.push(crashEvent)
        console.log(`Crash finalized at index ${crashPeakIndex}, severity: ${maxSeverity.toFixed(1)}`)
      }
      
      // Reset for next potential crash
      crashPeakIndex = null
      maxSeverity = 0
    }
  }

  // Check for crash at end of data
  if (crashPeakIndex !== null && maxSeverity > 30) {
    const crashEvent = analyzeCrashPoint(imuData, crashPeakIndex)
    crashes.push(crashEvent)
    console.log(`Final crash detected at index ${crashPeakIndex}, severity: ${maxSeverity.toFixed(1)}`)
  }

  return crashes
}

const calculatePointSeverity = (ax, ay, az, gx, gy, gz) => {
  const totalAccel = Math.sqrt(ax * ax + ay * ay + az * az)
  const angularVel = Math.sqrt(gx * gx + gy * gy + gz * gz)
  
  // More sensitive scoring for testing
  const accelScore = Math.min((totalAccel / 5) * 100, 100)  // Reduced divisor for easier triggering
  const decelScore = Math.min((Math.abs(ax) / 5) * 100, 100)  // Reduced divisor
  const lateralScore = Math.min((Math.abs(ay) / 3) * 100, 100)  // Reduced divisor
  const angularScore = Math.min((angularVel / 150) * 100, 100)  // Reduced divisor
  
  return Math.max(accelScore, decelScore, lateralScore, angularScore)
}

const analyzeCrashPoint = (imuData, crashIndex) => {
  const crashPoint = imuData[crashIndex]
  const crashTime = crashPoint.time

  // Get exactly 4 seconds before and 5 seconds after the crash point
  const preWindow = getDataWindow(imuData, crashTime - 4000, crashTime) // 4 seconds before
  const postWindow = getDataWindow(imuData, crashTime, crashTime + 5000) // 5 seconds after
  
  // Create a small crash window around the peak (±100ms for analysis)
  const crashStartTime = crashTime - 100
  const crashEndTime = crashTime + 100
  const crashWindow = getDataWindow(imuData, crashStartTime, crashEndTime)
  
  if (crashWindow.length === 0) {
    crashWindow.push(crashPoint) // Ensure we have at least the crash point
  }

  console.log(`Crash Point Analysis:`)
  console.log(`- Crash moment: ${crashTime}ms (index ${crashIndex})`)
  console.log(`- Crash point acceleration: ${Math.sqrt(crashPoint.ax**2 + crashPoint.ay**2 + crashPoint.az**2).toFixed(2)}G`)
  console.log(`- Pre-window: ${preWindow.length} points (${crashTime - 4000}ms to ${crashTime}ms) - 4 seconds`)
  console.log(`- Crash window: ${crashWindow.length} points (±100ms around peak)`)
  console.log(`- Post-window: ${postWindow.length} points (${crashTime}ms to ${crashTime + 5000}ms) - 5 seconds`)

  // Calculate crash severity metrics from the crash window
  const severity = calculateCrashSeverity(crashWindow)
  
  // Get peak values during crash
  const peakValues = getPeakValues(crashWindow)
  
  // Vehicle state at crash
  const vehicleState = getVehicleStateAtCrash(crashPoint)

  return {
    id: `crash_${Date.now()}_${crashIndex}`,
    timestamp: new Date(crashTime).toISOString(),
    crashIndex,
    crashPoint: crashTime,
    startTime: crashStartTime,
    endTime: crashEndTime,
    duration: crashEndTime - crashStartTime,
    severity,
    peakValues,
    vehicleState,
    preWindow,
    crashWindow,
    postWindow,
    analysis: generateCrashAnalysis(severity, peakValues, vehicleState)
  }
}

const getDataWindow = (imuData, startTime, endTime) => {
  return imuData.filter(data => data.time >= startTime && data.time <= endTime)
}

const calculateCrashSeverity = (crashData) => {
  let maxAccel = 0
  let maxDecel = 0
  let maxLateral = 0
  let maxAngular = 0

  crashData.forEach(data => {
    const totalAccel = Math.sqrt(data.ax * data.ax + data.ay * data.ay + data.az * data.az)
    const angularVel = Math.sqrt(data.gx * data.gx + data.gy * data.gy + data.gz * data.gz)
    
    maxAccel = Math.max(maxAccel, totalAccel)
    maxDecel = Math.min(maxDecel, data.ax)
    maxLateral = Math.max(maxLateral, Math.abs(data.ay))
    maxAngular = Math.max(maxAngular, angularVel)
  })

  // More sensitive severity scoring for testing
  const accelScore = Math.min((maxAccel / 5) * 100, 100)  // Reduced from 20 to 5
  const decelScore = Math.min((Math.abs(maxDecel) / 5) * 100, 100)  // Reduced from 20 to 5
  const lateralScore = Math.min((maxLateral / 3) * 100, 100)  // Reduced from 10 to 3
  const angularScore = Math.min((maxAngular / 180) * 100, 100)  // Reduced from 360 to 180
  
  const overallSeverity = Math.max(accelScore, decelScore, lateralScore, angularScore)

  return {
    overall: Math.round(overallSeverity),
    acceleration: Math.round(accelScore),
    deceleration: Math.round(decelScore),
    lateral: Math.round(lateralScore),
    angular: Math.round(angularScore),
    level: getSeverityLevel(overallSeverity)
  }
}

const getPeakValues = (crashData) => {
  const peaks = {
    maxAcceleration: 0,
    maxDeceleration: 0,
    maxLateralAccel: 0,
    maxAngularVelocity: 0,
    peakTime: null
  }

  crashData.forEach(data => {
    const totalAccel = Math.sqrt(data.ax * data.ax + data.ay * data.ay + data.az * data.az)
    const angularVel = Math.sqrt(data.gx * data.gx + data.gy * data.gy + data.gz * data.gz)
    
    if (totalAccel > peaks.maxAcceleration) {
      peaks.maxAcceleration = totalAccel
      peaks.peakTime = data.time
    }
    
    peaks.maxDeceleration = Math.min(peaks.maxDeceleration, data.ax)
    peaks.maxLateralAccel = Math.max(peaks.maxLateralAccel, Math.abs(data.ay))
    peaks.maxAngularVelocity = Math.max(peaks.maxAngularVelocity, angularVel)
  })

  return peaks
}

const getVehicleStateAtCrash = (crashData) => {
  return {
    speed: crashData.speed || 0,
    location: {
      latitude: crashData.latitude,
      longitude: crashData.longitude
    },
    heading: crashData.yaw || 0,
    acceleration: {
      x: crashData.ax,
      y: crashData.ay,
      z: crashData.az
    },
    angularVelocity: {
      x: crashData.gx,
      y: crashData.gy,
      z: crashData.gz
    }
  }
}

const getSeverityLevel = (score) => {
  if (score >= 80) return 'SEVERE'
  if (score >= 60) return 'MAJOR'
  if (score >= 40) return 'MODERATE'
  if (score >= 20) return 'MINOR'
  return 'LIGHT'
}

const generateCrashAnalysis = (severity, peakValues, vehicleState) => {
  const analysis = []
  
  // More lenient analysis for testing
  if (severity.overall >= 60) {
    analysis.push('CRITICAL: Impact detected - testing crash simulation')
  } else if (severity.overall >= 40) {
    analysis.push('MODERATE: Significant acceleration detected - testing mode')
  } else if (severity.overall >= 20) {
    analysis.push('MINOR: Elevated acceleration detected - testing threshold')
  }
  
  if (peakValues.maxDeceleration < -3) {
    analysis.push('Deceleration event detected (testing)')
  }
  
  if (peakValues.maxLateralAccel > 1.2) {
    analysis.push('Lateral acceleration detected (testing)')
  }
  
  if (peakValues.maxAngularVelocity > 100) {
    analysis.push('Angular velocity detected (testing)')
  }
  
  if (vehicleState.speed > 20) {
    analysis.push('Vehicle movement detected during event')
  }
  
  return analysis
}