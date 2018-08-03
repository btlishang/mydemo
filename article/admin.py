from django.contrib import admin
from django_mptt_admin.admin import DjangoMpttAdmin
from .models import Category,Content,Banner,Img

# Register your models here.

@admin.register(Category)
class Categoryadmin(DjangoMpttAdmin):
    list_display = ('id','name')


@admin.register(Content)
class Contentadmin(admin.ModelAdmin):

    def show(self):
        if self.isshow:
            return '是'
        else:
            return '否'

    list_display = ['id','title','created_time','modified_time','category','author','isshow']

    # 设置需要添加<a>标签的字段
    list_display_links = ['title']

    list_per_page = 20  # 控制每页显示的对象数量，默认是100

    list_filter = ['category']



# 自定义管理站点的名称和URL标题
admin.site.site_header = '网站管理'
admin.site.site_title = '博客后台管理'


@admin.register(Banner)
class Banneradmin(admin.ModelAdmin):


    def category(self):
        if self.category:
            return '首页'
        else:
            return '其他页'

    list_display = ['title','image',category,'isshow']
    list_display_links = ('title',)

@admin.register(Img)
class Imgadmin(admin.ModelAdmin):

    list_display = ['id', 'image','isshow']
    list_display_links = ('id',)