# Generated by Django 5.1.7 on 2025-03-30 15:35

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('events', '0006_category_is_one_time_location_is_one_time'),
    ]

    operations = [
        migrations.AddField(
            model_name='category',
            name='event_cat_one',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='unique_category', to='events.event'),
        ),
        migrations.AddField(
            model_name='location',
            name='event_loc_one',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='unique_location', to='events.event'),
        ),
    ]
