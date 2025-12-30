import type { SiteAdapter } from './base';
import { saveClip, getFavicon } from '../utils/storage';
import TurndownService from 'turndown';
import type { ClipItem } from '../../types';
import { estimateTokens } from '../../lib/tokenizer';

export class ChatGPTAdapter implements SiteAdapter {
  name = 'ChatGPT';

  match(url: string): boolean {
    return url.includes('chatgpt.com') || url.includes('chat.openai.com');
  }

  init(): void {
    console.log('Context Bridge: ChatGPT Adapter Initialized');
    this.observeMutations();
  }

  private observeMutations() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            this.processNode(node);
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Process existing nodes
    document.querySelectorAll('[data-message-author-role="assistant"]').forEach((el) => {
      this.injectButton(el as HTMLElement);
    });
  }

  private processNode(node: HTMLElement) {
    if (node.matches && node.matches('[data-message-author-role="assistant"]')) {
      this.injectButton(node);
    } else {
      const messages = node.querySelectorAll('[data-message-author-role="assistant"]');
      messages.forEach((msg) => this.injectButton(msg as HTMLElement));
    }
  }

  private injectButton(messageEl: HTMLElement) {
    if (messageEl.dataset.cbInjected) return;
    
    // Check if content is ready
    const markdownEl = messageEl.querySelector('.markdown');
    if (!markdownEl) return; // Not ready yet

    messageEl.dataset.cbInjected = 'true';

    const btn = document.createElement('button');
    btn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 5v14M5 12h14"/>
      </svg>
    `;
    btn.title = 'Add to Context Bridge';
    btn.className = 'cb-chatgpt-btn text-gray-400 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100';
    btn.style.cssText = `
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
      margin-left: 8px;
      border-radius: 4px;
      cursor: pointer;
      transition: color 0.2s;
    `;

    btn.onclick = (e) => {
        e.stopPropagation();
        this.handleCapture(messageEl, btn);
    };

    // Try to find the action bar (where Copy button usually is)
    // ChatGPT structure: .markdown -> sibling div (footer) -> buttons
    const footer = markdownEl.parentElement?.querySelector('div.flex.gap-2') || 
                   markdownEl.parentElement?.lastElementChild;
    
    if (footer) {
        // Append to footer
        footer.appendChild(btn);
    } else {
        // Fallback: Absolute position
        btn.style.position = 'absolute';
        btn.style.top = '10px';
        btn.style.right = '10px';
        if (getComputedStyle(messageEl).position === 'static') {
            messageEl.style.position = 'relative';
        }
        messageEl.appendChild(btn);
    }
  }

  private async handleCapture(messageEl: HTMLElement, btn: HTMLButtonElement) {
    const markdownEl = messageEl.querySelector('.markdown');
    if (!markdownEl) return;

    // Visual feedback
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '...';
    btn.disabled = true;

    try {
        const turndownService = new TurndownService();
        // Configure turndown to handle code blocks better if needed
        turndownService.addRule('codeBlock', {
            filter: 'pre',
            replacement: function (_content, node) {
                const code = (node as HTMLElement).querySelector('code');
                const lang = code?.className.replace('language-', '') || '';
                return '\n```' + lang + '\n' + code?.textContent + '\n```\n';
            }
        });

        const content = turndownService.turndown(markdownEl.innerHTML);
        
        const clip: ClipItem = {
            id: crypto.randomUUID(),
            type: 'ai_response',
            content: content,
            metadata: {
                source_url: window.location.href,
                source_title: document.title,
                timestamp: Date.now(),
                favicon: getFavicon()
            },
            status: 'staging',
            token_estimate: estimateTokens(content)
        };

        await saveClip(clip);
        
        // Success feedback
        btn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        `;
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.disabled = false;
        }, 2000);
    } catch (error) {
        console.error('Context Bridge: Capture failed', error);
        btn.innerHTML = '❌';
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.disabled = false;
        }, 2000);
    }
  }
}
