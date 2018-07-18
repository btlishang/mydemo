from django.db import models
from django.contrib.auth.models import User
from mptt.models import MPTTModel,TreeForeignKey
from ckeditor_uploader.fields import RichTextUploadingField
from ckeditor.fields import RichTextField
from django.urls import reverse

# Create your models here.

class Category(MPTTModel):

    name = models.CharField('新闻分类',max_length=100)
    parent = TreeForeignKey("self", blank=True, null=True, related_name="children",verbose_name='上级节点')

    def __str__(self):
        return self.name

    # class MPTTMeta:
    #     order_insertion_by = ['id']

    class Meta:
        verbose_name_plural = '文章分类'
        ordering = ['id']


class Content(models.Model):

    title = models.CharField('文章标题',max_length=70)
    body = RichTextUploadingField('文章内容')
    created_time = models.DateTimeField('创建时间',auto_now_add=True)
    modified_time = models.DateTimeField('更新时间',auto_now=True)
    excerpt = RichTextField('摘要',max_length=200, blank=True,config_name='custom')
    category = models.ForeignKey(Category,verbose_name='分类')
    author = models.ForeignKey(User,verbose_name='作者')
    picture_url = models.ImageField('标题图片',default='upload/1pic_hd.jpg', upload_to='upload', max_length=200)
    isshow = models.BooleanField('是否展示',default=False)

    def __str__(self):
        return self.title

    class Meta:
        verbose_name_plural = '文章列表'
        db_table = 'Content' # 重定义表名
        ordering = ['id']   # 以ID作为排序

    def get_absolute_url(self):
        return reverse('article:news', kwargs={'pk': self.pk})

class Banner(models.Model):

    title = models.CharField('标题',max_length=100)
    image = models.ImageField('轮播图',upload_to='banner', max_length=400)

    class Meta:
        verbose_name_plural = '轮播图列表'

    def __str__(self):
        return self.title