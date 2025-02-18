from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse, HttpResponse
import folium
from .models import DrivingData, Customer, Company, Car, Driver
from .forms import CustomerForm, CompanyForm, CarForm, DriverForm,DrivingDataForm
from .cleansing_data import cleanse_data

buffer = []
cleansed_buffer = []

def driver_map(request):
    # Create a folium map centered around the latest data point in the buffer
    if buffer:
        latest_data = buffer[-1]
        m = folium.Map(location=[latest_data['latitude'], latest_data['longitude']], zoom_start=12)

        # Add markers for each data point in the buffer
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

def get_latest_data(request):
    if buffer:
        latest_data = buffer[-1]  # Get the latest data point from the buffer
        data_list = [latest_data]
    else:
        data_list = []
    return JsonResponse(data_list, safe=False)

def customer_list(request):
    customers = Customer.objects.all()
    return render(request, 'customer_list.html', {'customers': customers})
#---------------------------------------------------------------------------------------

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
#---------------------------------------------------------------------------------------

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
#---------------------------------------------------------------------------------------

# Car views
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
#---------------------------------------------------------------------------------------

# Driver views
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


#---------------------------------------------------------------------------------------

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
    if buffer:
        cleaned_data = cleanse_data(buffer)
        return HttpResponse("Buffer cleansed successfully. Check console for details.")
    else:
        return HttpResponse("Buffer is empty. No data to cleanse.")

def get_cleansed_data(request):
    return JsonResponse(cleansed_buffer, safe=False)