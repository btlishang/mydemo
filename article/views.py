from django.shortcuts import render
from .models import Content,Category,Img
from django.shortcuts import render,get_object_or_404
from django.views.generic import ListView,DetailView
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger



# Create your views here.

def IndexView(request):

    IntroduceList = Content.objects.filter(category_id=8,isshow=True)[0:9] # 首页展示活动动态9条
    ShowList = Content.objects.filter(category_id=3,isshow=True)[0:2] # 首页展示本届风采2条
    ShowImg = Img.objects.filter(isshow=True)[0:2] # 首页展示往届回顾两条
    ShowQue = Content.objects.filter(category_id=5,isshow=True)[0:6]
    ShowWell = Content.objects.filter(category_id=6,isshow=True)[0:4]

    context = {
        'IntroduceList' : IntroduceList,
        'ShowList': ShowList,
        'ShowImg' : ShowImg,
        'ShowQue' : ShowQue,
        'ShowWell' : ShowWell
    }
    return render(request,'article/index.html',context=context)

def NewsView(request,pk):

    content = get_object_or_404(Content, pk=pk)
    context = {
        'content' : content
    }

    return render(request, 'article/news.html', context=context)

def ListView(request,pk):

    Cate = get_object_or_404(Category,pk=pk)
    Info = get_object_or_404(Content,pk=pk)
    ContentList = Content.objects.filter(category=Cate).order_by('-created_time')

    pageinator = Paginator(ContentList,5) # 每页显示5篇文章
    page = request.GET.get('page')

    try:
        contacts = pageinator.page(page)
    except PageNotAnInteger:
        contacts = pageinator.page(1)
    except EmptyPage:
        contacts = pageinator.page(pageinator.num_pages)

    content = {'Info':Info,'ContentList':contacts}

    return render(request,'article/show.html',context=content)
