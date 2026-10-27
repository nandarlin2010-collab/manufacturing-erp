# Manufacturing ERP Starter Project

This repository contains a starter implementation for a manufacturing ERP platform with a simple full-stack setup:

- Backend API built with Node.js + Express
- SQLite database for MVP persistence
- React frontend dashboard for operations overview
- ERP modules scaffolded for inventory, purchasing, production, sales, supplier management, customer management, and reporting

## Project Structure

```bash
.
├── backend/
│   ├── package.json
│   ├── src/
│   │   ├── db.js
│   │   └── index.js
│   └── .env.example
├── frontend/
│   ├── package.json
│   ├── index.html
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       └── styles.css
├── ARCHITECTURE.md
├── README.md
├── .gitignore
└── LICENSE
```

## Tech Stack

- Backend: Node.js, Express, SQLite
- Frontend: React + Vite
- API: REST endpoints
- Database: SQLite for lightweight MVP storage

## Demo Login

- Email: admin@hnh.com
- Password: admin123

## Quick Start

### 1) Install backend dependencies

```bash
cd backend
npm install
```

### 2) Install frontend dependencies

```bash
cd ../frontend
npm install
```

### 3) Start backend

```bash
cd backend
npm run dev
```

Backend will run on:

```bash
http://localhost:4000
```

### 4) Start frontend

```bash
cd frontend
npm run dev
```

Frontend will run on:

```bash
http://localhost:5173
```

## API Endpoints

- POST /api/auth/login
- GET /api/health
- GET /api/dashboard
- GET /api/products
- GET /api/inventory
- GET /api/suppliers
- GET /api/customers
- GET /api/purchase-orders
- GET /api/sales-orders
- GET /api/work-orders
- POST /api/products
- POST /api/suppliers
- POST /api/customers
- POST /api/sales-orders
- POST /api/work-orders
- POST /api/inventory/adjust

## Starter Modules Included

- Inventory management
- Purchase orders
- Production planning
- Sales orders
- Customer management
- Supplier management
- Dashboard metrics
- Reporting summary

## Notes

This starter is designed to provide a clean foundation for a manufacturing ERP system and can be expanded into a full enterprise application over time.
