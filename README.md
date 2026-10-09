# 🩸 Sanjeevani Backend

**A REST API for Blood Donation and Blood Request Management**

Sanjeevani is a healthcare backend application designed to support blood donors and hospitals by providing user authentication, donor profile management, and blood request management. It provides RESTful APIs that can be integrated with the Sanjeevani frontend.

The backend is built using Node.js and Express.js, with Prisma ORM and PostgreSQL for data persistence.

## ✨ Features

### 🔐 Authentication and Account Management

* User registration with name, email, password, and role.
* Support for two user roles: `DONOR` and `HOSPITAL`.
* Password hashing using bcrypt.
* Email verification using one-time passwords (OTP).
* User login with JSON Web Token (JWT) authentication.
* Access token and refresh token generation.
* Refresh token rotation.
* Forgot-password and reset-password functionality.

### 👤 User Profile Management

* Retrieve the authenticated user's profile.
* Update profile details, including name, phone number, address, and blood group.
* Store geographical coordinates using latitude and longitude.

### 🩸 Blood Request Management

* Create blood requests for specific blood groups.
* Specify the number of units required.
* Record urgency levels and request locations.
* Retrieve blood requests with optional blood-group and status filters.
* Update request status to `PENDING`, `FULFILLED`, or `CANCELLED`.
* Protect request creation and status updates with authentication.

### 📚 API Documentation

* Swagger UI for interactive API documentation.
* OpenAPI 3.0 specification.
* JWT Bearer authentication support in Swagger.

### 🗄️ Database Management

* PostgreSQL database integration.
* Prisma ORM for database queries and schema management.
* Data models for users, OTPs, refresh tokens, blood requests, and hospital blood inventory.

## 🛠️ Technology Stack

| Technology         | Purpose                               |
| ------------------ | ------------------------------------- |
| Node.js            | JavaScript runtime                    |
| Express.js 5       | REST API framework                    |
| PostgreSQL         | Relational database                   |
| Prisma ORM         | Database access and schema management |
| JWT                | Token-based authentication            |
| bcrypt             | Password hashing                      |
| Nodemailer         | Email utility                         |
| Swagger UI Express | Interactive API documentation         |
| swagger-jsdoc      | API specification generation          |
| dotenv             | Environment variable configuration    |
| CORS               | Cross-origin request handling         |

## 🏗️ Architecture

```text
             Sanjeevani Frontend
                     |
                     | HTTP / JSON
                     v
             Express.js REST API
                     |
          +----------+----------+
          |          |          |
          v          v          v
     Auth Routes  User Routes  Request Routes
          |          |          |
          v          v          v
     Controllers  Controllers  Controllers
          |          |          |
          +----------+----------+
                     |
                     v
                 Prisma ORM
                     |
                     v
                PostgreSQL
```

The Express application exposes separate route modules for authentication, user profiles, and blood requests. Controllers handle the business logic, while Prisma communicates with the PostgreSQL database.

## 📂 Project Structure

```text
sanjeevani-backend/
│
├── prisma/
│   └── schema.prisma
│
├── src/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── request.controller.js
│   │   └── user.controller.js
│   │
│   ├── middlewares/
│   │   └── auth.middleware.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── request.routes.js
│   │   └── user.routes.js
│   │
│   └── utils/
│       ├── email.js
│       └── otp.js
│
├── .gitignore
├── index.js
├── package.json
├── package-lock.json
├── prisma.config.ts
└── README.md
```

## 🚀 Getting Started

### Prerequisites

Install the following before running the project:

* Node.js and npm
* PostgreSQL database, either locally or hosted
* Git
* A code editor such as Visual Studio Code

### 1. Clone the repository

```bash
git clone https://github.com/Rishithashetty-11/sanjeevani-backend.git
cd sanjeevani-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root directory.

```env
PORT=5000

DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/sanjeevani_db"

JWT_SECRET="replace_with_a_strong_random_secret"
REFRESH_SECRET="replace_with_another_strong_random_secret"
```

Replace the database credentials with your PostgreSQL configuration. Use strong, unique secrets for both JWT variables.

**Important:** Never commit your `.env` file or expose database credentials and authentication secrets publicly.

### 4. Generate the Prisma Client

```bash
npx prisma generate
```

### 5. Set up the database

For a new development database, apply the Prisma schema using migrations:

```bash
npx prisma migrate dev --name init
```

If migrations already exist in the repository or your database is already configured, use the appropriate migration workflow instead of creating a duplicate initial migration.

### 6. Start the backend

For development with automatic restarts:

```bash
npm run dev
```

For regular execution:

```bash
npm start
```

The server uses port `5000` by default unless another port is configured through the `PORT` environment variable.

## 🌐 API Reference

**Base URL:** `http://localhost:5000`

### Health Check

| Method | Endpoint  | Description                          |
| ------ | --------- | ------------------------------------ |
| GET    | `/health` | Checks whether the server is running |

Example response:

```json
{
  "status": "OK"
}
```

### Authentication APIs

All paths below are relative to the base URL.

| Method | Endpoint                    | Description                      |
| ------ | --------------------------- | -------------------------------- |
| POST   | `/api/auth/register`        | Register a new donor or hospital |
| POST   | `/api/auth/verify-email`    | Verify email using OTP           |
| POST   | `/api/auth/login`           | Authenticate a user              |
| POST   | `/api/auth/refresh-token`   | Obtain a new access token        |
| POST   | `/api/auth/forgot-password` | Request a password-reset OTP     |
| POST   | `/api/auth/reset-password`  | Reset the password using OTP     |

### User Profile APIs

| Method | Endpoint             | Description                               |
| ------ | -------------------- | ----------------------------------------- |
| GET    | `/api/users/profile` | Retrieve the authenticated user's profile |
| PUT    | `/api/users/profile` | Update the authenticated user's profile   |

These endpoints require a valid access token.

Include the following HTTP header:

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Blood Request APIs

| Method | Endpoint                   | Description                     |
| ------ | -------------------------- | ------------------------------- |
| GET    | `/api/requests`            | Retrieve blood requests         |
| POST   | `/api/requests`            | Create a blood request          |
| PUT    | `/api/requests/:id/status` | Update a blood request's status |

The request-list endpoint supports optional query parameters such as `bloodGroup` and `status`.

Example:

```http
GET /api/requests?bloodGroup=O%2B&status=PENDING
```

Creating a request requires a valid access token. A request includes fields such as:

```json
{
  "bloodGroup": "O+",
  "unitsRequired": 2,
  "urgency": "Urgent",
  "location": "Warangal",
  "latitude": 17.9689,
  "longitude": 79.5941
}
```

The values above are an example request payload, not a live blood availability result.

## 📖 Swagger API Documentation

Once the server is running, open:

**http://localhost:5000/api-docs**

Swagger UI lets you explore the documented endpoints, inspect request formats, and send API requests during development.

For protected endpoints, obtain an access token through the login endpoint and provide it using the Swagger authorization control.

## 🗃️ Database Schema

The Prisma schema defines the following principal models:

| Model          | Purpose                                                               |
| -------------- | --------------------------------------------------------------------- |
| `User`         | Stores user details, roles, contact information, and profile location |
| `Otp`          | Stores registration and password-reset OTP records with expiry times  |
| `RefreshToken` | Stores refresh tokens associated with users and their expiry          |
| `BloodRequest` | Stores requested blood group, units, urgency, location, and status    |
| `Inventory`    | Stores hospital inventory quantities by blood group                   |

The supported user roles are `DONOR` and `HOSPITAL`. Blood request statuses are `PENDING`, `FULFILLED`, and `CANCELLED`.

The inventory model is present in the database schema; this does not imply that public inventory-management endpoints are currently implemented.

## 🔒 Security

The backend includes the following security-related mechanisms:

* Password hashing with bcrypt.
* JWT-based authentication.
* Protected user-profile and blood-request operations.
* Email-verification and password-reset OTP expiry.
* Refresh-token persistence and rotation.
* Invalidation of existing refresh tokens when a password is reset.

**Production security recommendations:**

* Replace development fallback JWT secrets with strong environment-configured secrets.
* Configure real email delivery before using account verification in production.
* Add appropriate request validation, rate limiting, and stricter CORS settings.
* Never log or expose passwords, tokens, OTPs, or other sensitive information in production.

## 🧪 Testing and Verification

After starting the server, verify the health endpoint:

```bash
curl http://localhost:5000/health
```

Expected response:

```json
{
  "status": "OK"
}
```

Use Swagger UI to test authentication, profile, and blood-request endpoints.

The current `npm test` script is a placeholder and exits with an error because automated tests have not been configured in that script.

## 🔮 Future Enhancements

Potential future improvements include:

* Hospital blood inventory management APIs.
* Location-based donor discovery.
* Blood-request notifications.
* Automated donor-request matching.
* Expanded automated unit and integration testing.
* Production deployment and monitoring.

These are potential enhancements, not claims that all of them are currently implemented.

## 🤝 Contributing

Contributions and suggestions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Implement and test your changes.
4. Submit a pull request with a clear description.

## 📄 License

This project currently uses the ISC license declaration in `package.json`. Confirm the intended licensing terms before distributing the project.

## 👩‍💻 Maintainer

**Sanjeevani Backend**

GitHub repository: https://github.com/Rishithashetty-11/sanjeevani-backend
