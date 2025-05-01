from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse, HttpResponse
import folium
from django.core.cache import cache
from .models import DrivingData, Customer, Company, Car, Driver, ScorePattern
from .forms import CustomerForm, CompanyForm, CarForm, DriverForm, DrivingDataForm, ScorePattern
from .models import DrivingData, Customer, Company, Car, Driver,Employee
from .forms import CustomerForm, CompanyForm, CarForm, DriverForm,DrivingDataForm,EmployeeForm
from .cleansing_data import cleanse_data
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
import json
import time  # Add this import for time.time()
from django.contrib.auth.hashers import check_password  # Add this for password checking
from django.contrib.auth.hashers import make_password
from django.utils import timezone
import uuid
from datetime import timedelta
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from datetime import timedelta
import os
# Add these imports at the top of your views.py
from .models import Geofence
from .forms import GeofenceForm


LOCATION_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'location_data')

from django.http import JsonResponse
from django.core.cache import cache

def get_latest_data(request):
    latest_location = cache.get('latest_location')
    print(f"latest_data: {latest_location}")  # Debugging statement
    if (latest_location):
        data_dict = {
            'latitude': latest_location['latitude'],
            'longitude': latest_location['longitude'],
            'speed': latest_location['speed'],
            'device_id': latest_location['device_id']
        }
        data_list = [data_dict]
    else:
        data_list = []
    
    response = JsonResponse(data_list, safe=False)
    # Add CORS headers manually if needed
    response["Access-Control-Allow-Origin"] = "http://https://driving-analysis.netlify.app/"
    response["Access-Control-Allow-Methods"] = "GET, OPTIONS"
    response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response


@csrf_exempt
def customer_list(request):
    try:
        # Get query parameters
        user_type = request.GET.get('userType')
        user_id = request.GET.get('userId')
        
        if not user_type or not user_id:
            # If no parameters provided, return all customers (for backward compatibility)
            customers = Customer.objects.all()
        elif user_type == 'customer':
            # If customer_id provided, return only that customer
            customers = Customer.objects.filter(id=user_id)
        elif user_type == 'company':
            # If company_id provided, return customers with cars associated with this company
            cars = Car.objects.filter(company_id=user_id)
            customer_ids = cars.values_list('customer_id', flat=True).distinct()
            customers = Customer.objects.filter(id__in=customer_ids)
        elif user_type == 'employee' or user_type == 'admin':
            # Get the employee's company and return all its customers
            try:
                employee = Employee.objects.get(id=user_id)
                if employee.company_id:
                    cars = Car.objects.filter(company_id=employee.company_id)
                    customer_ids = cars.values_list('customer_id', flat=True).distinct()
                    customers = Customer.objects.filter(id__in=customer_ids)
                else:
                    # If employee has no company, return empty list
                    customers = Customer.objects.none()
            except Employee.DoesNotExist:
                return JsonResponse({'error': 'Employee not found'}, status=404)
        else:
            return JsonResponse({'error': 'Invalid user type'}, status=400)
        
        customer_data = [
            {
                'id': customer.id,
                'Name': customer.Name,
                'Email': customer.Email,
                'phone_number': customer.phone_number,
                'gender': customer.gender,
                'address': customer.address
            }
            for customer in customers
        ]
        
        return JsonResponse(customer_data, safe=False)
    except Exception as e:
        print(f"Error retrieving customers: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def create_customer(request):
    if request.method == 'POST':
        try:
            # Check if this is a JSON request from the React app
            if request.content_type == 'application/json':
                # Parse JSON data from request body
                data = json.loads(request.body)
                print(f"Received customer data: {data}")  # Debug print
                
                # Get user information
                user_type = data.pop('userType', None)
                user_id = data.pop('userId', None)
                
                # Ensure gender is lowercase
                if 'gender' in data:
                    data['gender'] = data['gender'].lower()
                
                # Create form with JSON data
                form = CustomerForm(data)
                if form.is_valid():
                    customer = form.save()
                    
                    # If company or employee creates a customer, create an associated car
                    if (user_type == 'company' or user_type == 'employee' or user_type == 'admin') and 'car' in data:
                        car_data = data['car']
                        company_id = None
                        
                        if user_type == 'company':
                            company_id = user_id
                        elif user_type == 'employee' or user_type == 'admin':
                            try:
                                employee = Employee.objects.get(id=user_id)
                                if employee.company_id:
                                    company_id = employee.company_id.id
                            except Employee.DoesNotExist:
                                pass
                        
                        if company_id:
                            try:
                                car_data['customer_id'] = customer
                                car_data['company_id'] = Company.objects.get(id=company_id)
                                car_form = CarForm(car_data)
                                if car_form.is_valid():
                                    car_form.save()
                            except Exception as car_error:
                                print(f"Error creating associated car: {str(car_error)}")
                    
                    return JsonResponse({
                        'success': True, 
                        'id': customer.id,
                        'message': 'Customer created successfully'
                    }, status=201)
                else:
                    print(f"Form validation errors: {form.errors}")
                    return JsonResponse({'errors': form.errors}, status=400)
            else:
                # Handle traditional form submission
                form = CustomerForm(request.POST)
                if form.is_valid():
                    form.save()
                    return redirect('customer_list')
        except Exception as e:
            print(f"Error creating customer: {str(e)}")
            return JsonResponse({'errors': {'server': str(e)}}, status=500)
    else:
        form = CustomerForm()
    return render(request, 'create_customer.html', {'form': form})

@csrf_exempt
def update_customer(request, customer_id):
    """Update details for a specific customer"""
    customer = get_object_or_404(Customer, pk=customer_id)
    if request.method == 'POST':
        try:
            # Parse JSON data from request body
            data = json.loads(request.body)
            print(f"Received update data for customer {customer_id}: {data}")
            
            # Get user information for permission check
            user_type = data.pop('userType', None)
            user_id = data.pop('userId', None)
            
            # Permission check
            if user_type == 'customer' and int(user_id) != customer.id:
                return JsonResponse({'error': 'Permission denied'}, status=403)
            elif user_type == 'company':
                # Check if customer has a car associated with this company
                car_exists = Car.objects.filter(customer_id=customer.id, company_id=user_id).exists()
                if not car_exists:
                    return JsonResponse({'error': 'Permission denied'}, status=403)
            elif user_type == 'employee' or user_type == 'admin':
                # Check if customer has a car associated with employee's company
                try:
                    employee = Employee.objects.get(id=user_id)
                    if employee.company_id:
                        car_exists = Car.objects.filter(customer_id=customer.id, company_id=employee.company_id.id).exists()
                        if not car_exists:
                            return JsonResponse({'error': 'Permission denied'}, status=403)
                    else:
                        return JsonResponse({'error': 'Employee not associated with any company'}, status=403)
                except Employee.DoesNotExist:
                    return JsonResponse({'error': 'Employee not found'}, status=404)
            
            # If Password is not provided or empty, remove it from validation
            if 'Password' in data and not data['Password']:
                mutable_data = dict(data)
                del mutable_data['Password']
                form = CustomerForm(mutable_data, instance=customer)
            else:
                form = CustomerForm(data, instance=customer)
                
            if form.is_valid():
                # If using an empty password, keep the original
                if 'Password' in data and not data['Password']:
                    updated_customer = form.save(commit=False)
                    updated_customer.Password = customer.Password
                    updated_customer.save()
                else:
                    updated_customer = form.save()
                
                return JsonResponse({
                    'success': True,
                    'id': updated_customer.id,
                    'Name': updated_customer.Name,
                    'Email': updated_customer.Email,
                    'phone_number': updated_customer.phone_number,
                    'gender': updated_customer.gender,
                    'address': updated_customer.address,
                    'message': 'Customer updated successfully'
                }, status=200)
            else:
                print(f"Form validation errors: {form.errors}")
                return JsonResponse({'errors': form.errors}, status=400)
        except Exception as e:
            print(f"Error updating customer: {str(e)}")
            return JsonResponse({'errors': {'server': str(e)}}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def delete_customer(request, customer_id):
    """Delete a specific customer with permission checks"""
    customer = get_object_or_404(Customer, pk=customer_id)
    
    if request.method == 'POST' or request.method == 'DELETE':
        try:
            # Get user information from query parameters or body
            user_type = None
            user_id = None
            
            if request.content_type == 'application/json':
                # Get from JSON body
                data = json.loads(request.body)
                user_type = data.get('userType')
                user_id = data.get('userId')
            else:
                # Get from query parameters
                user_type = request.GET.get('userType') 
                user_id = request.GET.get('userId')
            
            if not user_type or not user_id:
                return JsonResponse({'error': 'userType and userId are required'}, status=400)
            
            # Permission check
            if user_type == 'customer' and int(user_id) != customer.id:
                return JsonResponse({'error': 'Permission denied'}, status=403)
            elif user_type == 'company':
                # Check if customer has a car associated with this company
                car_exists = Car.objects.filter(customer_id=customer.id, company_id=user_id).exists()
                if not car_exists:
                    return JsonResponse({'error': 'Permission denied'}, status=403)
            elif user_type == 'employee' or user_type == 'admin':
                # Check if customer has a car associated with employee's company
                try:
                    employee = Employee.objects.get(id=user_id)
                    if employee.company_id:
                        car_exists = Car.objects.filter(customer_id=customer.id, company_id=employee.company_id.id).exists()
                        if not car_exists:
                            return JsonResponse({'error': 'Permission denied'}, status=403)
                    else:
                        return JsonResponse({'error': 'Employee not associated with any company'}, status=403)
                except Employee.DoesNotExist:
                    return JsonResponse({'error': 'Employee not found'}, status=404)
            
            # If permission check passes, delete the customer
            customer.delete()
            return JsonResponse({'success': True, 'message': 'Customer deleted successfully'}, status=200)
            
        except Exception as e:
            print(f"Error deleting customer: {str(e)}")
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

# Company views
@csrf_exempt
def create_company(request):
    if request.method == 'POST':
        try:
            # Parse JSON data from request body
            data = json.loads(request.body)
            print(f"Received company data: {data}")  # Debug print
            
            # Create form with JSON data
            form = CompanyForm(data)
            if form.is_valid():
                company = form.save()
                return JsonResponse({
                    'success': True, 
                    'id': company.id,
                    'message': 'Company created successfully'
                }, status=201)
            else:
                print(f"Form validation errors: {form.errors}")
                return JsonResponse({'errors': form.errors}, status=400)
        except Exception as e:
            print(f"Error creating company: {str(e)}")
            return JsonResponse({'errors': {'server': str(e)}}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def update_company(request, company_id):
    company = get_object_or_404(Company, pk=company_id)
    if request.method == 'POST':
        try:
            # Parse JSON data from request body
            data = json.loads(request.body)
            print(f"Received update data for company {company_id}: {data}")  # Debug print
            
            # If Password is not provided or empty, use the existing password
            if 'Password' not in data or not data['Password']:
                # Create a mutable copy of the data
                mutable_data = dict(data)
                # Remove the Password field if it exists but is empty
                if 'Password' in mutable_data:
                    del mutable_data['Password']
                # Use the existing form but without validating Password
                form = CompanyForm(mutable_data, instance=company)
                
                # Save without committing to database yet
                if form.is_valid():
                    updated_company = form.save(commit=False)
                    # Keep the original password
                    updated_company.Password = company.Password
                    updated_company.save()
                    
                    return JsonResponse({
                        'success': True,
                        'id': updated_company.id,
                        'Company_name': updated_company.Company_name,
                        'Contact_number': updated_company.Contact_number,
                        'Email': updated_company.Email,
                        'location': updated_company.location,
                        'message': 'Company updated successfully'
                    }, status=200)
                else:
                    print(f"Form validation errors: {form.errors}")
                    return JsonResponse({'errors': form.errors}, status=400)
            else:
                # If Password is provided, use it (this is the normal flow)
                form = CompanyForm(data, instance=company)
                if form.is_valid():
                    updated_company = form.save()
                    return JsonResponse({
                        'success': True,
                        'id': updated_company.id,
                        'Company_name': updated_company.Company_name,
                        'Contact_number': updated_company.Contact_number,
                        'Email': updated_company.Email,
                        'location': updated_company.location,
                        'message': 'Company updated successfully'
                    }, status=200)
                else:
                    print(f"Form validation errors: {form.errors}")
                    return JsonResponse({'errors': form.errors}, status=400)
        except Exception as e:
            print(f"Error updating company: {str(e)}")
            return JsonResponse({'errors': {'server': str(e)}}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)


def delete_company(request, company_id):
    company = get_object_or_404(Company, pk=company_id)
    if request.method == 'POST':
        company.delete()
        return JsonResponse({'message': 'Company deleted successfully'}, status=200)
    return JsonResponse({'error': 'Invalid request method'}, status=405)

# Car views

@csrf_exempt
def car_list(request):
    try:
        # Get query parameters
        user_type = request.GET.get('userType')
        user_id = request.GET.get('userId')
        
        print(f"DEBUG - car_list received: userType={user_type}, userId={user_id}")
        
        # Initialize queryset with all cars (for admin with no filters)
        cars_queryset = Car.objects.all()
        
        # Apply filtering based on user type and ID
        if user_type and user_id:
            if user_type == 'customer':
                # Debug logging
                print(f"Filtering cars for customer ID: {user_id}")
                cars_queryset = Car.objects.filter(customer_id=user_id)
                print(f"Found {cars_queryset.count()} cars")
                
                # Debug: Check if there are any cars with this customer_id
                all_customer_ids = set(Car.objects.values_list('customer_id', flat=True).distinct())
                print(f"Available customer IDs in database: {all_customer_ids}")
                
            elif user_type == 'company':
                # Filter cars by company_id
                cars_queryset = Car.objects.filter(company_id=user_id)
                print(f"Filtering cars for company ID: {user_id}, found {cars_queryset.count()} cars")
                
                # Debug: Check if there are any cars with this company_id
                all_company_ids = set(Car.objects.values_list('company_id', flat=True).distinct())
                print(f"Available company IDs in database: {all_company_ids}")
                
            elif user_type == 'employee' or user_type == 'admin':
                # Get the employee's company and filter cars by that company
                try:
                    employee = Employee.objects.get(id=user_id)
                    if employee.company_id:
                        cars_queryset = Car.objects.filter(company_id=employee.company_id.id)
                        print(f"Filtering cars for employee ID: {user_id}, company ID: {employee.company_id.id}, found {cars_queryset.count()} cars")
                    else:
                        # If employee has no company, return empty list
                        cars_queryset = Car.objects.none()
                        print(f"Employee ID: {user_id} has no company association")
                except Employee.DoesNotExist:
                    return JsonResponse({'error': 'Employee not found'}, status=404)
            else:
                print(f"Unknown user type: {user_type}")
        else:
            print(f"No filtering applied - returning all {cars_queryset.count()} cars")
        
        # Format the data
        car_data = [
            {
                'id': car.id,
                'Model_of_car': car.Model_of_car,
                'TypeOfCar': car.TypeOfCar,
                'Plate_number': car.Plate_number,
                'Release_Year_car': car.Release_Year_car,
                'State_of_car': car.State_of_car,
                'device_id': car.device_id,
                'customer_id': car.customer_id_id,
                'company_id': car.company_id_id,
            }
            for car in cars_queryset
        ]
        
        return JsonResponse(car_data, safe=False)
    except Exception as e:
        print(f"Error retrieving cars: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def create_car(request):
    if request.method == 'POST':
        try:
            # Parse JSON data from request body
            data = json.loads(request.body)
            print(f"Received car data: {data}")  # Debug print
            
            # Handle foreign key fields
            if data.get('company_id'):
                try:
                    company = Company.objects.get(id=data['company_id'])
                    data['company_id'] = company
                except Company.DoesNotExist:
                    return JsonResponse({'errors': {'company_id': 'Invalid company ID'}}, status=400)
                    
            if data.get('customer_id'):
                try:
                    customer = Customer.objects.get(id=data['customer_id'])
                    data['customer_id'] = customer
                except Customer.DoesNotExist:
                    return JsonResponse({'errors': {'customer_id': 'Invalid customer ID'}}, status=400)
                    
            # Create form with JSON data
            form = CarForm(data)
            if form.is_valid():
                car = form.save()
                
                # Create initial DrivingData record for this car
                try:
                    DrivingData.objects.create(
                        car_id=car,
                        speed=0,
                        accident_detection=False,
                        distance=0,
                        harsh_braking_events=0,
                        harsh_acceleration_events=0,
                        swerving_events=0,
                        potential_swerving_events=0,
                        over_speed_events=0,
                        score=100  # Start with perfect score
                    )
                    print(f"Created initial driving data for car ID {car.id}")
                except Exception as e:
                    print(f"Error creating initial driving data: {str(e)}")
                
                return JsonResponse({
                    'success': True, 
                    'id': car.id,
                    'message': 'Car created successfully with initial driving data'
                }, status=201)
            else:
                print(f"Form validation errors: {form.errors}")
                return JsonResponse({'errors': form.errors}, status=400)
        except Exception as e:
            print(f"Error creating car: {str(e)}")
            return JsonResponse({'errors': {'server': str(e)}}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)
@csrf_exempt
def update_car(request, car_id):
    car = get_object_or_404(Car, pk=car_id)
    if request.method == 'POST':
        try:
            # Parse JSON data from request body
            data = json.loads(request.body)
            print(f"Received update data for car {car_id}: {data}")

            # Check if this is a status-only update
            if set(data.keys()).issubset({'State_of_car', 'customer_id'}):
                print("Performing status-only update")
                if 'State_of_car' in data:
                    car.State_of_car = data['State_of_car']
                car.save(update_fields=['State_of_car'])
                
                return JsonResponse({
                    'id': car.id,
                    'model': car.Model_of_car,
                    'type': car.TypeOfCar,
                    'plateNumber': car.Plate_number,
                    'releaseYear': car.Release_Year_car,
                    'state': car.State_of_car,
                    'deviceId': car.device_id,
                    'customerId': car.customer_id_id,
                    'companyId': car.company_id_id
                })

            # For full updates, continue with the normal form validation
            form = CarForm(data, instance=car)
            if form.is_valid():
                updated_car = form.save()
                return JsonResponse({
                    'id': updated_car.id,
                    'model': updated_car.Model_of_car,
                    'type': updated_car.TypeOfCar,
                    'plateNumber': updated_car.Plate_number,
                    'releaseYear': updated_car.Release_Year_car,
                    'state': updated_car.State_of_car,
                    'deviceId': updated_car.device_id,
                    'customerId': updated_car.customer_id_id,
                    'companyId': updated_car.company_id_id
                })
            else:
                print(f"Form validation errors: {form.errors.as_ul()}")
                return JsonResponse({'errors': form.errors}, status=400)

        except Exception as e:
            print(f"Error updating car: {str(e)}")
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)    
@csrf_exempt
def delete_car(request, car_id):
    try:
        car = get_object_or_404(Car, pk=car_id)
        if request.method in ['POST', 'DELETE']:
            car.delete()
            return JsonResponse({
                'success': True,
                'message': 'Car deleted successfully'
            }, status=200)
        return JsonResponse({
            'success': False,
            'error': 'This endpoint only accepts POST or DELETE requests'
        }, status=405)
    except Exception as e:
        print(f"Error deleting car {car_id}: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

# Driver views

from django.http import JsonResponse
from .models import Driver

def driver_list(request):
    try:
        # Get query parameters
        user_type = request.GET.get('userType')
        user_id = request.GET.get('userId')
        
        # Initialize queryset with all drivers (for admin with no filters)
        drivers_queryset = Driver.objects.select_related('car_id').all()
        
        driver_data = [
            {
                'id': driver.id,
                'name': driver.name,
                'gender': driver.gender,
                'phone_number': driver.phone_number,
                'car': {
                    'id': driver.car_id.id,
                    'Model_of_car': driver.car_id.Model_of_car,
                    'Plate_number': driver.car_id.Plate_number,
                } if driver.car_id else None
            }
            for driver in drivers_queryset
        ]
        
        return JsonResponse(driver_data, safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def create_driver(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            print(f"Received driver data: {data}")  # Debug print
            
            # Clean up data if needed
            if 'male' in data:
                del data['male']
            if 'female' in data:
                del data['female']
                
            # Try to get company instance
            try:
                company = Company.objects.get(id=data['company_id'])
                data['company_id'] = company
            except Company.DoesNotExist:
                return JsonResponse({'errors': {'company_id': ['Invalid company ID']}}, status=400)
            
            # Try to get car instance and validate it belongs to the same company
            try:
                car = Car.objects.get(id=data['car_id'])
                data['car_id'] = car
                
                # Check if car belongs to the same company
                if car.company_id and car.company_id.id != company.id:
                    return JsonResponse({
                        'errors': {'car_id': ['This car does not belong to your company']}
                    }, status=400)
                
            except Car.DoesNotExist:
                return JsonResponse({'errors': {'car_id': ['Invalid car ID']}}, status=400)
                
            form = DriverForm(data)
            if form.is_valid():
                driver = form.save()
                return JsonResponse({
                    'success': True, 
                    'id': driver.id,
                    'message': 'Driver created successfully'
                })
            else:
                print(f"Form errors: {form.errors}")
                return JsonResponse({'errors': form.errors}, status=400)
        except Exception as e:
            print(f"Error: {str(e)}")
            return JsonResponse({'errors': {'server': str(e)}}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def update_driver(request, driver_id):
    driver = get_object_or_404(Driver, pk=driver_id)
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            print(f"Received update data for driver {driver_id}: {data}")

            # Check if this is only a car assignment update
            if len(data.keys()) == 1 and 'car_id' in data:
                # Handle null car_id (unassign car)
                if data['car_id'] is None:
                    driver.car_id = None
                    driver.save()
                    return JsonResponse({
                        'success': True,
                        'message': 'Car unassigned successfully'
                    })
                else:
                    try:
                        car = Car.objects.get(pk=data['car_id'])
                        driver.car_id = car
                        driver.save()
                        return JsonResponse({
                            'success': True,
                            'message': 'Car assigned successfully'
                        })
                    except Car.DoesNotExist:
                        return JsonResponse({
                            'error': 'Car not found'
                        }, status=404)

            # For full updates, use the form
            form = DriverForm(data, instance=driver)
            if form.is_valid():
                form.save()
                return JsonResponse({
                    'success': True,
                    'message': 'Driver updated successfully'
                })
            else:
                return JsonResponse({
                    'errors': form.errors
                }, status=400)

        except Exception as e:
            print(f"Error updating driver: {str(e)}")
            return JsonResponse({
                'error': str(e)
            }, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def delete_driver(request, driver_id):
    try:
        driver = get_object_or_404(Driver, pk=driver_id)
        if request.method in ['POST', 'DELETE']:
            driver.delete()
            return JsonResponse({
                'success': True,
                'message': 'Driver deleted successfully'
            }, status=200)
        return JsonResponse({
            'success': False,
            'error': 'This endpoint only accepts POST or DELETE requests'
        }, status=405)
    except Exception as e:
        print(f"Error deleting driver {driver_id}: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

# DrivingData views
def create_driving_data(request):
    if request.method == 'POST':
        # Assuming form processing or other logic for creating driving data
        analysis_results = cache.get('analysis_results')
        if analysis_results:
            DrivingData.objects.create(
                # car_id=car,  # You can add logic to determine car_id later
                distance=analysis_results.get('distance_km', 0.1),
                harsh_braking_events=analysis_results.get('harsh_braking_events', 0),
                harsh_acceleration_events=analysis_results.get('harsh_acceleration_events', 0),
                swerving_events=analysis_results.get('swerving_events', 0),
                potential_swerving_events=analysis_results.get('potential_swerving_events', 0),
                over_speed_events=analysis_results.get('over_speed_events', 0),
                score=analysis_results.get('score', 100)
            )
            print("Data saved to database")

            # Return a success response
            return JsonResponse({'message': 'Driving data created and analysis saved successfully'}, status=201)
        else:
            return JsonResponse({'errors': 'No analysis results available'}, status=400)
    else:
        return JsonResponse({'errors': 'Invalid request method'}, status=400)


def update_driving_data(request, driving_data_id):
    driving_data = get_object_or_404(DrivingData, pk=driving_data_id)
    if request.method == 'POST':
        form = DrivingDataForm(request.POST, instance=driving_data)
        if form.is_valid():
            form.save()
            return JsonResponse({'message': 'Driving data updated successfully'}, status=200)
    else:
        form = DrivingDataForm(instance=driving_data)
    return JsonResponse({'errors': form.errors}, status=400)

def delete_driving_data(request, driving_data_id):
    driving_data = get_object_or_404(DrivingData, pk=driving_data_id)
    if request.method == 'POST':
        driving_data.delete()
        return JsonResponse({'message': 'Driving data deleted successfully'}, status=200)
    return JsonResponse({'error': 'Invalid request method'}, status=405)

def cleanse_buffer_view(request):
    cleansed_buffer = cache.get('cleansed_buffer', [])  # Retrieve cleansed_buffer from cache
    buffer = cache.get('buffer', [])  # Retrieve buffer from cache
    if buffer:
        cleaned_data = cleanse_data(buffer)
        cleansed_buffer.extend(cleaned_data.to_dict('records'))
        cache.set('cleansed_buffer', cleansed_buffer, timeout=None)
        cache.set('buffer', [], timeout=None)
        return HttpResponse("Buffer cleansed successfully. Check console for details.")
    else:
        return HttpResponse("Buffer is empty. No data to cleanse.")

def get_cleansed_data(request):
    cleansed_buffer = cache.get('cleansed_buffer', [])  # Retrieve cleansed_buffer from cache
    return JsonResponse(cleansed_buffer, safe=False)

def get_analysis_results(request):
    analysis_results = cache.get('analysis_results', {})
    return JsonResponse(analysis_results, safe=False)
    return JsonResponse(cleansed_buffer, safe=False)
#---------------------------------------------------------------------------------------

# Employee views
def employee_list(request):
    employees = Employee.objects.all()
    employee_data = [
        {
            'id': employee.id,
            'name': employee.Name,
            'gender': employee.gender,
            'phone_number': employee.phone_number,
            'address': employee.address,
            'Email': employee.Email,
            'Password': employee.Password,
            'company_id': employee.company_id_id if hasattr(employee, 'company_id') else None
        }
        for employee in employees
    ]
    return JsonResponse(employee_data, safe=False)

@csrf_exempt
def create_employee(request):
    if request.method == 'POST':
        try:
            # Parse JSON data from request body
            data = json.loads(request.body)
            print(f"Received employee data: {data}")  # Debug print
            
            # Process gender field if needed
            if 'gender' in data:
                # Make sure gender is lowercase
                data['gender'] = data['gender'].lower()
                
            # Process company_id if provided
            if 'company_id' in data and data['company_id']:
                try:
                    company_id = int(data['company_id'])
                    company = Company.objects.get(id=company_id)
                    # Remove company_id from form data to handle separately
                    data.pop('company_id')
                    
                    # Create form with JSON data
                    form = EmployeeForm(data)
                    if form.is_valid():
                        employee = form.save()
                        # Set company_id after saving
                        employee.company_id = company
                        employee.save()
                        
                        return JsonResponse({
                            'success': True, 
                            'id': employee.id,
                            'message': 'Employee created successfully',
                            'company_id': employee.company_id_id
                        }, status=201)
                except (ValueError, Company.DoesNotExist) as e:
                    return JsonResponse({'errors': {'company_id': 'Invalid company ID'}}, status=400)
            else:
                # No company_id provided, normal flow
                form = EmployeeForm(data)
                if form.is_valid():
                    employee = form.save()
                    return JsonResponse({
                        'success': True, 
                        'id': employee.id,
                        'message': 'Employee created successfully',
                        'company_id': None
                    }, status=201)
                    
            if not form.is_valid():
                print(f"Form validation errors: {form.errors}")
                return JsonResponse({'errors': form.errors}, status=400)
                
        except Exception as e:
            print(f"Error creating employee: {str(e)}")
            return JsonResponse({'errors': {'server': str(e)}}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def update_employee(request, employee_id):
    employee = get_object_or_404(Employee, pk=employee_id)
    if request.method == 'POST':
        try:
            # Parse JSON data from request body
            data = json.loads(request.body)
            print(f"Received update data for employee {employee_id}: {data}")  # Debug print
            
            # Handle empty password case - don't update password if not provided
            if 'Password' in data and not data['Password']:
                # If password is empty, remove it from the data to avoid updating with empty password
                data.pop('Password')
            
            # If gender is provided, ensure lowercase
            if 'gender' in data:
                data['gender'] = data['gender'].lower()
                
            # Handle company_id if provided
            if 'company_id' in data:
                if data['company_id']:
                    try:
                        company_id = int(data['company_id'])
                        company = Company.objects.get(id=company_id)
                        # Remove from data to handle separately
                        data.pop('company_id')
                        
                        # Update with form
                        form = EmployeeForm(data, instance=employee)
                        if form.is_valid():
                            updated_employee = form.save()
                            # Set company_id after saving
                            updated_employee.company_id = company
                            updated_employee.save()
                            
                            return JsonResponse({
                                'success': True,
                                'id': updated_employee.id,
                                'message': 'Employee updated successfully',
                                'company_id': updated_employee.company_id_id
                            }, status=200)
                    except (ValueError, Company.DoesNotExist) as e:
                        return JsonResponse({'errors': {'company_id': 'Invalid company ID'}}, status=400)
                else:
                    # Remove company association
                    data.pop('company_id')
                    form = EmployeeForm(data, instance=employee)
                    if form.is_valid():
                        updated_employee = form.save()
                        updated_employee.company_id = None
                        updated_employee.save()
                        
                        return JsonResponse({
                            'success': True,
                            'id': updated_employee.id,
                            'message': 'Employee updated successfully',
                            'company_id': None
                        }, status=200)
            else:
                # No company_id change, normal update
                form = EmployeeForm(data, instance=employee)
                if form.is_valid():
                    updated_employee = form.save()
                    return JsonResponse({
                        'success': True,
                        'id': updated_employee.id,
                        'message': 'Employee updated successfully',
                        'company_id': updated_employee.company_id_id if hasattr(updated_employee, 'company_id') else None
                    }, status=200)
            
            if not form.is_valid():
                print(f"Form validation errors: {form.errors}")
                return JsonResponse({'errors': form.errors}, status=400)
                
        except Exception as e:
            print(f"Error updating employee: {str(e)}")
            return JsonResponse({'errors': {'server': str(e)}}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def delete_employee(request, employee_id):
    try:
        employee = get_object_or_404(Employee, pk=employee_id)
        if request.method in ['POST', 'DELETE']:
            employee.delete()
            return JsonResponse({
                'success': True,
                'message': 'Employee deleted successfully'
            }, status=200)
        return JsonResponse({
            'success': False,
            'error': 'This endpoint only accepts POST or DELETE requests'
        }, status=405)
    except Exception as e:
        print(f"Error deleting employee {employee_id}: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)}
        , status=500)
@csrf_exempt
def get_car_driving_data(request, car_id):
    try:
        # Get the car
        car = get_object_or_404(Car, pk=car_id)
        
        # Check if this request is to mark notifications as read
        mark_read = request.GET.get('mark_read') == 'true'
        
        # Get the most recent driving data for this car
        latest_driving_data = DrivingData.objects.filter(car_id=car_id).order_by('-created_at').first()
        
        # Mark as read if requested
        if mark_read and latest_driving_data and not latest_driving_data.read_by:
            latest_driving_data.read_by = True
            latest_driving_data.save(update_fields=['read_by'])
            print(f"Marked notifications as read for car_id: {car_id}")
        
        # Get historical data for trends (last 10 records)
        historical_data = DrivingData.objects.filter(car_id=car_id).order_by('-created_at')[:10]
        
        if latest_driving_data:
            # Calculate statistics from historical data
            total_distance = sum(data.distance for data in historical_data)
            avg_score = sum(data.score for data in historical_data) / len(historical_data) if historical_data else 100
            
            # Calculate total events from all historical data
            total_harsh_braking = sum(data.harsh_braking_events for data in historical_data)
            total_harsh_acceleration = sum(data.harsh_acceleration_events for data in historical_data)
            total_swerving = sum(data.swerving_events for data in historical_data)
            total_potential_swerving = sum(data.potential_swerving_events for data in historical_data)
            total_over_speed = sum(data.over_speed_events for data in historical_data)
            
            data = {
                'car_id': car_id,
                'model': car.Model_of_car,
                'plate_number': car.Plate_number,
                'device_id': car.device_id,
                'state': car.State_of_car,
                'current': {
                    'distance': latest_driving_data.distance,
                    'harsh_braking_events': latest_driving_data.harsh_braking_events,
                    'harsh_acceleration_events': latest_driving_data.harsh_acceleration_events,
                    'swerving_events': latest_driving_data.swerving_events,
                    'potential_swerving_events': latest_driving_data.potential_swerving_events,
                    'over_speed_events': latest_driving_data.over_speed_events,
                    'score': latest_driving_data.score,
                    'speed': latest_driving_data.speed,
                    'read_by': latest_driving_data.read_by,  # Include read_by flag in response
                    'created_at': latest_driving_data.created_at.isoformat() if hasattr(latest_driving_data, 'created_at') else None
                },
                'summary': {
                    'total_distance': total_distance,
                    'avg_score': avg_score,
                    'total_records': len(historical_data),
                    'total_harsh_braking': total_harsh_braking,
                    'total_harsh_acceleration': total_harsh_acceleration,
                    'total_swerving': total_swerving,
                    'total_potential_swerving': total_potential_swerving,
                    'total_over_speed': total_over_speed
                }
            }
            return JsonResponse(data)
        else:
            # Return default data when no driving data is found
            return JsonResponse({
                'car_id': car_id,
                'model': car.Model_of_car,
                'plate_number': car.Plate_number,
                'device_id': car.device_id,
                'state': car.State_of_car,
                'current': {
                    'distance': 0,
                    'harsh_braking_events': 0,
                    'harsh_acceleration_events': 0,
                    'swerving_events': 0,
                    'potential_swerving_events': 0,
                    'over_speed_events': 0,
                    'score': 100,
                    'speed': 0,
                    'read_by': False  # Default read_by value
                },
                'summary': {
                    'total_distance': 0,
                    'avg_score': 100,
                    'total_records': 0
                }
            })
    except Exception as e:
        print(f"Error in get_car_driving_data: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)
        # In api/views.py

@csrf_exempt
def company_login(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('Email')
            password = data.get('Password')
            
            print(f"Company/Employee login attempt for email: {email}")  # Debug print
            
            # First check if this is an admin/employee
            try:
                employee = Employee.objects.get(Email=email)
                print(f"Employee found: {employee.Name} (ID: {employee.id})")  # Debug print
                print(f"Employee's company ID: {employee.company_id_id}")  # Added debug print for company ID
                
                # Check password
                if check_password(password, employee.Password) or password == employee.Password:
                    is_admin = employee.Admin
                    role = "admin" if is_admin else "employee"
                    
                    token = f"{employee.id}_{int(time.time())}"
                    return JsonResponse({
                        'success': True,
                        'token': token,
                        'id': employee.id,
                        'name': employee.Name,
                        'role': role,
                        'userType': role,
                        'userId': employee.id,
                        'Admin': is_admin,
                        'company_id': employee.company_id_id if hasattr(employee, 'company_id') else None
                    }, status=200)
            except Employee.DoesNotExist:
                try:
                    company = Company.objects.get(Email=email)
                    print(f"Company found: {company.Company_name} (ID: {company.id})")  # Debug print
                    print(f"Company ID that will be used for updates: {company.id}")  # Added explicit company ID debug print
                    
                    if check_password(password, company.Password) or password == company.Password:
                        print(f"Company login successful")  # Debug print
                        token = f"{company.id}_{int(time.time())}"
                        return JsonResponse({
                            'success': True,
                            'token': token,
                            'id': company.id,
                            'Company_name': company.Company_name,
                            'role': 'admin',  # <-- Set role as admin
                            'userType': 'admin',  # <-- Set userType as admin
                            'userId': company.id
                        }, status=200)
                except Company.DoesNotExist:
                    print(f"No company or employee found with email: {email}")  # Debug print
                    return JsonResponse({'error': 'Invalid credentials'}, status=401)
            
            return JsonResponse({'error': 'Invalid credentials'}, status=401)
            
        except Exception as e:
            print(f"Error in company_login: {str(e)}")  # Debug print
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def customer_login(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('Email')
            password = data.get('Password')
            
            print(f"Customer login attempt for email: {email}")
            
            try:
                customer = Customer.objects.get(Email=email)
                print(f"Customer found: {customer.Name} (ID: {customer.id})")
                
                # Add more detailed debugging info about password
                print(f"Provided password: {password}")
                print(f"Full stored password hash: {customer.Password}")
                print(f"Password hash components:")
                
                # Check if the password appears to be a Django hash
                if customer.Password.startswith('pbkdf2_sha'):
                    parts = customer.Password.split('$')
                    if len(parts) >= 4:
                        print(f"  Algorithm: {parts[0]}")
                        print(f"  Iterations: {parts[1]}")
                        print(f"  Salt: {parts[2]}")
                        print(f"  Hash: {parts[3][:10]}...")
                    
                    # Test with raw check_password
                    print(f"check_password result: {check_password(password, customer.Password)}")
                else:
                    print("Password doesn't appear to be in Django's hashed format")
                    print(f"Direct comparison result: {password == customer.Password}")
                
                # Use the same login logic as in company_login
                if check_password(password, customer.Password) or password == customer.Password:
                    token = f"{customer.id}_{int(time.time())}"
                    return JsonResponse({
                        'success': True,
                        'token': token,
                        'id': customer.id,
                        'Name': customer.Name,
                        'role': 'customer',
                        'userType': 'customer',
                        'userId': customer.id
                    }, status=200)
                else:
                    print(f"Invalid password for customer: {customer.Name}")
                    return JsonResponse({'error': 'Invalid credentials'}, status=401)
            except Customer.DoesNotExist:
                print(f"No customer found with email: {email}")
                return JsonResponse({'error': 'Invalid email or password'}, status=401)
        except Exception as e:
            print(f"Exception in customer_login: {str(e)}")
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)
@csrf_exempt
def reset_password(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            
            if not email:
                return JsonResponse({'error': 'Email is required'}, status=400)
                
            print(f"Processing password reset for email: {email}")
            
            # Find user by email (checking all user types)
            user = None
            user_type = None
            
            try:
                user = Customer.objects.get(Email=email)
                user_type = 'customer'
            except Customer.DoesNotExist:
                try:
                    user = Company.objects.get(Email=email)
                    user_type = 'company'
                except Company.DoesNotExist:
                    try:
                        user = Employee.objects.get(Email=email)
                        user_type = 'employee'
                    except Employee.DoesNotExist:
                        return JsonResponse({'error': 'No account found with that email'}, status=404)
            
            # Generate reset token and store it
            reset_token = str(uuid.uuid4())
            reset_token_expires = timezone.now() + timedelta(hours=24)
            
            # Update user with reset token
            if user_type == 'customer':
                user.reset_token = reset_token
                user.reset_token_expires = reset_token_expires
            elif user_type == 'company':
                user.reset_token = reset_token
                user.reset_token_expires = reset_token_expires
            elif user_type == 'employee':
                user.reset_token = reset_token
                user.reset_token_expires = reset_token_expires
                
            user.save()
            
            # Create reset URL for frontend
            reset_url = f"{settings.FRONTEND_URL}/auth/reset-password/confirm?token={reset_token}&email={email}&userType={user_type}"
            
            try:
                
                
                # Prepare context for the template
                context = {
                    'reset_url': reset_url,
                    'date_time': timezone.now().strftime("%Y-%m-%d %H:%M:%S"),
                    'user_type': user_type
                }
                
                # Render the HTML email content using the template
                html_content = render_to_string('emails.html', context)
                
                # Create plain text version
                plain_text = f"""
                Password Reset Request
                
                Hello,
                
                We received a request to reset the password for your account. If you didn't make this request, you can safely ignore this email.
                
                To reset your password, click this link: {reset_url}
                
                This password reset link will expire in 24 hours.
                
                Driving Behavior Analysis System
                """
                
                # Send email
                subject = "Password Reset Request"
                from_email = settings.DEFAULT_FROM_EMAIL
                to_email = [email]
                
                from django.core.mail import EmailMultiAlternatives
                msg = EmailMultiAlternatives(subject, plain_text, from_email, to_email)
                msg.attach_alternative(html_content, "text/html")
                msg.send()
                
                print(f"Password reset email sent to {email}")
                return JsonResponse({
                    'success': True,
                    'message': 'Password reset instructions sent to your email',
                    'dev_token': reset_token if settings.DEBUG else None  # For development testing
                })
                
            except Exception as email_error:
                print(f"Warning: Could not send email: {str(email_error)}")
                # For development, return success anyway with the token for testing
                return JsonResponse({
                    'success': True,
                    'message': 'Password reset link generated (email sending failed)',
                    'reset_url': reset_url,  # Only include in development
                    'token': reset_token      # Only include in development
                })
                
        except Exception as e:
            print(f"Error in reset_password: {str(e)}")
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)
@csrf_exempt
def update_password(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            token = data.get('token')
            new_password = data.get('new_password')
            user_type_from_request = data.get('userType', '(not provided)')
            
            if not all([email, token, new_password]):
                return JsonResponse({'error': 'Missing required fields'}, status=400)
            
            print(f"=== PASSWORD RESET DEBUG ===")
            print(f"Email: {email}")
            print(f"New password (plaintext): {new_password}")
            print(f"Token: {token[:10]}...")
            print(f"Requested user type: {user_type_from_request}")
            
            # Find user by email and token
            user = None
            user_type = None
            
            # Try to find the user - prioritize the user type if provided
            if user_type_from_request:
                if user_type_from_request == 'customer':
                    try:
                        user = Customer.objects.get(Email=email, reset_token=token)
                        user_type = 'customer'
                        print(f"Found customer account (ID: {user.id}) with matching token")
                    except Customer.DoesNotExist:
                        print(f"No customer found with email {email} and token")
                elif user_type_from_request == 'company':
                    try:
                        user = Company.objects.get(Email=email, reset_token=token)
                        user_type = 'company'
                        print(f"Found company account (ID: {user.id}) with matching token")
                    except Company.DoesNotExist:
                        print(f"No company found with email {email} and token")
                elif user_type_from_request == 'employee':
                    try:
                        user = Employee.objects.get(Email=email, reset_token=token)
                        user_type = 'employee'
                        print(f"Found employee account (ID: {user.id}) with matching token")
                    except Employee.DoesNotExist:
                        print(f"No employee found with email {email} and token")
            
            # If no specific user type or not found with that type, try all
            if not user:
                print("Falling back to checking all account types...")
                try:
                    user = Customer.objects.get(Email=email, reset_token=token)
                    user_type = 'customer'
                    print(f"Found customer account (ID: {user.id}) with matching token")
                except Customer.DoesNotExist:
                    try:
                        user = Company.objects.get(Email=email, reset_token=token)
                        user_type = 'company'
                        print(f"Found company account (ID: {user.id}) with matching token")
                    except Company.DoesNotExist:
                        try:
                            user = Employee.objects.get(Email=email, reset_token=token)
                            user_type = 'employee'
                            print(f"Found employee account (ID: {user.id}) with matching token")
                        except Employee.DoesNotExist:
                            return JsonResponse({'error': 'Invalid or expired reset token'}, status=400)
            
            # Check if token is expired
            if hasattr(user, 'reset_token_expires') and user.reset_token_expires and user.reset_token_expires < timezone.now():
                return JsonResponse({'error': 'Reset token has expired'}, status=400)
            
            # Get current password
            current_password_hash = user.Password
            print(f"Current password hash: {current_password_hash[:20]}...")
            
            # Look for existing plain text password
            try:
                # This is extremely insecure and for debugging only
                found_users = []
                for test_pass in ["password", "123456", "admin", "Abdullah", "password123", "secret", "qwerty"]:
                    if check_password(test_pass, current_password_hash):
                        print(f"FOUND OLD PASSWORD: '{test_pass}'")
                        found_users.append(test_pass)
                
                if not found_users:
                    print("Could not determine old password in plaintext")
            except Exception as e:
                print(f"Error during password check: {str(e)}")
            
            # Check if new password is the same as old password
            if check_password(new_password, current_password_hash) or new_password == getattr(user, 'Password', None):
                return JsonResponse({
                    'error': 'New password cannot be the same as your current password. Please choose a different password.'
                }, status=400)
                
            # Create new hashed password
            hashed_password = make_password(new_password)
            print(f"New password hash: {hashed_password[:20]}...")
            print(f"New plaintext password: {new_password}")
            
            # Update password using just one approach - filter().update()
            if user_type == 'customer':
                Customer.objects.filter(id=user.id).update(
                    Password=hashed_password,
                    reset_token=None,
                    reset_token_expires=None
                )
                print(f"Updated password for customer ID {user.id}")
            elif user_type == 'company':
                Company.objects.filter(id=user.id).update(
                    Password=hashed_password,
                    reset_token=None,
                    reset_token_expires=None
                )
                print(f"Updated password for company ID {user.id}")
            elif user_type == 'employee':
                Employee.objects.filter(id=user.id).update(
                    Password=hashed_password,
                    reset_token=None,
                    reset_token_expires=None
                )
                print(f"Updated password for employee ID {user.id}")
            
            # Verify the change
            updated_user = None
            if user_type == 'customer':
                updated_user = Customer.objects.get(id=user.id)
            elif user_type == 'company':
                updated_user = Company.objects.get(id=user.id)
            elif user_type == 'employee':
                updated_user = Employee.objects.get(id=user.id)
                
            print(f"After update - New password hash: {updated_user.Password[:20]}...")
            print(f"Testing if new password works: {check_password(new_password, updated_user.Password)}")
            print(f"=== END DEBUG ===")
            
            print(f"Password updated successfully for {email} ({user_type} account)")
            
            return JsonResponse({
                'success': True,
                'message': 'Password updated successfully',
                'user_type': user_type,
                'account_id': user.id
            })
            
        except Exception as e:
            print(f"Error in update_password: {str(e)}")
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def geofence_list(request):
    """Get geofences based on user type and ID"""
    if request.method == 'GET':
        try:
            user_type = request.GET.get('userType')
            user_id = request.GET.get('userId')

            if not user_type or not user_id:
                return JsonResponse({'error': 'userType and userId are required'}, status=400)

            # For admin users, show all geofences or company-specific geofences if admin is linked to a company
            if user_type == 'admin':
                try:
                    # Check if this admin is associated with a company
                    employee = Employee.objects.get(id=user_id)
                    if employee.company_id:
                        # If admin is linked to a company, show that company's geofences
                        geofences = Geofence.objects.filter(company_id=employee.company_id.id)
                        print(f"Admin is linked to company ID {employee.company_id.id}, showing company geofences")
                    else:
                        # If admin is not linked to any company, show all geofences
                        geofences = Geofence.objects.all()
                        print("Admin is not linked to any company, showing all geofences")
                except Employee.DoesNotExist:
                    return JsonResponse({'error': 'Admin user not found'}, status=404)
            elif user_type == 'customer':
                geofences = Geofence.objects.filter(customer_id=user_id)
            elif user_type == 'company':
                geofences = Geofence.objects.filter(company_id=user_id)
            else:
                return JsonResponse({'error': 'Invalid user type'}, status=400)

            data = []
            for geofence in geofences:
                geofence_data = {
                    'id': geofence.id,
                    'name': geofence.name,
                    'description': geofence.description,
                    'type': geofence.type,
                    'coordinates': geofence.get_coordinates(),
                    'radius': geofence.radius,
                    'color': geofence.color,
                    'active': geofence.active,
                    'createdAt': geofence.created_at.isoformat(),
                    'customer_id': geofence.customer_id_id,
                    'company_id': geofence.company_id_id
                }
                data.append(geofence_data)
            
            return JsonResponse(data, safe=False)
            
        except Exception as e:
            print(f"Error in geofence_list: {str(e)}")
            import traceback
            traceback.print_exc()
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def update_geofence(request, geofence_id):
    """Update a specific geofence"""
    if request.method != 'PUT' and request.method != 'PATCH' and request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
        
    try:
        geofence = Geofence.objects.get(id=geofence_id)
    except Geofence.DoesNotExist:
        return JsonResponse({'error': 'Geofence not found'}, status=404)
        
    try:
        data = json.loads(request.body)
        user_type = data.pop('userType', None)
        user_id = data.pop('userId', None)

        # Convert user_id to integer for consistent comparison
        try:
            user_id = int(user_id)
        except (ValueError, TypeError):
            return JsonResponse({'error': 'Invalid userId format'}, status=400)

        print(f"Updating geofence {geofence_id} - User type: {user_type}, User ID: {user_id}")
        print(f"Geofence belongs to customer_id: {geofence.customer_id_id}, company_id: {geofence.company_id_id}")

        # Check ownership
        if user_type == 'customer' and geofence.customer_id_id != user_id:
            return JsonResponse({'error': 'Permission denied - customer mismatch'}, status=403)
        elif user_type == 'company' and geofence.company_id_id != user_id:
            return JsonResponse({'error': 'Permission denied - company mismatch'}, status=403)
        # Add this after the other ownership checks
        elif user_type == 'admin':
            # Admins can manage all geofences, or only company geofences if linked to a company
            try:
                employee = Employee.objects.get(id=user_id)
                if employee.company_id and geofence.company_id_id != employee.company_id.id:
                    return JsonResponse({'error': 'Permission denied - admin can only manage their company geofences'}, status=403)
            except Employee.DoesNotExist:
                return JsonResponse({'error': 'Admin user not found'}, status=404)
        
        # Handle partial update for just 'active' field
        if 'active' in data and len(data.keys()) == 1:
            print(f"Updating active status to: {data['active']}")
            geofence.active = data['active']
            geofence.save()
            
            return JsonResponse({
                'id': geofence.id,
                'name': geofence.name,
                'description': geofence.description,
                'type': geofence.type,
                'coordinates': geofence.get_coordinates(),
                'radius': geofence.radius,
                'color': geofence.color,
                'active': geofence.active,
                'createdAt': geofence.created_at.isoformat(),
                'customer_id': geofence.customer_id_id,
                'company_id': geofence.company_id_id
            })
        
        # Handle full update - directly update object like in create function
        print(f"Performing full update with data: {data}")
        
        # Extract coordinates
        coordinates = data.pop('coordinates', None)
        if coordinates:
            geofence.coordinates_json = json.dumps(coordinates)
        
        # Update other fields directly
        if 'name' in data:
            geofence.name = data['name']
        if 'description' in data:
            geofence.description = data['description']
        if 'type' in data:
            geofence.type = data['type']
        if 'radius' in data and data['type'] == 'circle':
            geofence.radius = float(data['radius'])
        if 'color' in data:
            geofence.color = data['color']
        
        # Save the updated geofence
        geofence.save()
        
        response_data = {
            'id': geofence.id,
            'name': geofence.name,
            'description': geofence.description,
            'type': geofence.type,
            'coordinates': geofence.get_coordinates(),
            'radius': geofence.radius,
            'color': geofence.color,
            'active': geofence.active,
            'createdAt': geofence.created_at.isoformat(),
            'customer_id': geofence.customer_id_id,
            'company_id': geofence.company_id_id
        }
        
        return JsonResponse(response_data)
            
    except Exception as e:
        print(f"Error updating geofence {geofence_id}: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def delete_geofence(request, geofence_id):
    """Delete a specific geofence"""
    if request.method != 'DELETE':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
        
    try:
        geofence = Geofence.objects.get(pk=geofence_id)
        user_type = request.GET.get('userType')
        user_id = request.GET.get('userId')

        # Check ownership
        if user_type == 'customer' and geofence.customer_id_id != int(user_id):
            return JsonResponse({'error': 'Permission denied'}, status=403)
        elif user_type == 'company' and geofence.company_id_id != int(user_id):
            return JsonResponse({'error': 'Permission denied'}, status=403)
        # Add this after the other ownership checks
        elif user_type == 'admin':
    # Admins can manage all geofences, or only company geofences if linked to a company
            try:
                employee = Employee.objects.get(id=user_id)
                if employee.company_id and geofence.company_id_id != employee.company_id.id:
                    return JsonResponse({'error': 'Permission denied - admin can only manage their company geofences'}, status=403)
            except Employee.DoesNotExist:
                return JsonResponse({'error': 'Admin user not found'}, status=404)
        
        geofence.delete()
        return JsonResponse({'message': 'Geofence deleted successfully'})
    except Geofence.DoesNotExist:
        return JsonResponse({'error': 'Geofence not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def create_geofence(request):
    """Create a new geofence"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
        
    try:
        data = json.loads(request.body)
        user_type = data.pop('userType', None)
        user_id = data.pop('userId', None)

        if not user_type or not user_id:
            return JsonResponse({'error': 'userType and userId are required'}, status=400)

        # Convert userId to integer
        try:
            user_id = int(user_id)
        except ValueError:
            return JsonResponse({'error': 'Invalid userId format'}, status=400)

        # Extract coordinates and convert to JSON string
        coordinates = data.pop('coordinates', None)
        coordinates_json = None
        if coordinates:
            coordinates_json = json.dumps(coordinates)
        
        # Validate the data
        name = data.get('name')
        description = data.get('description', '')
        geofence_type = data.get('type')
        radius = data.get('radius')
        color = data.get('color', '#ff4444')
        
        if not name or not geofence_type or not coordinates_json:
            return JsonResponse({'error': 'Name, type and coordinates are required'}, status=400)
            
        # Set the customer or company
        customer_id = None
        company_id = None
        
        if user_type == 'customer':
            try:
                customer = Customer.objects.get(id=user_id)
                customer_id = customer
            except Customer.DoesNotExist:
                return JsonResponse({'error': 'Customer not found'}, status=404)
        elif user_type == 'company' or user_type == 'employee':
            try:
                company = Company.objects.get(id=user_id)
                print(f"Found company: {company.id} - {company.Company_name}")
                company_id = company
            except Company.DoesNotExist:
                print(f"❌ Company with ID {user_id} not found in database!")
                return JsonResponse({'error': f'Company with ID {user_id} not found'}, status=404)
        elif user_type == 'admin':
            try:
                # If admin creates a geofence, check if they're associated with a company
                employee = Employee.objects.get(id=user_id)
                if employee.company_id:
                    company_id = employee.company_id
                else:
                    # If admin isn't linked to a company, create the geofence without company association
                    # or return an error if you want to enforce company association
                    return JsonResponse({'error': 'Admin must be associated with a company to create geofences'}, status=400)
            except Employee.DoesNotExist:
                return JsonResponse({'error': 'Admin user not found'}, status=404)
        else:
            return JsonResponse({'error': 'Invalid user type'}, status=400)
        
        # Create the geofence directly without using the form
        geofence = Geofence(
            name=name,
            description=description,
            type=geofence_type,
            coordinates_json=coordinates_json,
            radius=float(radius) if radius and geofence_type == 'circle' else None,
            color=color,
            active=True,
            customer_id=customer_id,
            company_id=company_id
        )
        
        # Save the geofence
        geofence.save()
        
        # Return the created geofence data
        response_data = {
            'id': geofence.id,
            'name': geofence.name,
            'description': geofence.description,
            'type': geofence.type,
            'coordinates': geofence.get_coordinates(),
            'radius': geofence.radius,
            'color': geofence.color,
            'active': geofence.active,
            'createdAt': geofence.created_at.isoformat(),
            'customer_id': geofence.customer_id_id if geofence.customer_id else None,
            'company_id': geofence.company_id_id if geofence.company_id else None
        }
        
        return JsonResponse(response_data, status=201)
            
    except Exception as e:
        print(f"Error creating geofence: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def get_car_location(request, car_id=None):
    """
    Get location data for a specific car or all cars.
    If car_id is provided, return data for that specific car.
    Otherwise, return location data for all cars.
    """
    try:
        # Get all cars with their device IDs
        cars = list(Car.objects.all().values('id', 'device_id', 'Model_of_car', 'Plate_number'))
        
        if car_id:
            # Get the device_id for the requested car
            car = next((c for c in cars if c['id'] == car_id), None)
            if not car:
                return JsonResponse({'error': f'Car with id {car_id} not found'}, status=404)
            
            device_id = car['device_id']
            print(f"Looking for car with device_id: {device_id}")
            
            # Try to get location from the file first
            location_file = os.path.join(LOCATION_DIR, f'location_{device_id}.json')
            latest_location = None
            
            if os.path.exists(location_file):
                try:
                    with open(location_file, 'r') as f:
                        latest_location = json.load(f)
                    print(f"Loaded location from file for device: {device_id}")
                except Exception as e:
                    print(f"Error reading location file: {e}")
            
            # If file read failed, try from cache as backup
            if not latest_location:
                # Try to get from device-specific cache key
                latest_location = cache.get(f'latest_location_{device_id}')
                print(f"Cache location data: {latest_location}")
            
            # Return the location data if found
            if latest_location:
                return JsonResponse({
                    'latitude': latest_location['latitude'],
                    'longitude': latest_location['longitude'],
                    'speed': latest_location.get('speed', 0),
                    'device_id': device_id,
                    'model': car['Model_of_car'],
                    'plate': car['Plate_number']
                })
            else:
                # No location data for this car yet
                return JsonResponse({
                    'latitude': 21.4858,  # Default to Jeddah coordinates if no data
                    'longitude': 39.1925,
                    'speed': 0,
                    'device_id': device_id,
                    'model': car['Model_of_car'],
                    'plate': car['Plate_number']
                })
        else:
            # Return all cars with their locations or default coordinates
            car_locations = []
            
            # For each car, check if we have location data matching its device_id
            for car in cars:
                device_id = car['device_id']
                location_data = None
                
                # Try file first
                location_file = os.path.join(LOCATION_DIR, f'location_{device_id}.json')
                if os.path.exists(location_file):
                    try:
                        with open(location_file, 'r') as f:
                            location_data = json.load(f)
                    except Exception as e:
                        print(f"Error reading location file for device {device_id}: {e}")
                
                # Try cache as backup
                if not location_data:
                    location_data = cache.get(f'latest_location_{device_id}')
                
                if location_data:
                    car_locations.append({
                        'id': car['id'],
                        'latitude': location_data['latitude'],
                        'longitude': location_data['longitude'],
                        'speed': location_data.get('speed', 0),
                        'device_id': device_id,
                        'model': car['Model_of_car'],
                        'plate': car['Plate_number']
                    })
                else:
                    car_locations.append({
                        'id': car['id'],
                        'latitude': 21.4858,  # Default to Jeddah coordinates if no data
                        'longitude': 39.1925,
                        'speed': 0,
                        'device_id': device_id,
                        'model': car['Model_of_car'],
                        'plate': car['Plate_number']
                    })
            
            response = JsonResponse(car_locations, safe=False)
            # Add CORS headers
            response["Access-Control-Allow-Origin"] = "http://https://driving-analysis.netlify.app/"
            response["Access-Control-Allow-Methods"] = "GET, OPTIONS"
            response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
            return response
            
    except Exception as e:
        print(f"Error in get_car_location: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def get_company(request, company_id):
    """Get details for a specific company"""
    try:
        company = get_object_or_404(Company, pk=company_id)
        
        # Return company details
        data = {
            'id': company.id,
            'Company_name': company.Company_name,
            'Contact_number': company.Contact_number,
            'Email': company.Email,
            'location': company.location,
            # Don't include Password for security reasons
        }
        
        return JsonResponse(data, status=200)
    except Exception as e:
        print(f"Error retrieving company data: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)
@csrf_exempt
def company_list(request):
    try:
        # Get query parameters
        user_type = request.GET.get('userType')
        user_id = request.GET.get('userId')
        
        # Default to all companies
        companies = Company.objects.all()
        
        # Filter based on user type if needed
        if user_type == 'employee' and user_id:
            try:
                employee = Employee.objects.get(id=user_id)
                if employee.company_id:
                    companies = Company.objects.filter(id=employee.company_id.id)
            except Employee.DoesNotExist:
                pass
        
        company_data = [
            {
                'id': company.id,
                'Name': company.Company_name,  # Changed from company.Name to company.Company_name
                # Add other fields as needed
            }
            for company in companies
        ]
        
        return JsonResponse(company_data, safe=False)
    except Exception as e:
        print(f"Error retrieving companies: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def get_customer(request, customer_id):
    if request.method == 'GET':
        try:
            customer = get_object_or_404(Customer, pk=customer_id)
            
            # Return customer details
            data = {
                'id': customer.id,
                'Name': customer.Name,
                'Email': customer.Email,
                'phone_number': customer.phone_number,
                'gender': customer.gender,
                'address': customer.address,
                # Don't include Password for security reasons
            }
            
            return JsonResponse(data, status=200)
        except Exception as e:
            print(f"Error retrieving customer data: {str(e)}")
            return JsonResponse({'error': str(e)}, status=500)
@csrf_exempt
def get_fleet_overview(request):
    """
    Returns aggregated statistics for all cars in the system
    for the dashboard overview page with time filtering
    """
    try:
        # Get time frame parameter
        time_frame = request.GET.get('time_frame', '1d')
        
        # Get company_id filter if available
        company_id = request.GET.get('company_id')
        
        # Determine date range based on time frame
        now = timezone.now()
        if time_frame == '1d':
            start_date = now - timedelta(days=1)
        elif time_frame == '7d':
            start_date = now - timedelta(days=7)
        elif time_frame == '30d':
            start_date = now - timedelta(days=30)
        else:
            start_date = now - timedelta(days=1)  # Default to 1 day
        
        # Get cars filtered by company if specified
        cars_queryset = Car.objects.all()
        if company_id:
            cars_queryset = cars_queryset.filter(company_id=company_id)
        
        total_cars = cars_queryset.count()
        active_cars = cars_queryset.filter(State_of_car='online').count()
        inactive_cars = cars_queryset.filter(State_of_car='offline').count()
        maintenance_cars = 0  # Default to 0 as we don't track maintenance separately yet
        
        # Get the latest driving data records for analysis with time filter
        car_ids = cars_queryset.values_list('id', flat=True)
        latest_data = DrivingData.objects.filter(
            car_id__in=car_ids,
            created_at__gte=start_date
        ).order_by('-created_at')
        
        # Calculate aggregate statistics - initialize with defaults
        total_distance = 0
        avg_score = 0
        total_harsh_braking = 0
        total_harsh_acceleration = 0
        total_swerving = 0
        total_over_speed = 0
        
        # Calculate metrics from data if available
        if latest_data.exists():
            total_distance = sum(data.distance for data in latest_data)
            total_score = sum(data.score for data in latest_data)
            count_records = latest_data.count()
            avg_score = total_score / count_records if count_records > 0 else 0
            
            # Count events
            total_harsh_braking = sum(data.harsh_braking_events for data in latest_data)
            total_harsh_acceleration = sum(data.harsh_acceleration_events for data in latest_data)
            total_swerving = sum(data.swerving_events for data in latest_data)
            total_over_speed = sum(data.over_speed_events for data in latest_data)
        
        # Create historical scores data (same implementation as before)
        historical_scores = []
        # Your historical scores calculation...
        
        # Create the overview data dictionary
        overview_data = {
            'fleet_stats': {
                'total_cars': total_cars,
                'active_cars': active_cars,
                'inactive_cars': inactive_cars,
                'maintenance_cars': maintenance_cars,
                'total_distance_km': round(total_distance, 2),
                'avg_score': round(avg_score, 1)
            },
            'events': {
                'harsh_braking': total_harsh_braking,
                'harsh_acceleration': total_harsh_acceleration,
                'swerving': total_swerving,
                'over_speed': total_over_speed,
                'total_events': total_harsh_braking + total_harsh_acceleration + total_swerving + total_over_speed
            },
            'historical_scores': historical_scores
        }
        
        # Process drivers data
        drivers = Driver.objects.filter(car_id__isnull=False)
        if company_id:
            drivers = drivers.filter(company_id=company_id)
            
        # Initialize counters
        excellent = 0
        good = 0
        average = 0
        poor = 0
        drivers_data = []

        # Loop through drivers to categorize performance
        for driver in drivers:
            try:
                # Get driving data for the driver's car
                car_data = DrivingData.objects.filter(
                    car_id=driver.car_id.id, 
                    created_at__gte=start_date
                ).order_by('-created_at').first()
                
                if car_data:
                    score = car_data.score
                    # Categorize by score
                    if score >= 90:
                        excellent += 1
                    elif score >= 80:
                        good += 1
                    elif score >= 70:
                        average += 1
                    else:
                        poor += 1
                        
                    # Add to driver data list
                    drivers_data.append({
                        'id': driver.id,
                        'name': driver.name,
                        'car_id': driver.car_id.id,
                        'score': score,
                        'model': driver.car_id.Model_of_car,
                        'plate': driver.car_id.Plate_number
                    })
            except Exception as e:
                print(f"Error processing driver {driver.id}: {str(e)}")
                
        # Add to response
        overview_data['drivers'] = {
            'excellent': excellent,
            'good': good,
            'average': average,
            'poor': poor,
            'all_drivers': drivers_data
        }
        
        return JsonResponse(overview_data)
    except Exception as e:
        print(f"Error in get_fleet_overview: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)
    

def score_chunk(chunk_df, results, car_id=None):
    """Score the driving behavior with custom weights if available"""
    from .models import Car, ScorePattern
    
    # Initialize score to 100%
    score = 100
    
    # Try to get custom scoring pattern for this car
    custom_weights = None
    
    if car_id:
        try:
            car = Car.objects.get(id=car_id)
            
            # First check if there's a customer-specific pattern
            if car.customer_id:
                custom_weights = ScorePattern.objects.filter(customer_id=car.customer_id).first()
                print(f"Using customer {car.customer_id.id} score pattern for car {car_id}")
            
            # If no customer-specific pattern, try company pattern
            if not custom_weights and car.company_id:
                custom_weights = ScorePattern.objects.filter(company_id=car.company_id).first()
                print(f"Using company {car.company_id.id} score pattern for car {car_id}")
                
            if custom_weights:
                print(f"Custom weights found: harsh_braking={custom_weights.harsh_braking_weight}, "
                      f"harsh_acceleration={custom_weights.harsh_acceleration_weight}, "
                      f"swerving={custom_weights.swerving_weight}, "
                      f"over_speed={custom_weights.over_speed_weight}")
            else:
                print(f"No custom weights found for car {car_id}")
        except Exception as e:
            print(f"Error getting custom weights: {str(e)}")
    
    # Define weights - use custom ones if available, otherwise defaults
    if custom_weights:
        harsh_braking_weight = custom_weights.harsh_braking_weight
        harsh_acceleration_weight = custom_weights.harsh_acceleration_weight
        swerving_weight = custom_weights.swerving_weight
        overspeed_weight = custom_weights.over_speed_weight
        potential_swerving_weight = custom_weights.potential_swerving_weight
    else:
        # Default weights
        harsh_braking_weight = 20
        harsh_acceleration_weight = 10
        swerving_weight = 30
        overspeed_weight = 20
        potential_swerving_weight = 0

    # Apply scoring deductions based on detected events and weights
    score -= results['harsh_braking_events'] * (harsh_braking_weight / 100)
    score -= results['harsh_acceleration_events'] * (harsh_acceleration_weight / 100)
    score -= results['swerving_events'] * (swerving_weight / 100)
    score -= results['over_speed_events'] * (overspeed_weight / 100)
    score -= results['potential_swerving_events'] * (potential_swerving_weight / 100)

    # Ensure the score doesn't go below 0%
    score = max(score, 0)

    return score

@csrf_exempt
def get_score_pattern(request):
    """
    Get the score pattern for a company or customer
    """
    try:
        user_type = request.GET.get('userType')
        user_id = request.GET.get('userId')
        
        if not user_type or not user_id:
            return JsonResponse({
                'error': 'Both userType and userId are required'
            }, status=400)
        
        # Find the appropriate pattern
        if user_type == 'customer':
            score_pattern = ScorePattern.objects.filter(customer_id=user_id).first()
        elif user_type in ['company', 'admin', 'employee']:
            # For employees, get the company ID
            if user_type == 'employee':
                try:
                    employee = Employee.objects.get(id=user_id)
                    if employee.company_id:
                        score_pattern = ScorePattern.objects.filter(company_id=employee.company_id.id).first()
                    else:
                        score_pattern = None
                except Employee.DoesNotExist:
                    score_pattern = None
            else:
                score_pattern = ScorePattern.objects.filter(company_id=user_id).first()
        else:
            return JsonResponse({
                'error': 'Invalid userType. Must be "customer", "company", "admin", or "employee"'
            }, status=400)
        
        # If no pattern exists, create default
        if not score_pattern:
            if user_type == 'customer':
                try:
                    customer = Customer.objects.get(id=user_id)
                    score_pattern = ScorePattern.objects.create(customer_id=customer)
                except Customer.DoesNotExist:
                    return JsonResponse({'error': 'Customer not found'}, status=404)
            elif user_type in ['company', 'admin']:
                try:
                    company = Company.objects.get(id=user_id)
                    score_pattern = ScorePattern.objects.create(company_id=company)
                except Company.DoesNotExist:
                    return JsonResponse({'error': 'Company not found'}, status=404)
            elif user_type == 'employee':
                try:
                    employee = Employee.objects.get(id=user_id)
                    if employee.company_id:
                        score_pattern = ScorePattern.objects.create(company_id=employee.company_id)
                    else:
                        return JsonResponse({'error': 'Employee has no company'}, status=404)
                except Employee.DoesNotExist:
                    return JsonResponse({'error': 'Employee not found'}, status=404)
        
        # Return the pattern
        return JsonResponse({
            'id': score_pattern.id,
            'harshBraking': score_pattern.harsh_braking_weight,
            'harshAcceleration': score_pattern.harsh_acceleration_weight,
            'swerving': score_pattern.swerving_weight,
            'overSpeed': score_pattern.over_speed_weight,
            'potentialSwerving': score_pattern.potential_swerving_weight,
            'customerId': score_pattern.customer_id_id,
            'companyId': score_pattern.company_id_id,
            'createdAt': score_pattern.created_at.isoformat(),
            'updatedAt': score_pattern.updated_at.isoformat()
        })
    except Exception as e:
        print(f"Error getting score pattern: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def update_score_pattern(request):
    """
    Update the score pattern for a company or customer
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    try:
        # Parse request body
        data = json.loads(request.body)
        
        # Get required fields
        user_type = data.get('userType')
        user_id = data.get('userId')
        
        if not user_type or not user_id:
            return JsonResponse({
                'error': 'Both userType and userId are required'
            }, status=400)
        
        # Get weights
        harsh_braking = int(data.get('harshBraking', 20))
        harsh_acceleration = int(data.get('harshAcceleration', 10)) 
        swerving = int(data.get('swerving', 30))
        over_speed = int(data.get('overSpeed', 20))
        potential_swerving = int(data.get('potentialSwerving', 0))
        
        # Validate weights sum to 100
        total = harsh_braking + harsh_acceleration + swerving + over_speed + potential_swerving
        if total != 100:
            return JsonResponse({
                'error': f'Weights must sum to 100. Current total: {total}'
            }, status=400)
        
        # Find or create pattern
        if user_type == 'customer':
            customer = Customer.objects.get(id=user_id)
            score_pattern, created = ScorePattern.objects.get_or_create(
                customer_id=customer,
                defaults={
                    'harsh_braking_weight': harsh_braking,
                    'harsh_acceleration_weight': harsh_acceleration,
                    'swerving_weight': swerving,
                    'over_speed_weight': over_speed,
                    'potential_swerving_weight': potential_swerving
                }
            )
            if not created:
                score_pattern.harsh_braking_weight = harsh_braking
                score_pattern.harsh_acceleration_weight = harsh_acceleration
                score_pattern.swerving_weight = swerving
                score_pattern.over_speed_weight = over_speed
                score_pattern.potential_swerving_weight = potential_swerving
                score_pattern.save()
        elif user_type in ['company', 'admin', 'employee']:
            # For employees, get the company ID
            if user_type == 'employee':
                employee = Employee.objects.get(id=user_id)
                if not employee.company_id:
                    return JsonResponse({'error': 'Employee has no company'}, status=400)
                company = employee.company_id
            else:
                company = Company.objects.get(id=user_id)
                
            score_pattern, created = ScorePattern.objects.get_or_create(
                company_id=company,
                defaults={
                    'harsh_braking_weight': harsh_braking,
                    'harsh_acceleration_weight': harsh_acceleration,
                    'swerving_weight': swerving,
                    'over_speed_weight': over_speed,
                    'potential_swerving_weight': potential_swerving
                }
            )
            if not created:
                score_pattern.harsh_braking_weight = harsh_braking
                score_pattern.harsh_acceleration_weight = harsh_acceleration
                score_pattern.swerving_weight = swerving
                score_pattern.over_speed_weight = over_speed
                score_pattern.potential_swerving_weight = potential_swerving
                score_pattern.save()
        else:
            return JsonResponse({
                'error': 'Invalid userType. Must be "customer", "company", "admin", or "employee"'
            }, status=400)
        
        return JsonResponse({
            'success': True,
            'message': 'Score pattern updated successfully',
            'id': score_pattern.id
        })
    except Customer.DoesNotExist:
        return JsonResponse({'error': 'Customer not found'}, status=404)
    except Company.DoesNotExist:
        return JsonResponse({'error': 'Company not found'}, status=404)
    except Employee.DoesNotExist:
        return JsonResponse({'error': 'Employee not found'}, status=404)
    except Exception as e:
        print(f"Error updating score pattern: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def recalculate_car_scores(request):
    """
    Recalculate scores for a car's recent driving data using the latest score pattern
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    try:
        data = json.loads(request.body)
        car_id = data.get('carId')
        days = int(data.get('days', 7))  # Default to 7 days of data
        
        if not car_id:
            return JsonResponse({'error': 'Car ID is required'}, status=400)
        
        # Get recent driving data for this car
        from django.utils import timezone
        from datetime import timedelta
        
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)
        
        # Get driving data records
        driving_records = DrivingData.objects.filter(
            car_id=car_id,
            created_at__gte=start_date
        ).order_by('-created_at')
        
        updated_count = 0
        
        # Process each record
        for record in driving_records:
            # Create results dict from existing record
            results = {
                'harsh_braking_events': record.harsh_braking_events,
                'harsh_acceleration_events': record.harsh_acceleration_events,
                'swerving_events': record.swerving_events,
                'potential_swerving_events': record.potential_swerving_events,
                'over_speed_events': record.over_speed_events
            }
            
            # Recalculate score using the latest pattern
            new_score = score_chunk(None, results, car_id)
            
            # Update if different
            if abs(record.score - new_score) > 0.01:  # Small tolerance for floating point comparison
                record.score = new_score
                record.save(update_fields=['score'])
                updated_count += 1
        
        return JsonResponse({
            'success': True,
            'message': f'Recalculated scores for {updated_count} records',
            'updatedCount': updated_count
        })
    
    except Exception as e:
        print(f"Error recalculating scores: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def get_car_trips(request, car_id=None):
    """
    Get trip data for a specific car or all cars for a customer.
    Trips are defined by driving data with gaps of 10+ minutes.
    """
    try:
        # Get time frame parameter or default to 7d
        time_frame = request.GET.get('time_frame', '7d')
        
        # Determine the customer from the request
        customer_id = request.GET.get('customer_id')
        
        # Determine date range based on time frame
        now = timezone.now()
        if time_frame == '1d':
            start_date = now - timedelta(days=1)
        elif time_frame == '7d':
            start_date = now - timedelta(days=7)
        elif time_frame == '30d':
            start_date = now - timedelta(days=30)
        else:
            start_date = now - timedelta(days=7)
        
        # Get driving data for the specified car or all customer's cars
        if car_id and car_id != 'all':
            driving_data = DrivingData.objects.filter(
                car_id=car_id,
                created_at__gte=start_date
            ).order_by('created_at')
            
            car_info = {car_id: Car.objects.get(id=car_id)}
        else:
            # Get all cars for this customer
            cars = Car.objects.filter(customer_id=customer_id)
            car_ids = cars.values_list('id', flat=True)
            car_info = {car.id: car for car in cars}
            
            driving_data = DrivingData.objects.filter(
                car_id__in=car_ids,
                created_at__gte=start_date
            ).order_by('created_at')
        
        # Group data into trips (10-minute gap defines a new trip)
        trips = []
        current_trip_data = []
        current_car_id = None
        
        for data in driving_data:
            # New car always starts a new trip
            if current_car_id is not None and current_car_id != data.car_id.id:
                if current_trip_data:
                    trips.append(process_trip(current_trip_data, car_info[current_car_id]))
                    current_trip_data = []
            
            # If current trip has data, check time gap
            if current_trip_data:
                time_gap = data.created_at - current_trip_data[-1].created_at
                if time_gap > timedelta(minutes=10):
                    # Gap is more than 10 minutes, process the current trip and start a new one
                    trips.append(process_trip(current_trip_data, car_info[current_car_id]))
                    current_trip_data = []
            
            # Add this data point to the current trip
            current_trip_data.append(data)
            current_car_id = data.car_id.id
        
        # Process the last trip if any
        if current_trip_data:
            trips.append(process_trip(current_trip_data, car_info[current_car_id]))
        
        # Sort trips by start time (newest first)
        trips.sort(key=lambda x: x['start_time'], reverse=True)
        
        return JsonResponse(trips, safe=False)
        
    except Exception as e:
        print(f"Error in get_car_trips: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)

def process_trip(trip_data, car):
    """Helper function to process a list of driving data into a trip summary"""
    # Sort by time to ensure correct order
    trip_data.sort(key=lambda x: x.created_at)
    
    start_time = trip_data[0].created_at
    end_time = trip_data[-1].created_at
    duration = (end_time - start_time).total_seconds() / 60  # minutes
    
    # Calculate total distance
    total_distance = sum(data.distance for data in trip_data)
    
    # Calculate average score
    avg_score = sum(data.score for data in trip_data) / len(trip_data) if trip_data else 0
    
    # Count events
    harsh_braking = sum(data.harsh_braking_events for data in trip_data)
    harsh_acceleration = sum(data.harsh_acceleration_events for data in trip_data)
    swerving = sum(data.swerving_events for data in trip_data)
    over_speed = sum(data.over_speed_events for data in trip_data)
    
    return {
        'trip_id': f"{car.id}-{start_time.strftime('%Y%m%d%H%M%S')}",
        'car_id': car.id,
        'car_model': car.Model_of_car,
        'plate_number': car.Plate_number,
        'start_time': start_time.isoformat(),
        'end_time': end_time.isoformat(),
        'duration_minutes': round(duration, 1),
        'distance_km': round(total_distance, 2),
        'score': round(avg_score, 1),
        'events': {
            'harsh_braking': harsh_braking,
            'harsh_acceleration': harsh_acceleration,
            'swerving': swerving,
            'over_speed': over_speed
        }
    }