# NSS Open Project - NGO Registration and Donation Management System

## ⚠️ **ALERT**
Admin Sign Up requires SuperAdmin's approval. The SuperAdmin may not be able to approve immediately:

Hence, use the Mock Admin details:
- **E-mail:** mockAdmin@gmail.com
- **Password:** 123456
- **Role:** Admin

---

## 🔗 Deployed Project Link
View the live project here: [**Live Demo**](https://nss-open-project.vercel.app/) 🌐

---

## 👨‍💻 Author

- Bhavik - Frontend developer and UI/UX designer
- Ishaan Tripathi - Frontend developer and QA Enginner
- Shivam Kumar Jha - Backend developer and Database Engineer

---

## 🚀 Introduction
A full-stack MERN application that manages a donation platform with admin approval workflows, user authentication, email verification along with Stripe payment gateway integration.

---

## 🎯 Project Overview

This project is a comprehensive donation management system that allows users to:
- Create accounts and authenticate securely
- Verify email via OTP
- Reset passwords through email verification
- Donate to various causes
- Process payments using Stripe
- Manage donations through personalized dashboards
- Administer causes and donors (admin role)

The platform features a role-based access system with two user types:
- **Donor**: Users who can browse causes, make donations, and track their donation history
- **Admin**: Users who can create causes, manage donations and donors. They require the SuperAdmin approval for Sign Up.

---

## 🛠️ Tech Stack

### Frontend (Client)
- **React** - JavaScript library for building interactive UI components
- **Tailwind CSS** - Utility-first CSS framework for styling
- **React Router DOM** - Client-side routing and navigation
- **Axios** - Handling API requests
- **Stripe React** (react-stripe-js) - Stripe payment gateway integration for React
- **React Toastify** - Toast notifications for user feedback

### Backend (Server)
- **Node.js** - JavaScript runtime
- **Express** - Web framework for building REST APIs
- **MongoDB** - NoSQL database for data persistence
- **Mongoose** - ODM (Object Data Modeling) for MongoDB
- **JWT (JsonWebToken)** - Token-based authentication
- **Bcryptjs** - Password hashing and security
- **Stripe** - Payment processing integration
- **Nodemailer** - Sending emails for verification and reset OTPs
- **CORS** - Cross-Origin Resource Sharing middleware to allow frontend-backend integration
- **Cookie Parser** - Cookie parsing middleware
- **Dotenv** - Environment variable management

### Development Tools
- **ESLint** - Code linting for maintaining code quality
- **Nodemon** - Auto-restart development server on file changes

---

## 🔑 Key Features

### Authentication & Security
- User registration with email verification
- Secure password hashing using bcryptjs
- JWT-based authentication
- Password reset via email OTP
- Account verification via email OTP
- Profile management
- Role-based access control (donor/admin)

### Payment Integration
- Stripe payment processing
- Secure donation transactions
- Payment status tracking

### Admin Features
- SuperAdmin approval workflow for new admins
- Cause creation and management
- Donation management and tracking
- Donor management

### User Features
- Donor dashboard to track donations
- Donation history tracking

### Email Services
- OTP-based email verification
- Password reset emails
- Email notifications

---

## 🔐 Security Features

- **Password Hashing**: Bcryptjs for secure password storage
- **JWT Authentication**: Stateless authentication with tokens
- **CORS Protection**: Controlled cross-origin requests
- **Input Validation**: Server-side validation of inputs
- **Secure Cookies**: Cookies for storing sensitive data
- **Email Verification**: OTP-based email verification for account activation
- **Role-Based Access Control**: Different permissions for donors and admins

---

## 📚 Notes

- The project follows RESTful API principles
- MongoDB is used for data persistence
- React Context API is used for state management
- Stripe handles all payment processing
- Email verification and password reset use OTP-based authentication
- SuperAdmin approval workflow ensures security in admin account creation

---

## 🚀 Getting Started - Local Development Setup

### Prerequisites
- Node.js and npm installed
- MongoDB instance running
- Stripe account for payment processing
- Email service provider credentials (Nodemailer setup)

### Environment Variables

Create a `.env` file in the `server` directory with the following variables:

```
PORT=3000
ALLOWED_ORIGINS=http://localhost:5173
JWT_SECRET=your_jwt_secret_key
MONGODB_URI=your_mongodb_connection_string
NODE_ENV='development'

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Email Configuration
SENDER_EMAIL=your_email@gmail.com
SMTP_USER=your_smtp_userID
SMTP_PWD=your_smtp_password

# Frontend URL
CLIENT_URL=http://localhost:5173
```

Create a `.env` file in the `client` directory with the following variables:

```
VITE_BACKEND_URL=http://localhost:3000
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

### Installation

#### Frontend Setup
```bash
cd client
npm install
npm run dev
```

#### Backend Setup
```bash
cd server
npm install
npm run server
```

---

## 📝 API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `POST /send-verify-otp` - Send email verification OTP
- `POST /verify-email` - Verify email with OTP
- `POST /send-reset-otp` - Send password reset OTP
- `POST /reset-password` - Reset password with OTP

### User Routes (`/api/user`)
- `GET /profile` - Get user profile
- `GET /donations` - Get user's donations

### Cause Routes (`/api/cause`)
- `GET /` - Get all causes
- `GET /:id` - Get specific cause
- `POST /` - Create new cause (admin only)
- `PUT /:id` - Update cause (admin only)
- `DELETE /:id` - Delete cause (admin only)

### Payment Routes (`/api/payment`)
- `POST /create-payment-intent` - Create Stripe payment intent
- `POST /verify-payment` - Verify payment completion
- `GET /donation-history` - Get donation history

---

## 📁 Project Structure

```
nss_open_project/
├── client/                          # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/              # Reusable React components
│   │   │   ├── CauseCard.jsx        # Component for displaying causes
│   │   │   ├── Header.jsx           # Header/top navigation component
│   │   │   └── Navbar.jsx           # Navigation bar component
│   │   ├── pages/                   # Page components (routes)
│   │   │   ├── Home.jsx             # Landing page
│   │   │   ├── Login.jsx            # User login page
│   │   │   ├── VerifyEmail.jsx      # Email verification page
│   │   │   ├── ResetPassword.jsx    # Password reset page
│   │   │   ├── Profile.jsx          # User profile management
│   │   │   ├── DonorDashboard.jsx   # Dashboard for donors
│   │   │   ├── DonationPayment.jsx  # Payment/checkout page
│   │   │   ├── PaymentConfirmation/ # Payment confirmation page
│   │   │   ├── AdminDashboard.jsx   # Dashboard for admins
│   │   │   ├── AdminApproval.jsx    # Admin approval management page
│   │   │   └── WaitingForApproval.jsx # Page shown while awaiting admin approval
│   │   ├── context/
│   │   │   └── AppContext.jsx       # Global app state using React Context API
│   │   ├── assets/
│   │   │   └── assets.js            # Asset imports and exports
│   │   ├── App.jsx                  # Main app component with routing
│   │   ├── main.jsx                 # React entry point
│   │   ├── index.css                # Global CSS styles
│   │   └── vite.config.js           # Vite configuration
│   ├── index.html                   # HTML template
│   ├── package.json                 # Client dependencies and scripts
│   └── eslint.config.js             # ESLint configuration
│
└── server/                          # Backend (Node.js + Express)
    ├── controllers/                 # Business logic for routes
    │   ├── auth.controller.js       # Authentication logic (register, login, verify, reset)
    │   ├── user.controller.js       # User management logic
    │   ├── cause.controller.js      # Cause management logic
    │   └── payment.controller.js    # Payment/donation processing logic
    ├── routes/                      # API endpoint definitions
    │   ├── auth.route.js            # Authentication endpoints
    │   ├── user.route.js            # User management endpoints
    │   ├── cause.route.js           # Cause management endpoints
    │   └── payment.route.js         # Payment processing endpoints
    ├── models/                      # Mongoose schema definitions
    │   ├── user.model.js            # User data schema
    │   ├── cause.model.js           # Cause data schema
    │   └── donation.model.js        # Donation/payment data schema
    ├── middlewares/                 # Express middleware
    │   └── userAuth.middleware.js   # Authentication/authorization checks
    ├── config/                      # Configuration files
    │   ├── mongodb.js               # MongoDB connection setup
    │   ├── nodemailer.config.js     # Email service configuration
    │   ├── stripe.config.js         # Stripe payment configuration
    │   └── emailTemplate.config.js  # Email template definitions
    ├── db/
    │   └── mongodb.js               # MongoDB database connection
    ├── index.js                     # Server entry point
    ├── constants.js                 # Application constants
    ├── package.json                 # Server dependencies and scripts
    └── .env                         # Environment variables (not in repo)
```

---

## 📊 Data Models

### User Schema
- **name**: User's full name
- **email**: User's email address (unique)
- **password**: Hashed password
- **role**: Either 'donor' or 'admin'
- **isAccountVerified**: Email verification status
- **verifyOTP**: One-time password for email verification
- **resetOTP**: One-time password for password reset
- **adminApprovalStatus**: 'pending', 'approved', or 'denied' (for admin users)
- **donations**: Array of donation references (donor only)
- **totalDonated**: Total amount donated by user (donor only)

### Cause Schema
- **name**: Cause name (unique)
- **description**: Detailed description of the cause
- **createdAt**: Creation timestamp
- **updatedAt**: Last update timestamp
- **createdBy**: Reference to admin who created the cause

### Donation Schema
- **donorId**: Reference to the donor user
- **causeId**: Reference to the cause being donated to
- **causeName**: Snapshot of cause name at donation time
- **amount**: Donation amount
- **status**: 'pending', 'success', or 'failed'
- **stripePaymentIntentId**: Stripe payment tracking ID
- **currency**: Currency code (default: 'usd')
- **paymentMethod**: Payment method used (default: 'card')
- **createdAt**: Donation timestamp

---
