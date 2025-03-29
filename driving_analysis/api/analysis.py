import pandas as pd
import numpy as np

def analyze_data(cleaned_data):
    """
    Analyze the cleaned driving data to extract insights about driving behavior
    using advanced statistical techniques.
    
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
        'detected_events': 0,
        'harsh_braking_events': 0,
        'harsh_acceleration_events': 0,
        'swerving_events': 0,
        'potential_swerving_events': 0,
        'over_speed_events': 0,
        'score': 100,
        'labels': []  # Store event labels for each data point
    }
    
    # Prepare data - Rename columns to expected format if needed
    column_mapping = {
        'counter': 'Counter',
        'timestamp': 'Timestamp',
        'latitude': 'Latitude',
        'longitude': 'Longitude',
        'speed': 'Speed(km/h)',
        'ax': 'Ax',
        'ay': 'Ay',
        'az': 'Az',
        'yaw': 'Yaw',

    }
    
    # Create a copy to avoid modifying the original data
    df = cleaned_data.copy()
    
    # Rename columns if needed
    df = df.rename(columns={k: v for k, v in column_mapping.items() if k in df.columns})
    
    # Initialize labels column
    df['labels'] = 'Normal'
    
    # Calculate acceleration magnitude if not present
    if 'acceleration_magnitude' not in df:
        if all(col in df.columns for col in ['Ax', 'Ay', 'Az']):
            df['acceleration_magnitude'] = np.sqrt(df['Ax']**2 + df['Ay']**2 + df['Az']**2)
        elif all(col in df.columns for col in ['ax', 'ay', 'az']):
            df['acceleration_magnitude'] = np.sqrt(df['ax']**2 + df['ay']**2 + df['az']**2)
    
    # ==== ADVANCED DETECTION LOGIC ====
    
    # Compute magnitude variance and its mean
    df['magnitude_variance'] = df['acceleration_magnitude'].rolling(window=2, min_periods=1).var()
    mean_variance = df['acceleration_magnitude'].mean()

    # Initial event detection - Count events where variance exceeds mean
    event_mask = df['magnitude_variance'] > mean_variance
    results['detected_events'] = event_mask.sum()
    df.loc[event_mask, 'labels'] = 'Event'
    
    # Apply second-level detection if events were found
    if results['detected_events'] > 0:
        # Harsh Braking detection with variance analysis
        if 'Ax' in df.columns:
            df['negative_ax'] = df['Ax'].where(df['Ax'] < 0)
            df['negative_ax_variance'] = df['negative_ax'].rolling(window=35, min_periods=1).var()
            mean_negative_ax_variance = df['negative_ax_variance'].mean()
            std_negative_ax_variance = df['negative_ax_variance'].std() if df['negative_ax_variance'].std() > 0 else 1
            
            threshold = mean_negative_ax_variance + 1.5 * std_negative_ax_variance
            
            # Apply conditions for harsh braking
            harsh_braking_mask = (df['negative_ax_variance'] > threshold) & (df['Ax'] < -2000)
            df.loc[harsh_braking_mask, 'labels'] = 'Harsh Braking'
        elif 'ax' in df.columns:
            df['negative_ax'] = df['ax'].where(df['ax'] < 0)
            df['negative_ax_variance'] = df['negative_ax'].rolling(window=35, min_periods=1).var()
            mean_negative_ax_variance = df['negative_ax_variance'].mean()
            std_negative_ax_variance = df['negative_ax_variance'].std() if df['negative_ax_variance'].std() > 0 else 1
            
            threshold = mean_negative_ax_variance + 1.5 * std_negative_ax_variance
            
            # Apply conditions for harsh braking
            harsh_braking_mask = (df['negative_ax_variance'] > threshold) & (df['ax'] < -2000)
            df.loc[harsh_braking_mask, 'labels'] = 'Harsh Braking'
        
        # Harsh Acceleration detection with variance analysis
        if 'Ax' in df.columns:
            df['positive_ax'] = df['Ax'].where(df['Ax'] > 0)
            df['positive_ax_variance'] = df['positive_ax'].rolling(window=35, min_periods=1).var()
            mean_positive_ax_variance = df['positive_ax_variance'].mean()
            std_positive_ax_variance = df['positive_ax_variance'].std() if df['positive_ax_variance'].std() > 0 else 1
            
            threshold_acceleration = mean_positive_ax_variance + 1.5 * std_positive_ax_variance
            
            # Apply conditions for harsh acceleration
            harsh_acceleration_mask = (df['positive_ax_variance'] > threshold_acceleration) & (df['Ax'] > 2000)
            df.loc[harsh_acceleration_mask, 'labels'] = 'Harsh Acceleration'
        elif 'ax' in df.columns:
            df['positive_ax'] = df['ax'].where(df['ax'] > 0)
            df['positive_ax_variance'] = df['positive_ax'].rolling(window=35, min_periods=1).var()
            mean_positive_ax_variance = df['positive_ax_variance'].mean()
            std_positive_ax_variance = df['positive_ax_variance'].std() if df['positive_ax_variance'].std() > 0 else 1
            
            threshold_acceleration = mean_positive_ax_variance + 1.5 * std_positive_ax_variance
            
            # Apply conditions for harsh acceleration
            harsh_acceleration_mask = (df['positive_ax_variance'] > threshold_acceleration) & (df['ax'] > 2000)
            df.loc[harsh_acceleration_mask, 'labels'] = 'Harsh Acceleration'
        
        # Swerving detection using yaw changes
        if 'Yaw' in df.columns:
            window_swerve = 12  # Window size for checking angle change
            df['yaw_change'] = df['Yaw'].rolling(window=window_swerve, min_periods=1, center=True).apply(
                lambda x: max(x) - min(x), raw=True).abs()
            
            # Main swerving detection
            if 'Ay' in df.columns:
                swerve_mask = (df['yaw_change'] >= 4) & (df['yaw_change'] <= 12) & (df['Ay'].abs() > 2000)
                df.loc[swerve_mask, 'labels'] = 'Swerving'
            elif 'ay' in df.columns:
                swerve_mask = (df['yaw_change'] >= 4) & (df['yaw_change'] <= 12) & (df['ay'].abs() > 2000)
                df.loc[swerve_mask, 'labels'] = 'Swerving'
            
            # Reset labels if too large changes in yaw (likely not real swerving)
            window_reset = 90
            df['large_yaw_change'] = df['Yaw'].rolling(window=window_reset, min_periods=1, center=True).apply(
                lambda x: max(x) - min(x), raw=True).abs()
            reset_mask = df['large_yaw_change'] > 40
            df.loc[reset_mask, 'labels'] = 'Normal'
    
    # Additional checks for harsh braking in 'Normal' labeled data
    if 'Ax' in df.columns:
        normal_data_mask = ((df['labels'] == 'Normal') | (df['labels'] == 'Event')) & (df['Ax'] < -2000)
        df.loc[normal_data_mask, 'labels'] = 'Harsh Braking'
    elif 'ax' in df.columns:
        normal_data_mask = ((df['labels'] == 'Normal') | (df['labels'] == 'Event')) & (df['ax'] < -2000)
        df.loc[normal_data_mask, 'labels'] = 'Harsh Braking'
    
    # Check for potential swerving events
    if 'Ay' in df.columns:
        potential_swerve_mask = (df['Ay'].abs() > 2000) & (df['labels'].isin(['Normal', 'Event']))
        df.loc[potential_swerve_mask, 'labels'] = 'Swerving'
    elif 'ay' in df.columns:
        potential_swerve_mask = (df['ay'].abs() > 2000) & (df['labels'].isin(['Normal', 'Event']))
        df.loc[potential_swerve_mask, 'labels'] = 'Swerving'
    
    # Check for over-speed events
    if 'Speed(km/h)' in df.columns:
        over_speed_mask = df['Speed(km/h)'] > 120
        df.loc[over_speed_mask, 'labels'] = 'Over Speed'
    
    # Reset events that are labeled 'Event' to 'Normal'
    normal_mask = (df['labels'] == 'Event')
    df.loc[normal_mask, 'labels'] = 'Normal'
    
    # Reset swerving events at low speeds (likely not real swerving)
    if 'Speed(km/h)' in df.columns:
        speed_mask = (df['labels'] == 'Swerving') & (df['Speed(km/h)'] < 30)
        df.loc[speed_mask, 'labels'] = 'Normal'
    
    # Add harsh_braking_event column to count events (not continuous readings)
    df['harsh_braking_event'] = 0
    prev_label = df['labels'].shift(1).fillna('Normal')
    new_event_mask = (df['labels'] == 'Harsh Braking') & (prev_label != 'Harsh Braking')
    df.loc[new_event_mask, 'harsh_braking_event'] = 1
    
    # Handle first row special case
    if not df.empty and df['labels'].iloc[0] == 'Harsh Braking':
        df.loc[df.index[0], 'harsh_braking_event'] = 1
    
    # ==== COUNT EVENTS AND CALCULATE SCORE ====
    
    # Count events by label type
    results['harsh_braking_events'] = df['harsh_braking_event'].sum()
    results['harsh_acceleration_events'] = (df['labels'] == 'Harsh Acceleration').sum()
    results['swerving_events'] = (df['labels'] == 'Swerving').sum()
    results['over_speed_events'] = (df['labels'] == 'Over Speed').sum()
    
    # Calculate score with appropriate weights
    score = 100
    score -= results['harsh_braking_events'] * 20      # Higher weight for harsh braking
    score -= results['harsh_acceleration_events'] * 10  # Medium weight for harsh acceleration
    score -= results['swerving_events'] * 30           # Highest weight for swerving (most dangerous)
    score -= results['over_speed_events'] * 20         # Higher weight for speeding
    
    # Ensure score doesn't go below 0
    results['score'] = max(score, 0)
    
    # Store labels for future reference
    results['labels'] = df['labels'].tolist()
    
    return results