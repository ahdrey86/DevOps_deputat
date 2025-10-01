from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

def api_root(request):
    html = """
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <title>Парламент РФ API</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background: #f4f4f9;
                color: #333;
                padding: 40px;
            }
            h1 {
                color: #4a148c;
            }
            ul {
                list-style: none;
                padding: 0;
            }
            li {
                margin: 8px 0;
            }
            a {
                text-decoration: none;
                color: #1e88e5;
                font-weight: bold;
            }
            a:hover {
                text-decoration: underline;
            }
            .container {
                max-width: 600px;
                margin: auto;
                background: #fff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 6px rgba(0,0,0,0.1);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>✅ Парламент РФ API запущен</h1>
            <p>Добро пожаловать! Ниже список доступных эндпоинтов:</p>
            <ul>
                <li><a href="/api/parties/">/api/parties/</a> – партии</li>
                <li><a href="/api/deputies/">/api/deputies/</a> – депутаты</li>
                <li><a href="/api/sessions/">/api/sessions/</a> – заседания</li>
                <li><a href="/api/votes/">/api/votes/</a> – голосования</li>
                <li><a href="/api/statistics/">/api/statistics/</a> – статистика</li>
                <li><a href="/api/auth/login/">/api/auth/login/</a> – вход</li>
                <li><a href="/api/auth/logout/">/api/auth/logout/</a> – выход</li>
                <li><a href="/api/auth/register/">/api/auth/register/</a> – регистрация</li>
            </ul>
        </div>
    </body>
    </html>
    """
    return HttpResponse(html)

urlpatterns = [
    path('', api_root, name='api-root'),
    path('admin/', admin.site.urls),
    path('api/', include('deputies.urls')),
]
