---
globs: src/**/*.tsx, src/**/*.ts, src/**/*.css
---
# UI/UX Rules

## 1. Components
- **Style**: Tailwind v4 (PostCSS). No CSS modules.
- **Icons**: Lucide React.
- **Animation**: Framer Motion for transitions.
- **DnD**: `@dnd-kit` for list reordering.

## 2. Patterns
- **Hooks**: Use custom hooks for logic (`useClips`).
- **State**: Local state or Zustand (if complex).
- **Theme**: Dark mode aware (if applicable).

## 3. Clip Items
- **Staging**: Draggable, selectable.
- **Archived**: Read-only, history.
- **Synthesis**: Generated output, parent refs.

## 4. Constraints
- **Side Panel**: Responsive width.
- **Overlay**: Z-index high, isolate from page CSS.
