import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import CaptureOverlay from './CaptureOverlay';
import { parsePageContent } from './utils/parsePage';
import { saveClip, getFavicon } from './utils/storage';
import { ChatGPTAdapter } from './adapters/chatgpt';
import type { ClipItem } from '../types';
import { estimateTokens } from '../lib/tokenizer';

console.log('Context Bridge Content Script Loaded');

// Create a container for the shadow root
const container = document.createElement('div');
container.id = 'context-bridge-root';
// 设置容器样式，确保它在最上层，且不影响页面布局
// 使用 absolute 定位，使其坐标系基于文档流，而不是视口
container.style.position = 'absolute';
container.style.top = '0';
container.style.left = '0';
container.style.width = '100%';
container.style.height = '100%';
container.style.zIndex = '2147483647'; // Max z-index
container.style.pointerEvents = 'none'; // 容器本身不响应鼠标，避免遮挡页面
document.body.appendChild(container);

// Create shadow root
const shadowRoot = container.attachShadow({ mode: 'open' });

// Create a root element inside shadow dom
const rootElement = document.createElement('div');
shadowRoot.appendChild(rootElement);

// Render React component
createRoot(rootElement).render(
  <StrictMode>
    <CaptureOverlay />
  </StrictMode>
);

// Initialize Site Adapters
const adapters = [new ChatGPTAdapter()];
const currentUrl = window.location.href;

adapters.forEach(adapter => {
    if (adapter.match(currentUrl)) {
        adapter.init();
    }
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
  if (message.type === 'PARSE_PAGE') {
    handleParsePage();
  }
});

async function handleParsePage() {
  try {
    const { title, content } = await parsePageContent();
    
    const newItem: ClipItem = {
        id: crypto.randomUUID(),
        type: 'page_content',
        content: content,
        metadata: {
            source_url: window.location.href,
            source_title: title || document.title,
            timestamp: Date.now(),
            favicon: getFavicon()
        },
        status: 'staging',
        token_estimate: estimateTokens(content)
    };

    await saveClip(newItem);

    alert('Page content saved to Context Bridge');
  } catch (error) {
    console.error('Failed to parse page:', error);
    alert('Failed to parse page content');
  }
}
