# Feature-Sliced Design (FSD) - Project Reference

This guide summarizes the architectural rules we are following for the frontend.

## 1. The 7 Layers (Hierarchy)
You can only import from layers **strictly below** the current one.

1. **App**: Global setup (Router, Providers, Styles).
2. **Processes**: (Deprecated).
3. **Pages**: Full screen views.
4. **Widgets**: Large, self-sufficient UI blocks (Navbar + Sidebar).
5. **Features**: User interactions (Login, Create Product, Search).
    - *Rule*: Features are actions users care to perform.
6. **Entities**: Business concepts (User, Product, Order).
    - *Rule*: Fragments of the domain logic.
7. **Shared**: Reusable tools (API client, UI Kit, Config).

## 2. Standard Segments (Inside Slices)
Common folder names to use inside each Slice (except Shared/App):

- `api/`: Requests to the backend.
- `model/`: Types, interfaces, and state logic.
- `ui/`: React components.
- `lib/`: Helper functions specific to that slice.

## 3. The "Entity vs. Feature" Rule
- **Entity**: "What it IS" (e.g. A User has an ID and Name).
- **Feature**: "What it DOES" (e.g. A User can Login).

## 4. Public API (index.ts)
Every slice (like `entities/user` or `features/auth/login`) should have an `index.ts` file. 
- *Rule*: Only export what is necessary for the outside world to see. 
- *Rule*: Avoid deep imports (don't import from `entities/user/model/types.ts` from outside, import from `entities/user`).
