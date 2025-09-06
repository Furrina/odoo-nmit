# __Problem Statement:__ _EcoFinds - Sustainable E-commerce Marketplace_

![EcoFinds Logo](https://img.shields.io/badge/EcoFinds-Sustainable%20Shopping-green?style=for-the-badge&logo=leaf)

EcoFinds is a modern, sustainable e-commerce marketplace focused on pre-loved items. It's a full-stack web application that allows users to buy and sell second-hand goods, promoting sustainable shopping practices and reducing waste.

 ### Team: ___Epoch Wizards___
---
 <!-- ### <ins>__Team members with email__</ins>  -->
 
| Name | Email |  
| :-------| -----|  
| Aryan Dawra | aryandawra2020@gmail.com |
| Reyan Shah | reyanshah016@gmail.com|
| Rutvij Borisagar | rutvijborisagar@gmail.com |
| Rian Lavingia | rianlavingia@gmail.com|

## 🌱 Features

### Core Functionality
- **User Authentication**: Secure login/registration system with local authentication
- **Product Management**: Create, edit, and manage product listings
- **Shopping Cart**: Add items to cart with fixed quantity (1 per item)
- **Order Processing**: Complete purchase flow with Razorpay payment integration
- **Transaction History**: View complete purchase history
- **User Dashboard**: Manage profile, listings, and view statistics

### Advanced Features
- **Category Management**: Organize products by categories (Electronics, Clothing, Books, etc.)
- **Product Search & Filtering**: Find products by category, price, and keywords
- **Image Upload**: Support for product images with base64 conversion
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Updates**: Live cart and order updates
- **Secure Payments**: Razorpay integration for secure transactions

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Shadcn/ui** for UI components
- **TanStack Query** for server state management
- **React Hook Form** with Zod validation
- **Wouter** for client-side routing
- **Lucide React** for icons

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Prisma ORM** for database operations
- **Passport.js** for authentication
- **bcryptjs** for password hashing
- **Express Session** for session management
- **Razorpay** for payment processing

### Database
- **Microsoft SQL Server** with Prisma ORM
- **In-memory session store** for development

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Microsoft SQL Server** (or SQL Server Management Studio)
- **Razorpay Account** (for payment processing)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd EcoFinds
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:

```env
# Database Configuration (SQL Server)
DATABASE_URL="sqlserver://YOUR_SERVER:1433;database=ecofinds;user=YOUR_USER;password=YOUR_PASSWORD;encrypt=false;trustServerCertificate=true"
DB_HOST=YOUR_SERVER
DB_PORT=1433
DB_USER=YOUR_USER
DB_PASSWORD=YOUR_PASSWORD
DB_NAME=ecofinds

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# Server Configuration
PORT=5000
NODE_ENV=development

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### 4. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed the database with sample data
npm run db:seed
```

### 5. Start Development Server
```bash
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5000
- **Backend API**: http://localhost:5000/api

## 📁 Project Structure

```
EcoFinds/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   └── index.css       # Global styles
│   └── index.html
├── server/                 # Backend Express application
│   ├── auth.ts            # Authentication setup
│   ├── db.ts              # Database connection
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   ├── razorpay.ts        # Payment integration
│   └── seed.ts            # Database seeding
├── prisma/
│   └── schema.prisma      # Database schema
├── .env                   # Environment variables
├── package.json
└── README.md
```

## 🎯 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema to database
npm run db:migrate      # Run database migrations
npm run db:seed         # Seed database with sample data

# Utilities
npm run check           # TypeScript type checking
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/user` - Get current user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product
- `PATCH /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `DELETE /api/cart/:productId` - Remove item from cart

### Orders
- `GET /api/orders` - Get user's orders
- `POST /api/orders` - Create new order

### Payment
- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/verify` - Verify payment

## 🎨 UI Components

The project uses **Shadcn/ui** components built on **Radix UI** primitives:

- **Forms**: Input, Button, Textarea, Select, Checkbox
- **Layout**: Card, Dialog, Sheet, Tabs
- **Feedback**: Toast, Alert, Badge
- **Navigation**: Breadcrumb, Pagination
- **Data Display**: Table, Avatar, Progress

## 🔐 Authentication Flow

1. **Registration**: Users create accounts with email, password, and profile info
2. **Login**: Secure authentication with bcryptjs password hashing
3. **Session Management**: Express sessions with in-memory store
4. **Authorization**: Protected routes with authentication middleware

## 💳 Payment Integration

- **Razorpay Integration**: Secure payment processing
- **Order Creation**: Server-side order creation with verification
- **Payment Verification**: HMAC signature verification
- **Transaction History**: Complete purchase history tracking

## 🗄️ Database Schema

### Core Models
- **User**: User accounts and profiles
- **Product**: Product listings with categories
- **Cart/CartItem**: Shopping cart functionality
- **Order/OrderItem**: Order management and history
- **Category**: Product categorization

### Key Relationships
- Users can have multiple products and orders
- Products belong to categories and users
- Orders contain multiple order items
- Cart items link products to user carts

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Environment Variables for Production
- Set `NODE_ENV=production`
- Use secure `SESSION_SECRET`
- Configure production database URL
- Set up Razorpay production keys
    