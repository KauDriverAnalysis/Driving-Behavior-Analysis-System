from django import forms
from .models import Customer, Company, Car, Driver, DrivingData, Employee, Geofence
from django.contrib.auth.hashers import make_password
import re
from django.core.exceptions import ValidationError
from django.db.models import Q
from functools import reduce
import operator
import json

def check_email_uniqueness(email, exclude_model=None, exclude_id=None):
    """
    Check if email is unique across all user models.
    
    Args:
        email: The email to check
        exclude_model: Optional model class to exclude from check (for updates)
        exclude_id: Optional ID to exclude from check (for updates)
    
    Returns:
        True if email is unique across all models, False otherwise
    """
    models_to_check = [Customer, Company, Employee]
    
    # Check each model for the email
    for model in models_to_check:
        query = Q(Email__iexact=email)  # Case-insensitive comparison
        
        # Exclude the current instance if updating
        if exclude_model == model and exclude_id:
            query &= ~Q(id=exclude_id)
            
        if model.objects.filter(query).exists():
            return False
            
    return True

class CustomerForm(forms.ModelForm):
    class Meta:
        model = Customer
        fields = ['Name', 'gender', 'phone_number', 'address', 'Email', 'Password', 'reset_token', 'reset_token_expires']
        # Make token fields hidden by default since they're managed by the system
        widgets = {
            'reset_token': forms.HiddenInput(),
            'reset_token_expires': forms.HiddenInput(),
        }
    
    def clean_phone_number(self):
        phone_number = self.cleaned_data.get('phone_number')
        if not re.match(r'^(?:\+966|05)\d{8}$', phone_number):
            raise ValidationError('Invalid phone number format for Saudi Arabia')
        return phone_number
    
    def save(self, commit=True):
        customer = super(CustomerForm, self).save(commit=False)
        customer.Password = make_password(self.cleaned_data['Password'])
        if commit:
            customer.save()
        return customer

class CompanyForm(forms.ModelForm):
    class Meta:
        model = Company
        fields = ['Company_name', 'Contact_number', 'Email', 'location', 'Password', 'reset_token', 'reset_token_expires']
        # Make token fields hidden by default
        widgets = {
            'reset_token': forms.HiddenInput(),
            'reset_token_expires': forms.HiddenInput(),
        }
    
    def clean_Contact_number(self):
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
        fields = ['Model_of_car', 'TypeOfCar', 'Plate_number', 'Release_Year_car', 'State_of_car', 'device_id','customer_id', 'company_id']
    def clean_Plate_number(self):
        plate_number = self.cleaned_data.get('Plate_number')
        pattern = re.compile(r'^[A-Z]{3}\s\d{4}$')  # Pattern: 3 letters followed by 4 digits
        if not pattern.match(plate_number):
            raise ValidationError('Invalid car plate number format. It should be 3 letters followed by 4 digits (e.g., "ABC 1234").')
        return plate_number

    

class DriverForm(forms.ModelForm):
    class Meta:
        model = Driver
        fields = ['name', 'gender', 'phone_number', 'company_id', 'car_id']
    
    def clean_phone_number(self):
        phone_number = self.cleaned_data.get('phone_number')
        if not re.match(r'^(?:\+966|05)\d{8}$', phone_number):
            raise ValidationError('Invalid phone number format for Saudi Arabia')
        return phone_number

class DrivingDataForm(forms.ModelForm):
    class Meta:
        model = DrivingData
        fields = [
            'speed', 'accident_detection', 'car_id', 'distance', 'harsh_braking_events',
            'harsh_acceleration_events', 'swerving_events', 'potential_swerving_events',
            'over_speed_events', 'score'
        ]
class EmployeeForm(forms.ModelForm):
    class Meta:
        model = Employee
        fields = ['Name', 'gender', 'phone_number', 'address', 'Email', 'Password', 'Admin', 'reset_token', 'reset_token_expires','company_id']
        # Make token fields hidden by default
        widgets = {
            'reset_token': forms.HiddenInput(),
            'reset_token_expires': forms.HiddenInput(),
        }

    def clean_phone_number(self):
        phone_number = self.cleaned_data.get('phone_number')
        if not re.match(r'^(?:\+966|05)\d{8}$', phone_number):
            raise ValidationError('Invalid phone number format for Saudi Arabia')
        return phone_number

    def save(self, commit=True):
        employee = super(EmployeeForm, self).save(commit=False)
        
        # Hash the password
        employee.Password = make_password(self.cleaned_data['Password'])
        
        # Check if this is the first employee
        if not Employee.objects.exists():
            employee.Admin = True
            
        if commit:
            employee.save()
        return employee

class GeofenceForm(forms.ModelForm):
    class Meta:
        model = Geofence
        fields = ['name', 'description', 'type', 'coordinates_json', 'radius', 'color', 'active','customer_id', 'company_id']
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Make some fields optional
        self.fields['description'].required = False
        
    def clean(self):
        cleaned_data = super().clean()
        geofence_type = cleaned_data.get('type')
        radius = cleaned_data.get('radius')
        coordinates_json = cleaned_data.get('coordinates_json')
        company_id = cleaned_data.get('company_id')
        customer_id = cleaned_data.get('customer_id')
        
        # Validate coordinates format
        try:
            coordinates = json.loads(coordinates_json)
        except json.JSONDecodeError:
            raise ValidationError('Invalid JSON format for coordinates')
            
        # Validate geofence type-specific requirements
        if geofence_type == 'circle':
            if radius is None or radius <= 0:
                raise ValidationError('Circle geofence must have a positive radius')
                
            if not (isinstance(coordinates, list) and len(coordinates) == 2 and
                   all(isinstance(c, (int, float)) for c in coordinates)):
                raise ValidationError('Circle geofence requires a single coordinate pair [lat, lng]')
                
        elif geofence_type == 'polygon':
            if not (isinstance(coordinates, list) and len(coordinates) >= 3):
                raise ValidationError('Polygon geofence requires at least 3 coordinate pairs')
                
            for point in coordinates:
                if not (isinstance(point, list) and len(point) == 2 and
                       all(isinstance(c, (int, float)) for c in point)):
                    raise ValidationError('Invalid coordinate pair in polygon')

        # Validate owner constraints
        if not company_id and not customer_id:
            raise ValidationError("Either company_id or customer_id must be set")
        if company_id and customer_id:
            raise ValidationError("Cannot set both company_id and customer_id")
            
        return cleaned_data

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.name} ({self.type})"



