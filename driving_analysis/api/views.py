from django.shortcuts import render
import folium
from .models import DrivingData

def driver_map(request):
    # Get the latest driving data
    driving_data = DrivingData.objects.all().order_by('-timestamp')[:10]

    # Create a folium map centered around the latest data point
    if driving_data:
        latest_data = driving_data[0]
        m = folium.Map(location=[latest_data.latitude, latest_data.longitude], zoom_start=12)

        # Add markers for each data point
        for data in driving_data:
            folium.Marker(
                [data.latitude, data.longitude],
                popup=f"Speed: {data.speed}, Acceleration: {data.acceleration}"
            ).add_to(m)

        map_html = m._repr_html_()
    else:
        map_html = None

    return render(request, 'driver_map.html', {'map': map_html})
