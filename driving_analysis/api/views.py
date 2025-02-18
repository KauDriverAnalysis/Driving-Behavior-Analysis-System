from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from .models import DrivingData, Customer, Company, Car, Driver
from .forms import CustomerForm, CompanyForm, CarForm, DriverForm,DrivingDataForm

def driver_map(request):
    return render(request, 'driver_map.html')

def get_latest_data(request):
    driving_data = DrivingData.objects.all().order_by('-timestamp')[:10]
    data_list = list(driving_data.values('latitude', 'longitude', 'speed', 'ax'))
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