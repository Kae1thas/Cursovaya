# Generated by Django 5.1.7 on 2025-03-30 11:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('events', '0003_alter_userprofile_role'),
    ]

    operations = [
        migrations.AddField(
            model_name='request',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
    ]
