export const parseMockData = (csvText) => {
  const lines = csvText.trim().split('\n')
  const headers = lines[0].split(',').map(h => h.trim())
  
  console.log('CSV Headers:', headers) // Debug log
  
  const data = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim())
    
    if (values.length === headers.length && values.every(v => v !== '')) {
      const row = {}
      
      headers.forEach((header, index) => {
        const value = values[index]
        
        // Map CSV headers to expected field names
        switch (header.toLowerCase()) {
          case 'counter':
            row.counter = parseInt(value) || 0
            break
          case 'time':
            row.time = parseFloat(value) || 0
            break
          case 'latitude':
            row.latitude = parseFloat(value) || 0
            break
          case 'longitude':
            row.longitude = parseFloat(value) || 0
            break
          case 'speed(km/h)':
            row.speed = parseFloat(value) || 0
            break
          case 'ax':
            row.ax = parseFloat(value) || 0
            break
          case 'ay':
            row.ay = parseFloat(value) || 0
            break
          case 'az':
            row.az = parseFloat(value) || 0
            break
          case 'gx':
            row.gx = parseFloat(value) || 0
            break
          case 'gy':
            row.gy = parseFloat(value) || 0
            break
          case 'gz':
            row.gz = parseFloat(value) || 0
            break
          case 'yaw':
            row.yaw = parseFloat(value) || 0
            break
          default:
            // Handle any other fields
            row[header.toLowerCase()] = isNaN(parseFloat(value)) ? value : parseFloat(value)
        }
      })
      
      data.push(row)
    }
  }
  
  console.log('Parsed data sample:', data.slice(0, 3)) // Debug log
  console.log('Total rows parsed:', data.length)
  
  return data
}

// Keep the existing coordinate conversion function
export const convertToCoordinates = (lat, lng) => {
  const originLat = 40.7128
  const originLng = -74.0060
  
  const x = (lng - originLng) * 100000 // Scale factor for visibility
  const y = (lat - originLat) * 100000
  return { x, y }
}