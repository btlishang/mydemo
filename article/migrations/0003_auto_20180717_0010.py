# -*- coding: utf-8 -*-
# Generated by Django 1.11.4 on 2018-07-16 16:10
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('article', '0002_auto_20180716_0051'),
    ]

    operations = [
        migrations.CreateModel(
            name='Banner',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=100, verbose_name='标题')),
                ('image', models.ImageField(max_length=400, upload_to='banner', verbose_name='轮播图')),
            ],
            options={
                'verbose_name_plural': '轮播图列表',
            },
        ),
        migrations.AddField(
            model_name='content',
            name='isshow',
            field=models.BooleanField(default=False, verbose_name='是否展示'),
        ),
        migrations.AlterField(
            model_name='content',
            name='picture_url',
            field=models.ImageField(default='upload/1pic_hd.jpg', max_length=200, upload_to='upload', verbose_name='标题图片'),
        ),
    ]