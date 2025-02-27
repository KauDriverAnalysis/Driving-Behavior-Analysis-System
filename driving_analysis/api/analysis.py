import pandas as pd
import numpy as np

def analyze_data(cleaned_data):
    """
    Analyze the cleaned driving data to extract insights about driving behavior.
    
    Args:
        cleaned_data (DataFrame): DataFrame containing cleansed data
    
    Returns:
        dict: Dictionary containing analysis results
    """
    # Check for valid data
    if not isinstance(cleaned_data, pd.DataFrame) or cleaned_data.empty:
        return {'error': 'No data to analyze'}
    
    # Initialize results dictionary
    results = {
        'distance_km': 0,
        'harsh_braking_events': 0,
        'harsh_acceleration_events': 0,
        'swerving_events': 0,
        'potential_swerving_events': 0,
        'over_speed_events': 0,
        'score': 100
    }
    
    # Prepare data
    # Rename columns to expected format if needed
    column_mapping = {
        'counter': 'Counter',
        'timestamp': 'Timestamp',
        'latitude': 'Latitude',
        'longitude': 'Longitude',
        'speed': 'Speed(km/h)',
        'ax': 'Ax',
        'ay': 'Ay',
        'az': 'Az',
        'gx': 'Gx',
        'gy': 'Gy',
        'gz': 'Gz',
        'yaw': 'Yaw',
        'pitch': 'Pitch',
        'roll': 'Roll'
    }
    
    # Rename columns if needed
    df = cleaned_data.copy()
    for old_col, new_col in column_mapping.items():
        if old_col in df.columns and new_col not in df.columns:
            df[new_col] = df[old_col]
    
    # Ensure all required columns exist
    for col in ['Ax', 'Ay', 'Az', 'Yaw', 'Speed(km/h)']:
        if col not in df.columns:
            # Try lowercase version
            lowercase_col = col.lower()
            if lowercase_col in df.columns:
                df[col] = df[lowercase_col]
    
    # Calculate distance if not already present
    if 'distance' in df.columns:
        results['distance_km'] = df['distance'].sum()
    
    # Calculate acceleration magnitude
    df['acceleration_magnitude'] = np.sqrt(df['Ax']**2 + df['Ay']**2 + df['Az']**2)
    
    # Initialize labels column
    df['labels'] = 'Normal'
    
    # Compute magnitude variance and its mean
    df['magnitude_variance'] = df['acceleration_magnitude'].rolling(window=2, min_periods=1).var()
    mean_variance = df['acceleration_magnitude'].mean()
    
    # Count events where variance exceeds mean
    event_mask = df['magnitude_variance'] > mean_variance
    detected_events = event_mask.sum()
    
    # Update labels for events
    df.loc[event_mask, 'labels'] = 'Event'
    
    # Advanced event detection - only if events detected
    if detected_events > 0:
        # Harsh Braking: Calculate variance of negative acceleration along X-axis
        df['negative_ax'] = df['Ax'].where(df['Ax'] < 0)
        df['negative_ax_variance'] = df['negative_ax'].rolling(window=35, min_periods=1).var()
        mean_negative_ax_variance = df['negative_ax_variance'].mean()
        std_negative_ax_variance = df['negative_ax_variance'].std()
        
        threshold = mean_negative_ax_variance + 1.5 * std_negative_ax_variance
        harsh_braking_mask = (df['negative_ax_variance'] > threshold) & (df['Ax'] < -2000)
        df.loc[harsh_braking_mask, 'labels'] = 'Harsh Braking'
        
        # Harsh Acceleration: Calculate variance of positive acceleration
        df['positive_ax'] = df['Ax'].where(df['Ax'] > 0)
        df['positive_ax_variance'] = df['positive_ax'].rolling(window=35, min_periods=1).var()
        mean_positive_ax_variance = df['positive_ax_variance'].mean()
        std_positive_ax_variance = df['positive_ax_variance'].std()
        
        threshold_acceleration = mean_positive_ax_variance + 1.5 * std_positive_ax_variance
        harsh_acceleration_mask = (df['positive_ax_variance'] > threshold_acceleration) & (df['Ax'] > 2000)
        df.loc[harsh_acceleration_mask, 'labels'] = 'Harsh Acceleration'
        
        # Swerving detection based on yaw changes
        window_swerve = 12
        df['yaw_change'] = df['Yaw'].rolling(window=window_swerve, min_periods=1, center=True).apply(
            lambda x: max(x) - min(x), raw=True).abs()
        swerve_mask = (df['yaw_change'] >= 4) & (df['yaw_change'] <= 12) & (df['Ay'].abs() > 2000)
        df.loc[swerve_mask, 'labels'] = 'Swerving'
        
        # Reset labels if large yaw changes (likely turns, not swerving)
        window_reset = 90
        df['large_yaw_change'] = df['Yaw'].rolling(window=window_reset, min_periods=1, center=True).apply(
            lambda x: max(x) - min(x), raw=True).abs()
        reset_mask = df['large_yaw_change'] > 40
        df.loc[reset_mask, 'labels'] = 'Normal'
    
    # Check for potential harsh braking in 'Normal' labeled data
    normal_data_mask = ((df['labels'] == 'Normal') | (df['labels'] == 'Event')) & (df['Ax'] < -2000)
    df.loc[normal_data_mask, 'labels'] = 'Harsh Braking'
    
    # Potential swerving detection
    potential_swerve_mask = (df['Ay'].abs() > 2000) & (df['labels'].isin(['Normal', 'Event']))
    results['potential_swerving_events'] = potential_swerve_mask.sum()
    df.loc[potential_swerve_mask, 'labels'] = 'Swerving'
    
    # Overspeed detection
    over_speed_mask = df['Speed(km/h)'] > 120
    results['over_speed_events'] = over_speed_mask.sum()
    df.loc[over_speed_mask, 'labels'] = 'Over Speed'
    
    # Reset 'Event' to 'Normal'
    normal_mask = (df['labels'] == 'Event')
    df.loc[normal_mask, 'labels'] = 'Normal'
    
    # Filter out low-speed swerving (likely not actual swerving)
    speed_mask = ((df['labels'] == 'Swerving') & (df['Speed(km/h)'] < 30))
    df.loc[speed_mask, 'labels'] = 'Normal'
    
    # Count events for harsh braking (tracking new events)
    df['harsh_braking_event'] = 0
    prev_label = df['labels'].shift(1).fillna('Normal')
    new_event_mask = (df['labels'] == 'Harsh Braking') & (prev_label != 'Harsh Braking')
    df.loc[new_event_mask, 'harsh_braking_event'] = 1
    
    # Handle first row
    if not df.empty and df.iloc[0]['labels'] == 'Harsh Braking':
        df.at[df.index[0], 'harsh_braking_event'] = 1
    
    # Collect results
    results['harsh_braking_events'] = df['harsh_braking_event'].sum()
    results['harsh_acceleration_events'] = (df['labels'] == 'Harsh Acceleration').sum()
    results['swerving_events'] = (df['labels'] == 'Swerving').sum()
    
    # Calculate score
    score = 100
    score -= results['harsh_braking_events'] * 20
    score -= results['harsh_acceleration_events'] * 10
    score -= results['swerving_events'] * 30
    score -= results['over_speed_events'] * 20
    
    # Ensure the score doesn't go below 0%
    results['score'] = max(score, 0)
    
    return results