# MERN Expense Tracker

A full-stack expense management application built with MongoDB, Express, React, and Node.js.

## Features

- **User Authentication**: Secure login and registration using JWT.
- **Dashboard**: Visual overview of expenses with charts and statistics.
- **Expense Management**: Add, edit, delete, and filter expenses.
- **Categories**: Organize expenses by categories with icons and colors.
- **Responsive Design**: Modern glassmorphism UI that works on all devices.

## Tech Stack

- **Frontend**: React, React Router, Chart.js, Tailwind-like CSS variables.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB.
- **Authentication**: JWT & BCrypt.

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB (Local or AtlasURI)

### Installation

1. **Clone the repository** (if applicable)

2. **Backend Setup**

   ```bash
   cd backend
   npm install
   ```

   Create a `.env` file in the `backend` folder:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   ```

3. **Frontend Setup**

   ```bash
   cd frontend
   npm install
   ```

### Running the App

1. **Start Backend Server**
   ```bash
   cd backend
   npm start
   ```
   Server runs on http://localhost:5000

2. **Start Frontend Server**
   ```bash
   cd frontend
   npm start
   ```
   App runs on http://localhost:3000

## API Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/expenses` - Get user expenses
- `POST /api/expenses` - Add new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/categories` - Get categories

## License

MIT
