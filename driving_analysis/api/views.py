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
            'speed': latest_location['speed']
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
def create_customer(request):
    if request.method == 'POST':
        form = CustomerForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('customer_list')
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
def create_company(request):
    if request.method == 'POST':
        form = CompanyForm(request.POST)
        if form.is_valid():
            form.save()
            return JsonResponse({'message': 'Company created successfully'}, status=201)
    else:
        form = CompanyForm()
    return JsonResponse({'errors': form.errors}, status=400)

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
def create_car(request):
    if request.method == 'POST':
        form = CarForm(request.POST)
        if form.is_valid():
            form.save()
            return JsonResponse({'message': 'Car created successfully'}, status=201)
    else:
        form = CarForm()
    return JsonResponse({'errors': form.errors}, status=400)

def update_car(request, car_id):
    car = get_object_or_404(Car, pk=car_id)
    if request.method == 'POST':
        form = CarForm(request.POST, instance=car)
        if form.is_valid():
            form.save()
            return JsonResponse({'message': 'Car updated successfully'}, status=200)
    else:
        form = CarForm(instance=car)
    return JsonResponse({'errors': form.errors}, status=400)

def delete_car(request, car_id):
    car = get_object_or_404(Car, pk=car_id)
    if request.method == 'POST':
        car.delete()
        return JsonResponse({'message': 'Car deleted successfully'}, status=200)
    return JsonResponse({'error': 'Invalid request method'}, status=405)

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
            }
            for driver in drivers
        ]
        return JsonResponse(driver_data, safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def create_driver(request):
    if request.method == 'POST':
        form = DriverForm(request.POST)
        if form.is_valid():
            form.save()
            return JsonResponse({'message': 'Driver created successfully'}, status=201)
    else:
        form = DriverForm()
    return JsonResponse({'errors': form.errors}, status=400)

def update_driver(request, driver_id):
    driver = get_object_or_404(Driver, pk=driver_id)
    if request.method == 'POST':
        form = DriverForm(request.POST, instance=driver)
        if form.is_valid():
            form.save()
            return JsonResponse({'message': 'Driver updated successfully'}, status=200)
    else:
        form = DriverForm(instance=driver)
    return JsonResponse({'errors': form.errors}, status=400)

def delete_driver(request, driver_id):
    driver = get_object_or_404(Driver, pk=driver_id)
    if request.method == 'POST':
        driver.delete()
        return JsonResponse({'message': 'Driver deleted successfully'}, status=200)
    return JsonResponse({'error': 'Invalid request method'}, status=405)

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
            'Password': employee.Password  
        }
        for employee in employees
    ]
    return JsonResponse(employee_data, safe=False)
@ensure_csrf_cookie
@csrf_exempt 
@require_http_methods(["POST"])
@csrf_exempt
def create_employee(request):
    try:
        data = json.loads(request.body)
        form = EmployeeForm(data)
        if form.is_valid():
            employee = form.save()
            return JsonResponse({
                'message': 'Employee created successfully',
                'employee_id': employee.id
            }, status=201)
        else:
            return JsonResponse({'errors': form.errors}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def update_employee(request, employee_id):
    employee = get_object_or_404(Employee, pk=employee_id)
    if request.method == 'POST':
        form = EmployeeForm(request.POST, instance=employee)
        if form.is_valid():
            form.save()
            return JsonResponse({'message': 'Employee updated successfully'}, status=200)
    else:
        form = EmployeeForm(instance=employee)
    return JsonResponse({'errors': form.errors}, status=400)

def delete_employee(request, employee_id):
    employee = get_object_or_404(Employee, pk=employee_id)
    if request.method == 'POST':
        employee.delete()
        return JsonResponse({'message': 'Employee deleted successfully'}, status=200)
    return JsonResponse({'error': 'Invalid request method'}, status=405)
@csrf_exempt
def get_car_driving_data(request, car_id):
    try:
        # Get the most recent driving data for this car
        driving_data = DrivingData.objects.filter(car_id=car_id).order_by('-id').first()
        
        if driving_data:
            data = {
                'car_id': car_id,
                'distance': driving_data.distance,
                'harsh_braking_events': driving_data.harsh_braking_events,
                'harsh_acceleration_events': driving_data.harsh_acceleration_events,
                'swerving_events': driving_data.swerving_events,
                'potential_swerving_events': driving_data.potential_swerving_events,
                'over_speed_events': driving_data.over_speed_events,
                'score': driving_data.score,
                'speed': driving_data.speed,
            }
            return JsonResponse(data)
        else:
            return JsonResponse({
                'car_id': car_id,
                'distance': 0,
                'harsh_braking_events': 0,
                'harsh_acceleration_events': 0,
                'swerving_events': 0,
                'potential_swerving_events': 0,
                'over_speed_events': 0,
                'score': 100,
                'speed': 0
            })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)        # In api/views.py
        from django.views.decorators.csrf import csrf_exempt
        
        @csrf_exempt
        def create_car(request):
            if request.method == 'POST':
                # Your existing code
                pass
            
        @csrf_exempt
        def create_driver(request):
            if request.method == 'POST':
                # Your existing code
                pass