import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster, toast } from 'sonner';
import CaptureOverlay from './CaptureOverlay';
import { parsePageContent } from './utils/parsePage';
import { saveClip, getFavicon } from './utils/storage';
import { ChatGPTAdapter } from './adapters/chatgpt';
import { ClaudeAdapter } from './adapters/claude';
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

// Inject Tailwind styles into Shadow DOM
// const style = document.createElement('style');
// We need to fetch the bundled CSS and inject it here.
// For now, we rely on Vite injecting styles, but in Shadow DOM it's tricky.
// A common workaround in development is to import the CSS file as a string.
// But since we use Tailwind, we might need to manually link the stylesheet.
// However, since we are using `vite.content.config.ts`, the CSS is likely emitted as a separate file.
// Let's try to find the link element in the main document head that Vite might have injected (if not using Shadow DOM),
// OR we assume that for now we might lose styles in Shadow DOM unless we explicitly handle it.
// FOR THIS PHASE: We will just add the Toaster inside the Shadow DOM.
// Note: Sonner Toaster might need to be rendered inside the Shadow Root to be visible and styled correctly if we want isolation.
// But Sonner portals to document.body by default. We need to tell it to portal to our shadow root container or just render inline.

// Create a root element inside shadow dom
const rootElement = document.createElement('div');
shadowRoot.appendChild(rootElement);

// Render React component
createRoot(rootElement).render(
  <StrictMode>
    <CaptureOverlay />
    <Toaster position="top-right" toastOptions={{
        style: {
            background: 'white',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: 500,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            width: 'auto',
            minWidth: '200px',
            maxWidth: '320px',
            gap: '8px',
        },
        className: 'context-bridge-toast'
    }} />
  </StrictMode>
);

// Initialize Site Adapters
const adapters = [new ChatGPTAdapter(), new ClaudeAdapter()];
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

    toast.success('Page content saved to Context Bridge');
  } catch (error) {
    console.error('Failed to parse page:', error);
    toast.error('Failed to parse page content');
  }
}
