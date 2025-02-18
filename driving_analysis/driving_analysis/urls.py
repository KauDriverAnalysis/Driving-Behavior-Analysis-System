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
from django.urls import path, include
from api.views import driver_map, get_latest_data
from api import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', driver_map, name='home'),  # Add this line to redirect root URL to driver_map
    path('driver-map/', driver_map, name='driver_map'),
    path('get-latest-data/', get_latest_data, name='get_latest_data'),
    path('', views.customer_list, name='customer_list'),
    path('create/', views.create_customer, name='create_customer'),
    path('update/<int:customer_id>/', views.update_customer, name='update_customer'),
    path('delete/<int:customer_id>/', views.delete_customer, name='delete_customer'),
    path('cleanse-buffer/', views.cleanse_buffer_view, name='cleanse_buffer'),
    path('get-cleansed-data/', views.get_cleansed_data, name='get_cleansed_data')
   
]
