# SafeSite API - Stock Management System

A full-stack inventory and stock management system built with modern technologies, featuring a modular architecture, type-safe APIs, and production-ready deployment configurations.

## 🏗️ Architecture Overview

### **Monorepo Structure**
```
API-design-v5/
├── backend/          # Node.js + Express API
├── frontend/         # React + Vite SPA
├── k8s/             # Kubernetes manifests
├── scripts/         # E2E testing & automation
└── tests/           # Integration tests
```

### **Backend Architecture**

#### **Modular Design Pattern**
The backend follows a **feature-based modular architecture** where each domain is self-contained:

```
backend/src/
├── modules/
│   ├── user/
│   │   ├── user.schema.ts      # Drizzle schema + Zod validation
│   │   ├── user.service.ts     # Business logic
│   │   ├── user.controller.ts  # Request handlers
│   │   ├── user.routes.ts      # Route definitions
│   │   └── user.types.ts       # TypeScript types
│   ├── products/               # Same structure
│   └── categories/             # Same structure
├── shared/
│   ├── middleware/             # Auth, error handling
│   ├── utils/                  # Helper functions
│   └── globalTypes/            # Shared types
└── db/
    ├── connection.ts           # Database client
    └── schema.ts               # Schema aggregator
```

**Key Architectural Decisions:**
- **Separation of Concerns**: Each module handles its own routes, validation, business logic, and data access
- **Type Safety**: End-to-end type safety using TypeScript, Zod, and Drizzle ORM
- **Schema-First Design**: Database schemas generate TypeScript types and validation schemas
- **Centralized Error Handling**: Custom error classes with global error middleware

#### **Technology Stack**
- **Runtime**: Node.js 24.3.0+
- **Framework**: Express 5.x
- **Database**: PostgreSQL with Drizzle ORM
- **Validation**: Zod schemas
- **Authentication**: JWT (Jose library) + Bcrypt
- **Security**: Helmet, CORS
- **Testing**: Vitest + Supertest

### **Frontend Architecture**

#### **Feature-Sliced Design (FSD)**
The frontend follows the **FSD methodology** for scalable React applications:

```
frontend/src/
├── app/              # Application initialization
│   └── router/       # Route configuration
├── pages/            # Page components
│   ├── dashboard/
│   ├── landing/
│   └── login/
├── widgets/          # Complex UI blocks
│   ├── navbar/
│   └── Sidebar/
├── features/         # User interactions
│   ├── auth/
│   ├── category/
│   └── product/
├── entities/         # Business entities
│   ├── user/
│   ├── product/
│   └── category/
└── shared/           # Reusable code
    ├── ui/           # UI components
    ├── api/          # API client
    └── assets/       # Static files
```

**Technology Stack:**
- **Framework**: React 19
- **Build Tool**: Vite 8
- **Routing**: React Router v7
- **Styling**: Styled Components
- **Language**: TypeScript 6

### **Database Schema**

#### **Core Entities**

**Users Table**
- UUID primary key
- Email & username (unique)
- Role-based access (admin, staff, viewer)
- Bcrypt password hashing
- Timestamps (created_at, updated_at)

**Products Table**
- UUID primary key
- SKU (unique identifier)
- Price (stored in cents)
- Quantity tracking
- Status (active, inactive, discontinued, in-stock, low-stock, out-of-stock)
- Foreign key to categories
- Automatic timestamp updates

**Categories Table**
- UUID primary key
- Unique name
- Timestamps

### **Security Architecture**

1. **Authentication Flow**
   - JWT-based stateless authentication
   - Secure password hashing (Bcrypt with configurable rounds)
   - Token expiration (configurable, default 7d)

2. **Security Middleware**
   - Helmet.js for HTTP headers
   - CORS with configurable origins
   - Request validation with Zod
   - Global error handling (no stack traces in production)

3. **Environment Management**
   - Type-safe environment variables
   - Stage-based configuration (dev, test, production)
   - Validation on startup

### **DevOps & Deployment**

#### **Containerization**
- **Docker**: Multi-stage builds for optimized images
- **Docker Compose**: Local development with PostgreSQL + Adminer

#### **Kubernetes Deployment**
```
k8s/
├── namespace.yaml      # Isolated environment
├── deployment.yaml     # 3 replicas, rolling updates
├── service.yaml        # ClusterIP service
├── ingress.yaml        # External access
├── configmap.yaml      # Non-sensitive config
├── secrets.yaml        # Sensitive data
└── hpa.yaml           # Horizontal Pod Autoscaler
```

**Production Features:**
- Rolling updates (zero downtime)
- Health checks (liveness, readiness, startup probes)
- Resource limits (CPU: 500m, Memory: 512Mi)
- Auto-scaling based on load
- ConfigMaps for environment variables
- Secrets management for credentials

#### **CI/CD Pipeline**
- GitHub Actions workflow (`.github/workflows/ci-cd.yml`)
- Automated testing on push
- Build verification

### **Testing Strategy**

1. **Unit Tests**: Vitest for business logic
2. **Integration Tests**: Supertest for API endpoints
3. **E2E Tests**: Custom scripts for end-to-end flows
4. **Coverage Reports**: Automated coverage tracking

Test files:
- `tests/auth.test.ts` - Authentication flows
- `tests/users.test.ts` - User management
- `tests/protocol.test.ts` - Protocol compliance
- `tests/hazard-zones.test.ts` - Safety zones

### **API Design**

#### **RESTful Endpoints**

**Authentication**
- `POST /api/user/register` - User registration
- `POST /api/user/login` - User login

**Products**
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

**Categories**
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

**Health Check**
- `GET /health` - Service health status

## 🚀 Getting Started

### Prerequisites
- Node.js 24.3.0+
- PostgreSQL 16+
- Docker & Docker Compose (optional)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd API-design-v5
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
```

3. **Database Setup**
```bash
npm run db:generate  # Generate migrations
npm run db:push      # Apply to database
```

4. **Frontend Setup**
```bash
cd frontend
npm install
```

### Running Locally

**With Docker Compose:**
```bash
docker-compose up
```

**Without Docker:**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Running Tests
```bash
npm test              # Unit tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
npm run e2e          # E2E tests
```

## 📦 Deployment

### Docker
```bash
docker build -t safesite-api .
docker run -p 3000:3000 safesite-api
```

### Kubernetes
```bash
kubectl apply -f k8s/
```

## 🛠️ Development Tools

- **Drizzle Studio**: `npm run db:studio` - Database GUI
- **Type Checking**: `npm run type-check`
- **Adminer**: http://localhost:8080 (with Docker Compose)

## 📝 Environment Variables

See `.env.example` for required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret (min 32 chars)
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/test/production)
- `APP_STAGE` - Application stage (dev/test/production)

## 📄 License

MIT License - see LICENSE file

## 👤 Author

João Marcelo

---

**Project Status**: Active Development
