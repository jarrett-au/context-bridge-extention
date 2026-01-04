---
globs: src/content/adapters/**/*.ts
---
# Site Adapter Rules

## 1. Interface
- Implement `SiteAdapter` interface (`name`, `match`, `init`).
- **Auto-Init**: Content script loops all adapters.

## 2. Implementation
- **DOM Access**: Use specific selectors. Handle dynamic SPAs.
- **Observer**: Use `MutationObserver` for delayed content.
- **Overlay**: Inject buttons non-destructively.

## 3. Capture
- **Parsing**: `Mozilla Readability` via `parsePage`.
- **Format**: Clean Markdown (Turndown).
