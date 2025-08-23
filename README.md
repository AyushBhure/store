<<<<<<< HEAD
# store
 web application that allows users to submit ratings for stores registered on the  platform. The ratings should range from 1 to 5.
=======
# Store Ratings Web Application

A full-stack web application that allows users to rate stores and manage store and user data based on role-based access control.

## Tech Stack

- **Backend**: ExpressJS
- **Database**: PostgreSQL
- **Frontend**: ReactJS

## Features

### User Roles

1. **System Administrator**
   - Add users and stores
   - View dashboards with total users, stores, and ratings
   - Filter and sort data

2. **Normal User**
   - Sign up and log in
   - View stores
   - Submit and modify ratings
   - Search stores by name or address

3. **Store Owner**
   - Log in and update password
   - View users who rated their store
   - See average rating

### Functional Highlights

- Role-based login system
- CRUD operations for stores and users (Admin)
- Submit and modify ratings (Users)
- Average rating dashboard for store owners
- Table sorting and filtering
- Form validations:
  - Name: 20–60 characters
  - Address: ≤400 characters
  - Password: 8–16 characters, 1 uppercase & 1 special character
  - Email: standard validation

## Project Structure

```
store-ratings-app/
├── backend/                 # ExpressJS server
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── routes/            # API routes
│   ├── database/          # Database setup and models
│   └── server.js          # Main server file
├── frontend/              # ReactJS client
│   ├── public/           # Static files
│   ├── src/              # React components
│   └── package.json      # Frontend dependencies
├── package.json          # Root package.json
└── README.md            # This file
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd store-ratings-app
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your database credentials
   ```

4. **Set up the database**
   ```bash
   npm run setup-db
   ```

5. **Start the development servers**
   ```bash
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Users (Admin only)
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Stores
- `GET /api/stores` - Get all stores
- `POST /api/stores` - Create new store (Admin only)
- `PUT /api/stores/:id` - Update store (Admin only)
- `DELETE /api/stores/:id` - Delete store (Admin only)

### Ratings
- `GET /api/ratings` - Get ratings (filtered by role)
- `POST /api/ratings` - Submit rating
- `PUT /api/ratings/:id` - Update rating
- `DELETE /api/ratings/:id` - Delete rating

## Demo Credentials

### Admin User
- Email: admin@example.com
- Password: Admin123!

### Store Owner
- Email: storeowner@example.com
- Password: Store123!

### Normal User
- Email: user@example.com
- Password: User123!

## Skills Demonstrated

- Full-stack implementation: ReactJS frontend + ExpressJS backend
- Database design & integration with PostgreSQL
- Role-based access control & validations
- Interactive frontend with state management
- Sorting, filtering, and CRUD operations
>>>>>>> 2ff04c76 (Initial commit)
