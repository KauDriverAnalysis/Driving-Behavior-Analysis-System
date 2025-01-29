from django.shortcuts import render
from django.http import JsonResponse
import folium
from .models import DrivingData

def driver_map(request):
    return render(request, 'driver_map.html')

def get_latest_data(request):
    driving_data = DrivingData.objects.all().order_by('-timestamp')[:10]
    data_list = list(driving_data.values('latitude', 'longitude', 'speed', 'acceleration'))
    return JsonResponse(data_list, safe=False)
