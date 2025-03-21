import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'driving_analysis.settings')

from django.db import models
from django.contrib.postgres.fields import ArrayField
import json
from django.core.exceptions import ValidationError

class Customer(models.Model):
    Name = models.CharField(max_length=255)
    gender = models.CharField(max_length=6, choices=[('male', 'Male'), ('female', 'Female')])
    phone_number = models.CharField(max_length=20, unique=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    Email = models.EmailField(unique=True)
    Password = models.CharField(max_length=255)
    reset_token = models.CharField(max_length=100, null=True, blank=True)
    reset_token_expires = models.DateTimeField(null=True, blank=True)

class Company(models.Model):
    Company_name = models.CharField(max_length=255)
    Contact_number = models.CharField(max_length=20)
    Email = models.EmailField(unique=True)
    location = models.CharField(max_length=255)
    Password = models.CharField(max_length=255)
    reset_token = models.CharField(max_length=100, null=True, blank=True)
    reset_token_expires = models.DateTimeField(null=True, blank=True)

class Car(models.Model):
    Model_of_car = models.CharField(max_length=255, default='Unknown Model')
    TypeOfCar = models.CharField(max_length=255)
    Plate_number = models.CharField(max_length=20, unique=True)
    Release_Year_car = models.IntegerField()
    State_of_car = models.CharField(max_length=7, choices=[('online', 'Online'), ('offline', 'Offline')])
    device_id=models.CharField(max_length=255, unique=True)
    customer_id = models.ForeignKey('Customer', on_delete=models.SET_NULL, null=True, blank=True)
    company_id = models.ForeignKey('Company', on_delete=models.SET_NULL, null=True, blank=True)

class Driver(models.Model):
    name = models.CharField(max_length=255)
    gender = models.CharField(max_length=6, choices=[('male', 'Male'), ('female', 'Female')])
    phone_number = models.CharField(max_length=20, unique=True)
    company_id = models.ForeignKey('Company', on_delete=models.CASCADE)
    car_id = models.ForeignKey('Car', on_delete=models.CASCADE)  # Ensure correct relation

class DrivingData(models.Model):
    speed = models.FloatField()
    accident_detection = models.BooleanField()
    created_at = models.DateTimeField(auto_now_add=True)
    car_id = models.ForeignKey('Car', on_delete=models.CASCADE)
    distance = models.FloatField(default=0.0)
    harsh_braking_events = models.IntegerField(default=0)
    harsh_acceleration_events = models.IntegerField(default=0)
    swerving_events = models.IntegerField(default=0)
    potential_swerving_events = models.IntegerField(default=0)
    over_speed_events = models.IntegerField(default=0)
    score = models.FloatField(default=100.0)

class Employee(models.Model):
    Name = models.CharField(max_length=255)
    gender = models.CharField(max_length=6, choices=[('male', 'Male'), ('female', 'Female')])
    phone_number = models.CharField(max_length=20, unique=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    Email = models.EmailField(unique=True)
    Password = models.CharField(max_length=255)
    Admin = models.BooleanField(default=False)  # `New Admin field``
    reset_token = models.CharField(max_length=100, null=True, blank=True)
    reset_token_expires = models.DateTimeField(null=True, blank=True)
    company_id = models.ForeignKey(Company, on_delete=models.CASCADE, null=True, blank=True)


class Geofence(models.Model):
    GEOFENCE_TYPES = (
        ('circle', 'Circle'),
        ('polygon', 'Polygon'),
    )
    
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    type = models.CharField(max_length=10, choices=GEOFENCE_TYPES)
    coordinates_json = models.TextField()
    radius = models.FloatField(null=True, blank=True)  # Only for circle type
    color = models.CharField(max_length=20, default='#ff4444')
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    customer_id = models.ForeignKey(Customer, on_delete=models.CASCADE, null=True, blank=True)
    company_id = models.ForeignKey(Company, on_delete=models.CASCADE, null=True, blank=True)

    def set_coordinates(self, coordinates):
        self.coordinates_json = json.dumps(coordinates)
        
    def get_coordinates(self):
        return json.loads(self.coordinates_json)
    
 



