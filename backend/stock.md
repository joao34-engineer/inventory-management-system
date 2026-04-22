# 🚀 Stock Manager: Roadmap to Shipping

This document prioritizes the features needed to transition to a **React Frontend** as quickly as possible.

---

## 🔥 Phase 1: MVP Priority (Next Steps)
*Complete these to start building the React Frontend.*

### 📦 1.1 Products Module (Basic CRUD)
- [ ] **Create**: `POST /products` - Add one item.
- [ ] **Read**: `GET /products` - List all items for the dashboard.
- [ ] **Update**: `PATCH /products/:id` - Edit name, price, or description.
- [ ] **Delete**: `DELETE /products/:id` - Remove from stock.

### 🔢 1.2 Inventory Quick-Adjust
- [ ] **Adjust Stock**: `POST /products/:id/adjust` - A simple endpoint to add/subtract a number from current stock (Essential for the "Turnery" service).

### 🛡️ 1.3 Core Backend "Plumbing"
- [ ] **Controllers & Routes**: Connect the `UserService` and `ProductService` to Express routers.
- [ ] **CORS Configuration**: Allow your React app (usually `localhost:5173`) to talk to this API.
- [ ] **Global Error Handler**: Ensure all errors return JSON so the Frontend doesn't crash.

---

## 🛠️ Phase 2: Refinement & Advanced Logic
*Work on these while building the frontend or immediately after.*

- [ ] **Authentication Guard**: Protect product creation/deletion so only logged-in users can do it.
- [ ] **Categories**: Group products (Phase 1 will just use a flat list).
- [ ] **Audit Trail**: Implement the `Stock Movement Logs` to track *who* changed *what* and *when*.

---

## ✨ Phase 3: Secondary Features & "Specialist" Polish
*Features to wow interviewers and add unique value.*

### 🤖 3.1 AI Stock Agent (OpenRouter)
- [ ] **AI Inventory Assistant**: A chat interface where you can ask: *"What are my lowest stock items?"* or *"Analyze my inventory trends."*
- [ ] **Automatic Descriptions**: Use AI to generate professional product descriptions based on the name/category.

### 📈 3.2 Pro Features
- [ ] **Soft Delete**: Instead of deleting rows, mark them as `discontinued: true`.
- [ ] **Bulk Import**: Upload a CSV to add 100 products at once.
- [ ] **Image Upload**: Store product images (e.g., using Cloudinary or local storage).

---

## 🎯 Current Goal:
1. Complete `ProductSchema` & `ProductService`.
2. Wrap everything in a `Controller`.
3. **➡️ START REACT FRONTEND**
