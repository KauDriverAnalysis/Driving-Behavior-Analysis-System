from django.apps import AppConfig
from multiprocessing import Manager

class ApiConfig(AppConfig):
    name = 'api'

    def ready(self):
        global shared_data_global
        manager = Manager()
        shared_data_global = manager.dict()
        shared_data_global['buffer'] = []
        shared_data_global['latest_location'] = None
        shared_data_global['cleansed_buffer'] = []