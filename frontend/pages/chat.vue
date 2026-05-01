<template>
  <div class="chat-page">
    <!-- Session Sidebar -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <h3 v-if="!sidebarCollapsed">Chat History</h3>
        <button @click="sidebarCollapsed = !sidebarCollapsed" class="collapse-btn">
          {{ sidebarCollapsed ? '▶' : '◀' }}
        </button>
      </div>

      <button @click="startNewChat" class="new-chat-btn" v-if="!sidebarCollapsed">
        <span class="plus-icon">+</span> New Chat
      </button>

      <div v-if="isLoadingSessions && !sidebarCollapsed" class="sidebar-loading">
        <div class="skeleton-item" v-for="i in 4" :key="i"></div>
      </div>

      <div class="sessions-list" v-if="!sidebarCollapsed">
        <button
          v-for="session in sessions"
          :key="session.sessionId"
          @click="loadSession(session.sessionId)"
          :class="{ active: currentSessionId === session.sessionId }"
          class="session-item"
        >
          <div class="session-name">💬 {{ session.name }}</div>
          <div class="session-time">{{ formatTime(session.lastMessageAt) }}</div>
          <button
            @click.stop="deleteSession(session.sessionId)"
            class="delete-session-btn"
            title="Delete session"
          >×</button>
        </button>
      </div>
    </aside>

    <!-- Chat Main -->
    <main class="chat-main">
      <div class="chat-header">
        <h2>🤖 RentPi Assistant</h2>
        <p class="chat-subtitle">Ask me about products, availability, trends, and more</p>
      </div>

      <!-- Messages -->
      <div class="messages-container" ref="messagesContainer">
        <div v-if="messages.length === 0 && !isLoadingHistory" class="empty-chat">
          <div class="empty-icon">🏠</div>
          <h3>Welcome to RentPi Assistant!</h3>
          <p>I can help you with:</p>
          <div class="suggestion-chips">
            <button @click="sendSuggestion('Which category has the most rentals?')" class="chip">📊 Most rented category</button>
            <button @click="sendSuggestion('What products are trending today?')" class="chip">🔥 Trending products</button>
            <button @click="sendSuggestion('When was the peak rental period in 2024?')" class="chip">📈 Peak rental periods</button>
            <button @click="sendSuggestion('Is product 42 available from 2024-03-01 to 2024-03-14?')" class="chip">📅 Check availability</button>
          </div>
        </div>

        <div v-if="isLoadingHistory" class="loading-history">
          <div class="skeleton-msg" v-for="i in 3" :key="i" :class="i % 2 === 0 ? 'sk-left' : 'sk-right'"></div>
        </div>

        <div
          v-for="(msg, idx) in messages"
          :key="idx"
          class="message"
          :class="msg.role === 'user' ? 'user-msg' : 'assistant-msg'"
        >
          <div class="msg-avatar">
            {{ msg.role === 'user' ? '👤' : '🤖' }}
          </div>
          <div class="msg-bubble">
            <div class="msg-content" v-html="formatMessage(msg.content)"></div>
            <div class="msg-time">{{ formatTime(msg.timestamp) }}</div>
          </div>
        </div>

        <!-- Typing indicator -->
        <div v-if="isTyping" class="message assistant-msg">
          <div class="msg-avatar">🤖</div>
          <div class="msg-bubble typing-bubble">
            <div class="typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Input -->
      <div class="chat-input-area">
        <div class="input-wrapper">
          <input
            v-model="inputMessage"
            @keydown.enter="sendMessage"
            :disabled="isTyping"
            placeholder="Ask about products, availability, trends..."
            class="chat-input"
            ref="chatInput"
          />
          <button
            @click="sendMessage"
            :disabled="isTyping || !inputMessage.trim()"
            class="send-btn"
          >
            <span v-if="isTyping" class="spinner"></span>
            <span v-else>➤</span>
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { baseHandle } from '@/services/baseHandle.js';
import API_CONFIG from '@/index.js';

definePageMeta({ layout: 'default' });

const sessions = ref([]);
const messages = ref([]);
const inputMessage = ref('');
const currentSessionId = ref('');
const isTyping = ref(false);
const isLoadingSessions = ref(false);
const isLoadingHistory = ref(false);
const sidebarCollapsed = ref(false);
const messagesContainer = ref(null);
const chatInput = ref(null);

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatMessage(content) {
  if (!content) return '';
  const rawHtml = marked.parse(content);
  if (typeof window !== 'undefined' && DOMPurify) {
    return DOMPurify.sanitize(rawHtml);
  }
  return rawHtml;
}

async function scrollToBottom() {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
}

async function loadSessions() {
  try {
    isLoadingSessions.value = true;
    const data = await baseHandle.makeRequest({ method: 'GET', url: API_CONFIG.ENDPOINTS.CHAT.SESSIONS });
    sessions.value = data.sessions || [];
  } catch (e) {
    console.error('Failed to load sessions:', e);
    sessions.value = [];
  } finally {
    isLoadingSessions.value = false;
  }
}

async function loadSession(sessionId) {
  try {
    isLoadingHistory.value = true;
    currentSessionId.value = sessionId;
    const url = API_CONFIG.ENDPOINTS.CHAT.HISTORY.replace(':sessionId', sessionId);
    const data = await baseHandle.makeRequest({ method: 'GET', url });
    messages.value = data.messages || [];
    await scrollToBottom();
  } catch (e) {
    console.error('Failed to load session:', e);
    messages.value = [];
  } finally {
    isLoadingHistory.value = false;
  }
}

function startNewChat() {
  currentSessionId.value = generateUUID();
  messages.value = [];
  nextTick(() => chatInput.value?.focus());
}

async function deleteSession(sessionId) {
  try {
    const url = API_CONFIG.ENDPOINTS.CHAT.DELETE.replace(':sessionId', sessionId);
    await baseHandle.makeRequest({ method: 'DELETE', url });
    sessions.value = sessions.value.filter(s => s.sessionId !== sessionId);
    if (currentSessionId.value === sessionId) {
      startNewChat();
    }
  } catch (e) {
    console.error('Failed to delete session:', e);
  }
}

async function sendMessage() {
  const msg = inputMessage.value.trim();
  if (!msg || isTyping.value) return;

  if (!currentSessionId.value) {
    currentSessionId.value = generateUUID();
  }

  // Add user message to UI immediately
  messages.value.push({
    role: 'user',
    content: msg,
    timestamp: new Date().toISOString(),
  });
  inputMessage.value = '';
  isTyping.value = true;
  await scrollToBottom();

  try {
    const data = await baseHandle.makeRequest({
      method: 'POST',
      url: API_CONFIG.ENDPOINTS.CHAT.SEND,
      data: {
        sessionId: currentSessionId.value,
        message: msg,
      },
    });

    messages.value.push({
      role: 'assistant',
      content: data.reply,
      timestamp: new Date().toISOString(),
    });

    // Refresh sessions list
    await loadSessions();
  } catch (e) {
    console.error('Failed to send message:', e);
    messages.value.push({
      role: 'assistant',
      content: 'Sorry, I encountered an error. Please try again.',
      timestamp: new Date().toISOString(),
    });
  } finally {
    isTyping.value = false;
    await scrollToBottom();
    nextTick(() => chatInput.value?.focus());
  }
}

function sendSuggestion(text) {
  inputMessage.value = text;
  sendMessage();
}

onMounted(async () => {
  await loadSessions();
  startNewChat();
});

watch(messages, scrollToBottom, { deep: true });
</script>

<style scoped>
.chat-page {
  display: flex;
  height: calc(100vh - 80px);
  overflow: hidden;
}

/* ── Sidebar ── */
.sidebar {
  width: 300px;
  min-width: 300px;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border-right: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  overflow: hidden;
}

.sidebar.collapsed {
  width: 48px;
  min-width: 48px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--glass-border);
}

.sidebar-header h3 {
  margin: 0;
  font-size: 16px;
  color: var(--text-main);
  white-space: nowrap;
}

.collapse-btn {
  background: transparent;
  border: none;
  color: var(--text-dim);
  font-size: 14px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s;
}

.collapse-btn:hover {
  background: rgba(255,255,255,0.08);
  color: var(--neon-cyan);
}

.new-chat-btn {
  margin: 12px 16px;
  padding: 12px;
  background: transparent;
  border: 1px dashed var(--neon-cyan);
  border-radius: 12px;
  color: var(--neon-cyan);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.new-chat-btn:hover {
  background: rgba(34, 211, 238, 0.1);
  box-shadow: 0 0 12px var(--neon-cyan-glow);
}

.plus-icon {
  font-size: 18px;
  font-weight: 800;
}

.sidebar-loading {
  padding: 16px;
}

.skeleton-item {
  height: 60px;
  background: rgba(255,255,255,0.03);
  border-radius: 12px;
  margin-bottom: 8px;
  animation: pulse 1.5s ease-in-out infinite;
}

.sessions-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.session-item {
  width: 100%;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 12px;
  padding: 12px 14px;
  margin-bottom: 4px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
  position: relative;
  color: var(--text-main);
}

.session-item:hover {
  background: rgba(255,255,255,0.05);
  border-color: var(--glass-border);
}

.session-item.active {
  background: rgba(34, 211, 238, 0.08);
  border-color: var(--neon-cyan);
}

.session-name {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 24px;
}

.session-time {
  font-size: 11px;
  color: var(--text-dim);
  margin-top: 4px;
}

.delete-session-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: var(--text-dim);
  font-size: 18px;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;
  padding: 2px 6px;
  border-radius: 4px;
}

.session-item:hover .delete-session-btn {
  opacity: 1;
}

.delete-session-btn:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

/* ── Chat Main ── */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.chat-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--glass-border);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
}

.chat-header h2 {
  margin: 0;
  font-size: 20px;
  color: var(--text-main);
}

.chat-subtitle {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--text-dim);
}

/* ── Messages ── */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.empty-chat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  text-align: center;
  padding: 40px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  filter: drop-shadow(0 0 20px rgba(34, 211, 238, 0.3));
}

.empty-chat h3 {
  font-size: 24px;
  color: var(--text-main);
  margin-bottom: 8px;
}

.empty-chat > p {
  color: var(--text-dim);
  margin-bottom: 24px;
}

.suggestion-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  max-width: 600px;
}

.chip {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 10px 18px;
  font-size: 13px;
  color: var(--text-main);
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: var(--glass-blur);
}

.chip:hover {
  border-color: var(--neon-cyan);
  color: var(--neon-cyan);
  box-shadow: 0 0 12px var(--neon-cyan-glow);
  transform: translateY(-2px);
}

.loading-history {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 0;
}

.skeleton-msg {
  height: 50px;
  background: rgba(255,255,255,0.03);
  border-radius: 16px;
  animation: pulse 1.5s ease-in-out infinite;
}

.sk-right { margin-left: auto; width: 60%; }
.sk-left { margin-right: auto; width: 70%; }

/* ── Message Bubbles ── */
.message {
  display: flex;
  gap: 10px;
  max-width: 80%;
  animation: fadeIn 0.3s ease;
}

.user-msg {
  margin-left: auto;
  flex-direction: row-reverse;
}

.assistant-msg {
  margin-right: auto;
}

.msg-avatar {
  font-size: 24px;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.msg-bubble {
  padding: 14px 18px;
  border-radius: 20px;
  position: relative;
  line-height: 1.5;
  font-size: 14px;
}

.user-msg .msg-bubble {
  background: linear-gradient(135deg, rgba(34, 211, 238, 0.2), rgba(34, 211, 238, 0.08));
  border: 1px solid rgba(34, 211, 238, 0.3);
  border-bottom-right-radius: 6px;
  color: var(--text-main);
}

.assistant-msg .msg-bubble {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-bottom-left-radius: 6px;
  color: var(--text-main);
}

.msg-content {
  word-break: break-word;
}

.msg-content :deep(code) {
  background: rgba(255,255,255,0.08);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 13px;
  font-family: 'JetBrains Mono', monospace;
}

.msg-content :deep(strong) {
  color: var(--neon-cyan);
}

.msg-time {
  font-size: 10px;
  color: var(--text-dim);
  margin-top: 6px;
  text-align: right;
}

/* ── Typing Indicator ── */
.typing-bubble {
  padding: 14px 24px;
}

.typing-indicator {
  display: flex;
  gap: 5px;
  align-items: center;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: var(--neon-cyan);
  border-radius: 50%;
  animation: bounce 1.4s infinite;
  opacity: 0.6;
}

.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

/* ── Input Area ── */
.chat-input-area {
  padding: 16px 24px;
  border-top: 1px solid var(--glass-border);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
}

.input-wrapper {
  display: flex;
  gap: 12px;
  max-width: 900px;
  margin: 0 auto;
}

.chat-input {
  flex: 1;
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 14px 20px;
  color: var(--text-main);
  font-size: 15px;
  outline: none;
  transition: all 0.2s;
}

.chat-input:focus {
  border-color: var(--neon-cyan);
  box-shadow: 0 0 12px var(--neon-cyan-glow);
}

.chat-input:disabled {
  opacity: 0.5;
}

.send-btn {
  width: 48px;
  height: 48px;
  background: var(--neon-cyan);
  border: none;
  border-radius: 14px;
  color: var(--bg-secondary);
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 0 20px var(--neon-cyan-glow);
}

.send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top-color: var(--bg-secondary);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

/* ── Animations ── */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-6px); }
}

@keyframes pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.15; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .sidebar {
    width: 48px;
    min-width: 48px;
  }

  .sidebar:not(.collapsed) {
    position: absolute;
    width: 280px;
    min-width: 280px;
    z-index: 100;
    height: calc(100vh - 80px);
    box-shadow: 4px 0 30px rgba(0,0,0,0.5);
  }

  .message {
    max-width: 90%;
  }
}
</style>
