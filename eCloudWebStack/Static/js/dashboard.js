function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('collapsed');
}

function openFileSmart() {
  const fileName = localStorage.getItem("openFileName");
  const fileContent = localStorage.getItem("openFileContent");

  if (fileName && fileContent) {
    window.location.href = "/dashboard/codeEditor";
  } else {
    window.location.href = "/dashboard/fileSelection";
  }
}

// ✅ Make the toggleQuickChat function globally accessible
// Toggle visibility of Quick Chat
window.toggleQuickChat = function () {
  const box = document.getElementById("quick-chat-box");
  box.style.display = box.style.display === "none" ? "block" : "none";
};

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("quick-chat-form");
  const input = document.getElementById("quick-chat-input");
  const messages = document.getElementById("quick-chat-messages");

  // Load chat history from localStorage
  const chatHistory = JSON.parse(localStorage.getItem('quick_chat_history')) || [];

  // Render the saved chat history on page load
  chatHistory.forEach(message => {
    const messageDiv = document.createElement('div');
    if (message.role === 'user') {
      messageDiv.classList.add("text-end", "text-primary", "mb-1");
      messageDiv.innerText = message.user;
    } else {
      messageDiv.classList.add("text-start", "text-dark", "mb-2");
      messageDiv.innerHTML = `<strong>Bot:</strong> ${message.bot}`;
    }
    messages.appendChild(messageDiv);
  });

  // Handle form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();  // Prevent form submission

    const prompt = input.value.trim();
    if (!prompt) return;

    const csrfToken = document.querySelector('input[name=csrfmiddlewaretoken]').value;

    // Show user message in chat
    messages.innerHTML += `<div class="text-end text-primary mb-1">${prompt}</div>`;
    input.value = ""; // Clear input field

    // Show thinking message
    const thinkingMessage = document.createElement("div");
    thinkingMessage.classList.add("text-center", "text-muted");
    thinkingMessage.innerHTML = "Bot is typing...";
    messages.appendChild(thinkingMessage);
    messages.scrollTop = messages.scrollHeight;

    try {
      // Make POST request to backend
      const res = await fetch("/dashboard/quickchat/ask/", {
        method: "POST",
        headers: {
          "X-CSRFToken": csrfToken,  // Pass CSRF token
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt })
      });

      // Check if the response is successful
      if (!res.ok) {
        throw new Error(`Server responded with status ${res.status}`);
      }

      const data = await res.json();

      // Remove thinking message
      thinkingMessage.remove();

      // Handle the response from the bot and render as HTML
      if (data.reply) {
        messages.innerHTML += `<div class="text-start text-dark mb-2"><strong>Bot:</strong> ${data.reply}</div>`;
        messages.scrollTop = messages.scrollHeight;

        // Save the chat history
        chatHistory.push({ role: 'user', user: prompt });
        chatHistory.push({ role: 'bot', bot: data.reply });

        // Save chat history to localStorage
        localStorage.setItem('quick_chat_history', JSON.stringify(chatHistory));
      } else {
        messages.innerHTML += `<div class="text-start text-danger mb-2">❌ No response received.</div>`;
      }
    } catch (err) {
      // Handle fetch or JSON parsing errors
      messages.innerHTML += `<div class="text-start text-danger mb-2">❌ Error: ${err.message}</div>`;
    }
  });

  // Handle clear chat button
  const clearChatButton = document.getElementById("clear-chat-btn");
  if (clearChatButton) {
    clearChatButton.addEventListener("click", () => {
      // Clear localStorage and chat window
      localStorage.removeItem("quick_chat_history");
      messages.innerHTML = "";
    });
  }
});


