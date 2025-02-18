from django import forms
from .models import Customer, Company, Car, Driver,DrivingData
from django.contrib.auth.hashers import make_password
import re
from django.core.exceptions import ValidationError



class CustomerForm(forms.ModelForm):
    class Meta:
        model = Customer
        fields = ['Name', 'gender', 'phone_number', 'address', 'Password']
    def clean_contact_number(self):
        contact_number = self.cleaned_data.get('phone_number')
        if not re.match(r'^(?:\+966|05)\d{8}$', contact_number):
            raise ValidationError('Invalid phone number format for Saudi Arabia')
        return contact_number
    
    def save(self, commit=True):
        customer = super(CustomerForm, self).save(commit=False)
        customer.Password = make_password(self.cleaned_data['Password'])
        if commit:
            customer.save()
        return customer


class CompanyForm(forms.ModelForm):
    class Meta:
        model = Company
        fields = ['Company_name', 'Contact_number', 'Email', 'location', 'Password']
    
    def clean_contact_number(self):
        contact_number = self.cleaned_data.get('Contact_number')
        if not re.match(r'^(?:\+966|05)\d{8}$', contact_number):
            raise ValidationError('Invalid phone number format for Saudi Arabia')
        return contact_number
    
    def save(self, commit=True):
        company = super(CompanyForm, self).save(commit=False)
        company.Password = make_password(self.cleaned_data['Password'])
        if commit:
            company.save()
        return company


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