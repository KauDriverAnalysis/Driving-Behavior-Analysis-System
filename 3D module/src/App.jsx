import React, { useState, useRef, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import MovingObject from './MovingObject'
import { parseMockData } from './utils'
import CrashDetectionApp from './CrashDetectionApp'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'white', background: '#1a1a1a' }}>
          <h1>Something went wrong.</h1>
          <pre style={{ color: 'red' }}>{this.state.error?.toString()}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const [data, setData] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [followCamera, setFollowCamera] = useState(true)
  const [resetTrigger, setResetTrigger] = useState(0) // Add reset trigger
  const [showCrashDetection, setShowCrashDetection] = useState(false)

  // Mock data generator
  const generateMockData = () => {
    const mockData = []
    for (let i = 0; i < 1000; i++) {
      const time = i * 0.1
      mockData.push({
        counter: i,
        time: time,
        ax: Math.sin(time * 0.1) * 0.5,
        ay: Math.cos(time * 0.1) * 0.5,
        az: 1.0 + Math.sin(time * 0.2) * 0.1,
        gx: 0,
        gy: 0,
        gz: Math.sin(time * 0.05) * 0.5,
        yaw: time * 5, // Make yaw change more significantly
        latitude: 40.7128 + Math.sin(time * 0.1) * 0.001,
        longitude: -74.0060 + Math.cos(time * 0.1) * 0.001,
        speed: 5 + Math.sin(time * 0.2) * 2
      })
    }
    setData(mockData)
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const parsed = parseMockData(e.target.result)
          console.log('File uploaded, parsed', parsed.length, 'rows')
          setData(parsed)
          setCurrentIndex(0)
          setResetTrigger(prev => prev + 1) // Reset when new data is loaded
        } catch (error) {
          console.error('Error parsing file:', error)
          alert('Error parsing file. Please check format.')
        }
      }
      reader.readAsText(file)
    }
  }

  const togglePlayback = () => {
    setIsPlaying(!isPlaying)
  }

  const resetPlayback = () => {
    setCurrentIndex(0)
    setIsPlaying(false)
    setResetTrigger(prev => prev + 1) // Trigger IMU reset
  }

  const resetIMUPosition = () => {
    // Trigger a reset by incrementing the reset counter
    setResetTrigger(prev => prev + 1)
    console.log('Resetting IMU position to center')
  }

  const toggleCameraFollow = () => {
    setFollowCamera(!followCamera)
  }

  useEffect(() => {
    if (isPlaying && data.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= data.length - 1) {
            setIsPlaying(false)
            return data.length - 1
          }
          return prev + 1
        })
      }, 100)

      return () => clearInterval(interval)
    }
  }, [isPlaying, data.length])

  const currentData = data[currentIndex] || {}

  return (
    <ErrorBoundary>
      <div className="app">
        <div className="controls">
          <input type="file" onChange={handleFileUpload} accept=".csv,.txt" />
          <button onClick={generateMockData}>Generate Mock Data</button>
          
          <div className="playback-controls">
            <button onClick={togglePlayback}>
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button onClick={resetPlayback}>Reset</button>
            <button onClick={resetIMUPosition}>Reset IMU Position</button>
            <button onClick={toggleCameraFollow}>
              Camera: {followCamera ? 'Following' : 'Free'}
            </button>
          </div>
          
          <div>
            Frame: {currentIndex + 1} / {data.length}
          </div>
          
          <input
            type="range"
            min="0"
            max={Math.max(0, data.length - 1)}
            value={currentIndex}
            onChange={(e) => setCurrentIndex(parseInt(e.target.value))}
            style={{ width: '200px' }}
          />
          
          <div>
            {currentData.counter !== undefined && (
              <>
                <div>Counter: {currentData.counter}</div>
                <div>Time: {currentData.time}</div>
                <div>Speed: {currentData.speed?.toFixed(1)} km/h</div>
                <div style={{color: '#00ff00', fontSize: '12px', marginTop: '10px'}}>
                  <strong>IMU Data:</strong>
                </div>
                <div style={{color: '#00ff00', fontSize: '10px'}}>
                  Accel: X={(currentData.ax || 0).toFixed(3)}G, Y={(currentData.ay || 0).toFixed(3)}G, Z={(currentData.az || 0).toFixed(3)}G
                </div>
                <div style={{color: '#00ff00', fontSize: '10px'}}>
                  Gyro: X={(currentData.gx || 0).toFixed(3)}°/s, Y={(currentData.gy || 0).toFixed(3)}°/s, Z={(currentData.gz || 0).toFixed(3)}°/s
                </div>
                <div style={{color: '#00ff00', fontSize: '10px'}}>
                  Yaw: {(currentData.yaw || 0).toFixed(1)}° (Raw IMU)
                </div>
                <div style={{color: '#ffff00', fontSize: '12px', marginTop: '10px'}}>
                  <strong>Vehicle Physics:</strong>
                </div>
                <div style={{color: '#ffff00', fontSize: '10px'}}>
                  Speed: {(currentData.speed || 0).toFixed(1)} km/h
                </div>
                <div style={{color: '#ffff00', fontSize: '10px'}}>
                  Acceleration: Forward={(currentData.ax || 0).toFixed(2)}G, Lateral={(currentData.ay || 0).toFixed(2)}G
                </div>
                <div style={{color: '#888', fontSize: '10px', marginTop: '5px'}}>
                  GPS: Lat={currentData.latitude?.toFixed(6)}, Lng={currentData.longitude?.toFixed(6)}
                </div>
                <div style={{color: '#888', fontSize: '10px'}}>
                  Status: Realistic car physics with GPS heading correction
                </div>
              </>
            )}
          </div>

          <button onClick={() => setShowCrashDetection(true)}>
            🚨 Crash Detection
          </button>
        </div>

        <Canvas camera={{ position: [0, 15, 15], fov: 60 }}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 20, 5]} intensity={1} castShadow />
          <pointLight position={[0, 10, 0]} intensity={0.3} />
          
          <Grid args={[100, 100]} cellSize={1} cellThickness={0.5} cellColor="#333" sectionSize={10} sectionThickness={1} sectionColor="#555" />
          
          {/* Reference objects to show scale */}
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[0.5, 0.2, 0.5]} />
            <meshPhongMaterial color="#666" />
          </mesh>
          
          {/* Coordinate indicators */}
          <mesh position={[5, 0.5, 0]}>
            <boxGeometry args={[0.2, 1, 0.2]} />
            <meshPhongMaterial color="#ff0000" />
          </mesh>
          <mesh position={[0, 0.5, 5]}>
            <boxGeometry args={[0.2, 1, 0.2]} />
            <meshPhongMaterial color="#00ff00" />
          </mesh>
          
          <MovingObject 
            data={currentData} 
            followCamera={followCamera} 
            resetTrigger={resetTrigger} 
          />
          {!followCamera && <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />}
        </Canvas>

        {showCrashDetection && (
          <div className="crash-detection-overlay">
            <CrashDetectionApp />
            <button 
              onClick={() => setShowCrashDetection(false)}
              className="close-crash-detection"
            >
              ← Back to Main App
            </button>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}

export default App
