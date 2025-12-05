# Frontend README

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

## Available Scripts

- `npm start`: Start development server
- `npm run build`: Build for production
- `npm test`: Run tests
- `npm run eject`: Eject from Create React App (one-way operation)

## Environment Variables

The frontend uses a proxy to connect to the backend during development. This is configured in `package.json`:

```json
"proxy": "http://localhost:5000"
```

For production, you'll need to update API calls to use absolute URLs.

## Pages

### Login (`/login`)
- User authentication
- Redirects to subscriptions after successful login

### Register (`/register`)
- New user registration
- Automatic login after registration

### Subscriptions (`/subscriptions`)
- View all subscriptions
- Add new subscriptions
- Delete subscriptions
- See total monthly spending

### Interests (`/interests`)
- Select favorite genres
- Add favorite shows and movies
- Set content preferences
- Set watching time preferences

## Components

### Navbar
- Navigation links
- User display
- Logout functionality

## State Management

Currently using React's built-in `useState` and `useEffect` hooks.

For larger applications, consider adding:
- Redux or Context API for global state
- React Query for server state management

## Styling

Uses vanilla CSS with modern features:
- CSS Grid for layouts
- Flexbox for alignment
- CSS variables could be added for theming
- Gradient backgrounds
- Smooth transitions

## API Integration

All API calls are made using Axios with JWT token authentication:

```javascript
const token = localStorage.getItem('token');
axios.get('/api/endpoint', {
  headers: { Authorization: `Bearer ${token}` }
});
```

## Future Enhancements

- Add loading spinners
- Implement error boundaries
- Add form validation
- Create reusable UI components
- Add data visualization charts
- Implement dark mode
- Add pagination for large lists
