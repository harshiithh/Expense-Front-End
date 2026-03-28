# 💰 ExpenseOS — Full-Stack Expense Tracker

> A professional, portfolio-grade full-stack expense tracking application built with **React + Vite**, **Spring Boot**, and **MySQL**.

![Tech Stack](https://img.shields.io/badge/Frontend-React%20%2B%20Vite%20%2B%20Tailwind-blue)
![Tech Stack](https://img.shields.io/badge/Backend-Spring%20Boot%203.2-green)
![Tech Stack](https://img.shields.io/badge/Database-MySQL%208-orange)
![Tech Stack](https://img.shields.io/badge/Auth-JWT-red)

---

## 📁 Project Structure

```
expenseos/
├── backend/                    ← Spring Boot application
│   ├── src/main/java/com/expenseos/
│   │   ├── config/             ← Security, CORS, DataInitializer
│   │   ├── controller/         ← REST Controllers
│   │   ├── dto/                ← Request & Response DTOs
│   │   ├── entity/             ← JPA Entities
│   │   ├── exception/          ← Global Exception Handling
│   │   ├── repository/         ← Spring Data JPA Repositories
│   │   ├── security/           ← JWT Filter, UserDetailsService
│   │   ├── service/            ← Service Interfaces + Implementations
│   │   └── util/               ← SecurityUtils
│   └── src/main/resources/
│       └── application.properties
├── frontend/                   ← React + Vite application
│   ├── src/
│   │   ├── components/         ← Reusable UI components
│   │   │   ├── common/         ← StatCard, Modal, Table, etc.
│   │   │   └── layout/         ← Sidebar, Header, Layout
│   │   ├── context/            ← AuthContext (JWT state)
│   │   ├── pages/              ← Dashboard, Expenses, Income, Budgets, Analytics
│   │   ├── services/           ← Axios API layer
│   │   └── utils/              ← Formatters
│   └── index.html
├── schema.sql                  ← MySQL DDL + seed data
└── README.md
```

---

## ⚡ Prerequisites

| Tool | Version |
|------|---------|
| Java | 17+ |
| Maven | 3.8+ |
| Node.js | 18+ |
| MySQL | 8.0+ |

---

## 🚀 How to Run

### Step 1 — MySQL Setup

```bash
# Login to MySQL
mysql -u root -p

# Create the database (Spring Boot will create tables automatically)
CREATE DATABASE expenseos_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# Or run the full schema file:
mysql -u root -p < schema.sql
```

### Step 2 — Configure Backend

Edit `backend/src/main/resources/application.properties`:

```properties
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

### Step 3 — Run Backend

```bash
cd backend
# Run with default profile (PostgreSQL)
mvn spring-boot:run

# OR Run with dev profile (MySQL)
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

Backend starts at **http://localhost:8080**

> On first run, Spring Boot auto-creates all tables and seeds 13 default categories.

### Step 4 — Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend starts at **http://localhost:5173**

---

## 📡 REST API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT token |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses` | Get all expenses |
| POST | `/api/expenses` | Add expense |
| PUT | `/api/expenses/{id}` | Update expense |
| DELETE | `/api/expenses/{id}` | Delete expense |
| GET | `/api/expenses/range?start=&end=` | Filter by date range |
| GET | `/api/expenses/category/{id}` | Filter by category |
| GET | `/api/expenses/search?q=` | Search expenses |
| GET | `/api/expenses/export/csv` | Export to CSV |

### Income
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/income` | Get all income |
| POST | `/api/income` | Add income |
| PUT | `/api/income/{id}` | Update income |
| DELETE | `/api/income/{id}` | Delete income |

### Budgets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/budgets` | Current month budgets |
| GET | `/api/budgets/{month}/{year}` | Budgets for specific month |
| POST | `/api/budgets` | Create/update budget |
| DELETE | `/api/budgets/{id}` | Delete budget |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/dashboard` | Full dashboard data |
| GET | `/api/analytics/categories?month=&year=` | Category breakdown |
| GET | `/api/analytics/trends?year=` | Monthly trends |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | All categories |
| GET | `/api/categories/expense` | Expense categories |
| GET | `/api/categories/income` | Income categories |

---

## 🎨 Features

| Feature | Status |
|---------|--------|
| JWT Authentication | ✅ |
| User Registration / Login | ✅ |
| Expense CRUD | ✅ |
| Income CRUD | ✅ |
| Budget Management + Alerts | ✅ |
| Category Analysis (Pie Chart) | ✅ |
| Monthly Trends (Area/Bar Chart) | ✅ |
| Net Savings Chart | ✅ |
| Dashboard with KPIs | ✅ |
| Export Expenses to CSV | ✅ |
| Search Transactions | ✅ |
| Date Range Filtering | ✅ |
| Dark Mode UI | ✅ |
| Responsive (Mobile-friendly) | ✅ |
| Global Exception Handling | ✅ |
| Password Encryption (BCrypt) | ✅ |

---

## 🏗️ Architecture

```
React Frontend (Vite + Tailwind)
       ↓  Axios HTTP + JWT Bearer Token
Spring Boot REST API (Port 8080)
       ↓  Spring Security Filter Chain
   JWT Validation
       ↓  Service Layer (Business Logic)
   JPA Repository
       ↓
   MySQL Database
```

---

## 🔐 Security Flow

1. User registers → password BCrypt-hashed → saved to MySQL
2. User logs in → JWT token generated (24h expiry) → returned to client
3. Client stores JWT in `localStorage`
4. Every request adds `Authorization: Bearer <token>` header
5. `JwtAuthFilter` validates token on every protected endpoint
6. `SecurityContextHolder` stores authenticated user

---

## 📊 Database Schema

| Table | Key Columns |
|-------|-------------|
| `users` | id, email, password, full_name |
| `categories` | id, name, icon, color, type |
| `expenses` | id, amount, description, date, category_id, user_id |
| `income` | id, amount, description, date, category_id, user_id |
| `budgets` | id, category_id, user_id, limit_amount, month, year |

---

## 🎓 Viva Explanation Points

1. **Why Spring Boot?** — Convention over configuration, embedded Tomcat, easy REST API creation
2. **Why JWT?** — Stateless auth, no server-side sessions, scalable
3. **Why BCrypt?** — Adaptive hashing, salted passwords, industry standard
4. **Why React?** — Component-based UI, virtual DOM, rich ecosystem
5. **Layered Architecture** — Controller → Service → Repository → Entity (Separation of concerns)
6. **CORS** — Configured to allow only `localhost:5173` in development

---

## 👨‍💻 Author

Built as a Final Year Project — ExpenseOS v1.0.0
