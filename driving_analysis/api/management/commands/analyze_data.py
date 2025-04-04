import pandas as pd
import numpy as np
from django.core.management.base import BaseCommand
from api.views import cleansed_buffer
from api.models import DrivingData
from Analysis_cleansing.analysis_intialy_done import analyze_chunk, score_chunk

def analyze_chunk(chunk_df):
    chunk_df = chunk_df.copy()
    chunk_df['labels'] = 'Normal'  # Initialize labels column

    results = {
        'start_index': chunk_df.iloc[0]['Counter'],
        'end_index': chunk_df.iloc[-1]['Counter'],
        'distance_km': chunk_df['distance'].sum(),
        'detected_events': 0,
        'harsh_braking_events': 0,
        'harsh_acceleration_events': 0,
        'swerving_events': 0,
        'potential_swerving_events': 0,
        'over_speed_events': 0
    }

    # Compute magnitude variance and its mean
    chunk_df['magnitude_variance'] = chunk_df['acceleration_magnitude'].rolling(window=2, min_periods=1).var()
    mean_variance = chunk_df['acceleration_magnitude'].mean()

    # Count events where variance exceeds mean
    event_mask = chunk_df['magnitude_variance'] > mean_variance
    results['detected_events'] = event_mask.sum()

    # Update labels for events
    chunk_df.loc[event_mask, 'labels'] = 'Event'

    # Apply second filter only if an event is detected from the first filter
    if results['detected_events'] > 0:
        # Harsh Braking: Calculate variance of negative acceleration along X-axis and mean
        chunk_df['negative_ax'] = chunk_df['Ax'].where(chunk_df['Ax'] < 0)
        chunk_df['negative_ax_variance'] = chunk_df['negative_ax'].rolling(window=35, min_periods=1).var()
        mean_negative_ax_variance = chunk_df['negative_ax_variance'].mean()
        std_negative_ax_variance = chunk_df['negative_ax_variance'].std()
        
        threshold = mean_negative_ax_variance + 1.5 * std_negative_ax_variance

        # Add condition to exclude values <= -2000 m/s²
        harsh_braking_mask = (
            (chunk_df['negative_ax_variance'] > threshold) & 
            (chunk_df['Ax'] < -2000)  # New exclusion condition
        )
        results['harsh_braking_events'] = harsh_braking_mask.sum()

        # Harsh Acceleration: Calculate variance of positive acceleration along X-axis and mean
        chunk_df['positive_ax'] = chunk_df['Ax'].where(chunk_df['Ax'] > 0)
        chunk_df['positive_ax_variance'] = chunk_df['positive_ax'].rolling(window=35, min_periods=1).var()
        mean_positive_ax_variance = chunk_df['positive_ax_variance'].mean()
        std_positive_ax_variance = chunk_df['positive_ax_variance'].std()
        
        threshold_Acceleration = mean_positive_ax_variance + 1.5 * std_positive_ax_variance
        
        # Add condition to exclude values >= 2000 m/s²
        harsh_acceleration_mask = (
            (chunk_df['positive_ax_variance'] > threshold_Acceleration) & 
            (chunk_df['Ax'] > 2000)  # New exclusion condition
        )
        results['harsh_acceleration_events'] = harsh_acceleration_mask.sum()

        # Swerving detection logic
        window_swerve = 12  # Window size for checking angle change
        chunk_df['yaw_change'] = chunk_df['Yaw'].rolling(window=window_swerve, min_periods=1, center=True).apply(lambda x: max(x) - min(x), raw=True).abs()
        swerve_mask = (
            (chunk_df['yaw_change'] >= 4) & (chunk_df['yaw_change'] <= 12) & 
            (chunk_df['Ay'].abs() > 2000)  # Aggressiveness condition based on Az
        )
        results['swerving_events'] = swerve_mask.sum()
        
        # Update labels 
        chunk_df.loc[harsh_acceleration_mask, 'labels'] = 'Harsh Acceleration'
        chunk_df.loc[swerve_mask, 'labels'] = 'Swerving'
        chunk_df.loc[harsh_braking_mask, 'labels'] = 'Harsh Braking'
        
        # Additional logic to reset label to 'Normal' if change in degree > 40 in a window of 50 readings
        window_reset = 90
        chunk_df['large_yaw_change'] = chunk_df['Yaw'].rolling(window=window_reset, min_periods=1, center=True).apply(lambda x: max(x) - min(x), raw=True).abs()
        reset_mask = chunk_df['large_yaw_change'] > 40
        chunk_df.loc[reset_mask, 'labels'] = 'Normal'

    # Check for potential harsh braking in 'Normal' labeled data
    normal_data_mask = ((chunk_df['labels'] == 'Normal') | (chunk_df['labels'] == 'Event')) & (chunk_df['Ax'] < -2000)
    chunk_df.loc[normal_data_mask, 'labels'] = 'Harsh Braking'

    # Potential swerving detection
    potential_swerve_mask = (
        (chunk_df['Ay'].abs() > 2000) & 
        (chunk_df['labels'].isin(['Normal', 'Event']))
    )
    results['potential_swerving_events'] = potential_swerve_mask.sum()
    chunk_df.loc[potential_swerve_mask, 'labels'] = 'Swerving'
    
    over_speed_mask = chunk_df['Speed(km/h)'] > 120
    results['over_speed_events'] = over_speed_mask.sum()
    chunk_df.loc[over_speed_mask, 'labels'] = 'Over Speed'

    normal_mask = (chunk_df['labels'] == 'Event')
    chunk_df.loc[normal_mask, 'labels'] = 'Normal'

    speed_mask = ((chunk_df['labels'] == 'Swerving') & (chunk_df['Speed(km/h)'] < 30))
    chunk_df.loc[speed_mask, 'labels'] = 'Normal'

    # Add harsh_braking_event column (NEW LOGIC)
    chunk_df['harsh_braking_event'] = 0
    prev_label = chunk_df['labels'].shift(1).fillna('Normal')
    new_event_mask = (chunk_df['labels'] == 'Harsh Braking') & (prev_label != 'Harsh Braking')
    chunk_df.loc[new_event_mask, 'harsh_braking_event'] = 1
    if not chunk_df.empty and chunk_df.iloc[0]['labels'] == 'Harsh Braking':
        chunk_df.at[chunk_df.index[0], 'harsh_braking_event'] = 1
    results['harsh_braking_events'] = chunk_df['harsh_braking_event'].sum()  # Update count

    return chunk_df, results

def score_chunk(chunk_df, results):
    # Initialize score to 100%
    score = 100

    # Define weights for each type of event
    harsh_braking_weight = 20  
    harsh_acceleration_weight = 10 
    swerving_weight = 30 
    overspeed_weight = 20  

    # Apply scoring deductions based on detected events
    score -= results['harsh_braking_events'] * harsh_braking_weight
    score -= results['harsh_acceleration_events'] * harsh_acceleration_weight
    score -= results['swerving_events'] * swerving_weight
    score -= results['over_speed_events'] * overspeed_weight

    # Ensure the score doesn't go below 0%
    score = max(score, 0)

    return score

class Command(BaseCommand):
    help = 'Analyzes the cleansed data in the buffer'

    def handle(self, *args, **kwargs):
        if cleansed_buffer:
            data = pd.DataFrame(cleansed_buffer)
            accumulated_distance = 0.0
            current_chunk = []
            segment_data = []
            scores = []

            for index, row in data.iterrows():
                accumulated_distance += row['distance']
                current_chunk.append(row)

                if accumulated_distance >= 0.1:  # 100-meter chunks
                    chunk_df = pd.DataFrame(current_chunk)
                    labeled_chunk, analysis_results = analyze_chunk(chunk_df)
                    score = score_chunk(chunk_df, analysis_results)
                    segment_data.append(analysis_results)
                    accumulated_distance = 0.0
                    scores.append(score)
                    current_chunk = []

                    # Save labeled data to the database
                    for idx, labeled_row in labeled_chunk.iterrows():
                        DrivingData.objects.create(
                            distance=labeled_row['distance'],
                            harsh_braking_events=analysis_results['harsh_braking_events'],
                            harsh_acceleration_events=analysis_results['harsh_acceleration_events'],
                            swerving_events=analysis_results['swerving_events'],
                            potential_swerving_events=analysis_results['potential_swerving_events'],
                            over_speed_events=analysis_results['over_speed_events'],
                            score=score
                        )

            # Process remaining data
            if current_chunk:
                chunk_df = pd.DataFrame(current_chunk)
                if not chunk_df.empty:
                    labeled_chunk, analysis_results = analyze_chunk(chunk_df)
                    segment_data.append(analysis_results)

                    # Save labeled data to the database
                    for idx, labeled_row in labeled_chunk.iterrows():
                        DrivingData.objects.create(
                            distance=labeled_row['distance'],
                            harsh_braking_events=analysis_results['harsh_braking_events'],
                            harsh_acceleration_events=analysis_results['harsh_acceleration_events'],
                            swerving_events=analysis_results['swerving_events'],
                            potential_swerving_events=analysis_results['potential_swerving_events'],
                            over_speed_events=analysis_results['over_speed_events'],
                            score=score
                        )

            total_score = sum(scores)
            final_score = total_score / len(segment_data) if segment_data else 0

            print("Analysis complete!")
            print(f"Final Score: {final_score}")
        else:
            print("Cleansed buffer is empty. No data to analyze.")