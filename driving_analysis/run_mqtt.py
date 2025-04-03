import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'driving_analysis.settings')

# Setup Django properly
import django
django.setup()

# Now import and run the MQTT client
from api.management.commands.mqtt_client import Command
cmd = Command()
cmd.handle()