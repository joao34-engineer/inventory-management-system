# Frontend Architecture: Stock Manager (SPA + FSD)

This document outlines the connection between the React/Vite frontend and the Modular Monolith backend.

## 1. Core Architecture: Feature-Sliced Design (FSD)
We are using FSD to ensure the project remains modular and scalable.

### Layers:
- **app/**: Global setup (React Router, Global Styles, Providers).
- **pages/**: View composition (Login, Dashboard, ProductDetails).
- **widgets/**: Complex UI blocks (Navbar, ProductTable, Sidebar).
- **features/**: User interactions (AuthForm, CreateProductAction, SearchInventory).
- **entities/**: Business logic & data (User, Product).
- **shared/**: Reusable utilities (API Client, UI Library, Input/Button).

## 2. Backend Connection Strategy

### API Client (`shared/api`)
- **Base URL**: `http://localhost:3000/api`
- **Interceptors**: Automatically adds `Authorization: Bearer <token>` from localStorage.
- **Error Handling**: Standardized to match the backend's `globalError` JSON shapes.

### Data Synchronization
- **Entities mapping**: The frontend `Product` and `User` types must strictly match the Zod inferred types from the backend.
- **Auth Flow**: 
    1. `features/auth/login` sends credentials.
    2. Backend returns `{ token, user }`.
    3. `shared/api` stores token.
    4. Authenticated requests unlocked for `entities/product`.

## 3. Tech Stack
- **Framework**: React 18+ with Vite.
- **Language**: TypeScript (Strict Mode).
- **Styling**: Vanilla CSS (CSS Variables + BEM naming).
- **Icons**: Lucide React.
- **Navigation**: React Router v6.

## 4. UI/UX Vision (Premium Design)
- **Glassmorphism**: Subtle backgrounds with `backdrop-filter: blur()`.
- **Typography**: Inter / Outfit (Modern Sans).
- **Micro-interactions**: Hover transforms and smooth transitions on all buttons and cards.
- **State Feedback**: Skeleton loaders for product lists and toast notifications for errors.
