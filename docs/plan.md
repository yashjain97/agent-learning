# Plan: Kanban Board with Drag-and-Drop

## TL;DR
Build a color-coordinated Kanban board with 5 columns (Backlog → Done), HTML5 drag-and-drop to move tickets between columns, and localStorage persistence. Separate files: `index.html`, `style.css`, `app.js`.

## Steps

### Phase 1: Structure & Layout
1. Create `index.html` — semantic HTML with a board container holding 5 column divs, each with a header and droppable ticket area. Include an "Add Ticket" form (title + description input).
2. Create `style.css` — flexbox-based board layout, each column gets a distinct color theme (header bg + subtle column bg), ticket cards styled with border-left accent color matching their current column, smooth transitions/shadows on drag.

### Phase 2: Drag-and-Drop & State
3. Create `app.js` — core logic:
   - Data model: array of ticket objects `{ id, title, description, status }` stored in localStorage.
   - Render function: reads data, populates DOM columns.
   - HTML5 Drag & Drop: `dragstart` sets ticket ID on `dataTransfer`, columns listen for `dragover` (allow drop) and `drop` (update ticket status, re-render, save to localStorage).
   - Add ticket: form submit creates a new ticket in "Backlog", saves, re-renders.
   - Delete ticket: small × button on each card.

### Phase 3: Color Coordination
4. Color scheme (each column has a distinct pastel palette):
   - **Backlog**: Slate/gray (#94a3b8 header, #f1f5f9 bg)
   - **To Do**: Blue (#60a5fa header, #eff6ff bg)
   - **In Progress**: Amber (#fbbf24 header, #fffbeb bg)
   - **Review**: Purple (#a78bfa header, #f5f3ff bg)
   - **Done**: Green (#4ade80 header, #f0fdf4 bg)
   - Ticket cards get a colored left-border accent matching their column.
   - Dragging state: ticket becomes semi-transparent, drop-target column gets a highlighted border.

## Files to create
- `index.html` — board markup, form, links to CSS/JS
- `style.css` — layout, column colors, card styles, drag states
- `app.js` — data model, rendering, drag-and-drop handlers, localStorage read/write

## Verification
1. Open `index.html` in a browser — 5 columns render with distinct colors
2. Add a ticket via the form — it appears in Backlog
3. Drag a ticket from Backlog to In Progress — ticket moves, status updates
4. Refresh the page — tickets persist in their moved positions
5. Delete a ticket — it disappears and localStorage updates
6. Drag visual feedback — ticket becomes translucent, target column highlights

## Decisions
- Vanilla JS only, no frameworks or build tools — keeps it simple and zero-dependency
- HTML5 native Drag and Drop API (no external drag libraries)
- localStorage for persistence (no backend)
- 5 columns: Backlog / To Do / In Progress / Review / Done
- Color palette: pastel tones with stronger header accents (Tailwind-inspired colors)
