import paho.mqtt.client as mqtt
from django.core.management.base import BaseCommand
from api.models import DrivingData
import json

class Command(BaseCommand):
    help = 'Starts the MQTT client to receive data from the MQTT server'

    def handle(self, *args, **kwargs):
        def on_connect(client, userdata, flags, rc):
            print("Connected with result code " + str(rc))
            client.subscribe("data")

        def on_message(client, userdata, msg):
            data = msg.payload.decode()
            # Split the CSV-like string into a list
            data_list = data.split(',')

            # Create a dictionary from the list
            data_dict = {
                'speed': float(data_list[4]),
                'acceleration': float(data_list[5]),  # Assuming Ax is the acceleration
                'harsh_braking': 0.0,  # Placeholder, update with actual logic if needed
                'swerving': 0.0,  # Placeholder, update with actual logic if needed
                'accident_detection': 0,  # Placeholder, update with actual logic if needed
                'bumps': 0.0,  # Placeholder, update with actual logic if needed
                'drilling': 0.0,  # Placeholder, update with actual logic if needed
                'timestamp': float(data_list[1]),
                'latitude': float(data_list[2]),
                'longitude': float(data_list[3])
            }

            DrivingData.objects.create(
                speed=data_dict['speed'],
                acceleration=data_dict['acceleration'],
                harsh_braking=data_dict['harsh_braking'],
                swerving=data_dict['swerving'],
                accident_detection=data_dict['accident_detection'],
                bumps=data_dict['bumps'],
                drilling=data_dict['drilling'],
                timestamp=data_dict['timestamp'],
                latitude=data_dict['latitude'],
                longitude=data_dict['longitude']
            )

        client = mqtt.Client()
        client.username_pw_set("team22", "KauKau123")
        client.on_connect = on_connect
        client.on_message = on_message

        client.connect("af626fdebdec42bfa3ef70e692bf0d69.s1.eu.hivemq.cloud", 8883, 60)
        client.loop_forever()
