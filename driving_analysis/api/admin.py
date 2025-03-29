from django.contrib import admin
from .models import Customer, Car, Company, DrivingData, Driver,Employee,Geofence, ScorePattern

admin.site.register(Customer)
admin.site.register(Car)
admin.site.register(Company)
admin.site.register(DrivingData)
admin.site.register(Driver)
admin.site.register(Employee)
admin.site.register(Geofence)
admin.site.register(ScorePattern)
