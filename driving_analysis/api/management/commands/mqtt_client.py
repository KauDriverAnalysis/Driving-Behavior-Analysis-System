import paho.mqtt.client as mqtt
import ssl
import logging
import os
import json
from django.core.cache import cache
from django.core.management.base import BaseCommand
#from api.cleansing_data import cleanse_data

# Create a logger for this module
logger = logging.getLogger('mqtt_client')

# Define a directory to store location files
LOCATION_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'location_data')

# Create the directory if it doesn't exist
if not os.path.exists(LOCATION_DIR):
    os.makedirs(LOCATION_DIR)

class Command(BaseCommand):
    help = 'Starts the MQTT client to receive data from the MQTT server'

    def handle(self, *args, **kwargs):
        def on_connect(client, userdata, flags, rc):
            if rc == 0:
                logger.info("Connected to MQTT broker")
                client.subscribe("data")
            else:
                logger.error(f"Failed to connect, return code {rc}")

        def on_message(client, userdata, msg):
            try:
                # Log the raw message first
                raw_data = msg.payload.decode()
                logger.info(f"Message received with multiple lines")
                
                # Split the message by newlines to handle multiple records
                data_lines = raw_data.replace('\r\n', '\n').replace('\r', '\n').strip().split('\n')
                logger.info(f"Found {len(data_lines)} data lines in message")
                
                # Print the last line from the batch (newly added)
                if data_lines:
                    last_line = data_lines[-1]
                    logger.info(f"Last line in batch: {last_line}")
                    print(f"LAST LINE: {last_line}")
                
                for data in data_lines:
                    if not data.strip():
                        continue

                    data_list = data.split(',')

                    # Now expecting at least 11 values (accident is the last)
                    if len(data_list) < 11:
                        logger.warning(f"Received incomplete data format (expected 11+ values, got {len(data_list)}): {data}")
                        continue

                    try:
                        data_dict = {
                            'device_name': data_list[0],
                            'counter': int(data_list[1] if data_list[1] else 0),
                            'timestamp': data_list[2],
                            'latitude': float(data_list[3] if data_list[3] else 0.0),
                            'longitude': float(data_list[4] if data_list[4] else 0.0),
                            'speed': float(data_list[5] if data_list[5] else 0.0),
                            'ax': float(data_list[6] if data_list[6] else 0),
                            'ay': float(data_list[7] if data_list[7] else 0),
                            'az': float(data_list[8] if data_list[8] else 0),
                            'yaw': float(data_list[9].strip() if data_list[9] else 0.0),
                            'accident': int(data_list[10].strip() if data_list[10] else 0)
                        }
                        
                        # Rest of your processing code...
                        # Store the latest location and speed in the cache
                        latest_location = {
                            'latitude': data_dict['latitude'],
                            'longitude': data_dict['longitude'],
                            'speed': data_dict['speed'],
                            'device_id': data_dict['device_name']
                        }

                        # Store the latest location in a file
                        location_file = os.path.join(LOCATION_DIR, f'location_{data_dict["device_name"]}.json')
                        with open(location_file, 'w') as f:
                            json.dump(latest_location, f)
                        print(f"Location saved to file for device: {data_dict['device_name']}")
                        
                        # Cache the latest location and speed
                        cache_success = cache.set(f'latest_location_{data_dict["device_name"]}', latest_location, timeout=None)
                        if cache_success:
                            print(f"Cache set for latest_location: SUCCESS (device: {data_dict['device_name']})")
                        else:
                            print(f"Cache set for latest_location: FAILED (device: {data_dict['device_name']})")
                        # Get and update buffer in cache
                        buffer = cache.get('buffer', [])
                        buffer.append(data_dict)
                        cache.set('buffer', buffer, timeout=None)
                        
                        # When buffer reaches threshold, automatically cleanse and analyze
                        if len(buffer) >= 1000:  # You can adjust this threshold
                            logger.info(f"Buffer reached 1000 data points - triggering automatic cleansing")
                            
                            # Cleansing
                            from api.cleansing_data import cleanse_data
                            cleaned_data = cleanse_data(buffer)
                            
                            # Get and update cleansed buffer in cache
                            cleansed_buffer = cache.get('cleansed_buffer', [])
                            cleansed_buffer.extend(cleaned_data.to_dict('records'))
                            cache.set('cleansed_buffer', cleansed_buffer, timeout=None)
                            
                            # Analysis
                            from api.analysis import analyze_data
                            analysis_results = analyze_data(cleaned_data)
                            cache.set('analysis_results', analysis_results, timeout=None)
                            
                            # Save the analysis results to the database
                            from api.models import DrivingData, Car
                            
                            # Get the device_id from the data
                            device_id = data_list[0]  # The device name is the first element
                            
                            # Find the car with this device_id
                            try:
                                car = Car.objects.get(device_id=device_id)
                                logger.info(f"Found car with ID {car.id} for device {device_id}")
                                
                                # Create DrivingData record with car_id
                                DrivingData.objects.create(
                                    car_id=car,  # Link to the car
                                    distance=analysis_results.get('distance_km', 0.1),
                                    harsh_braking_events=analysis_results.get('harsh_braking_events', 0),
                                    harsh_acceleration_events=analysis_results.get('harsh_acceleration_events', 0),
                                    swerving_events=analysis_results.get('swerving_events', 0),
                                    potential_swerving_events=analysis_results.get('potential_swerving_events', 0),
                                    over_speed_events=analysis_results.get('over_speed_events', 0),
                                    score=analysis_results.get('score', 100),
                                    accident_detection=bool(data_dict['accident'])  # <-- Only in DB
                                )
                                logger.info(f"Data saved to database and linked to car ID {car.id}")
                            except Car.DoesNotExist:
                                logger.warning(f"No car found with device_id {device_id}")
                                # Save data without car association as fallback
                                DrivingData.objects.create(
                                    distance=analysis_results.get('distance_km', 0.1),
                                    harsh_braking_events=analysis_results.get('harsh_braking_events', 0),
                                    harsh_acceleration_events=analysis_results.get('harsh_acceleration_events', 0),
                                    swerving_events=analysis_results.get('swerving_events', 0),
                                    potential_swerving_events=analysis_results.get('potential_swerving_events', 0),
                                    over_speed_events=analysis_results.get('over_speed_events', 0),
                                    score=analysis_results.get('score', 100),
                                    accident_detection=bool(data_dict['accident'])  # <-- Only in DB
                                )
                                logger.info("Data saved to database without car association")
                            
                            logger.info("Data saved to database")
                            
                            # Clear buffer after processing
                            cache.set('buffer', [], timeout=None)
                            logger.info("Automatic cleansing and analysis complete")
                    except Exception as e:
                        logger.exception(f"Error processing individual data line: {e}")
                        logger.error(f"Problematic data line: {data}")
                        
            except Exception as e:
                logger.exception(f"Error processing message: {e}")
                logger.error(f"Raw message data: {raw_data}")

        client = mqtt.Client()
        client.username_pw_set("team22", "KauKau123")
        client.tls_set(tls_version=ssl.PROTOCOL_TLS)  # Configure TLS
        client.on_connect = on_connect
        client.on_message = on_message

        logger.info("Connecting to MQTT broker...")
        client.connect("af626fdebdec42bfa3ef70e692bf0d69.s1.eu.hivemq.cloud", 8883, 60)
        client.loop_forever()
