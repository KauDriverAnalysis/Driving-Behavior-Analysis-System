import os
import logging
import sys

# Configure logging with more verbose DEBUG level
logging.basicConfig(
    level=logging.DEBUG,  # Changed from INFO to DEBUG
    format='[MQTT] %(asctime)s - %(levelname)s - %(message)s',
    stream=sys.stdout
)

# Configure the mqtt_client logger specifically
logger = logging.getLogger('mqtt_client')
logger.setLevel(logging.DEBUG)

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