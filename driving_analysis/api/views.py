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


def customer_list(request):
    customers = Customer.objects.all()
    return render(request, 'customer_list.html', {'customers': customers})

# customer views
@csrf_exempt
def create_customer(request):
    if request.method == 'POST':
        try:
            # Check if this is a JSON request from the React app
            if request.content_type == 'application/json':
                # Parse JSON data from request body
                data = json.loads(request.body)
                print(f"Received customer data: {data}")  # Debug print
                
                # Ensure gender is lowercase
                if 'gender' in data:
                    data['gender'] = data['gender'].lower()
                
                # Create form with JSON data
                form = CustomerForm(data)
                if form.is_valid():
                    customer = form.save()
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

def update_customer(request, customer_id):
    customer = get_object_or_404(Customer, pk=customer_id)
    if request.method == 'POST':
        form = CustomerForm(request.POST, instance=customer)
        if form.is_valid():
            form.save()
            return redirect('customer_list')
    else:
        form = CustomerForm(instance=customer)
    return render(request, 'update_customer.html', {'form': form})

def delete_customer(request, customer_id):
    customer = get_object_or_404(Customer, pk=customer_id)
    if request.method == 'POST':
        customer.delete()
        return redirect('customer_list')
    return render(request, 'delete_customer.html', {'customer': customer})

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

def update_company(request, company_id):
    company = get_object_or_404(Company, pk=company_id)
    if request.method == 'POST':
        form = CompanyForm(request.POST, instance=company)
        if form.is_valid():
            form.save()
            return JsonResponse({'message': 'Company updated successfully'}, status=200)
    else:
        form = CompanyForm(instance=company)
    return JsonResponse({'errors': form.errors}, status=400)

def delete_company(request, company_id):
    company = get_object_or_404(Company, pk=company_id)
    if request.method == 'POST':
        company.delete()
        return JsonResponse({'message': 'Company deleted successfully'}, status=200)
    return JsonResponse({'error': 'Invalid request method'}, status=405)

# Car views

def car_list(request):
    cars = Car.objects.all()
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
        for car in cars
    ]
    return JsonResponse(car_data, safe=False)
@csrf_exempt
def customer_cars(request, customer_id):
    try:
        cars = Car.objects.filter(customer_id=customer_id)
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
            for car in cars
        ]
        return JsonResponse(car_data, safe=False)
    except Exception as e:
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
                    # Fixed the syntax error here - was using id() function incorrectly
                    customer = Customer.objects.get(id(data['customer_id']))
                    data['customer_id'] = customer
                except Customer.DoesNotExist:
                    return JsonResponse({'errors': {'customer_id': 'Invalid customer ID'}}, status=400)
                    
            # Create form with JSON data
            form = CarForm(data)
            if form.is_valid():
                car = form.save()
                return JsonResponse({
                    'success': True, 
                    'id': car.id,
                    'message': 'Car created successfully'
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
        drivers = Driver.objects.all()
        driver_data = [
            {
                'id': driver.id,
                'name': driver.name,
                'gender': driver.gender,
                'phone_number': driver.phone_number,
                'company_id': driver.company_id_id,
                'car_id': driver.car_id_id,  # Added car_id field
            }
            for driver in drivers
        ]
        return JsonResponse(driver_data, safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def create_driver(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
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
                return JsonResponse({'errors': {'company_id': 'Invalid company ID'}}, status=400)
                
            form = DriverForm(data)
            if form.is_valid():
                driver = form.save()
                return JsonResponse({'success': True, 'id': driver.id})
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
                        'role': role,  # This should be 'admin' for admins
                        'userType': role,  # Make these consistent
                        'userId': employee.id,
                        'Admin': is_admin,  # Add explicit Admin flag
                        'company_id': employee.company_id_id if hasattr(employee, 'company_id') else None
                    }, status=200)
            except Employee.DoesNotExist:
                try:
                    company = Company.objects.get(Email=email)
                    print(f"Company found: {company.Company_name} (ID: {company.id})")  # Debug print
                    
                    if check_password(password, company.Password) or password == company.Password:
                        print(f"Company login successful")  # Debug print
                        token = f"{company.id}_{int(time.time())}"
                        return JsonResponse({
                            'success': True,
                            'token': token,
                            'id': company.id,
                            'Company_name': company.Company_name,
                            'role': 'company',
                            'userType': 'company',  # Add this for consistent authentication
                            'userId': company.id    # Add this for consistent authentication
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
            
            print(f"Customer login attempt for email: {email}")  # Debug print
            
            try:
                customer = Customer.objects.get(Email=email)
                print(f"Customer found: {customer.Name} (ID: {customer.id})")  # Debug print
                
                if check_password(password, customer.Password) or password == customer.Password:
                    token = f"{customer.id}_{int(time.time())}"
                    print(f"Customer login successful")  # Debug print
                    
                    return JsonResponse({
                        'success': True,
                        'token': token,
                        'id': customer.id,
                        'Name': customer.Name,
                        'role': 'customer',
                        'userType': 'customer',  # Add this for consistent authentication
                        'userId': customer.id    # Add this for consistent authentication
                    }, status=200)
                else:
                    print(f"Invalid password for customer: {customer.Name}")  # Debug print
                    return JsonResponse({'error': 'Invalid credentials'}, status=401)
            except Customer.DoesNotExist:
                print(f"No customer found with email: {email}")  # Debug print
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