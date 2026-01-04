---
description: High-level architecture for Chrome Extension contexts and data flow.
---
# Architecture Rules

## 1. Contexts
- **Content**: Injected pages. Shadow DOM. Isolate styles.
- **Background**: Service Worker. Context menus.
- **Sidepanel**: Main UI. Staging -> Archive -> Synthesis.
- **Options**: Settings.

## 2. Data Flow
- **Source of Truth**: `chrome.storage.local.clips`.
- **Sync**: Listen to `chrome.storage.onChanged`.
- **Messaging**: Minimize `chrome.runtime`. Prefer Storage Events.

## 3. Storage Strategy
- **Optimistic**: Update UI first, then persist.
- **Atomic**: Batch operations (e.g., synthesis + archive).
- **Structure**:
  - `ClipItem`: Base (text/code/page).
  - `SynthesisItem`: Derived content.

## 4. Build System
- **Dual Config**:
  - `vite.config.ts`: Main (Sidepanel/Bg/Options).
  - `vite.content.config.ts`: Content Scripts (IIFE).
