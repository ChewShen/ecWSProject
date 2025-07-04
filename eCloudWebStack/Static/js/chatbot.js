// Read dynamic URLs and CSRF token from template
const config = document.getElementById("chat-config");

const csrfToken = config.dataset.csrf;
const newChatUrl = config.dataset.newUrl;
const renameBaseUrl = config.dataset.renameUrl;
const deleteBaseUrl = config.dataset.deleteUrl;
const sessionBaseUrl = config.dataset.sessionUrl;

// Create new chat
document.getElementById("new-chat-btn").addEventListener("click", async () => {
  const response = await fetch(newChatUrl, {
    method: "POST",
    headers: {
      "X-CSRFToken": csrfToken,
      "Accept": "application/json"
    }
  });

  if (response.ok) {
    const data = await response.json();

    // Build new chat link
    const link = document.createElement("a");
    link.href = sessionBaseUrl.replace("0", data.id);
    link.className = "block flex-grow px-3 py-2 rounded hover:bg-gray-800 bg-gray-700 chat-title";
    link.textContent = data.title || "Untitled Chat";

    // Wrap link + buttons
    const wrapper = document.createElement("div");
    wrapper.className = "flex justify-between items-center group";
    wrapper.appendChild(link);
    wrapper.innerHTML += `
      <button class="text-sm text-gray-400 group-hover:text-white rename-btn" data-id="${data.id}" title="Rename">✏️</button>
      <button class="text-sm text-gray-400 group-hover:text-red-400 delete-btn" data-id="${data.id}" title="Delete">🗑️</button>
    `;

    document.getElementById("chat-sessions").prepend(wrapper);
    window.location.href = link.href;
  } else {
    alert("Failed to create chat.");
  }
});

// Rename chat
document.querySelectorAll('.rename-btn').forEach(button => {
  button.addEventListener('click', async () => {
    const id = button.dataset.id;
    const newTitle = prompt("Enter new name for this chat:");
    if (!newTitle) return;

    const renameUrl = renameBaseUrl.replace("0", id);

    try {
      const response = await fetch(renameUrl, {
        method: 'POST',
        headers: {
          "X-CSRFToken": csrfToken,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ title: newTitle })
      });

      const data = await response.json();

      if (response.ok && data.status === "ok") {
        const span = document.querySelector(`.chat-title[data-id="${id}"]`);
        if (span) span.textContent = data.title || newTitle;
      } else {
        alert("Rename failed: " + (data.error || "unknown error"));
      }
    } catch (err) {
      alert("Rename failed: " + err.message);
    }
  });
});

// Delete chat
document.querySelectorAll('.delete-btn').forEach(button => {
  button.addEventListener('click', async () => {
    const id = button.dataset.id;
    if (!confirm("Delete this chat?")) return;

    const deleteUrl = deleteBaseUrl.replace("0", id);

    try {
      const response = await fetch(deleteUrl, {
        method: 'POST',
        headers: {
          "X-CSRFToken": csrfToken
        }
      });

      const data = await response.json();

      if (response.ok && data.status === "ok") {
        const item = button.closest('.flex');
        if (item) item.remove();
        if (parseInt(config.dataset.sessionId) === parseInt(id)) {
          window.location.href = newChatUrl;
        }
      } else {
        alert("Delete failed: " + (data.error || "unknown error"));
      }
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  });
});

// Scroll to bottom on load
function scrollToBottom() {
  const chatBox = document.getElementById("chat-messages");
  if (chatBox) {
    chatBox.scrollTop = chatBox.scrollHeight;
  }
}
window.addEventListener("load", scrollToBottom);


// Handle chat submission via AJAX
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("chat-form");
  if (!form) return;

  const input = form.querySelector("input[name='prompt']");
  const messagesContainer = document.getElementById("chat-messages");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const userMessage = input.value.trim();
    if (!userMessage) return;

    // Show user's message immediately
    const userBubble = document.createElement("div");
    userBubble.className = "max-w-xl ml-auto text-right";
    userBubble.innerHTML = `
      <div class="bg-gray-200 p-3 rounded-lg shadow">
        <div class="prose max-w-full">${escapeHtml(userMessage)}</div>
      </div>
    `;
    messagesContainer.appendChild(userBubble);

    // Show typing indicator
    const typingBubble = document.createElement("div");
    typingBubble.className = "max-w-xl mr-auto text-left typing-indicator";
    typingBubble.innerHTML = `
      <div class="bg-blue-100 p-3 rounded-lg shadow">
        <div class="prose max-w-full italic text-gray-500">The assistant is typing...</div>
      </div>
    `;
    messagesContainer.appendChild(typingBubble);

    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // ✅ Let DOM render typing indicator first
    await new Promise(requestAnimationFrame);

    try {
      const response = await fetch(window.location.href, {
        method: "POST",
        headers: {
          "X-CSRFToken": getCSRFToken(),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          prompt: userMessage
        }),
      });

      const data = await response.json();

      typingBubble.remove();

      // Add model reply
      const modelBubble = document.createElement("div");
      modelBubble.className = "max-w-xl mr-auto text-left";
      modelBubble.innerHTML = `
        <div class="bg-blue-100 p-3 rounded-lg shadow">
          <div class="prose max-w-full">
            ${data.model_reply_html}
          </div>
        </div>
      `;
      messagesContainer.appendChild(modelBubble);

      // Optionally handle Mermaid Designer link
      if (data.mermaid_code) {
        const designerLink = document.createElement("a");
        designerLink.href = `/mermaid_designer/?code=${encodeURIComponent(data.mermaid_code)}`;
        designerLink.target = "_blank";
        designerLink.className = "bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition mt-4 inline-block";
        designerLink.textContent = "👉 View Diagram in Designer";
        messagesContainer.appendChild(designerLink);
      }

      // Re-run code highlighting if using highlight.js
      if (window.hljs) {
        document.querySelectorAll('#chat-messages pre code').forEach(el => {
          hljs.highlightElement(el);
        });
      }

      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      input.value = "";
    } catch (err) {
      typingBubble.remove();
      alert("Error: " + err);
    }
  });
});

function getCSRFToken() {
  return document.querySelector("[name=csrfmiddlewaretoken]").value;
}

function escapeHtml(text) {
  let div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
