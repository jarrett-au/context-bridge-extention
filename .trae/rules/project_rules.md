# Project Rules: Context Bridge

## 1. Core & Architecture
- **Stack**: Manifest V3, React + Vite + TS, TailwindCSS, Zustand.
- **Storage**: `chrome.storage.local` (short-term) -> `IndexedDB` (long-term).
- **Modules**:
  - **Background**: Persistence, messaging, menus.
  - **Content**: `capture-overlay` (Shadow DOM), `readability`.
  - **Side Panel**: UI (Staging, Synthesis, Archive).
- **Pattern**: Separate UI from logic (use Hooks/Store).

## 2. Standards
- **Naming**: `kebab-case` (files), `PascalCase` (components/types), `camelCase` (funcs).
- **TS**: Strict mode, NO `any`, interfaces required.
- **React**: Functional components + Hooks only.
- **Async**: Use `async/await` for Chrome APIs.
- **Data**: `turndown` for Markdown; sanitize inputs (no script/style/video).

## 3. UX & Workflow
- **Libs**: `dnd-kit` (DnD), `framer-motion` (Anim), `lucide-react` (Icons).
- **Behavior**: Global Toggle OFF = No render. Debounce heavy tasks.
- **Git**: `type(scope): description`.
- **Phases**: MVP (Capture/Store) -> Flow (DnD/Anim) -> AI (Synthesis).
