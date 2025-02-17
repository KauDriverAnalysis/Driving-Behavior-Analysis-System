from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from .models import DrivingData,Customer
from .forms import CustomerForm

def driver_map(request):
    return render(request, 'driver_map.html')

def get_latest_data(request):
    driving_data = DrivingData.objects.all().order_by('-timestamp')[:10]
    data_list = list(driving_data.values('latitude', 'longitude', 'speed', 'ax'))
    return JsonResponse(data_list, safe=False)
def customer_list(request):
    customers = Customer.objects.all()
    return render(request, 'customer_list.html', {'customers': customers})

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

