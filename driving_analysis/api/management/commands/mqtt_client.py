import paho.mqtt.client as mqtt
import ssl
from django.core.management.base import BaseCommand
from api.models import DrivingData
from api.views import buffer
from api.cleansing_data import cleanse_data

class Command(BaseCommand):
    help = 'Starts the MQTT client to receive data from the MQTT server'

    def handle(self, *args, **kwargs):
        global buffer
        cleansed_buffer = []

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
                'timestamp': data_list[1],  # Store timestamp as a string
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

            buffer.append(data_dict)
            if len(buffer) >= 10000:
                print(f"Buffer reached 10,000 data points")
                cleaned_data = cleanse_data(buffer)
                cleansed_buffer.extend(cleaned_data.to_dict('records'))
                print("Cleaned data added to cleansed buffer")
                buffer.clear()

        client = mqtt.Client()
        client.username_pw_set("team22", "KauKau123")
        client.tls_set(tls_version=ssl.PROTOCOL_TLS)  # Configure TLS
        client.on_connect = on_connect
        client.on_message = on_message

        print("Connecting to MQTT broker...")
        client.connect("af626fdebdec42bfa3ef70e692bf0d69.s1.eu.hivemq.cloud", 8883, 60)
        client.loop_forever()
