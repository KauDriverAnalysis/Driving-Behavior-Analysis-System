from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse, HttpResponse
import folium
from django.core.cache import cache
from .models import DrivingData, Customer, Company, Car, Driver
from .forms import CustomerForm, CompanyForm, CarForm, DriverForm, DrivingDataForm
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

# Add these imports at the top of your views.py
from .models import Geofence
from .forms import GeofenceForm


def driver_map(request):
    latest_location = cache.get('latest_location')
    print(f"Driver map latest_location: {latest_location}")  # Debugging statement
    if (latest_location):
        m = folium.Map(location=[latest_location['latitude'], latest_location['longitude']], zoom_start=12)

        # Add markers for each data point in the buffer
        buffer = cache.get('buffer', [])
        for data in buffer:
            folium.Marker(
                [data['latitude'], data['longitude']], 
                popup=f"Speed: {data['speed']}, Acceleration: {data['ax']}"
            ).add_to(m)

        map_html = m._repr_html_()
        map_ready = True
    else:
        map_html = None
        map_ready = False

    return render(request, 'driver_map.html', {'map': map_html, 'map_ready': map_ready})

from django.http import JsonResponse
from django.core.cache import cache

def get_latest_data(request):
    latest_location = cache.get('latest_location')
    print(f"latest_data: {latest_location}")  # Debugging statement
    if latest_location:
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
    response["Access-Control-Allow-Origin"] = "http://localhost:3000"
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
                # Filter cars by customer_id
                cars_queryset = Car.objects.filter(customer_id=user_id)
                print(f"Filtering cars for customer ID: {user_id}, found {cars_queryset.count()} cars")
                
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
                'model': car.Model_of_car,
                'type': car.TypeOfCar,
                'plateNumber': car.Plate_number,
                'releaseYear': car.Release_Year_car,
                'state': car.State_of_car,
                'deviceId': car.device_id,
                'customerId': car.customer_id_id,
                'companyId': car.company_id_id,
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
            print(f"Received update data for car {car_id}: {data}")  # Debug print
            
            # Handle partial updates - only update fields that are provided
            if 'State_of_car' in data and len(data) == 1:
                # This is just a status update
                car.State_of_car = data['State_of_car']
                car.save()
                return JsonResponse({
                    'success': True,
                    'id': car.id,
                    'message': 'Car status updated successfully'
                }, status=200)
            
            # For full updates, continue with the normal form validation
            # Handle foreign key fields if present
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
            
            # Update the instance with the form
            form = CarForm(data, instance=car)
            if form.is_valid():
                updated_car = form.save()
                return JsonResponse({
                    'success': True,
                    'id': updated_car.id,
                    'message': 'Car updated successfully'
                }, status=200)
            else:
                print(f"Form validation errors: {form.errors}")
                return JsonResponse({'errors': form.errors}, status=400)
        except Exception as e:
            print(f"Error updating car: {str(e)}")
            return JsonResponse({'errors': {'server': str(e)}}, status=500)
    
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
        drivers_queryset = Driver.objects.all()
        
        # Apply filtering based on user type and ID
        if user_type and user_id:
            if user_type == 'company':
                # Filter drivers by company_id
                drivers_queryset = Driver.objects.filter(company_id=user_id)
                print(f"Filtering drivers for company ID: {user_id}, found {drivers_queryset.count()} drivers")
                
            elif user_type == 'employee' or user_type == 'admin':
                # Get the employee's company and filter drivers by that company
                try:
                    employee = Employee.objects.get(id=user_id)
                    if employee.company_id:
                        drivers_queryset = Driver.objects.filter(company_id=employee.company_id.id)
                        print(f"Filtering drivers for employee ID: {user_id}, company ID: {employee.company_id.id}")
                    else:
                        # If employee has no company, return empty list
                        drivers_queryset = Driver.objects.none()
                        print(f"Employee ID: {user_id} has no company association")
                except Employee.DoesNotExist:
                    return JsonResponse({'error': 'Employee not found'}, status=404)
        
        driver_data = [
            {
                'id': driver.id,
                'name': driver.name,
                'gender': driver.gender,
                'phone_number': driver.phone_number,
                'company_id': driver.company_id_id,
                'car_id': driver.car_id_id,
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
            # Parse JSON data from request body
            data = json.loads(request.body)
            print(f"Received update data for driver {driver_id}: {data}")  # Debug print
            
            # Handle foreign key fields if present
            if data.get('company_id'):
                try:
                    company = Company.objects.get(id=data['company_id'])
                    data['company_id'] = company
                except Company.DoesNotExist:
                    return JsonResponse({'errors': {'company_id': 'Invalid company ID'}}, status=400)
            
            if data.get('car_id'):
                try:
                    car = Car.objects.get(id=data['car_id'])
                    data['car_id'] = car
                except Car.DoesNotExist:
                    return JsonResponse({'errors': {'car_id': 'Invalid car ID'}}, status=400)
            
            # Update the instance with the form
            form = DriverForm(data, instance=driver)
            if form.is_valid():
                updated_driver = form.save()
                return JsonResponse({
                    'success': True,
                    'id': updated_driver.id,
                    'message': 'Driver updated successfully'
                }, status=200)
            else:
                print(f"Form validation errors: {form.errors}")
                return JsonResponse({'errors': form.errors}, status=400)
        except Exception as e:
            print(f"Error updating driver: {str(e)}")
            return JsonResponse({'errors': {'server': str(e)}}, status=500)
    
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
        form = DrivingDataForm(request.POST)
        if form.is_valid():
            form.save()
            return JsonResponse({'message': 'Driving data created successfully'}, status=201)
    else:
        form = DrivingDataForm()
    return JsonResponse({'errors': form.errors}, status=400)

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
            
            # Handle company_id if present
            if data.get('company_id'):
                try:
                    company = Company.objects.get(id=data['company_id'])
                    data['company_id'] = company
                except Company.DoesNotExist:
                    return JsonResponse({'errors': {'company_id': 'Invalid company ID'}}, status=400)
            
            # Hash the password if provided
            if 'Password' in data and data['Password']:
                data['Password'] = make_password(data['Password'])
            
            # Ensure Admin field is properly set if not provided
            if 'Admin' not in data:
                data['Admin'] = False
                
            # Create form with JSON data
            form = EmployeeForm(data)
            if form.is_valid():
                employee = form.save()
                return JsonResponse({
                    'success': True, 
                    'id': employee.id,
                    'name': employee.Name,
                    'email': employee.Email,
                    'message': 'Employee created successfully'
                }, status=201)
            else:
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
            
            # Handle company_id if present
            if data.get('company_id'):
                try:
                    company = Company.objects.get(id=data['company_id'])
                    data['company_id'] = company
                except Company.DoesNotExist:
                    return JsonResponse({'errors': {'company_id': 'Invalid company ID'}}, status=400)
            
            # Hash the password if provided and not empty
            if 'Password' in data and data['Password']:
                data['Password'] = make_password(data['Password'])
            elif 'Password' in data and not data['Password']:
                # If empty password is provided, remove it to keep the old password
                del data['Password']
            
            # Update the employee with form validation
            form = EmployeeForm(data, instance=employee)
            if form.is_valid():
                updated_employee = form.save()
                return JsonResponse({
                    'success': True,
                    'id': updated_employee.id,
                    'name': updated_employee.Name,
                    'email': updated_employee.Email,
                    'message': 'Employee updated successfully'
                }, status=200)
            else:
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
        
        # Get the most recent driving data for this car
        latest_driving_data = DrivingData.objects.filter(car_id=car_id).order_by('-created_at').first()
        
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
                    'speed': 0
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
                            'role': 'company',
                            'userType': 'company',
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
            reset_url = f"http://localhost:3000/auth/reset-password/confirm?token={reset_token}&email={email}&userType={user_type}"
            
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
        latest_location = cache.get('latest_location')
        
        if car_id:
            # Get the device_id for the requested car
            car = next((c for c in cars if c['id'] == car_id), None)
            if not car:
                return JsonResponse({'error': f'Car with id {car_id} not found'}, status=404)
            
            device_id = car['device_id']
            print(f"Looking for car with device_id: {device_id}")
            print(f"Latest location data: {latest_location}")
            
            # Check if we have location data for this device (case insensitive comparison)
            if latest_location and latest_location.get('device_id', '').lower() == device_id.lower():
                # We found location data for this specific car
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
                
                # If we have data for this device, use it, otherwise use default values
                if latest_location and latest_location.get('device_id', '').lower() == device_id.lower():
                    car_locations.append({
                        'id': car['id'],
                        'latitude': latest_location['latitude'],
                        'longitude': latest_location['longitude'],
                        'speed': latest_location.get('speed', 0),
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
            response["Access-Control-Allow-Origin"] = "http://localhost:3000"
            response["Access-Control-Allow-Methods"] = "GET, OPTIONS"
            response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
            return response
            
    except Exception as e:
        print(f"Error in get_car_location: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)

# Add these functions to your views.py file

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
        
        # Get all cars 
        cars = Car.objects.all()
        total_cars = cars.count()
        active_cars = cars.filter(State_of_car='online').count()
        
        # Get the latest driving data records for analysis with time filter
        latest_data = DrivingData.objects.filter(created_at__gte=start_date).order_by('-created_at')
        
        # Calculate aggregate statistics
        total_distance = sum(data.distance for data in latest_data) if latest_data else 0
        avg_score = sum(data.score for data in latest_data) / latest_data.count() if latest_data and latest_data.count() > 0 else 0
        
        # Count events
        total_harsh_braking = sum(data.harsh_braking_events for data in latest_data) if latest_data else 0
        total_harsh_acceleration = sum(data.harsh_acceleration_events for data in latest_data) if latest_data else 0
        total_swerving = sum(data.swerving_events for data in latest_data) if latest_data else 0
        total_over_speed = sum(data.over_speed_events for data in latest_data) if latest_data else 0
        
        # Create historical scores data
        historical_scores = []
        if time_frame == '1d':
            # Generate hourly data points
            for hour in range(24):
                hour_start = now.replace(hour=hour, minute=0, second=0, microsecond=0)
                hour_end = hour_start + timedelta(hours=1)
                
                hour_data = DrivingData.objects.filter(
                    created_at__gte=hour_start,
                    created_at__lt=hour_end
                )
                
                if hour_data.exists():
                    avg_hour_score = sum(data.score for data in hour_data) / hour_data.count()
                    historical_scores.append({
                        'time_label': f"{hour:02d}:00",
                        'score': avg_hour_score
                    })
        
        elif time_frame == '7d':
            # Generate daily data points for the week
            for day in range(7):
                day_date = now - timedelta(days=6-day)
                day_start = day_date.replace(hour=0, minute=0, second=0, microsecond=0)
                day_end = day_start + timedelta(days=1)
                
                day_data = DrivingData.objects.filter(
                    created_at__gte=day_start,
                    created_at__lt=day_end
                )
                
                if day_data.exists():
                    avg_day_score = sum(data.score for data in day_data) / day_data.count()
                    historical_scores.append({
                        'time_label': day_date.strftime('%a'),
                        'score': avg_day_score
                    })
        
        elif time_frame == '30d':
            # Generate weekly data points for the month
            for week in range(4):
                week_start = now - timedelta(days=28-week*7)
                week_end = week_start + timedelta(days=7)
                
                week_data = DrivingData.objects.filter(
                    created_at__gte=week_start,
                    created_at__lt=week_end
                )
                
                if week_data.exists():
                    avg_week_score = sum(data.score for data in week_data) / week_data.count()
                    historical_scores.append({
                        'time_label': f"Week {week+1}",
                        'score': avg_week_score
                    })
        
        # Initialize the response data dictionary
        overview_data = {
            'fleet_stats': {
                'total_cars': total_cars,
                'active_cars': active_cars,
                'inactive_cars': total_cars - active_cars,
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
        
        # Get actual drivers data with proper car score linking
        drivers = Driver.objects.all()
        drivers_data = []
        
        # Track driver performance categories
        excellent = 0
        good = 0
        average = 0
        poor = 0
        
        for driver in drivers:
            # Skip drivers with no car assigned
            if not driver.car_id:
                continue
                
            # Try to get the driving data for the driver's car
            try:
                # Get multiple data points to calculate a more accurate average
                car_data_points = DrivingData.objects.filter(
                    car_id=driver.car_id.id,
                    created_at__gte=start_date  # Use the same time filter as the rest of the overview
                ).order_by('-created_at')[:10]  # Get up to 10 recent records
                
                if car_data_points.exists():
                    # Calculate average score from multiple data points
                    avg_score = sum(data.score for data in car_data_points) / car_data_points.count()
                    
                    # Round to one decimal
                    driver_score = round(avg_score, 1)
                else:
                    # If no recent data, check if there's any historical data at all
                    any_car_data = DrivingData.objects.filter(car_id=driver.car_id.id).order_by('-created_at').first()
                    driver_score = round(any_car_data.score, 1) if any_car_data else 0
                
                # Categorize driver based on score
                if driver_score >= 90:
                    excellent += 1
                elif driver_score >= 80:
                    good += 1
                elif driver_score >= 70:
                    average += 1
                else:
                    poor += 1
                
                # Add to drivers data
                drivers_data.append({
                    'id': driver.id,
                    'name': driver.name,
                    'car_id': driver.car_id.id,
                    'score': driver_score,
                    'model': driver.car_id.Model_of_car,
                    'plate': driver.car_id.Plate_number
                })
            except Exception as e:
                print(f"Error getting driver {driver.id} data: {str(e)}")
                continue
        
        # Add driver performance data to the response
        overview_data['drivers'] = {
            'excellent': excellent,
            'good': good,
            'average': average,
            'poor': poor,
            'all_drivers': drivers_data  # Include all driver details
        }
        
        return JsonResponse(overview_data)
    except Exception as e:
        print(f"Error in get_fleet_overview: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)