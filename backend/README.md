# Backend README

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your values:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/subscription_db
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

4. Start the server:
```bash
# Development with auto-reload
npm run dev

# Production
npm start
```

## Environment Variables

- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT signing (CHANGE IN PRODUCTION!)
- `NODE_ENV`: Environment (development/production)

## API Testing

### Register a new user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get subscriptions (replace YOUR_TOKEN)
```bash
curl http://localhost:5000/api/subscriptions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create subscription
```bash
curl -X POST http://localhost:5000/api/subscriptions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceName": "Netflix",
    "monthlyPrice": 15.99,
    "startDate": "2024-01-01",
    "renewalDate": "2024-02-01",
    "billingCycle": "monthly"
  }'
```

## Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication
- **dotenv**: Environment variables
- **cors**: Cross-origin resource sharing
- **express-validator**: Input validation
- **nodemon**: Development auto-reload

## Available Scripts

- `npm start`: Start production server
- `npm run dev`: Start development server with nodemon
