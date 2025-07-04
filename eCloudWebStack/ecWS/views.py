from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render, redirect
from allauth.socialaccount.models import SocialAccount
import traceback

import markdown
from .forms import RegisterForm
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from django import forms
from .forms import RegisterForm, ProfileForm
from usersManagement.models import Profile
from .utils import model
from .models import ChatSession, Message


from django.contrib.auth.decorators import login_required

# Create your views here.
def home(request):
    # If the user is logged in and tries to log out
    if request.method == 'POST' and 'logout' in request.POST:
        logout(request)
        messages.success(request, "You have logged out successfully.")
        return redirect('home')  # Redirect back to the landing page (home.html)

    return render(request, 'home.html', {})


def registerPage(request):
    form = RegisterForm()
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            # Save the user first
            user = form.save()

            # Check if the profile already exists before creating one
            if not hasattr(user, 'profile'):  # If the user does not have a profile
                Profile.objects.create(user=user, phone_number="")  # Create profile with empty phone number

            # Authenticate and log the user in
            username = form.cleaned_data['username']
            password = form.cleaned_data['password1']
            user = authenticate(username=username, password=password)
            login(request, user)

            messages.success(request, "Les goooo")  # Success message
            return redirect('dashboard')  # Redirect to dashboard or wherever you want
        else:
            messages.error(request, "Registration failed. Please try again.")  # Error message
            return render(request, 'registerPage.html', {"form": form})
    else:
        return render(request, 'registerPage.html', {"form": form})

def loginPage(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)  # Log the user in
            messages.success(request, "Successfully logged in.")
            
            # If user is an admin, redirect to the admin dashboard
            if user.is_staff:  # Admin check
                return redirect('/dashboard/')  # Redirect admin to dashboard
                
            # For regular users, redirect to the user dashboard
            return redirect('/dashboard/')  # You can replace this with any URL for regular users

        else:
            # If the credentials are incorrect
            messages.error(request, "Email/Password are incorrect. Please try again.")
            return render(request, 'loginPage.html')
    
    else:
        return render(request, 'loginPage.html')

@login_required
def profilePage(request):
    user = request.user
    profile = user.profile

    if request.method == 'POST':
        # Save the User form (for first_name, last_name, and email)
        user.first_name = request.POST.get('first_name')
        user.last_name = request.POST.get('last_name')
        user.email = request.POST.get('email')
        user.save()  # Save changes to User

        # Save Profile form (for phone_number, profile_pic)
        form = ProfileForm(request.POST, request.FILES, instance=profile)
        if form.is_valid():
            form.save()  # Save changes to Profile

        messages.success(request, "Profile updated successfully!")
        return redirect('profilePage')  # Redirect after saving
    else:
        form = ProfileForm(instance=profile)

    return render(request, 'profilePage.html', {
        'form': form,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'phone_number': profile.phone_number,
    })




from allauth.account.views import LoginView

class CustomLoginView(LoginView):
    template_name = 'loginPage.html'

@login_required
def dashboard(request):
    email = request.user.email  # fallback if stored on User model

    try:
        social_account = SocialAccount.objects.get(user=request.user)
        extra_data = social_account.extra_data
        email = extra_data.get('email', email)  # prefer Google email if available
        first_name = extra_data.get('given_name', '')
        last_name = extra_data.get('family_name', '')
    except SocialAccount.DoesNotExist:
        first_name = ''
        last_name = ''

    return render(request, 'dashboard.html', {
        'email': email,
        'first_name': first_name,
        'last_name': last_name,
    })

from .models import UserFile

@login_required
def fileSelection(request):
    if request.method == 'POST' and 'file' in request.FILES:
        uploaded_file = request.FILES['file']
        file_content = uploaded_file.read().decode('utf-8')
        
        # Save the file content in the database for the logged-in user
        user_file = UserFile.objects.create(
            user=request.user,
            file_name=uploaded_file.name,
            file_content=file_content
        )
        
        # Redirect to codeEditor page with the user's file
        return redirect('codeEditor')

    # Get the user's files (if any) to show in the file selection page
    user_files = UserFile.objects.filter(user=request.user)
    return render(request, 'fileSelection.html', {'user_files': user_files})


def codeEditor(request):
    # Check if the user has selected a file
    user_file = UserFile.objects.filter(user=request.user).first()
    if user_file:
        file_content = user_file.file_content
    else:
        file_content = ""

    return render(request, 'codeEditor.html', {'file_content': file_content})




# <-----------Chat bot-------------------->
from django.views.decorators.csrf import csrf_exempt
import json
from urllib.parse import quote_plus
import re


@login_required
def chat_session_view(request, session_id):
    chat_session = get_object_or_404(ChatSession, pk=session_id, user=request.user)
    messages = chat_session.messages.order_by('timestamp')

    chat = model.start_chat(history=[
        {
            "role": "user",
            "parts": [
                "You are a helpful programming assistant."
                "When you generate Mermaid diagrams, always wrap all node labels in quotes. "
                "For example: A[\"Start Function: add (a, b)\"] instead of A[Start Function: add (a, b)]. "
                "This prevents errors when rendering diagrams with parentheses, commas, or special characters. "
                "Always follow this rule every time you produce Mermaid code. "
                "Only answer code-related or technical questions. "
                "If the user asks anything unrelated to coding, politely respond that you're only here to assist with programming topics."

            ]
        },
        *[
            {"role": m.role, "parts": [m.content]}
            for m in messages
        ]
    ])

    mermaid_code = None

    if request.method == "POST":
        user_input = request.POST.get("prompt")
        if user_input:
            response = chat.send_message(user_input)
            model_reply = response.text

            Message.objects.create(session=chat_session, role="user", content=user_input)
            Message.objects.create(session=chat_session, role="model", content=model_reply)

            if chat_session.messages.filter(role="user").count() == 1:
                chat_session.title = " ".join(user_input.split()[:5]) + "..."
                chat_session.save()

            def extract_mermaid_block(text):
                match = re.search(r"```mermaid\n(.*?)```", text, re.DOTALL)
                if match:
                    return match.group(1).strip()
                match = re.search(r'<pre class="mermaid">(.*?)</pre>', text, re.DOTALL)
                if match:
                    return match.group(1).strip()
                return None

            mermaid_code = extract_mermaid_block(model_reply)
            request.session["mermaid_code"] = mermaid_code

            model_reply_html = markdown.markdown(
                model_reply,
                extensions=["fenced_code", "codehilite"]
            )

            if request.headers.get("x-requested-with") == "XMLHttpRequest":
                # ✅ This is AJAX — return JSON
                return JsonResponse({
                    "model_reply": model_reply,
                    "model_reply_html": model_reply_html,
                    "mermaid_code": mermaid_code,
                })
            else:
                # ✅ Not AJAX — fallback to redirect for normal page load
                return redirect('chat_session', session_id=session_id)

    # ⏪ Restore mermaid code after redirect
    if "mermaid_code" in request.session:
        mermaid_code = request.session.pop("mermaid_code")

    safe_code = quote_plus(mermaid_code) if mermaid_code else ""
    request.session["last_chat_session_id"] = session_id

    for m in messages:
        if m.role == "model":
            m.rendered = markdown.markdown(m.content, extensions=["fenced_code", "codehilite"])
        else:
            m.rendered = m.content

    return render(request, 'chat_session.html', {
        "session": chat_session,
        "chat_messages": messages,
        "sessions": ChatSession.objects.filter(user=request.user).order_by('-created_at'),
        "mermaid_code": mermaid_code,
        "safe_code": safe_code,
    })


@login_required
def create_new_session(request):
    session = ChatSession.objects.create(user=request.user, title="New Chat")

    Message.objects.create(
        session=session,
        role="model",
        content="Hi there! 👋 Do you need help with something?"
    )

    if request.headers.get('Accept') == 'application/json':
        return JsonResponse({"id": session.id, "title": session.title})
    
    return redirect('chat_session', session_id=session.id)


@login_required
@csrf_exempt  # or use proper CSRF handling
def rename_session(request, session_id):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            new_title = data.get("title", "").strip()

            if not new_title:
                return JsonResponse({"status": "error", "error": "Empty title"}, status=400)

            session = get_object_or_404(ChatSession, pk=session_id, user=request.user)
            session.title = new_title
            session.save()

            return JsonResponse({"status": "ok", "title": new_title})

        except Exception as e:
            return JsonResponse({"status": "error", "error": str(e)}, status=500)

    return JsonResponse({"status": "error", "error": "Invalid method"}, status=405)

@login_required
@csrf_exempt
def delete_session(request, session_id):
    if request.method == "POST":
        try:
            session = get_object_or_404(ChatSession, pk=session_id, user=request.user)
            session.delete()
            return JsonResponse({"status": "ok"})
        except ChatSession.DoesNotExist:
            return JsonResponse({"status": "error", "error": "Session not found"}, status=404)
        except Exception as e:
            return JsonResponse({"status": "error", "error": str(e)}, status=500)

    return JsonResponse({"status": "error", "error": "Invalid method"}, status=405)


@login_required
def chat_home(request):
    # Try to redirect to last used session
    last_session_id = request.session.get("last_chat_session_id")

    if last_session_id:
        exists = ChatSession.objects.filter(id=last_session_id, user=request.user).exists()
        if exists:
            return redirect('chat_session', session_id=last_session_id)

    # Fallback to latest or new
    latest = ChatSession.objects.filter(user=request.user).order_by('-created_at').first()
    if latest:
        return redirect('chat_session', session_id=latest.id)
    return redirect('new_chat')




# <----------mermaid.js---------------->


from urllib.parse import unquote_plus

def mermaid_designer(request):
    code = request.GET.get("code", "")
    decoded_code = unquote_plus(code)
    return render(request, "mermaid_designer.html", {
        "diagram_code": decoded_code
    })



from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
import json

import logging
from google.generativeai import GenerativeModel
# Initialize a logger
logger = logging.getLogger(__name__)

@login_required
@csrf_exempt
def quick_chat(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            prompt = data.get("prompt", "").strip()

            if not prompt:
                return JsonResponse({"error": "Empty input"}, status=400)

            # Initialize the model and chat
            model = GenerativeModel("gemini-2.0-flash")
            chat = model.start_chat(history=[])

            # Get the response from the bot
            response = chat.send_message(prompt)
            answer = response.text.strip()

            # Convert the bot's response to markdown (same as multi-session)
            answer_rendered = markdown.markdown(answer, extensions=["fenced_code", "codehilite"])

            # Save the chat history in the session
            chat_history = request.session.get("quick_chat_history", [])
            chat_history.append({"role": "user", "user": prompt})
            chat_history.append({"role": "bot", "bot": answer_rendered})
            request.session["quick_chat_history"] = chat_history
            request.session.modified = True

            return JsonResponse({"reply": answer_rendered})

        except json.JSONDecodeError as e:
            logger.error(f"JSON Decode Error: {str(e)}")
            return JsonResponse({"error": "Invalid JSON format."}, status=400)

        except Exception as e:
            logger.error(f"Error occurred while processing request: {str(e)}")
            return JsonResponse({"error": f"Server error: {str(e)}"}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=405)