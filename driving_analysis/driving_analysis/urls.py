"""
URL configuration for driving_analysis project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from api.views import driver_map, get_latest_data

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', driver_map, name='home'),  # Add this line to redirect root URL to driver_map
    path('driver-map/', driver_map, name='driver_map'),
    path('get-latest-data/', get_latest_data, name='get_latest_data'),
]
