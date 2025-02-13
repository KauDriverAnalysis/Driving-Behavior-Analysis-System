import pandas as pd
import numpy as np

def main():
    try:
        # Load CSV data
        #data = pd.read_csv('normal.csv')
        data = pd.read_csv('uni_home.csv')

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

        data['Time'] = data['Time'].apply(parse_time)

        # Check for failed time conversions
        if data['Time'].isna().any():
            print("Warning: Some time values couldn't be parsed. Check time format.")
            data = data.dropna(subset=['Time'])  # Remove rows with invalid timestamps

        # Data Cleaning -------------------------------------------------------
        # 1. Remove invalid GPS coordinates
        data = data[
            (data['Latitude'].between(-90, 90)) & 
            (data['Longitude'].between(-180, 180)) &
            ((data['Latitude'] != 0) | (data['Longitude'] != 0))
        ]

        # 2. Handle missing values in sensor data
        sensor_cols = ['Ax', 'Ay', 'Az', 'Gx', 'Gy', 'Gz', 'Yaw', 'Pitch', 'Roll']
        for col in sensor_cols:
            if col in data.columns:
                data[col] = data[col].ffill().bfill()

        # Invert the sign of Ax values (NEW ADDITION)
        if 'Ax' in data.columns:
            data['Ax'] = -data['Ax']

        # 3. Clean speed data
        if 'Speed(km/h)' in data.columns:
            data['Speed(km/h)'] = data['Speed(km/h)'].clip(lower=0, upper=200)

        # 4. Remove duplicates while keeping first occurrence
        data = data.drop_duplicates(subset=['Time'], keep='first')

        # Reset index after cleaning
        data = data.reset_index(drop=True)

        # Feature Engineering -------------------------------------------------
        # Calculate acceleration magnitude (smoothed)
        window_size = 5
        accel_cols = ['Ax', 'Ay', 'Az']
        if all(col in data.columns for col in accel_cols):
            # Calculate smoothed values with NaN handling
            smoothed = data[accel_cols].rolling(window_size, center=True).median().fillna(0)
            
            # Store final calculated fields
            data['acceleration_magnitude'] = np.sqrt(
                smoothed['Ax']**2 +
                smoothed['Ay']**2 +
                smoothed['Az']**2
            )

        # Distance Calculation ------------------------------------------------
        # Calculate distance between consecutive GPS points using the Haversine formula
        if all(col in data.columns for col in ['Latitude', 'Longitude']):
            # Convert latitude and longitude from degrees to radians
            lat = np.radians(data['Latitude'])
            lon = np.radians(data['Longitude'])

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
        if 'Counter' in data.columns:
            data.drop('Counter', axis=1, inplace=True)
                
        # Create new sequential counter
        data.insert(0, 'Counter', data.index + 1)

        # Save cleaned data ---------------------------------------------------
        final_columns = [
            'Counter', 'Time', 'Latitude', 'Longitude', 'Speed(km/h)',
            'Ax', 'Ay', 'Az', 'Gx', 'Gy', 'Gz',
            'Yaw', 'Pitch', 'Roll', 'acceleration_magnitude', 'distance'
        ]
        
        # Select only desired columns that exist in the data
        cleaned_data = data[[col for col in final_columns if col in data.columns]]

        # Ensure 'distance' column is in kilometers with appropriate precision
        cleaned_data['distance'] = cleaned_data['distance'].astype(float).round(6)

        #cleaned_data.to_csv('cleaned_normal_data.csv', index=False)
        cleaned_data.to_csv('cleaned_uni_home.csv', index=False)

        print("Data cleaned successfully! Output saved to cleaned_driving_data.csv")
        print(f"Final data shape: {cleaned_data.shape}")
        print(f"Acceleration range: {cleaned_data['Ax'].min():.2f} to {cleaned_data['Ax'].max():.2f} m/s²")

    except FileNotFoundError:
        print("Error: CSV file not found. Check file path and name.")
    except Exception as e:
        print(f"Processing failed: {str(e)}")

if __name__ == "__main__":
    main()
