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
    path('', driver_map, name='home'),  # Redirect root URL to driver_map
    path('driver-map/', driver_map, name='driver_map'),  # Fixed typo with double backticks
    path('get-latest-data/', get_latest_data, name='get_latest_data'),  # Ensure this line is correct
    path('customers/', views.customer_list, name='customer_list'),
    path('create/', views.create_customer, name='create_customer'),
    path('update/<int:customer_id>/', views.update_customer, name='update_customer'),
    path('delete/<int:customer_id>/', views.delete_customer, name='delete_customer'),
    path('cleanse-buffer/', views.cleanse_buffer_view, name='cleanse_buffer'),
    path('get-cleansed-data/', views.get_cleansed_data, name='get_cleansed_data'),
    path('get-analysis-results/', views.get_analysis_results, name='get-analysis-results'),
    path('api/get-latest-data/', views.get_latest_data, name='get-latest-data'),
    path('api/employees/', views.employee_list, name='employee_list'),
    path('api/create_employee/', views.create_employee, name='create_employee'),
    path('api/update_employee/<int:employee_id>/', views.update_employee, name='update_employee'),
    path('api/delete_employee/<int:employee_id>/', views.delete_employee, name='delete_employee'),
    path('api/cars/', views.car_list, name='car_list'),
    path('api/drivers/', views.driver_list, name='driver_list'),     
    path('api/car-driving-data/<int:car_id>/', views.get_car_driving_data, name='get_car_driving_data'),
    path('api/create_car/', views.create_car, name='create_car'),
    path('api/create_driver/', views.create_driver, name='create_driver'),
    path('api/customer-cars/<int:customer_id>/', views.customer_cars, name='customer_cars'),
    path('api/update_car/<int:car_id>/', views.update_car, name='update_car'),
    path('api/delete_car/<int:car_id>/', views.delete_car, name='delete_car'),
    path('api/update_driver/<int:driver_id>/', views.update_driver, name='update_driver'),
    path('api/delete_driver/<int:driver_id>/', views.delete_driver, name='delete_driver'),
]