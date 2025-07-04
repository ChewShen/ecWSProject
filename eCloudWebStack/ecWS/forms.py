from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from django.core.exceptions import ValidationError
from django import forms
from usersManagement.models import Profile

                            
class RegisterForm(UserCreationForm):
    email = forms.EmailField(widget=forms.EmailInput(attrs={'class':'form-control'}))
    username = forms.CharField(max_length=50, widget=forms.TextInput(attrs={'class':'form-control'}))
	
    class Meta:
        model = User
        fields = ('username','email', 'password1', 'password2')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Add bootstrap classes and aria attributes here:
        self.fields['username'].widget.attrs.update({'class': 'form-control', 'placeholder': 'name', "id": "inputUsername", "name":"username", "type":"username"})

        self.fields['email'].widget.attrs.update({'class': 'form-control', 'placeholder': 'name@example.com',"type":"email", "name":"email", "id":"inputEmail"})

         
        self.fields['password1'].widget.attrs.update({
        "type":"password",
        "name":"password1",
        'class': 'form-control',
        'aria-describedby': 'passwordHelpBlock',
        'id': 'inputPassword'
        })

        self.fields['password2'].widget.attrs.update({
        "name":"password2",
        "type":"password",
        'class': 'form-control',
        'aria-describedby': 'confirmPasswordHelpBlock',
        'id': 'inputConfirmPassword'
        })

        def clean_email(self):
            email = self.cleaned_data.get('email')
            if User.objects.filter(email=email).exists():
                raise ValidationError("This email address is already taken.")
            return email

class ProfileForm(forms.ModelForm):
    phone_number = forms.CharField(
        max_length=15,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )
    profile_pic = forms.ImageField(
        required=False,
        widget=forms.FileInput(attrs={'class': 'form-control'})
    )

    class Meta:
        model = Profile
        fields = ['phone_number', 'profile_pic']