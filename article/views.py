from django.shortcuts import render
from .models import Content,Category
from django.shortcuts import render,get_object_or_404


# Create your views here.

def IndexView(request):
    IntroduceList = Content.objects.filter(category_id=2,isshow=True)[0:9]
    context = {
        'IntroduceList' : IntroduceList
    }
    return render(request,'article/index.html',context=context)

def NewsView(request,pk):

    content = get_object_or_404(Content, pk=pk)

    return render(request, 'article/news.html', context={'content': content})