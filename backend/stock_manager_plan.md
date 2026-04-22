# Implementation Plan: Stock Manager (Modular Monolith)

This plan outlines how to build a **Stock Manager CRUD** from scratch inside the `backend/` folder, using a modular approach that will impress interviewers.

---

## 🏗️ Phase 1: Environment Setup
First, we need to install the necessary dependencies in our `backend` folder.

1. **Install Core Dependencies**:
   ```bash
   npm install express drizzle-orm pg zod dotenv cors
   ```
2. **Install Dev Dependencies**:
   ```bash
   npm install -D typescript tsx @types/node @types/express @types/cors drizzle-kit
   ```
3. **Folder Structure**:
   ```text
   backend/src/
   ├── modules/
   │   └── products/           # Our first module
   │       ├── products.schema.ts
   │       ├── products.service.ts
   │       ├── products.controller.ts
   │       └── products.routes.ts
   ├── shared/                 # Common logic
   │   ├── database.ts
   │   └── errors.ts
   ├── server.ts               # Express app setup
   └── index.ts                # App entry point
   ```

---

## 🛠️ Phase 2: The Products Module
We will build the **Products** module first. This is where the Stock management happens.

### 1. Schema (Data Structure)
Define the `Product` model: `id`, `name`, `sku`, `price`, `quantity`, `createdAt`.

### 2. Service (Business Logic)
This is the most important part for an interview.
- `getAllProducts()`
- `getProductById(id)`
- `createProduct(data)`
- `updateStock(id, newQuantity)` -> *Bonus tip: Don't just update, check if stock is negative!*
- `deleteProduct(id)`

### 3. Controller (HTTP Handling)
Small and clean functions that call the service.

### 4. Routes
Register endpoints like `GET /products`, `POST /products`, etc.

---

## 🔌 Phase 3: Integration
Connect everything in `server.ts`:
1. Use JSON middleware.
2. Register the Products module router.
3. Add a global error handler for a professional touch.

---

## 💡 Interview Tips for this Project
When you explain this to an interviewer, focus on these points:
- **Scalability**: "I used a Modular Monolith because if the Products module grows too large, we can move it to a microservice without refactoring the logic."
- **Separation of Concerns**: "The controllers only handle the API interface (Express), while the services handle the business rules."
- **Domain Driven**: "Each module represents a business domain, making the codebase easier to navigate."

---

## Ready to start?
I can help you build this layer by layer. Which step should we start with?
1. **Infrastructure**: Setup the database connection and the `server.ts` base.
2. **Products Module**: Jump straight into the schema and service.
