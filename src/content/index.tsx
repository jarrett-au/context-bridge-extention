import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import CaptureOverlay from './CaptureOverlay';
import { parsePageContent } from './utils/parsePage';

console.log('Context Bridge Content Script Loaded');

// Create a container for the shadow root
const container = document.createElement('div');
container.id = 'context-bridge-root';
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

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
  if (message.type === 'PARSE_PAGE') {
    handleParsePage();
  }
});

async function handleParsePage() {
  try {
    const { title, content } = await parsePageContent();
    
    const newItem = {
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
        token_estimate: Math.ceil(content.length / 4)
    };

    // Save to storage
    const result = await chrome.storage.local.get(['clips']);
    const clips = (result.clips as any[]) || [];
    const newClips = [newItem, ...clips];
    await chrome.storage.local.set({ clips: newClips });

    alert('Page content saved to Context Bridge');
  } catch (error) {
    console.error('Failed to parse page:', error);
    alert('Failed to parse page content');
  }
}

function getFavicon() {
    const link = document.querySelector("link[rel~='icon']");
    if (!link) return '/vite.svg'; // Fallback
    return (link as HTMLLinkElement).href;
}
