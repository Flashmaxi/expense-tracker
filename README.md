# Personal Expense Tracker PWA 📱💰

A **single-user, self-hosted** Progressive Web App for expense tracking built with React, TypeScript, Tailwind CSS, Node.js, Express, and SQLite. Perfect for individuals who want complete control over their financial data with full offline capabilities.

## 🎯 Single-User Design

This application is designed for **individual use only**:
- **Secure password setup** - choose your password on first launch
- **Currency selection** - choose between USD, EUR, or RSD during setup
- **No multi-user complexity** - just you and your data
- **Complete privacy** - all data stays on your server
- **Self-hosted** - you own and control everything
- **PWA ready** - install as native app on any device

## ✨ Features

### 💰 **Financial Management**
- **Multi-Currency Support**: Choose between USD ($), EUR (€), and RSD (дин.) with real-time exchange rates
- **Bitcoin Integration**: All expenses automatically converted to satoshis based on historical Bitcoin prices (direct conversion from your currency)
- **Expense Management**: Add, edit, delete, and categorize expenses and income
- **Categories**: Pre-loaded with common categories, fully customizable
- **Dashboard**: Overview of financial summary with quick actions
- **Data Visualization**: Interactive charts showing spending patterns and trends (including Bitcoin values)

### 🔐 **Security & Privacy**
- **Password Protection**: Secure your data with password authentication
- **Local Data Storage**: All data stored locally in SQLite database
- **No External Dependencies**: Works completely offline once installed
- **Self-Hosted**: You own and control all your financial data

### 📱 **Progressive Web App (PWA)**
- **Installable**: Add to home screen on mobile, install as desktop app
- **Offline Capable**: Basic functionality works without internet connection
- **App-like Experience**: No browser UI when installed, custom splash screen
- **Auto-Updates**: Automatic updates with user notification
- **Background Sync**: Sync data when connection returns (if offline transactions added)

### 🎨 **User Experience**
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Mobile Navigation**: Touch-friendly interface with hamburger menu
- **Settings Page**: Manage currency preferences and profile information
- **Real-time Updates**: Live currency conversion and Bitcoin price integration

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

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/expense-tracker.git
   cd expense-tracker
   ```

2. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

3. **Start the application:**
   ```bash
   npm run dev
   ```

4. **Access your expense tracker:**
   - Open http://localhost:5173 in your browser
   - **That's it!** No signup, no login - just start tracking your expenses

### First Time Setup
- The app automatically creates a default user on first startup
- Pre-loaded with common expense and income categories
- All your data is stored locally in a SQLite database file

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

## 📱 Usage

1. **Start the app** - automatically logs you in (no registration needed)
2. **Add transactions** - record your income and expenses with Bitcoin conversion
3. **Choose your currency** - select between USD, EUR, or RSD in Settings
4. **Organize with categories** - use pre-loaded categories or create custom ones
5. **View dashboard** - see your financial overview in your preferred currency plus Bitcoin values
6. **Analyze with charts** - visualize spending patterns and trends
7. **Mobile friendly** - use on any device with responsive design

## Database

The application uses SQLite, which creates a `database.sqlite` file in the backend directory. No additional database setup is required.

### Default Categories

On first startup, the following categories are automatically created:

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
- `POST /api/auth/auto-login` - Auto-login for single-user mode
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/currency` - Update user's preferred currency
- `GET /api/auth/currencies` - Get supported currencies

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
- id, email, password, firstName, lastName, currency
- timestamps

### Categories Table
- id, name, type (income/expense), color, userId
- Foreign key to users table

### Transactions Table
- id, amount, description, type (income/expense)
- categoryId (foreign key), userId (foreign key)
- date, bitcoinPrice, satoshiAmount, timestamps

## 🌐 Self-Hosting / Deployment

This app is designed to be self-hosted. Here are some options:

### Option 1: Railway (Free)
1. Fork this repository
2. Connect to [Railway](https://railway.app)
3. Deploy directly from GitHub
4. Set environment variable: `JWT_SECRET=your-random-secret`

### Option 2: Docker
```bash
# Build and run with Docker
docker build -t expense-tracker .
docker run -p 3000:3000 -v $(pwd)/data:/app/data expense-tracker
```

### Option 3: VPS
1. Clone to your server
2. Install dependencies: `npm run install:all`
3. Build: `npm run build`
4. Start: `npm run start:prod`
5. Use nginx or similar for reverse proxy

### Environment Variables for Production
- `JWT_SECRET`: Long random string for token security
- `NODE_ENV`: Set to `production`
- `PORT`: Server port (default: 3000)

## 🔐 Privacy & Security

- **Your data stays yours** - everything is stored locally
- **No external accounts** - no third-party tracking
- **Open source** - audit the code yourself
- **Self-hosted** - you control the environment

## 📄 License

MIT License - Feel free to fork, modify, and use for personal or commercial purposes.

## 🤝 Contributing

Contributions welcome! This is designed as a personal finance tool, so focus on:
- Privacy features
- Bitcoin/crypto integrations
- Self-hosting improvements
- Mobile experience
- Data export/import features

## ⭐ Star this repo if you found it useful!