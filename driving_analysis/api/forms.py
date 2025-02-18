from django import forms
from .models import Customer, Company, Car, Driver,DrivingData

class CustomerForm(forms.ModelForm):
    class Meta:
        model = Customer
        fields = ['Name', 'gender', 'phone_number', 'address', 'Password']

class CompanyForm(forms.ModelForm):
    class Meta:
        model = Company
        fields = ['Company_name', 'Contact_number', 'Email', 'location', 'Password']

class CarForm(forms.ModelForm):
    class Meta:
        model = Car
        fields = ['Model_of_car', 'TypeOfCar', 'Plate_number', 'Release_Year_car', 'State_of_car', 'customer_id', 'company_id']

class DriverForm(forms.ModelForm):
    class Meta:
        model = Driver
        fields = ['Name', 'License_number', 'Phone_number', 'Address', 'Company']
class DrivingDataForm(forms.ModelForm):
    class Meta:
        model = DrivingData
        fields = ['speed', 'high_acceleration', 'harsh_braking', 'accident_detection', 'car_id']