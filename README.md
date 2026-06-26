# API Routes Documentation

## Overview

This backend is built with **Node.js** and **Express.js**, following a RESTful architecture. Routes are organized into two main modules — **Products** and **Users** — each handled by dedicated controllers and protected where necessary by authentication and role-based authorization middleware.

---

## Project Setup

### Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Architecture:** MVC (Model-View-Controller)
- **Auth Strategy:** Cookie-based JWT authentication

### Folder Structure (relevant parts)

```
├── controllers/
│   ├── productController.js
│   └── userController.js
├── middleware/
│   ├── authentication.js
│   ├── catchAsyncError.js
│   └── errorHandler.js
├── models/
│   ├── productModel.js
│   └── userModel.js
├── routes/
│   ├── productRoutes.js
│   └── userRoutes.js
```

### Middleware

Three middleware utilities are used across the application:

**`authentication.js`** — Exports two functions used for route protection:

| Function | Purpose |
|---|---|
| `isAuthenticatedUser` | Verifies the user is logged in via JWT validation |
| `authorizeRoles("admin")` | Restricts access to users with the specified role; always chained after `isAuthenticatedUser` |

**`catchAsyncError`** — A wrapper that wraps async controller functions to catch any unhandled promise rejections and forward them to the global error handler, eliminating the need for try/catch blocks in every controller.

**`errorHandler`** — A global Express error-handling middleware that catches all errors passed via `next(err)` (including those forwarded by `catchAsyncError`) and sends a structured JSON error response with the appropriate status code and message.

---

## Product Routes

**Base paths:** `/products`, `/admin/products`, `/products/reviews`

### Public Routes

| Method | Endpoint | Controller | Description |
|---|---|---|---|
| `GET` | `/products` | `getAllProducts` | Fetch all products (with filtering/pagination) |
| `GET` | `/products/:id` | `getProduct` | Fetch a single product by ID |
| `GET` | `/products/reviews` | `getAllReviews` | Fetch all reviews across products |
| `GET` | `/products/reviews/:id` | `getProduct` | Fetch a specific product's reviews |

### Protected Routes (Authenticated Users)

| Method | Endpoint | Middleware | Controller | Description |
|---|---|---|---|---|
| `POST` | `/products/reviews/:id` | `isAuthenticatedUser` | `createProductReview` | Submit a review for a product |
| `DELETE` | `/products/reviews/:id` | `isAuthenticatedUser` | `deleteReview` | Delete own review |

### Admin-Only Routes

| Method | Endpoint | Middleware | Controller | Description |
|---|---|---|---|---|
| `POST` | `/admin/products/new` | `isAuthenticatedUser`, `authorizeRoles("admin")` | `createProduct` | Create a new product |
| `PUT` | `/admin/products/:id` | `isAuthenticatedUser`, `authorizeRoles("admin")` | `updateProduct` | Update an existing product |
| `DELETE` | `/admin/products/:id` | `isAuthenticatedUser`, `authorizeRoles("admin")` | `deleteProduct` | Delete a product |
| `GET` | `/admin/products/:id` | — | `getProduct` | Get product by ID (admin path) |

> **Note:** The `/products/reviews` route is declared before `/products/:id` to prevent Express from treating `reviews` as a dynamic `:id` parameter.

---

## User Routes

**Base paths:** `/`, `/me`, `/admin/user`

### Auth Routes (Public)

| Method | Endpoint | Controller | Description |
|---|---|---|---|
| `POST` | `/register` | `registerUser` | Register a new user account |
| `POST` | `/login` | `loginUser` | Log in and receive auth cookie |
| `POST` | `/forgot-password` | `forgotPassword` | Send password reset email |
| `PUT` | `/reset-password/:token` | `resetPassword` | Reset password using token from email |

### Protected Routes (Authenticated Users)

| Method | Endpoint | Middleware | Controller | Description |
|---|---|---|---|---|
| `POST` | `/logout` | `isAuthenticatedUser` | `logoutUser` | Log out and clear auth cookie |
| `GET` | `/me` | `isAuthenticatedUser` | `getMyDetails` | Get currently logged-in user's profile |
| `PATCH` | `/update-password` | `isAuthenticatedUser` | `updatePassword` | Change password (requires old password) |
| `PATCH` | `/me/update` | `isAuthenticatedUser` | `updateProfile` | Update name, email, avatar, etc. |

### Admin-Only Routes

| Method | Endpoint | Middleware | Controller | Description |
|---|---|---|---|---|
| `GET` | `/admin/users` | `isAuthenticatedUser`, `authorizeRoles("admin")` | `getAllusers` | Fetch list of all registered users |
| `GET` | `/admin/user/:id` | `isAuthenticatedUser`, `authorizeRoles("admin")` | `getSingleUser` | Get a specific user by ID |
| `DELETE` | `/admin/user/:id` | `isAuthenticatedUser`, `authorizeRoles("admin")` | `deleteProfile` | Delete a user account |
| `PUT` | `/admin/user/:id` | `isAuthenticatedUser`, `authorizeRoles("admin")` | `updateRoles` | Update a user's role (e.g. promote to admin) |

---

## Data Models

### Product Model (`productSchema`)

**Collection:** `products` — defined in `models/productModel.js`

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `name` | String | ✅ | — | Trimmed |
| `description` | String | ✅ | — | — |
| `price` | Number | ✅ | — | — |
| `average_rating` | Number | ❌ | `0` | Computed from reviews |
| `category` | String | ✅ | — | — |
| `stock` | Number | ✅ | `1` | — |
| `images` | Array | — | — | See sub-document below |
| `reviews` | Array | — | — | See sub-document below |

**`images[]` sub-document**

| Field | Type | Required |
|---|---|---|
| `public_id` | String | ✅ |
| `url` | String | ✅ |

**`reviews[]` sub-document**

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `userId` | ObjectId | — | — | Ref → `User` |
| `rating` | Number | ✅ | `0` | — |
| `comment` | String | ✅ | — | — |

---

### User Model (`userSchema`)

**Collection:** `users` — defined in `models/userModel.js`

**Dependencies:** `bcryptjs` (password hashing), `jsonwebtoken` (JWT), `validator` (email validation), `crypto` (reset token)

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `name` | String | ✅ | — | — |
| `email` | String | ✅ | — | Unique; validated with `validator.isEmail` |
| `password` | String | ✅ | — | Min 8 chars; `select: false` (excluded from queries by default) |
| `avatar` | Object | ✅ | — | See sub-document below |
| `role` | String | ❌ | `"User"` | Set to `"admin"` to grant admin access |
| `resetPasswordToken` | String | ❌ | — | Hashed token stored on forgot-password request |
| `resetPasswordExpire` | Date | ❌ | — | Expiry set to 15 hours from token generation |

**`avatar` sub-document**

| Field | Type | Required |
|---|---|---|
| `public_id` | String | ✅ |
| `url` | String | ✅ |

**Instance Methods**

| Method | Description |
|---|---|
| `getJWTToken()` | Signs and returns a JWT using `JWT_SECRET` and `JWT_EXPIRE` from env |
| `comparePassword(entered)` | Compares a plain-text password against the stored bcrypt hash |
| `getResetPasswordToken()` | Generates a raw reset token, stores its SHA-256 hash on the document, sets 15hr expiry, and returns the raw token to be emailed |

**Hooks**

- **`pre("save")`** — Automatically hashes the password with bcrypt (10 salt rounds) before saving, but only when the `password` field has been modified.
