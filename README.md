# Subscription Management App

A full-stack application for managing streaming service subscriptions with user authentication, interests tracking, and data analysis capabilities.

## Features

- 🔐 **User Authentication**: Secure login and registration with JWT tokens + Google OAuth
- 💳 **Subscription Management**: Track subscriptions for Netflix, HBO Max, Prime Video, Peacock, Disney+, and more
- 📊 **Spending Analytics**: View total monthly spending across all subscriptions
- 🎬 **Content Discovery**: Browse 20+ shows and movies with genre and platform filtering
- 📺 **Watchlist Management**: Track what you want to watch with intelligent platform recommendations
- 🎯 **Smart Recommendations**: Find the best and cheapest way to watch any show based on your subscriptions
- ⭐ **Interest Tracking**: Save favorite genres, shows, and movies
- 🗄️ **NoSQL Database**: MongoDB for flexible data storage
- 🤖 **ML Ready**: Data structure designed for future machine learning analysis

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** (NoSQL database)
- **Mongoose** (ODM)
- **JWT** for authentication
- **bcryptjs** for password hashing

### Frontend
- **React** 18
- **React Router** for navigation
- **Axios** for API calls
- **CSS3** with modern styling

## Project Structure

```
subscription/
├── backend/
│   ├── config/
│   │   ├── db.js              # Database connection
│   │   └── passport.js        # NEW: Google OAuth config
│   ├── controllers/
│   │   ├── authController.js  # Authentication logic
│   │   ├── subscriptionController.js
│   │   ├── interestController.js
│   │   ├── contentController.js    # NEW: Content management
│   │   └── watchlistController.js  # NEW: Watchlist management
│   ├── middleware/
│   │   └── auth.js            # JWT verification
│   ├── models/
│   │   ├── User.js            # User schema
│   │   ├── Subscription.js    # Subscription schema
│   │   ├── Interest.js        # Interest schema
│   │   ├── Content.js         # NEW: Shows/Movies schema
│   │   └── Watchlist.js       # NEW: Watchlist schema
│   ├── routes/
│   │   ├── auth.js
│   │   ├── subscriptions.js
│   │   └── interests.js
│   ├── .env.example
│   ├── package.json
│   └── server.js              # Entry point
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   └── Navbar.js
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Subscriptions.js
│   │   │   ├── Shows.js          # NEW: Content discovery
│   │   │   ├── Watchlist.js      # NEW: Watchlist management
│   │   │   └── Interests.js
    │   ├── App.js
    │   ├── App.css
    │   ├── index.js
    │   └── index.css
    └── package.json
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

### Installation

#### 1. Clone or navigate to the project directory

```bash
cd /Users/rahul/subscription
```

#### 2. Set up the Backend

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit `.env` and update the values:

```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/subscription_db
JWT_SECRET=your_super_secret_jwt_key_change_this
NODE_ENV=development
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
SESSION_SECRET=your_random_session_secret
FRONTEND_URL=http://localhost:3001
```

**Important**: 
- Change `JWT_SECRET` to a random secure string in production!
- Set up Google OAuth credentials (see NEW_FEATURES.md for detailed instructions)

#### 3. Set up the Frontend

```bash
cd ../frontend
npm install
```

#### 4. Start MongoDB

If using local MongoDB:

```bash
# macOS with Homebrew
brew services start mongodb-community

# Or start manually
mongod --dbpath /path/to/your/data/directory
```

If using MongoDB Atlas:
- Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- Get your connection string and update `MONGODB_URI` in `.env`

#### 5. Seed Sample Content (Optional but Recommended)

```bash
cd backend
npm run seed
```

This adds 20 popular shows and movies to test the content discovery features!

### Running the Application

#### Start the Backend (in one terminal)

```bash
cd backend
npm run dev
```

Backend will run on `http://localhost:5000`

#### Start the Frontend (in another terminal)

```bash
cd frontend
npm start
```

Frontend will run on `http://localhost:3001`

## 🎯 Quick Start Guide

1. **Register/Login**: Create an account or sign in with Google
2. **Add Subscriptions**: Go to Subscriptions page and add your streaming services (Netflix, HBO Max, etc.)
3. **Explore Content**: Visit the Shows page to browse movies and TV shows
4. **Build Watchlist**: Add shows you want to watch to your watchlist
5. **Get Recommendations**: Search for any show and see the best way to watch it based on your subscriptions
6. **Track Interests**: Save your favorite genres and content preferences

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `GET /api/auth/google` - Initiate Google OAuth (NEW)
- `GET /api/auth/google/callback` - Google OAuth callback (NEW)

### Subscriptions
- `GET /api/subscriptions` - Get all user subscriptions (protected)
- `GET /api/subscriptions/:id` - Get single subscription (protected)
- `POST /api/subscriptions` - Create subscription (protected)
- `PUT /api/subscriptions/:id` - Update subscription (protected)
- `DELETE /api/subscriptions/:id` - Delete subscription (protected)

### Interests
- `GET /api/interests` - Get user interests (protected)
- `POST /api/interests` - Create/update interests (protected)
- `POST /api/interests/shows` - Add favorite show (protected)
- `POST /api/interests/movies` - Add favorite movie (protected)
- `DELETE /api/interests` - Delete interests (protected)

### Content (NEW)
- `GET /api/content` - Get all content with filters
- `GET /api/content/by-genre?genre=Action` - Get content by genre with user's subscription info (protected)
- `GET /api/content/search/:title` - Search content and get viewing recommendations (protected)
- `POST /api/content` - Add new content (protected)

### Watchlist (NEW)
- `GET /api/watchlist` - Get user's watchlist (protected)
- `GET /api/watchlist?status=Currently Watching` - Filter watchlist by status (protected)
- `POST /api/watchlist` - Add to watchlist with recommendations (protected)
- `POST /api/watchlist/search-add` - Search and add with platform recommendations (protected)
- `PUT /api/watchlist/:id` - Update watchlist item status (protected)
- `DELETE /api/watchlist/:id` - Remove from watchlist (protected)

## Data Models

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  createdAt: Date
}
```

### Subscription
```javascript
{
  user: ObjectId (ref: User),
  serviceName: String (enum),
  monthlyPrice: Number,
  startDate: Date,
  renewalDate: Date,
  isActive: Boolean,
  billingCycle: String (monthly/quarterly/annually),
  notes: String,
  createdAt: Date
}
```

### Interest
```javascript
{
  user: ObjectId (ref: User),
  genres: [String],
  favoriteShows: [{ name, platform, addedAt }],
  favoriteMovies: [{ name, platform, addedAt }],
  preferredContentType: String,
  watchingTime: String,
  updatedAt: Date
}
```

### Content (NEW)
```javascript
{
  title: String,
  type: String (Movie/TV Show),
  genres: [String],
  platforms: [{ name, available }],
  description: String,
  releaseYear: Number,
  rating: Number,
  imageUrl: String,
  createdAt: Date
}
```

### Watchlist (NEW)
```javascript
{
  user: ObjectId (ref: User),
  content: ObjectId (ref: Content),
  customTitle: String,
  customType: String,
  status: String (Want to Watch/Currently Watching/Completed),
  priority: String (Low/Medium/High),
  notes: String,
  recommendedPlatforms: [{ 
    platform, 
    userHasSubscription, 
    cost 
  }],
  addedAt: Date,
  completedAt: Date
}
```

## Future ML Integration

The data structure is designed to support machine learning analysis:

### Potential ML Features
1. **Subscription Recommendations**: Analyze user interests and suggest new services
2. **Content Recommendations**: Suggest shows based on watchlist patterns and genres
3. **Cost Optimization**: Identify overlapping content across subscriptions
4. **Usage Patterns**: Predict optimal subscription plans based on viewing habits
5. **Content Discovery**: Recommend shows/movies based on genre preferences and completion rates
6. **Churn Prediction**: Identify subscriptions users might want to cancel
7. **Viewing Behavior Analysis**: Understand when and what users watch

### Data Collection for ML
The current schema already collects:
- User subscription history and spending patterns
- Content preferences (genres, shows, movies)
- Viewing time preferences
- Platform usage data
- Watchlist patterns (what users want to watch, what they complete)
- Genre preferences across different types of content
- Cross-platform content availability

To add ML capabilities later:
1. Create a new `backend/ml/` directory for ML models
2. Add data export endpoints for training data
3. Implement recommendation endpoints using collected watchlist and interest data
4. Add analytics dashboard to frontend
5. Use Content and Watchlist data to train recommendation models

## 📚 Additional Documentation

- **[NEW_FEATURES.md](./NEW_FEATURES.md)** - Detailed guide for content discovery, watchlist, and Google OAuth
- **[backend/README.md](./backend/README.md)** - Backend API documentation
- **[frontend/README.md](./frontend/README.md)** - Frontend component documentation

## Testing

### Test User Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Deployment

### Backend Deployment (Heroku/Railway/Render)
1. Set environment variables
2. Ensure MongoDB connection string is set
3. Update CORS settings if needed

### Frontend Deployment (Vercel/Netlify)
1. Build the app: `npm run build`
2. Deploy the `build` folder
3. Update API URLs from relative to absolute

## Security Notes

- JWT tokens expire after 30 days
- Passwords are hashed using bcrypt (10 rounds)
- Protected routes require valid JWT token
- CORS is enabled for development (configure for production)

## Contributing

This is a boilerplate project ready for expansion:
- Add unit tests
- Implement email verification
- Add password reset functionality
- Create admin dashboard
- Add data export features
- Implement ML recommendation system

## License

ISC

## Support

For issues or questions, please check the code comments or create an issue.
