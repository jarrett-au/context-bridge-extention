---
alwaysApply: false
---
# Workflow Rules

## 1. Development
- **Start**: `npm run dev` (HMR).
- **Reload**: Extension reload in `chrome://extensions` required for Manifest/Background changes.
- **Content Script**: Hard refresh target page after build.

## 2. Build
- **Command**: `npm run build`.
- **Output**: `dist/` (Main) + `dist/assets/` (Content).
- **Lint**: `npm run lint` before commit.

## 3. Deployment
- **Preview**: `npm run preview`.
- **Version**: Bump in `package.json` and `manifest.json`.
