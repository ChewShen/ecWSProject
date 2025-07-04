import google.generativeai as genai
import os

# Set your API key (use environment variable for safety)
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

model = genai.GenerativeModel('gemini-2.5-flash')

chat = model.start_chat(history=[])

def ask_gemini(prompt):
    response = model.generate_content(prompt)
    return response.text


