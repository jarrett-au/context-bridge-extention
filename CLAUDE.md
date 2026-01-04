# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Context Bridge is a Chrome extension for capturing and synthesizing web content to build context for LLM interactions. Users can clip text, code, page content, and AI responses, then use AI to synthesize multiple clips into consolidated knowledge artifacts.

## Development Commands

### Build & Development
```bash
npm run dev          # Start Vite dev server
npm run build        # Full build: TypeScript + Vite (main + content script)
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Build Output
The project uses a dual build configuration:
- **Main build** ([vite.config.ts](vite.config.ts)): Builds sidepanel, popup, options pages, and background service worker
- **Content script build** ([vite.content.config.ts](vite.content.config.ts)): Builds the content script separately

Both run via `npm run build`.

## Architecture

### Extension Structure
The extension consists of four main contexts that communicate via Chrome APIs:

1. **Content Script** ([src/content/](src/content/))
   - Injected into all web pages
   - Site adapters (e.g., [ChatGPTAdapter](src/content/adapters/chatgpt.ts)) inject capture buttons into specific sites
   - Page content parsing via [parsePage](src/content/utils/parsePage.ts) using Mozilla Readability
   - Universal capture overlay for text selection

2. **Background Service Worker** ([src/background/index.ts](src/background/index.ts))
   - Creates context menu entry for "Save Page Content"
   - Minimal coordination logic

3. **Side Panel** ([src/sidepanel/](src/sidepanel/))
   - Main UI: Staging Area → Archive → Synthesis Zone workflow
   - Three-pane layout: staging (inbox), archived, synthesis zone
   - Drag-and-drop reordering via @dnd-kit
   - State management via [useClips](src/sidepanel/hooks/useClips.ts) hook

4. **Options Page** ([src/options/](src/options/))
   - Settings management (API keys, AI configuration, custom prompts)

### Data Flow

1. **Capture**: Content scripts collect data and save to `chrome.storage.local`
2. **Storage Sync**: All contexts watch `chrome.storage.onChanged` for real-time updates
3. **Synthesis**: Users select clips in Staging Area, choose AI prompt, generate synthesis
4. **Archival**: Original clips are marked as `archived`; synthesis result added as new clip with `parent_ids` reference

### Core Types ([src/types/index.ts](src/types/index.ts))

- **ClipItem**: Base type for all captured content
  - `type`: 'text' | 'code' | 'page_content' | 'ai_response'
  - `status`: 'staging' | 'archived' | 'synthesis'
  - `token_estimate`: Character count / 4

- **SynthesisItem**: Extends ClipItem with `is_synthesized`, `parent_ids`, `template_used`

- **AiPrompt**: Reusable prompt templates (see [DEFAULT_AI_PROMPTS](src/constants.ts))

### Site Adapter Pattern

Adapters ([src/content/adapters/](src/content/adapters/)) implement the [SiteAdapter interface](src/content/adapters/base.ts):
```typescript
interface SiteAdapter {
  name: string;
  match(url: string): boolean;
  init(): void;
}
```

The content script automatically initializes matching adapters on page load.

### AI Integration

- [ai.ts](src/lib/ai.ts): OpenAI client wrapper for synthesis
- [tokenizer.ts](src/lib/tokenizer.ts): Token estimation via gpt-tokenizer
- All AI calls happen from the extension context (sidepanel/options), not content scripts

## Key Implementation Details

### Storage Strategy
- Single source of truth: `chrome.storage.local.clips` array
- Optimistic updates in UI, then persisted to storage
- Storage change listeners sync state across contexts
- Atomic operations for synthesis (add new + archive sources in one update)

### Content Script Build
The content script is built separately as an IIFE to avoid conflicts with page scripts. It uses [vite.content.config.ts](vite.content.config.ts) with `emptyOutDir: false` to preserve the main build's output.

### React Setup
- React 19.2.0 with TypeScript
- No component library - custom UI with Tailwind CSS v4
- Framer Motion for animations
- Zustand available but not currently used (state managed via storage hooks)

## Development Notes

### Testing Content Scripts
After building, reload the extension in `chrome://extensions` and refresh target pages. The content script caches aggressively, so hard refresh (Ctrl+Shift+R) may be needed.

### Adding Site Adapters
1. Create new adapter class in [src/content/adapters/](src/content/adapters/)
2. Import and register in [src/content/index.tsx](src/content/index.tsx)
3. Adapter should use MutationObserver for dynamic content (SPA navigation)

### Vite Configuration
- Uses `rolldown-vite` (Rolldown bundler) instead of standard Rollup for faster builds
- Configured via package.json `overrides`

### Message Passing
Minimal use of chrome.runtime messaging. Prefer storage events for cross-context communication as they're more reliable and already implemented.
