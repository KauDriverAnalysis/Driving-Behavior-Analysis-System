#!/bin/bash
# Start the MQTT client in the background
python manage.py mqtt_client &

# Start the web server in the foreground
gunicorn driving_analysis.wsgi:application