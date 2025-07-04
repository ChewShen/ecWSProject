from django.urls import path
from . import views
from .views import CustomLoginView

urlpatterns = [
    path('', views.home, name="home"),
    path('registerPage/', views.registerPage, name="registerPage"),
    path('loginPage/', views.loginPage, name="loginPage"),
    path('dashboard/', views.dashboard, name="dashboard"),
    path('dashboard/profilePage/', views.profilePage, name="profilePage"),
    path('accounts/login/', CustomLoginView.as_view(), name='account_login'),
    path('dashboard/fileSelection/', views.fileSelection, name="fileSelection"),
    path('dashboard/codeEditor/', views.codeEditor, name="codeEditor"),
    
    # <----chatbot---->
    path('dashboard/chat_sessions/new/', views.create_new_session, name='new_chat'),
    path('dashboard/chat_sessions/<int:session_id>/', views.chat_session_view, name='chat_session'),
    path('dashboard/chat_sessions/<int:session_id>/rename/', views.rename_session, name='rename_session'),
    path('dashboard/chat_sessions/<int:session_id>/delete/', views.delete_session, name='delete_session'),
    path('dashboard/chat_sessions/', views.chat_home, name='chat_home'),

    # <-----mermaid.js------>
    path('dashboard/mermaid-designer/', views.mermaid_designer, name='mermaid_designer'),

    path("dashboard/quickchat/ask/", views.quick_chat, name="quick_chat"),
]
