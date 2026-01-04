import type { SiteAdapter } from './base';
import { saveClip, getFavicon } from '../utils/storage';
import TurndownService from 'turndown';
import type { ClipItem } from '../../types';
import { estimateTokens } from '../../lib/tokenizer';
import { toast } from 'sonner';

export class ClaudeAdapter implements SiteAdapter {
  name = 'Claude';

  match(url: string): boolean {
    return url.includes('claude.ai');
  }

  init(): void {
    console.log('Context Bridge: Claude Adapter Initialized');
    this.observeMutations();
  }

  private observeMutations() {
    const observer = new MutationObserver((_mutations) => {
      // Simple debounce or just run, DOM operations are fast enough if we check flags
      this.scanForMessages();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Initial scan
    this.scanForMessages();
  }

  private scanForMessages() {
    // Strategy: Look for "Copy" buttons which are standard in AI interfaces
    // Claude's copy button typically has an aria-label or specific icon
    const buttons = document.querySelectorAll('button');
    
    buttons.forEach(btn => {
        // Check for Copy button characteristics
        const isCopyBtn = btn.getAttribute('aria-label')?.includes('Copy') || 
                          btn.getAttribute('title')?.includes('Copy') ||
                          btn.querySelector('svg.text-text-400'); // Specific to some versions

        // Also check if we are in a message row (grid layout usually)
        // Claude structure: .grid -> .col-start-1 (avatar) + .col-start-2 (content)
        
        if (isCopyBtn || this.isMessageFooter(btn)) {
            const footer = btn.parentElement;
            if (footer && !footer.dataset.cbInjected) {
                this.injectButton(footer);
            }
        }
    });
  }

  private isMessageFooter(element: HTMLElement): boolean {
      // Heuristic: It's a flex container with gap, containing buttons
      const style = window.getComputedStyle(element);
      return style.display === 'flex' && 
             (element.classList.contains('text-gray-400') || element.classList.contains('text-text-400'));
  }

  private injectButton(footer: HTMLElement) {
    if (footer.dataset.cbInjected) return;
    footer.dataset.cbInjected = 'true';

    const btn = document.createElement('button');
    btn.className = 'cb-claude-btn hover:text-text-100 transition-colors p-1 rounded';
    btn.title = 'Save to Context Bridge';
    btn.style.cssText = `
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-left: 4px;
      color: inherit;
      cursor: pointer;
      opacity: 0.7;
    `;
    
    // Insert icon
    btn.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
    `;

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        this.handleCapture(footer, btn);
    });

    // Append to the footer group
    footer.appendChild(btn);
  }

  private async handleCapture(footer: HTMLElement, btn: HTMLButtonElement) {
    // Traverse up to find the message content
    // Structure usually: Message Container -> Footer
    // We look for the main text content sibling
    
    let contentEl: HTMLElement | null = null;
    
    // Strategy 1: Look for .font-claude-message or .font-user-message
    const messageRow = footer.closest('.grid') || footer.parentElement?.parentElement;
    
    if (messageRow) {
        contentEl = messageRow.querySelector('.font-claude-message, .font-user-message');
    }

    // Strategy 2: Look for the biggest text container nearby
    if (!contentEl) {
        // Go up 2-3 levels
        let parent = footer.parentElement;
        for (let i = 0; i < 3; i++) {
            if (!parent) break;
            const textContent = parent.querySelector('.whitespace-pre-wrap');
            if (textContent) {
                contentEl = textContent as HTMLElement;
                break;
            }
            parent = parent.parentElement;
        }
    }

    if (!contentEl) {
        toast.error('Could not find message content');
        return;
    }

    try {
        // Visual feedback
        const originalIcon = btn.innerHTML;
        btn.innerHTML = `<svg class="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>`;
        
        const turndownService = new TurndownService({
            headingStyle: 'atx',
            codeBlockStyle: 'fenced'
        });
        
        const markdown = turndownService.turndown(contentEl.innerHTML);
        
        const newItem: ClipItem = {
            id: crypto.randomUUID(),
            type: 'ai_response',
            content: markdown,
            metadata: {
                source_url: window.location.href,
                source_title: 'Claude Chat',
                timestamp: Date.now(),
                favicon: getFavicon()
            },
            status: 'staging',
            token_estimate: estimateTokens(markdown)
        };

        await saveClip(newItem);
        toast.success('Saved to Context Bridge');
        
        // Reset icon
        setTimeout(() => {
            btn.innerHTML = originalIcon;
        }, 1000);
        
    } catch (error) {
        console.error('Context Bridge: Capture failed', error);
        toast.error('Capture failed');
        btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="red" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>`;
    }
  }
}
