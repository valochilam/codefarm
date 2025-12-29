# CODE_FARM Backend Server

A self-hostable Express.js backend for the CODE_FARM competitive programming platform.

## Prerequisites

- Node.js 18+ 
- PostgreSQL 14+

## Setup

1. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and JWT secret
   ```

3. **Initialize database:**
   ```bash
   npm run db:init
   ```

4. **Start the server:**
   ```bash
   # Development (with auto-reload)
   npm run dev
   
   # Production
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (authenticated)

### Users
- `GET /api/users/leaderboard` - Get global leaderboard
- `GET /api/users/profile/:username` - Get user profile
- `GET /api/users/my-rank` - Get current user's rank (authenticated)

### Problems
- `GET /api/problems` - List problems (paginated, filterable)
- `GET /api/problems/categories` - Get all categories
- `GET /api/problems/:slug` - Get problem details

### Submissions
- `POST /api/submissions` - Submit solution (authenticated)
- `GET /api/submissions/:id` - Get submission details (authenticated)
- `GET /api/submissions/problem/:problemId` - Get user's submissions for a problem (authenticated)
- `POST /api/submissions/:id/judge` - Simulate judge result (for testing)

## Database Schema

See `src/db/schema.sql` for the complete database schema including:
- Users with aura tracking
- Role-based access control
- Problems with categories
- Submissions with status tracking
- Leaderboard view

## Deployment

This server can be deployed to any Node.js hosting platform:
- Railway
- Render
- Fly.io
- DigitalOcean App Platform
- AWS EC2/ECS
- Your own VPS

Make sure to:
1. Set `NODE_ENV=production`
2. Use a strong `JWT_SECRET`
3. Configure PostgreSQL SSL if needed
4. Set up proper CORS for your frontend domain
