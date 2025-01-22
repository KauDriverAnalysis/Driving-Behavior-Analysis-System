from django.contrib import admin
from .models import Customer, Car, Company, DrivingData, Driver

admin.site.register(Customer)
admin.site.register(Car)
admin.site.register(Company)
admin.site.register(DrivingData)
admin.site.register(Driver)
