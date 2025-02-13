# Generated by Django 5.1.5 on 2025-01-22 21:46

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Company',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('company_id', models.BigIntegerField()),
                ('company_name', models.TextField()),
                ('number_of_cars', models.IntegerField()),
                ('contact_number', models.IntegerField()),
                ('email', models.EmailField(max_length=254)),
                ('location', models.TextField()),
                ('password', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='Customer',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('customr_id', models.BigIntegerField(unique=True)),
                ('name', models.TextField(blank=True, null=True)),
                ('gender', models.IntegerField(choices=[(0, 'Female'), (1, 'Male')])),
                ('phone_number', models.IntegerField(unique=True)),
                ('location', models.TextField()),
                ('password', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='DrivingData',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('speed', models.FloatField()),
                ('acceleration', models.FloatField()),
                ('harsh_braking', models.FloatField()),
                ('swerving', models.FloatField()),
                ('accident_detection', models.IntegerField()),
                ('bumps', models.FloatField()),
                ('drilling', models.FloatField()),
                ('timestamp', models.FloatField()),
            ],
        ),
        migrations.CreateModel(
            name='Driver',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('driver_id', models.BigIntegerField()),
                ('name', models.TextField()),
                ('gender', models.IntegerField(choices=[(0, 'Female'), (1, 'Male')])),
                ('phone_number', models.IntegerField(unique=True)),
                ('company', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.company')),
            ],
        ),
        migrations.CreateModel(
            name='Car',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('car_id', models.BigIntegerField()),
                ('model_of_car', models.TextField()),
                ('type_of_car', models.TextField()),
                ('plate_number', models.IntegerField(unique=True)),
                ('release_year_car', models.TextField()),
                ('state_of_car', models.CharField(choices=[('New', 'New'), ('Used', 'Used'), ('Damaged', 'Damaged')], max_length=7)),
                ('company', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='api.company')),
                ('customer', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='api.customer')),
                ('driving_data', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='api.drivingdata')),
            ],
        ),
    ]
