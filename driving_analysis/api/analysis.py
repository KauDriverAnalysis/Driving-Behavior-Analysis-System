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
    df = cleaned_data.rename(columns={k: v for k, v in column_mapping.items() if k in cleaned_data.columns})
    
    # Calculate acceleration magnitude if not present
    if 'acceleration_magnitude' not in df:
        if all(col in df.columns for col in ['Ax', 'Ay', 'Az']):
            df['acceleration_magnitude'] = (df['Ax']**2 + df['Ay']**2 + df['Az']**2)**0.5
        elif all(col in df.columns for col in ['ax', 'ay', 'az']):
            df['acceleration_magnitude'] = (df['ax']**2 + df['ay']**2 + df['az']**2)**0.5
    
    # Detect harsh braking events
    if 'Ax' in df.columns:
        harsh_braking_mask = df['Ax'] < -2000
        results['harsh_braking_events'] = harsh_braking_mask.sum()
    elif 'ax' in df.columns:
        harsh_braking_mask = df['ax'] < -2000
        results['harsh_braking_events'] = harsh_braking_mask.sum()
    
    # Detect harsh acceleration events
    if 'Ax' in df.columns:
        harsh_accel_mask = df['Ax'] > 2000
        results['harsh_acceleration_events'] = harsh_accel_mask.sum()
    elif 'ax' in df.columns:
        harsh_accel_mask = df['ax'] > 2000
        results['harsh_acceleration_events'] = harsh_accel_mask.sum()
    
    # Detect swerving events
    if 'Ay' in df.columns:
        swerve_mask = df['Ay'].abs() > 2000
        results['swerving_events'] = swerve_mask.sum()
    elif 'ay' in df.columns:
        swerve_mask = df['ay'].abs() > 2000
        results['swerving_events'] = swerve_mask.sum()
    
    # Calculate score based on detected events
    score = 100
    score -= results['harsh_braking_events'] * 20
    score -= results['harsh_acceleration_events'] * 10
    score -= results['swerving_events'] * 30
    
    # Ensure the score doesn't go below 0%
    results['score'] = max(score, 0)
    
    return results