const socket = io();
let username, secretKey;

const joinBtn = document.getElementById("joinBtn");
const chatContainer = document.getElementById("chatContainer");
const setup = document.getElementById("setup");
const messages = document.getElementById("messages");
const sendBtn = document.getElementById("sendBtn");
const messageInput = document.getElementById("messageInput");
const roomInfo = document.getElementById("roomInfo");

joinBtn.addEventListener("click", () => {
  username = document.getElementById("username").value.trim();
  secretKey = document.getElementById("secretKey").value.trim();

  if (!username || !secretKey) return alert("Please enter both name and secret key!");

  socket.emit("joinRoom", username);
  setup.classList.add("hidden");
  chatContainer.classList.remove("hidden");
  roomInfo.textContent = `Connected as ${username}`;
});

sendBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  const message = messageInput.value.trim();
  if (!message) return;

  // Encrypt using AES
  const encrypted = CryptoJS.AES.encrypt(message, secretKey).toString();

  socket.emit("chatMessage", {
    user: username,
    encrypted,
    decrypted: message,
  });

  messageInput.value = "";
}

// Receive messages
socket.on("message", (data) => {
  const isYou = data.user === username;

  // Decrypt using same secret key
  let decryptedText;
  try {
    const bytes = CryptoJS.AES.decrypt(data.encrypted, secretKey);
    decryptedText = bytes.toString(CryptoJS.enc.Utf8);
  } catch (err) {
    decryptedText = "❌ Decryption Failed (wrong key)";
  }

  const msgDiv = document.createElement("div");
  msgDiv.classList.add("msg", isYou ? "you" : "other");
  msgDiv.innerHTML = `
    <strong>${data.user}:</strong> ${decryptedText}<br>
    <span class="encText">Encrypted: ${data.encrypted}</span>
  `;
  messages.appendChild(msgDiv);
  messages.scrollTop = messages.scrollHeight;
});

socket.on("userConnected", (user) => {
  const info = document.createElement("div");
  info.classList.add("encText");
  info.textContent = `🟢 ${user} joined the chat`;
  messages.appendChild(info);
});

socket.on("userDisconnected", (user) => {
  const info = document.createElement("div");
  info.classList.add("encText");
  info.textContent = `🔴 ${user} left the chat`;
  messages.appendChild(info);
});
