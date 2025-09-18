# Expense Tracker Application

A full-stack expense tracking application built with React, TypeScript, Tailwind CSS, Node.js, Express, and SQLite.

## Features

- **User Authentication**: Register, login, and password reset functionality
- **Expense Management**: Add, edit, delete, and categorize expenses and income
- **Categories**: Create and manage custom income and expense categories
- **Dashboard**: Overview of financial summary with quick actions
- **Data Visualization**: Interactive charts showing spending patterns and trends
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- React Router for navigation
- Chart.js with React Chart.js 2 for data visualization
- Axios for API communication

### Backend
- Node.js with Express
- TypeScript
- SQLite database (file-based, no server required)
- JWT authentication
- bcryptjs for password hashing
- CORS enabled

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone or extract the project**

2. **Set up the backend:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env file if needed
   npm run dev
   ```

3. **Set up the frontend (in a new terminal):**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env file if needed
   npm run dev
   ```

4. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

### Default Environment Variables

**Backend (.env):**
```
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env):**
```
VITE_API_URL=http://localhost:5000/api
```

## Usage

1. **Register a new account** or **login** with existing credentials
2. **Add categories** for your income and expenses
3. **Record transactions** by adding income and expenses
4. **View your dashboard** for a financial overview
5. **Analyze your data** using the charts page

## Database

The application uses SQLite, which creates a `database.sqlite` file in the backend directory. No additional database setup is required.

### Default Categories

When you register, the following categories are automatically created:

**Expense Categories:**
- Food & Dining
- Transportation
- Shopping
- Entertainment
- Bills & Utilities
- Healthcare

**Income Categories:**
- Salary
- Freelance
- Investment
- Other Income

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/request-reset` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/profile` - Get user profile

### Transactions
- `GET /api/transactions` - Get user transactions
- `POST /api/transactions` - Create new transaction
- `GET /api/transactions/:id` - Get specific transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/summary` - Get financial summary
- `GET /api/transactions/category-summary` - Get category breakdown
- `GET /api/transactions/monthly-trends` - Get monthly trends

### Categories
- `GET /api/categories` - Get user categories
- `POST /api/categories` - Create new category
- `GET /api/categories/:id` - Get specific category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

## Development

### Backend Development
```bash
cd backend
npm run dev  # Starts with nodemon for auto-reload
```

### Frontend Development
```bash
cd frontend
npm run dev  # Starts Vite dev server
```

### Building for Production

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
# Serve the dist folder with your preferred web server
```

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- CORS protection
- Input validation
- SQL injection prevention through parameterized queries

## Database Schema

### Users Table
- id, email, password, firstName, lastName
- resetToken, resetTokenExpiry for password reset
- timestamps

### Categories Table
- id, name, type (income/expense), color, userId
- Foreign key to users table

### Transactions Table
- id, amount, description, type (income/expense)
- categoryId (foreign key), userId (foreign key)
- date, timestamps

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational purposes and practice. Feel free to use and modify as needed.