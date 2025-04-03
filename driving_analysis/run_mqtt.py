import os
import logging
import sys

# Configure logging to display on console
logging.basicConfig(
    level=logging.INFO,
    format='[MQTT] %(asctime)s - %(levelname)s - %(message)s',
    stream=sys.stdout
)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'driving_analysis.settings')

# Setup Django properly
import django
django.setup()

logging.info("MQTT Client starting...")

# Now import and run the MQTT client
from api.management.commands.mqtt_client import Command
cmd = Command()

logging.info("MQTT Client initialized, connecting to broker...")
cmd.handle()