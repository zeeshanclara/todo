✅ PRD — Web Clear-Style To-Do App (Updated — No Stretch Features)

## Purpose

Deliver a fast, minimalist, and gesture-first web app that uses visual priority (via gradients) instead of dates or complex workflows. The goal is to help users focus on today, feel motivated through delightful motion, and complete tasks with zero clutter.

The app should feel:
- Lightning fast ⚡
- Joyful ✨
- Bold + Beautiful 🌈

## User Flow

### ✅ Authentication
- Login screen: email → magic code via InstantDB Auth
- Once authenticated → redirect to Today tasks list
- User data always private + scoped per user

### ✅ Task Management (Core Screen — "Today")
- Single list of tasks: active + completed section.
- Task UI:
  - Task title (inline editable)
  - No checkboxes → gestures control completion
  - Gradient priority colors
  - Completed tasks collapse into section below

### Supported Interactions

| Action | Interaction Input |
|--------|------------------|
| Add task | Pull down OR "+" button OR Enter key |
| Edit task | Click or tap task title |
| Complete task | Swipe right (touch) OR Cmd/Ctrl+Click |
| Delete task | Swipe left (touch) OR Delete key |
| Reorder tasks | Drag + drop |
| Collapse completed | Click section title |

Keyboard support:
- ⏎ → new task
- ⌫ on empty task → delete
- ↑↓ → navigate active selection

### ✅ Session Management
- Sign out option in header or profile menu

## ✅ Core Functionalities (MVP — Must Ship)

1️⃣ Add tasks (fast, inline, visible instantly)
2️⃣ Complete / reorder / delete / edit tasks
3️⃣ Authentication + user-specific storage via InstantDB

## ✅ Data Model

```typescript
Task {
  id: string;
  userId: string;
  title: string;
  isCompleted: boolean;
  sortOrder: number;
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

**Storage:**
- InstantDB persistent + real-time sync
- User-scope enforced on client & server

## 🎨 Look & Feel

### Design Values
- Gesture-first interactions
- Large typography
- Minimal chrome (no borders/icons)
- Gradient communicates priority
- Smooth transitions + playful animations

### Visual Rules

| Element | Behavior |
|---------|----------|
| Active task | Warm gradient (top red → bottom orange) |
| Completed task | Gray, 50% opacity, strike-through |
| Dragging | Lift w/ shadow + reorder animation |

Performance target: 60fps animations

## 🏗 Build Approach

| Category | Choice |
|----------|--------|
| Framework | Next.js + React + TypeScript |
| State | Zustand or React Query |
| Styling | TailwindCSS |
| Motion | Framer Motion / Reorder API |
| Deployment | Vercel |
| Auth & DB | InstantDB |

Includes responsive behavior for desktop + mobile + tablet

## 🧪 Testing

✅ Test suite required for:
- adding tasks
- marking complete and undo complete
- drag-and-drop reorder
- delete and undo delete behavior
- refresh persistence

**Tools:**
- Jest
- React Testing Library
- Playwright for E2E gestures

## 📊 Success Metrics

| Metric | Target |
|--------|--------|
| Task creation speed | <=100ms |
| Loading to tasks visible | <=1s |
| Animation smoothness | 60fps interactions |
| Retention | 50% users return in 72 hours |

**Emotionally:** Using it should feel fun and rewarding.

## 🔐 Security & Privacy
- Private user-specific task storage
- Auth through InstantDB
- No globally visible data

## ✅ MVP Acceptance Criteria
- User can sign in and view only their tasks
- Add, complete, delete, reorder, and edit tasks fluidly
- Tasks appear in warm gradient priority order
- Completed tasks separated visually
- Data persists across refresh + devices
- Gestures + keyboard workflows supported
- No crashes / major UX blockers
