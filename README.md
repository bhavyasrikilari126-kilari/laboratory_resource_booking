# LabReserve — Laboratory Resource Booking System

A full-stack MERN web application for managing campus laboratory resources, preventing double bookings, and handling student, faculty, and administrator workflows.

## Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript, React.js, React Router DOM, Axios, Lucide Icons
- **Backend:** Node.js, Express.js, JWT Authentication, bcryptjs
- **Database:** MongoDB, Mongoose, MongoDB Compass

## Project Structure

```text
LRB/
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── bookingController.js
│   │   ├── resourceController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/
│   │   ├── Booking.js
│   │   ├── Resource.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── resourceRoutes.js
│   │   └── userRoutes.js
│   ├── seed/seedData.js
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── components/
        ├── context/
        ├── pages/
        ├── services/
        ├── styles/
        ├── utils/
        ├── App.jsx
        └── main.jsx
```

## Database Setup (MongoDB & MongoDB Compass)

1. Ensure MongoDB Server is running locally on port `27017`.
2. Open **MongoDB Compass** and connect to:
   ```
   mongodb://127.0.0.1:27017
   ```
3. The application uses database **`lab_resource_booking`** with three collections:
   - `users` (`name`, `email`, `password`, `role`, `department`)
   - `resources` (`resourceName`, `category`, `description`, `quantity`, `location`, `availability`)
   - `bookings` (`userId`, `resourceId`, `bookingDate`, `startTime`, `endTime`, `purpose`, `status`, `createdAt`)

## Installation & Running Locally

### 1. Install Backend Dependencies & Seed Sample Data

```bash
cd backend
npm install
npm run seed
```

> To reset and re-seed sample data at any time: `npm run seed -- --reset`

### 2. Start the Backend Server

```bash
cd backend
npm run dev
```

The backend API will run at `http://localhost:5000`.

### 3. Install Frontend Dependencies & Start React App

```bash
cd frontend
npm install
npm run dev
```

The frontend app will run at `http://localhost:5173`.

## Demo Credentials (After Running `npm run seed`)

| Role    | Email                 | Password    |
| ------- | --------------------- | ----------- |
| Admin   | `admin@labbook.edu`   | `password123` |
| Faculty | `faculty@labbook.edu` | `password123` |
| Student | `student@labbook.edu` | `password123` |

