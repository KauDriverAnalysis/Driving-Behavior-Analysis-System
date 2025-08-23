import React, { useState } from 'react'
import { detectCrashes } from './crashDetection'
import { parseMockData } from './utils'
import CrashReport from './CrashReport'

const CrashDetectionApp = () => {
  const [data, setData] = useState([])
  const [crashes, setCrashes] = useState([])
  const [selectedCrash, setSelectedCrash] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const parsed = parseMockData(e.target.result)
          console.log('File uploaded, parsed', parsed.length, 'rows')
          setData(parsed)
          analyzeCrashes(parsed)
        } catch (error) {
          console.error('Error parsing file:', error)
          alert('Error parsing file. Please check format.')
        }
      }
      reader.readAsText(file)
    }
  }

  const analyzeCrashes = async (imuData) => {
    setIsAnalyzing(true)
    try {
      // Add a small delay to show processing
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const detectedCrashes = detectCrashes(imuData)
      setCrashes(detectedCrashes)
      console.log(`Detected ${detectedCrashes.length} crash events`)
    } catch (error) {
      console.error('Error analyzing crashes:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const generateReport = (crash) => {
    setSelectedCrash(crash)
  }

  const downloadReport = (crash) => {
    const reportData = {
      ...crash,
      generatedAt: new Date().toISOString(),
      reportVersion: '1.0'
    }
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
      type: 'application/json' 
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `crash_report_${crash.id}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="crash-detection-app">
      <div className="app-header">
        <h1>🚨 Crash Detection & Analysis System</h1>
        <p>Upload IMU data to detect and analyze vehicle crash events</p>
      </div>

      <div className="upload-section">
        <div className="upload-box">
          <input 
            type="file" 
            onChange={handleFileUpload} 
            accept=".csv,.txt"
            id="crash-file-upload"
          />
          <label htmlFor="crash-file-upload" className="upload-label">
            📁 Upload IMU Data File
          </label>
          <p>Supported formats: CSV with Counter, Time, Latitude, Longitude, Speed, Ax, Ay, Az, Gx, Gy, Gz, Yaw</p>
        </div>

        {data.length > 0 && (
          <div className="data-info">
            <h3>Data Loaded</h3>
            <p>✅ {data.length} data points loaded</p>
            <p>📊 Time range: {data[0]?.time}ms - {data[data.length - 1]?.time}ms</p>
          </div>
        )}
      </div>

      {isAnalyzing && (
        <div className="analyzing">
          <div className="spinner"></div>
          <p>Analyzing data for crash events...</p>
        </div>
      )}

      {crashes.length > 0 && (
        <div className="crash-results">
          <h2>🚨 Detected Crash Events: {crashes.length}</h2>
          
          <div className="crash-list">
            {crashes.map((crash, index) => (
              <div key={crash.id} className="crash-item">
                <div className="crash-header">
                  <h3>Crash Event #{index + 1}</h3>
                  <span className={`severity-badge severity-${crash.severity.level.toLowerCase()}`}>
                    {crash.severity.level}
                  </span>
                </div>
                
                <div className="crash-summary">
                  <div className="crash-details">
                    <p><strong>Time:</strong> {new Date(crash.timestamp).toLocaleString()}</p>
                    <p><strong>Duration:</strong> {crash.duration.toFixed(0)}ms</p>
                    <p><strong>Peak Acceleration:</strong> {crash.peakValues.maxAcceleration.toFixed(2)}G</p>
                    <p><strong>Vehicle Speed:</strong> {crash.vehicleState.speed.toFixed(1)} km/h</p>
                    <p><strong>Location:</strong> {crash.vehicleState.location.latitude?.toFixed(6)}, {crash.vehicleState.location.longitude?.toFixed(6)}</p>
                  </div>
                  
                  <div className="crash-actions">
                    <button 
                      onClick={() => generateReport(crash)}
                      className="btn-primary"
                    >
                      📋 View Full Report
                    </button>
                    <button 
                      onClick={() => downloadReport(crash)}
                      className="btn-secondary"
                    >
                      💾 Download JSON
                    </button>
                  </div>
                </div>

                <div className="crash-analysis-preview">
                  <h4>Quick Analysis:</h4>
                  <ul>
                    {crash.analysis.slice(0, 2).map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {crashes.length === 0 && data.length > 0 && !isAnalyzing && (
        <div className="no-crashes">
          <h3>✅ No Crash Events Detected</h3>
          <p>The analyzed data does not contain any events that exceed the crash detection thresholds.</p>
          <div className="thresholds-info">
            <h4>Current Detection Thresholds:</h4>
            <ul>
              <li>Total Acceleration: &gt; 0.44G</li>
              <li>Severe Deceleration: &lt; -12.0G</li>
              <li>Lateral Acceleration: &gt; 6.0G</li>
              <li>Angular Velocity: &gt; 180°/s</li>
            </ul>
          </div>
        </div>
      )}

      {selectedCrash && (
        <CrashReport 
          crashData={selectedCrash}
          onClose={() => setSelectedCrash(null)}
        />
      )}
    </div>
  )
}

export default CrashDetectionApp