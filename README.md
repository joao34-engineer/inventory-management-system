# 🛡️ SafeSite: Field Compliance & Inspection API

> Enterprise-grade safety compliance API for industrial environments

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-24+-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://www.postgresql.org/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-green.svg)](https://orm.drizzle.team/)
[![Tests](https://img.shields.io/badge/Tests-60%20passing-success.svg)](#testing)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](doc.md/DOCKER.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**SafeSite** is a high-performance backend system built to enforce safety compliance in industrial environments. It enables safety officers to define recurring inspection protocols and allows field technicians to log daily compliance checks, ensuring regulatory compliance (e.g., NR-10) by digitizing safety routines.

---

## ✨ Features

### 🔐 Security & Authentication

- **JWT-based authentication** with 7-day token expiry
- **Bcrypt password hashing** (12 rounds)
- **Helmet.js security headers**
- **CORS protection**
- **Role-based access control** (coming soon)

### 📋 Protocol Management

- Create and manage recurring safety inspection protocols
- Set inspection frequencies (DAILY, WEEKLY, MONTHLY, SHIFT_START, SHIFT_END)
- Define target compliance counts
- Activate/deactivate protocols without deletion
- Associate protocols with hazard zones

### ✅ Compliance Logging

- Record safety inspection completions with timestamps
- Add technician observations and notes
- Automatic validation (cannot log future inspections)
- Complete audit trail of all compliance checks

### ⚠️ Hazard Zone Categorization

- Color-coded risk levels:
  - 🔴 **Red (#dc2626)**: High Risk (e.g., High Voltage Areas)
  - 🟡 **Yellow (#eab308)**: Medium Risk (e.g., Chemical Storage)
  - 🟢 **Green (#16a34a)**: Low Risk (e.g., General Workspace)
- Link protocols to specific hazard zones
- Track safety checks by location/risk level

---

## 🚀 Tech Stack

| Technology       | Purpose                              |
| ---------------- | ------------------------------------ |
| **Node.js 24+**  | Runtime environment                  |
| **TypeScript**   | Type-safe development                |
| **Express.js 5** | Web framework                        |
| **PostgreSQL**   | Relational database (hosted on Neon) |
| **Drizzle ORM**  | Zero-overhead TypeScript ORM         |
| **Zod**          | Runtime schema validation            |
| **Jose**         | JWT token generation                 |
| **Bcrypt**       | Password hashing                     |
| **Helmet**       | Security headers                     |
| **Vitest**       | Testing framework                    |
| **Docker**       | Containerization & deployment        |

---

## 📦 Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/safesite-api.git
cd safesite-api

# Start all services (API + PostgreSQL + Adminer)
docker-compose up -d

# Seed database
docker-compose exec api npm run db:seed

# View logs
docker-compose logs -f api
```

**Services:**

- API: http://localhost:3000
- Database GUI (Adminer): http://localhost:8080
- PostgreSQL: localhost:5432

See **[doc.md/DOCKER.md](doc.md/DOCKER.md)** for comprehensive Docker guide.

### Option 2: Local Installation

#### Prerequisites

- Node.js 24.3.0 or higher
- PostgreSQL database (or Neon account)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/safesite-api.git
cd safesite-api

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET
```

### Environment Variables

Create a `.env` file with:

```env
# Database
DATABASE_URL=postgresql://user:password@host/database

# Authentication
JWT_SECRET=your-secret-key-min-32-characters
JWT_EXPIRES_IN=7d

# Security
BCRYPT_SALT_ROUNDS=12

# Server
PORT=3000
NODE_ENV=development
APP_STAGE=dev
```

### Database Setup

```bash
# Push schema to database
npm run db:push

# Seed with demo data (optional)
npm run db:seed
```

### Run the Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The API will be running at `http://localhost:3000`

**Verify installation:** Visit `http://localhost:3000/health`

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint             | Description                  |
| ------ | -------------------- | ---------------------------- |
| POST   | `/api/auth/register` | Create new user account      |
| POST   | `/api/auth/login`    | Authenticate and receive JWT |

### Protocols (Protected)

| Method | Endpoint             | Description          |
| ------ | -------------------- | -------------------- |
| GET    | `/api/protocols`     | List all protocols   |
| POST   | `/api/protocols`     | Create new protocol  |
| GET    | `/api/protocols/:id` | Get protocol details |
| PATCH  | `/api/protocols/:id` | Update protocol      |
| DELETE | `/api/protocols/:id` | Delete protocol      |

### Compliance Logs (Protected)

| Method | Endpoint                             | Description            |
| ------ | ------------------------------------ | ---------------------- |
| POST   | `/api/protocols/:id/compliance-logs` | Log compliance check   |
| GET    | `/api/protocols/:id/compliance-logs` | Get compliance history |

### Hazard Zones (Protected)

| Method | Endpoint                | Description             |
| ------ | ----------------------- | ----------------------- |
| GET    | `/api/hazard-zones`     | List all zones          |
| POST   | `/api/hazard-zones`     | Create new zone         |
| GET    | `/api/hazard-zones/:id` | Get zone with protocols |
| PATCH  | `/api/hazard-zones/:id` | Update zone             |
| DELETE | `/api/hazard-zones/:id` | Delete zone             |

---

## 💡 Usage Examples

### 1. Register a User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "officer@safesite.com",
    "username": "safety_officer",
    "password": "SafetyFirst123!",
    "firstName": "Sarah",
    "lastName": "Martinez"
  }'
```

**Response:**

```json
{
  "message": "Welcome to SafeSite! Your account is active.",
  "user": { "id": "...", "email": "officer@safesite.com", ... },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 2. Create a Safety Protocol

```bash
curl -X POST http://localhost:3000/api/protocols \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Morning PPE Inspection",
    "description": "Verify all personal protective equipment",
    "frequency": "DAILY",
    "targetCount": 1,
    "zoneIds": ["zone-uuid-1"]
  }'
```

### 3. Log a Compliance Check

```bash
curl -X POST http://localhost:3000/api/protocols/PROTOCOL_ID/compliance-logs \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "completionDate": "2026-01-15T08:00:00Z",
    "note": "All PPE in good condition, no replacements needed"
  }'
```

---

## 🏗️ Architecture

```
┌─────────────┐
│   Client    │
│  (Mobile/   │
│   Web App)  │
└──────┬──────┘
       │
       │ HTTPS/JWT
       │
┌──────▼────────────────────────────────────┐
│          SafeSite API Server              │
│  ┌────────────────────────────────────┐   │
│  │  Middleware Layer                   │   │
│  │  • Helmet (Security)                │   │
│  │  • CORS                             │   │
│  │  • JWT Authentication               │   │
│  │  • Zod Validation                   │   │
│  └────────────────────────────────────┘   │
│  ┌────────────────────────────────────┐   │
│  │  Route Handlers                     │   │
│  │  • Auth Controller                  │   │
│  │  • Protocol Controller              │   │
│  │  • Hazard Zone Controller           │   │
│  └────────────────────────────────────┘   │
│  ┌────────────────────────────────────┐   │
│  │  Drizzle ORM                        │   │
│  │  • Type-safe queries                │   │
│  │  • Schema validation                │   │
│  └────────────────────────────────────┘   │
└──────┬────────────────────────────────────┘
       │
       │ PostgreSQL Protocol
       │
┌──────▼──────┐
│  PostgreSQL │
│  (Neon)     │
│             │
│ • protocols │
│ • compliance│
│   _logs     │
│ • hazard_   │
│   zones     │
└─────────────┘
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

---

## 🔧 Development Scripts

```bash
# Development
npm run dev              # Start dev server with auto-reload

# Database
npm run db:push          # Push schema to database
npm run db:generate      # Generate migration files
npm run db:migrate       # Run migrations
npm run db:studio        # Open Drizzle Studio (GUI)
npm run db:seed          # Seed demo data

# Testing
npm test                 # Run tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

---

## 🔒 Security Features

1. **Password Security**

   - Bcrypt hashing with 12 salt rounds
   - Passwords never stored in plain text

2. **JWT Authentication**

   - Secure token generation
   - Configurable expiration (default: 7 days)
   - Token verification on protected routes

3. **HTTP Security**

   - Helmet.js security headers
   - CORS protection
   - Input validation (Zod schemas)

4. **Database Security**
   - SSL connections required (Neon)
   - Parameterized queries (SQL injection prevention)
   - Cascade deletion for data integrity

---

## 📊 Database Schema

```sql
-- Core Tables
users
  ├── id (UUID, PK)
  ├── email (unique)
  ├── username (unique)
  ├── password (hashed)
  └── timestamps

protocols
  ├── id (UUID, PK)
  ├── userId (FK → users)
  ├── name
  ├── frequency
  ├── targetCount
  └── isActive

compliance_logs
  ├── id (UUID, PK)
  ├── protocolId (FK → protocols, cascade)
  ├── completionDate
  └── note

hazard_zones
  ├── id (UUID, PK)
  ├── name (unique)
  └── color (hex code)

protocol_zones (junction table)
  ├── protocolId (FK → protocols)
  └── zoneId (FK → hazard_zones)
```

---

## 🚀 Deployment

SafeSite is production-ready and can be deployed to multiple platforms:

- **Render.com** (recommended - free tier available)
- **Railway.app** (auto-scaling, free tier available)
- **Fly.io** (global edge deployment)
- **DigitalOcean App Platform**
- **AWS/Azure/GCP** (containerized or serverless)

### Quick Deploy to Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

1. Create a [Neon PostgreSQL](https://neon.tech) database (free tier)
2. Connect GitHub repository to [Render](https://render.com)
3. Set environment variables:
   ```
   DATABASE_URL=your_neon_connection_string
   JWT_SECRET=$(openssl rand -base64 32)
   NODE_ENV=production
   PORT=3000
   ALLOWED_ORIGINS=https://your-frontend.com
   ```
4. Configure service:
   - **Build Command:** `npm install && npm run db:push`
   - **Start Command:** `npm start`
5. Deploy and seed database: `npm run db:seed`

### Detailed Deployment Guide

See **[doc.md/DEPLOYMENT.md](doc.md/DEPLOYMENT.md)** for comprehensive deployment instructions for:

- Render.com
- Railway.app
- Fly.io
- Manual VPS deployment
- Docker deployment
- Production checklist

### Production Checklist

Before deploying to production, review **[doc.md/PRODUCTION_CHECKLIST.md](doc.md/PRODUCTION_CHECKLIST.md)**:

- ✅ Security configuration
- ✅ Environment variables
- ✅ Database setup
- ✅ Monitoring & logging
- ✅ Performance optimization
- ✅ Backup strategy

---

## 📊 Testing

Comprehensive test suite with **60 passing tests**:

```bash
npm test                 # Run all tests
npm run test:coverage    # Generate coverage report
```

**Test Coverage:**

- ✅ Authentication (15 tests)
- ✅ Protocol Management (20 tests)
- ✅ Compliance Logging (15 tests)
- ✅ Hazard Zones (10 tests)

See **[doc.md/test-best-practice.md](doc.md/test-best-practice.md)** for testing strategy.

---

## 📦 Additional Resources

- **[API Documentation](doc.md/API_DOCS.md)** - Complete endpoint reference
- **[Postman Collection](SafeSite-API.postman_collection.json)** - Import and test instantly
- **[Docker Guide](doc.md/DOCKER.md)** - Container deployment instructions
- **[Deployment Guide](doc.md/DEPLOYMENT.md)** - Production deployment options
- **[Portfolio Showcase](doc.md/PORTFOLIO.md)** - Project highlights for clients
- **[GitHub Setup Guide](doc.md/GITHUB_SETUP.md)** - Repository optimization
- **[Quick Demo Script](doc.md/DEMO.md)** - Live demonstration guide
- **[Contributing Guidelines](doc.md/CONTRIBUTING.md)** - How to contribute
- **[Project Completion](doc.md/PROJECT_COMPLETE.md)** - Final summary

---

## 📝 Demo Credentials

After running `npm run db:seed`, you can use:

| Role           | Email                | Password        |
| -------------- | -------------------- | --------------- |
| Safety Officer | officer@safesite.com | SafetyFirst123! |
| Technician 1   | tech1@safesite.com   | SafetyFirst123! |
| Technician 2   | tech2@safesite.com   | SafetyFirst123! |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

ISC License - see [LICENSE](LICENSE) file for details

---

## 👤 Author

**João Marcelo**

- GitHub: [@joao-marcelo](https://github.com/joao-marcelo)
- Portfolio: [SafeSite API Showcase](PORTFOLIO.md)
- LinkedIn: [Your Profile](https://linkedin.com/in/yourprofile)

---

## 🙏 Acknowledgments

- Built with best practices from Frontend Masters' "API Design with Node.js, v5"
- Inspired by real-world industrial safety compliance requirements (NR-10, OSHA standards)
- Designed to demonstrate enterprise-grade TypeScript backend development

---

**Built for industrial safety professionals 🛡️**

**⚡ SafeSite - Ensuring Safety Compliance, One Check at a Time**
