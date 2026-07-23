# Blue Bell Bakes 🎂

A full-stack e-commerce application for a bakery, built with a **Laravel REST API** backend and a **React** frontend.

---

## Overview

Blue Bell Bakes is a complete e-commerce platform with a customer-facing storefront and an admin panel for managing products, categories, and orders. The project was built to demonstrate full-stack development: REST API design, token-based authentication, relational database modelling, and a modern React interface.

---

## Tech Stack

**Backend**
- PHP 8 / Laravel 11
- PostgreSQL
- Laravel Sanctum (token authentication)
- RESTful API architecture

**Frontend**
- React 18 (Vite)
- Tailwind CSS
- Axios
- React Router
- Chart.js / react-chartjs-2

---

## Features

### Admin Panel
- Secure admin login with token-based authentication (Laravel Sanctum)
- Dashboard with key metrics — total revenue, orders, products and categories
- Analytics charts (product prices, category distribution)
- **Product management** — create, read, update and delete products with image upload
- **Category management** — full CRUD for product categories
- **Order management** — view orders and update order status
- **Soft deletes** — products moved to trash can be restored or permanently deleted
- Product search and pagination
- Dark mode

### Customer Side
- Browse products by category
- Product details with images and pricing
- Order placement
- Order history

### API
- RESTful endpoints following standard conventions
- Request validation with meaningful error responses
- Protected routes via `auth:sanctum` middleware
- Resource-based routing (`apiResource`)

---

## Project Structure

```
BlueBellBakes/
├── bluebell_backend/     # Laravel REST API
│   ├── app/
│   │   ├── Http/Controllers/API/
│   │   └── Models/
│   ├── database/migrations/
│   └── routes/api.php
└── frontend/             # React application (Vite)
    ├── src/
    │   ├── components/
    │   └── pages/
    └── package.json
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Register a new user |
| POST | `/api/login` | Authenticate and receive a token |
| POST | `/api/logout` | Invalidate the current token |
| GET | `/api/products` | List products (paginated, searchable) |
| POST | `/api/products` | Create a product |
| PUT | `/api/products/{id}` | Update a product |
| DELETE | `/api/products/{id}` | Soft-delete a product |
| GET | `/api/products-trash` | List soft-deleted products |
| POST | `/api/products-restore/{id}` | Restore a deleted product |
| DELETE | `/api/products-force-delete/{id}` | Permanently delete a product |
| GET | `/api/categories` | List categories |
| POST | `/api/categories` | Create a category |
| PUT | `/api/categories/{id}` | Update a category |
| DELETE | `/api/categories/{id}` | Delete a category |
| GET | `/api/orders` | List orders |
| POST | `/api/orders` | Create an order |
| PUT | `/api/orders/{id}/status` | Update order status |
| GET | `/api/dashboard/stats` | Dashboard statistics |

All routes except `register` and `login` require authentication via a Bearer token.

---

## Getting Started

### Prerequisites
- PHP 8.2+
- Composer
- Node.js 18+
- PostgreSQL

### Backend Setup

```bash
cd bluebell_backend

# Install dependencies
composer install

# Create environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure your database in .env, then run migrations
php artisan migrate

# Create the storage symlink (for product images)
php artisan storage:link

# Start the development server
php artisan serve
```

The API will be available at `http://127.0.0.1:8000`.

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## Environment Variables

Configure the following in `bluebell_backend/.env`:

```
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

---

## Author

**Sabitha Mohandas**
Laravel / PHP Developer

- LinkedIn: [linkedin.com/in/sabitha-mohandas](https://www.linkedin.com/in/sabitha-mohandas-)
- Portfolio: [sabitha-mohandas.netlify.app](https://sabitha-mohandas.netlify.app)

---

## License

This project is available for review as part of a professional portfolio.
