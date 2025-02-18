from django.core.management.base import BaseCommand
from api.views import buffer
from api.cleansing_data import cleanse_data

class Command(BaseCommand):
    help = 'Cleanses the data in the buffer'

    def handle(self, *args, **kwargs):
        if buffer:
            cleaned_data = cleanse_data(buffer)
            print("Cleaned data:")
            print(cleaned_data)
        else:
            print("Buffer is empty. No data to cleanse.")
