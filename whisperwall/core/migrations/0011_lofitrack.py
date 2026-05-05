from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0010_news'),
    ]

    operations = [
        migrations.CreateModel(
            name='LofiTrack',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('audio_file', models.FileField(upload_to='')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('is_published', models.BooleanField(default=True)),
            ],
        ),
    ]
