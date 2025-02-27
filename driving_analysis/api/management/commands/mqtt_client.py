import paho.mqtt.client as mqtt
import ssl
from django.core.cache import cache
from django.core.management.base import BaseCommand
#from api.cleansing_data import cleanse_data

class Command(BaseCommand):
    help = 'Starts the MQTT client to receive data from the MQTT server'

    def handle(self, *args, **kwargs):
        def on_connect(client, userdata, flags, rc):
            if rc == 0:
                print("Connected to MQTT broker")
                client.subscribe("data")
            else:
                print(f"Failed to connect, return code {rc}")

        def on_message(client, userdata, msg):
            print(f"Message received: {msg.payload.decode()}")
            data = msg.payload.decode()
            data_list = data.split(',')

            data_dict = {
                'counter': int(data_list[0]),
                'timestamp': data_list[1],
                'latitude': float(data_list[2]),
                'longitude': float(data_list[3]),
                'speed': float(data_list[4]),
                'ax': float(data_list[5]),
                'ay': float(data_list[6]),
                'az': float(data_list[7]),
                'gx': float(data_list[8]),
                'gy': float(data_list[9]),
                'gz': float(data_list[10]),
                'yaw': float(data_list[11]),
                'pitch': float(data_list[12]),
                'roll': float(data_list[13])
            }

            # Store the latest location and speed in the cache
            latest_location = {
                  'latitude': data_dict['latitude'],
                  'longitude': data_dict['longitude'],
                   'speed': data_dict['speed']  # Include speed in the cached location
                            }

            # Cache the latest location and speed
            cache.set('latest_location', latest_location, timeout=None)
            
            # Get and update buffer in cache
            buffer = cache.get('buffer', [])
            buffer.append(data_dict)
            cache.set('buffer', buffer, timeout=None)
            
            # When buffer reaches threshold, automatically cleanse and analyze
            if len(buffer) >= 1000:  # You can adjust this threshold
                print(f"Buffer reached 1000 data points - triggering automatic cleansing")
                
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
                from api.models import DrivingData
                
                DrivingData.objects.create(
                    distance=analysis_results.get('distance_km', 0.1),
                    harsh_braking_events=analysis_results.get('harsh_braking_events', 0),
                    harsh_acceleration_events=analysis_results.get('harsh_acceleration_events', 0),
                    swerving_events=analysis_results.get('swerving_events', 0),
                    potential_swerving_events=analysis_results.get('potential_swerving_events', 0),
                    over_speed_events=analysis_results.get('over_speed_events', 0),
                    score=analysis_results.get('score', 100)
                )
                print("Data saved to database")
                
                # Clear buffer after processing
                cache.set('buffer', [], timeout=None)
                print("Automatic cleansing and analysis complete")

        client = mqtt.Client()
        client.username_pw_set("team22", "KauKau123")
        client.tls_set(tls_version=ssl.PROTOCOL_TLS)  # Configure TLS
        client.on_connect = on_connect
        client.on_message = on_message

        print("Connecting to MQTT broker...")
        client.connect("af626fdebdec42bfa3ef70e692bf0d69.s1.eu.hivemq.cloud", 8883, 60)
        client.loop_forever()
