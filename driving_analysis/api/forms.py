from django import forms
from .models import Customer

class CustomerForm(forms.ModelForm):
    class Meta:
        model = Customer
        fields = ['Name', 'gender', 'phone_number', 'address', 'Password']
