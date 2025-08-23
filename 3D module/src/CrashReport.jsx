import React, { useState, useRef, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import MovingObject from './MovingObject'
import { detectCrashes } from './crashDetection'

const CrashReport = ({ crashData, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [selectedTab, setSelectedTab] = useState('overview')
  
  // Combine all data windows
  const allData = [
    ...crashData.preWindow,
    ...crashData.crashWindow,
    ...crashData.postWindow
  ]
  
  const crashStartIndex = crashData.preWindow.length
  const crashEndIndex = crashStartIndex + crashData.crashWindow.length

  // Debug information - log the actual time ranges
  useEffect(() => {
    if (crashData.preWindow.length > 0 && crashData.postWindow.length > 0) {
      const preStartTime = crashData.preWindow[0]?.time
      const preEndTime = crashData.preWindow[crashData.preWindow.length - 1]?.time
      const crashPointTime = crashData.crashPoint || crashData.crashWindow[0]?.time
      const postStartTime = crashData.postWindow[0]?.time
      const postEndTime = crashData.postWindow[crashData.postWindow.length - 1]?.time

      console.log('=== CRASH REPORT TIMING ANALYSIS ===')
      console.log(`Crash point: ${crashPointTime}ms`)
      console.log(`Pre-crash window: ${preStartTime}ms to ${preEndTime}ms (${(preEndTime - preStartTime)/1000}s duration)`)
      console.log(`Post-crash window: ${postStartTime}ms to ${postEndTime}ms (${(postEndTime - postStartTime)/1000}s duration)`)
      console.log(`Total simulation duration: ${(postEndTime - preStartTime)/1000}s`)
      
      // Verify 4+5 second windows
      const preWindowDuration = (crashPointTime - preStartTime) / 1000
      const postWindowDuration = (postEndTime - crashPointTime) / 1000
      console.log(`Pre-crash duration: ${preWindowDuration.toFixed(1)} seconds (should be ~4s)`)
      console.log(`Post-crash duration: ${postWindowDuration.toFixed(1)} seconds (should be ~5s)`)
    }
  }, [crashData])

  // Rest of your existing code...
  useEffect(() => {
    if (isPlaying && allData.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= allData.length - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, 50 / playbackSpeed) // Faster updates for smoother animation
      
      return () => clearInterval(interval)
    }
  }, [isPlaying, allData.length, playbackSpeed])

  const currentData = allData[currentIndex] || {}
  const isInCrashWindow = currentIndex >= crashStartIndex && currentIndex < crashEndIndex

  // Enhanced timing display
  const getTimeDisplay = () => {
    if (!currentData.time || !crashData.crashPoint) return 'N/A'
    
    const crashPointTime = crashData.crashPoint
    const relativeTime = (currentData.time - crashPointTime) / 1000 // Convert to seconds
    
    if (relativeTime < 0) {
      return `T${relativeTime.toFixed(1)}s (Pre-Crash)`
    } else if (Math.abs(relativeTime) < 0.1) {
      return `T+0.0s (CRASH POINT)`
    } else {
      return `T+${relativeTime.toFixed(1)}s (Post-Crash)`
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString()
  }

  const formatCoordinate = (coord) => {
    return coord?.toFixed(6) || 'N/A'
  }

  // Create acceleration chart data
  const createChartData = () => {
    return allData.map((data, index) => ({
      index,
      time: data.time,
      ax: data.ax || 0,
      ay: data.ay || 0,
      az: data.az || 0,
      totalAccel: Math.sqrt((data.ax || 0)**2 + (data.ay || 0)**2 + (data.az || 0)**2),
      speed: data.speed || 0,
      isCrash: index >= crashStartIndex && index < crashEndIndex
    }))
  }

  const chartData = createChartData()

  return (
    <div className="crash-report-overlay">
      <div className="crash-report-container">
        <div className="crash-report-header">
          <h1>🚨 CRASH REPORT</h1>
          <button onClick={onClose} className="close-button">✕</button>
        </div>

        <div className="crash-report-tabs">
          <button 
            className={selectedTab === 'overview' ? 'tab-active' : 'tab'}
            onClick={() => setSelectedTab('overview')}
          >
            Overview
          </button>
          <button 
            className={selectedTab === 'timeline' ? 'tab-active' : 'tab'}
            onClick={() => setSelectedTab('timeline')}
          >
            Timeline
          </button>
          <button 
            className={selectedTab === 'analysis' ? 'tab-active' : 'tab'}
            onClick={() => setSelectedTab('analysis')}
          >
            Analysis
          </button>
          <button 
            className={selectedTab === 'simulation' ? 'tab-active' : 'tab'}
            onClick={() => setSelectedTab('simulation')}
          >
            3D Simulation
          </button>
        </div>

        <div className="crash-report-content">
          {selectedTab === 'overview' && (
            <div className="overview-tab">
              <div className="crash-summary">
                <h2>Crash Summary</h2>
                <div className="summary-grid">
                  <div className="summary-item">
                    <label>Incident ID:</label>
                    <span>{crashData.id}</span>
                  </div>
                  <div className="summary-item">
                    <label>Date & Time:</label>
                    <span>{formatTime(crashData.timestamp)}</span>
                  </div>
                  <div className="summary-item">
                    <label>Severity Level:</label>
                    <span className={`severity-${crashData.severity.level.toLowerCase()}`}>
                      {crashData.severity.level} ({crashData.severity.overall}%)
                    </span>
                  </div>
                  <div className="summary-item">
                    <label>Duration:</label>
                    <span>{crashData.duration.toFixed(0)}ms</span>
                  </div>
                  <div className="summary-item">
                    <label>Vehicle Speed:</label>
                    <span>{crashData.vehicleState.speed.toFixed(1)} km/h</span>
                  </div>
                  <div className="summary-item">
                    <label>Location:</label>
                    <span>
                      {formatCoordinate(crashData.vehicleState.location.latitude)}, 
                      {formatCoordinate(crashData.vehicleState.location.longitude)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Add timing verification section */}
              <div className="timing-verification">
                <h3>Simulation Timing Verification</h3>
                <div className="timing-grid">
                  <div className="timing-item">
                    <label>Pre-Crash Window:</label>
                    <span>{crashData.preWindow.length} data points (4 seconds)</span>
                  </div>
                  <div className="timing-item">
                    <label>Crash Point:</label>
                    <span>{new Date(crashData.crashPoint || crashData.crashWindow[0]?.time).toLocaleTimeString()}</span>
                  </div>
                  <div className="timing-item">
                    <label>Post-Crash Window:</label>
                    <span>{crashData.postWindow.length} data points (5 seconds)</span>
                  </div>
                  <div className="timing-item">
                    <label>Total Simulation Duration:</label>
                    <span>
                      {crashData.preWindow.length > 0 && crashData.postWindow.length > 0 
                        ? `${((crashData.postWindow[crashData.postWindow.length - 1]?.time - crashData.preWindow[0]?.time) / 1000).toFixed(1)}s (9 seconds total)`
                        : 'N/A'
                      }
                    </span>
                  </div>
                </div>
              </div>

              <div className="peak-values">
                <h3>Peak Impact Values</h3>
                <div className="peak-grid">
                  <div className="peak-item">
                    <label>Max Acceleration:</label>
                    <span>{crashData.peakValues.maxAcceleration.toFixed(2)} G</span>
                  </div>
                  <div className="peak-item">
                    <label>Max Deceleration:</label>
                    <span>{crashData.peakValues.maxDeceleration.toFixed(2)} G</span>
                  </div>
                  <div className="peak-item">
                    <label>Max Lateral Force:</label>
                    <span>{crashData.peakValues.maxLateralAccel.toFixed(2)} G</span>
                  </div>
                  <div className="peak-item">
                    <label>Max Angular Velocity:</label>
                    <span>{crashData.peakValues.maxAngularVelocity.toFixed(1)} °/s</span>
                  </div>
                </div>
              </div>

              <div className="crash-analysis">
                <h3>Automated Analysis</h3>
                <ul>
                  {crashData.analysis.map((item, index) => (
                    <li key={index} className="analysis-item">{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Timeline tab with corrected time labels */}
          {selectedTab === 'timeline' && (
            <div className="timeline-tab">
              <div className="timeline-controls">
                <h3>Event Timeline</h3>
                <div className="timeline-phases">
                  <div className="phase pre-crash">Pre-Crash (4s before)</div>
                  <div className="phase crash">Crash Point</div>
                  <div className="phase post-crash">Post-Crash (5s after)</div>
                </div>
              </div>
              
              <div className="timeline-data">
                <h4>Sensor Readings Timeline</h4>
                <div className="timeline-chart">
                  <div className="chart-container">
                    <h5>Acceleration vs Time (9 Second Window: 4s + 1s + 5s)</h5>
                    <svg width="100%" height="300" viewBox="0 0 800 300" className="acceleration-chart">
                      {/* Chart background */}
                      <rect width="800" height="300" fill="#2a2a2a" stroke="#444" />
                      
                      {/* Grid lines - adjust for 9 second window (4+1+5) */}
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                        <g key={i}>
                          <line x1={i * 80} y1="0" x2={i * 80} y2="300" stroke="#444" strokeWidth="1" />
                          <text x={i * 80 + 5} y="15" fill="#ccc" fontSize="10">{(i-4)}s</text>
                        </g>
                      ))}
                      
                      {/* Y-axis labels */}
                      {[-10, -5, 0, 5, 10].map(val => (
                        <g key={val}>
                          <line x1="0" y1={150 - val * 10} x2="800" y2={150 - val * 10} stroke="#444" strokeWidth="1" />
                          <text x="5" y={155 - val * 10} fill="#ccc" fontSize="10">{val}G</text>
                        </g>
                      ))}
                      
                      {/* Crash zone highlight */}
                      <rect 
                        x={crashStartIndex * (800 / allData.length)} 
                        y="0" 
                        width={(crashEndIndex - crashStartIndex) * (800 / allData.length)} 
                        height="300" 
                        fill="rgba(255, 107, 107, 0.2)"
                      />
                      
                      {/* Acceleration lines */}
                      <polyline
                        points={chartData.map((d, i) => `${i * (800 / allData.length)},${150 - d.ax * 10}`).join(' ')}
                        fill="none"
                        stroke="#ff6b6b"
                        strokeWidth="2"
                      />
                      <polyline
                        points={chartData.map((d, i) => `${i * (800 / allData.length)},${150 - d.ay * 10}`).join(' ')}
                        fill="none"
                        stroke="#4caf50"
                        strokeWidth="2"
                      />
                      <polyline
                        points={chartData.map((d, i) => `${i * (800 / allData.length)},${150 - d.az * 10}`).join(' ')}
                        fill="none"
                        stroke="#2196f3"
                        strokeWidth="2"
                      />
                      
                      {/* Current position indicator */}
                      <line 
                        x1={currentIndex * (800 / allData.length)} 
                        y1="0" 
                        x2={currentIndex * (800 / allData.length)} 
                        y2="300" 
                        stroke="#ffeb3b" 
                        strokeWidth="3"
                      />
                    </svg>
                    
                    <div className="chart-legend">
                      <div className="legend-item">
                        <span className="legend-color" style={{backgroundColor: '#ff6b6b'}}></span>
                        <span>X-Axis (Forward/Back)</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-color" style={{backgroundColor: '#4caf50'}}></span>
                        <span>Y-Axis (Left/Right)</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-color" style={{backgroundColor: '#2196f3'}}></span>
                        <span>Z-Axis (Up/Down)</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-color" style={{backgroundColor: 'rgba(255, 107, 107, 0.2)'}}></span>
                        <span>Crash Zone</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analysis and Simulation tabs remain the same */}
          {selectedTab === 'analysis' && (
            <div className="analysis-tab">
              <div className="severity-breakdown">
                <h3>Severity Breakdown</h3>
                <div className="severity-bars">
                  <div className="severity-bar">
                    <label>Overall Severity:</label>
                    <div className="bar">
                      <div 
                        className="bar-fill" 
                        style={{width: `${crashData.severity.overall}%`}}
                      ></div>
                    </div>
                    <span>{crashData.severity.overall}%</span>
                  </div>
                  <div className="severity-bar">
                    <label>Acceleration Impact:</label>
                    <div className="bar">
                      <div 
                        className="bar-fill" 
                        style={{width: `${crashData.severity.acceleration}%`}}
                      ></div>
                    </div>
                    <span>{crashData.severity.acceleration}%</span>
                  </div>
                  <div className="severity-bar">
                    <label>Deceleration Impact:</label>
                    <div className="bar">
                      <div 
                        className="bar-fill" 
                        style={{width: `${crashData.severity.deceleration}%`}}
                      ></div>
                    </div>
                    <span>{crashData.severity.deceleration}%</span>
                  </div>
                  <div className="severity-bar">
                    <label>Lateral Impact:</label>
                    <div className="bar">
                      <div 
                        className="bar-fill" 
                        style={{width: `${crashData.severity.lateral}%`}}
                      ></div>
                    </div>
                    <span>{crashData.severity.lateral}%</span>
                  </div>
                </div>
              </div>

              <div className="detailed-analysis">
                <h3>Detailed Technical Analysis</h3>
                <div className="tech-details">
                  <p><strong>Impact Pattern:</strong> {getImpactPattern(crashData)}</p>
                  <p><strong>Collision Type:</strong> {getCollisionType(crashData)}</p>
                  <p><strong>Estimated Forces:</strong> {getEstimatedForces(crashData)}</p>
                  <p><strong>Injury Risk Assessment:</strong> {getInjuryRisk(crashData)}</p>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'simulation' && (
            <div className="simulation-tab">
              <div className="simulation-controls">
                <h3>3D Crash Simulation</h3>
                <div className="playback-controls">
                  <button onClick={() => setIsPlaying(!isPlaying)}>
                    {isPlaying ? '⏸️ Pause' : '▶️ Play'}
                  </button>
                  <button onClick={() => setCurrentIndex(0)}>
                    ⏮️ Reset
                  </button>
                  <button onClick={() => setCurrentIndex(Math.max(0, crashStartIndex - 10))}>
                    🚨 Jump to Pre-Crash
                  </button>
                  <label>
                    Speed: 
                    <select 
                      value={playbackSpeed} 
                      onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                    >
                      <option value={0.1}>0.1x</option>
                      <option value={0.25}>0.25x</option>
                      <option value={0.5}>0.5x</option>
                      <option value={1}>1x</option>
                      <option value={2}>2x</option>
                      <option value={4}>4x</option>
                    </select>
                  </label>
                </div>
                
                <div className="timeline-slider">
                  <input
                    type="range"
                    min="0"
                    max={Math.max(0, allData.length - 1)}
                    value={currentIndex}
                    onChange={(e) => setCurrentIndex(parseInt(e.target.value))}
                    className="timeline-input"
                  />
                  <div className="timeline-markers">
                    <span 
                      className="marker pre-crash"
                      style={{left: '0%'}}
                    >Pre-Crash (4s)</span>
                    <span 
                      className="marker crash"
                      style={{left: `${(crashStartIndex / allData.length) * 100}%`}}
                    >CRASH POINT</span>
                    <span 
                      className="marker post-crash"
                      style={{left: '100%'}}
                    >Post-Crash (5s)</span>
                  </div>
                </div>

                <div className="current-readings">
                  <div className={`readings ${isInCrashWindow ? 'crash-active' : ''}`}>
                    <div>Time: {getTimeDisplay()}</div>
                    <div>Speed: {currentData.speed?.toFixed(1)} km/h</div>
                    <div>Acceleration: X={currentData.ax?.toFixed(3)}G, Y={currentData.ay?.toFixed(3)}G, Z={currentData.az?.toFixed(3)}G</div>
                    <div>Gyro: X={currentData.gx?.toFixed(1)}°/s, Y={currentData.gy?.toFixed(1)}°/s, Z={currentData.gz?.toFixed(1)}°/s</div>
                    {isInCrashWindow && <div className="crash-indicator">🚨 CRASH EVENT IN PROGRESS</div>}
                  </div>
                </div>
              </div>

              <div className="simulation-canvas">
                <Canvas camera={{ position: [0, 15, 15], fov: 60 }}>
                  <ambientLight intensity={0.4} />
                  <directionalLight position={[10, 20, 5]} intensity={1} castShadow />
                  <pointLight position={[0, 10, 0]} intensity={0.3} />
                  
                  <Grid 
                    args={[10000, 10000]} 
                    cellSize={1} 
                    cellThickness={0.5} 
                    cellColor="#333" 
                    sectionSize={10} 
                    sectionThickness={1} 
                    sectionColor="#555" 
                  />
                  
                  <MovingObject 
                    data={currentData} 
                    followCamera={true}
                    resetTrigger={0}
                    crashMode={isInCrashWindow}
                    simulationMode={true}
                    allTrailData={allData.slice(0, currentIndex + 1)}
                  />
                  
                  {/* Don't use OrbitControls when following camera */}
                </Canvas>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper functions remain the same...
const getImpactPattern = (crashData) => {
  const { maxDeceleration, maxLateralAccel, maxAngularVelocity } = crashData.peakValues
  
  if (Math.abs(maxDeceleration) > 10 && maxLateralAccel < 3) {
    return "Frontal impact pattern detected"
  } else if (maxLateralAccel > 6) {
    return "Side impact or rollover pattern detected"
  } else if (maxAngularVelocity > 180) {
    return "Rotational impact with possible rollover"
  }
  return "Complex multi-directional impact"
}

const getCollisionType = (crashData) => {
  const speed = crashData.vehicleState.speed
  const maxDecel = Math.abs(crashData.peakValues.maxDeceleration)
  
  if (speed > 50 && maxDecel > 15) {
    return "High-speed collision"
  } else if (maxDecel > 10) {
    return "Moderate-speed collision"
  }
  return "Low-speed impact"
}

const getEstimatedForces = (crashData) => {
  const maxG = crashData.peakValues.maxAcceleration
  return `Peak impact force: ${maxG.toFixed(1)}G (approximately ${(maxG * 9.81).toFixed(0)} m/s²)`
}

const getInjuryRisk = (crashData) => {
  const severity = crashData.severity.overall
  
  if (severity >= 80) {
    return "HIGH - Severe injuries likely, immediate medical attention required"
  } else if (severity >= 60) {
    return "MODERATE - Potential for serious injuries, medical evaluation recommended"
  } else if (severity >= 40) {
    return "LOW-MODERATE - Minor injuries possible, medical check advised"
  }
  return "LOW - Minor impact, injuries unlikely"
}

export default CrashReport