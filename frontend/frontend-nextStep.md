# 🚀 Frontend Next Steps: Stock Manager

This document outlines the roadmap to connect the React frontend (FSD) with the backend API, focusing on the core features required for the MVP.

---

## 🏗️ 1. Authentication & Routing Layer
The goal is to establish a secure navigation flow between public and protected areas.

### 1.1 Pages & Routing
- [ ] **Landing Page (`/`)**: A simple landing page with a "Get Started" button that redirects to the Login page.
- [ ] **Auth Page (`/auth`)**: A single page that toggles between **Login** and **Register** forms.
- [ ] **Dashboard (`/dashboard`)**: The main authenticated area.
- [ ] **Public/Private Routes**: Implement a `ProtectedRoute` component to prevent unauthenticated access to the dashboard.

### 1.2 Session Management (FSD: `entities/user`)
- [ ] **User Store**: Implement a state (using Context or a library like Zustand) to hold the `user` object.
- [ ] **Persistent Auth**: Logic to check if a token exists in `localStorage` on app boot.
- [ ] **Logout**: Clear token and user state, then redirect to Landing Page.

---

## 📦 2. Product Management (The Core Domain)
Everything related to products should be modularized using FSD.

### 2.1 Product Entity (`entities/product`)
- [ ] **Types**: Define the `Product` and `InsertProduct` interfaces to match the backend Drizzle/Zod schemas.
- [ ] **API Calls**:
    - `fetchAllProducts()`: Calls `GET /api/products`.
    - `fetchProductById(id)`: Calls `GET /api/products/:id`.
    - `createProduct(data)`: Calls `POST /api/products`.

### 2.2 Features (`features/product-management`)
- [ ] **Create Product Action**: A form/modal to send new product data to the backend.
- [ ] **Product Details Action**: Logic to trigger the fetching of a specific product for viewing.

### 2.3 Widgets (`widgets/inventory`)
- [ ] **Product Table**: A robust table to display all products returned from the backend.
- [ ] **Product Detail Card**: A clean UI to show single product information.

---

## 🛠️ 3. Implementation Checklist

### Phase A: Auth Refinement
- [ ] Create `RegisterForm` feature.
- [ ] Update `AppRouter` with new routes (`/`, `/auth`, `/dashboard`).
- [ ] Implement `ProtectedRoute` wrapper.

### Phase B: Product Consumption
- [ ] Create `entities/product` folder and `types.ts`.
- [ ] Implement the `api/` layer for products inside the entity.
- [ ] Build the **Product List** widget on the Dashboard.

---

## 💎 Design Goals (Premium UI)
- **Glassmorphism**: Use cards with `backdrop-filter` for the dashboard and login forms.
- **Micro-animations**: Smooth transitions when switching between Login and Register.
- **Feedback**: Skeleton screens while fetching products and toast notifications for success/error.

---

## 🔍 Backend Alignment (Sync Check)
| Frontend Action | Backend Endpoint | Method | Auth Required |
| :--- | :--- | :--- | :--- |
| Login | `/api/user/login` | POST | No |
| Register | `/api/user/register` | POST | No |
| List All | `/api/products` | GET | No |
| Get One | `/api/products/:id` | GET | No |
| Create | `/api/products` | POST | **Yes** |
| Get Current User | `/api/user/me` | GET | **Yes** (Recommended) |

> [!TIP]
> **The `/me` Endpoint Solution**: 
> You should add a `GET /api/user/me` endpoint to the backend. It uses the `authenticateToken` middleware and returns the user data associated with that token. This is the first thing a React app calls when it loads (usually in a `useEffect` or `ProfileProvider`) to check if the session is still valid and populate the user state.
