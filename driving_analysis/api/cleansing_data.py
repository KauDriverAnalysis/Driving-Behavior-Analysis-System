import pandas as pd
import numpy as np

def cleanse_data(buffer):
    try:
        # Convert buffer to DataFrame
        data = pd.DataFrame(buffer)

        # Convert Time column with flexible format handling
        def parse_time(x):
            for fmt in ('%H:%M:%S.%f', '%H:%M:%S', '%H:%M', '%I:%M %p'):
                try:
                    return pd.to_datetime(x, format=fmt)
                except ValueError:
                    continue
                except TypeError:
                    return pd.NaT
            return pd.NaT

        data['timestamp'] = data['timestamp'].apply(parse_time)

        # Check for failed time conversions
        if data['timestamp'].isna().any():
            print("Warning: Some time values couldn't be parsed. Check time format.")
            data = data.dropna(subset=['timestamp'])  # Remove rows with invalid timestamps

        # Data Cleaning -------------------------------------------------------
        # 1. Remove invalid GPS coordinates
        data = data[
            (data['latitude'].between(-90, 90)) & 
            (data['longitude'].between(-180, 180)) &
            ((data['latitude'] != 0) | (data['longitude'] != 0))
        ]

        # 2. Handle missing values in sensor data
        sensor_cols = ['ax', 'ay', 'az', 'yaw']
        for col in sensor_cols:
            if col in data.columns:
                data[col] = data[col].ffill().bfill()

        # Invert the sign of Ax values (NEW ADDITION)
        if 'ax' in data.columns:
            data['ax'] = -data['ax']

        # 3. Clean speed data
        if 'speed' in data.columns:
            data['speed'] = data['speed'].clip(lower=0, upper=200)

        # Reset index after cleaning
        data = data.reset_index(drop=True)

        # Feature Engineering -------------------------------------------------
        # Calculate acceleration magnitude (smoothed)
        window_size = 5
        accel_cols = ['ax', 'ay', 'az']
        if all(col in data.columns for col in accel_cols):
            # Calculate smoothed values with NaN handling
            smoothed = data[accel_cols].rolling(window_size, center=True).median().fillna(0)
            
            # Store final calculated fields
            data['acceleration_magnitude'] = np.sqrt(
                smoothed['ax']**2 +
                smoothed['ay']**2 +
                smoothed['az']**2
            )

        # Distance Calculation ------------------------------------------------
        # Calculate distance between consecutive GPS points using the Haversine formula
        if all(col in data.columns for col in ['latitude', 'longitude']):
            # Convert latitude and longitude from degrees to radians
            lat = np.radians(data['latitude'])
            lon = np.radians(data['longitude'])

            # Compute differences between consecutive points
            dlat = lat.diff()
            dlon = lon.diff()

            # Haversine formula components
            a = np.sin(dlat / 2)**2 + np.cos(lat.shift(1)) * np.cos(lat) * np.sin(dlon / 2)**2
            c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))
            R = 6371.0  # Earth's radius in kilometers
            data['distance'] = R * c  # Distance in kilometers between consecutive points

            # Replace NaN and infinite values in 'distance'
            data['distance'] = data['distance'].replace([np.inf, -np.inf], np.nan).fillna(0)
        else:
            print("Latitude and Longitude columns are missing. Distance calculation skipped.")

        # Total distance traveled
        total_distance = data['distance'].sum()
        print(f"Total distance traveled: {total_distance:.2f} km")

        # Counter Handling ----------------------------------------------------
        # Remove existing Counter column if present
        if 'counter' in data.columns:
            data.drop('counter', axis=1, inplace=True)
                
        # Create new sequential counter
        data.insert(0, 'counter', data.index + 1)

        # Return cleaned data
        return data

    except Exception as e:
        print(f"Processing failed: {str(e)}")
        return pd.DataFrame()

if __name__ == "__main__":
    # Example usage with a sample buffer
    sample_buffer = [
        {'device_name': 'DBAS-001', 'counter': 1, 'timestamp': '12:00:00', 'latitude': 21.4858, 'longitude': 39.1925, 'speed': 50, 'ax': 0.1, 'ay': 0.2, 'az': 0.3, 'yaw': 0.1},
        # Add more sample data points...
    ]
    cleaned_data = cleanse_data(sample_buffer)
    print(cleaned_data)
