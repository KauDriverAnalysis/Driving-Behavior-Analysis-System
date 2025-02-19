import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'driving_analysis.settings')

from django.db import models

class Customer(models.Model):
    Name = models.CharField(max_length=255)
    gender = models.CharField(max_length=6, choices=[('male', 'Male'), ('female', 'Female')])
    phone_number = models.CharField(max_length=20, unique=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    Email = models.EmailField(unique=True)
    Password = models.CharField(max_length=255)

class Company(models.Model):
    Company_name = models.CharField(max_length=255)
    Contact_number = models.CharField(max_length=20)
    Email = models.EmailField(unique=True)
    location = models.CharField(max_length=255)
    Password = models.CharField(max_length=255)

class Car(models.Model):
    Model_of_car = models.CharField(max_length=255, default='Unknown Model')
    TypeOfCar = models.CharField(max_length=255)
    Plate_number = models.CharField(max_length=20, unique=True)
    Release_Year_car = models.IntegerField()
    State_of_car = models.CharField(max_length=7, choices=[('online', 'Online'), ('offline', 'Offline')])
    customer_id = models.ForeignKey('Customer', on_delete=models.SET_NULL, null=True, blank=True)
    company_id = models.ForeignKey('Company', on_delete=models.SET_NULL, null=True, blank=True)

class Driver(models.Model):
    name = models.CharField(max_length=255)
    gender = models.CharField(max_length=6, choices=[('male', 'Male'), ('female', 'Female')])
    phone_number = models.CharField(max_length=20, unique=True)
    company_id = models.ForeignKey('Company', on_delete=models.CASCADE)

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
