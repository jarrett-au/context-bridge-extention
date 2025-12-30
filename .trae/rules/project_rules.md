## 0. Environment (MUST)
- **OS**: Windows 11
- **Shell**: PowerShell

## 1. Architecture (MUST)
- **MV3 & Modules**: Strict Manifest V3. Separate `background`, `content`, `sidepanel`.
- **State**: **Zustand** for global state. Unidirectional data flow.
- **Atomic Components**: Shared in `src/components`, feature-specific in `src/<feature>`.

## 2. Coding (SHOULD)
- **TS & Style**: Strict TypeScript (no `any`). **TailwindCSS** only.
- **Naming**: `PascalCase` components, `camelCase` hooks/vars/funcs.
- **Async**: Prefer `async/await`.

## 3. Extension Core (MUST)
- **Messaging**: Typed messages via `chrome.runtime`.
- **Security**: Shadow DOM for content scripts. Minimal permissions.

## 4. UI/UX (SHOULD)
- **Stack**: **React 19**, **@dnd-kit** (Drag&Drop), **Framer Motion** (Animations).
- **Responsive**: Adaptive side panel layout.

## 5. Workflow (MAY)
- **Git**: Semantic commits. Run `npm run lint` before commit.
- **Refactor**: Split files >200 lines.