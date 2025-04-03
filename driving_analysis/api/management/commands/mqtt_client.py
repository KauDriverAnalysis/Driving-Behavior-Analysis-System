import paho.mqtt.client as mqtt
import ssl
import logging
from django.core.cache import cache
from django.core.management.base import BaseCommand
#from api.cleansing_data import cleanse_data

# Create a logger for this module
logger = logging.getLogger('mqtt_client')

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
            logger.info(f"Message received: {msg.payload.decode()}")
            data = msg.payload.decode()
            data_list = data.split(',')

            try:
                data_dict = {
                    'device_name': data_list[0],
                    'counter': int(data_list[1]) if data_list[1] else 0,
                    'timestamp': data_list[2],
                    'latitude': float(data_list[3]) if data_list[3] else 0.0,
                    'longitude': float(data_list[4]) if data_list[4] else 0.0,
                    'speed': float(data_list[5]) if data_list[5] else 0.0,
                    'ax': float(data_list[6]) if data_list[6] else 0,
                    'ay': float(data_list[7]) if data_list[7] else 0,
                    'az': float(data_list[8]) if data_list[8] else 0,
                    'yaw': float(data_list[9]) if data_list[9] else 0.0
                }

                # Store the latest location and speed in the cache
                latest_location = {
                    'latitude': data_dict['latitude'],
                    'longitude': data_dict['longitude'],
                    'speed': data_dict['speed'],
                    'device_id': data_dict['device_name']  # Use device_name from data_dict instead
                }

                # Cache the latest location and speed
                cache.set('latest_location', latest_location, timeout=None)
                
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
                            score=analysis_results.get('score', 100)
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
                            score=analysis_results.get('score', 100)
                        )
                        logger.info("Data saved to database without car association")
                    
                    logger.info("Data saved to database")
                    
                    # Clear buffer after processing
                    cache.set('buffer', [], timeout=None)
                    logger.info("Automatic cleansing and analysis complete")
            except Exception as e:
                logger.exception(f"Error processing message: {e}")
                logger.error(f"Raw message data: {data}")

        client = mqtt.Client()
        client.username_pw_set("team22", "KauKau123")
        client.tls_set(tls_version=ssl.PROTOCOL_TLS)  # Configure TLS
        client.on_connect = on_connect
        client.on_message = on_message

        logger.info("Connecting to MQTT broker...")
        client.connect("af626fdebdec42bfa3ef70e692bf0d69.s1.eu.hivemq.cloud", 8883, 60)
        client.loop_forever()
