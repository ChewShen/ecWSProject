from django.contrib import admin
from django.contrib.auth.models import Group, User
from usersManagement.models import Profile
from allauth.socialaccount.models import SocialAccount
from allauth.socialaccount.admin import SocialAccountAdmin  # The default admin
from django.utils.html import format_html

from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

# Unregister default admin for Group and SocialAccount
admin.site.unregister(Group)
admin.site.unregister(SocialAccount)

# Inline admin for Profile model
class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False  # Optionally prevent deleting profiles from the User admin page
    verbose_name_plural = 'Profile'
    fields = ('phone_number', 'profile_pic')  # Include the fields you want from the Profile model

# Create a custom UserAdmin
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff')
    inlines = [ProfileInline]  # This will add the Profile fields to the User admin

# Unregister the default User admin
admin.site.unregister(User)
# Register the customized User admin
admin.site.register(User, UserAdmin)

# Create a custom admin for SocialAccount
class CustomSocialAccountAdmin(SocialAccountAdmin):
    list_display = ('user', 'get_full_name', 'get_email', 'provider')

    def get_full_name(self, obj):
        # Get full name from extra_data (first_name + last_name)
        first_name = obj.extra_data.get('given_name', '')
        last_name = obj.extra_data.get('family_name', '')
        return format_html(f"{first_name} {last_name}")
    
    get_full_name.short_description = 'Full Name'  # Column title
    
    def get_email(self, obj):
        # Get the email from extra_data
        return obj.extra_data.get('email', obj.user.email)  # Fallback to the user's email if not found
    
    get_email.short_description = 'Email'  # Column title

# Register the custom admin for SocialAccount
admin.site.register(SocialAccount, CustomSocialAccountAdmin)

# Register the Profile model (if you need it available for standalone editing)
admin.site.register(Profile)
