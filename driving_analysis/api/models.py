from django.db import models

class Customer(models.Model):
    customr_id = models.BigIntegerField(unique=True)
    name = models.TextField(null=True, blank=True)
    gender = models.IntegerField(choices=[(0, 'Female'), (1, 'Male')])
    phone_number = models.IntegerField(unique=True)
    location = models.TextField()
    password = models.TextField()

class Car(models.Model):
    car_id = models.BigIntegerField()
    model_of_car = models.TextField()
    type_of_car = models.TextField()
    plate_number = models.IntegerField(unique=True)
    release_year_car = models.TextField()
    state_of_car = models.CharField(max_length=7, choices=[('New', 'New'), ('Used', 'Used'), ('Damaged', 'Damaged')])

    # Relationships
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, null=True, blank=True)
    company = models.ForeignKey('Company', on_delete=models.CASCADE, null=True, blank=True)
    driving_data = models.ForeignKey('DrivingData', on_delete=models.CASCADE, null=True, blank=True)

class Company(models.Model):
    company_id = models.BigIntegerField()
    company_name = models.TextField()
    number_of_cars = models.IntegerField()
    contact_number = models.IntegerField()
    email = models.EmailField()
    location = models.TextField()
    password = models.TextField()

class DrivingData(models.Model):
    speed = models.FloatField()
    acceleration = models.FloatField()
    harsh_braking = models.FloatField()
    swerving = models.FloatField()
    accident_detection = models.IntegerField()
    bumps = models.FloatField()
    drilling = models.FloatField()
    timestamp = models.FloatField()

class Driver(models.Model):
    driver_id = models.BigIntegerField()
    name = models.TextField()
    gender = models.IntegerField(choices=[(0, 'Female'), (1, 'Male')])
    phone_number = models.IntegerField(unique=True)

    # Relationships
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
