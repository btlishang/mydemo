# Author: lishang

from django.conf.urls import url
from .import views

app_name='article'
urlpatterns = [
    url(r'^$', views.IndexView, name='index'),
    url(r'^news/(?P<pk>[0-9]+)/$', views.NewsView, name='news'),
    url(r'^category/(?P<pk>[0-9]+)/$',views.ListView,name='category'),

]